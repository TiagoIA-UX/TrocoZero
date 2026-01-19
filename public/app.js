const storage = {
  get(key, fallback = "") {
    return localStorage.getItem(key) ?? fallback;
  },
  set(key, value) {
    localStorage.setItem(key, value);
  }
};

const state = {
  baseUrl: storage.get("tz.baseUrl", window.location.origin),
  apiKey: storage.get("tz.apiKey", "")
};

const $ = (id) => document.getElementById(id);

const baseUrlInput = $("baseUrl");
const apiKeyInput = $("apiKey");
const healthStatus = $("healthStatus");

const storeName = $("storeName");
const storeSelect = $("storeSelect");
const saleStoreSelect = $("saleStoreSelect");
const reportStoreSelect = $("reportStoreSelect");
const registersList = $("registersList");
const storesList = $("storesList");

const registerLabel = $("registerLabel");
const saleRegisterSelect = $("saleRegisterSelect");

const saleTotal = $("saleTotal");
const cashReceived = $("cashReceived");
const saleResult = $("saleResult");

const saleIdPix = $("saleIdPix");
const pixKey = $("pixKey");
const pixResult = $("pixResult");

const pixTransferId = $("pixTransferId");
const confirmResult = $("confirmResult");

const reportDate = $("reportDate");
const reportResult = $("reportResult");

const historyStoreSelect = $("historyStoreSelect");
const historyStartDate = $("historyStartDate");
const historyEndDate = $("historyEndDate");
const historyStats = $("historyStats");
const historyList = $("historyList");
const historyPage = $("historyPage");
const historyPrev = $("historyPrev");
const historyNext = $("historyNext");

let historyState = { offset: 0, limit: 20, total: 0 };

baseUrlInput.value = state.baseUrl;
apiKeyInput.value = state.apiKey;

function headers() {
  const baseHeaders = { "Content-Type": "application/json" };
  if (state.apiKey) baseHeaders["x-api-key"] = state.apiKey;
  return baseHeaders;
}

