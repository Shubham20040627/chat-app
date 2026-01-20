import React from 'react';

const ChatWindow = ({
    room,
    username,
    messageList,
    currentMessage,
    setCurrentMessage,
    sendMessage,
    activeUsers,
    timeLeft,
    expiryTime,
    leaveRoom,
    messagesEndRef,
    showRoomCode,
    setShowRoomCode,
    showUserList,
    setShowUserList,
    onFileUpload
}) => {
    return (
        <div className="chat-window fade-in">
            <div className="chat-header">
                <div className="header-info">
                    <p className="logo">🛡️ SyncZero</p>
                    <span
                        className="room-badge"
                        onClick={() => setShowRoomCode(!showRoomCode)}
                        title="Toggle Room Code"
                    >
                        Code: {showRoomCode ? room : "••••••"}
                        <small>{showRoomCode ? " 👁️" : " 🔒"}</small>
                    </span>
                </div>

                <div className="user-list-container">
                    <div
                        className="user-count"
                        onClick={() => setShowUserList(!showUserList)}
                    >
                        👥 {activeUsers.length}
                    </div>
                    {showUserList && (
                        <div className="user-dropdown">
                            <h4>Active Agents</h4>
                            <ul>
                                {activeUsers.map(u => (
                                    <li key={u.id}>
                                        {u.username}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {expiryTime && (
                    <div className="timer-badge">
                        ⏳ {timeLeft}
                    </div>
                )}
                <button className="leave-btn" onClick={leaveRoom}>✕</button>
            </div>

            <div className="chat-body">
                {messageList.map((messageContent, i) => {
                    const isMe = username === messageContent.author;
                    return (
                        <div
                            className={`message-container ${isMe ? "you" : "other"}`}
                            key={i}
                        >
                            <div className="message">
                                <div className="message-content">
                                    {messageContent.type === "file" ? (
                                        <div className="file-message">
                                            {messageContent.mimeType.startsWith("image/") ? (
                                                <img src={messageContent.body} alt="uploaded" />
                                            ) : (
                                                <div className="file-icon">📄</div>
                                            )}
                                            <a href={messageContent.body} download={messageContent.message} className="download-btn">
                                                ↓ {messageContent.message}
                                            </a>
                                        </div>
                                    ) : (
                                        messageContent.message
                                    )}
                                </div>
                                <div className="message-meta">
                                    <span className="time">{messageContent.time}</span>
                                    <span className="author">{messageContent.author}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-footer">
                <label htmlFor="file-upload" className="attach-btn">
                    📎
                </label>
                <input
                    id="file-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={onFileUpload}
                />
                <input
                    type="text"
                    value={currentMessage}
                    placeholder="Type your encrypted message..."
                    onChange={(event) => setCurrentMessage(event.target.value)}
                    onKeyPress={(event) => {
                        event.key === "Enter" && sendMessage();
                    }}
                />
                <button onClick={sendMessage} className="send-btn">➤</button>
            </div>
        </div>
    );
};

export default ChatWindow;
