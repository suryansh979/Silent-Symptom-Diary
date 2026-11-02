const mongoose = require('mongoose');

// async function kyun? Kyunki database connect hone mein thoda time lagta hai, 
// aur hum chahte hain ki Node.js connection ka wait kare (await).
const connectDB = async () => {
    try {
        // .env file se MONGO_URI le rahe hain
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Agar database connect nahi hua, toh server ko safely band (exit) kar do
        process.exit(1);
    }
};

// Is function ko export kar rahe hain taaki server.js isko use kar sake
module.exports = connectDB;