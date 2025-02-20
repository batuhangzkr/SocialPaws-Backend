import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import petRoutes from './routes/pets';
import messageRoutes from './routes/messages';
import conversationRoutes from './routes/conversations';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes';
import commentRoutes from './routes/comments';
import likeRoutes from './routes/likes';
import notificationRoutes from './routes/notification';
import breedingRoutes from './routes/breeding';
import path from 'path';
import { User } from './models/User';
import cors from 'cors'



dotenv.config();
const app = express();


const server = createServer(app);
const io = new Server(server);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

connectDB();

app.use(cors({
  origin: '*', // Mobil uygulamalardan gelen istekleri kabul etmek için
}));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/breeding', breedingRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app._router.stack.forEach(function (r: any) {
  if (r.route && r.route.path) {
    console.log(r.route.path);
  }
});

io.on('connection', (socket) => {

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`Kullanıcı ${userId} bağlandı`);
  });

  socket.on('sendMessage', async (messageData) => {
    const user = await User.findById(messageData.sender).select('name profilePhoto');

    if (!user) {
      return;
    }

    const enrichedMessage = {
      ...messageData,
      sender: {
        _id: user._id,
        name: user.name,
        profilePhoto: user.profilePhoto,
      },
    };

    io.to(messageData.receiver).emit('receiveMessage', enrichedMessage);
    io.to(messageData.sender).emit('receiveMessage', enrichedMessage);
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı bağlantısı kesildi');
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