async function api(path, options = {}) {
  const response = await fetch(`${state.baseUrl}${path}`, {
    ...options,
    headers: { ...headers(), ...(options.headers ?? {}) }
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erro ${response.status}`);
  }
  return response.json();
}

async function refreshHealth() {
  try {
    await api("/health");
    healthStatus.textContent = "Health: OK";
    healthStatus.style.color = "#0f766e";
  } catch (err) {
    healthStatus.textContent = "Health: OFFLINE";
    healthStatus.style.color = "#b91c1c";
  }
}

async function loadStores() {
  const data = await api("/stores");
  storesList.textContent = data.stores.map((s) => `${s.id} - ${s.name}`).join("\n");

  const options = data.stores
    .map((s) => `<option value="${s.id}">${s.name}</option>`)
    .join("");

  storeSelect.innerHTML = options;
  saleStoreSelect.innerHTML = options;
  reportStoreSelect.innerHTML = options;
  historyStoreSelect.innerHTML = options;
}

async function loadRegisters() {
  const storeId = storeSelect.value;
  if (!storeId) return;

  const data = await api(`/stores/${storeId}/registers`);
  registersList.textContent = data.registers.map((r) => `${r.id} - ${r.label}`).join("\n");
}

async function loadRegistersForSale() {
  const storeId = saleStoreSelect.value;
  if (!storeId) return;

  const data = await api(`/stores/${storeId}/registers`);
  saleRegisterSelect.innerHTML = data.registers
    .map((r) => `<option value="${r.id}">${r.label}</option>`)
    .join("");
}

$("saveConfig").addEventListener("click", async () => {
  state.baseUrl = baseUrlInput.value.trim() || window.location.origin;
  state.apiKey = apiKeyInput.value.trim();
  storage.set("tz.baseUrl", state.baseUrl);
  storage.set("tz.apiKey", state.apiKey);
  await refreshHealth();
  await loadStores();
  await loadRegistersForSale();
});

$("createStore").addEventListener("click", async () => {
  const name = storeName.value.trim();
  if (!name) return;
  await api("/stores", { method: "POST", body: JSON.stringify({ name }) });
  storeName.value = "";
  await loadStores();
});

$("refreshStores").addEventListener("click", loadStores);

$("createRegister").addEventListener("click", async () => {
  const label = registerLabel.value.trim();
  const storeId = storeSelect.value;
  if (!label || !storeId) return;
  await api(`/stores/${storeId}/registers`, {
    method: "POST",
    body: JSON.stringify({ label })
  });
  registerLabel.value = "";
  await loadRegisters();
  await loadRegistersForSale();
});

$("refreshRegisters").addEventListener("click", loadRegisters);

storeSelect.addEventListener("change", loadRegisters);
saleStoreSelect.addEventListener("change", loadRegistersForSale);

$("createSale").addEventListener("click", async () => {
  const payload = {
    storeId: saleStoreSelect.value,
    registerId: saleRegisterSelect.value,
    saleTotal: Number(saleTotal.value),
    cashReceived: Number(cashReceived.value)
  };
  const data = await api("/sales/cash", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  saleResult.textContent = JSON.stringify(data, null, 2);
});

$("requestPix").addEventListener("click", async () => {
  const data = await api(`/sales/${saleIdPix.value.trim()}/pix-change`, {
    method: "POST",
    body: JSON.stringify({ pixKey: pixKey.value.trim() })
  });
  pixResult.textContent = JSON.stringify(data, null, 2);
});

$("confirmPix").addEventListener("click", async () => {
  const data = await api(`/pix-transfers/${pixTransferId.value.trim()}/confirm`, {
    method: "POST"
  });
  confirmResult.textContent = JSON.stringify(data, null, 2);
});

$("getReport").addEventListener("click", async () => {
  const storeId = reportStoreSelect.value;
  const date = reportDate.value.trim();
  const data = await api(`/reports/daily?storeId=${storeId}&date=${date}`);
  reportResult.textContent = JSON.stringify(data, null, 2);
});

function formatMoney(cents) {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatTime(isoDate) {
  return new Date(isoDate).toLocaleString("pt-BR");
}

function renderHistoryItem(tx) {
  const payload = tx.payload;
  let details = "";

  if (tx.type === "CASH_SALE_REGISTERED") {
    details = `Venda: ${formatMoney(payload.saleTotal)} | Recebido: ${formatMoney(payload.cashReceived)} | Troco: ${formatMoney(payload.changeAmount)}`;
  } else if (tx.type === "PIX_CHANGE_SENT" || tx.type === "PIX_CHANGE_REQUESTED") {
    details = `Troco Pix: ${formatMoney(payload.changeAmount)} | Chave: ${payload.pixKey || "-"}`;
  } else if (tx.type === "PIX_CHANGE_CONFIRMED") {
    details = `Pix confirmado | Sale: ${payload.saleId?.slice(0, 8) || "-"}`;
  }

  return `
    <div class="history-item">
      <span class="type ${tx.type}">${tx.type.replace(/_/g, " ")}</span>
      <span class="time">${formatTime(tx.occurredAt)}</span>
      <div class="details">${details}</div>
    </div>
  `;
}

async function loadHistory() {
  const storeId = historyStoreSelect.value;
  const startDate = historyStartDate.value;
  const endDate = historyEndDate.value;

  if (!storeId || !startDate || !endDate) {
    historyList.innerHTML = "<p>Selecione loja e datas</p>";
    return;
  }

  const params = new URLSearchParams({
    storeId,
    startDate,
    endDate,
    limit: historyState.limit,
    offset: historyState.offset
  });

  const data = await api(`/transactions?${params}`);
  historyState.total = data.total;

  historyStats.innerHTML = `
    <div>Total de transações: <span>${data.total}</span></div>
    <div>Mostrando: <span>${data.offset + 1} - ${Math.min(data.offset + data.transactions.length, data.total)}</span></div>
  `;

  if (data.transactions.length === 0) {
    historyList.innerHTML = "<p style='padding:16px'>Nenhuma transação encontrada</p>";
  } else {
    historyList.innerHTML = data.transactions.map(renderHistoryItem).join("");
  }

  const currentPage = Math.floor(historyState.offset / historyState.limit) + 1;
  const totalPages = Math.ceil(historyState.total / historyState.limit);
  historyPage.textContent = `Página ${currentPage} de ${totalPages}`;

  historyPrev.disabled = historyState.offset === 0;
  historyNext.disabled = historyState.offset + historyState.limit >= historyState.total;
}

$("loadHistory").addEventListener("click", () => {
  historyState.offset = 0;
  loadHistory();
});

historyPrev.addEventListener("click", () => {
  historyState.offset = Math.max(0, historyState.offset - historyState.limit);
  loadHistory();
});

historyNext.addEventListener("click", () => {
  historyState.offset += historyState.limit;
  loadHistory();
});

(async () => {
  const today = new Date().toISOString().slice(0, 10);
  reportDate.value = today;
  historyStartDate.value = today;
  historyEndDate.value = today;

  await refreshHealth();
  try {
    await loadStores();
    await loadRegistersForSale();
  } catch (err) {
    // ignore initial load errors
  }
})();
