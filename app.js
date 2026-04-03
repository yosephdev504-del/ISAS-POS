/* ═══════════════════════════════════════════
   ISAS Baleadas — POS Logic
   ═══════════════════════════════════════════ */

// ── Menu Data ──
const MENU = [
  { nombre: "Mantequilla", precio: 10 },
  { nombre: "Con Queso", precio: 15 },
  { nombre: "Queso y Mantequilla", precio: 20 },
  { nombre: "Huevo y Chorizo", precio: 25 },
  { nombre: "Con Huevo y Aguacate", precio: 45 },
  { nombre: "Aguacate", precio: 25 },
  { nombre: "Carne", precio: 35 },
  { nombre: "Parrillero", precio: 40 },
  { nombre: "Huevo Carne Aguacate", precio: 65 },
  { nombre: "Mega Baleada con Carne", precio: 100 },
  { nombre: "Huevo y Carne", precio: 50 },
  { nombre: "Carne y Aguacate", precio: 55 },
  { nombre: "Huevo", precio: 20 },
  { nombre: "Carne Queso Mantequilla", precio: 25 },
  { nombre: "Huevo Queso Mantequilla", precio: 40 },
  { nombre: "Salchicha", precio: 35 },
  { nombre: "Pollo Frito", precio: 35 },
  { nombre: "Carne Asada", precio: 35 },
  { nombre: "Huevo Duro", precio: 20 },
  { nombre: "Jugo Natural", precio: 20 }
];

// ── State ──
let order = []; // { nombre, precio, qty }

// ── DOM Refs ──
const $menuGrid      = document.getElementById("menu-grid");
const $productCount  = document.getElementById("product-count");
const $orderList     = document.getElementById("order-list");
const $emptyOrder    = document.getElementById("empty-order");
const $totalAmount   = document.getElementById("total-amount");
const $btnCharge     = document.getElementById("btn-charge");
const $btnClear      = document.getElementById("btn-clear-order");
const $customerAlias = document.getElementById("customer-alias");
const $currentTime   = document.getElementById("current-time");

// Modal
const $modalOverlay  = document.getElementById("modal-overlay");
const $btnDashboard  = document.getElementById("btn-dashboard");
const $btnCloseModal = document.getElementById("btn-close-modal");
const $btnClearHist  = document.getElementById("btn-clear-history");
const $statToday     = document.getElementById("stat-today");
const $statWeek      = document.getElementById("stat-week");
const $statCount     = document.getElementById("stat-count");
const $recentSales   = document.getElementById("recent-sales-list");

// Toast
const $toast    = document.getElementById("toast");
const $toastMsg = document.getElementById("toast-msg");

// ═══════════════════════════════════════════
// MENU RENDERING
// ═══════════════════════════════════════════
function renderMenu() {
  $productCount.textContent = `${MENU.length} productos`;
  $menuGrid.innerHTML = "";

  MENU.forEach((item, idx) => {
    const card = document.createElement("button");
    card.className = "product-card";
    card.id = `product-${idx}`;
    card.setAttribute("aria-label", `Agregar ${item.nombre} - L ${item.precio}`);
    card.innerHTML = `
      <span class="product-name">${item.nombre}</span>
      <span class="product-price">L ${item.precio}</span>
    `;
    card.addEventListener("click", () => addToOrder(idx));
    $menuGrid.appendChild(card);
  });
}

// ═══════════════════════════════════════════
// ORDER MANAGEMENT
// ═══════════════════════════════════════════
function addToOrder(idx) {
  const item = MENU[idx];
  const existing = order.find(o => o.nombre === item.nombre);

  if (existing) {
    existing.qty++;
  } else {
    order.push({ nombre: item.nombre, precio: item.precio, qty: 1 });
  }

  // Flash card
  const card = document.getElementById(`product-${idx}`);
  card.classList.add("flash");
  setTimeout(() => card.classList.remove("flash"), 300);

  renderOrder();
}

function changeQty(nombre, delta) {
  const item = order.find(o => o.nombre === nombre);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    order = order.filter(o => o.nombre !== nombre);
  }

  renderOrder();
}

function removeItem(nombre) {
  order = order.filter(o => o.nombre !== nombre);
  renderOrder();
}

function clearOrder() {
  order = [];
  $customerAlias.value = "";
  renderOrder();
}

function getTotal() {
  return order.reduce((sum, item) => sum + item.precio * item.qty, 0);
}

// ═══════════════════════════════════════════
// ORDER RENDERING
// ═══════════════════════════════════════════
function renderOrder() {
  const total = getTotal();

  // Toggle empty state
  if (order.length === 0) {
    $emptyOrder.style.display = "flex";
    renderOrderItems();
  } else {
    $emptyOrder.style.display = "none";
    renderOrderItems();
  }

  // Update total
  $totalAmount.textContent = `L ${total.toFixed(2)}`;

  // Toggle charge button
  $btnCharge.disabled = order.length === 0;
}

