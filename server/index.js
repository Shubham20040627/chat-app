import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path, { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity, or specify client URL
        methods: ["GET", "POST"],
    },
});

// MongoDB Setup
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Room Schema
const roomSchema = new mongoose.Schema({
    roomCode: { type: String, required: true, unique: true },
    expiry: { type: Date, required: true },
    messages: [{
        author: String,
        message: String,
        time: String,
        type: String,
        mimeType: String,
        body: String
    }],
    users: [{ id: String, username: String }]
});

// TTL Index: Auto-delete room when expiry time is reached
roomSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

const Room = mongoose.model('Room', roomSchema);

// Maps socket.id -> roomCode for easy disconnect handling
const socketRoomMap = new Map();

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("create_room", async (durationMinutes, callback) => {
        let roomCode = nanoid(6).toUpperCase();

        // Check uniqueness in DB (rare collision check)
        while (await Room.exists({ roomCode })) {
            roomCode = nanoid(6).toUpperCase();
        }

        const expiryTime = new Date(Date.now() + (durationMinutes * 60 * 1000));

        const newRoom = new Room({
            roomCode,
            expiry: expiryTime,
            messages: [],
            users: []
        });

        await newRoom.save();

        socket.join(roomCode);
        socketRoomMap.set(socket.id, roomCode);

        console.log(`User ${socket.id} created room: ${roomCode} expires at ${expiryTime.toLocaleTimeString()}`);
        callback({ roomCode, expiryTime: expiryTime.getTime() });
    });

    socket.on("join_room", async (data) => {
        const { room, username } = data;

        try {
            const roomData = await Room.findOne({ roomCode: room });

            if (!roomData) {
                socket.emit("error_message", "Room not found or has expired.");
                return;
            }

            // Expiry check is handled by TTL, but double check doesn't hurt
            if (Date.now() > roomData.expiry.getTime()) {
                socket.emit("error_message", "Room has expired.");
                await Room.deleteOne({ roomCode: room });
                return;
            }

            socket.join(room);
            socketRoomMap.set(socket.id, room);

            // atomic add user
            await Room.updateOne(
                { roomCode: room },
                { $addToSet: { users: { id: socket.id, username } } }
            );

            // Get updated list to show everyone
            const updatedRoom = await Room.findOne({ roomCode: room });

            console.log(`User ${socket.id} (${username}) joined room: ${room}`);

            // Send room info
            socket.emit("room_info", { expiryTime: roomData.expiry.getTime() });
            socket.emit("load_messages", roomData.messages);
            if (updatedRoom) {
                io.to(room).emit("room_users", updatedRoom.users);
            }

        } catch (error) {
            console.error(error);
            socket.emit("error_message", "Error joining room.");
        }
    });

    socket.on("send_message", async (data) => {
        // data: room, author, message, time, type...
        try {
            // Verify room exists
            const exists = await Room.exists({ roomCode: data.room });

            if (!exists) {
                socket.emit("error_message", "Room expired.");
                return;
            }

            // Atomic update using $push (Concurrency Safe)
            await Room.updateOne(
                { roomCode: data.room },
                { $push: { messages: data } }
            );

            // Broadcast to others
            socket.to(data.room).emit("receive_message", data);

            console.log(`Msg saved to ${data.room}`);
        } catch (error) {
            console.error("Msg save error:", error);
        }
    });

    socket.on("disconnect", async () => {
        console.log("User Disconnected", socket.id);
        const roomCode = socketRoomMap.get(socket.id);

        if (roomCode) {
            try {
                // Remove user from DB
                await Room.updateOne(
                    { roomCode: roomCode },
                    { $pull: { users: { id: socket.id } } }
                );

                // Fetch updated user list to broadcast
                const roomData = await Room.findOne({ roomCode });
                if (roomData) {
                    io.to(roomCode).emit("room_users", roomData.users);
                }
            } catch (error) {
                console.error("Disconnect error:", error);
            }
            socketRoomMap.delete(socket.id);
        }
    });
});

const PORT = process.env.PORT || 3001;

// Serve static files from the client directory
const clientDistPath = join(__dirname, '../client/dist');

app.use(express.static(clientDistPath));

// Handle React routing, return all requests to React app
app.get(/.*/, (req, res) => {
    res.sendFile(join(clientDistPath, "index.html"));
});

server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
