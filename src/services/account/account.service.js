'use strict';

const mongoose = require('mongoose');
const accountModel = require('../../models/account.model');
const BaseService = require('../base.service');

class AccountService extends BaseService {
    constructor() {
        super(accountModel);
    }
    static SelectAll() {
        return accountModel.find().lean();
    }
    // Select Account Admin or GV 
    static accountSupper() {
        return accountModel.find({
            pemission: { $elemMatch: { $in: ["789", "999"] } }
        }).lean();
    }
    static selectTeachers() {
        return accountModel.find({
            pemission: { $elemMatch: { $in: ["789"] } }
        }).lean();
    }

}

module.exports = AccountService;    