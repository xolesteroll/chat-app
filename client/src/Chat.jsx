import { useEffect, useState } from "react";

function Chat({ socket, userName, roomId }) {
  const [msg, setMsg] = useState("");
  const [msgList, setMsgList] = useState([]);

  const sendMsg = () => {
    if (msg.length) {
      const msgData = {
        roomId,
        author: userName,
        time: `${new Date().getHours()}:${new Date().getMinutes()}`,
        msg: msg,
      };

      socket.emit("sendMsg", msgData);
    }
  };

  useEffect(() => {
    socket.on("receiveMsg", (data) => {
      console.log(msgList);
      setMsgList((msgList) => [...msgList, data.msg]);
    });
  }, [socket]);

  return (
    <div className="chat-window ">
      <div className="chat-header">
        <p>Live chat</p>
      </div>
      <div className="chat-body">
        <ul className="message-list">
          {msgList.map((msg) => (
            <li key={msg + Math.random()}>{msg}</li>
          ))}
        </ul>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          placeholder="type your message..."
          onChange={(e) => setMsg(e.target.value)}
        />
      </div>

      <button onClick={sendMsg}>Send</button>
    </div>
  );
}

export default Chat;
