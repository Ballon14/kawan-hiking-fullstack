// Test MongoDB connection
import { getDb } from './mongodb.js';

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    
    const db = await getDb();
    
    // Test ping
    await db.command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB!');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📦 Existing collections:', collections.map(c => c.name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

testConnection();
