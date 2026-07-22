require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'clubs2026';
const MAX_QR_CODES = parseInt(process.env.MAX_QR_CODES) || 0;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Banco de Dados ───────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado — clubs-crm'))
  .catch(err => console.error('❌ Erro ao conectar MongoDB:', err));

// ─── Schema / Model ───────────────────────────────────────────────────────────
const leadSchema = new mongoose.Schema({
  nome:          { type: String, required: true },
  telefone:      { type: String, required: true },
  email:         { type: String, required: true },
  cidade:        { type: String, required: true },
  codigo:        { type: String, required: true, unique: true },
  usado:         { type: Boolean, default: false },
  dataCadastro:  { type: Date, default: Date.now },
  dataUso:       { type: Date, default: null },
});

const Lead = mongoose.model('EventLead', leadSchema);

// ─── Rotas: Páginas ───────────────────────────────────────────────────────────

// Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Página de sucesso (após cadastro)
app.get('/sucesso', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sucesso.html'));
});

// Painel admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ─── Rotas: API ───────────────────────────────────────────────────────────────

// POST /api/cadastro — Registrar lead e gerar QR Code
app.post('/api/cadastro', async (req, res) => {
  try {
    const { nome, telefone, email, cidade } = req.body;

    // Validação básica
    if (!nome || !telefone || !email || !cidade) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // Verificar limite de QR Codes
    if (MAX_QR_CODES > 0) {
      const total = await Lead.countDocuments();
      if (total >= MAX_QR_CODES) {
        return res.status(400).json({ error: 'Vagas esgotadas! Fique atento às nossas redes para mais novidades.' });
      }
    }

    // Verificar se email já foi cadastrado
    const jaExiste = await Lead.findOne({ email: email.toLowerCase() });
    if (jaExiste) {
      return res.status(400).json({ error: 'Este e-mail já foi cadastrado. Verifique sua caixa de entrada!' });
    }

    // Gerar código único
    const codigo = `CLUBS-${uuidv4().toUpperCase().slice(0, 8)}`;

    // Salvar no MongoDB
    const lead = new Lead({
      nome,
      telefone,
      email: email.toLowerCase(),
      cidade,
      codigo,
    });
    await lead.save();

    // Gerar QR Code como Data URL (imagem base64)
    const validacaoUrl = `${BASE_URL}/api/validar/${codigo}`;
    const qrCodeDataUrl = await QRCode.toDataURL(validacaoUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#622791',  // roxo CLUBS
        light: '#ffffff',
      },
    });

    res.json({
      success: true,
      nome,
      codigo,
      qrCodeDataUrl,
    });

  } catch (err) {
    console.error('Erro no cadastro:', err);
    res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
});

// GET /api/validar/:codigo — Validar QR Code no evento
app.get('/api/validar/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const lead = await Lead.findOne({ codigo });

    if (!lead) {
      return res.json({ valido: false, motivo: 'QR Code não encontrado.' });
    }

    if (lead.usado) {
      return res.json({
        valido: false,
        motivo: 'QR Code já utilizado.',
        nome: lead.nome,
        dataUso: lead.dataUso,
      });
    }

    // Marcar como usado
    lead.usado = true;
    lead.dataUso = new Date();
    await lead.save();

    res.json({
      valido: true,
      nome: lead.nome,
      codigo: lead.codigo,
    });

  } catch (err) {
    console.error('Erro na validação:', err);
    res.status(500).json({ valido: false, motivo: 'Erro interno.' });
  }
});

// GET /api/leads — Listar todos os leads (protegido por senha)
app.get('/api/leads', async (req, res) => {
  const { senha } = req.query;
  if (senha !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Acesso não autorizado.' });
  }

  try {
    const leads = await Lead.find().sort({ dataCadastro: -1 });
    const total = leads.length;
    const usados = leads.filter(l => l.usado).length;

    res.json({
      total,
      usados,
      disponiveis: total - usados,
      leads,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar leads.' });
  }
});

// GET /api/stats — Estatísticas rápidas
app.get('/api/stats', async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const usados = await Lead.countDocuments({ usado: true });
    res.json({ total, usados, disponiveis: total - usados });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar stats.' });
  }
});

// ─── Iniciar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 CLUBS Event Server rodando em ${BASE_URL}`);
  console.log(`📋 Admin: ${BASE_URL}/admin`);
});
