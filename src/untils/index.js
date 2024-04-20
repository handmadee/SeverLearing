'use strict'

// lodash library 
const _ = require('lodash');

function getInforData({ fields = [], data = {} }) {
    const infoData = _.pick(data, fields);
    return infoData;
}





module.exports = getInforData;