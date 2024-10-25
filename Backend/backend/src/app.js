const express  = require("express")
const path = require("path")
const app = express()
const http = require("http")
const {Server} = require("socket.io")
const server = http.createServer(app)
const cors = require("cors")
const {createClient} = require("redis")

require("dotenv").config({path:path.resolve(__dirname , "../.env")})
console.log("redis connection is :" + process.env.REDIS_URL)
const PORT = process.env.PORT
// const Redis_Url = process.env.Redis_Url



const redisConnect = createClient({
    url:process.env.REDIS_URL
});

console.log("first")

redisConnect.on("error", (err) => console.error("Redis connection error:", err));

console.log("second")

redisConnect.connect()
.then(() => {
    console.log("Successfully connected to Redis");

    redisConnect.rPush("usermessage", "Test message after connect")
    .then(() => {
        console.log("Test message added");
    });
})
.catch((err) => {
    console.error("Error connecting to Redis:", err);
});


console.log("Third")

app.use(cors())
app.use(express.json())
const io = new Server(server , {
    cors:{
        origin :  "http://localhost:5173",
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'] 
    }
})

// Function used to store the data to the redis in a list

async function addDataTORedis (message){
    console.log("Entered to the chat saving section")
    try{
        await redisConnect.rPush("usermessage" , message)
        console.log("data successfully added")
    }
    catch{
        console.log("something went wrong while adding data to database")
    }
    console.log("resigned from the database")
   
}

// Function used to get all the data from the redis database

const getDatafromRedis = async()=>{
    let getData = await redisConnect.lRange("usermessage" , 0 , -1)
    return getData
}

const messages = ["unable to get the data"];

// so here we are going to create a server

io.on("connection" , async(socket) =>{
    // so a new user is connected to the server so we are going to send him all the previous messages
    console.log("A new user connected")

    try{
        const allMessages = await getDatafromRedis()
        console.log(allMessages)
        socket.emit("displayAllMessage" , allMessages)
        console.log(allMessages)
    }

    catch{
        console.log("something went wrong while fetchig data from the backend")
        socket.emit("displayAllMessage" , messages)
    }
    

    socket.on("newMessageAppeared" , async takeMessage=>{
        try{
            console.log("The message that arrived is" + takeMessage)
            await addDataTORedis(takeMessage)
            io.emit("broadcastMessage" , takeMessage)
        }
        catch{
            messages.push("some unintrupted data is stored")
        }
    })
})


app.get("/" , (req,res)=>{
    res.json({
        msg : "wow!!  you created a new server"
    })
})

app.get("/messages", async (req, res) => {
    try {
        const messages = await getDatafromRedis();  
        res.json(messages);  
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});


server.listen(PORT , ()=>{
    console.log(`server is running on the port Number ${PORT}`);
})