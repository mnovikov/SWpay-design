/* eslint-disable */

// ── Payment drawer for the admin, modelled on the trader-app PayInDrawer ──
// Same section structure as in trader-sections-1.jsx → PayInDrawer:
//   Сводка → Куда поступил платёж → SMS / Push от банка
// Plus admin-only stacked drawers for Терминал and Реквизит (the link rows).

const ADMIN_USDT_RATE = 92.4;

// ── Provider classification — MUST stay in sync with sections-tables.jsx ──
// ~1/3 of orders are executed by an API provider rather than an internal trader.
function piHashId(o) { let h = 0; for (const c of String(o.id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
function piIsProviderOrder(o) {
  const ids = (window.PROVIDERS || []).map((p) => p.id);
  return ids.length ? piHashId(o) % 3 === 0 : false;
}
function piProviderOf(o) {
  const list = window.PROVIDERS || [];
  if (!list.length) return null;
  return list[piHashId(o) % list.length];
}
// A provider returns its own external requisite (from its pool) for the customer
// to pay to — synthesised deterministically since it isn't stored per-order.
function piProviderRequisite(o) {
  const h = piHashId(o);
  const method = h % 3 === 0 ? "sbp" : "card";
  const holders = ["И. Смирнов", "А. Кузнецова", "Д. Попов", "Е. Соколова", "М. Лебедев", "О. Новикова"];
  const phone = "+7 9" + String(10 + h % 90) + " " + String(100 + h % 900) + "-" + String(10 + (h >> 2) % 90) + "-" + String(10 + (h >> 5) % 90);
  return {
    method,
    holder: holders[h % holders.length],
    target: method === "sbp" ? phone : "•••• " + String(1000 + h % 9000),
    bank: o.bank,
    extId: "EXT-" + (100000 + h % 900000),
  };
}
function piMethodLabel(m) {
  return m === "sbp" ? "СБП" : m === "card" ? "Карта" : m === "c2c" ? "C2C" : m === "phone" ? "Phone" : m === "account" ? "Счёт" : m;
}

// "1042-A" copy-id helper — keeps the visual from the trader app
function CopyId({ value, short }) {
  const [done, setDone] = React.useState(false);
  const display = short ? String(value).split("-").pop() : value;
  return (
    <button
      type="button"
      title={"Скопировать " + value}
      onClick={(e) => {
        e.stopPropagation();
        try { navigator.clipboard && navigator.clipboard.writeText(value); } catch (_) {}
        setDone(true);
        setTimeout(() => setDone(false), 900);
      }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "none", border: 0, padding: 0,
        font: "inherit", color: "inherit", cursor: "pointer",
      }}
    >
      <span className="mono">{display}</span>
      <span
        className="mono"
        style={{
          fontSize: 10.5, padding: "1px 6px", borderRadius: 5,
          background: done ? "var(--ok-soft)" : "var(--paper-2)",
          color: done ? "var(--ok)" : "var(--ink-3)",
          border: "1px solid var(--line)",
          transition: "background 120ms, color 120ms",
        }}
      >
        {done ? "✓ скопировано" : "копировать"}
      </span>
    </button>
  );
}

// Dashed-underline link button — opens stacked drawers below
const linkStyle = {
  background: "none", border: 0, padding: 0, margin: 0,
  font: "inherit", color: "inherit", cursor: "pointer",
  textAlign: "left",
  borderBottom: "1px dashed var(--ink-3)",
  transition: "color 120ms, border-color 120ms",
};

function PayInDrawerV2({ order, onClose }) {
  const [linkOpen, setLinkOpen] = React.useState(null);
  const term = (window.TERMINALS || []).find((t) => t.id === order.terminal);
  const pd   = (window.PAYMENT_DETAILS || []).find((p) => p.id === order.details);
  const isProv  = piIsProviderOrder(order);
  const prov    = isProv ? piProviderOf(order) : null;
  const provReq = isProv ? piProviderRequisite(order) : null;

  // Compute deadline timestamp: created date + time-to-confirm
  const deadlineDisplay = (() => {
    const m = /^(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})$/.exec(order.date || "");
    const t = /^(\d{1,2}):(\d{2})$/.exec(order.time || "");
    if (!m || !t) return null;
    const d = new Date(2026, parseInt(m[2], 10) - 1, parseInt(m[1], 10), parseInt(m[3], 10), parseInt(m[4], 10));
    d.setMinutes(d.getMinutes() + parseInt(t[1], 10));
    d.setSeconds(parseInt(t[2], 10));
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  })();

  // SLA chip — shown for active orders only
  const slaChip = ["waiting-payment", "manual-review"].includes(order.status) && order.time && order.time !== "—"
    ? <span className="dispute-sla mono">⏱ {order.time}</span>
    : null;

  return (
    <>
      <Drawer
        title="Платёж"
        id={order.id}
        status={order.status}
        statusMap={PAY_IN_STATUS}
        onClose={onClose}
        wide
        extraTags={slaChip}
        footer={<>
          <span className="spacer" />
          {["expired", "failed"].includes(order.status) && (
            <Btn variant="ghost">Create Dispute</Btn>
          )}
        </>}
      >
        <Section title="Сводка">
          <KV items={[
            ["ID", <CopyId value={order.id} />],
            ["Сумма", <strong>{fmtMoney(order.amount, "RUB")}</strong>],
            ["Сумма (USDT)", <span className="mono">{fmtMoney(order.amount / ADMIN_USDT_RATE, "USDT")}</span>],
            ["Курс обмена", <span className="mono">{ADMIN_USDT_RATE.toFixed(2)} ₽/USDT</span>],
            ["Создана", <span className="mono">{order.date}</span>],
            ["Время до подтверждения", order.time && order.time !== "—"
              ? <span className="mono">
                  {order.time}
                  {deadlineDisplay && <span className="muted"> (до {deadlineDisplay})</span>}
                </span>
              : <span className="muted">—</span>],
            [isProv ? "Комиссия провайдера" : "Комиссия трейдера", order.commissionUsdt
              ? <strong>{fmtMoney(order.commissionUsdt, "USDT")}</strong>
              : <span className="muted">—</span>],
          ]} />
        </Section>

        <Section title="Стороны">
          <KV items={[
            ["Merchant", <>
              <strong>{order.merchantName}</strong>
              <span className="mono muted" style={{ marginLeft: 8 }}>{order.merchant}</span>
            </>],
            ["Customer", order.customer],
          ]} />
        </Section>

        <Section title="Куда поступил платёж">
          {isProv ? (
            <KV items={[
              ["Провайдер", <>
                <strong>{prov ? prov.name : "—"}</strong>
                {prov && <span className="mono muted" style={{ marginLeft: 8 }}>{prov.id}</span>}
              </>],
              ["Метод", <span className={"pd-card__method pd-card__method--" + provReq.method}>{piMethodLabel(provReq.method)}</span>],
              ["Реквизит", <>
                {provReq.holder} · <span className="mono">{provReq.target}</span> <span className="muted">({bankName(provReq.bank)})</span>
              </>],
              ["Ссылка провайдера", <span className="mono muted">{provReq.extId}</span>],
              ["Банк", <strong>{bankName(order.bank)}</strong>],
            ]} />
          ) : (
            <KV items={[
              ["Trader", <>
                <strong>{window.traderName ? traderName(order.trader) : order.trader}</strong>
                <span className="mono muted" style={{ marginLeft: 8 }}>{order.trader}</span>
              </>],
              ["Терминал", term
                ? <button type="button" style={linkStyle} onClick={() => setLinkOpen({ kind: "terminal", id: term.id })}>
                    {term.device || term.name || term.id}
                  </button>
                : <span className="mono">{order.terminal}</span>],
              ["Реквизит", pd
                ? <button type="button" style={linkStyle} onClick={() => setLinkOpen({ kind: "pd", id: pd.id })}>
                    {pd.holder} · <span className="mono">{pd.target}</span> <span className="muted">({bankName(pd.bank)})</span>
                  </button>
                : <span className="mono">{order.details}</span>],
              ["Банк", <strong>{bankName(order.bank)}</strong>],
            ]} />
          )}
        </Section>

        <Section title="SMS / Push от банка">
          {order.source && order.source !== "—" ? (
            <Note tone="info">
              <div className="mono" style={{ fontSize: 12, marginBottom: 6 }}>
                {order.source} · {bankName(order.bank)} · {order.date}
              </div>
              <div>«Поступление {fmtMoney(order.amount, "RUB")}. Баланс счёта: 184 220,00 ₽. {bankName(order.bank)}»</div>
            </Note>
          ) : (
            <Empty>Сообщение от банка не получено</Empty>
          )}
        </Section>

        {order.dispute && (
          <Section title="Связанный спор">
            <Note tone="warn">
              Открыт спор <span className="mono">DSP-441</span> · Status: Open · Reason: «Не получил услугу»
            </Note>
          </Section>
        )}
      </Drawer>

      {linkOpen && linkOpen.kind === "terminal" && term && (
        <LinkedTerminalDrawer term={term} onClose={() => setLinkOpen(null)} />
      )}
      {linkOpen && linkOpen.kind === "pd" && pd && (
        <LinkedPdDrawer pd={pd} onClose={() => setLinkOpen(null)} />
      )}
    </>
  );
}

// ── Stacked drawer — sits on top of the parent drawer ───────────────────
function StackedDrawer({ title, id, status, statusMap, children, onClose, wide }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose && onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <>
      <div className="drawer-overlay" style={{ zIndex: 20, background: "rgba(28,26,23,0.18)" }} onClick={onClose} />
      <aside
        className={"drawer" + (wide ? " drawer--wide" : "")}
        style={{ zIndex: 21, right: 32, top: 32, bottom: 32, width: wide ? "min(760px, 86%)" : "min(580px, 86%)" }}
      >
        <header className="drawer__head">
          <h3>{title}</h3>
          {id && <span className="drawer__id">{id}</span>}
          {status && statusMap && <StatusPill map={statusMap} value={status} />}
          <button className="drawer__close" onClick={onClose} aria-label="Закрыть">✕</button>
        </header>
        <div className="drawer__body">{children}</div>
      </aside>
    </>
  );
}

