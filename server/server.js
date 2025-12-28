// server/server.js
const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');



connectDB();

const app = express();

// Update CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.FRONTEND_URL // This will be set in Render
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json()); // Allows us to accept JSON data in body
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes')); // <--- ADD THIS LINE

app.use('/api/studyplans', require('./routes/studyPlanRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
// Routes
app.use('/api/auth', require('./routes/authRoutes'));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));