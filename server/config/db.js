// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        console.log('MongoDB URI:', process.env.MONGO_URI ? 'Set' : 'Not set');

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error('Please check your MONGO_URI in .env file');
        process.exit(1);
    }
};

module.exports = connectDB;