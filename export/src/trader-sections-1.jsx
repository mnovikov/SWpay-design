// Trader app — sections part 1: Dashboard, PayIn, PayOut, Terminals, Реквизиты
// Соответствует ТЗ v4 (M.Novikov, 30.04.2026)

const METHOD_LABEL = {
  sbp: "СБП",
  card: "Карта",
  c2c: "Card-to-Card",
  phone: "По номеру телефона",
  account: "Расчётный счёт"
};

// ─── helpers ─────────────────────────────────────────────────────────────
function Bar({ v, w = 64 }) {
  const pct = Math.max(0, Math.min(1, v));
  const tone = pct > 0.85 ? "bad" : pct > 0.6 ? "warn" : "ok";
  return (
    <span className="bar">
      <span className={"bar__fill bar__fill--" + tone} style={{ width: w }}>
        <i style={{ width: pct * 100 + "%" }} />
      </span>
      <span className="bar__label mono">{Math.round(pct * 100)}%</span>
    </span>);

}

function shortId(value, n = 6) {
  const s = String(value || "");
  return s.length > n ? s.slice(-n) : s;
}

function CopyId({ value, short }) {
  const [done, setDone] = React.useState(false);
  const display = short ? shortId(value) : value;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }} title={short ? String(value) : undefined}>
      <span className="mono">{display}</span>
      <button
        type="button"
        title={done ? "Скопировано" : "Скопировать"}
        onClick={(e) => {
          e.stopPropagation();
          if (navigator.clipboard) navigator.clipboard.writeText(String(value));
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        }}
        style={{
          all: "unset",
          cursor: "pointer",
          width: 18, height: 18,
          display: "inline-grid", placeItems: "center",
          borderRadius: 4,
          color: done ? "var(--ok)" : "var(--ink-3)",
          fontSize: 12,
          opacity: 0.7
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}>
        
        {done ? "✓" :
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="9" height="9" rx="1.5" />
            <path d="M11 4V3a1 1 0 0 0-1-1H3.5a1 1 0 0 0-1 1v7" />
          </svg>
        }
      </button>
    </span>);

}

function MoneyBig({ rub, usdt }) {
  return (
    <div className="money-big">
      <div className="money-big__usdt">{fmtMoney(usdt, "USDT")}</div>
      <div className="money-big__rub muted">≈ {fmtMoney(rub, "RUB")}</div>
    </div>);

}

