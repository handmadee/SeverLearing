'use strict';

const mongoose = require('mongoose');
const accountModel = require('../../models/account.model');

class AccountService {
    static SelectAll() {
        return accountModel.find().lean();
    }



}

module.exports = AccountService;    