const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  const { name, lastname, email, phone, password } = req.body;
  const pool = req.pool;

  try {
    console.log('Intentando registrar usuario:', req.body); // LOG

    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      console.error('Correo ya registrado:', email); // LOG
      return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, lastname, email, phone, password) VALUES (?, ?, ?, ?, ?)',
      [name, lastname, email, phone, hashedPassword]
    );
    console.log('Usuario registrado correctamente:', email); // LOG
    res.json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error('Error en registro usuario:', err); // LOG
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const pool = req.pool;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Correo o contraseña incorrectos' });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Correo o contraseña incorrectos' });
    }
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Error en login usuario:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};