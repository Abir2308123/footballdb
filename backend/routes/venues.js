const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/venueController');

router.get('/', ctrl.getAllVenues);
router.get('/:id', ctrl.getVenueById);
router.post('/', ctrl.createVenue);
router.put('/:id', ctrl.updateVenue);
router.delete('/:id', ctrl.deleteVenue);

module.exports = router;
