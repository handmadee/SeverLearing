// PopupService.js
'use strict';

const BaseService = require("../base.service");
const PopupModel = require("../../models/popup/popups.model");

class PopupService extends BaseService {
    constructor() {
        super(PopupModel);
    }
}

module.exports = PopupService;

