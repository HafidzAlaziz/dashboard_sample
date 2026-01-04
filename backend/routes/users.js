const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, syncAdmin } = require('../controllers/usersController');

// In real app, add middleware to check if requester is admin
router.get('/', getUsers);
router.post('/', createUser);
router.put('/sync-admin', syncAdmin); // Specific route before :id
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