// ── Compact terminal info, used inside the stacked drawer ───────────────
function LinkedTerminalDrawer({ term, onClose }) {
  const pds = (window.PAYMENT_DETAILS || []).filter((p) => p.terminal === term.id);
  return (
    <StackedDrawer
      title="Терминал"
      id={term.id}
      status={term.status}
      statusMap={TERMINAL_STATUS}
      onClose={onClose}
      wide
    >
      <Section title="Устройство">
        <KV items={[
          ["Модель", term.device || term.name || "—"],
          ["Трейдер", <>
            <strong>{term.traderName || (window.traderName ? traderName(term.trader) : term.trader)}</strong>
            <span className="mono muted" style={{ marginLeft: 8 }}>{term.trader}</span>
          </>],
          ["SIM", <span className="mono">{term.phone || "—"}</span>],
          ["Версия приложения", <span className="mono">{term.appVersion || "—"}</span>],
          ["Заряд", typeof term.battery === "number"
            ? <strong style={{ color: term.battery < 20 ? "var(--bad)" : term.battery < 40 ? "var(--warn)" : "var(--ok)" }}>{term.battery}%</strong>
            : "—"],
          ["Heartbeat", <span className="mono">{term.heartbeat || term.lastHeartbeat || "—"}</span>],
        ]} />
      </Section>

      <Section title={"Привязанные реквизиты (" + pds.length + ")"}>
        {pds.length === 0 ? <Empty>Нет привязанных реквизитов</Empty> :
          <table className="table table--inset">
            <thead><tr><th>ID</th><th>Метод</th><th>Банк</th><th>Реквизит</th><th>Статус</th></tr></thead>
            <tbody>
              {pds.map((p) =>
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td><span className={"pd-card__method pd-card__method--" + p.method}>
                    {p.method === "sbp" ? "СБП" : p.method === "card" ? "Карта" : p.method === "c2c" ? "C2C" : p.method === "phone" ? "Phone" : p.method === "account" ? "Счёт" : p.method}
                  </span></td>
                  <td>{bankName(p.bank)}</td>
                  <td className="mono">{p.target}</td>
                  <td><StatusPill map={PD_STATUS} value={p.status} /></td>
                </tr>
              )}
            </tbody>
          </table>
        }
      </Section>
    </StackedDrawer>
  );
}

