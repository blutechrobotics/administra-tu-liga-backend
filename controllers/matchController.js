exports.createMatch = async (req, res) => {
  const { tournamentId, teamA, teamB, date, goalsA, goalsB, goals } = req.body;
  const pool = req.pool;
  try {
    const [result] = await pool.query(
      'INSERT INTO matches (tournament_id, teamA, teamB, date, goalsA, goalsB) VALUES (?, ?, ?, ?, ?, ?)',
      [tournamentId, teamA, teamB, date, goalsA, goalsB]
    );
    const matchId = result.insertId;

    // Registrar goles (opcional, si envías array de goles)
    if (Array.isArray(goals)) {
      for (const goal of goals) {
        await pool.query(
          'INSERT INTO match_goals (match_id, player_id) VALUES (?, ?)',
          [matchId, goal.playerId]
        );
      }
    }

    res.json({ success: true, matchId });
  } catch (err) {
    console.error('Error al crear partido:', err);
    res.status(500).json({ success: false, message: 'Error al crear partido.' });
  }
};

exports.getMatchesByTournament = async (req, res) => {
  const { tournamentId } = req.params;
  const pool = req.pool;
  try {
    const [matches] = await pool.query(
      'SELECT * FROM matches WHERE tournament_id = ?',
      [tournamentId]
    );
    // Obtener goles por partido
    for (const match of matches) {
      const [goals] = await pool.query(
        'SELECT player_id FROM match_goals WHERE match_id = ?',
        [match.id]
      );
      match.goals = goals;
    }
    res.json({ success: true, matches });
  } catch (err) {
    console.error('Error al obtener partidos:', err);
    res.status(500).json({ success: false, message: 'Error al obtener partidos.' });
  }
};

exports.updateMatch = async (req, res) => {
  const { teamA, teamB, date, goalsA, goalsB, goals } = req.body;
  const pool = req.pool;
  try {
    await pool.query(
      'UPDATE matches SET teamA = ?, teamB = ?, date = ?, goalsA = ?, goalsB = ? WHERE id = ?',
      [teamA, teamB, date, goalsA, goalsB, req.params.id]
    );
    // Actualizar goles
    await pool.query('DELETE FROM match_goals WHERE match_id = ?', [req.params.id]);
    if (Array.isArray(goals)) {
      for (const goal of goals) {
        await pool.query(
          'INSERT INTO match_goals (match_id, player_id) VALUES (?, ?)',
          [req.params.id, goal.playerId]
        );
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar partido:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar partido.' });
  }
};

exports.deleteMatch = async (req, res) => {
  const pool = req.pool;
  try {
    await pool.query('DELETE FROM matches WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar partido:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar partido.' });
  }
};