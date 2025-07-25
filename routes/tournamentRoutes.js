const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Crear torneo
router.post('/', verifyToken, tournamentController.createTournament);

// Obtener todos los torneos del usuario
router.get('/', verifyToken, tournamentController.getTournaments);

// Obtener un torneo por ID
router.get('/:id', verifyToken, tournamentController.getTournamentById);

// Generar partidos automáticamente
router.post('/:id/generate-matches', verifyToken, tournamentController.generateMatches);

router.delete('/:id', verifyToken, tournamentController.deleteTournament);

module.exports = router;