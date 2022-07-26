const express = require('express')
const moment = require('moment')
const router = express.Router()
const RfidCards = require('../models/rfid')
const Transactions = require('../models/transactions')
const httpStatus = require('http-status-codes')
const { compareSync } = require('bcrypt')

//get all
router.get('/', BasicAuth, async (req, res) => {
    try {
        const transactions = await Transactions.find().populate({ path: 'rfidcard', select: 'cardID'}).exec()
        transactions.forEach(trans => {
            console.log(trans.rfidcard.cardID)
            console.log('Amount: ' + trans.amount)
            console.log('Type: ' + trans.transType)
        })
        res.json(transactions)
    }
    catch(error) {
        res.status(500).json({ message: error.message })
    }
})

//get all by cardID
router.get('/:id', BasicAuth, async (req, res) => {
    try {
    }
    catch(error) {
        res.status(500).json({ message: error.message })
    }
})

//Create one
router.post('/', async (req, res) => {
    console.log(req.body)

    const session = await RfidCards.startSession()
    try {
        session.startTransaction()

        const query = { cardID: req.body.cardID }
        //const update = { { $inc: { balance: req.body.amount } } , { $set: { dateUpdated: Date.now }} }
        const update = { $inc: { balance: req.body.amount}, $set: { dateUpdated: new Date()} }

        let rfidcard = await RfidCards.findOneAndUpdate(query, update, { new: true })
        if(rfidcard != null)
        {
            console.log(rfidcard)

            //const session = await RfidCards.startSession()
            //session.startTransaction()

            //rfidcard.balance += req.body.amount

            //const newCard = await rfidcard.save()
            //console.log(newCard)

            //create transaction
            let trans = new Transactions({
                transType: req.body.transType,
                amount: req.body.amount,
                rfidcard: rfidcard
            })
            await trans.save()

            await session.commitTransaction()
            session.endSession()
            res.status(httpStatus.StatusCodes.CREATED).json({ message: 'Transaction saved'})
        }
        else{
            res.status(httpStatus.StatusCodes.NOT_FOUND).json({ message: 'ID Not Found'})    
        }
    } catch (err) {
        res.status(httpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message})
    }
})

function BasicAuth(req, res, next) {
    // check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }

    // verify auth credentials
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    console.log(`username: ${username}, password: ${password}`)
    if(username === "guy" && password === "12345")
    {
        next()
    }
    else
    {
        return res.status(401).json({ message: 'Access Denied' });
    }
}

module.exports = router