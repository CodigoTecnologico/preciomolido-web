import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import http from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { randomUUID } from 'node:crypto';
import {
  materials, reports, publications, users,
  alerts, offers, ratings, sellerReports, suggestions,
} from './mockData.js';

const PORT = 3000;
const ADMIN_KEY = 'admin123';
const JWT_SECRET = 'preciomolido-dev-secret';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const io = new SocketServer(server, { cors: { origin: '*' } });

function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'No autorizado' });
  try {
    req.user = jwt.verify(h.replace('Bearer ', ''), JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Token inválido' }); }
}

function adminOnly(req, res, next) {
  if (req.headers['x-admin-key'] !== ADMIN_KEY)
    return res.status(401).json({ error: 'Clave incorrecta' });
  next();
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
  const token = jwt.sign(
    { id: user.id, nombre: user.nombre, email: user.email, tipo: user.tipo, estado: user.estado },
    JWT_SECRET, { expiresIn: '30d' }
  );
  res.json({ token, user: { nombre: user.nombre, email: user.email, tipo: user.tipo, estado: user.estado } });
});

app.post('/api/registro', (req, res) => {
  const { nombre, email, password, tipo, estado } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });
  if (users.find(u => u.email === email))
    return res.status(400).json({ error: 'Email ya registrado' });
  const user = { id: randomUUID(), nombre, email, password, tipo, estado };
  users.push(user);
  const token = jwt.sign(
    { id: user.id, nombre, email, tipo, estado },
    JWT_SECRET, { expiresIn: '30d' }
  );
  res.json({ token, user: { nombre, email, tipo, estado } });
});

app.get('/api/materiales', (req, res) => res.json(materials));

app.get('/api/reportes', (req, res) => res.json(reports));
app.post('/api/reportes', auth, (req, res) => {
  const report = { id: randomUUID(), ...req.body, usuario: req.user.email, verificado: req.body.verificado !== false };
  reports.push(report);
  io.emit('nuevo_reporte', report);
  res.status(201).json(report);
});

app.get('/api/marketplace', (req, res) => res.json(publications));
app.post('/api/marketplace', auth, (req, res) => {
  const pub = { id: randomUUID(), ...req.body, usuario_email: req.user.email, usuario_nombre: req.user.nombre, fecha: new Date().toISOString(), activo: true, es_atipico: false };
  publications.push(pub);
  io.emit('nueva_publicacion', pub);
  res.status(201).json(pub);
});
app.put('/api/marketplace/:id', auth, (req, res) => {
  const i = publications.findIndex(p => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'No encontrada' });
  publications[i] = { ...publications[i], ...req.body };
  io.emit('nueva_publicacion', publications[i]);
  res.json(publications[i]);
});
app.delete('/api/marketplace/:id', auth, (req, res) => {
  const i = publications.findIndex(p => p.id === req.params.id);
  if (i !== -1) publications.splice(i, 1);
  res.status(204).end();
});

app.get('/api/alertas', auth, (req, res) => res.json(alerts.filter(a => a.usuario === req.user.email)));
app.post('/api/alertas', auth, (req, res) => {
  const a = { id: randomUUID(), ...req.body, usuario: req.user.email, activa: true };
  alerts.push(a);
  res.status(201).json(a);
});
app.delete('/api/alertas/:id', auth, (req, res) => {
  const i = alerts.findIndex(a => a.id === req.params.id);
  if (i !== -1) alerts.splice(i, 1);
  res.status(204).end();
});

app.get('/api/ofertas/recibidas', auth, (req, res) => res.json(offers.filter(o => o.comprador_email === req.user.email)));
app.get('/api/ofertas/enviadas', auth, (req, res) => res.json(offers.filter(o => o.vendedor_email === req.user.email)));
app.post('/api/ofertas', auth, (req, res) => {
  const o = { id: randomUUID(), ...req.body, vendedor_email: req.user.email, vendedor_nombre: req.user.nombre, fecha: new Date().toISOString(), estado: 'pendiente' };
  offers.push(o);
  res.status(201).json(o);
});
app.put('/api/ofertas/:id/aceptar', auth, (req, res) => {
  const o = offers.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: 'No encontrada' });
  o.estado = 'aceptada';
  res.json(o);
});
app.put('/api/ofertas/:id/rechazar', auth, (req, res) => {
  const o = offers.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: 'No encontrada' });
  o.estado = 'rechazada';
  res.json(o);
});

