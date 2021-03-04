const express = require('express')
const mongoose = require('mongoose')
require('dotenv/config');
const userAuth = require('./middleware/userAuth')
const adminAuth = require('./middleware/adminAuth')
const { graphqlHTTP } = require('express-graphql')
const schema = require('./schema/schema')

const imageRouter = require('./route/user-image')

const app = express()

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use(userAuth)
app.use(adminAuth)

app.use('/user-image', imageRouter)

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}))

mongoose.connect(process.env.DB_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true})
    .then((result) => {
        app.listen(process.env.PORT || 4002)
    })

