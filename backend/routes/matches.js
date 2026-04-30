const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/matchController');

router.get('/', ctrl.getAllMatches);
router.get('/recent', ctrl.getRecentMatches);
router.post('/', ctrl.createMatch);
router.put('/:id', ctrl.updateMatch);
router.delete('/:id', ctrl.deleteMatch);

module.exports = router;
