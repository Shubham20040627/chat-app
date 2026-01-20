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

const roomStore = new Map(); // Maps roomCode -> expiryTimestamp

// Maps socket.id -> roomCode for easy disconnect handling
const socketRoomMap = new Map();

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("create_room", (durationMinutes, callback) => {
        let roomCode = nanoid(6).toUpperCase();

        // Ensure uniqueness in both active socket rooms and our memory store
        while (io.sockets.adapter.rooms.has(roomCode) || roomStore.has(roomCode)) {
            roomCode = nanoid(6).toUpperCase();
        }

        const expiryTime = Date.now() + (durationMinutes * 60 * 1000);
        roomStore.set(roomCode, { expiry: expiryTime, messages: [], users: [] });

        // Optional: Set a timeout to clean up the map strictly (though lazy check in join is decent)
        // We can just rely on lazy checks, but memory might grow if thousands of rooms are created. 
        // For this scale, a periodic cleanup or just lazy check is fine. 
        // Let's stick to simple lazy check + periodic cleanup if needed later.

        socket.join(roomCode);
        socketRoomMap.set(socket.id, roomCode);

        // Add creator to user list (we don't have username yet, they join immediately after)
        // Actually, create_room is followed by join_room in client logic.
        // So we wait for join_room to add them to user list.

        console.log(`User ${socket.id} created room: ${roomCode} expires at ${new Date(expiryTime).toLocaleTimeString()}`);
        callback({ roomCode, expiryTime });
    });

    socket.on("join_room", (data) => {
        const { room, username } = data;

        // Check if room exists and is valid
        if (!roomStore.has(room)) {
            socket.emit("error_message", "Room not found or has expired.");
            return;
        }

        const roomData = roomStore.get(room);
        if (Date.now() > roomData.expiry) {
            socket.emit("error_message", "Room has expired.");
            roomStore.delete(room); // Cleanup
            return;
        }

        socket.join(room);
        socketRoomMap.set(socket.id, room);

        // Add to user list if not already there
        const existingUser = roomData.users.find(u => u.id === socket.id);
        if (!existingUser) {
            roomData.users.push({ id: socket.id, username });
            roomStore.set(room, roomData);
        }

        console.log(`User ${socket.id} (${username}) joined room: ${room}`);

        // Send back the expiry time and existing messages
        socket.emit("room_info", { expiryTime: roomData.expiry });
        socket.emit("load_messages", roomData.messages);

        // Broadcast active users to everyone in room
        io.to(room).emit("room_users", roomData.users);
    });

    socket.on("send_message", (data) => {
        // data should contain: room, author, message, time
        // Verify room is still valid before sending?
        if (!roomStore.has(data.room)) {
            socket.emit("error_message", "Room expired.");
            return;
        }

        const roomData = roomStore.get(data.room);
        if (Date.now() > roomData.expiry) {
            socket.emit("error_message", "Room has expired.");
            roomStore.delete(data.room);
            return;
        }

        // Store message in memory
        roomData.messages.push(data);
        roomStore.set(data.room, roomData); // Update store

        socket.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
        const roomCode = socketRoomMap.get(socket.id);
        if (roomCode && roomStore.has(roomCode)) {
            const roomData = roomStore.get(roomCode);
            roomData.users = roomData.users.filter(u => u.id !== socket.id);
            roomStore.set(roomCode, roomData);

            io.to(roomCode).emit("room_users", roomData.users);
            socketRoomMap.delete(socket.id);
        }
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
app.get(/.*/, (req, res) => {
    res.sendFile(join(clientDistPath, "index.html"));
});

server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
