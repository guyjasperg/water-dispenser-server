const mongoose = require('mongoose')

const rfidSchema = new mongoose.Schema({
    cardID: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    dateUpdated: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('rfidCards', rfidSchema)