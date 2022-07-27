const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    transDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    transType: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    amountDispensed: {
        type: Number,
        default: 0
    },
    rfidcard: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'rfidCards'
    }
})

module.exports = mongoose.model('Transactions', transactionSchema)