import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { nanoid } from 'nanoid';

const app = express();
app.use(cors());

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity, or specify client URL
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("create_room", (callback) => {
        let roomCode = nanoid(6).toUpperCase();
        // Regenerate roomCode if it already exists in the adapter's rooms
        while (io.sockets.adapter.rooms.has(roomCode)) {
            roomCode = nanoid(6).toUpperCase();
        }
        socket.join(roomCode);
        console.log(`User ${socket.id} created room: ${roomCode}`);
        callback(roomCode);
    });

    socket.on("join_room", (data) => {
        const { room, username } = data;
        socket.join(room);
        console.log(`User ${socket.id} (${username}) joined room: ${room}`);
    });

    socket.on("send_message", (data) => {
        // data should contain: room, author, message, time
        socket.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

const PORT = process.env.PORT || 3001;

// Serve static files from the client directory
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDistPath = join(__dirname, '../client/dist');

app.use(express.static(clientDistPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(join(clientDistPath, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
