const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    cloudinary_id: {
        type: String,
        required: true
    },
    meetingLists: [{
        type: Schema.Types.ObjectId,
        ref: 'Room'
    }]
})

const user = mongoose.model('User', userSchema)

module.exports = user