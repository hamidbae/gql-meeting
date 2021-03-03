const mongoose = require('mongoose')
const Schema = mongoose.Schema

const roomSchema = new Schema({
        topic: {
            type: String,
            required: true
        },
        roomName: {
            type: String,
            required: true
        },
        capacity: {
            type: Number,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        usersCheckIn: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {
        timestamps: true
    }
)

const room = mongoose.model('Room', roomSchema)
module.exports = room