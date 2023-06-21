import { useEffect, useState } from "react";

function Chat({ socket, userName, chatId, exit }) {
  const [msg, setMsg] = useState("");
  const [msgList, setMsgList] = useState([]);

  useEffect(() => {
    socket.on("rcvMsg", (data) => {
      setMsgList((msgList) => [...msgList, data]);
    });

    socket.on("fetchedData", (messages) => {
      console.log(messages)
      setMsgList((msgList) => [...msgList, ...messages]);
    })

  }, [socket]);

  const sendMsg = async () => {
    try {
      if (msg.length) {
        const msgData = {
          chatId,
          author: userName,
          time: new Date().toISOString(),
          msg: msg,
        };
  
        await socket.emit("sendMsg", msgData);
        setMsgList((msgList) => [...msgList, msgData]);
      }
    } catch (e) {
      console.log(e)
    }
    
  };

  const disconnectChat = () => {
    socket.disconnect();
    exit()
  };

  const transformDateToTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="chat-window ">
      <div className="chat-header">
        <p>Live chat</p>
      </div>
      <div className="chat-body">
        <ul className="message-list">
          {msgList.map((msgData) => (
            <li className="message" key={Math.random() + Math.random()}>
              <span className="message-content">
                {(msgData.msg || msgData.content)}
              </span>
              <span className="message-meta">
                <p>
                  {transformDateToTime(msgData.time)}
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
