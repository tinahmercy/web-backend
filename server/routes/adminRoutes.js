const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


router.get('/stats', adminController.getStats);

router.get('/users', adminController.getUsers);
router.post('/users/delete', adminController.deleteUser);

router.get('/attendance', adminController.getAttendance);

module.exports = router;