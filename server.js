require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cron = require('node-cron');
const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'clubs2026';
const MAX_QR_CODES = parseInt(process.env.MAX_QR_CODES) || 0;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cache headers for static assets (performance boost)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.(jpeg|jpg|png|svg|webp|ico)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days for images
    } else if (filePath.match(/\.(css|js)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day for CSS/JS (we use ?v= busting)
    }
  },
}));

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
  npsEnviado:    { type: Boolean, default: false },
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

    // Avisar a ANA (assíncrono, não trava a resposta para o usuário)
    if (process.env.ANA_WEBHOOK_URL) {
      fetch(`${process.env.ANA_WEBHOOK_URL}/webhook/event-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, telefone, email, codigo })
      }).catch(err => console.error('⚠️ Erro ao disparar webhook para ANA:', err.message));
    }

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

// ─── Cron Jobs (Automações do Evento) ─────────────────────────────────────────
if (process.env.ANA_WEBHOOK_URL) {
  // 1. Pesquisa NPS (Roda a cada hora)
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Verificando NPS de evento...');
    try {
      const vinteQuatroHorasAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const leads = await Lead.find({
        usado: true,
        npsEnviado: false,
        dataUso: { $lte: vinteQuatroHorasAtras }
      });
      
      for (const lead of leads) {
        // Acionar webhook na ANA
        fetch(`${process.env.ANA_WEBHOOK_URL}/webhook/event-nps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telefone: lead.telefone, nome: lead.nome })
        }).catch(err => console.error('Erro NPS:', err.message));
        
        lead.npsEnviado = true;
        await lead.save();
      }
      if (leads.length > 0) console.log(`[CRON] NPS enviado para ${leads.length} pessoas.`);
    } catch (err) {
      console.error('[CRON] Erro no NPS:', err.message);
    }
  });

  // 2. Recuperação de quem faltou (Roda todo dia as 10h da manhã)
  // Como o evento é dia 29/08/2026, vamos focar em quem tem criado > 24h e usado: false
  cron.schedule('0 10 * * *', async () => {
    console.log('[CRON] Verificando faltantes do evento...');
    try {
      // Como o evento é uma data fixa, a checagem real faria sentido no dia 30/08.
      // Para fins gerais: 
      const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Essa query busca os leads que NÃO usaram, já passou do prazo e ainda não processamos
      // Para simplificar e rodar amanhã do evento (30/08):
      const dataEvento = new Date('2026-08-30T00:00:00.000Z'); // Dia pós-evento
      if (new Date() >= dataEvento) {
        const leadsFaltantes = await Lead.find({
          usado: false,
          dataCadastro: { $lte: dataEvento }
        });
        
        // Vamos precisar de uma tag no schema ou apagar a base dps do dia. 
        // Aqui assumimos que ele enviará para todos não usados.
        // Cuidado com duplicidade: vamos usar o próprio schema ou deletar após uso
        for (const lead of leadsFaltantes) {
          fetch(`${process.env.ANA_WEBHOOK_URL}/webhook/event-noshow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telefone: lead.telefone, nome: lead.nome })
          }).catch(err => console.error('Erro No-Show:', err.message));
          
          // Pra não enviar de novo, podemos marcar `npsEnviado = true` tb ou um campo novo.
          lead.npsEnviado = true; 
          await lead.save();
        }
        if (leadsFaltantes.length > 0) console.log(`[CRON] Cupom no-show enviado para ${leadsFaltantes.length} pessoas.`);
      }
    } catch (err) {
      console.error('[CRON] Erro no No-Show:', err.message);
    }
  });
}

// ─── Iniciar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 CLUBS Event Server rodando em ${BASE_URL}`);
  console.log(`📋 Admin: ${BASE_URL}/admin`);
});