// ── Compact payment-detail info, used inside the stacked drawer ──────────
function LinkedPdDrawer({ pd, onClose }) {
  const term = (window.TERMINALS || []).find((t) => t.id === pd.terminal);
  const recent = (window.PAY_IN || []).filter((o) => o.details === pd.id).slice(0, 6);
  return (
    <StackedDrawer
      title="Реквизит"
      id={pd.id}
      status={pd.status}
      statusMap={PD_STATUS}
      onClose={onClose}
      wide
    >
      <Section title="Реквизит">
        <KV items={[
          ["Метод", <span className={"pd-card__method pd-card__method--" + pd.method}>
            {pd.method === "sbp" ? "СБП" : pd.method === "card" ? "Карта" : pd.method === "c2c" ? "C2C" : pd.method === "phone" ? "Phone" : pd.method === "account" ? "Счёт" : pd.method}
          </span>],
          ["Банк", <strong>{bankName(pd.bank)}</strong>],
          ["Держатель", pd.holder],
          ["Цель / номер", <span className="mono"><strong>{pd.target}</strong></span>],
          ["Привязка к терминалу", term
            ? <>{term.device || term.name || term.id} <span className="muted mono">({term.id})</span></>
            : <span className="mono">{pd.terminal}</span>],
          ["Трейдер", <>
            <strong>{window.traderName ? traderName(pd.trader) : pd.trader}</strong>
            <span className="mono muted" style={{ marginLeft: 8 }}>{pd.trader}</span>
          </>],
        ]} />
      </Section>

      <Section title="Лимиты">
        <KV items={[
          ["Мин. сумма заявки", pd.min != null ? fmtMoney(pd.min, "RUB") : "—"],
          ["Макс. сумма заявки", pd.max != null ? fmtMoney(pd.max, "RUB") : "—"],
          ["Успешность", pd.success != null ? <strong>{Math.round(pd.success * 100)}%</strong> : "—"],
        ]} />
      </Section>

      <Section title="Последние платежи">
        {recent.length === 0 ? <Empty>Платежей нет</Empty> :
          <table className="table table--inset">
            <thead><tr><th>ID</th><th>Дата</th><th className="num">Сумма</th><th>Статус</th></tr></thead>
            <tbody>
              {recent.map((o) =>
                <tr key={o.id}>
                  <td className="mono">{o.id}</td>
                  <td className="mono">{o.date}</td>
                  <td className="num">{fmtMoney(o.amount, "RUB")}</td>
                  <td><StatusPill map={PAY_IN_STATUS} value={o.status} /></td>
                </tr>
              )}
            </tbody>
          </table>
        }
      </Section>
    </StackedDrawer>
  );
}

Object.assign(window, {
  PayInDrawerV2,
  LinkedTerminalDrawer, LinkedPdDrawer, StackedDrawer, CopyId,
  piProviderRequisite, piIsProviderOrder, piProviderOf, piMethodLabel,
});
