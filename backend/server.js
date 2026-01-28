require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'changez-moi-en-production';

// Middleware
app.use(cors());
app.use(express.json());

// Initialisation de la base de données
const db = new Database(process.env.DB_PATH || './database.sqlite');
db.pragma('journal_mode = WAL');

// Création des tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'approved',
    player_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
  );

  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    level_official TEXT,
    level_apero INTEGER DEFAULT 0,
    rating_technical INTEGER DEFAULT 0,
    avatar TEXT,
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    win_rate INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    location TEXT,
    max_participants INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS event_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE(event_id, player_id)
  );

  CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    format TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'À venir',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tournament_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE(tournament_id, player_id)
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    author_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
  );
`);

// Créer le premier admin s'il n'existe pas
const createDefaultAdmin = () => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    console.log('⚠️  Aucun utilisateur trouvé. Création du compte administrateur par défaut...');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (email, password, name, role, status)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin@badminton.club', hashedPassword, 'Administrateur', 'admin', 'approved');
    console.log('✅ Compte admin créé : admin@badminton.club / admin123');
    console.log('⚠️  CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT !');
  }
};

createDefaultAdmin();

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Middleware admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès administrateur requis' });
  }
  next();
};

// ============ ROUTES AUTH ============

// Connexion uniquement (inscription supprimée)
app.post('/api/auth/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ error: 'Compte non approuvé' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, player_id: user.player_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Vérifier le token
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, status, player_id FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// Changer son propre mot de passe
app.post('/api/auth/change-password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, req.user.id);

    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============ ROUTES USERS (Admin uniquement) ============

// Créer un utilisateur (ADMIN ONLY)
app.post('/api/users', authenticateToken, requireAdmin, [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
  body('role').isIn(['admin', 'member'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, name, role, player_id } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = db.prepare(`
      INSERT INTO users (email, password, name, role, status, player_id)
      VALUES (?, ?, ?, ?, 'approved', ?)
    `);

    const result = stmt.run(email, hashedPassword, name, role, player_id || null);

    const user = db.prepare('SELECT id, email, name, role, status, player_id FROM users WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Lister tous les utilisateurs (ADMIN ONLY)
app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.email, u.name, u.role, u.status, u.player_id, u.created_at,
           p.name as player_name
    FROM users u
    LEFT JOIN players p ON u.player_id = p.id
  `).all();
  res.json(users);
});

// Modifier un utilisateur (ADMIN ONLY)
app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, name, role, player_id, password } = req.body;
    
    let updateQuery = 'UPDATE users SET email = ?, name = ?, role = ?, player_id = ?';
    let params = [email, name, role, player_id || null];
    
    if (password && password.length >= 6) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(req.params.id);
    
    db.prepare(updateQuery).run(...params);
    
    const user = db.prepare('SELECT id, email, name, role, status, player_id FROM users WHERE id = ?').get(req.params.id);
    res.json(user);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un utilisateur (ADMIN ONLY)
app.delete('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
  // Ne pas permettre de supprimer le dernier admin
  const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get();
  const userToDelete = db.prepare('SELECT role FROM users WHERE id = ?').get(req.params.id);
  
  if (adminCount.count === 1 && userToDelete.role === 'admin') {
    return res.status(400).json({ error: 'Impossible de supprimer le dernier administrateur' });
  }

  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ message: 'Utilisateur supprimé' });
});

// ============ ROUTES PLAYERS ============

// Lister tous les joueurs (ADMIN) ou son propre joueur (MEMBER)
app.get('/api/players', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    const players = db.prepare('SELECT * FROM players ORDER BY created_at DESC').all();
    res.json(players);
  } else {
    // Les membres ne voient que leur propre fiche
    if (!req.user.player_id) {
      return res.json([]);
    }
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.user.player_id);
    res.json(player ? [player] : []);
  }
});

