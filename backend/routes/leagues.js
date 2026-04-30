const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leagueController');

router.get('/', ctrl.getAllLeagues);
router.get('/:id', ctrl.getLeagueById);
router.post('/', ctrl.createLeague);
router.put('/:id', ctrl.updateLeague);
router.delete('/:id', ctrl.deleteLeague);

module.exports = router;
