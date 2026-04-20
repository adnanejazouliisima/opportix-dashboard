const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const http = require('http');
const { Server: SocketServer } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'network-dashboard-secret-key-2024';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/opportix';

/* ═══ CORS — only allow own origin in production ═══ */
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
    else cb(null, true); // Allow in production since frontend is served from same origin
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

/* ═══ SOCKET.IO ═══ */
const io = new SocketServer(httpServer, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  socket.on('auth', (token) => {
    try { socket.user = jwt.verify(token, SECRET); socket.join('authed'); }
    catch { socket.disconnect(); }
  });
});
function broadcast() { io.to('authed').emit('data-changed'); }

/* ═══ RATE LIMITING ═══ */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: 'Trop de tentatives — reessayez dans 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  message: { error: 'Trop de requetes — reessayez dans une minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

/* ═══ MONGODB ═══ */
let db;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db();
  console.log('  ✅ MongoDB connecte');
  // Create indexes for performance
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
  await db.collection('users').createIndex({ id: 1 });
  await db.collection('data').createIndex({ _key: 1 });
  await db.collection('audit').createIndex({ ts: -1 });
  await db.collection('archive').createIndex({ deletedAt: -1 });
  await db.collection('snapshots').createIndex({ weekLabel: 1 }, { unique: true });

  await seedIfEmpty();
  await runMigrations();
}

async function seedIfEmpty() {
  const usersCount = await db.collection('users').countDocuments();
  if (usersCount === 0) {
    console.log('  📦 Base vide — import des donnees initiales...');
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
    const dataFile = path.join(__dirname, 'data.json');
    if (fs.existsSync(dataFile)) {
      const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
      await db.collection('data').insertOne({ _key: 'fleet', ...data });
      console.log('  → Donnees flotte importees');
    }
  }
}

async function runMigrations() {
  const result = await db.collection('users').updateOne(
    { username: 'yannis', role: { $ne: 'admin' } },
    { $set: { role: 'admin' } }
  );
  if (result.modifiedCount > 0) console.log('  → yannis promu admin');
}

/* ═══ AUDIT LOGGING ═══ */
async function audit(user, action, details) {
  try {
    await db.collection('audit').insertOne({
      ts: new Date(),
      user: user?.username || 'system',
      role: user?.role || 'system',
      action,
      details,
    });
  } catch (e) { /* don't break the app if audit fails */ }
}

/* ═══ WEEKLY SNAPSHOTS ═══ */
function getISOWeekLabel(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getWeekDateRange(weekLabel) {
  const [y, w] = weekLabel.split('-W').map(Number);
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (jan4.getUTCDay() || 7) + 1 + (w - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const fmt = d => `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}`;
  return { from: fmt(monday), to: fmt(sunday) };
}

async function takeSnapshot(triggeredBy = 'auto') {
  const doc = await db.collection('data').findOne({ _key: 'fleet' });
  if (!doc) return null;
  const { _id, _key, ...data } = doc;
  const weekLabel = getISOWeekLabel();
  const range = getWeekDateRange(weekLabel);
  const snapshot = { weekLabel, ...range, createdAt: new Date(), createdBy: triggeredBy, ...data };
  await db.collection('snapshots').replaceOne({ weekLabel }, snapshot, { upsert: true });
  await audit({ username: triggeredBy }, 'snapshot_created', { weekLabel });
  return weekLabel;
}

/* ═══ AUTH MIDDLEWARE ═══ */
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non autorise' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expiree', expired: true });
    }
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

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin requis' });
  next();
}

/* ═══ HEALTH CHECK ═══ */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

/* ═══ AUTH ROUTES ═══ */
app.post('/api/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
  }
  const user = await db.collection('users').findOne({ username });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    await audit({ username }, 'login_failed', { ip: req.ip });
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }
  const token = jwt.sign(
    { id: user.id || user._id, username: user.username, displayName: user.displayName, role: user.role, pole: user.pole },
    SECRET,
    { expiresIn: '12h' }
  );
  await audit(user, 'login', { ip: req.ip });
  res.json({ token, user: { id: user.id || user._id, username: user.username, displayName: user.displayName, role: user.role, pole: user.pole } });
});

