// Recuperar dados do sessionStorage
const lead = JSON.parse(sessionStorage.getItem('clubs_lead'));

if (!lead) {
  window.location.href = '/';
}

// Preencher nome
document.getElementById('success-nome').textContent = lead.nome;

// Exibir QR Code
const qrImg = document.getElementById('qr-image');
qrImg.src = lead.qrCodeDataUrl;

// Exibir código
document.getElementById('qr-codigo').textContent = lead.codigo;

// Botão de download
document.getElementById('btn-download').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `CLUBS-Vale-Duplo-Chopp-${lead.codigo}.png`;
  link.href = lead.qrCodeDataUrl;
  link.click();
});

// Botão WhatsApp — Grupo VIP
const LINK_GRUPO_VIP = '#'; // Substitua pelo link real do grupo VIP
document.getElementById('btn-whatsapp').href = LINK_GRUPO_VIP;

// ─── Compartilhamento social no WhatsApp ──────────────────────────────────────
const LANDING_PAGE_URL = window.location.origin;
const mensagemCompartilhar = encodeURIComponent(
  `🍺 *CLUBS Draft Night — Sorocaba!*\n\n` +
  `Vai rolar o lançamento da CLUBS Drinks no *Empório Ibiti* no dia *29/08*!\n\n` +
  `Eu já garantí meu *Vale Duplo Chopp* — você já garantiu o seu?\n\n` +
  `👉 Cadastre-se aqui: ${LANDING_PAGE_URL}\n\n` +
  `Vagas limitadas! Corre! 🔥`
);

document.getElementById('btn-compartilhar').href =
  `https://api.whatsapp.com/send?text=${mensagemCompartilhar}`;

