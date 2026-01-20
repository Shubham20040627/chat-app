import React from 'react';

const UsernameEntry = ({ username, setUsername, onSubmit }) => {
    return (
        <div className="card fade-in">
            <h2 className="title" style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>SYNCZERO</h2>
            <p className="subtitle">Secure. Ephemeral. Private.</p>
            <input
                className="premium-input"
                type="text"
                placeholder="Username..."
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                onKeyPress={(event) => event.key === "Enter" && onSubmit()}
            />
            <button className="premium-btn" onClick={onSubmit}>
                Continue <span className="arrow">→</span>
            </button>
        </div>
    );
};

export default UsernameEntry;
