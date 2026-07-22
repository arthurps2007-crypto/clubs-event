// Recuperar dados do sessionStorage
const lead = JSON.parse(sessionStorage.getItem('clubs_lead'));

if (!lead) {
  // Se não tem dados, redirecionar para a landing page
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
