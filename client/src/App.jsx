import "./App.css";
import io from "socket.io-client";
import { useState } from "react";
import Chat from "./Chat";

// const socket = io.connect("http://localhost:3001");
const socket = io.connect("https://chat-app-fu9b.onrender.com");

function App() {
  const [userName, setUserName] = useState("");
  const [chatId, setChatId] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (userName.length && chatId.length) {
      socket.emit("joinRoom", {chatId, userName});
      setShowChat(true)
    }
  };

  const exitChat = () => {
    setShowChat(false)
  }

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Join chat</h3>
          <input
            type="text"
            placeholder="Me..."
            onChange={(e) => setUserName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Room ID"
            onChange={(e) => setChatId(e.target.value)}
          />
          <button onClick={joinRoom}>Join room</button>
        </div>
      ) : (
        <Chat socket={socket} userName={userName} chatId={chatId} exit={exitChat}/>
      )}
    </div>
  );
}

export default App;
