
require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 101
const {logger} = require('./middleware/logger.js')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const corsOption = require('./config/corsOptions')
const cors = require('cors')
const connectDB = require ('./config/dbConn')
const mongoose =require ('mongoose')
const { logEvents} = require('./middleware/logger')

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)

app.use(cors(corsOption))

app.use(express.json())

app.use(cookieParser())

//Where to find css and images on the server Middleware express.static
app.use('/', express.static(path.join(__dirname, 'public'))) 

app.use('/', require('./routes/root'))

app.all('*', (req, res) => {
    res.status(404)
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, "views", '404.html'))
    } else if (req.accepts('json')) {
        res.json({message: '404 Not Found'})
    } else {
        res.type=('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

