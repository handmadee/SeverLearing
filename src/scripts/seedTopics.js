'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const { allTopics } = require('../data/sampleTopics');
const topicModel = require('../models/topic.model');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Connection error:', error);
        process.exit(1);
    }
};

const seedTopics = async () => {
    try {
        await connectDB();

        // Clear existing topics
        await topicModel.deleteMany({});
        console.log('Cleared existing topics');

        // Insert sample topics
        const createdTopics = await topicModel.insertMany(allTopics);
        console.log(`${createdTopics.length} topics created`);

        // Close the connection
        await mongoose.disconnect();
        console.log('MongoDB connection closed');

        console.log('Seeding completed successfully');
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

// Run the seeder if this file is executed directly
if (require.main === module) {
    seedTopics();
}

module.exports = seedTopics; 