const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const teamController = require('../controllers/teamController');

router.post('/', verifyToken, teamController.createTeam);
router.get('/tournament/:tournamentId', verifyToken, teamController.getTeamsByTournament);
router.put('/:id', verifyToken, teamController.updateTeam);
router.delete('/:id', verifyToken, teamController.deleteTeam);

// JUGADORES
router.post('/:teamId/players', verifyToken, teamController.addPlayer);
router.put('/:teamId/players/:playerId', verifyToken, teamController.updatePlayer);
router.delete('/:teamId/players/:playerId', verifyToken, teamController.deletePlayer);

module.exports = router;