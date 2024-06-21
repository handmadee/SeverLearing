// 'use strict';

// const mongoose = require('mongoose');

// const config = require('../configs/config.mongodb');
// const BASE_URL = config.db.host;
// const local = 'mongodb://localhost:27017/Tsmart'
// class Database {
//     constructor() {
//         this.client = {
//             serverApi: {
//                 url: local,
//                 strict: true,
//                 deprecationErrors: true,
//             }
//         }
//         this._connect();
//     }

//     async _connect() {
//         try {
//             await this.client.connect();
//             await this.client.db("Tsmart").command({ ping: 1 });
//             console.log("Pinged your deployment. You successfully connected to MongoDB!");
//         } catch (error) {
//             console.error("Error connecting to MongoDB:", error);
//         }
//     }

//     async close() {
//         try {
//             await this.client.close();
//             console.log("MongoDB connection closed.");
//         } catch (error) {
//             console.error("Error closing MongoDB connection:", error);
//         }
//     }
// }

// const instanceMongodb = new Database();
// module.exports = instanceMongodb;



// Client 

'use strict';

const mongoose = require('mongoose');
const config = require('../configs/config.mongodb');
const BASE_URL = config.db.host;
const local = 'mongodb://localhost:27017/Tsmart';

class Database {
    constructor() {
        this._connect();
    }

    async _connect() {
        try {
            await mongoose.connect(local, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log("Connected to MongoDB!");
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
        }
    }

    async close() {
        try {
            await mongoose.connection.close();
            console.log("MongoDB connection closed.");
        } catch (error) {
            console.error("Error closing MongoDB connection:", error);
        }
    }
}

const instanceMongodb = new Database();
module.exports = instanceMongodb;


// Product 

// 'use strict';

// const mongoose = require('mongoose');
// const config = require('../configs/config.mongodb');

// class Database {
//     constructor() {
//         this._connect();
//     }

//     async _connect() {
//         try {
//             await mongoose.connect(config.db.host, {
//                 useNewUrlParser: true,
//                 useUnifiedTopology: true,
//             });
//             console.log("Connected to MongoDB successfully!");
//         } catch (error) {
//             console.error("Error connecting to MongoDB:", error);
//             process.exit(1);
//         }
//     }

//     async disconnect() {
//         try {
//             await mongoose.disconnect();
//             console.log("Disconnected from MongoDB.");
//         } catch (error) {
//             console.error("Error disconnecting from MongoDB:", error);
//         }
//     }
// }

// module.exports = new Database();
