const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/teamController');

router.get('/', ctrl.getAllTeams);
router.get('/:id', ctrl.getTeamById);
router.post('/', ctrl.createTeam);
router.put('/:id', ctrl.updateTeam);
router.delete('/:id', ctrl.deleteTeam);

module.exports = router;
