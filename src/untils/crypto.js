const crypto = require('crypto');


class CryptoService {
    constructor() {
        this.generatedNumbers = new Set();
    }
    static genarayBytes(length) {
        return crypto.randomBytes(length).toString('hex');
    }
    static generateRandomNumber(min, max) {
        let randomNumber;
        do {
            const buffer = crypto.randomBytes(4);
            randomNumber = buffer.readUInt32BE(0) % (max - min + 1) + min;
        } while (this.generatedNumbers.has(randomNumber));
        this.generatedNumbers.add(randomNumber);
        return randomNumber;
    }
}
module.exports = { CryptoService };