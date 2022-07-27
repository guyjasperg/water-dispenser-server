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

//get all
router.get('/filtered', BasicAuth, async (req, res) => {
    try {
        const transactions = await Transactions.find()
                                                .populate({ path: 'rfidcard', select: 'cardID -_id'})
                                                .select('-_id cardID transDate transType amount')
                                                .sort({ transDate: -1})
                                                .limit(req.body.limit !== null ? req.body.limit : 10).exec()
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
    session.startTransaction()
    try {
        const query = { cardID: req.body.cardID }
        const update = { $inc: { balance: req.body.amount}, $set: { dateUpdated: new Date()} }

        let rfidcard = await RfidCards.findOneAndUpdate(query, update, { new: true, session: session })
        if(rfidcard != null)
        {
            console.log(rfidcard)
            //create transaction
            let trans = new Transactions({
                transType: req.body.transType,
                amount: req.body.amount,
                rfidcard: rfidcard
            })
            await trans.save({session: session})
            console.log('commit transaction.')
            await session.commitTransaction()
            session.endSession();
            res.status(httpStatus.StatusCodes.CREATED).json({ message: 'Transaction saved'})
        }
        else{
            await session.abortTransaction() 
            session.endSession();
            res.status(httpStatus.StatusCodes.NOT_FOUND).json({ message: 'ID Not Found'})   
        }
    } catch (err) {
        console.error(err)
        await session.abortTransaction()
        await session.endSession();
        res.status(httpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message})
    }
    finally{
        console.log('finally block')
        if(session.inTransaction == true)
        {
            console.log('Commiting transaction.')
            await session.commitTransaction()
            session.endSession()
        }
        else
        {
            console.log('Transaction was aborted.')
        }
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