const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authHeader = req.get('AdminAuth')
    if(!authHeader) {
        req.isAuth = false
        return next()
    }
    const token = authHeader.split(' ')[1]
    let decodedToken
    try{
        decodedToken = jwt.verify(token, process.env.ADMIN_SECRET_KEY)
    } catch (err) {
        req.adminAuth = false
        return next()
    }
    if(!decodedToken) {
        req.adminAuth = false
        return next()
    }
    req.adminId = decodedToken.adminId
    req.adminAuth = true
    next()
}