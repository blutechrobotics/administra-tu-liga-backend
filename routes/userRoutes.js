const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);

module.exports = router;

// controllers/userController.js
exports.getUserProfile = async (req, res) => {
  try {
    const [rows] = await req.pool.query('SELECT id, username, email FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener perfil' });
  }
};

exports.updateUserProfile = async (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) return res.status(400).json({ success: false, message: 'Datos incompletos' });

  try {
    await req.pool.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, req.user.id]);
    res.json({ success: true, message: 'Perfil actualizado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar perfil' });
  }
};