app.get('/api/calificaciones/todas', (req, res) => res.json(ratings));
app.post('/api/calificaciones', auth, (req, res) => {
  const r = { id: randomUUID(), to_email: req.body.toEmail, rating: req.body.rating, comment: req.body.comment || '', from_name: req.user.nombre, from_email: req.user.email, fecha: new Date().toISOString() };
  ratings.push(r);
  res.status(201).json(r);
});

app.get('/api/reportes-vendedor', (req, res) => res.json(sellerReports));
app.post('/api/reportes-vendedor', auth, (req, res) => {
  const r = { id: randomUUID(), reportedEmail: req.body.reportedEmail, motivo: req.body.motivo, descripcion: req.body.descripcion || '', reportedBy: req.user.email, fecha: new Date().toISOString() };
  sellerReports.push(r);
  res.status(201).json(r);
});

app.get('/api/sugerencias-materiales', (req, res) => res.json(suggestions));
app.post('/api/sugerencias-materiales', auth, (req, res) => {
  const s = { id: randomUUID(), ...req.body, usuario: req.user.nombre, estado: 'pendiente', fecha: new Date().toISOString() };
  suggestions.push(s);
  res.status(201).json(s);
});
app.put('/api/sugerencias-materiales/:id/aprobar', adminOnly, (req, res) => {
  const s = suggestions.find(x => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'No encontrada' });
  s.estado = 'aprobada';
  materials.push({ id: materials.length + 1, material: s.material, presentacion: s.presentacion || 'No especificado', origen: s.origen || 'No especificado', color: s.color || 'No especificado' });
  res.json(s);
});
app.put('/api/sugerencias-materiales/:id/rechazar', adminOnly, (req, res) => {
  const s = suggestions.find(x => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'No encontrada' });
  s.estado = 'rechazada';
  res.json(s);
});

app.post('/api/upload', auth, (req, res) => res.json({ url: req.body.image }));

app.get('/api/admin/usuarios', adminOnly, (req, res) => res.json(users.map(u => ({ nombre: u.nombre, email: u.email, tipo: u.tipo, estado: u.estado }))));
app.get('/api/admin/reportes', adminOnly, (req, res) => res.json(reports.slice(-50).map(r => ({ id: r.id, material: (materials.find(m => m.id === r.material_id) || {}).material, precio_kg: r.precio_kg, fecha: r.fecha }))));
app.delete('/api/admin/reportes/:id', adminOnly, (req, res) => {
  const i = reports.findIndex(r => r.id === req.params.id);
  if (i !== -1) reports.splice(i, 1);
  res.status(204).end();
});
app.get('/api/admin/marketplace', adminOnly, (req, res) => res.json(publications.map(p => ({ id: p.id, material: (materials.find(m => m.id === p.material_id) || {}).material, tipo: p.tipo, usuario_nombre: p.usuario_nombre }))));
app.delete('/api/admin/marketplace/:id', adminOnly, (req, res) => {
  const i = publications.findIndex(p => p.id === req.params.id);
  if (i !== -1) publications.splice(i, 1);
  res.status(204).end();
});

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);
  socket.on('disconnect', () => console.log('🔌 Desconectado:', socket.id));
});

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 Backend corriendo en http://localhost:' + PORT);
  console.log('   Admin key: ' + ADMIN_KEY);
  console.log('   Usuarios demo:');
  console.log('     • acopiador@demo.com   / demo123');
  console.log('     • recicladora@demo.com / demo123');
  console.log('');
});