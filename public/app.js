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

(async () => {
  reportDate.value = new Date().toISOString().slice(0, 10);
  await refreshHealth();
  try {
    await loadStores();
    await loadRegistersForSale();
  } catch (err) {
    // ignore initial load errors
  }
})();
