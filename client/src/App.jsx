import "./App.css";
import io from "socket.io-client";
import { useState } from "react";
import Chat from "./Chat";

const socket = io.connect("http://localhost:3001");

function App() {
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [showChat, setShowchat] = useState(false);

  const joinRoom = () => {
    if (userName.length && roomId.length) {
      socket.emit("joinRoom", roomId);
      setShowchat(true)
    }
  };

  const disconnectChat = () => {
    socket.disconnect();
  };

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
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={joinRoom}>Join room</button>
          <button onClick={disconnectChat}>Exit</button>
        </div>
      ) : (
        <Chat socket={socket} userName={userName} roomId={roomId} />
      )}
    </div>
  );
}

export default App;
