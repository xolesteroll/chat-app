import { useEffect, useRef, useState } from "react";

function Chat({ socket, userName, chatId, exit }) {
  const [msg, setMsg] = useState("");
  const [msgList, setMsgList] = useState([]);
  const [files, setFiles] = useState([]);
  const [isFileMsg, setIsFileMsg] = useState(false);

  const fileInput = useRef();
  const textInput = useRef();

  useEffect(() => {
    socket.on("rcvMsg", (data) => {
      console.log(data);
      setMsgList((msgList) => [...msgList, data]);
    });

    socket.on("fetchedData", (messages) => {
      console.log(messages);
      setMsgList((msgList) => [...msgList, ...messages]);
    });
  }, [socket]);

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setIsFileMsg(true);
      setFiles((prevFiles) => [...prevFiles, ...e.target.files]);
    } else {
      setIsFileMsg(false);
    }
  };

  const sendMsg = async (msgData) => {
    try {
      if (files.length) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        const response = await fetch("http://localhost:3001/upload-files", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        const filesIds = data.filesIds;

        msgData.filesIds = filesIds;
      }

      await socket.emit("sendMsg", msgData);
      fileInput.files = [];
      setIsFileMsg(false);
    } catch (e) {
      console.log(e.message);
    }
  };

  const sendMsgHandler = async () => {
    try {
      if (msg.length) {
        const msgData = {
          chatId,
          type: isFileMsg ? "file" : "text",
          author: userName,
          time: new Date().toISOString(),
          msg: msg,
        };

        textInput.current.value = "";
        setMsgList((msgList) => [...msgList, msgData]);
        await sendMsg(msgData);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const disconnectChat = () => {
    socket.disconnect();
    exit();
  };

  const transformDateToTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
                <span className="message-text">{msgData.msg}</span>

                {(msgData.files && msgData.files.length > 0) && (
                  <ul className="file-names">                  
                    {msgData.files.map((f) => {
                      return (
                      <li key={f.name + Math.random()} className="file-name">
                        <a href={f.url} target="_blank" rel="noreferrer">{f.name}</a>
                      </li> 
                      );
                    })}
                  </ul>
                )}
              </span>
              <span className="message-meta">
                <p>{transformDateToTime(msgData.time)}</p>
                <p>{msgData.author}</p>
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
          ref={textInput}
        />
        <input
          ref={fileInput}
          type="file"
          multiple={true}
          onChange={handleFileChange}
        />
      </div>
      <div className="buttons">
        <button onClick={disconnectChat}>Exit</button>

        <button onClick={sendMsgHandler}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
