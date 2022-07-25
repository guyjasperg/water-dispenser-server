const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    transactionType: {
        type: String,
        required: true
    },
    transDate: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    rfidCard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rfidCards'
    }
})

module.exports = mongoose.model('Transaction', transactionSchema)