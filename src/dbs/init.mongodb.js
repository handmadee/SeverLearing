
'use strict';
const mongoose = require('mongoose');
const config = require('../configs/config.mongodb');
const topicModel = require('../models/topic.model');
const { allTopics } = require('../data/sampleTopics');

class Database {
    constructor() {
        this._connect();
    }

    async _connect() {
        try {
            await mongoose.connect(config.db.host, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            // const seedTopics = async () => {
            //     try {
            //         await topicModel.deleteMany({});
            //         console.log('Cleared existing topics');
            //         const createdTopics = await topicModel.insertMany(allTopics);
            //         console.log(`${createdTopics.length} topics created`);
            //         console.log('Seeding completed successfully');
            //     } catch (error) {
            //         console.error('Seeding error:', error);
            //         process.exit(1);
            //     }
            // };
            // seedTopics();
            console.log("Connected to MongoDB successfully!" + config.db.host);
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            process.exit(1);
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            console.log("Disconnected from MongoDB.");
        } catch (error) {
            console.error("Error disconnecting from MongoDB:", error);
        }
    }
}

module.exports = new Database();

