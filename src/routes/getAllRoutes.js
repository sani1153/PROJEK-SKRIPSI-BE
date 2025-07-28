const express = require('express');
const getAll = require('../controller/getAllController');
const router = express.Router();

router.get('/semua', getAll.getAllData);

module.exports = router;