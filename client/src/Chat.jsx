import { useEffect, useState } from "react";

function Chat({ socket, userName, chatId, exit }) {
  const [msg, setMsg] = useState("");
  const [msgList, setMsgList] = useState([]);

  console.log(chatId)

  useEffect(() => {
    socket.on("receiveMsg", (data) => {
      console.log(msgList);
      setMsgList((msgList) => [...msgList, data]);
    });
  }, [socket]);

  const sendMsg = async () => {
    if (msg.length) {
      const msgData = {
        chatId,
        author: userName,
        time: `${new Date().getHours()}:${new Date().getMinutes()}`,
        msg: msg,
      };

      await socket.emit("sendMsg", msgData);
      setMsgList((msgList) => [...msgList, msgData]);
    }
  };

  const disconnectChat = () => {
    socket.disconnect();
    exit()
  };

  return (
    <div className="chat-window ">
      <div className="chat-header">
        <p>Live chat</p>
      </div>
      <div className="chat-body">
        <ul className="message-list">
          {msgList.map((msgData) => (
            <li className="message" key={msgData.msg + Math.random()}>
              <span className="message-content">
                {msgData.msg}
              </span>
              <span className="message-meta">
                <p>
                  {msgData.time}
                </p>
                <p>
                  {msgData.author}
                </p>
              </span>
            </li>
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
      <button onClick={disconnectChat}>Exit</button>
    </div>
  );
}

export default Chat;
