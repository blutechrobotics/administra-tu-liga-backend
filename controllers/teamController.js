exports.createTeam = async (req, res) => {
  const { name, tournamentId, players } = req.body;
  const userId = req.user.id;
  const pool = req.pool;

  try {
    // Verifica que el torneo pertenezca al usuario
    const [tournamentRows] = await pool.query(
      'SELECT * FROM tournaments WHERE id = ? AND user_id = ?',
      [tournamentId, userId]
    );
    if (tournamentRows.length === 0) {
      return res.status(403).json({ success: false, message: 'No autorizado para agregar equipos a este torneo.' });
    }

    // Crea el equipo
    const [teamResult] = await pool.query(
      'INSERT INTO teams (name, tournament_id) VALUES (?, ?)',
      [name, tournamentId]
    );
    const teamId = teamResult.insertId;

    // Agrega jugadores si existen
    if (Array.isArray(players) && players.length > 0) {
      const playerValues = players
        .filter(p => p.name && p.lastName && p.number)
        .map(p => [p.name, p.lastName, p.number, teamId]);
      if (playerValues.length > 0) {
        await pool.query(
          'INSERT INTO players (name, last_name, number, team_id) VALUES ?',
          [playerValues]
        );
      }
    }

    res.json({ success: true, teamId });
  } catch (err) {
    console.error('Error al crear equipo:', err);
    res.status(500).json({ success: false, message: 'Error al crear equipo.' });
  }
};

exports.getTeamsByTournament = async (req, res) => {
  const { tournamentId } = req.params;
  const userId = req.user.id;
  const pool = req.pool;

  try {
    // Verifica que el torneo pertenezca al usuario
    const [tournamentRows] = await pool.query(
      'SELECT * FROM tournaments WHERE id = ? AND user_id = ?',
      [tournamentId, userId]
    );
    if (tournamentRows.length === 0) {
      return res.status(403).json({ success: false, message: 'No autorizado.' });
    }

    // Obtiene equipos y jugadores
    const [teams] = await pool.query(
      'SELECT * FROM teams WHERE tournament_id = ?',
      [tournamentId]
    );
    for (const team of teams) {
      const [players] = await pool.query(
        'SELECT * FROM players WHERE team_id = ?',
        [team.id]
      );
      team.players = players;
    }

    res.json({ success: true, teams });
  } catch (err) {
    console.error('Error al obtener equipos:', err);
    res.status(500).json({ success: false, message: 'Error al obtener equipos.' });
  }
};

exports.updateTeam = async (req, res) => {
  const { name } = req.body;
  const pool = req.pool;
  try {
    await pool.query(
      'UPDATE teams SET name = ? WHERE id = ?',
      [name, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar equipo.' });
  }
};

exports.deleteTeam = async (req, res) => {
  const pool = req.pool;
  try {
    await pool.query('DELETE FROM teams WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar equipo.' });
  }
};

// JUGADORES
exports.addPlayer = async (req, res) => {
  const { name, lastName, number } = req.body;
  const pool = req.pool;
  try {
    const [result] = await pool.query(
      'INSERT INTO players (name, last_name, number, team_id) VALUES (?, ?, ?, ?)',
      [name, lastName, number, req.params.teamId]
    );
    res.json({ success: true, playerId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al agregar jugador.' });
  }
};

exports.updatePlayer = async (req, res) => {
  const { name, lastName, number } = req.body;
  const pool = req.pool;
  try {
    await pool.query(
      'UPDATE players SET name = ?, last_name = ?, number = ? WHERE id = ? AND team_id = ?',
      [name, lastName, number, req.params.playerId, req.params.teamId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar jugador.' });
  }
};

exports.deletePlayer = async (req, res) => {
  const pool = req.pool;
  try {
    await pool.query(
      'DELETE FROM players WHERE id = ? AND team_id = ?',
      [req.params.playerId, req.params.teamId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar jugador.' });
  }
};