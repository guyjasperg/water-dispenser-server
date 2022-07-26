//DATABASE_URL=mongodb+srv://user:user@cluster0.wwxfpqj.mongodb.net/?retryWrites=true&w=majority

require('dotenv').config()

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection

db.on('open', () => {
    console.log('Connected to database')

    //console.log(mongoose.connection.db)
    //list collections
    // const admin = mongoose.mongo.Admin
    // new admin(mongoose.connection.db).listDatabases((err, result) => {
    //     console.log(result.databases)
    // })
    
    // mongoose.connection.db.listCollections().toArray(function (err, collections) {
    //     console.log('Collections: ' + collections.length)
    //     collections.forEach((collection) => {
    //         //console.log(`DB: ${collection.}` collection.name)
    //         console.log(collection)
    //     })
    // })   
})
db.on('error', (error) => console.error(`DB Error:  ${error}`))

app.use(express.json())

const rfidCardRoutes = require('./routes/rfids')
const transactionRoutes = require('./routes/transactions')
 
app.use('/rfids', rfidCardRoutes)
app.use('/trans', transactionRoutes)
app.listen(process.env.PORT || 5000, () => console.log('Server started'))