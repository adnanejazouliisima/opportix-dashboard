const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'network-dashboard-secret-key-2024';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/opportix';

app.use(cors());
app.use(express.json());

/* ═══ MONGODB ═══ */
let db;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db();
  console.log('  ✅ MongoDB connecte');
  await seedIfEmpty();
}

async function seedIfEmpty() {
  const usersCount = await db.collection('users').countDocuments();
  if (usersCount === 0) {
    console.log('  📦 Base vide — import des donnees initiales...');
    // Seed users
    const usersFile = path.join(__dirname, 'users.json');
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
      users.forEach(u => {
        if (u.password === 'placeholder' || u.password.length < 20) {
          u.password = bcrypt.hashSync('opportix2025', 10);
        }
      });
      await db.collection('users').insertMany(users);
      console.log(`  → ${users.length} utilisateurs importes`);
    }
    // Seed fleet data
    const dataFile = path.join(__dirname, 'data.json');
    if (fs.existsSync(dataFile)) {
      const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
      await db.collection('data').insertOne({ _key: 'fleet', ...data });
      console.log('  → Donnees flotte importees');
    }
  }
}

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
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.collection('users').findOne({ username });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }
  const token = jwt.sign(
    { id: user.id || user._id, username: user.username, displayName: user.displayName, role: user.role, pole: user.pole },
    SECRET,
    { expiresIn: '12h' }
  );
  res.json({ token, user: { id: user.id || user._id, username: user.username, displayName: user.displayName, role: user.role, pole: user.pole } });
});

app.get('/api/me', auth, (req, res) => {
  res.json({ user: req.user });
});

/* ═══ DATA ROUTES ═══ */
app.get('/api/data', auth, async (req, res) => {
  const doc = await db.collection('data').findOne({ _key: 'fleet' });
  if (!doc) return res.json({ u: [], g: [], ga: [], dep: [], ret: [], di: [], va: [], pr: [], msgs: [] });
  const { _id, _key, ...data } = doc;
  res.json(data);
});

app.put('/api/data', auth, canEdit, async (req, res) => {
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
  await db.collection('data').updateOne({ _key: 'fleet' }, { $set: d }, { upsert: true });
  res.json({ ok: true });
});

app.post('/api/data/message', auth, async (req, res) => {
  await db.collection('data').updateOne(
    { _key: 'fleet' },
    { $push: { msgs: { ...req.body, id: Date.now() } } },
    { upsert: true }
  );
  res.json({ ok: true });
});

/* ═══ USER MANAGEMENT (Admin & Editeur) ═══ */
app.get('/api/users', auth, canManageUsers, async (req, res) => {
  const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
  res.json(users);
});

app.post('/api/users', auth, canManageUsers, async (req, res) => {
  const { username, displayName, role, pole, password } = req.body;
  const existing = await db.collection('users').findOne({ username });
  if (existing) {
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
  await db.collection('users').insertOne(newUser);
  res.json({ ...newUser, password: undefined });
});

app.delete('/api/users/:id', auth, canManageUsers, async (req, res) => {
  const userId = parseInt(req.params.id);
  const userToDelete = await db.collection('users').findOne({ id: userId });

  if (!userToDelete) return res.status(404).json({ error: 'Utilisateur non trouve' });
  if (req.user.role === 'editeur' && userToDelete.role === 'admin') {
    return res.status(403).json({ error: 'Un editeur ne peut pas supprimer un compte admin' });
  }

  await db.collection('users').deleteOne({ id: userId });
  res.json({ ok: true });
});

app.put('/api/users/:id/password', auth, async (req, res) => {
  const userId = parseInt(req.params.id);
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({ error: 'Non autorise' });
  }
  const user = await db.collection('users').findOne({ id: userId });
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouve' });
  await db.collection('users').updateOne({ id: userId }, { $set: { password: bcrypt.hashSync(req.body.password, 10) } });
  res.json({ ok: true });
});

app.put('/api/users/:id/role', auth, canManageUsers, async (req, res) => {
  const userId = parseInt(req.params.id);
  const user = await db.collection('users').findOne({ id: userId });
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouve' });

  if (req.user.role === 'editeur') {
    if (req.body.role === 'admin' || user.role === 'admin') {
      return res.status(403).json({ error: 'Action non autorisee pour un editeur' });
    }
  }

  await db.collection('users').updateOne({ id: userId }, { $set: { role: req.body.role } });
  res.json({ ok: true });
});

/* ═══ SERVE FRONTEND (production) ═══ */
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

/* ═══ START ═══ */
async function startServer() {
  try {
    await connectDB();
  } catch (err) {
    console.error('  ❌ MongoDB connexion echouee:', err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ✅ OPPORTIX Dashboard API`);
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
