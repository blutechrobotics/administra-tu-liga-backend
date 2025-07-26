require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const authRoutes = require('./routes/authRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const teamRoutes = require('./routes/teamRoutes');
const matchRoutes = require('./routes/matchRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

(async () => {
  try {
 const pool = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, // <-- AGREGA ESTA LÍNEA
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
    });

    app.locals.pool = pool;
    console.log('✅ Conexión a la base de datos establecida');

    // Middleware para inyectar pool en cada request
    app.use((req, res, next) => {
      req.pool = pool;
      next();
    });

    // Rutas públicas
    app.get('/', (req, res) => res.json({ success: true, message: 'Backend funcionando 🔥' }));

    // Rutas protegidas (¡Mueve aquí las rutas!)
    app.use('/api/auth', authRoutes);
    app.use('/api/tournaments', tournamentRoutes);
    app.use('/api/teams', teamRoutes);
    app.use('/api/matches', matchRoutes);
    app.use('/api/user', userRoutes);

    // Middleware de manejo de errores
    app.use((err, req, res, next) => {
      console.error('❌ Error global:', err);
      res.status(500).json({ success: false, error: 'Error en el servidor' });
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    process.exit(1);
  }
})();