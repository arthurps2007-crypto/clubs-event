let adminSenha = '';
let allLeads   = [];

// ─── Login ────────────────────────────────────────────────────────────────────
document.getElementById('btn-login').addEventListener('click', async () => {
  const senha = document.getElementById('admin-senha').value;
  const erro  = document.getElementById('admin-error');

  const res  = await fetch(`/api/leads?senha=${senha}`);
  const json = await res.json();

  if (!res.ok) {
    erro.style.display = 'block';
    return;
  }

  adminSenha = senha;
  erro.style.display = 'none';
  document.getElementById('admin-login').style.display  = 'none';
  document.getElementById('admin-panel').style.display  = 'block';
  renderStats(json);
  renderLeads(json.leads);
});

// Permitir Enter no campo de senha
document.getElementById('admin-senha').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('btn-login').click();
});

// ─── Logout ───────────────────────────────────────────────────────────────────
document.getElementById('btn-logout').addEventListener('click', () => {
  adminSenha = '';
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('admin-login').style.display  = 'flex';
  document.getElementById('admin-senha').value = '';
});

// ─── Stats ────────────────────────────────────────────────────────────────────
function renderStats(data) {
  document.getElementById('stat-total').textContent       = data.total;
  document.getElementById('stat-usados').textContent      = data.usados;
  document.getElementById('stat-disponiveis').textContent = data.disponiveis;
}

// ─── Tabela de Leads ──────────────────────────────────────────────────────────
function renderLeads(leads) {
  allLeads = leads;
  const tbody = document.getElementById('leads-tbody');
  tbody.innerHTML = '';

  if (!leads.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;opacity:.5;">Nenhum cadastro ainda.</td></tr>';
    return;
  }

  leads.forEach((lead, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${lead.nome}</td>
      <td>${lead.telefone}</td>
      <td>${lead.email}</td>
      <td>${lead.cidade}</td>
      <td class="lead-code">${lead.codigo}</td>
      <td>
        <span class="badge ${lead.usado ? 'badge--used' : 'badge--available'}">
          ${lead.usado ? '✅ Usado' : '⏳ Disponível'}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ─── Busca na tabela ──────────────────────────────────────────────────────────
document.getElementById('search-leads').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = allLeads.filter(l =>
    l.nome.toLowerCase().includes(q) ||
    l.email.toLowerCase().includes(q) ||
    l.codigo.toLowerCase().includes(q)
  );
  renderLeads(filtered);
});

// ─── Validação manual de código ───────────────────────────────────────────────
document.getElementById('btn-validar').addEventListener('click', async () => {
  const codigo  = document.getElementById('input-codigo').value.trim().toUpperCase();
  const result  = document.getElementById('scan-result');
  const icon    = document.getElementById('scan-icon');
  const status  = document.getElementById('scan-status');
  const name    = document.getElementById('scan-name');

  if (!codigo) return;

  result.style.display = 'flex';
  icon.textContent   = '⏳';
  status.textContent = 'Validando...';
  name.textContent   = '';
  result.className   = 'scan-result scan-result--loading';

  try {
    const res  = await fetch(`/api/validar/${codigo}`);
    const json = await res.json();

    if (json.valido) {
      icon.textContent   = '✅';
      status.textContent = 'QR CODE VÁLIDO';
      name.textContent   = json.nome;
      result.className   = 'scan-result scan-result--valid';

      // Atualizar stats e tabela
      const statsRes  = await fetch(`/api/leads?senha=${adminSenha}`);
      const statsJson = await statsRes.json();
      renderStats(statsJson);
      renderLeads(statsJson.leads);
    } else {
      icon.textContent   = '❌';
      status.textContent = json.motivo || 'QR CODE INVÁLIDO';
      name.textContent   = json.nome ? `Cadastrado: ${json.nome}` : '';
      result.className   = 'scan-result scan-result--invalid';
    }

    // Limpar campo
    document.getElementById('input-codigo').value = '';

  } catch {
    icon.textContent   = '⚠️';
    status.textContent = 'Erro de conexão.';
    result.className   = 'scan-result scan-result--invalid';
  }
});

// Enter no campo de código
document.getElementById('input-codigo').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('btn-validar').click();
});
