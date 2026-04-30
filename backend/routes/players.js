const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/playerController');

router.get('/', ctrl.getAllPlayers);
router.get('/:id', ctrl.getPlayerById);
router.post('/', ctrl.createPlayer);
router.put('/:id', ctrl.updatePlayer);
router.delete('/:id', ctrl.deletePlayer);

module.exports = router;
