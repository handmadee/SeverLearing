'use strict';

const mongoose = require('mongoose');
const Info = require('../../models/infor.model');
const accountModel = require('../../models/account.model');
const BaseService = require('../base.service');

class InfoService extends BaseService {
    constructor() {
        super(Info);
    }
    async createInfoUser(data) {
        const { accountId } = data;
        const account = await accountModel.findById(accountId);
        if (!account) {
            throw new Error('Account not found');
        }
        const info = await Info.create(data);
        await accountModel.findByIdAndUpdate(accountId, { $set: { info: info._id } });
        return info;
    }
    async updateInfoUser(infoId, data) {
        const info = await Info.findById(infoId);
        if (!info) {
            throw new Error('Info not found');
        }
        const updatedInfo = await Info.findByIdAndUpdate(infoId, { $set: data }, { new: true });
        return updatedInfo;
    }



}

module.exports = new InfoService(Info);