app.get('/api/me', auth, (req, res) => {
  res.json({ user: req.user });
});

/* ═══ DATA ROUTES ═══ */
app.get('/api/data', auth, async (req, res) => {
  const doc = await db.collection('data').findOne({ _key: 'fleet' });
  if (!doc) return res.json({ u: [], g: [], ga: [], dep: [], ret: [], di: [], va: [], pr: [], dpv: [], rpv: [], msgs: [] });
  const { _id, _key, ...data } = doc;
  res.json(data);
});

app.put('/api/data', auth, canEdit, async (req, res) => {
  const d = req.body;
  const validKeys = ['u', 'g', 'ga', 'dep', 'ret', 'di', 'va', 'pr', 'dpv', 'rpv', 'msgs'];
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
  await audit(req.user, 'data_update', { keys: Object.keys(d) });
  // Auto-update current week's snapshot on every save
  takeSnapshot(req.user.username).catch(() => {});
  broadcast();
  res.json({ ok: true });
});

app.post('/api/data/message', auth, async (req, res) => {
  const { tx } = req.body;
  if (!tx || typeof tx !== 'string' || tx.length > 2000) {
    return res.status(400).json({ error: 'Message invalide (max 2000 caracteres)' });
  }
  await db.collection('data').updateOne(
    { _key: 'fleet' },
    { $push: { msgs: { ...req.body, id: crypto.randomUUID() } } },
    { upsert: true }
  );
  takeSnapshot(req.user.username).catch(() => {});
  broadcast();
  res.json({ ok: true });
});

/* ═══ ARCHIVE (soft delete) ═══ */
app.post('/api/archive', auth, canEdit, async (req, res) => {
  const { section, item } = req.body;
  if (!section || !item) return res.status(400).json({ error: 'Section et item requis' });
  await db.collection('archive').insertOne({
    section,
    item,
    deletedBy: req.user.username,
    deletedAt: new Date(),
  });
  await audit(req.user, 'item_archived', { section, im: item.im || item.nom || item.ch || '?' });
  res.json({ ok: true });
});

app.get('/api/archive', auth, adminOnly, async (req, res) => {
  const items = await db.collection('archive').find().sort({ deletedAt: -1 }).limit(200).toArray();
  res.json(items);
});

/* ═══ DRIVER HISTORY ═══ */
app.get('/api/history', auth, async (req, res) => {
  const doc = await db.collection('data').findOne({ _key: 'fleet' });
  const data = doc || {};
  const archives = await db.collection('archive').find({ section: { $in: ['deps', 'rets'] } }).toArray();
  // Combine current + archived departures and returns
  const deps = [...(data.dep || []).map(d => ({ ...d, _src: 'current' })), ...archives.filter(a => a.section === 'deps').map(a => ({ ...a.item, _src: 'archive' }))];
  const rets = [...(data.ret || []).map(d => ({ ...d, _src: 'current' })), ...archives.filter(a => a.section === 'rets').map(a => ({ ...a.item, _src: 'archive' }))];
  // Build driver history: group by driver name
  const drivers = {};
  deps.forEach(d => {
    if (!d.ch) return;
    const name = d.ch.toUpperCase().trim();
    if (!drivers[name]) drivers[name] = [];
    drivers[name].push({ type: 'depart', im: d.im, soc: d.soc, mo: d.mo || '', le: d.le || '', dt: d.dt || '', no: d.no || '' });
  });
  rets.forEach(d => {
    if (!d.ch) return;
    const name = d.ch.toUpperCase().trim();
    if (!drivers[name]) drivers[name] = [];
    drivers[name].push({ type: 'retour', im: d.im, soc: d.soc, mo: d.mo || '', dt: d.dt || '', no: d.no || '' });
  });
  // Also add current vehicle assignment from fleet
  const fleet = [...(data.u || []), ...(data.g || [])];
  fleet.forEach(v => {
    if (!v.ch || v.ch === 'BUREAU' || v.ch.startsWith('GARAGE')) return;
    const name = v.ch.toUpperCase().trim();
    if (!drivers[name]) drivers[name] = [];
    const hasVeh = drivers[name].find(e => e.im === v.im && e.type === 'vehicule_actuel');
    if (!hasVeh) drivers[name].push({ type: 'vehicule_actuel', im: v.im, soc: (data.u || []).find(u => u.im === v.im) ? 'URBAN NEO' : 'GREEN', mo: v.mo || '', mq: v.mq || '', le: v.le || '', st: v.st });
  });
  res.json(drivers);
});

