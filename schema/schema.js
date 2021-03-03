const graphql = require('graphql')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const cron = require('node-cron')

const sendMail = require('../utils/mail')
const Room = require('../models/room')
const User = require('../models/user')
const Admin = require('../models/admin')

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLSchema
} = graphql

const RoomType = new GraphQLObjectType({
    name: 'Room',   
    fields: () => ({
        id: { type: GraphQLID },
        topic: { type: GraphQLString },
        roomName: { type: GraphQLString },
        capacity: { type: GraphQLInt },
        time: { type: GraphQLString },
        participants: { 
            type: new GraphQLList(UserType),
            resolve(parent, args){
                return parent.participants.map(userId => {
                    // return _.find(users, { id: userId })
                    return User.findById(userId)
                })
            }
        },
        usersCheckIn: { 
            type: new GraphQLList(UserType),
            resolve(parent, args){
                return parent.participants.map(userId => {
                    // return _.find(users, { id: userId })
                    return User.findById(userId)
                })
            }
        }
    })
})

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        imageUrl: { type: GraphQLString },
        cloudinary_id: { type: GraphQLString },
        meetingLists: {
            type: new GraphQLList(RoomType),
            resolve(parent, args){
                return parent.meetingLists.map( roomId => {
                    // return _.find(rooms, { id: roomId })
                    return Room.findById(roomId)
                })
            }
        }
    })
})

const AdminType = new GraphQLObjectType({
    name: "Admin",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
    })
})

const UserAuthDataType = new GraphQLObjectType({
    name: 'UserAuth',
    fields: () => ({
        userId: { type: GraphQLString },
        token: { type: GraphQLString }
    })
})

