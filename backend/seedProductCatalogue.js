require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const productCatalogueData = require('./config/productCatalogueData');

const seedProductCatalogue = async () => {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('product_catalogue');
    
    // Clear existing data
    await collection.deleteMany({});
    
    // Insert new data
    const result = await collection.insertMany(productCatalogueData);
    
    console.log(`Successfully inserted ${result.insertedCount} product catalogue records`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding product catalogue:', err.message);
    process.exit(1);
  }
};

seedProductCatalogue();
