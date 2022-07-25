const express = require('express')
const router = express.Router()
const RfidCards = require('../models/rfid')
const httpStatus = require('http-status-codes')

//get all
router.get('/', BasicAuth, async (req, res) => {
    try {
        const rfids = await RfidCards.find()
        res.json(rfids)
    }
    catch(error) {
        res.status(500).json({ message: error.message })
    }
})

//get one
// router.get('/:id', GetRfidCardByCardID, async (req, res) => {
//     res.json(res.rfidcard)
// })
router.get('/:id', BasicAuth, async (req, res) => {
    let rfidcard
    try {
        rfidcard = await RfidCards.findOne( { cardID: req.params.id })
        if(rfidcard == null){
            console.log("CardID not found");
            console.log('CardID length: ' + req.params.id.length)

            //make sure CardID is valid length
            if(req.params.id.length === 8){
                //RfidCard not found, save to DB
                rfidcard = new RfidCards({
                    cardID: req.params.id,
                    balance: 0
                })
                try {
                    const newRfidCard = await rfidcard.save()
                    res.status(201).json(newRfidCard)
                } catch (err) {
                    res.status(201).json({ message: err.message })
                }
            }
            else {
                res.status(httpStatus.StatusCodes.BAD_REQUEST).json({message: 'Invalid Card'})
            }
        }
        else{
            res.status(httpStatus.StatusCodes.OK).json(rfidcard)
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

//Create one
router.post('/', async (req, res) => {
    const rfidcard = new RfidCards({
        cardID: req.body.cardID,
        balance: req.body.balance
    })

    try {
        const newRfid = await rfidcard.save()
        res.status(201).json(newRfid)
    }catch(err){
        res.status(400).json({ message: err.message })    
    }
})

//update
router.patch('/:id', GetRfidCardByCardID, async (req, res) => {
    //validate input
    if(req.body.balance != null)
    {
        res.rfidcard.balance = req.body.balance
    }

    res.rfidcard.dateUpdated = new Date

    try {
        const newCard = await res.rfidcard.save()
        res.json(newCard)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//delete
router.delete('/:id', GetRfidCardByCardID, async (req, res) => {
    try {
        await res.rfidcard.remove()
        res.json({ message: 'Rfid Card deleted'})
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

//middleware
async function GetRfidCard(req, res, next) {
    let rfidcard
    try {
        rfidcard = await RfidCards.findById(req.params.id) 
        if(rfidcard == null){
            return res.status(404).json({ message: 'CardID not found' })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
    res.rfidcard = rfidcard
    next()
}

async function GetRfidCardByCardID(req, res, next) {
    let rfidcard
    try {
        rfidcard = await RfidCards.findOne( { cardID: req.params.id })
        if(rfidcard == null){
            return res.status(404).json({ message: 'CardID not found' })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
    res.rfidcard = rfidcard
    next()
}

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