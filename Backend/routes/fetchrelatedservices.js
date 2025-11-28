// routes/serviceRoutes.js
const express = require("express");
const router = express.Router();
const { getServices } = require('../controllers/servicecontroller');

router.get('/relatedservices', getServices);

module.exports = router;
