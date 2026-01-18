import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// Priority:
// 1. VITE_SERVER_URL (if set in env, e.g. for split deployment)
// 2. undefined (connect to same host, for single deployment)
// 3. Fallback to localhost:3001 (dev)
const socket = io.connect(import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? undefined : "http://localhost:3001"));

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  // Auto-scroll to bottom
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", { room, username });
      setShowChat(true);
    }
  };

  const createRoom = () => {
    if (username !== "") {
      socket.emit("create_room", (roomCode) => {
        setRoom(roomCode);
        socket.emit("join_room", { room: roomCode, username });
        setShowChat(true);
      });
    } else {
      alert("Please enter a username first");
    }
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", receiveMessageHandler);

    return () => {
      socket.off("receive_message", receiveMessageHandler);
    };
  }, []);

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Real-time Chat</h3>
          <input
            type="text"
            placeholder="Enter Username"
            onChange={(event) => setUsername(event.target.value)}
          />
          <div className="separator">-- OR --</div>
          <button onClick={createRoom}>Create New Room</button>

          <div className="separator" style={{ margin: '20px 0' }}>Join Existing Room</div>

          <input
            type="text"
            placeholder="Room ID (e.g. A2F9X)"
            value={room}
            onChange={(event) => setRoom(event.target.value.toUpperCase())}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div className="chat-window">
          <div className="chat-header">
            <p>Live Chat</p>
            <span>Room: {room}</span>
          </div>
          <div className="chat-body">
            {messageList.map((messageContent, i) => {
              return (
                <div
                  className="message-container"
                  id={username === messageContent.author ? "you" : "other"}
                  key={i}
                >
                  <div className="message">
                    <div className="message-content">
                      {messageContent.type === "file" ? (
                        <div className="file-message">
                          {messageContent.mimeType.startsWith("image/") ? (
                            <img src={messageContent.body} alt="uploaded" width="200" />
                          ) : (
                            <div className="file-icon">&#128196;</div>
                          )}
                          <a href={messageContent.body} download={messageContent.message} className="download-btn">
                            &#11015; {messageContent.message}
                          </a>
                        </div>
                      ) : (
                        messageContent.message
                      )}
                    </div>
                    <div className="message-meta">
                      <p id="time">{messageContent.time}</p>
                      <p id="author">{messageContent.author}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-footer">
            <input
              type="text"
              value={currentMessage}
              placeholder="Type a message..."
              onChange={(event) => setCurrentMessage(event.target.value)}
              onKeyPress={(event) => {
                event.key === "Enter" && sendMessage();
              }}
            />
            <button onClick={sendMessage}>&#9658;</button>
            <label htmlFor="file-upload" className="custom-file-upload">
              &#128206;
            </label>
            <input
              id="file-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    const messageData = {
                      room: room,
                      author: username,
                      type: "file",
                      message: file.name,
                      mimeType: file.type,
                      body: reader.result,
                      time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
                    };
                    socket.emit("send_message", messageData);
                    setMessageList((list) => [...list, messageData]);
                  };
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
