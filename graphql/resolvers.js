const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Room = require('../models/room')
const User = require('../models/user')
const Admin = require('../models/admin')

module.exports.resolveAddParticipant = async (parent, args) => {
    const user = await User.findOne({ email: args.email })
    if(!user){
        const error = new Error('User not found.')
        error.code = 401
        throw error
    }
    const pwCheck = await bcrypt.compare(args.password, user.password)
    if(!pwCheck){
        const error = new Error('Password is incorrect')
        error.code = 401
        throw error;
    }
    const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        'user secret word',
        { expiresIn: '1h' }
    )
    return { token: token, userId: user._id.toString()}
}