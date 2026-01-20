import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';
import UsernameEntry from './components/UsernameEntry';
import RoomChoice from './components/RoomChoice';
import ChatWindow from './components/ChatWindow';

// Priority:
// 1. VITE_SERVER_URL (if set in env, e.g. for split deployment)
// 2. undefined (connect to same host, for single deployment)
// 3. Fallback to localhost:3001 (dev)
const socket = io.connect(import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? undefined : "http://localhost:3001"));

function App() {
  const [step, setStep] = useState('username'); // 'username' | 'choice' | 'chat'
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [duration, setDuration] = useState(15);
  const [expiryTime, setExpiryTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [showRoomCode, setShowRoomCode] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  // Load from local storage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem("chatSession");
    if (savedSession) {
      const session = JSON.parse(savedSession);
      // Check if session is expired
      if (session.expiryTime && Date.now() > session.expiryTime) {
        localStorage.removeItem("chatSession");
        return;
      }

      setUsername(session.username);
      setRoom(session.room);
      setExpiryTime(session.expiryTime);
      setMessageList(session.messages || []);

      // Attempt to rejoin automatically
      socket.emit("join_room", { room: session.room, username: session.username });
      setStep('chat');
    }

    // Listen for errors and info
    socket.on("error_message", (msg) => {
      alert(msg);
      leaveRoom();
    });

    socket.on("room_info", (data) => {
      if (data.expiryTime) {
        setExpiryTime(data.expiryTime);
        updateSessionExpiry(data.expiryTime);
      }
    });

    socket.on("load_messages", (messages) => {
      setMessageList(messages);
      updateSessionMessages(messages);
    });

    socket.on("room_users", (users) => {
      setActiveUsers(users);
    });

    return () => {
      socket.off("error_message");
      socket.off("room_info");
      socket.off("load_messages");
      socket.off("room_users");
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (!expiryTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const distance = expiryTime - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("Expired");
        alert("Room has expired!");
        leaveRoom();
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);


  const updateSessionMessages = (newMessages) => {
    const currentSession = JSON.parse(localStorage.getItem("chatSession") || '{}');
    currentSession.messages = newMessages;
    localStorage.setItem("chatSession", JSON.stringify(currentSession));
  };

  const updateSessionExpiry = (exp) => {
    const currentSession = JSON.parse(localStorage.getItem("chatSession") || '{}');
    currentSession.expiryTime = exp;
    localStorage.setItem("chatSession", JSON.stringify(currentSession));
  }

  const saveSession = (user, rm, exp) => {
    const session = {
      username: user,
      room: rm,
      expiryTime: exp,
      messages: []
    };
    localStorage.setItem("chatSession", JSON.stringify(session));
  }

  const leaveRoom = () => {
    localStorage.removeItem("chatSession");
    setStep('username');
    setRoom("");
    setMessageList([]);
    setExpiryTime(null);
    window.location.reload();
  };

  const handleUsernameSubmit = () => {
    if (username.trim() !== "") {
      setStep('choice');
    } else {
      alert("Please enter a username");
    }
  };

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", { room, username });
      setStep('chat');
      saveSession(username, room, null);
    }
  };

  const createRoom = () => {
    if (username !== "") {
      socket.emit("create_room", duration, (response) => {
        setRoom(response.roomCode);
        setExpiryTime(response.expiryTime);
        saveSession(username, response.roomCode, response.expiryTime);

        socket.emit("join_room", { room: response.roomCode, username });
        setStep('chat');
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
      const newList = [...messageList, messageData];
      setMessageList(newList);
      updateSessionMessages(newList);
      setCurrentMessage("");
    }
  };

  const handleFileUpload = (e) => {
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

        const newList = [...messageList, messageData];
        setMessageList(newList);
        updateSessionMessages(newList);
      };
    }
  };

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      setMessageList((list) => {
        const newList = [...list, data];
        updateSessionMessages(newList);
        return newList;
      });
    };

    socket.on("receive_message", receiveMessageHandler);

    return () => {
      socket.off("receive_message", receiveMessageHandler);
    };
  }, []);

  return (
    <div className="App">
      <div className="app-container">

        {step === 'username' && (
          <UsernameEntry
            username={username}
            setUsername={setUsername}
            onSubmit={handleUsernameSubmit}
          />
        )}

        {step === 'choice' && (
          <RoomChoice
            username={username}
            setStep={setStep}
            createRoom={createRoom}
            joinRoom={joinRoom}
            room={room}
            setRoom={setRoom}
            duration={duration}
            setDuration={setDuration}
          />
        )}

        {step === 'chat' && (
          <ChatWindow
            room={room}
            username={username}
            messageList={messageList}
            currentMessage={currentMessage}
            setCurrentMessage={setCurrentMessage}
            sendMessage={sendMessage}
            activeUsers={activeUsers}
            timeLeft={timeLeft}
            expiryTime={expiryTime}
            leaveRoom={leaveRoom}
            messagesEndRef={messagesEndRef}
            showRoomCode={showRoomCode}
            setShowRoomCode={setShowRoomCode}
            showUserList={showUserList}
            setShowUserList={setShowUserList}
            onFileUpload={handleFileUpload}
          />
        )}
      </div>
    </div>
  );
}

export default App;
