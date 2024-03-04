'use strict';

const express = require('express');
const router = express.Router();


// SignUp 
router.get('/shops/signup', (req, res) => {
    res.send('Sign Up');
});


module.exports = router;
