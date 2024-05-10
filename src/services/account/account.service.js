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





}

module.exports = AccountService;    