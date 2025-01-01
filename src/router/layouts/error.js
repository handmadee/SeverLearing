const express = require('express');
const errorLayout = express.Router();

errorLayout.get('/404', (req, res) => {
    res.render('errors/404', { title: "404  - Not found" });
});

module.exports = errorLayout;

