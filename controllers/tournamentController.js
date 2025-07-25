exports.createTournament = async (req, res) => {
  const pool = req.pool;
  const { name, location, startDate, endDate, type, format, matchDays, qualifiedTeams } = req.body;
  const user_id = req.user.id; // <-- Aquí obtienes el id del usuario autenticado
  try {
    const [result] = await pool.query(
      'INSERT INTO tournaments (name, location, start_date, end_date, type, format, match_days, qualified_teams, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, location, startDate, endDate, type, format, matchDays, qualifiedTeams, user_id]
    );
    res.json({ success: true, tournamentId: result.insertId });
  } catch (err) {
    console.error('Error al crear torneo:', err);
    res.status(500).json({ success: false, message: 'Error al crear torneo' });
  }
};

exports.generateMatches = async (req, res) => {
  const tournamentId = req.params.id;
  const pool = req.pool;
  try {
    // Obtener equipos
    const [teams] = await pool.query('SELECT id, name FROM teams WHERE tournament_id = ?', [tournamentId]);
    // Obtener jornadas
    const [tournamentRows] = await pool.query('SELECT match_days FROM tournaments WHERE id = ?', [tournamentId]);
    if (!tournamentRows.length) return res.status(404).json({ success: false, message: 'Torneo no encontrado' });
    const jornadas = tournamentRows[0].match_days;

    // Obtener partidos existentes
    const [matches] = await pool.query('SELECT teamA, teamB FROM matches WHERE tournament_id = ?', [tournamentId]);
    const existingPairs = new Set(matches.map(m => [m.teamA, m.teamB].sort().join('-')));

    // Generar todos los pares posibles sin repetir
    let pairs = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const key = [teams[i].name, teams[j].name].sort().join('-');
        if (!existingPairs.has(key)) pairs.push([teams[i].name, teams[j].name]);
      }
    }

    // Mezclar aleatoriamente
    pairs = pairs.sort(() => Math.random() - 0.5);

    // Tomar solo los necesarios para las jornadas
    const partidosPorJornada = Math.floor(teams.length / 2);
    const totalPartidos = jornadas * partidosPorJornada;
    const selectedPairs = pairs.slice(0, totalPartidos);

    // Crear partidos
    for (const [teamA, teamB] of selectedPairs) {
      await pool.query(
        'INSERT INTO matches (tournament_id, teamA, teamB, date, goalsA, goalsB) VALUES (?, ?, ?, NULL, 0, 0)',
        [tournamentId, teamA, teamB]
      );
    }

    res.json({ success: true, created: selectedPairs.length });
  } catch (err) {
    console.error('Error al generar partidos:', err);
    res.status(500).json({ success: false, message: 'Error al generar partidos.' });
  }
};

exports.getTournamentById = async (req, res) => {
  const pool = req.pool;
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tournaments WHERE id = ? AND user_id = ?',
      [id, user_id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Torneo no encontrado' });

    // Opcional: obtener equipos y otros datos relacionados
    const [teams] = await pool.query('SELECT * FROM teams WHERE tournament_id = ?', [id]);
    res.json({ success: true, tournament: { ...rows[0], teams } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener torneo' });
  }
};

exports.getTournaments = async (req, res) => {
  const pool = req.pool;
  const user_id = req.user.id;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tournaments WHERE user_id = ? ORDER BY start_date DESC',
      [user_id]
    );
    res.json({ success: true, tournaments: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener torneos' });
  }
};

exports.deleteTournament = async (req, res) => {
  const pool = req.pool;
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    // Opcional: elimina equipos, partidos, etc. relacionados antes si tu base de datos no tiene ON DELETE CASCADE
    await pool.query('DELETE FROM tournaments WHERE id = ? AND user_id = ?', [id, user_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar torneo' });
  }
};