// Créer un joueur (ADMIN ONLY)
app.post('/api/players', authenticateToken, requireAdmin, (req, res) => {
  const { name, email, phone, level_official, level_apero, rating_technical, avatar } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO players (name, email, phone, level_official, level_apero, rating_technical, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(name, email, phone || null, level_official || null, level_apero || 0, rating_technical || 0, avatar || null);
  
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(player);
});

// Modifier un joueur (ADMIN ou le joueur lui-même)
app.put('/api/players/:id', authenticateToken, (req, res) => {
  // Vérifier les permissions
  if (req.user.role !== 'admin' && req.user.player_id !== parseInt(req.params.id)) {
    return res.status(403).json({ error: 'Vous ne pouvez modifier que votre propre fiche' });
  }

  const { name, email, phone, level_official, level_apero, rating_technical, avatar, matches_played, wins } = req.body;
  
  const losses = matches_played - wins;
  const win_rate = matches_played > 0 ? Math.round((wins / matches_played) * 100) : 0;
  
  const stmt = db.prepare(`
    UPDATE players 
    SET name = ?, email = ?, phone = ?, level_official = ?, level_apero = ?, rating_technical = ?, 
        avatar = ?, matches_played = ?, wins = ?, losses = ?, win_rate = ?
    WHERE id = ?
  `);
  
  stmt.run(name, email, phone, level_official, level_apero, rating_technical, avatar, 
           matches_played, wins, losses, win_rate, req.params.id);
  
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  res.json(player);
});

// Supprimer un joueur (ADMIN ONLY)
app.delete('/api/players/:id', authenticateToken, requireAdmin, (req, res) => {
  const stmt = db.prepare('DELETE FROM players WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ message: 'Joueur supprimé' });
});

// ============ ROUTES EVENTS ============

app.get('/api/events', authenticateToken, (req, res) => {
  const events = db.prepare('SELECT * FROM events ORDER BY date DESC').all();
  
  // Récupérer les participants pour chaque événement
  events.forEach(event => {
    const participants = db.prepare(`
      SELECT player_id FROM event_participants WHERE event_id = ?
    `).all(event.id);
    event.participants = participants.map(p => p.player_id);
  });
  
  res.json(events);
});

app.post('/api/events', authenticateToken, requireAdmin, (req, res) => {
  const { name, date, description, location, max_participants } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO events (name, date, description, location, max_participants)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(name, date, description || null, location || null, max_participants || null);
  
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  event.participants = [];
  res.status(201).json(event);
});

app.delete('/api/events/:id', authenticateToken, requireAdmin, (req, res) => {
  const stmt = db.prepare('DELETE FROM events WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ message: 'Événement supprimé' });
});

// Inscrire un joueur à un événement (ADMIN ou le joueur lui-même)
app.post('/api/events/:id/register/:playerId', authenticateToken, (req, res) => {
  // Vérifier les permissions
  if (req.user.role !== 'admin' && req.user.player_id !== parseInt(req.params.playerId)) {
    return res.status(403).json({ error: 'Vous ne pouvez inscrire que vous-même' });
  }

  try {
    const stmt = db.prepare('INSERT INTO event_participants (event_id, player_id) VALUES (?, ?)');
    stmt.run(req.params.id, req.params.playerId);
    res.json({ message: 'Inscription réussie' });
  } catch (error) {
    res.status(400).json({ error: 'Déjà inscrit ou erreur' });
  }
});

// Désinscrire un joueur d'un événement (ADMIN ou le joueur lui-même)
app.delete('/api/events/:id/unregister/:playerId', authenticateToken, (req, res) => {
  // Vérifier les permissions
  if (req.user.role !== 'admin' && req.user.player_id !== parseInt(req.params.playerId)) {
    return res.status(403).json({ error: 'Vous ne pouvez désinscrire que vous-même' });
  }

  const stmt = db.prepare('DELETE FROM event_participants WHERE event_id = ? AND player_id = ?');
  stmt.run(req.params.id, req.params.playerId);
  res.json({ message: 'Désinscription réussie' });
});

// ============ ROUTES TOURNAMENTS ============

app.get('/api/tournaments', authenticateToken, (req, res) => {
  const tournaments = db.prepare('SELECT * FROM tournaments ORDER BY date DESC').all();
  
  tournaments.forEach(tournament => {
    const participants = db.prepare(`
      SELECT player_id FROM tournament_participants WHERE tournament_id = ?
    `).all(tournament.id);
    tournament.participants = participants.map(p => p.player_id);
  });
  
  res.json(tournaments);
});

app.post('/api/tournaments', authenticateToken, requireAdmin, (req, res) => {
  const { name, date, format, description } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO tournaments (name, date, format, description, status)
    VALUES (?, ?, ?, ?, 'À venir')
  `);
  
  const result = stmt.run(name, date, format, description || null);
  
  const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(result.lastInsertRowid);
  tournament.participants = [];
  res.status(201).json(tournament);
});

app.patch('/api/tournaments/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  const stmt = db.prepare('UPDATE tournaments SET status = ? WHERE id = ?');
  stmt.run(status, req.params.id);
  res.json({ message: 'Statut mis à jour' });
});

app.delete('/api/tournaments/:id', authenticateToken, requireAdmin, (req, res) => {
  const stmt = db.prepare('DELETE FROM tournaments WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ message: 'Tournoi supprimé' });
});

// Inscrire un joueur à un tournoi (ADMIN ou le joueur lui-même)
app.post('/api/tournaments/:id/register/:playerId', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.player_id !== parseInt(req.params.playerId)) {
    return res.status(403).json({ error: 'Vous ne pouvez inscrire que vous-même' });
  }

  try {
    const stmt = db.prepare('INSERT INTO tournament_participants (tournament_id, player_id) VALUES (?, ?)');
    stmt.run(req.params.id, req.params.playerId);
    res.json({ message: 'Inscription réussie' });
  } catch (error) {
    res.status(400).json({ error: 'Déjà inscrit ou erreur' });
  }
});

app.delete('/api/tournaments/:id/unregister/:playerId', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.player_id !== parseInt(req.params.playerId)) {
    return res.status(403).json({ error: 'Vous ne pouvez désinscrire que vous-même' });
  }

  const stmt = db.prepare('DELETE FROM tournament_participants WHERE tournament_id = ? AND player_id = ?');
  stmt.run(req.params.id, req.params.playerId);
  res.json({ message: 'Désinscription réussie' });
});

// ============ ROUTES NEWS ============

app.get('/api/news', authenticateToken, (req, res) => {
  const news = db.prepare(`
    SELECT n.*, u.name as author_name 
    FROM news n 
    LEFT JOIN users u ON n.author_id = u.id 
    ORDER BY n.created_at DESC
  `).all();
  res.json(news);
});

app.post('/api/news', authenticateToken, requireAdmin, (req, res) => {
  const { title, content, image } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO news (title, content, image, author_id)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(title, content, image || null, req.user.id);
  
  const newsItem = db.prepare('SELECT * FROM news WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newsItem);
});

app.delete('/api/news/:id', authenticateToken, requireAdmin, (req, res) => {
  const stmt = db.prepare('DELETE FROM news WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ message: 'Actualité supprimée' });
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
  console.log(`📊 Base de données: ${process.env.DB_PATH || './database.sqlite'}`);
});
