const fs = require('fs');
const path = require('path');
const db = require('../config/db');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Read schema and sample data
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sampleDataPath = path.join(__dirname, 'sample_data.sql');
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const sampleData = fs.readFileSync(sampleDataPath, 'utf8');
    
    // Run schema creation
    console.log('📋 Creating tables...');
    await db.query(schema);
    console.log('✅ Tables created successfully!');
    
    // Run sample data insertion
    console.log('📊 Inserting sample data...');
    await db.query(sampleData);
    console.log('✅ Sample data inserted successfully!');
    
    console.log('✨ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
