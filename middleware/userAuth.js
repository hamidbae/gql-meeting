const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization')
    if(!authHeader) {
        req.userAuth = false
        return next()
    }
    const token = authHeader.split(' ')[1]
    let decodedToken
    try{
        decodedToken = jwt.verify(token, process.env.USER_SECRET_KEY)
    } catch (err) {
        req.userAuth = false
        return next()
    }
    if(!decodedToken) {
        req.userAuth = false
        return next()
    }
    req.userId = decodedToken.userId
    req.userAuth = true
    next()
}