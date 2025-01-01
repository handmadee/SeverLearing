'use strict'

const { StatusCodes, ReasonPhrases } = require('./httpStatusCode');

class SuccessResponse {
    constructor(statusCode, reasonCode, data) {
        this.statusCode = statusCode;
        this.reasonCode = reasonCode;
        this.data = data;
    }
    send(res) {
        return res.status(this.statusCode).json({
            status: this.statusCode,
            message: this.reasonCode,
            data: this.data
        });
    }
}
class OK extends SuccessResponse {
    constructor(data) {
        super(StatusCodes.OK, ReasonPhrases.OK, data);
    }
}

class Created extends SuccessResponse {
    constructor(message, data) {
        super(StatusCodes.CREATED, message || ReasonPhrases.CREATED, data);
    }
}

class NoContent extends SuccessResponse {
    constructor(message, data) {
        super(StatusCodes.NO_CONTENT || message, data)
    }
}


module.exports = { OK, Created, NoContent };