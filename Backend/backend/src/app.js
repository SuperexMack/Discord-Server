const express  = require("express")
const path = require("path")
const app = express()
const http = require("http")
const {Server} = require("socket.io")
const server = http.createServer(app)
const cors = require("cors")

require("dotenv").config({path:path.resolve(__dirname , "../.env")})
const PORT = process.env.PORT
app.use(cors())
app.use(express.json())
const io = new Server(server , {
    cors:{
        origin :  "http://localhost:5173",
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'] 
    }
})



const messages = [];

// so here we are going to create a server

io.on("connection" , (socket) =>{
    // so a new user is connected to the server so we are going to send him all the previous messages
    console.log("A new user connected")
    socket.emit("displayAllMessage" , messages)

    socket.on("newMessageAppeared" , (takeMessage)=>{
        messages.push(takeMessage)
        io.emit("broadcastMessage" , takeMessage)
    })
})


app.get("/" , (req,res)=>{
    res.json({
        msg : "wow!!  you created a new server"
    })
})

server.listen(PORT , ()=>{
    console.log(`server is running on the port Number ${PORT}`);
})