import { useEffect, useRef, useState } from "react";

function Chat({ socket, userName, chatId, exit }) {
  const [msg, setMsg] = useState("");
  const [msgList, setMsgList] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [isFileMsg, setIsFileMsg] = useState(false);

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

  useEffect(() => {
    if (files.length) {
      // const filesNames = files.map((file) => {
      //   console.log(file)
      //   return file.name
      // });
      // setFileNames((prevNames) => [...prevNames, ...filesNames]);
    } else {
      setIsFileMsg(false);
    }
  }, [files, files.length]);

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setIsFileMsg(true);
      setFiles((prevFiles) => [...prevFiles, ...e.target.files]);
    }
    // for(const key in e.target.files) {
    //   files.push(e.target.files[key])
    // }
  };

  const sendMsg = async (msgData) => {
    console.log(files)
    if (files.length) {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file)
      })

      console.log(formData.get('files'))
  
      formData.append("uploadedFiles", files);
      const response = await fetch("http://localhost:3001/upload-files", {
        method: "POST",
        body: formData
      });

      console.log(await response.json())
    }
    await socket.emit("sendMsg", msgData);
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
          fileNames,
        };

        textInput.current.value = "";
        setMsgList((msgList) => [...msgList, msgData]);
        await sendMsg(msgData);

        console.log(msgList);
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

                {(isFileMsg && fileNames.length) ?? (
                  <ul className="file-names">
                    {fileNames.map((fn) => {
                      <li className="file-name">{fn}</li>;
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
        <input type="file" multiple={true} onChange={handleFileChange} />
      </div>
      <div className="buttons">
        <button onClick={disconnectChat}>Exit</button>

        <button onClick={sendMsgHandler}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
