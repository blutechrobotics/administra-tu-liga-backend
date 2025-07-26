require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    const pool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 20665, // <-- AGREGA ESTA LÍNEA
    });

    const [rows] = await pool.query('SELECT 1');
    console.log('✅ Conexión exitosa:', rows);
  } catch (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
  }
})();