const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/managerController');

router.get('/', ctrl.getAllManagers);
router.get('/:id', ctrl.getManagerById);
router.post('/', ctrl.createManager);
router.put('/:id', ctrl.updateManager);
router.delete('/:id', ctrl.deleteManager);

module.exports = router;
