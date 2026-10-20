/* =========================================================
   iChefLab – Painel da cozinha
   Status possíveis: "fila" -> "preparo" -> "prontos" -> "entregue"
   ========================================================= */

const LIMITE_ALERTA = 8 * 60;   // 8 min  -> amarelo
const LIMITE_ATRASO = 12 * 60;  // 12 min -> vermelho

// ---------- Dados (troque por chamada à sua API) ----------
// criadoEm = momento em que o pedido entrou na fila
const agora = Date.now();
const minutosAtras = (m, s = 0) => agora - (m * 60 + s) * 1000;

let pedidos = [
  { id: "024", mesa: "04", itens: ["2x Risotto funghi", "1x Salada"],            status: "fila",    criadoEm: minutosAtras(4, 12) },
  { id: "025", mesa: "07", itens: ["1x Burger artesanal", "1x Batata rústica"],  status: "fila",    criadoEm: minutosAtras(7, 30) },
  { id: "026", mesa: "10", itens: ["1x Salmão grelhado", "1x Legumes salteados"], status: "fila",   criadoEm: minutosAtras(12, 18) },
  { id: "023", mesa: "03", itens: ["1x Massa ao pesto", "1x Bruschetta"],        status: "preparo", criadoEm: minutosAtras(2, 41), progresso: 60 },
  { id: "022", mesa: "01", itens: ["2x Tacos de frango", "1x Guacamole"],        status: "preparo", criadoEm: minutosAtras(5, 17), progresso: 80 },
  { id: "021", mesa: "12", itens: ["1x Penne alfredo", "1x Salada caesar"],      status: "prontos", criadoEm: minutosAtras(9), tempoFinal: 540 },
  { id: "020", mesa: "08", itens: ["2x Steak Angus", "1x Purê de batata"],       status: "prontos", criadoEm: minutosAtras(11), tempoFinal: 660 },
];

// Exemplo para integrar com backend (Spring Boot):
// async function carregarPedidos() {
//   const res = await fetch("/api/pedidos");
//   pedidos = await res.json();
//   render();
// }

// ---------- Utilitários ----------
const $ = (sel) => document.querySelector(sel);
const formatar = (seg) =>
  String(Math.floor(seg / 60)).padStart(2, "0") + ":" + String(seg % 60).padStart(2, "0");

const segundosDecorridos = (p) =>
  p.tempoFinal ?? Math.floor((Date.now() - p.criadoEm) / 1000);

const classeTempo = (seg) =>
  seg >= LIMITE_ATRASO ? "late" : seg >= LIMITE_ALERTA ? "warn" : "";

// ---------- Renderização ----------
function cartao(p) {
  const seg = segundosDecorridos(p);
  let extra = "";

  if (p.status === "fila") {
    extra = `<span class="badge fila">Aguardando</span>`;
  } else if (p.status === "preparo") {
    extra = `
      <div class="progress">
        <div class="track"><span class="fill" style="width:${p.progresso}%"></span></div>
        <span>${p.progresso}%</span>
      </div>`;
  } else if (p.status === "prontos") {
    extra = `<span class="badge pronto">Pronto</span>`;
  } else {
    extra = `<span class="badge pronto">Entregue</span>`;
  }

  return `
    <article class="ticket" data-id="${p.id}" tabindex="0">
      <div class="ticket-head">
        <span>#${p.id} · Mesa ${p.mesa}</span>
        <span class="timer ${classeTempo(seg)}">${formatar(seg)}</span>
      </div>
      <ul>${p.itens.map((i) => `<li>${i}</li>`).join("")}</ul>
      ${extra}
    </article>`;
}

function renderLista(status, destino) {
  const lista = pedidos.filter((p) => p.status === status);
  $(`#list-${destino}`).innerHTML = lista.length
    ? lista.map(cartao).join("")
    : `<p class="empty">Nenhum pedido</p>`;
  $(`#count-${destino}`).textContent = lista.length;
}

function render() {
  renderLista("fila", "fila");
  renderLista("preparo", "preparo");
  renderLista("prontos", "prontos");
  renderLista("entregue", "historico");
}

// Atualiza só os cronômetros e barras (sem recriar o HTML)
function atualizarRelogios() {
  document.querySelectorAll(".ticket").forEach((el) => {
    const p = pedidos.find((x) => x.id === el.dataset.id);
    if (!p) return;
    const seg = segundosDecorridos(p);
    const timer = el.querySelector(".timer");
    timer.textContent = formatar(seg);
    timer.className = `timer ${classeTempo(seg)}`;
  });
}

// ---------- Ações ----------
const PROXIMO = { fila: "preparo", preparo: "prontos", prontos: "entregue" };

function avancar(id) {
  const p = pedidos.find((x) => x.id === id);
  if (!p || !PROXIMO[p.status]) return;

  p.status = PROXIMO[p.status];
  if (p.status === "preparo") p.progresso = 0;
  if (p.status === "prontos") p.tempoFinal = segundosDecorridos(p);

  // Exemplo de integração:
  // fetch(`/api/pedidos/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: p.status }) });

  render();
}

// Clique (ou Enter) no cartão avança o pedido
document.addEventListener("click", (e) => {
  const t = e.target.closest(".ticket");
  if (t && t.closest("#board")) avancar(t.dataset.id);
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const t = e.target.closest?.(".ticket");
  if (t && t.closest("#board")) avancar(t.dataset.id);
});

// Menu lateral
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const view = btn.dataset.view;
    const verHistorico = view === "historico";
    $("#board").hidden = verHistorico;
    $("#historico").hidden = !verHistorico;
    if (!verHistorico) $("#board").dataset.view = view;
  });
});

// Progresso simulado: pedidos em preparo avançam sozinhos (remova quando tiver dados reais)
setInterval(() => {
  pedidos.forEach((p) => {
    if (p.status === "preparo" && p.progresso < 100) p.progresso = Math.min(100, p.progresso + 1);
  });
  document.querySelectorAll("#list-preparo .ticket").forEach((el) => {
    const p = pedidos.find((x) => x.id === el.dataset.id);
    if (!p) return;
    el.querySelector(".fill").style.width = p.progresso + "%";
    el.querySelector(".progress span:last-child").textContent = p.progresso + "%";
  });
}, 5000);

setInterval(atualizarRelogios, 1000);
render();