function tone(v) {
  if (v > 0.85) return "bad";
  if (v > 0.6) return "warn";
  return "ok";
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────
function TraderDashboard({ go }) {
  const freePO = PAY_OUT.filter((o) => o.status === "free");
  const myActivePO = PAY_OUT.filter((o) => o.takenBy === ME.id && ["in-progress", "waiting-review"].includes(o.status));
  const recentPI = PAY_IN.slice(0, 5);
  const openDisputes = DISPUTES.filter((d) => ["open", "waiting-trader"].includes(d.status));

  const [period, setPeriod] = React.useState("today");

  // Базовые «сегодняшние» цифры
  const baseIn  = 682400;
  const baseOut = BALANCES.todayPayOutRub;
  const baseProfitIn  = PAY_IN.filter((o) => o.status === "completed").reduce((s, o) => s + (o.commissionUsdt || 0), 0);
  const baseProfitOut = PAY_OUT.filter((o) => o.takenBy === ME.id && o.status === "completed")
    .reduce((s, o) => s + (o.commissionUsdt || o.amount / ME.usdtRate * 0.02), 0);

  // Множители и заголовки по периоду
  const PERIODS = {
    "hour":      { label: "Час",          title: "за час",          k: 0.07, conv: 100, total: 3 },
    "today":     { label: "Сегодня",      title: "сегодня",          k: 1,    conv: 94,  total: 48 },
    "yesterday": { label: "Вчера",        title: "вчера",            k: 0.92, conv: 91,  total: 44 },
    "month":     { label: "Месяц",        title: "за месяц",         k: 22.4, conv: 92,  total: 1074 },
    "all":       { label: "Всё",          title: "за всё время",     k: 184.6, conv: 90, total: 8821 },
  };
  const p = PERIODS[period];
  const periodChips = Object.keys(PERIODS).map((id) => ({ value: id, label: PERIODS[id].label }));

  const payInRub      = Math.round(baseIn  * p.k);
  const payOutRub     = Math.round(baseOut * p.k);
  const profitInUsdt  = (payInRub  / ME.usdtRate) * 0.065;
  const profitOutUsdt = (payOutRub / ME.usdtRate) * 0.035;
  const profitTotal   = profitInUsdt + profitOutUsdt;

  return (
    <>
      <FilterChips filters={periodChips} value={period} onChange={setPeriod} />

      {/* Балансы */}
      <div className="hero-grid hero-grid--3" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="hero-card" onClick={() => go("payin")} style={{ cursor: "pointer" }}>
          <div className="hero-card__label">Платежи {p.title}</div>
          <div className="hero-card__value">{fmtMoney(payInRub / ME.usdtRate, "USDT")}</div>
          <div className="hero-card__sub">{fmtMoney(payInRub, "RUB")} · профит <b>{profitInUsdt.toFixed(2)} USDT</b></div>
        </div>
        <div className="hero-card" onClick={() => go("payout")} style={{ cursor: "pointer" }}>
          <div className="hero-card__label">Выплаты {p.title}</div>
          <div className="hero-card__value">{fmtMoney(payOutRub / ME.usdtRate, "USDT")}</div>
          <div className="hero-card__sub">{fmtMoney(payOutRub, "RUB")} · профит <b>{profitOutUsdt.toFixed(2)} USDT</b></div>
        </div>
      </div>

      {/* Сегодня */}
      <div className="stat-row">
        <div className="stat" onClick={() => go("finance")} style={{ cursor: "pointer" }}>
          <div className="stat__label">Профит {p.title}</div>
          <div className="stat__value">{fmtMoney(profitTotal, "USDT")}</div>
          <div className="stat__delta"><span className="mono" style={{ color: "var(--ink-3)" }}>↓</span> <b style={{ fontWeight: 700, color: "var(--ink)" }}>{profitInUsdt.toFixed(2)}</b> · <span className="mono" style={{ color: "var(--ink-3)" }}>↑</span> <b style={{ fontWeight: 700, color: "var(--ink)" }}>{profitOutUsdt.toFixed(2)}</b></div>
        </div>
        <div className="stat" onClick={() => go("disputes")} style={{ cursor: "pointer" }}>
          <div className="stat__label">Активные споры</div>
          <div className="stat__value">{DISPUTES.filter((d) => ["open", "waiting-trader", "waiting-admin"].includes(d.status)).length}</div>
          <div className="stat__delta"><b style={{ fontWeight: 700, color: "var(--ink)" }}>{fmtMoney(DISPUTES.filter((d) => ["open", "waiting-trader", "waiting-admin"].includes(d.status)).reduce((s, d) => s + (d.amount || 0), 0) / ME.usdtRate, "USDT")}</b></div>
        </div>
        <div className="stat">
          <div className="stat__label">Курс RAPIRA</div>
          <div className="stat__value">{ME.usdtRate.toFixed(2)} <span style={{ fontSize: "0.55em", fontWeight: 500, color: "var(--ink-3)", letterSpacing: "0.04em" }}>₽/USDT</span></div>
          <div className="stat__delta mono">12:47 · 14.05.2026</div>
        </div>
        <div className="stat" onClick={() => go("payin")} style={{ cursor: "pointer" }}>
          <div className="stat__label">Конверсия</div>
          <div className="stat__value">{p.conv}%</div>
          <div className="stat__delta">{Math.round(p.total * p.conv / 100)} из {p.total} платежей</div>
        </div>
      </div>

      {/* Свободные выплаты и далее — убраны */}
    </>);

}

// ─── PAYIN ────────────────────────────────────────────────────────────────
function TraderPayIn({ initFilter }) {
  const [filter, setFilter] = React.useState("all");
  React.useEffect(() => {
    if (initFilter && initFilter.value) setFilter(initFilter.value);
  }, [initFilter && initFilter.key]);
  const [openId, setOpenId] = React.useState(null);
  const [confirmCloseId, setConfirmCloseId] = React.useState(null);
  const [closedManual, setClosedManual] = React.useState({});  // id -> closedAt
  const getKind = (o) => closedManual[o.id] ? "manual" : (o.closedBy || (o.source === "SMS" || o.source === "Push" ? "auto" : "manual"));
  const getClosedAt = (o) => closedManual[o.id] || o.closedAt;
  const isClosed = (o) => o.status === "completed" || !!closedManual[o.id];
  const filters = [
  { value: "all", label: "Все", count: PAY_IN.length },
  { value: "in-progress", label: "В работе", count: PAY_IN.filter((o) => ["waiting-payment", "disputed"].includes(o.status)).length },
  { value: "completed", label: "Успешные", count: PAY_IN.filter((o) => o.status === "completed").length },
  { value: "failed", label: "Не выполнены", count: PAY_IN.filter((o) => ["failed", "expired"].includes(o.status)).length }];

  const visible = PAY_IN.filter((o) => {
    if (filter === "all") return true;
    if (filter === "in-progress") return ["waiting-payment", "disputed"].includes(o.status);
    if (filter === "failed") return ["failed", "expired"].includes(o.status);
    return o.status === filter;
  });
  const open = PAY_IN.find((o) => o.id === openId);

  return (
    <>
      <FilterChips filters={filters} value={filter} onChange={setFilter} />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Статус</th>
              <th>Реквизит</th>
              <th className="num">Сумма</th>
              <th className="num">Профит</th>
              <th>ID заявки</th>
              <th>Создана</th>
              <th>Закрыто</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => {
              const pd = PAYMENT_DETAILS.find((p) => p.id === o.details);
              const rate = ME.usdtRate;
              const usdt = o.amount / rate;
              const fee = usdt * 0.02;
              const isOk = isClosed(o);
              const kind = isOk ? getKind(o) : null;
              const closedAt = getClosedAt(o);
              return (
                <tr key={o.id} className={openId === o.id ? "is-selected" : ""} onClick={() => setOpenId(o.id)}>
                <td>
                  {isOk
                    ? <Pill tone="ok">Успешно — {kind === "auto" ? "Auto" : "Manual"}</Pill>
                    : <StatusPill map={PAY_IN_STATUS} value={o.status} />}
                </td>
                <td>
                  {pd ?
                    <>
                      <div>{pd.holder}</div>
                      <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{pd.target}</div>
                    </> :
                    <span className="mono">{o.details}</span>}
                </td>
                <td className="num" style={{ fontFamily: "\"Inter Tight\"" }}>
                  {fmtMoney(o.amount, "RUB")}
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{usdt.toFixed(2)} USDT</div>
                </td>
                <td className="num mono">{isOk ? <>{fee.toFixed(2)} <span className="muted">USDT</span></> : <span className="muted">—</span>}</td>
                <td><CopyId value={o.id} short />{o.dispute && <span className="dot-dispute"> ●</span>}</td>
                <td className="mono">{o.date}</td>
                <td className="mono">{closedAt || <span className="muted">—</span>}</td>
              </tr>);
            })}
          </tbody>
        </table>
        <div className="table-foot">Показано <strong>{visible.length}</strong> из <strong>{PAY_IN.length}</strong></div>
      </div>

      {open && <PayInDrawer order={open} onClose={() => setOpenId(null)} />}

      {confirmCloseId && (() => {
        const o = PAY_IN.find((x) => x.id === confirmCloseId);
        if (!o) return null;
        return (
          <Modal
            title="Закрыть платёж вручную?"
            onClose={() => setConfirmCloseId(null)}
            footer={<>
              <Btn onClick={() => setConfirmCloseId(null)}>Отмена</Btn>
              <span className="spacer" />
              <Btn variant="ok" onClick={() => {
                const now = new Date();
                const pad = (n) => String(n).padStart(2, "0");
                const ts = `${pad(now.getDate())}.${pad(now.getMonth()+1)} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
                setClosedManual((m) => ({ ...m, [o.id]: ts }));
                setConfirmCloseId(null);
              }}>Закрыть успешно</Btn>
            </>}
          >
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              Подтвердите ручное закрытие заявки <strong className="mono">{o.id}</strong> на сумму <strong>{fmtMoney(o.amount, "RUB")}</strong>.
              <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                Платёж будет помечен как «Успешно — Manual». Действие нельзя отменить.
              </div>
            </div>
          </Modal>
        );
      })()}
    </>);

}

// ─── PAYOUT ───────────────────────────────────────────────────────────────
function TraderPayOut({ initFilter }) {
  const [filter, setFilter] = React.useState("free");
  React.useEffect(() => {
    if (initFilter && initFilter.value) setFilter(initFilter.value);
  }, [initFilter && initFilter.key]);
  const [openId, setOpenId] = React.useState(null);
  const filters = [
  { value: "free", label: "Свободные", count: PAY_OUT.filter((o) => o.status === "free").length },
  { value: "mine", label: "Мои в работе", count: PAY_OUT.filter((o) => o.takenBy === ME.id && ["in-progress", "waiting-review"].includes(o.status)).length },
  { value: "completed", label: "Выполненные", count: PAY_OUT.filter((o) => o.takenBy === ME.id && o.status === "completed").length },
  { value: "rejected", label: "Отклонённые", count: PAY_OUT.filter((o) => o.takenBy === ME.id && o.status === "rejected").length },
  { value: "disputed", label: "Спор", count: PAY_OUT.filter((o) => o.status === "disputed").length },
  { value: "all", label: "Все", count: PAY_OUT.length }];

  const visible = PAY_OUT.filter((o) => {
    if (filter === "all") return true;
    if (filter === "free") return o.status === "free";
    if (filter === "mine") return o.takenBy === ME.id && ["in-progress", "waiting-review"].includes(o.status);
    if (filter === "completed") return o.takenBy === ME.id && o.status === "completed";
    if (filter === "rejected") return o.takenBy === ME.id && o.status === "rejected";
    if (filter === "disputed") return o.status === "disputed";
    return true;
  });
  const open = PAY_OUT.find((o) => o.id === openId);

  return (
    <>
      <FilterChips filters={filters} value={filter} onChange={setFilter} />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 110 }}>Статус</th>
              <th>Получатель</th>
              <th className="num">Сумма</th>
              <th className="num">Профит</th>
              <th>Создана</th>
              <th>ID</th>
              <th>Метод</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => {
              const rate = ME.usdtRate;
              const usdt = o.amount / rate;
              const bankRow = TARIFF.banks.find((b) => b.bank === o.customerBank);
              const ratePct = bankRow ? bankRow.payOutTrader : TARIFF.payOutRateTrader;
              const fee = usdt * (ratePct / 100);
              const isOk = o.status === "completed";
              const showPd = isOk || o.status === "in-progress" || o.status === "waiting-review";
              const myPd = PAYMENT_DETAILS.find((p) => p.bank === o.customerBank && p.status === "active") || PAYMENT_DETAILS.find((p) => p.bank === o.customerBank);
              return (
                <tr key={o.id} className={openId === o.id ? "is-selected" : ""} onClick={() => setOpenId(o.id)}>
                <td><StatusPill map={PAY_OUT_STATUS} value={o.status} /></td>
                <td>
                  <div><span className="muted">{bankName(o.customerBank)}</span> {o.customerName}</div>
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{o.customerTarget}</div>
                </td>
                <td className="num">
                  {fmtMoney(o.amount, "RUB")}
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{usdt.toFixed(2)} USDT</div>
                </td>
                <td className="num mono">{fee.toFixed(2)} <span className="muted">USDT</span></td>
                <td className="mono">{o.date}</td>
                <td><CopyId value={o.id} short /></td>
                <td>
                  <div>{myPd ? METHOD_LABEL[myPd.method] || myPd.method : o.customerTarget && /^\+?\d/.test(o.customerTarget) ? METHOD_LABEL.sbp : METHOD_LABEL.card}</div>
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{bankName(o.customerBank)}</div>
                </td>
                <td className="num">
                  {o.status === "free" &&
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                      <Btn size="sm" variant="primary" onClick={(e) => {e.stopPropagation();setOpenId(o.id);}}>Взять</Btn>
                      <span className="mono muted" style={{ fontSize: 11 }}>⧖ {o.deadlineMin} мин</span>
                    </div>
                    }
                  {o.status === "in-progress" && o.takenBy === ME.id &&
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                      <Btn size="sm" variant="ok" onClick={(e) => {e.stopPropagation();setOpenId(o.id);}}>Чек</Btn>
                      <span className="mono muted" style={{ fontSize: 11 }}>⧖ {o.deadlineMin} мин</span>
                    </div>
                    }
                  {(o.status === "completed" || o.status === "waiting-review") &&
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <Btn size="sm" variant="ghost" onClick={(e) => {e.stopPropagation();}}><span className="mono">↧</span> Чек</Btn>
                    </div>
                    }
                </td>
              </tr>);
            })}
          </tbody>
        </table>
        <div className="table-foot">Показано <strong>{visible.length}</strong> из <strong>{PAY_OUT.length}</strong></div>
      </div>

      {open && <PayOutDrawer order={open} onClose={() => setOpenId(null)} />}
    </>);

}

function PayInDrawer({ order, onClose }) {
  const [linkOpen, setLinkOpen] = React.useState(null);
  const term = TERMINALS.find((t) => t.id === order.terminal);
  const pd = PAYMENT_DETAILS.find((p) => p.id === order.details);

  const linkStyle = {
    background: "none",
    border: "none",
    padding: 0,
    margin: 0,
    font: "inherit",
    color: "inherit",
    cursor: "pointer",
    textAlign: "left",
    borderBottom: "1px dashed var(--ink-3)",
    transition: "color 120ms, border-color 120ms",
  };

  return (
    <>
    <Drawer
      title="Платёж"
      status={order.status}
      statusMap={PAY_IN_STATUS}
      onClose={onClose}
      wide
      extraTags={order.expiresAt && <span className="dispute-sla mono">⏱ {(String(order.expiresAt).match(/через\s+([^)]+)/) || [, order.expiresAt])[1]}</span>}
      footer={<>
        <span className="spacer" />
        {order.status === "waiting-payment"
          ? <Btn variant="ok">Подтвердить вручную</Btn>
          : null}
      </>}
    >
      <Section title="Сводка">
        <KV items={[
          ["ID", <CopyId value={order.id} />],
          ["Сумма", <strong>{fmtMoney(order.amount, "RUB")}</strong>],
          ["Эквивалент в USDT", <span className="mono">≈ {fmtMoney(order.amount / ME.usdtRate, "USDT")}</span>],
          ["Курс обмена", <span className="mono">{ME.usdtRate.toFixed(2)} ₽/USDT</span>],
          ["Создана", <span className="mono">{order.date}</span>],
          ["Время до подтверждения", <span className="mono">{order.payTime}</span>],
          ["Комиссия трейдера", <strong>{fmtMoney(order.commissionUsdt, "USDT")}</strong>],
        ]} />
      </Section>

      <Section title="Куда поступил платёж">
        <KV items={[
          ["Терминал", term
            ? <button type="button" style={linkStyle} onClick={() => setLinkOpen({ kind: "terminal", id: term.id })}>
                {term.name} <span className="muted mono">({order.terminal})</span>
              </button>
            : <span className="mono">{order.terminal}</span>],
          ["Реквизит", pd
            ? <button type="button" style={linkStyle} onClick={() => setLinkOpen({ kind: "pd", id: pd.id })}>
                {pd.holder} · <span className="mono">{pd.target}</span> <span className="muted">({bankName(pd.bank)})</span>
              </button>
            : <span className="mono">{order.details}</span>],
        ]} />
      </Section>

      <Section title="SMS / Push от банка">
        {order.source !== "—" ? (
          <Note tone="info">
            <div className="mono" style={{ fontSize: 12, marginBottom: 6 }}>{order.source} · {bankName(order.bank)} · {order.date}</div>
            <div>«Поступление {fmtMoney(order.amount, "RUB")}. Баланс счёта: 184 220,00 ₽. {bankName(order.bank)}»</div>
          </Note>
        ) : (
          <Empty>Сообщение от банка не получено</Empty>
        )}
      </Section>

      {order.timeline && (
        <Section title="История статусов">
          <Timeline items={order.timeline.map((t) => ({ time: t.ts, text: t.label }))} />
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

// Reusable drawer body for one terminal — used by both Terminals page and PayIn link
function TerminalDrawerBody({ open }) {
  return (
    <>
      <Section title="Устройство">
        <KV items={[
          ["Модель", open.name],
          ["SIM", <span className="mono">{open.phone}</span>],
          ["Версия приложения", <span className="mono">{open.appVersion}</span>],
          ["Заряд", <strong style={{ color: open.battery < 20 ? "var(--bad)" : open.battery < 40 ? "var(--warn)" : "var(--ok)" }}>{open.battery}%</strong>],
          ["Heartbeat", <span className="mono">{open.lastHeartbeat}</span>],
          ["Заметка", open.notes || "—"],
          ...(open.offlineReason ? [["Причина offline", <span style={{ color: "var(--bad)" }}>{open.offlineReason}</span>]] : []),
        ]} />
      </Section>

      <Section title={"Привязанные реквизиты (" + PAYMENT_DETAILS.filter((p) => p.terminal === open.id).length + ")"}>
        <table className="table table--inset">
          <thead><tr><th>ID</th><th>Метод</th><th>Банк</th><th>Реквизит</th><th>Статус</th></tr></thead>
          <tbody>
            {PAYMENT_DETAILS.filter((p) => p.terminal === open.id).map((p) =>
              <tr key={p.id}>
                <td className="mono">{p.id}</td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(p.methods || [p.method]).map((m) => (
                      <span key={m} className={"pd-card__method pd-card__method--" + m}>
                        {m === "sbp" ? "СБП" : m === "card" ? "Карта" : m === "c2c" ? "C2C" : m === "phone" ? "Phone" : m === "account" ? "Счёт" : m}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{bankName(p.bank)}</td>
                <td className="mono">{p.target}</td>
                <td><StatusPill map={PD_STATUS} value={p.status} /></td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>

      <Section title={"Лог сообщений сегодня (" + (open.sms?.length || 0) + ")"}>
        {(open.sms?.length || 0) === 0 ? <Empty>Сообщений пока нет</Empty> :
          <table className="table table--inset">
            <thead><tr><th>Время</th><th>Источник</th><th>Банк</th><th className="num">Сумма</th><th>Текст</th></tr></thead>
            <tbody>
              {open.sms.map((s, i) =>
                <tr key={i} style={!s.parsed ? { background: "var(--bad-soft)" } : null}>
                  <td className="mono">{s.time}</td>
                  <td className="mono">{s.kind}</td>
                  <td>{s.bank}</td>
                  <td className="num">{s.parsed ? fmtMoney(s.amount, "RUB") : <span style={{ color: "var(--bad)" }}>не распознано</span>}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{s.msg}</td>
                </tr>
              )}
            </tbody>
          </table>
        }
      </Section>
    </>
  );
}

// Reusable drawer body for one payment detail — used by both PD page and PayIn link
function PdDrawerBody({ open }) {
  return (
    <>
      {open.blockReason && <Note tone="bad">{open.blockReason}</Note>}

      <Section title="Реквизит">
        <KV items={[
          ["Методы", <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {(open.methods || [open.method]).map((m) => (
              <span key={m} className={"pd-card__method pd-card__method--" + m}>
                {m === "sbp" ? "СБП" : m === "card" ? "Карта" : m === "c2c" ? "C2C" : m === "phone" ? "Phone" : m === "account" ? "Счёт" : m}
              </span>
            ))}
          </div>],
          ["Банк", <strong>{bankName(open.bank)}</strong>],
          ["Держатель", open.holder],
          ["Цель / номер", <span className="mono"><strong>{open.target}</strong></span>],
          ["Привязка к терминалу", (() => {
            const term = TERMINALS.find((t) => t.id === open.terminal);
            return <>{term ? term.name : open.terminal} <span className="muted mono">({open.terminal})</span></>;
          })()],
        ]} />
      </Section>

      <Section title="Лимиты">
        <KV items={[
          ["Мин. сумма заявки", fmtMoney(open.minAmount, "RUB")],
          ["Макс. сумма заявки", fmtMoney(open.maxAmount, "RUB")],
          ["Дневной лимит", <><Bar v={open.dailyUsed} /> {fmtMoney(open.todayVolumeRub, "RUB")} / {fmtMoney(open.dailyLimit, "RUB")}</>],
          ["Месячный лимит", <><Bar v={open.monthlyUsed} /> {fmtMoney(open.monthVolumeRub, "RUB")} / {fmtMoney(open.monthlyLimit, "RUB")}</>],
          ["Операций сегодня", <>{open.opsToday} / {open.opsLimit}</>],
          ["Задержка между платежами", <span className="mono">{open.paymentDelaySec ? open.paymentDelaySec >= 60 ? Math.floor(open.paymentDelaySec / 60) + " мин" + (open.paymentDelaySec % 60 ? " " + open.paymentDelaySec % 60 + " сек" : "") : open.paymentDelaySec + " сек" : "—"}</span>],
          ["Успешность", <strong>{Math.round(open.success * 100)}%</strong>],
        ]} />
      </Section>

      <Section title="Последние платежи">
        {PAY_IN.filter((o) => o.details === open.id).length === 0 ? <Empty>Платежей нет</Empty> :
          <table className="table table--inset">
            <thead><tr><th>ID</th><th>Дата</th><th className="num">Сумма</th><th>Статус</th></tr></thead>
            <tbody>
              {PAY_IN.filter((o) => o.details === open.id).slice(0, 8).map((o) =>
                <tr key={o.id}>
                  <td className="mono" title={o.id}>{shortId(o.id)}</td>
                  <td className="mono">{o.date}</td>
                  <td className="num">{fmtMoney(o.amount, "RUB")}</td>
                  <td><StatusPill map={PAY_IN_STATUS} value={o.status} /></td>
                </tr>
              )}
            </tbody>
          </table>
        }
      </Section>
    </>
  );
}

// Stacked drawer used to display terminal / PD details on top of a payment drawer.
// Same look as Drawer but with higher z-index + slightly inset so the original drawer remains visible behind.
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

function LinkedTerminalDrawer({ term, onClose }) {
  return (
    <StackedDrawer title="Терминал" id={term.id} status={term.status} statusMap={TERMINAL_STATUS} onClose={onClose} wide>
      <TerminalDrawerBody open={term} />
    </StackedDrawer>
  );
}

function LinkedPdDrawer({ pd, onClose }) {
  return (
    <StackedDrawer title="Реквизит" id={pd.id} status={pd.status} statusMap={PD_STATUS} onClose={onClose} wide>
      <PdDrawerBody open={pd} />
    </StackedDrawer>
  );
}

function PayOutDrawer({ order, onClose }) {
  const isFree = order.status === "free";
  const isMine = order.takenBy === ME.id;
  const inWork = isMine && order.status === "in-progress";
  const waitingReview = isMine && order.status === "waiting-review";

  return (
    <Drawer
      title="Выплата"
      status={order.status}
      statusMap={PAY_OUT_STATUS}
      onClose={onClose}
      wide
      extraTags={(isFree || inWork) && <span className="dispute-sla mono">⏱ {order.deadlineMin} мин</span>}
      footer={
      isFree ?
      <>
            <Btn variant="ghost" title="Заявка вернётся в пул, без штрафа но с уменьшением рейтинга">Не могу взять</Btn>
            <span className="spacer" />
            <Btn variant="primary">Взять в работу</Btn>
          </> :
      inWork ?
      <>
            <Btn variant="ghost">Вернуть в пул</Btn>
            <span className="spacer" />
            <Btn variant="ok">Перевод сделан → загрузить чек</Btn>
          </> :
      waitingReview ?
      <>
            <Btn variant="ghost">Открыть спор</Btn>
            <span className="spacer" />
            <Btn variant="ghost" disabled>Ждём проверки саппорта</Btn>
          </> :

      <>
            <Btn variant="ghost">Открыть спор</Btn>
            <span className="spacer" />
          </>

      }>
      
      <Section title="Куда платить">
        <KV items={[
        ["Сумма к переводу", <strong>{fmtMoney(order.amount, "RUB")}</strong>],
        ["Куда", <span className="mono"><strong>{order.customerTarget}</strong></span>],
        ["Банк получателя", <strong>{bankName(order.customerBank)}</strong>],
        ["Имя", order.customerName],
        ["Мерчант", order.merchant],
        ["Создана", <span className="mono">{order.date}</span>],
        ["ID", <CopyId value={order.id} />]]
        } />
      </Section>

      {isFree && null}

      <Section title="Расчёт">
        <KV items={[
        ["Эквивалент", <span className="mono">≈ {fmtMoney(order.amount / ME.usdtRate, "USDT")}</span>],
        ["Тариф PayOut", "2.0%"],
        ["Ваша комиссия", <strong>{fmtMoney(order.commissionUsdt, "USDT")}</strong>]]
        } />
      </Section>

      <Section title="Чек / подтверждение">
        {order.proof === "uploaded" ?
        <PlaceholderImg label={"Чек по " + order.id + (order.proofTime ? " · " + order.proofTime : "")} h={160} /> :
        order.proof === "rejected" ?
        <Note tone="bad">Чек отклонён саппортом: «Не читается номер операции». Загрузите новый чек.</Note> :
        inWork ?
        <div>
            <PlaceholderImg label="Перетащите файл чека или нажмите «Загрузить»" h={120} />
            <div style={{ marginTop: 8 }}><Btn variant="ghost" size="sm">📎 Загрузить чек</Btn></div>
          </div> :
        <Empty>Чек ещё не загружен</Empty>}
      </Section>

      {order.timeline &&
      <Section title="История">
          <Timeline items={order.timeline.map((t) => ({ time: t.ts, text: t.label }))} />
        </Section>
      }
    </Drawer>);

}

// ─── TERMINALS ───────────────────────────────────────────────────────────
function TraderTerminals() {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [displayed, setDisplayed] = React.useState(filter);
  const [fading, setFading] = React.useState(false);
  React.useEffect(() => {
    if (filter === displayed) return;
    setFading(true);
    const t = setTimeout(() => { setDisplayed(filter); setFading(false); }, 180);
    return () => clearTimeout(t);
  }, [filter, displayed]);

  const filters = [
  { value: "all", label: "Все", count: TERMINALS.length },
  { value: "online", label: "Online", count: TERMINALS.filter((t) => t.status === "online").length },
  { value: "offline", label: "Offline", count: TERMINALS.filter((t) => t.status === "offline").length }];

  const visible = TERMINALS.filter((t) => displayed === "all" || t.status === displayed);
  const open = TERMINALS.find((t) => t.id === openId);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FilterChips filters={filters} value={filter} onChange={setFilter} />
        </div>
        <Btn variant="primary" size="sm" style={{ borderRadius: 999, padding: "6px 14px", fontSize: 13 }} onClick={() => setShowAdd(true)}>Привязать терминал</Btn>
      </div>

      <div className={"term-grid" + (fading ? " is-fading" : "")} key={displayed}>
        {visible.map((t) => {
          const batteryTone = t.battery < 20 ? "bad" : t.battery < 40 ? "warn" : "ok";
          const isOffline = t.status === "offline";
          const pdCount = PAYMENT_DETAILS.filter((p) => p.terminal === t.id).length;
          return (
            <div
              key={t.id}
              className={"term-card" + (isOffline ? " term-card--offline" : "") + (openId === t.id ? " is-selected" : "")}
              onClick={() => setOpenId(t.id)}>
              <div className="term-card__head">
                <div style={{ minWidth: 0 }}>
                  <div className="term-card__id">{t.id}</div>
                  <div className="term-card__name">{t.name}</div>
                  <div className="term-card__sim">{t.phone}</div>
                </div>
                <div className="term-card__head-r">
                  <StatusPill map={TERMINAL_STATUS} value={t.status} />
                  <div className="term-card__ver">v{t.appVersion}</div>
                </div>
              </div>

              <div className="term-card__stats">
                <div className="term-card__stat">
                  <div className="term-card__stat-label">Заряд</div>
                  <div className="term-card__battery">
                    <span className={"term-card__battery-bar term-card__battery--" + batteryTone}>
                      <i style={{ width: Math.max(4, t.battery) + "%" }} />
                    </span>
                    <span className={"term-card__battery-num is-" + batteryTone}>{t.battery}%</span>
                  </div>
                </div>
                <div className="term-card__stat">
                  <div className="term-card__stat-label">SMS / Push</div>
                  <div className="term-card__stat-value">
                    {t.smsToday + t.pushToday}
                    {t.smsErrorsToday > 0 && <span className="is-bad"> · {t.smsErrorsToday} err</span>}
                  </div>
                </div>
              </div>

              <div className="term-card__foot">
                <svg className="term-card__foot-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 1.5" strokeLinecap="round" />
                </svg>
                <span className="mono">{t.lastHeartbeat}</span>
                <span style={{ marginLeft: "auto" }} className={"term-card__note" + (isOffline && t.offlineReason ? " term-card__note--bad" : "")}>
                  {isOffline && t.offlineReason ? t.offlineReason : (t.notes || "—")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {open &&
      <Drawer
        title="Терминал"
        id={open.id}
        status={open.status}
        statusMap={TERMINAL_STATUS}
        onClose={() => setOpenId(null)}
        wide
        footer={<>
            <Btn variant="ghost">Перепарить (QR)</Btn>
            <span className="spacer" />
            {open.status === "online" ?
          <Btn variant="danger">Отключить</Btn> :
          <Btn variant="ok">Активировать</Btn>}
          </>}>
        
          <TerminalDrawerBody open={open} />
        </Drawer>
      }

      {showAdd &&
      <Modal
        title="Привязать новый терминал"
        onClose={() => setShowAdd(false)}
        footer={<>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Закрыть</Btn>
            <span className="spacer" />
            <Btn variant="primary" onClick={() => setShowAdd(false)}>Скачать APK</Btn>
          </>}>

          <Field label="Название устройства" hint="Чтобы отличать в списке">
            <TextInput placeholder="Напр. «Pixel 7 — Москва»" />
          </Field>

          <Section title="Сканируйте QR с устройства">
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, alignItems: "stretch" }}>
              <div style={{
                background: "var(--paper-2)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                padding: 12,
              }}>
                <div aria-hidden style={{
                  width: 148, height: 148,
                  backgroundColor: "var(--paper)",
                  backgroundImage:
                    "radial-gradient(circle at 20px 20px, var(--ink) 8px, transparent 8.5px)," +
                    "radial-gradient(circle at 20px 128px, var(--ink) 8px, transparent 8.5px)," +
                    "radial-gradient(circle at 128px 20px, var(--ink) 8px, transparent 8.5px)," +
                    "repeating-linear-gradient(45deg, var(--ink) 0 3px, transparent 3px 7px)," +
                    "repeating-linear-gradient(-45deg, var(--ink) 0 3px, transparent 3px 8px)",
                  backgroundSize: "100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%",
                  backgroundRepeat: "no-repeat",
                  borderRadius: 6,
                  position: "relative",
                  border: "2px solid var(--ink)",
                }}>
                  <div style={{
                    position: "absolute", top: 6, left: 6, width: 28, height: 28,
                    background: "var(--paper)", border: "6px solid var(--ink)", borderRadius: 4,
                  }} />
                  <div style={{
                    position: "absolute", top: 6, right: 6, width: 28, height: 28,
                    background: "var(--paper)", border: "6px solid var(--ink)", borderRadius: 4,
                  }} />
                  <div style={{
                    position: "absolute", bottom: 6, left: 6, width: 28, height: 28,
                    background: "var(--paper)", border: "6px solid var(--ink)", borderRadius: 4,
                  }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                  <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                    <li>Скачайте APK и установите его на Android-устройство.</li>
                    <li>Откройте приложение <strong>SWPay Trader</strong>.</li>
                    <li>Отсканируйте этот QR — терминал привяжется автоматически.</li>
                  </ol>
                </div>
                <Note tone="info">
                  Телефон SIM, модель и заметки подтянутся с устройства автоматически после привязки.
                </Note>
              </div>
            </div>
          </Section>
        </Modal>
      }
    </>);

}

// ─── PAYMENT DETAILS ─────────────────────────────────────────────────────
function TraderPaymentDetails() {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [displayed, setDisplayed] = React.useState(filter);
  const [fading, setFading] = React.useState(false);
  React.useEffect(() => {
    if (filter === displayed) return;
    setFading(true);
    const t = setTimeout(() => { setDisplayed(filter); setFading(false); }, 180);
    return () => clearTimeout(t);
  }, [filter, displayed]);

  const OFFLINE_STATUSES = ["limit-exceeded", "terminal-offline", "blocked", "cooldown", "trader-off", "admin-off", "frozen"];
  const filters = [
  { value: "all", label: "Все", count: PAYMENT_DETAILS.length },
  { value: "active", label: "Online", count: PAYMENT_DETAILS.filter((p) => p.status === "active").length },
  { value: "offline", label: "Offline", count: PAYMENT_DETAILS.filter((p) => OFFLINE_STATUSES.includes(p.status)).length }];

  const visible = PAYMENT_DETAILS.filter((p) => {
    if (displayed === "all") return true;
    if (displayed === "offline") return OFFLINE_STATUSES.includes(p.status);
    return p.status === displayed;
  });
  const open = PAYMENT_DETAILS.find((p) => p.id === openId);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FilterChips filters={filters} value={filter} onChange={setFilter} />
        </div>
        <Btn variant="primary" size="sm" style={{ borderRadius: 999, padding: "6px 14px", fontSize: 13 }} onClick={() => setShowAdd(true)}>Добавить реквизит</Btn>
      </div>

      <div className={"pd-grid" + (fading ? " is-fading" : "")} key={displayed}>
        {visible.map((p) => {
          const usage = p.dailyUsed;
          const tone = usage >= 0.9 ? "bad" : usage >= 0.7 ? "warn" : "ok";
          const opsTone = p.opsToday / p.opsLimit >= 0.9 ? "bad" : p.opsToday / p.opsLimit >= 0.7 ? "warn" : "";
          const accent =
            p.status === "limit-exceeded" ? " pd-card--limit" :
            p.status === "blocked" ? " pd-card--blocked" :
            p.status === "terminal-offline" ? " pd-card--offline" : "";
          return (
            <div
              key={p.id}
              className={"pd-card" + accent + (openId === p.id ? " is-selected" : "")}
              onClick={() => setOpenId(p.id)}>
              <div className="pd-card__head">
                <div style={{ minWidth: 0 }}>
                  <div className="pd-card__id">{p.label ? <>{p.label} <span className="muted">({p.id})</span></> : p.id}</div>
                  <div className="pd-card__target">{p.target}</div>
                  <div className="pd-card__sub">
                    <span>{bankName(p.bank)}</span>
                    <span className="pd-card__sub-sep" />
                    <span>{p.holder}</span>
                  </div>
                </div>
                <div className="pd-card__head-r">
                  <div className="pd-card__methods">
                    {(p.methods || [p.method]).map((m) => (
                      <span key={m} className={"pd-card__method pd-card__method--" + m}>
                        {m === "sbp" ? "СБП" : m === "card" ? "Карта" : m === "c2c" ? "C2C" : m === "phone" ? "Phone" : m === "account" ? "Счёт" : m}
                      </span>
                    ))}
                  </div>
                  <StatusPill map={PD_STATUS} value={p.status} />
                </div>
              </div>

              <div className="pd-card__limit">
                <div className="pd-card__limit-row">
                  <span className="pd-card__limit-label">Лимит / день</span>
                  <span className={"pd-card__limit-pct is-" + tone}>{Math.round(usage * 100)}%</span>
                </div>
                <div className={"pd-card__limit-bar pd-card__limit-bar--" + tone}>
                  <i style={{ width: Math.max(2, Math.min(100, usage * 100)) + "%" }} />
                </div>
                <div className="pd-card__limit-nums">
                  {fmtMoney(p.todayVolumeRub, "RUB")} / {fmtMoney(p.dailyLimit, "RUB")}
                </div>
              </div>

              <div className="pd-card__stats">
                <div className="pd-card__stat">
                  <div className="pd-card__stat-label">Опер. сегодня</div>
                  <div className={"pd-card__stat-value" + (opsTone ? " is-" + opsTone : "")}>
                    {p.opsToday} <span style={{ color: "var(--ink-4)" }}>/ {p.opsLimit}</span>
                  </div>
                </div>
                <div className="pd-card__stat">
                  <div className="pd-card__stat-label">Успех</div>
                  <div className={"pd-card__stat-value" + (p.success >= 0.97 ? " is-ok" : p.success < 0.9 ? " is-bad" : "")}>
                    {Math.round(p.success * 100)}%
                  </div>
                </div>
              </div>

              <div className="pd-card__foot">
                {(() => {
                  const term = TERMINALS.find((t) => t.id === p.terminal);
                  return <span>{term ? term.name : p.terminal} <span className="muted mono">({p.terminal})</span></span>;
                })()}
                {p.cooldown && (
                  <span className="pd-card__cooldown">
                    ⏱ {Math.floor(p.cooldown.remainingSec / 60)}:{String(p.cooldown.remainingSec % 60).padStart(2, "0")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {open &&
      <Drawer
        title="Реквизит"
        id={open.id}
        status={open.status}
        statusMap={PD_STATUS}
        onClose={() => setOpenId(null)}
        wide
        extraTags={open.cooldown && <span className="dispute-sla mono">cooldown {Math.floor(open.cooldown.remainingSec / 60)}:{String(open.cooldown.remainingSec % 60).padStart(2, "0")} после {open.cooldown.after}</span>}
        footer={<>
            <Btn variant="ghost">Изменить лимиты</Btn>
            <span className="spacer" />
            {open.status === "active" ?
          <Btn variant="danger">Отключить</Btn> :
          <Btn variant="ok">Включить</Btn>}
          </>}>
        
          <PdDrawerBody open={open} />
        </Drawer>
      }

      {showAdd && <AddPdModal onClose={() => setShowAdd(false)} />}
    </>);

}

function AddPdModal({ onClose }) {
  const ALL_METHODS = [
    { value: "sbp",     label: "СБП" },
    { value: "card",    label: "Карта" },
  ];
  const [methods, setMethods] = React.useState(["sbp", "card"]);
  const toggle = (v) => setMethods((m) => m.includes(v) ? m.filter((x) => x !== v) : [...m, v]);

  return (
    <Modal
      title="Добавить реквизит"
      onClose={onClose}
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <Btn variant="primary" onClick={onClose} disabled={methods.length === 0}>Создать</Btn>
      </>}
    >
      <Field label="Название реквизита">
        <TextInput placeholder="Например: Тинькофф · Алексей · основной" />
      </Field>
      <Field label="Методы" hint="Можно выбрать несколько — реквизит будет использоваться для любого из них">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ALL_METHODS.map((m) => (
            <Chip key={m.value} active={methods.includes(m.value)} onClick={() => toggle(m.value)}>
              {m.label}
            </Chip>
          ))}
        </div>
      </Field>
      <div className="row-2">
        <Field label="Банк"><Select value="B-A" options={BANKS.map((b) => ({ value: b.id, label: b.name }))} /></Field>
        <Field label="Держатель"><TextInput placeholder="ФИО, как в банке" /></Field>
      </div>

      <Section title="Реквизиты">
        <Field label="Телефон (СБП)">
          <TextInput placeholder="+7 ___ ___-__-__" mono />
        </Field>
        <Field label="Номер карты">
          <TextInput placeholder="•••• •••• •••• ____" mono />
        </Field>
      </Section>

      <Field label="Терминал">
        <Select value="T-1001" options={TERMINALS.filter((t) => t.status === "online").map((t) => ({ value: t.id, label: t.id + " · " + t.name }))} />
      </Field>
      <div className="row-2">
        <Field label="Дневной лимит, ₽"><TextInput placeholder="500 000" /></Field>
        <Field label="Месячный лимит, ₽"><TextInput placeholder="8 000 000" /></Field>
      </div>
      <div className="row-2">
        <Field label="Мин. сумма, ₽"><TextInput placeholder="500" /></Field>
        <Field label="Макс. сумма, ₽"><TextInput placeholder="200 000" /></Field>
      </div>
      <Field label="Лимит операций / день"><TextInput placeholder="500" /></Field>
    </Modal>
  );
}

Object.assign(window, {
  TraderDashboard, TraderPayIn, TraderPayOut, TraderTerminals, TraderPaymentDetails,
  Bar, MoneyBig, PayOutDrawer, PayInDrawer
});