const AdminAuthDataType = new GraphQLObjectType({
    name: 'AdminAuth',
    fields: () => ({
        adminId: { type: GraphQLString },
        token: { type: GraphQLString }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        room: {
            type: RoomType,
            args: { id: { type: GraphQLID }},
            resolve(parent, args){
                // return _.find(rooms, { id: args.id })
                Room.findById(args.id)
            }
        },
        rooms: {
            type: new GraphQLList(RoomType),
            resolve(parent, args){
                return Room.find({})
            }
        },
        user: {
            type: UserType,
            args: { id: { type: GraphQLID }},
            resolve(parent, args){
                // return _.find(users, { id: args.id })
                return User.findById(args.id)
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args){
                return User.find()
            }
        },
        admin: {
            type: AdminType,
            args: { id: { type: GraphQLID }},
            resolve(parent, args){
                // return _.find(users, { id: args.id })
                return Admin.findById(args.id)
            }
        },
        admins: {
            type: new GraphQLList(AdminType),
            resolve(parent, args){
                return Admin.find()
            }
        },
        userLogin: {
            type: UserAuthDataType,
            args: { 
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, args){
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
                    process.env.USER_SECRET_KEY,
                    { expiresIn: '1h' }
                )
                return { token: token, userId: user._id.toString()}
            }
        },
        adminLogin: {
            type: AdminAuthDataType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, args){
                const admin = await Admin.findOne({ email: args.email })
                if(!admin){
                    const error = new Error('Admin not found.')
                    error.code = 401
                    throw error
                }
                const pwCheck = await bcrypt.compare(args.password, admin.password)
                if(!pwCheck){
                    const error = new Error('Password is incorrect')
                    error.code = 401
                    throw error;
                }
                const token = jwt.sign(
                    { adminId: admin._id.toString(), email: admin.email },
                    process.env.ADMIN_SECRET_KEY,
                    { expiresIn: '1h' }
                )
                return { token: token, adminId: admin._id.toString()}
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createRoom: {
            type: RoomType,
            args: {
                topic: { type: GraphQLString },
                roomName: { type: GraphQLString },
                capacity: { type: GraphQLInt },
                time: { type: GraphQLString },
            },
            resolve(parent, args, req){
                if(!req.adminAuth){
                    const error = new Error('Not authenticated!')
                    error.code = 401
                    throw error
                }
                
                // args.time format year/month/day/hour/minutes
                let timeSplit = args.time.split(/[-/ ,:]/)
                timeSplit[1]--
                const meetingTime = new Date(...timeSplit)
                let room = new Room({
                    topic: args.topic,
                    roomName: args.roomName,
                    capacity: args.capacity,
                    time: meetingTime
                })
                return room.save()
            }
        },
        updateRoom: {
            type: RoomType,
            args: {
                roomId: { type: GraphQLID },
                topic: { type: GraphQLString },
                roomName: { type: GraphQLString },
                capacity: { type: GraphQLInt },
                time: { type: GraphQLString },
            },
            async resolve(parent, args, req){
                if(!req.adminAuth){
                    const error = new Error('Not authenticated!')
                    error.code = 401
                    throw error
                }
                let room = await Room.findById(args.roomId)
                if(!room){
                    const error = new Error('Room not found')
                    error.code = 404
                    throw error
                }
                args.topic ? room.topic = args.topic: ''
                args.roomName ? room.roomName = args.roomName: ''
                args.capacity ? room.capacity = args.capacity: ''
                if(args.time){
                    const timeSplit = args.time.split(/[-/ ,:]/)
                    const time = new Date(...timeSplit)
                    room.time = time
                }

                return room.save()
            }
        },
        addParticipant: {
            type: RoomType,
            args: {
                roomId: { type: GraphQLID },
            },
            async resolve(parent, args, req){
                if(!req.userAuth){
                    const error = new Error('Not authenticated!')
                    error.code = 401
                    throw error
                }
                let room = await Room.findById(args.roomId)
                if(!room){
                    const error = new Error('Room not found')
                    error.code = 404
                    throw error
                }
                if (room.participants.length >= room.capacity) {
                    const error = new Error('Room already full')
                    error.statusCode = 404
                    throw error
                }
                if(room.participants.includes(req.userId)){
                    const error = new Error('You are already in')
                    error.code = 301
                    throw error    
                }
                let user = await User.findById(req.userId)
                if(!user){
                    const error = new Error('User not found')
                    error.code = 404
                    throw error
                }

                room.participants.push(req.userId)
                user.meetingLists.push(args.roomId)

                await user.save()
                await room.save()

                // send email immediatelly after booking the room
                let subject = 'Sukses Booking'
                let text = `terimakasih telah memesan meeting dengan topik ${room.topic}`

                sendMail(user.email, subject, text, function(err, data) {
                    if (err) {
                        const error = new Error('Email not sent')
                        error.statusCode = 404
                        throw error
                    }
                })

                // scheduling email to be sent
                const cornDate = new Date(room.time)

                const month = cornDate.getMonth() + 1
                const date = cornDate.getDate()

                const task = cron.schedule(`45 8 ${date} ${month} *`, () => {
                    subject = 'Meeting Reminder'
                    text = `a meeting with topic ${room.topic} will be held this day`

                    sendMail(user.email, subject, text, function(err, data) {
                        if (err) {
                            const error = new Error('Email not sent')
                            error.statusCode = 404
                            throw error
                        }
                    })
                    task.destroy()
                })

                return room
            }
        },
        addUserCheckIn: {
            type: RoomType,
            args: {
                roomId: { type: GraphQLString },
                userId: { type: GraphQLString }
            },
            async resolve(parent, args, req){
                if(!req.adminAuth){
                    const error = new Error('Not authenticated!')
                    error.code = 401
                    throw error
                }
                let room = await Room.findById(args.roomId)
                if(!room){
                    const error = new Error('Room not found')
                    error.code = 404
                    throw error
                }
                if(!room.participants.includes(args.userId)){
                    const error = new Error('This person are not registered to this room')
                    error.code = 301
                    throw error    
                }
                if(!room.usersCheckIn.includes(args.userId)){
                    const error = new Error('This person checked in')
                    error.code = 301
                    throw error    
                }
                let user = await User.findById(args.userId)
                if(!user){
                    const error = new Error('User not found')
                    error.code = 404
                    throw error
                }

                room.participants.push(args.userId)

                // send email after check in
                let subject = 'User Checkin Meeting'
                let text = `Terimakasih telah datang di meeting dengan topik ${room.topic}`

                sendMail(user.email, subject, text, function(err, data) {
                    if (err) {
                        const error = new Error('Email not sent')
                        error.statusCode = 404
                        throw error
                    }
                })

                return room.save()
            }
        },
        createUser: {
            type: UserType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString },
                imageUrl: { type: GraphQLString },
                cloudinary_id: { type: GraphQLString }
            },
            async resolve(parent, args) {
                if(!validator.isEmail(args.email)){
                    const error = new Error('Email not valid')
                    error.code = 301
                    throw error  
                }
                if(args.password.length < 6){
                    const error = new Error('Min password length 6')
                    error.code = 301
                    throw error
                }
                const hashedPw = await bcrypt.hash(args.password, 12)
                
                let user = new User({
                    email: args.email,
                    password: hashedPw,
                    imageUrl: args.imageUrl,
                    cloudinary_id: args.cloudinary_id
                })

                return user.save()
            }
        },
        createAdmin: {
            type: AdminType,
            args: {
                name: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString },
            },
            async resolve(parent, args){
                if(!validator.isEmail(args.email)){
                    const error = new Error('Email not valid')
                    error.code = 301
                    throw error
                }
                if(args.password.length < 6){
                    const error = new Error('Min password length 6')
                    error.code = 301
                    throw error
                }
                const hashedPw = await bcrypt.hash(args.password, 12)
                let admin = new Admin({
                    name: args.name,
                    email: args.email,
                    password: hashedPw,
                })
                return admin.save()
            }
        },
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})