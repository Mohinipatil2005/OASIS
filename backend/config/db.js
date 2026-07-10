import dns from 'dns';
import mongoose from 'mongoose';

// Set DNS servers in case of local network resolution issues with Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('DNS servers could not be set:', e.message);
}

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || process.env.MONGODB_URL;
  const localUri = 'mongodb://127.0.0.1:27017/pizza-delivery';

  if (primaryUri) {
    try {
      // Safely log cluster host name (masking user/password details)
      const hostName = primaryUri.split('@').pop() || primaryUri;
      console.log(`Connecting to MongoDB cluster: ${hostName}`);
      
      const conn = await mongoose.connect(primaryUri);
      console.log(`MongoDB Connected (Remote Cluster): ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`Database Connection Warning (Remote failed): ${error.message}`);
      console.log('Attempting local database fallback (127.0.0.1:27017)...');
    }
  }

  try {
    const conn = await mongoose.connect(localUri);
    console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
  } catch (localError) {
    console.error(`Database Connection Error (Local fallback also failed): ${localError.message}`);
    console.error('Please make sure local MongoDB is running on port 27017, or verify your Atlas Network Access IP Whitelist.');
    process.exit(1);
  }
};

export default connectDB;