import React, { useState } from 'react';

const RoomChoice = ({ username, setStep, createRoom, joinRoom, room, setRoom, duration, setDuration }) => {
    const [isJoinActive, setIsJoinActive] = useState(false);

    return (
        <div className="card fade-in wide-card">
            <h2 className="title">Hello, <span className="highlight">{username}</span></h2>
            <p className="subtitle">How would you like to connect?</p>

            <div className="choice-container">
                {/* CREATE ROOM OPTION */}
                <div className="choice-box">
                    <div className="icon">🚀</div>
                    <h3>Create Room</h3>
                    <p>Start a new encrypted session.</p>
                    <div className="select-wrapper">
                        <select onChange={(e) => setDuration(Number(e.target.value))} value={duration} className="premium-select">
                            <option value={15}>15 Minutes</option>
                            <option value={60}>1 Hour</option>
                            <option value={1440}>24 Hours</option>
                        </select>
                    </div>
                    <button className="premium-btn" onClick={createRoom}>Create Now</button>
                </div>

                {/* JOIN ROOM OPTION */}
                <div className="choice-box">
                    <div className="icon">🔑</div>
                    <h3>Join Room</h3>
                    <p>Enter a code to join an existing session.</p>
                    {!isJoinActive ? (
                        <button className="premium-btn secondary-btn" onClick={() => setIsJoinActive(true)}>Enter Code</button>
                    ) : (
                        <div className="join-input-group fade-in">
                            <input
                                type="text"
                                className="premium-input small-input"
                                placeholder="Room Code..."
                                value={room}
                                onChange={(event) => setRoom(event.target.value.toUpperCase())}
                                onKeyPress={(event) => event.key === "Enter" && joinRoom()}
                                autoFocus
                            />
                            <button className="premium-btn" onClick={joinRoom}>Join</button>
                        </div>
                    )}
                </div>
            </div>
            <button className="back-link" onClick={() => setStep('username')}>← Back</button>
        </div>
    );
};

export default RoomChoice;
