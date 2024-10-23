import './App.css'
import {useEffect, useState} from "react"
import io from "socket.io-client"

function App() {

  const [newMessage , setNewMessage] = useState("")
  const [oldMessages , setOldMessages] = useState([])

  useEffect(()=>{
    let socket = io("http://localhost:9000")
    socket.on("displayAllMessage" , myNewMessage =>{
      setOldMessages(myNewMessage)
    })
    socket.on("broadcastMessage" , newMessagess=>{
      setOldMessages(prev=>[...prev , ,newMessagess])
    })
    return ()=>socket.disconnect()
  } , [])


  const sendMessage = ()=>{
    let socket = io("http://localhost:9000")
    if(newMessage.trim() !== ""){
      socket.emit("newMessageAppeared", newMessage)
      console.log(newMessage)
      setNewMessage("")
    }

  }

  return (
    <> 
    <h1 className="text-center relative top-4 text-[70px] text-white">Discord server</h1>
     
      <div className="fullscrollBar overflow-y-scroll w-full h-[45rem] flex p-20 text-[40px] flex-col text-white">
       {oldMessages.map((message,index)=>(
        <p key={index}>{message}</p>
       ))}
      </div>


      {/* This is the comment adding section */}
      <div className="w-full flex justify-center items-center gap-6 ">
        <input value={newMessage} onChange={(e)=>setNewMessage(e.target.value)} className="w-[50rem] text-[20px] p-2 mt-4 rounded-lg" placeholder="Enter your message here"></input>
        <button onClick={sendMessage} className="p-4 bg-[#9b59b6] w-[30rem] mt-4 rounded-lg text-[20px] font-bold">Send Message</button>
      </div>
    </>
  )
}

export default App