/* ═══ CSV EXPORT ═══ */
app.get('/api/export/csv', auth, async (req, res) => {
  let doc;
  if (req.query.week) {
    doc = await db.collection('snapshots').findOne({ weekLabel: req.query.week });
    if (!doc) return res.status(404).json({ error: 'Snapshot non trouve pour cette semaine' });
  } else {
    doc = await db.collection('data').findOne({ _key: 'fleet' });
  }
  if (!doc) return res.status(404).json({ error: 'Aucune donnee' });

  const section = req.query.section || 'vehicles';
  let csv = '';

  if (section === 'vehicles') {
    csv = 'Societe;Immatriculation;Marque;Modele;Leaser;Statut;Chauffeur\n';
    (doc.u || []).forEach(v => csv += `URBAN NEO;${v.im};${v.mq};${v.mo};${v.le};${v.st};${v.ch}\n`);
    (doc.g || []).forEach(v => csv += `GREEN;${v.im};${v.mq};${v.mo};${v.le};${v.st};${v.ch}\n`);
  } else if (section === 'departs') {
    csv = 'Societe;Immatriculation;Chauffeur;Date;Note\n';
    (doc.dep || []).forEach(d => csv += `${d.soc};${d.im};${d.ch||''};${d.dt||''};${d.no||''}\n`);
  } else if (section === 'retours') {
    csv = 'Societe;Immatriculation;Chauffeur;Date;Note\n';
    (doc.ret || []).forEach(d => csv += `${d.soc};${d.im};${d.ch||''};${d.dt||''};${d.no||''}\n`);
  } else if (section === 'garage') {
    csv = 'Societe;Immatriculation;Garage;Entree;Sortie;Jours\n';
    (doc.ga || []).forEach(g => csv += `${g.soc};${g.im};${g.gar||''};${g.de||''};${g.ds||''};${g.ji||''}\n`);
  } else if (section === 'dispo') {
    csv = 'Societe;Immatriculation;Modele;Note\n';
    (doc.di || []).forEach(d => csv += `${d.soc};${d.im};${d.mo||''};${d.no||''}\n`);
  } else if (section === 'vacances') {
    csv = 'Chauffeur;Societe;Debut;Fin;Note\n';
    (doc.va || []).forEach(v => csv += `${v.ch};${v.soc||''};${v.deb||''};${v.fin||''};${v.no||''}\n`);
  } else if (section === 'prospects') {
    csv = 'Nom;Contact;Besoin;Statut;Note\n';
    (doc.pr || []).forEach(p => csv += `${p.nom};${p.ct||''};${p.bs||''};${p.stu||''};${p.no||''}\n`);
  }

  await audit(req.user, 'csv_export', { section, week: req.query.week || 'live' });
  const suffix = req.query.week || new Date().toISOString().slice(0,10);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=opportix_${section}_${suffix}.csv`);
  res.send('\uFEFF' + csv); // BOM for Excel compatibility
});

/* ═══ SNAPSHOT ROUTES ═══ */
app.post('/api/snapshots', auth, canEdit, async (req, res) => {
  const weekLabel = await takeSnapshot(req.user.username);
  broadcast();
  res.json({ ok: true, weekLabel });
});

app.get('/api/snapshots', auth, async (req, res) => {
  const list = await db.collection('snapshots')
    .find({}, { projection: { u: 0, g: 0, dep: 0, ret: 0, ga: 0, di: 0, va: 0, pr: 0, dpv: 0, rpv: 0, msgs: 0 } })
    .sort({ weekLabel: -1 })
    .limit(104)
    .toArray();
  res.json(list);
});

app.get('/api/snapshots/:week', auth, async (req, res) => {
  const doc = await db.collection('snapshots').findOne({ weekLabel: req.params.week });
  if (!doc) return res.status(404).json({ error: 'Snapshot non trouve' });
  const { _id, ...rest } = doc;
  res.json(rest);
});

// Monthly KPI CSV: one row per month, based on last snapshot of each month
app.get('/api/export/csv/monthly', auth, async (req, res) => {
  const all = await db.collection('snapshots').find().sort({ createdAt: 1 }).toArray();
  // Group by YYYY-MM, keep latest snapshot per month
  const byMonth = new Map();
  for (const s of all) {
    const d = new Date(s.createdAt);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;
    const prev = byMonth.get(key);
    if (!prev || new Date(prev.createdAt) < d) byMonth.set(key, s);
  }

  let csv = 'Mois;Total VH;Urban Neo Total;Urban Actifs;Urban Immo;Green Total;Green Actifs;Green Immo;Chauffeurs Actifs;En Garage;En Dispo;Vacances;Departs (mois);Retours (mois)\n';
  const monthInDt = (dt, monthKey) => {
    if (!dt) return false;
    const [, mm] = monthKey.split('-');
    const parts = dt.split('/');
    return parts.length >= 2 && String(parseInt(parts[1])).padStart(2,'0') === mm;
  };

  for (const [month, s] of [...byMonth.entries()].sort()) {
    const u = s.u || [], g = s.g || [];
    const uA = u.filter(v => v.st === 'ACTIF').length;
    const uI = u.filter(v => v.st === 'IMMO').length;
    const gA = g.filter(v => v.st === 'ACTIF').length;
    const gI = g.filter(v => v.st === 'IMMO').length;
    const nCh = [...u, ...g].filter(v => v.st === 'ACTIF').length;
    const gar = (s.ga || []).length;
    const dis = (s.di || []).length;
    const vac = (s.va || []).length;
    const deps = (s.dep || []).filter(d => monthInDt(d.dt, month)).length;
    const rets = (s.ret || []).filter(d => monthInDt(d.dt, month)).length;
    csv += `${month};${u.length + g.length};${u.length};${uA};${uI};${g.length};${gA};${gI};${nCh};${gar};${dis};${vac};${deps};${rets}\n`;
  }

  await audit(req.user, 'csv_export_monthly', { months: byMonth.size });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=opportix_mensuel_${new Date().toISOString().slice(0,10)}.csv`);
  res.send('\uFEFF' + csv);
});

