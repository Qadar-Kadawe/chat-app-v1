const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words")
const { generateMessages, generateLocationMessage } = require('./utils/massages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// let count = 0
//server (emit) -> client (recieve) -> countUpdated
//client (emir) -> server (recieve) -> increment

io.on('connection', (socket) => {
    console.log("New Websocket Connection");

    // Join Group Room
    socket.on('join', (options, callback) => {
        const user = addUser({ id: socket.id, ...options })
        const error = user.error
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
            //join user chatroom
        socket.emit("message", generateMessages('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessages('Admin', `${user.username} has joined!`))
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
            // socket.emit  , io.emit  , socket.broadcast.emit
            // io.to().emit, socket.broadcast.to().emit
    })


    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            callback("Profanity is not allowed!")
        }
        io.to(user.room).emit('message', generateMessages(user.username, message))
        callback()
    })

    // Geolocation latitude and longitude
    socket.on('send-location', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    // left user chatroom
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessages('Admin', `${user.username} has left!`))
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })



    // socket.emit("countUpdated", count)

    // socket.on('increment', () => {
    //     count++
    //     // socket.emit('countUpdated', count)
    //     io.emit('countUpdated', count)
    // })

})
server.listen(port, () => {
    console.log(`server is up on port ${port}!`);
})