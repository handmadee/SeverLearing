'use strict';


const mongoose = require('mongoose');
const config = require('../configs/congif.mongodb');
const { checkConnect } = require('../helpers/check.connect');
const BASE_URL = `mongodb://localhost:${config.db.port}/${config.db.name}`;
class Database {
    constructor() {
        this._connect();
    }
    // để kết nối dữ liệu với mongodb
    _connect() {
        if (1 === 1) {
            mongoose.set('debug', true);
            mongoose.set('debug', { color: true })
        }
        mongoose.connect(BASE_URL, { maxPoolSize: 50 })
            .then(() => {
                console.log('Database connection successful');
                checkConnect();
            })
            .catch(err => {
                console.log(err)
            });
    }
    // nó kiểm tra xem đã có một thể hiện của lớp Database chưa, nếu chưa thì nó sẽ tạo một thể hiện mới và trả về thể hiện đó.
    //Với cách triển khai này, mỗi lần bạn gọi Database.getInstance(), bạn sẽ nhận được cùng một thể hiện của lớp Database duy nhất, giúp đảm bảo rằng kết nối đến cơ sở dữ liệu chỉ được thiết lập một lần trong suốt vòng đời của ứng dụng.
    static getInstance() {
        if (!this.instance) {
            this.instance = new Database();
        }
        return this.instance;
    }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;


