const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'network-dashboard-secret-key-2024';

app.use(cors());
app.use(express.json());

/* ═══ FILE HELPERS ═══ */
const USERS_FILE = path.join(__dirname, 'users.json');
const DATA_FILE = path.join(__dirname, 'data.json');

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

/* ═══ INIT: Hash default passwords on first run ═══ */
(function initUsers() {
  const users = readJSON(USERS_FILE);
  let changed = false;
  users.forEach(u => {
    if (u.password === 'placeholder' || u.password.length < 20) {
      u.password = bcrypt.hashSync('opportix2025', 10);
      changed = true;
    }
  });
  if (changed) writeJSON(USERS_FILE, users);
})();

/* ═══ AUTH MIDDLEWARE ═══ */
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non autorise' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

function canManageUsers(req, res, next) {
  if (req.user.role === 'lecteur') return res.status(403).json({ error: 'Admin ou Editeur requis' });
  next();
}

function canEdit(req, res, next) {
  if (req.user.role === 'lecteur') return res.status(403).json({ error: 'Modification non autorisee' });
  next();
}

/* ═══ AUTH ROUTES ═══ */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }
  const token = jwt.sign(
    { id: user.id, username: user.username, displayName: user.displayName, role: user.role, pole: user.pole },
    SECRET,
    { expiresIn: '12h' }
  );
  res.json({ token, user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role, pole: user.pole } });
});

app.get('/api/me', auth, (req, res) => {
  res.json({ user: req.user });
});

/* ═══ DATA ROUTES ═══ */
app.get('/api/data', auth, (req, res) => {
  const data = readJSON(DATA_FILE);
  res.json(data);
});

app.put('/api/data', auth, canEdit, (req, res) => {
  const d = req.body;
  const validKeys = ['u', 'g', 'ga', 'dep', 'ret', 'di', 'va', 'pr', 'msgs'];
  if (!d || typeof d !== 'object' || Array.isArray(d)) {
    return res.status(400).json({ error: 'Corps de requete invalide' });
  }
  for (const key of Object.keys(d)) {
    if (!validKeys.includes(key)) {
      return res.status(400).json({ error: `Cle non autorisee: ${key}` });
    }
    if (!Array.isArray(d[key])) {
      return res.status(400).json({ error: `La cle "${key}" doit etre un tableau` });
    }
  }
  writeJSON(DATA_FILE, d);
  res.json({ ok: true });
});

app.post('/api/data/message', auth, (req, res) => {
  const data = readJSON(DATA_FILE);
  data.msgs = data.msgs || [];
  data.msgs.push({ ...req.body, id: Date.now() });
  writeJSON(DATA_FILE, data);
  res.json({ ok: true });
});

/* ═══ USER MANAGEMENT (Admin & Editeur) ═══ */
app.get('/api/users', auth, canManageUsers, (req, res) => {
  const users = readJSON(USERS_FILE).map(u => ({ ...u, password: undefined }));
  res.json(users);
});

app.post('/api/users', auth, canManageUsers, (req, res) => {
  const users = readJSON(USERS_FILE);
  const { username, displayName, role, pole, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Nom utilisateur deja pris' });
  }

  let finalRole = role || 'lecteur';
  if (req.user.role === 'editeur' && finalRole === 'admin') {
    return res.status(403).json({ error: 'Un editeur ne peut pas creer un compte admin' });
  }

  const newUser = {
    id: Date.now(),
    username,
    displayName,
    role: finalRole,
    pole: pole || 'activite',
    password: bcrypt.hashSync(password || 'opportix2025', 10)
  };
  users.push(newUser);
  writeJSON(USERS_FILE, users);
  res.json({ ...newUser, password: undefined });
});

app.delete('/api/users/:id', auth, canManageUsers, (req, res) => {
  let users = readJSON(USERS_FILE);
  const userToDelete = users.find(u => u.id === parseInt(req.params.id));
  
  if (!userToDelete) return res.status(404).json({ error: 'Utilisateur non trouve' });
  if (req.user.role === 'editeur' && userToDelete.role === 'admin') {
    return res.status(403).json({ error: 'Un editeur ne peut pas supprimer un compte admin' });
  }

  users = users.filter(u => u.id !== parseInt(req.params.id));
  writeJSON(USERS_FILE, users);
  res.json({ ok: true });
});

app.put('/api/users/:id/password', auth, (req, res) => {
  const users = readJSON(USERS_FILE);
  const userId = parseInt(req.params.id);
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({ error: 'Non autorise' });
  }
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouve' });
  user.password = bcrypt.hashSync(req.body.password, 10);
  writeJSON(USERS_FILE, users);
  res.json({ ok: true });
});

app.put('/api/users/:id/role', auth, canManageUsers, (req, res) => {
  const users = readJSON(USERS_FILE);
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouve' });

  // Safety: Editors cannot change roles to admin, and cannot change an admin's role.
  if (req.user.role === 'editeur') {
    if (req.body.role === 'admin' || user.role === 'admin') {
      return res.status(403).json({ error: 'Action non autorisee pour un editeur' });
    }
  }

  user.role = req.body.role;
  writeJSON(USERS_FILE, users);
  res.json({ ok: true });
});

/* ═══ SERVE FRONTEND (production) ═══ */
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

function startServer() {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ✅ NETWORK Dashboard API`);
    console.log(`  → Local:   http://localhost:${PORT}`);
    const nets = require('os').networkInterfaces();
    Object.values(nets).flat().filter(n => n.family === 'IPv4' && !n.internal).forEach(n => {
      console.log(`  → Reseau:  http://${n.address}:${PORT}`);
    });
    console.log(`\n  Comptes par defaut:`);
    console.log(`  → (username) / opportix2025\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`  ⚠️  Port ${PORT} occupé — libération en cours...`);
      const { execSync } = require('child_process');
      try {
        if (process.platform === 'win32') {
          const out = execSync(`netstat -ano | findstr :${PORT}`).toString();
          const line = out.split('\n').find(l => l.includes('LISTENING'));
          if (line) {
            const pid = line.trim().split(/\s+/).pop();
            execSync(`taskkill /F /PID ${pid}`);
          }
        } else {
          execSync(`fuser -k ${PORT}/tcp`);
        }
        console.log(`  ✅ Port libéré — redémarrage...`);
        setTimeout(startServer, 500);
      } catch (e) {
        console.error(`  ❌ Impossible de libérer le port ${PORT}`);
        process.exit(1);
      }
    }
  });
}

startServer();