/* ═══ AUDIT ROUTE ═══ */
app.get('/api/audit', auth, adminOnly, async (req, res) => {
  const logs = await db.collection('audit').find().sort({ ts: -1 }).limit(200).toArray();
  res.json(logs);
});

/* ═══ USER MANAGEMENT ═══ */
app.get('/api/users', auth, canManageUsers, async (req, res) => {
  const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
  res.json(users);
});

app.post('/api/users', auth, adminOnly, async (req, res) => {
  const { username, displayName, role, pole, password } = req.body;
  if (!username?.trim() || !displayName?.trim()) {
    return res.status(400).json({ error: 'Identifiant et nom requis' });
  }
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Identifiant: 3 a 30 caracteres' });
  }
  const existing = await db.collection('users').findOne({ username });
  if (existing) {
    return res.status(400).json({ error: 'Nom utilisateur deja pris' });
  }

  const finalRole = role || 'lecteur';
  const newUser = {
    id: Date.now(),
    username: username.trim(),
    displayName: displayName.trim(),
    role: finalRole,
    pole: pole || 'activite',
    password: bcrypt.hashSync(password || 'opportix2025', 10)
  };
  await db.collection('users').insertOne(newUser);
  await audit(req.user, 'user_created', { username, role: finalRole });
  res.json({ ...newUser, password: undefined });
});

