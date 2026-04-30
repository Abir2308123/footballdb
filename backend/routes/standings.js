const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/standingsController');

router.get('/stats', ctrl.getDashboardStats);
router.get('/statistics', ctrl.getStatistics);
router.get('/all', ctrl.getAllStandings);
router.get('/:leagueId', ctrl.getStandings);

module.exports = router;
