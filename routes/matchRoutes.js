const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const matchController = require('../controllers/matchController');

router.post('/', verifyToken, matchController.createMatch);
router.get('/tournament/:tournamentId', verifyToken, matchController.getMatchesByTournament);
router.put('/:id', verifyToken, matchController.updateMatch);
router.delete('/:id', verifyToken, matchController.deleteMatch);

module.exports = router;