app.delete('/api/users/:id', auth, adminOnly, async (req, res) => {
  const userId = parseInt(req.params.id);
  const userToDelete = await db.collection('users').findOne({ id: userId });
  if (!userToDelete) return res.status(404).json({ error: 'Utilisateur non trouve' });
  if (userToDelete.role === 'admin') {
    return res.status(403).json({ error: 'Impossible de supprimer un admin' });
  }
  await db.collection('users').deleteOne({ id: userId });
  await audit(req.user, 'user_deleted', { username: userToDelete.username });
  res.json({ ok: true });
});

app.put('/api/users/:id/password', auth, async (req, res) => {
  const userId = parseInt(req.params.id);
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({ error: 'Non autorise' });
  }
  if (!req.body.password || req.body.password.length < 6) {
    return res.status(400).json({ error: 'Mot de passe: minimum 6 caracteres' });
  }
  const user = await db.collection('users').findOne({ id: userId });
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouve' });
  await db.collection('users').updateOne({ id: userId }, { $set: { password: bcrypt.hashSync(req.body.password, 10) } });
  await audit(req.user, 'password_changed', { target: user.username });
  res.json({ ok: true });
});

app.put('/api/users/:id/role', auth, adminOnly, async (req, res) => {
  const userId = parseInt(req.params.id);
  const user = await db.collection('users').findOne({ id: userId });
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouve' });
  if (user.role === 'admin') {
    return res.status(403).json({ error: 'Impossible de modifier le role d\'un admin' });
  }
  const validRoles = ['lecteur', 'editeur'];
  if (!validRoles.includes(req.body.role)) {
    return res.status(400).json({ error: 'Role invalide' });
  }
  await db.collection('users').updateOne({ id: userId }, { $set: { role: req.body.role } });
  await audit(req.user, 'role_changed', { target: user.username, from: user.role, to: req.body.role });
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

  const server = httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ✅ OPPORTIX Dashboard API`);
    console.log(`  → Local:   http://localhost:${PORT}`);
    const nets = require('os').networkInterfaces();
    Object.values(nets).flat().filter(n => n.family === 'IPv4' && !n.internal).forEach(n => {
      console.log(`  → Reseau:  http://${n.address}:${PORT}`);
    });
    console.log(`\n  Comptes par defaut:`);
    console.log(`  → (username) / opportix2025\n`);

    // Auto-snapshot: ensure current week exists, then schedule weekly
    (async () => {
      const currentWeek = getISOWeekLabel();
      const exists = await db.collection('snapshots').findOne({ weekLabel: currentWeek });
      if (!exists) {
        await takeSnapshot('auto');
        console.log(`  📸 Snapshot auto cree: ${currentWeek}`);
      }
      // Schedule next Monday 02:00
      const now = new Date();
      const next = new Date(now);
      next.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
      next.setHours(2, 0, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 7);
      const delay = next - now;
      setTimeout(() => {
        takeSnapshot('auto').then(() => console.log('  📸 Auto-snapshot hebdo'));
        setInterval(() => {
          takeSnapshot('auto').then(() => console.log('  📸 Auto-snapshot hebdo'));
        }, 7 * 24 * 60 * 60 * 1000);
      }, delay);
      console.log(`  ⏰ Prochain snapshot: ${next.toISOString()}`);
    })();
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