function renderOrderItems() {
  // Remove only order-item elements (keep empty-order)
  const existing = $orderList.querySelectorAll(".order-item");
  existing.forEach(el => el.remove());

  order.forEach(item => {
    const row = document.createElement("div");
    row.className = "order-item";
    row.innerHTML = `
      <div class="order-item-info">
        <div class="order-item-name">${item.nombre}</div>
        <div class="order-item-price">L ${item.precio} c/u</div>
      </div>
      <div class="order-item-controls">
        <button class="qty-btn" data-action="minus" aria-label="Reducir cantidad">−</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn" data-action="plus" aria-label="Aumentar cantidad">+</button>
      </div>
      <span class="order-item-subtotal">L ${(item.precio * item.qty).toFixed(2)}</span>
      <button class="btn-remove" aria-label="Eliminar ${item.nombre}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    // Event listeners
    row.querySelector('[data-action="minus"]').addEventListener("click", () => changeQty(item.nombre, -1));
    row.querySelector('[data-action="plus"]').addEventListener("click", () => changeQty(item.nombre, 1));
    row.querySelector('.btn-remove').addEventListener("click", () => removeItem(item.nombre));

    $orderList.appendChild(row);
  });
}

// ═══════════════════════════════════════════
// CHARGE / SAVE SALE
// ═══════════════════════════════════════════
function chargeSale() {
  if (order.length === 0) return;

  const sale = {
    id: Date.now(),
    alias: $customerAlias.value.trim() || "Sin nombre",
    items: order.map(i => ({ nombre: i.nombre, precio: i.precio, qty: i.qty })),
    total: getTotal(),
    timestamp: new Date().toISOString()
  };

  // Save to localStorage
  const sales = getSales();
  sales.push(sale);
  localStorage.setItem("isas_sales", JSON.stringify(sales));

  // Show toast
  showToast(`¡Cobrado L ${sale.total.toFixed(2)}!`);

  // Clear order
  clearOrder();
}

// ═══════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ═══════════════════════════════════════════
function getSales() {
  try {
    return JSON.parse(localStorage.getItem("isas_sales")) || [];
  } catch {
    return [];
  }
}

function getTodaySales() {
  const today = new Date().toDateString();
  return getSales().filter(s => new Date(s.timestamp).toDateString() === today);
}

function getWeekSales() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  return getSales().filter(s => new Date(s.timestamp) >= monday);
}

// ═══════════════════════════════════════════
// DASHBOARD MODAL
// ═══════════════════════════════════════════
function openDashboard() {
  const todaySales = getTodaySales();
  const weekSales = getWeekSales();

  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const weekTotal = weekSales.reduce((sum, s) => sum + s.total, 0);

  $statToday.textContent = `L ${todayTotal.toFixed(2)}`;
  $statWeek.textContent = `L ${weekTotal.toFixed(2)}`;
  $statCount.textContent = todaySales.length;

  // Recent sales (today, newest first)
  renderRecentSales(todaySales);

  $modalOverlay.hidden = false;
}

function renderRecentSales(sales) {
  if (sales.length === 0) {
    $recentSales.innerHTML = '<p class="no-sales">Sin ventas registradas hoy.</p>';
    return;
  }

  const sorted = [...sales].reverse();
  $recentSales.innerHTML = sorted.map(s => {
    const time = new Date(s.timestamp).toLocaleTimeString("es-HN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    const items = s.items.map(i => `${i.qty}x ${i.nombre}`).join(", ");
    return `
      <div class="sale-row">
        <div class="sale-row-left">
          <span class="sale-time">${time} — ${items}</span>
          <span class="sale-alias">${s.alias}</span>
        </div>
        <span class="sale-total">L ${s.total.toFixed(2)}</span>
      </div>
    `;
  }).join("");
}

function closeDashboard() {
  $modalOverlay.hidden = true;
}

function clearHistory() {
  const confirm1 = confirm("⚠️ ¿Estás seguro de que quieres borrar TODO el historial de ventas?");
  if (!confirm1) return;

  const confirm2 = confirm("⚠️ Esta acción NO se puede deshacer. ¿Confirmar borrado?");
  if (!confirm2) return;

  localStorage.removeItem("isas_sales");
  showToast("Historial de ventas borrado");
  closeDashboard();
}

// ═══════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════
let toastTimer = null;

function showToast(msg) {
  $toastMsg.textContent = msg;
  $toast.hidden = false;

  // Force reflow for animation restart
  void $toast.offsetWidth;
  $toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    $toast.classList.remove("show");
    setTimeout(() => { $toast.hidden = true; }, 300);
  }, 2500);
}

// ═══════════════════════════════════════════
// CLOCK
// ═══════════════════════════════════════════
function updateClock() {
  const now = new Date();
  $currentTime.textContent = now.toLocaleTimeString("es-HN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

// ═══════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════
$btnCharge.addEventListener("click", chargeSale);
$btnClear.addEventListener("click", () => {
  if (order.length === 0) return;
  if (confirm("¿Limpiar el pedido actual?")) clearOrder();
});
$btnDashboard.addEventListener("click", openDashboard);
$btnCloseModal.addEventListener("click", closeDashboard);
$btnClearHist.addEventListener("click", clearHistory);

// Close modal on overlay click
$modalOverlay.addEventListener("click", (e) => {
  if (e.target === $modalOverlay) closeDashboard();
});

// Close modal on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$modalOverlay.hidden) closeDashboard();
});

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
function init() {
  renderMenu();
  renderOrder();
  updateClock();
  setInterval(updateClock, 1000);
}

init();
