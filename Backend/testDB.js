// testDB.js
const connectDB = require('./config/db'); // Adjust the path if needed

const testConnection = async () => {
  try {
    await connectDB();
    console.log('weba-hub connected');
  } catch (error) {
    console.error('Test connection error:', error.message);
  }
};

testConnection();
