import * as dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import connectDB from './config/db';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true, // Allow all origins for socket.io in dev for easier port shifting
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('User Connected: ', socket.id);

  // When user logins, they join their own room to receive notifications.
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room.`);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected: ', socket.id);
  });
});

// Pass io to other controllers via req if needed or use a separate module
app.set('io', io);

// Port and server listener
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});

export { io, app };
export default app;
