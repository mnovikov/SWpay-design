// CrowdPay — Merchant Demo (v2)
// Перспектива мерчанта M-501 (BetCity). Стилистика и компонент-paтерн как в Admin Demo.

// ─── Контекст мерчанта ──────────────────────────────────────────────────────
const ME_MERCHANT = MERCHANTS[0]; // BetCity, M-501
const ME_RATE = 92.4;

// ─── CopyId — mono id with copy button (как в трейдере) ─────────────────────
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
        style={{ all: "unset", cursor: "pointer", width: 18, height: 18, display: "inline-grid", placeItems: "center", borderRadius: 4, color: done ? "var(--ok)" : "var(--ink-3)", fontSize: 12, opacity: 0.7 }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}>
        {done ? "✓" :
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="9" height="9" rx="1.5" />
            <path d="M11 4V3a1 1 0 0 0-1-1H3.5a1 1 0 0 0-1 1v7" />
          </svg>}
      </button>
    </span>
  );
}

// ─── Доп. status maps ──────────────────────────────────────────────────────
const SETTLEMENT_STATUS = {
  scheduled: { label: "Запланирован", tone: "info" },
  pending:   { label: "В обработке",  tone: "warn" },
  paid:      { label: "Выплачено",    tone: "ok"   },
  failed:    { label: "Ошибка",       tone: "bad"  },
};
const WEBHOOK_STATUS_MAP = {
  delivered: { label: "Доставлено",   tone: "ok"   },
  retrying:  { label: "Повторяем",    tone: "warn" },
  failed:    { label: "Не доставлено", tone: "bad" },
};

// ─── Клиент-инициатор по выплате (id; имя берётся из CUSTOMER_NAMES) ────────
const PAYOUT_CUSTOMER = {
  "PO-55021": "Customer #20024",
  "PO-55020": "Customer #20025",
  "PO-55019": "Customer #20026",
  "PO-55018": "Customer #20027",
  "PO-55017": "Customer #20028",
  "PO-55016": "Customer #20029",
  "PO-55015": "Customer #20030",
  "PO-55014": "Customer #20031",
  "PO-55013": "Customer #20019",
  "PO-55012": "Customer #20032",
};

// ─── Settlement (вывод на банковский счёт) ─────────────────────────────────
const MERCHANT_SETTLEMENTS = [
  { id: "ST-2208", ts: "27.04 09:00", amountUsdt: 18420.50, accountIban: "TRX-PROD-01", txHash: "0xa42f9c1b8d4e2710f8c5a93b176d2f1eaa9b3c5704d6e8b1c9a7f2d8e4b5a6c7", actor: "system", status: "paid" },
  { id: "ST-2196", ts: "25.04 14:02", amountUsdt: 22150.00, accountIban: "TRX-PROD-01", txHash: "0xb71e3d4f9a1c8b2e7f5d6a9c3e1b4d8f2a6c5e9b7d3f1a8c4e6b2d9f5a7c3e1b", actor: "system", status: "paid" },
  { id: "ST-2188", ts: "22.04 11:48", amountUsdt: 31280.75, accountIban: "TRX-PROD-01", txHash: "0xc52d8a1e4f9b3c7d6e2a5f8b1c4d7e9a3b6f2c8d5e1a4b7c9d3f6e2a8b5c1d4f", actor: "a.smirnov · manual", status: "paid" },
  { id: "ST-2179", ts: "18.04 10:30", amountUsdt: 14080.00, accountIban: "TRX-PROD-01", txHash: "0xd83f7e2c1b6a4d9e5f8c3b1a7d2e6f9c4b8a5d1e3f7c2b6a9d4e8f1c5b3a7e2d", actor: "system", status: "paid" },
  { id: "ST-2165", ts: "сегодня · авто 23:00", amountUsdt: 12480.10, accountIban: "TRX-PROD-01", txHash: null, actor: "scheduled", status: "scheduled" },
];

// ─── Webhook log ───────────────────────────────────────────────────────────
const MERCHANT_WEBHOOK_EVENTS = [
  { id: "WH-9182", ts: "27.04 14:22:09", type: "payin.completed", orderId: "PI-83401", status: "delivered", code: 200, retries: 0, latencyMs: 142, body: { event: "payin.completed", id: "PI-83401", customer: "Customer #10024", amount: 4800, currency: "RUB", trader: "TR-1042", completed_at: "2026-04-27T14:22:01Z" } },
  { id: "WH-9181", ts: "27.04 14:21:42", type: "payin.completed", orderId: "PI-83400", status: "delivered", code: 200, retries: 0, latencyMs: 89, body: { event: "payin.completed", id: "PI-83400", customer: "Customer #10025", amount: 12500, currency: "RUB", trader: "TR-1042", completed_at: "2026-04-27T14:21:38Z" } },
  { id: "WH-9180", ts: "27.04 14:14:01", type: "payin.expired",   orderId: "PI-83397", status: "delivered", code: 200, retries: 0, latencyMs: 96, body: { event: "payin.expired", id: "PI-83397", customer: "Customer #10028", amount: 24000, reason: "no_payment_15min" } },
  { id: "WH-9179", ts: "27.04 13:50:18", type: "payout.completed", orderId: "PO-55019", status: "retrying", code: 502, retries: 2, latencyMs: 0, body: { event: "payout.completed", id: "PO-55019", customer: "Сидоров К.", amount: 9000, currency: "RUB" }, error: "502 Bad Gateway · next attempt in 4 min" },
  { id: "WH-9178", ts: "27.04 13:48:55", type: "dispute.opened",   orderId: "PI-83401", status: "delivered", code: 200, retries: 0, latencyMs: 121, body: { event: "dispute.opened", id: "DSP-441", related_order: "PI-83401", reason: "customer_claim" } },
  { id: "WH-9177", ts: "27.04 13:22:30", type: "payout.completed", orderId: "PO-55018", status: "delivered", code: 200, retries: 0, latencyMs: 178, body: { event: "payout.completed", id: "PO-55018", customer: "Кузнецов В.", amount: 134000 } },
  { id: "WH-9176", ts: "27.04 12:30:10", type: "payin.completed",  orderId: "PI-83392", status: "delivered", code: 200, retries: 0, latencyMs: 92, body: { event: "payin.completed", id: "PI-83392", amount: 7800 } },
  { id: "WH-9175", ts: "27.04 11:14:08", type: "payin.failed",     orderId: "PI-83390", status: "failed",    code: 503, retries: 5, latencyMs: 0, body: { event: "payin.failed", id: "PI-83390", amount: 11200, reason: "trader_proof_rejected" }, error: "503 Service Unavailable · отказ после 5 попыток" },
  { id: "WH-9174", ts: "27.04 10:08:42", type: "payin.completed",  orderId: "PI-83385", status: "delivered", code: 200, retries: 1, latencyMs: 612, body: { event: "payin.completed", id: "PI-83385", amount: 5400 } },
  { id: "WH-9173", ts: "27.04 09:00:01", type: "settlement.paid",  orderId: "ST-2208", status: "delivered", code: 200, retries: 0, latencyMs: 88, body: { event: "settlement.paid", id: "ST-2208", amount_usdt: 18420.50, tx: "0xa42f9c…" } },
];

// ─── PageHead helper (merchant-styled) ─────────────────────────────────────
function MerchantHead({ title, sub, actions }) {
  return (
    <PageHead title={title} sub={sub} actions={actions} />
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
function MerchantDashboard({ onGo }) {
  const [period, setPeriod] = React.useState("today");
  const PERIODS = {
    "hour":      { label: "Час",     title: "за час",      k: 0.07 },
    "today":     { label: "Сегодня", title: "сегодня",     k: 1 },
    "yesterday": { label: "Вчера",   title: "вчера",       k: 0.92 },
    "month":     { label: "Месяц",   title: "за месяц",    k: 22.4 },
    "all":       { label: "Всё",     title: "за всё время",k: 184.6 },
  };
  const p = PERIODS[period];
  const periodChips = Object.keys(PERIODS).map((id) => ({ value: id, label: PERIODS[id].label }));

  const payInRub  = Math.round((ME_MERCHANT.today?.payInRub  || 0) * p.k);
  const payOutRub = Math.round((ME_MERCHANT.today?.payOutRub || 0) * p.k);
  const payInCount  = Math.round((ME_MERCHANT.today?.payInCount  || 0) * p.k);
  const payOutCount = Math.round((ME_MERCHANT.today?.payOutCount || 0) * p.k);
  const success = ME_MERCHANT.today?.success || 0.96;

  const balance = ME_MERCHANT.balance?.rub || 0;
  const frozen  = ME_MERCHANT.balance?.frozen || 0;

  const myPayIn  = PAY_IN.filter((o) => o.merchant === ME_MERCHANT.id);
  const myPayOut = PAY_OUT.filter((o) => o.merchant === ME_MERCHANT.id);
  const activePayIn = myPayIn.filter((o) => ["waiting-payment","manual-review","disputed"].includes(o.status)).length;
  const activePayOut = myPayOut.filter((o) => ["free","in-progress","waiting-review"].includes(o.status)).length;
  const myDisputes = DISPUTES.filter((d) =>
    d.merchant === ME_MERCHANT.id
    && ["open","waiting-trader","waiting-admin","escalated"].includes(d.status)
  );
  const failedHooks = MERCHANT_WEBHOOK_EVENTS.filter((w) => w.status === "failed" || w.status === "retrying");

  const fmt = (n) => Math.round(n).toLocaleString("ru-RU");

  const attention = [
    failedHooks.length > 0 && { tone: "bad",  pill: "Webhooks",      msg: <><b>{failedHooks.length}</b> событий с ошибкой доставки</>, meta: failedHooks[0]?.type || "", go: "webhooks" },
    myDisputes.length > 0 && { tone: "warn", pill: "Споры",          msg: <>Активных споров: <b>{myDisputes.length}</b></>, meta: myDisputes[0]?.id || "", go: "disputes" },
    activePayIn > 0 &&       { tone: "info", pill: "Платежи",          msg: <>В работе: <b>{activePayIn}</b> платежей</>, meta: "", go: "payin" },
    activePayOut > 0 &&      { tone: "info", pill: "Выплаты",         msg: <>В работе: <b>{activePayOut}</b> выплат</>, meta: "", go: "payout" },
    frozen > 0 &&            { tone: "warn", pill: "Hold",           msg: <>В холде: <b>{fmt(frozen)} ₽</b> — освободятся после settlement</>, meta: "", go: "settlement" },
  ].filter(Boolean);

  return (
    <>
      <PageHead title="Главная" sub="Сводка по вашему мерчанту." />

      <FilterChips filters={periodChips} value={period} onChange={setPeriod} />

      {/* 2 hero tiles */}
      <div className="hero-grid hero-grid--2">
        <div className="hero-card hero-card--clickable" onClick={() => onGo("payin")}>
          <div className="hero-card__label">Платежи {p.title}</div>
          <div className="hero-card__value">{(payInRub / ME_RATE).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} <span className="ccy">USDT</span></div>
          <div className="hero-card__sub">{fmt(payInRub)} ₽ · {payInCount} платежей · success <b>{Math.round(success * 100)}%</b></div>
        </div>
        <div className="hero-card hero-card--clickable" onClick={() => onGo("payout")}>
          <div className="hero-card__label">Выплаты {p.title}</div>
          <div className="hero-card__value">{(payOutRub / ME_RATE).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} <span className="ccy">USDT</span></div>
          <div className="hero-card__sub">{fmt(payOutRub)} ₽ · {payOutCount} выплат</div>
        </div>
      </div>

      {/* Stat row */}
      <div className="stat-row">
        <div className="stat stat--clickable" onClick={() => onGo("settlement")}>
          <div className="stat__label">Баланс к выводу</div>
          <div className="stat__value">{(balance / ME_RATE).toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="stat__delta">≈ {fmt(balance)} ₽</div>
        </div>
        <div className="stat stat--clickable" onClick={() => onGo("settlement")}>
          <div className="stat__label">В холде</div>
          <div className="stat__value">{(frozen / ME_RATE).toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="stat__delta">{fmt(frozen)} ₽ · разморозка после settlement</div>
        </div>
        <div className="stat stat--clickable" onClick={() => onGo("disputes")}>
          <div className="stat__label">Активные споры</div>
          <div className="stat__value">{myDisputes.length}</div>
          <div className="stat__delta"><b>{(myDisputes.reduce((s, d) => s + (d.amount || 0), 0) / ME_RATE).toFixed(2)} USDT</b></div>
        </div>
        <div className="stat stat--clickable" onClick={() => onGo("payin")}>
          <div className="stat__label">Конверсия</div>
          <div className="stat__value">{Math.round(success * 100)}%</div>
          <div className="stat__delta">{Math.round(payInCount * success)} из {payInCount} платежей</div>
        </div>
      </div>

    </>
  );
}

// ─── Платежи (Платежи клиентов) ──────────────────────────────────────────────
function MerchantPayIn({ initOpenId }) {
  const [filter, setFilter] = React.useState("in-progress");
  const [openId, setOpenId] = React.useState(null);
  React.useEffect(() => { if (initOpenId) setOpenId(initOpenId); }, [initOpenId]);

  const all = PAY_IN.filter((o) => o.merchant === ME_MERCHANT.id);
  const inWork = (o) => ["waiting-payment","manual-review","disputed"].includes(o.status) || o.dispute;
  const filters = [
    { value: "in-progress", label: "В работе",     count: all.filter(inWork).length },
    { value: "completed",   label: "Успешные",     count: all.filter((o) => ["completed","auto-confirmed"].includes(o.status)).length },
    { value: "failed",      label: "Не выполнены", count: all.filter((o) => ["failed","expired"].includes(o.status)).length },
    { value: "all",         label: "Все",          count: all.length },
  ];
  const visible = all.filter((o) => {
    if (filter === "all") return true;
    if (filter === "in-progress") return inWork(o);
    if (filter === "completed") return ["completed","auto-confirmed"].includes(o.status);
    if (filter === "failed") return ["failed","expired"].includes(o.status);
    return o.status === filter;
  });
  const open = all.find((o) => o.id === openId);

  return (
    <>
      <PageHead
        title="Платежи клиентов"
        sub="Заявки на приём денег от ваших клиентов."
      />
      <FilterChips filters={filters} value={filter} onChange={setFilter} />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Статус</th>
              <th>Реквизит</th>
              <th className="num">Сумма</th>
              <th className="num">Комиссия</th>
              <th>Customer</th>
              <th>Создана</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => {
              const pd = PAYMENT_DETAILS.find((p) => p.id === o.details);
              const usdt = o.amount / ME_RATE;
              const isOk = ["completed","auto-confirmed"].includes(o.status);
              return (
                <tr key={o.id} className={openId === o.id ? "is-selected" : ""} onClick={() => setOpenId(o.id)}>
                  <td><StatusPill map={PAY_IN_STATUS} value={o.status} /></td>
                  <td>
                    {pd ?
                      <>
                        <div>{pd.holder}</div>
                        <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{pd.target}</div>
                      </> :
                      <span className="muted">—</span>}
                  </td>
                  <td className="num" style={{ fontFamily: "\"Inter Tight\"" }}>
                    {fmtMoney(o.amount, "RUB")}
                    <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{usdt.toFixed(2)} USDT</div>
                  </td>
                  <td className="num mono">{isOk && o.commissionUsdt ? <>{o.commissionUsdt.toFixed(2)} <span className="muted">USDT</span></> : <span className="muted">—</span>}</td>
                  <td>
                    {customerDisplay(o.customer).name}
                    {o.dispute && <span className="dot-dispute" title="Открыт спор"> ●</span>}
                  </td>
                  <td className="mono">{o.date}</td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr><td colSpan={6}><Empty>Нет платежей в этой категории</Empty></td></tr>
            )}
          </tbody>
        </table>
        <div className="table-foot">Показано <strong>{visible.length}</strong> из <strong>{all.length}</strong></div>
      </div>

      {open && <MPayInDrawer order={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function MPayInDrawer({ order: open, onClose }) {
  const pd = PAYMENT_DETAILS.find((p) => p.id === open.details);
  const isOk = ["completed","auto-confirmed"].includes(open.status);
  return (
          <Drawer
            title="Платёж"
            status={open.status}
            statusMap={PAY_IN_STATUS}
            onClose={onClose}
            wide
            extraTags={open.dispute
              ? <span className="dispute-sla mono">⚠ Спор</span>
              : isOk
              ? <span className="dispute-sla mono" style={{ color: "var(--ok)", background: "var(--ok-soft)" }}>✓ Зачислено</span>
              : null}
            footer={<>
              <Btn variant="ghost">Скачать чек</Btn>
              <span className="spacer" />
              {!open.dispute && (isOk || ["failed","expired"].includes(open.status)) && <Btn variant="ghost">Открыть спор</Btn>}
            </>}
          >
            <Section title="Сводка">
              <KV items={[
                ["ID", <CopyId value={open.id} />],
                ["Сумма", <strong>{fmtMoney(open.amount, "RUB")}</strong>],
                ["Сумма (USDT)", <span className="mono">{fmtMoney(open.amount / ME_RATE, "USDT")}</span>],
                ["Курс обмена", <span className="mono">{ME_RATE.toFixed(2)} ₽/USDT</span>],
                ["Создана", <span className="mono">{open.date}</span>],
                ["Customer", (() => { const c = customerDisplay(open.customer); return <span>{c.name}{c.id && <span className="mono muted" style={{ marginLeft: 5 }}>({c.id})</span>}</span>; })()],
                ...(isOk && open.commissionUsdt ? [["Комиссия CrowdPay", <strong>{fmtMoney(open.commissionUsdt, "USDT")}</strong>]] : []),
              ]} />
            </Section>

            <Section title="Куда поступил платёж">
              <KV items={[
                ["Реквизит", pd
                  ? <span>{pd.holder} · <span className="mono">{pd.target}</span> <span className="muted">({bankName(pd.bank)})</span></span>
                  : <span className="muted">—</span>],
                ["Метод", pd ? <span className="badge-type">{(METHOD_LABEL && METHOD_LABEL[pd.method]) || pd.method}</span> : <span className="muted">—</span>],
                ["Терминал", open.terminal ? <span className="mono">{open.terminal}</span> : <span className="muted">—</span>],
                ["Trader", open.trader ? <><strong>{traderName(open.trader)}</strong> <span className="mono muted">· {open.trader}</span></> : <span className="muted">—</span>],
              ]} />
            </Section>

            <Section title="SMS / Push от банка">
              {open.source && open.source !== "—" ? (
                <Note tone="info">
                  <div className="mono" style={{ fontSize: 12, marginBottom: 6 }}>{open.source} · {bankName(open.bank)} · {open.date}</div>
                  <div>«Поступление {fmtMoney(open.amount, "RUB")}. {bankName(open.bank)}»</div>
                </Note>
              ) : (open.status === "waiting-payment" ? (
                <Empty>Ждём оплату от клиента…</Empty>
              ) : (
                <Empty>Сообщение от банка не получено</Empty>
              ))}
            </Section>

            <Section title="Webhook">
              {(() => {
                const evt = MERCHANT_WEBHOOK_EVENTS.find((w) => w.orderId === open.id);
                if (!evt) return <Empty>Webhook ещё не отправлен</Empty>;
                return (
                  <KV items={[
                    ["Тип", <span className="mono">{evt.type}</span>],
                    ["Доставлен", <><StatusPill map={WEBHOOK_STATUS_MAP} value={evt.status} /> {evt.code && <span className="mono muted" style={{ marginLeft: 6 }}>HTTP {evt.code}</span>}</>],
                    ["Latency", <span className="mono">{evt.latencyMs} ms</span>],
                  ]} />
                );
              })()}
            </Section>
          </Drawer>
  );
}

// ─── Выплаты (Выплаты клиентам) ─────────────────────────────────────────────
function MerchantPayOut({ initOpenId }) {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  React.useEffect(() => { if (initOpenId) setOpenId(initOpenId); }, [initOpenId]);

  const all = PAY_OUT.filter((o) => o.merchant === ME_MERCHANT.id);
  const filters = [
    { value: "all",            label: "Все",          count: all.length },
    { value: "free",           label: "В очереди",    count: all.filter((o) => o.status === "free").length },
    { value: "in-progress",    label: "В работе",     count: all.filter((o) => ["in-progress","waiting-review"].includes(o.status)).length },
    { value: "completed",      label: "Выполненные",  count: all.filter((o) => o.status === "completed").length },
    { value: "rejected",       label: "Отклонённые",  count: all.filter((o) => ["rejected","expired"].includes(o.status)).length },
  ];
  const visible = all.filter((o) => {
    if (filter === "all") return true;
    if (filter === "in-progress") return ["in-progress","waiting-review"].includes(o.status);
    if (filter === "rejected") return ["rejected","expired"].includes(o.status);
    return o.status === filter;
  });
  const open = all.find((o) => o.id === openId);

  const methodOf = (o) => {
    const d = (o.customerTarget || "").replace(/\D/g, "");
    return o.method || (d.length >= 16 ? "card" : d.length >= 11 ? "phone" : "sbp");
  };
  const methodShort = { sbp: "СБП", card: "Карта", phone: "СБП · телефон", c2c: "C2C", account: "Счёт" };

  return (
    <>
      <PageHead
        title="Выплаты клиентам"
        sub="Заявки на отправку денег вашим клиентам. Выполняются трейдерами CrowdPay."
      />
      <FilterChips filters={filters} value={filter} onChange={setFilter} />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 110 }}>Статус</th>
              <th>Customer</th>
              <th>Получатель</th>
              <th className="num">Сумма</th>
              <th className="num">Комиссия</th>
              <th>Создана</th>
              <th>Метод</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => {
              const usdt = o.amount / ME_RATE;
              const method = methodOf(o);
              const isOk = o.status === "completed";
              return (
                <tr key={o.id} className={openId === o.id ? "is-selected" : ""} onClick={() => setOpenId(o.id)}>
                  <td><StatusPill map={PAY_OUT_STATUS} value={o.status} /></td>
                  <td>{customerDisplay(PAYOUT_CUSTOMER[o.id] || o.customer).name}</td>
                  <td>
                    <div><span className="muted">{bankName(o.customerBank)}</span> {o.customer}</div>
                    <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{o.customerTarget}</div>
                  </td>
                  <td className="num" style={{ fontFamily: "\"Inter Tight\"" }}>
                    {fmtMoney(o.amount, "RUB")}
                    <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{usdt.toFixed(2)} USDT</div>
                  </td>
                  <td className="num mono">{isOk && o.commissionUsdt ? <>{o.commissionUsdt.toFixed(2)} <span className="muted">USDT</span></> : <span className="muted">—</span>}</td>
                  <td className="mono">{o.date}</td>
                  <td>
                    <div>{methodShort[method] || method}</div>
                    <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{bankName(o.customerBank)}</div>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr><td colSpan={7}><Empty>Нет выплат в этой категории</Empty></td></tr>
            )}
          </tbody>
        </table>
        <div className="table-foot">Показано <strong>{visible.length}</strong> из <strong>{all.length}</strong></div>
      </div>

      {open && <MPayOutDrawer order={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function MPayOutDrawer({ order: open, onClose }) {
  const d = (open.customerTarget || "").replace(/\D/g, "");
  const method = open.method || (d.length >= 16 ? "card" : d.length >= 11 ? "phone" : "sbp");
  const methodLabel = method === "sbp" ? "СБП" : method === "card" ? "Карта (по номеру)" : method === "phone" ? "СБП · по номеру телефона" : method === "c2c" ? "Card-to-Card" : method === "account" ? "По расчётному счёту" : method;
  const inWork = ["in-progress","waiting-review"].includes(open.status);
  return (
          <Drawer
            title="Выплата"
            status={open.status}
            statusMap={PAY_OUT_STATUS}
            onClose={onClose}
            wide
            extraTags={(open.status === "free" || open.status === "in-progress") && open.deadlineMin
              ? <span className="dispute-sla mono">⏱ {open.deadlineMin} мин</span> : null}
            footer={<>
              {open.status === "completed" && <Btn variant="ghost">Открыть спор</Btn>}
              <span className="spacer" />
              {open.status === "free" && <Btn variant="ghost" disabled>В очереди трейдеров</Btn>}
              {open.status === "waiting-review" && <><Btn variant="danger">Отклонить чек</Btn><Btn variant="ok">Принять</Btn></>}
            </>}
          >
            <Section title="Куда платить">
              <KV items={[
                ["Customer", (() => { const c = customerDisplay(PAYOUT_CUSTOMER[open.id] || open.customer); return <span>{c.name}{c.id && <span className="mono muted" style={{ marginLeft: 5 }}>({c.id})</span>}</span>; })()],
                ["Сумма к переводу", <strong>{fmtMoney(open.amount, "RUB")}</strong>],
                ["Метод платежа", <span className={"pd-card__method pd-card__method--" + method}>{methodLabel}</span>],
                ["Куда", <span className="mono"><strong>{open.customerTarget}</strong></span>],
                ["Банк получателя", <strong>{bankName(open.customerBank)}</strong>],
                ["Имя", open.customer],
                ["Создана", <span className="mono">{open.date}</span>],
                ["ID", <CopyId value={open.id} />],
              ]} />
            </Section>

            <Section title="Расчёт">
              <KV items={[
                ["Сумма", <span className="mono">{fmtMoney(open.amount / ME_RATE, "USDT")}</span>],
                ["Курс обмена", <span className="mono">1 USDT = {ME_RATE.toFixed(2)} ₽</span>],
                ["Тариф Выплаты", ME_MERCHANT.payOutRateMerchant + "%"],
                ["Комиссия CrowdPay", <strong>{fmtMoney(open.commissionUsdt || 0, "USDT")}</strong>],
              ]} />
            </Section>

            <Section title="Исполнитель">
              <KV items={[
                ["Trader", open.trader ? <><strong>{traderName(open.trader)}</strong> <span className="mono muted">· {open.trader}</span></> : <span className="muted">не назначен</span>],
                ["Срок", open.deadlineMin ? <span className="mono">{open.deadlineMin} мин</span> : "—"],
              ]} />
            </Section>

            <Section title="Чек / подтверждение">
              {open.proof === "uploaded" ?
                <PlaceholderImg label={"Чек по " + open.id} h={160} /> :
                open.proof === "rejected" ?
                <Note tone="bad">Чек отклонён: «Не читается номер операции». Ожидаем новый чек от трейдера.</Note> :
                inWork ?
                <Empty>Трейдер ещё не загрузил чек</Empty> :
                <Empty>Чек ещё не загружен</Empty>}
            </Section>
          </Drawer>
  );
}

// ─── Disputes ──────────────────────────────────────────────────────────────
function MerchantDisputes() {
  const [filter, setFilter] = React.useState("active");
  const [openId, setOpenId] = React.useState(null);
  const [, force] = React.useReducer((x) => x + 1, 0);

  const all = DISPUTES.filter((d) => d.merchant === ME_MERCHANT.id);
  const isActive = (d) => ["open","waiting-trader","waiting-admin","escalated"].includes(d.status);
  const isClosed = (d) => ["resolved-trader","resolved-merchant","rejected"].includes(d.status);
  const filters = [
    { value: "active", label: "Активные", count: all.filter(isActive).length },
    { value: "closed", label: "Закрытые", count: all.filter(isClosed).length },
    { value: "all",    label: "Все",      count: all.length },
  ];
  const visible = all.filter((d) => {
    if (filter === "all") return true;
    if (filter === "active") return isActive(d);
    if (filter === "closed") return isClosed(d);
    return d.status === filter;
  });
  const open = all.find((d) => d.id === openId);

  return (
    <>
      <PageHead title="Споры" sub="Споры по платежам и выплатам вашего мерчанта." />
      <FilterChips filters={filters} value={filter} onChange={setFilter} />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Статус</th>
              <th className="num">Сумма</th>
              <th>Открыт</th>
              <th>Тип</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((d) => (
              <tr key={d.id} className={openId === d.id ? "is-selected" : ""} onClick={() => setOpenId(d.id)}>
                <td><StatusPill map={DISPUTE_STATUS} value={d.status} /></td>
                <td className="num" style={{ fontFamily: "\"Inter Tight\"" }}>
                  {fmtMoney(d.amount, "RUB")}
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{(d.amount / ME_RATE).toFixed(2)} USDT</div>
                </td>
                <td className="mono">{d.opened}</td>
                <td>
                  <div className="cell-stack">
                    <div>{d.orderType}</div>
                    <div style={{ marginTop: 2 }}><CopyId value={d.order} short /></div>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={4}><Empty>Споров нет в этой категории</Empty></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && <MerchantDisputeDrawer dispute={open} onClose={() => setOpenId(null)} onResolve={() => { open.status = "resolved-trader"; open.decision = "Спор закрыт мерчантом в пользу трейдера."; force(); }} />}
    </>
  );
}

function MerchantDisputeDrawer({ dispute, onClose, onResolve }) {
  const [chat, setChat] = React.useState(dispute.chat || []);
  const [draft, setDraft] = React.useState("");
  const canSend = ["open","waiting-trader","waiting-admin","escalated"].includes(dispute.status);
  const send = () => {
    if (!draft.trim()) return;
    setChat([...chat, { from: "merchant", ts: "сейчас", text: draft.trim() }]);
    setDraft("");
  };
  const attach = () => setChat([...chat, { from: "merchant", ts: "сейчас", attach: "receipt_" + dispute.order + ".jpg" }]);

  return (
    <Drawer
      title="Спор"
      status={dispute.status}
      statusMap={DISPUTE_STATUS}
      onClose={onClose}
      wide
      footer={canSend ? (
        <>
          <Btn variant="ghost" onClick={attach}>📎 Прикрепить файл</Btn>
          <Btn variant="danger" onClick={onResolve}>Закрыть в пользу трейдера</Btn>
          <span className="spacer" />
          <Btn variant="primary" onClick={send}>Отправить</Btn>
        </>
      ) : <span className="muted" style={{ fontSize: 12 }}>Спор закрыт — отправка недоступна</span>}
    >
      <Section title="Сводка">
        <KV items={[
          ["Ордер", <a href={"#" + dispute.order} onClick={(e) => e.preventDefault()} className="mono" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3 }}>{dispute.order} · {dispute.orderType}</a>],
          ["Сумма", <strong>{fmtMoney(dispute.amount, "RUB")}</strong>],
          ["Customer", (() => { const c = customerDisplay(dispute.customer); return <span>{c.name}{c.id && <span className="mono muted" style={{ marginLeft: 5 }}>({c.id})</span>}</span>; })()],
          ["Открыт", <span className="mono">{dispute.opened}</span>],
          ...(dispute.sla && dispute.sla !== "—" ? [["SLA", <span className="mono">{dispute.sla}</span>]] : []),
          ["Причина", dispute.reason],
          ...(dispute.decision ? [["Решение", <strong>{dispute.decision}</strong>]] : []),
          ["ID", <CopyId value={dispute.id} />],
        ]} />
      </Section>

      <Section title="Переписка">
        <div className="chat">
          {chat.map((m, i) => {
            const role = m.from === "merchant" ? "trader" : "client";
            const author = m.from === "merchant" ? "Вы" : m.from === "trader" ? (dispute.traderName || "Трейдер") : "Саппорт";
            return (
              <div key={i} className={"chat__msg chat__msg--" + role}>
                <div className="chat__meta"><strong>{author}</strong> · <span className="mono">{m.ts}</span></div>
                <div className="chat__bubble">
                  {m.text}
                  {m.attach && (
                    <div style={{ marginTop: 6 }}>
                      <PlaceholderImg label={"📎 " + m.attach} h={120} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {chat.length === 0 && <Empty>Пока нет сообщений</Empty>}
        </div>
        <div className="chat-input">
          <button className="btn btn--ghost btn--sm" onClick={attach} disabled={!canSend} title="Прикрепить файл" style={{ padding: "0 12px" }}>📎</button>
          <input
            className="field__input"
            placeholder={canSend ? "Напишите сообщение саппорту..." : "Спор закрыт — отправка недоступна"}
            value={draft}
            disabled={!canSend}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          />
          <Btn variant="primary" size="sm" onClick={send} disabled={!canSend || !draft.trim()}>Отправить</Btn>
        </div>
      </Section>
    </Drawer>
  );
}

// ─── Webhooks ──────────────────────────────────────────────────────────────
function MerchantWebhooks() {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const all = MERCHANT_WEBHOOK_EVENTS;
  const filters = [
    { value: "all",       label: "Все",          count: all.length },
    { value: "delivered", label: "Доставлены",   count: all.filter((w) => w.status === "delivered").length },
    { value: "retrying",  label: "Повторяем",    count: all.filter((w) => w.status === "retrying").length },
    { value: "failed",    label: "Ошибка",       count: all.filter((w) => w.status === "failed").length },
  ];
  const visible = filter === "all" ? all : all.filter((w) => w.status === filter);
  const open = all.find((w) => w.id === openId);

  return (
    <>
      <PageHead
        title="Webhook log"
        sub="Интеграция вебхуков и журнал доставок."
      />
      <Section title="Webhook integration">
        <Field label="URL" row><TextInput value={ME_MERCHANT.integrations?.webhookUrl} placeholder="https://..." mono /></Field>
        <Field label="Статус" row><StatusPill map={{ on: { label: "Активен", tone: "ok" } }} value="on" /></Field>
        <Btn variant="ghost" size="sm">Выключить</Btn>
      </Section>

      <Section title="Журнал доставок">
        <FilterChips filters={filters} value={filter} onChange={setFilter} />
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Событие</th>
                <th>Статус</th>
                <th className="num">Попытки</th>
                <th>Время события</th>
                <th>Последняя ошибка</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((w) => (
                <tr key={w.id} className={openId === w.id ? "is-selected" : ""} onClick={() => setOpenId(w.id)}>
                  <td><span className="mono">{w.type}</span></td>
                  <td><StatusPill map={WEBHOOK_STATUS_MAP} value={w.status} /></td>
                  <td className="num mono">{w.retries}</td>
                  <td className="mono muted">{w.ts}</td>
                  <td><span className="mono" style={{ color: w.error ? "var(--bad)" : "var(--ink-4)" }}>{w.error || "—"}</span></td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={5}><Empty>Событий в этой категории нет</Empty></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {open && (
        <Drawer title="Webhook event" id={open.id} status={open.status} statusMap={WEBHOOK_STATUS_MAP} onClose={() => setOpenId(null)} wide
          footer={<>
            {open.status !== "delivered" && <Btn variant="primary">↻ Переотправить</Btn>}
            <span className="spacer" />
            <Btn variant="ghost">Скопировать JSON</Btn>
          </>}>
          <Section title="Доставка">
            <KV items={[
              ["Тип события", <span className="mono">{open.type}</span>],
              ["Ордер", <span className="mono">{open.orderId}</span>],
              ["Время", <span className="mono">{open.ts}</span>],
              ["HTTP code", <span className="mono">{open.code}</span>],
              ["Latency", <span className="mono">{open.latencyMs} ms</span>],
              ["Попытки доставки", <span className="mono">{open.retries}</span>],
              ...(open.error ? [["Ошибка", <Note tone="bad">{open.error}</Note>]] : []),
            ]} />
          </Section>
          <Section title="Payload">
            <pre style={{ background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: 10, padding: 12, fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", overflow: "auto" }}>
              {JSON.stringify(open.body, null, 2)}
            </pre>
          </Section>
        </Drawer>
      )}
    </>
  );
}

// ─── Settlement ────────────────────────────────────────────────────────────
// ─── Settlement / Финансы ──────────────────────────────────────────────────
const MLEDGER_TYPE = {
  payin:      { label: "Платёж зачислен", tone: "ok"      },
  payout:     { label: "Выплата клиенту", tone: "info"    },
  commission: { label: "Комиссия",        tone: "neutral" },
  settlement: { label: "Settlement",      tone: "neutral" },
};

const MERCHANT_LEDGER = (() => {
  const rows = [];
  const mine = (o) => o.merchant === ME_MERCHANT.id;
  PAY_IN.filter((o) => mine(o) && ["completed","auto-confirmed"].includes(o.status)).forEach((o) => {
    rows.push({ id: "LM-" + o.id, ts: o.date, type: "payin", amountUsdt: +(o.amount / ME_RATE), orderId: o.id, note: "Платёж клиента зачислен" });
    if (o.commissionUsdt) rows.push({ id: "LMC-" + o.id, ts: o.date, type: "commission", amountUsdt: -o.commissionUsdt, orderId: o.id, note: "Комиссия по платежу" });
  });
  PAY_OUT.filter((o) => mine(o) && o.status === "completed").forEach((o) => {
    rows.push({ id: "LM-" + o.id, ts: o.date, type: "payout", amountUsdt: -(o.amount / ME_RATE), orderId: o.id, note: "Выплата клиенту" });
    if (o.commissionUsdt) rows.push({ id: "LMC-" + o.id, ts: o.date, type: "commission", amountUsdt: -o.commissionUsdt, orderId: o.id, note: "Комиссия по выплате" });
  });
  MERCHANT_SETTLEMENTS.filter((s) => s.status === "paid").forEach((s) => {
    rows.push({ id: "LM-" + s.id, ts: s.ts, type: "settlement", amountUsdt: -s.amountUsdt, orderId: s.id, note: "Вывод на " + s.accountIban });
  });
  const parseTs = (t) => { const m = String(t).match(/(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})/); return m ? ((+m[2]) * 31 + (+m[1])) * 1440 + (+m[3]) * 60 + (+m[4]) : 0; };
  rows.sort((a, b) => parseTs(b.ts) - parseTs(a.ts));
  return rows;
})();

function MSettlementDrawer({ row, onClose }) {
  return (
    <Drawer
      title="Settlement"
      status={row.status}
      statusMap={SETTLEMENT_STATUS}
      onClose={onClose}
      footer={<>
        <span className="spacer" />
        <Btn variant="ghost">Скачать выписку</Btn>
      </>}
    >
      <Section title="Сводка">
        <KV items={[
          ["ID", <CopyId value={row.id} />],
          ["Дата", <span className="mono">{row.ts}</span>],
          ["Сумма", <strong>{fmtMoney(row.amountUsdt, "USDT")}</strong>],
          ["Счёт зачисления", <span className="mono">{row.accountIban}</span>],
          ["Инициатор", row.actor],
          ["Комиссия сети", <span className="mono">1.50 USDT</span>],
        ]} />
      </Section>
      <Section title="Транзакция">
        {row.txHash
          ? <div className="mono" style={{ fontSize: 12.5, wordBreak: "break-all", color: "var(--ink-2)" }}>{row.txHash}</div>
          : <Empty>TX ещё не сформирован</Empty>}
      </Section>
    </Drawer>
  );
}

function MerchantSettlement({ onGo }) {
  const [showAdd, setShowAdd] = React.useState(false);
  const [filter, setFilter] = React.useState("all");
  const [period, setPeriod] = React.useState("today");
  const [openOrderId, setOpenOrderId] = React.useState(null);
  const [openStId, setOpenStId] = React.useState(null);

  const balance = ME_MERCHANT.balance?.rub || 0;
  const frozen = ME_MERCHANT.balance?.frozen || 0;
  const available = balance - frozen;

  const PERIODS = {
    "hour":      { label: "Час",     title: "за час",       k: 0.07, take: 4 },
    "today":     { label: "Сегодня", title: "сегодня",      k: 1,    take: 12 },
    "yesterday": { label: "Вчера",   title: "вчера",        k: 0.92, take: 10 },
    "month":     { label: "Месяц",   title: "за месяц",     k: 22.4, take: Infinity },
    "all":       { label: "Всё",     title: "за всё время", k: 184.6, take: Infinity },
  };
  const p = PERIODS[period];
  const periodChips = Object.keys(PERIODS).map((id) => ({ value: id, label: PERIODS[id].label }));
  const payInRub  = Math.round((ME_MERCHANT.today?.payInRub  || 0) * p.k);
  const payOutRub = Math.round((ME_MERCHANT.today?.payOutRub || 0) * p.k);
  const commissionUsdt = (payInRub / ME_RATE) * (ME_MERCHANT.payInRateMerchant / 100) + (payOutRub / ME_RATE) * (ME_MERCHANT.payOutRateMerchant / 100);

  const filters = [
    { value: "all",        label: "Все",        count: MERCHANT_LEDGER.length },
    { value: "payin",      label: "Платежи",    count: MERCHANT_LEDGER.filter((l) => l.type === "payin").length },
    { value: "payout",     label: "Выплаты",    count: MERCHANT_LEDGER.filter((l) => l.type === "payout").length },
    { value: "commission", label: "Комиссии",   count: MERCHANT_LEDGER.filter((l) => l.type === "commission").length },
    { value: "settlement", label: "Settlement", count: MERCHANT_LEDGER.filter((l) => l.type === "settlement").length },
  ];
  const visible = MERCHANT_LEDGER.filter((l) => filter === "all" || l.type === filter);

  const openPayIn  = openOrderId && openOrderId.startsWith("PI-") ? PAY_IN.find((o) => o.id === openOrderId)  : null;
  const openPayOut = openOrderId && openOrderId.startsWith("PO-") ? PAY_OUT.find((o) => o.id === openOrderId) : null;
  const openSt     = openStId ? MERCHANT_SETTLEMENTS.find((s) => s.id === openStId) : null;

  return (
    <>
      <PageHead title="Финансы" sub="Балансы, движения и вывод средств на банковский счёт." />

      <FilterChips filters={periodChips} value={period} onChange={setPeriod} />

      <div className="hero-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="hero-card hero-card--accent">
          <div className="hero-card__label">Доступно к выводу</div>
          <div className="hero-card__value">{(available / ME_RATE).toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="hero-card__actions">
            <Btn variant="primary" size="sm" onClick={() => setShowAdd(true)}>＋ Заказать вывод</Btn>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">В холде</div>
          <div className="hero-card__value">{(frozen / ME_RATE).toFixed(2)} <span className="ccy">USDT</span></div>
        </div>
        <div className="hero-card hero-card--clickable" onClick={() => onGo && onGo("payin")}>
          <div className="hero-card__label">Платежи {p.title}</div>
          <div className="hero-card__value">{(payInRub / ME_RATE).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} <span className="ccy">USDT</span></div>
          <div className="hero-card__sub">{Math.round(payInRub).toLocaleString("ru-RU")} ₽</div>
        </div>
        <div className="hero-card hero-card--clickable" onClick={() => onGo && onGo("payout")}>
          <div className="hero-card__label">Выплаты {p.title}</div>
          <div className="hero-card__value">{(payOutRub / ME_RATE).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} <span className="ccy">USDT</span></div>
          <div className="hero-card__sub">{Math.round(payOutRub).toLocaleString("ru-RU")} ₽</div>
        </div>
      </div>

      <FilterChips filters={filters} value={filter} onChange={setFilter} />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Тип</th>
              <th className="num">Сумма USDT</th>
              <th>Дата</th>
              <th>Ордер</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {visible.slice(0, p.take).map((l) => {
              const clickable = !!l.orderId;
              const onRow = () => {
                if (l.type === "settlement") setOpenStId(l.orderId);
                else setOpenOrderId(l.orderId);
              };
              return (
                <tr key={l.id} style={clickable ? { cursor: "pointer" } : null} onClick={clickable ? onRow : undefined}>
                  <td><StatusPill map={MLEDGER_TYPE} value={l.type} /></td>
                  <td className="num"><strong style={{ color: l.amountUsdt >= 0 ? "var(--ok)" : "var(--bad)" }}>{l.amountUsdt >= 0 ? "+" : "−"}{Math.abs(l.amountUsdt).toFixed(2)} USDT</strong></td>
                  <td className="mono">{l.ts}</td>
                  <td className="mono muted">{l.orderId ? <span style={{ color: "var(--ink)" }}>{l.orderId} <span className="muted" style={{ fontSize: 11 }}>↗</span></span> : "—"}</td>
                  <td className="mono">{l.id}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="table-foot">Показано <strong>{Math.min(visible.length, p.take)}</strong> из <strong>{MERCHANT_LEDGER.length}</strong> · обновляется в реальном времени</div>
      </div>

      {openPayIn  && <MPayInDrawer  order={openPayIn}  onClose={() => setOpenOrderId(null)} />}
      {openPayOut && <MPayOutDrawer order={openPayOut} onClose={() => setOpenOrderId(null)} />}
      {openSt     && <MSettlementDrawer row={openSt} onClose={() => setOpenStId(null)} />}

      {showAdd && (
        <Modal
          title="Заказать вывод"
          onClose={() => setShowAdd(false)}
          footer={<>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Btn>
            <span className="spacer" />
            <Btn variant="primary" onClick={() => setShowAdd(false)}>Создать settlement</Btn>
          </>}
        >
          <Note tone="info">Доступно к выводу: <strong>{(available / ME_RATE).toFixed(2)} USDT</strong> · после комиссии сети будет зачислено меньше на 1.50 USDT.</Note>
          <Field label="Сумма (USDT)" hint="Можно меньше доступного">
            <TextInput placeholder={(available / ME_RATE).toFixed(2)} />
          </Field>
          <Field label="Счёт зачисления">
            <Select value="TRX-PROD-01" options={[{ value: "TRX-PROD-01", label: "TRX-PROD-01 · TQrYa8…w8zpN" }]} />
          </Field>
          <Field label="Комментарий" hint="Опционально">
            <TextInput placeholder="Напр. «Под закупку»" />
          </Field>
        </Modal>
      )}
    </>
  );
}

// ─── API keys + интеграции ─────────────────────────────────────────────────
function MerchantApi() {
  return (
    <>
      <PageHead
        title="API & интеграции"
        sub="Ключи доступа для подключения к CrowdPay."
      />
      <Section title="API ключи" action={<Btn variant="ghost" size="sm">＋ Создать ключ</Btn>}>
        <table className="table table--inset">
          <thead><tr><th>ID</th><th>Label</th><th>Whitelisted IP</th><th>Last used</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {(ME_MERCHANT.apiKeys || []).length === 0 ? (
              <tr><td colSpan={6}><Empty>Ключей нет — мерчант не интегрирован с API</Empty></td></tr>
            ) : (ME_MERCHANT.apiKeys || []).map((k) => (
              <tr key={k.id}>
                <td className="mono">{k.id}</td>
                <td>{k.label}</td>
                <td className="mono">{k.ip}</td>
                <td className="mono muted">{k.lastUsed}</td>
                <td><Pill tone={k.status === "active" ? "ok" : "neutral"}>{k.status}</Pill></td>
                <td className="num"><Btn variant="ghost" size="sm">Revoke</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <MerchantIframeOrigins />
    </>
  );
}

function MerchantIframeOrigins() {
  const [origins, setOrigins] = React.useState([
    "https://betcity.demo",
    "https://m.betcity.demo",
    "https://pay.betcity.demo",
  ]);
  const [draft, setDraft] = React.useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || origins.includes(v)) return;
    setOrigins([...origins, v]);
    setDraft("");
  };
  const remove = (o) => setOrigins(origins.filter((x) => x !== o));
  return (
    <Section title="Разрешённые источники iframe">
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 12 }}>
        Платёжная форма CrowdPay открывается в iframe только на перечисленных доменах. Запросы с других источников блокируются.
      </div>
      <table className="table table--inset">
        <thead><tr><th>Origin</th><th></th></tr></thead>
        <tbody>
          {origins.length === 0 ? (
            <tr><td colSpan={2}><Empty>Источников нет — iframe запрещён везде</Empty></td></tr>
          ) : origins.map((o) => (
            <tr key={o}>
              <td className="mono">{o}</td>
              <td className="num"><Btn variant="ghost" size="sm" onClick={() => remove(o)}>Удалить</Btn></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="chat-input" style={{ borderTop: "none", paddingTop: 12 }}>
        <input
          className="field__input"
          placeholder="https://example.com"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
        />
        <Btn variant="primary" size="sm" onClick={add} disabled={!draft.trim()}>＋ Добавить источник</Btn>
      </div>
    </Section>
  );
}

// ─── Настройки ─────────────────────────────────────────────────────────────
function MerchantSettings() {
  const [tab, setTab] = React.useState("account");
  return (
    <>
      <PageHead title="Настройки аккаунта" sub="Контакты и тариф." />
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: "account",  label: "Аккаунт" },
        { id: "tariff",   label: "Тариф" },
      ]} />
      {tab === "account" && (
        <>
          <Section title="Компания">
            <KV items={[
              ["Название", <strong>{ME_MERCHANT.name}</strong>],
              ["ID мерчанта", <span className="mono">{ME_MERCHANT.id}</span>],
              ["Зарегистрирован", ME_MERCHANT.joined],
              ["Статус", <Pill tone="ok">Active</Pill>],
            ]} />
          </Section>
          <Section title="Контакт">
            <Field label="Ответственный"><TextInput value={ME_MERCHANT.contact?.person || ""} onChange={() => {}} /></Field>
            <Field label="Email"><TextInput value={ME_MERCHANT.contact?.email || ""} onChange={() => {}} /></Field>
            <Field label="Telegram"><TextInput value={ME_MERCHANT.contact?.telegram || ""} onChange={() => {}} /></Field>
          </Section>
        </>
      )}
      {tab === "tariff" && (
        <>
          <MerchantTariffRates />
          <Note tone="info">Тариф настраивает CrowdPay. Чтобы запросить изменение — напишите вашему account-менеджеру.</Note>
        </>
      )}
    </>
  );
}

// ─── Merchant tariff (по платёжным методам, как в дровере мерчанта у админа) ─
function MerchantTariffRates() {
  const [tab, setTab] = React.useState("payin");
  const inBase = ME_MERCHANT.payInRateMerchant;
  const outBase = ME_MERCHANT.payOutRateMerchant;
  const payInMethods = [
    { method: "sbp",     rate: +(inBase + 0.0).toFixed(1), min: 100,  max: 100000 },
    { method: "card",    rate: +(inBase + 0.3).toFixed(1), min: 500,  max: 200000 },
    { method: "c2c",     rate: +(inBase + 0.5).toFixed(1), min: 1000, max: 150000 },
    { method: "phone",   rate: +(inBase + 0.0).toFixed(1), min: 100,  max: 100000 },
    { method: "account", rate: +(inBase + 0.8).toFixed(1), min: 5000, max: 500000 },
  ];
  const payOutMethods = [
    { method: "sbp",     rate: +(outBase + 0.0).toFixed(1), min: 100,  max: 100000 },
    { method: "card",    rate: +(outBase + 0.3).toFixed(1), min: 500,  max: 150000 },
    { method: "c2c",     rate: +(outBase + 0.5).toFixed(1), min: 1000, max: 150000 },
    { method: "phone",   rate: +(outBase + 0.0).toFixed(1), min: 100,  max: 100000 },
    { method: "account", rate: +(outBase + 0.6).toFixed(1), min: 5000, max: 500000 },
  ];
  const rows = tab === "payin" ? payInMethods : payOutMethods;
  return (
    <Section title="Ставки по платёжным методам">
      <FilterChips
        filters={[
          { value: "payin",  label: "Платежи",  count: payInMethods.length },
          { value: "payout", label: "Выплаты", count: payOutMethods.length },
        ]}
        value={tab}
        onChange={setTab}
      />
      <table className="table table--inset">
        <thead><tr>
          <th>Метод</th>
          <th className="num">Ставка (мне)</th>
          <th className="num">Мин. сумма</th>
          <th className="num">Макс. сумма</th>
        </tr></thead>
        <tbody>
          {rows.map((mm) => (
            <tr key={mm.method}>
              <td>
                <span className={"pd-card__method pd-card__method--" + mm.method}>
                  {mm.method === "sbp" ? "СБП" : mm.method === "card" ? "Карта" : mm.method === "c2c" ? "C2C" : mm.method === "phone" ? "Phone" : mm.method === "account" ? "Счёт" : mm.method}
                </span>
              </td>
              <td className="num mono">{mm.rate.toFixed(1)}%</td>
              <td className="num">{fmtMoney(mm.min, "RUB")}</td>
              <td className="num">{fmtMoney(mm.max, "RUB")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

function ToggleRowM({ label, hint, defaultOn }) {
  const [on, setOn] = React.useState(!!defaultOn);
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500 }}>{label}</div>
        {hint && <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{hint}</div>}
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        style={{
          width: 40, height: 22, borderRadius: 999, border: "none",
          background: on ? "var(--ok)" : "var(--line-2)",
          position: "relative", cursor: "pointer", transition: "background 0.15s",
        }}
        aria-pressed={on}
      >
        <span style={{
          position: "absolute", top: 2, left: on ? 20 : 2, width: 18, height: 18,
          background: "#fff", borderRadius: "50%", transition: "left 0.15s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}

// ─── Nav data ──────────────────────────────────────────────────────────────
const M_NAV = [
  { id: "dashboard",  label: "Главная",      icon: "dashboard" },
  { id: "payin",      label: "Платежи",      icon: "payin",      count: PAY_IN.filter((o) => o.merchant === ME_MERCHANT.id && o.status === "waiting-payment").length },
  { id: "payout",     label: "Выплаты",      icon: "payout",     count: PAY_OUT.filter((o) => o.merchant === ME_MERCHANT.id && ["free","in-progress","waiting-review"].includes(o.status)).length },
  { id: "disputes",   label: "Споры",        icon: "disputes" },
  { id: "settlement", label: "Финансы",     icon: "ledger" },
  { id: "webhooks",   label: "Webhook log",  icon: "audit",      count: MERCHANT_WEBHOOK_EVENTS.filter((w) => w.status !== "delivered").length },
  { id: "api",        label: "API & интеграции", icon: "rules" },
  { id: "settings",   label: "Настройки",    icon: "config" },
];
const M_NAV_GROUPS = [
  { label: "",          ids: ["dashboard"] },
  { label: "Операции",  ids: ["payin", "payout", "disputes"] },
  { label: "Деньги",    ids: ["settlement"] },
  { label: "Интеграции", ids: ["webhooks", "api"] },
  { label: "Системные", ids: ["settings"] },
];

Object.assign(window, {
  MerchantDashboard, MerchantPayIn, MerchantPayOut, MerchantDisputes,
  MerchantWebhooks, MerchantSettlement, MerchantApi, MerchantSettings,
  ME_MERCHANT, M_NAV, M_NAV_GROUPS, MERCHANT_WEBHOOK_EVENTS,
});
