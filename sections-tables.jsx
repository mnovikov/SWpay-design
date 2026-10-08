// CrowdPay v3 — табличные разделы (таблица + drawer)
// Платежи, Выплаты, Traders, Terminals, Payment Details, Withdrawals, Settlements, Disputes, Tariffs

// ─── Платежи Orders ───────────────────────────────────────────────────────────
// ── Компактный статус для Платежей: иконка + (для ожидания) обратный отсчёт ──
function PayStatusIcon({ kind, size = 13 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (kind) {
    case "check": return <svg {...common}><polyline points="20 6 9 17 4 12" /></svg>;
    case "auto":  return <svg {...common} strokeWidth="2.2"><polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2" fill="currentColor" stroke="none" /></svg>;
    case "manual":return <svg {...common}><polyline points="20 6 9 17 4 12" /><path d="M2 20h20" strokeWidth="2.1" /></svg>;
    case "clock": return <svg {...common}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></svg>;
    case "x":     return <svg {...common}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
    case "bang":  return <svg {...common}><path d="M12 7v6" /><path d="M12 17h.01" /></svg>;
    case "eye":   return <svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="2.6" /></svg>;
    default:      return <svg {...common} strokeWidth="0" fill="currentColor"><circle cx="12" cy="12" r="4.5" /></svg>;
  }
}

function PayCountdown({ seconds }) {
  const [left, setLeft] = React.useState(seconds);
  React.useEffect(() => {
    setLeft(seconds);
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [seconds]);
  const m = Math.floor(left / 60), s = left % 60;
  return <span>{m}:{String(s).padStart(2, "0")}</span>;
}

const PAYIN_STATUS_ICON = {
  completed: "check", "auto-confirmed": "check",
  "waiting-payment": "clock", matching: "clock",
  created: "dot", "manual-review": "eye",
  expired: "x", failed: "x", disputed: "bang",
};
const PAYIN_TONE_FG = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--bad)", info: "var(--info)", neutral: "var(--ink-3)" };
const PAYIN_TONE_BG = { ok: "var(--ok-soft)", warn: "var(--warn-soft)", bad: "var(--bad-soft)", info: "var(--info-soft)", neutral: "var(--paper-2)" };

function PayInStatusCell({ order }) {
  const meta = PAY_IN_STATUS[order.status] || { label: order.status, tone: "neutral" };
  const kind = PAYIN_STATUS_ICON[order.status] || "dot";
  const titleText = order.status === "auto-confirmed" ? meta.label + " — Auto (автоподтверждение)"
    : order.status === "completed" ? meta.label + " — Manual (подтверждено вручную)"
    : meta.label;
  const isWaiting = order.status === "waiting-payment" || order.status === "matching";
  // детерминированный остаток до конца окна оплаты (окно 15 мин)
  let h = 0; for (const c of String(order.id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const secs = 45 + (h % (14 * 60));
  const shortLabel = order.status === "auto-confirmed" ? "Auto"
    : order.status === "completed" ? "Manual"
    : order.status === "disputed" ? "Спор"
    : order.status === "manual-review" ? "Review"
    : order.status === "expired" ? "Истёк"
    : order.status === "failed" ? "Ошибка"
    : isWaiting ? null : meta.label;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }} title={titleText}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: PAYIN_TONE_BG[meta.tone] || PAYIN_TONE_BG.neutral, color: PAYIN_TONE_FG[meta.tone] || PAYIN_TONE_FG.neutral }}>
        <PayStatusIcon kind={kind} size={16} />
      </span>
      {isWaiting ? (
        <span className="mono" style={{ fontSize: 12.5, color: "var(--warn)", fontVariantNumeric: "tabular-nums" }}>
          <PayCountdown seconds={secs} />
        </span>
      ) : shortLabel && (
        <span style={{ fontSize: 12.5, color: PAYIN_TONE_FG[meta.tone] || "var(--ink-2)", fontWeight: 600 }}>{shortLabel}</span>
      )}
      {order.dispute && order.status !== "disputed" && <span className="dot-dispute" title="Открыт спор"> ●</span>}
    </span>
  );
}

function SectionPayIn({ initOpenId }) {
  const [filter, setFilter] = React.useState("all");
  const [traderFilter, setTraderFilter] = React.useState("all");
  const [providerFilter, setProviderFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  React.useEffect(() => { if (initOpenId) setOpenId(initOpenId); }, [initOpenId]);
  // Детерминированный хэш по id ордера
  const hashId = (o) => { let h = 0; for (const c of String(o.id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  // Платёж выполнен либо трейдером (с реквизитом), либо провайдером (~1/3 — провайдер)
  const isProviderOrder = React.useCallback((o) => {
    const ids = (typeof PROVIDERS !== "undefined" ? PROVIDERS : []).map((p) => p.id);
    return ids.length ? hashId(o) % 3 === 0 : false;
  }, []);
  const providerOf = React.useCallback((o) => {
    const ids = (typeof PROVIDERS !== "undefined" ? PROVIDERS : []).map((p) => p.id);
    if (!ids.length) return null;
    return ids[hashId(o) % ids.length];
  }, []);
  const providerNameById = (id) => {
    const p = (typeof PROVIDERS !== "undefined" ? PROVIDERS : []).find((x) => x.id === id);
    return p ? p.name : id;
  };
  const traderOptions = [
    { value: "all", label: "Все трейдеры" },
    ...Array.from(new Set(PAY_IN.filter((o) => !isProviderOrder(o)).map((o) => o.trader))).map((id) => ({ value: id, label: traderName(id) })),
  ];
  const providerOptions = [
    { value: "all", label: "Все провайдеры" },
    ...(typeof PROVIDERS !== "undefined" ? PROVIDERS : []).map((p) => ({ value: p.id, label: p.name })),
  ];
  const filters = [
    { value: "all", label: "Все", count: PAY_IN.length },
    { value: "waiting-payment", label: "Waiting payment", count: PAY_IN.filter((o) => o.status === "waiting-payment").length },
    { value: "manual-review", label: "Manual review", count: PAY_IN.filter((o) => o.status === "manual-review").length },
    { value: "completed", label: "Completed", count: PAY_IN.filter((o) => ["completed","auto-confirmed"].includes(o.status)).length },
    { value: "disputed", label: "Disputed", count: PAY_IN.filter((o) => o.dispute).length },
    { value: "failed", label: "Failed/Expired", count: PAY_IN.filter((o) => ["failed","expired"].includes(o.status)).length },
  ];
  const visible = PAY_IN.filter((o) => {
    const prov = isProviderOrder(o);
    if (traderFilter !== "all" && (prov || o.trader !== traderFilter)) return false;
    if (providerFilter !== "all" && (!prov || providerOf(o) !== providerFilter)) return false;
    if (filter === "all") return true;
    if (filter === "completed") return ["completed","auto-confirmed"].includes(o.status);
    if (filter === "failed") return ["failed","expired"].includes(o.status);
    if (filter === "disputed") return o.dispute;
    return o.status === filter;
  });
  const open = PAY_IN.find((o) => o.id === openId);
  return (
    <>
      <PageHead
        title="Платежи Orders"
        sub="Заявки на приём денег: Customer → Payment Details трейдера. Админ может перевести в Manual Review, открыть спор или поменять финальный статус."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
        <ChipSelect value={traderFilter} onChange={setTraderFilter} options={traderOptions} placeholder="Трейдер" align="left" />
        <ChipSelect value={providerFilter} onChange={setProviderFilter} options={providerOptions} placeholder="Провайдер" align="left" />
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 118 }}>Статус</th>
              <th className="num">Сумма</th>
              <th>Исполнитель</th>
              <th>Merchant</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => {
              const pd = PAYMENT_DETAILS.find((p) => p.id === o.details);
              return (
              <tr key={o.id} className={openId === o.id ? "is-selected" : ""} onClick={() => setOpenId(o.id)}>
                <td><PayInStatusCell order={o} /></td>
                <td className="num">
                  <strong>{(o.amount / 92.4).toFixed(2)} USDT</strong>
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{fmtMoney(o.amount)}</div>
                </td>
                <td>
                  {isProviderOrder(o) ? (() => {
                    const req = window.piProviderRequisite ? window.piProviderRequisite(o) : null;
                    return (
                    <>
                      <div>{providerNameById(providerOf(o))} <span className="muted" style={{ fontSize: 12 }}>· провайдер{req ? " · " + (METHOD_LABEL[req.method] || req.method) : ""}</span></div>
                      {req && <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}><span style={{ fontFamily: "var(--font-body, inherit)" }}>{bankName(o.bank)}</span> · {req.target}</div>}
                    </>
                    );
                  })() : (
                    <>
                      <div>{traderName(o.trader)} {pd && <span className="muted" style={{ fontSize: 12 }}>· {METHOD_LABEL[pd.method] || pd.method}</span>}</div>
                      <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}><span style={{ fontFamily: "var(--font-body, inherit)" }}>{bankName(o.bank)}</span> · {pd ? pd.target : o.details}</div>
                    </>
                  )}
                </td>
                <td>
                  <strong>{o.merchantName}</strong>
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{o.merchant}</div>
                </td>
                <td className="mono muted">{o.date}</td>
              </tr>
            );})}
          </tbody>
        </table>
        <div className="table-foot">
          Показано <strong>{visible.length}</strong> из <strong>{PAY_IN.length}</strong>
          <span className="table-foot__pages">
            <button className="page-btn" disabled>‹</button>
            <button className="page-btn page-btn--active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">›</button>
          </span>
        </div>
      </div>
      {open && (
        <PayInDrawerV2 order={open} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}

// ─── Выплаты Orders ──────────────────────────────────────────────────────────
function SectionPayOut({ initOpenId }) {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  React.useEffect(() => { if (initOpenId) setOpenId(initOpenId); }, [initOpenId]);
  const filters = [
    { value: "all", label: "Все", count: PAY_OUT.length },
    { value: "available", label: "Available to claim", count: PAY_OUT.filter((o) => o.status === "available").length },
    { value: "in-progress", label: "In progress", count: PAY_OUT.filter((o) => o.status === "in-progress").length },
    { value: "proof", label: "Awaiting confirmation", count: PAY_OUT.filter((o) => o.status === "proof").length },
    { value: "frozen", label: "Frozen", count: PAY_OUT.filter((o) => o.status === "frozen").length },
    { value: "disputed", label: "Disputed", count: PAY_OUT.filter((o) => o.status === "disputed").length },
  ];
  const visible = PAY_OUT.filter((o) => filter === "all" || o.status === filter);
  const open = PAY_OUT.find((o) => o.id === openId);
  return (
    <>
      <PageHead
        title="Выплаты Orders"
        sub="Заявки на выплату Customer. Выплаты всегда выполняет Trader. Admin не нажимает «Take to work» — только подтверждает результат."
      />
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Статус</th>
              <th>Получатель</th>
              <th className="num">Сумма</th>
              <th>Merchant</th>
              <th>Trader</th>
              <th>Proof</th>
              <th>ID</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => {
              const pd = o.trader
                ? (PAYMENT_DETAILS.find((p) => p.trader === o.trader && p.bank === o.customerBank)
                   || PAYMENT_DETAILS.find((p) => p.trader === o.trader))
                : null;
              return (
              <tr key={o.id} className={openId === o.id ? "is-selected" : ""} onClick={() => setOpenId(o.id)}>
                <td><StatusPill map={PAY_OUT_STATUS} value={o.status} /></td>
                <td>
                  <div>{o.customer}</div>
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{bankName(o.customerBank)} · {o.customerTarget}</div>
                </td>
                <td className="num">
                  <strong>{(o.amount / 92.4).toFixed(2)} USDT</strong>
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{fmtMoney(o.amount)}</div>
                </td>
                <td>
                  <strong>{o.merchantName}</strong>
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{o.merchant}</div>
                </td>
                <td>
                  {o.trader ? <>
                    <div>{traderName(o.trader)}</div>
                    <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{o.trader}</div>
                  </> : <span className="muted">не назначен</span>}
                </td>
                <td><span className={"proof proof--" + o.proof}>{({none:"—",uploaded:"Uploaded",rejected:"Rejected"})[o.proof]}</span></td>
                <td className="mono">{o.id}</td>
                <td className="mono muted">{o.date}</td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
      {open && (
        <Drawer
          title="Выплаты Order"
          id={open.id}
          status={open.status}
          statusMap={PAY_OUT_STATUS}
          onClose={() => setOpenId(null)}
          wide
          footer={<>
            <Btn variant="ghost">Reassign</Btn>
            <Btn variant="ghost">Release</Btn>
            <span className="spacer" />
          </>}
        >
          <Section title="Order summary">
            <KV items={[
              ["Сумма", <strong>{fmtMoney(open.amount, open.currency)}</strong>],
              ["Created at", <span className="mono">{open.date}</span>],
              ["Claim / lock timer", <span className="mono">{open.claim}</span>],
            ]} />
          </Section>
          <Section title="Customer payment target">
            <KV items={[
              ["Customer", open.customer],
              ["Phone / target", <span className="mono">{open.customerTarget}</span>],
              ["Bank", <strong>{bankName(open.customerBank)}</strong>],
            ]} />
          </Section>
          <Section title="Execution">
            {open.trader ? (
              <KV items={[
                ["Assigned Trader", <><strong>{traderName(open.trader)}</strong> <span className="mono muted">· {open.trader}</span></>],
                ["Took order", <span className="mono">{open.date}</span>],
                ["Status", <StatusPill map={PAY_OUT_STATUS} value={open.status} />],
              ]} />
            ) : (
              <Empty>Заявка пока не взята трейдером</Empty>
            )}
          </Section>
          <Section title="Proof">
            {open.proof === "uploaded" ? (
              <>
                <PlaceholderImg label={"Чек перевода · receipt-" + open.id + ".png"} h={140} />
                <div className="mono muted" style={{ marginTop: 8, fontSize: 12 }}>uploaded by {open.trader} · {open.date}</div>
              </>
            ) : open.proof === "rejected" ? (
              <Note tone="bad">Чек отклонён администратором — сумма не совпадает</Note>
            ) : (
              <Empty>Чек ещё не загружен</Empty>
            )}
          </Section>
        </Drawer>
      )}
    </>
  );
}

// ─── Traders ────────────────────────────────────────────────────────────────
function SectionTraders({ onOpenAddTrader }) {
  const [filter, setFilter] = React.useState("all");
  const [teamFilter, setTeamFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [tab, setTab] = React.useState("overview");
  const [editTrader, setEditTrader] = React.useState(null);
  const filters = [
    { value: "all", label: "Все", count: TRADERS.length },
    { value: "active", label: "Active", count: TRADERS.filter((t) => t.status === "active").length },
    { value: "suspended", label: "Suspended", count: TRADERS.filter((t) => t.status === "suspended").length },
    { value: "deactivated", label: "Deactivated", count: TRADERS.filter((t) => t.status === "deactivated").length },
  ];
  const teams = React.useMemo(() => {
    const set = new Set();
    TRADERS.forEach((t) => { if (t.team) set.add(t.team); });
    return Array.from(set);
  }, []);
  const teamOptions = [{ value: "all", label: "Все команды" }, ...teams.map((t) => ({ value: t, label: t }))];
  const visible = TRADERS.filter((t) => (filter === "all" || t.status === filter) && (teamFilter === "all" || (t.team || "") === teamFilter));
  const open = TRADERS.find((t) => t.id === openId);
  return (
    <>
      <PageHead
        title="Traders"
        sub="Внешние исполнители — управляют терминалами, реквизитами, выполняют Выплаты и делают Withdrawal/Settlement."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
        <ChipSelect value={teamFilter} onChange={setTeamFilter} options={teamOptions} placeholder="Команда" align="left" />
        <Btn variant="primary" size="sm" style={{ borderRadius: 999, padding: "6px 14px", fontSize: 13 }} onClick={onOpenAddTrader}>Добавить трейдера</Btn>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Статус</th>
              <th>Trader</th>
              <th className="num">Баланс</th>
              <th className="num">Платежи / day</th>
              <th className="num">Выплаты / day</th>
              <th className="num">Success</th>
              <th className="num">Disputes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t, i) => (
              <tr key={t.id} className={openId === t.id ? "is-selected" : ""} onClick={() => { setOpenId(t.id); setTab("overview"); }}>
                <td><StatusPill map={TRADER_STATUS} value={t.status} /></td>
                <td>
                  <div className="cell-stack">
                    <strong>{t.name}</strong>
                    <span className="muted">{t.team || "—"}</span>
                  </div>
                </td>
                <td className="num">
                  {(t.balance?.workingUsdt || 0).toFixed(2)} <span className="muted">USDT</span>
                  {(t.balance?.lockedUsdt || 0) > 0 && (
                    <div className="muted" style={{ fontSize: 11 }}>
                      заблок. {(t.balance.lockedUsdt).toFixed(0)} USDT
                    </div>
                  )}
                </td>
                <td className="num">
                  {fmtMoney((t.today?.payInRub ?? 0) / 92.4, "USDT")}
                  <div className="muted" style={{ fontSize: 11 }}>{[412, 198, 521, 0, 287, 0][i] ?? 0} ord</div>
                </td>
                <td className="num">
                  {fmtMoney((t.today?.payOutRub ?? 0) / 92.4, "USDT")}
                  <div className="muted" style={{ fontSize: 11 }}>{[38, 21, 64, 0, 32, 0][i] ?? 0} ord</div>
                </td>
                <td className="num">{Math.round(t.success * 100)}%</td>
                <td className="num">{(t.counts?.openDisputes) || "—"}</td>
                <td className="num" onClick={(e) => e.stopPropagation()}>
                  {t.status === "active"
                    ? <Btn variant="danger" size="sm">Блокировать</Btn>
                    : <Btn variant="ok" size="sm">Активировать</Btn>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Drawer
          title={open.name}
          id={open.id}
          status={open.status}
          statusMap={TRADER_STATUS}
          onClose={() => setOpenId(null)}
          wide
          footer={<>
            {open.status === "active" && <Btn variant="danger">Deactivate Trader</Btn>}
            {open.status === "deactivated" && <Btn variant="ok">Reactivate</Btn>}
            {open.status === "suspended" && <><Btn variant="ok">Reactivate</Btn><Btn variant="danger">Deactivate</Btn></>}
            <span className="spacer" />
            <Btn variant="primary" onClick={() => setEditTrader(open)}>Редактировать</Btn>
          </>}
        >
          <Tabs
            tabs={[
              { id: "overview",  label: "Overview" },
              { id: "deposit",   label: "Депозит" },
              { id: "tariff",    label: "Тариф" },
              { id: "merchants", label: "Мерчанты" },
              { id: "access",    label: "Доступ" },
            ]}
            value={tab}
            onChange={setTab}
          />
          {tab === "overview" && <TraderOverviewTab trader={open} /> }
          {tab === "deposit" && <TraderDepositTab trader={open} />}
          {tab === "tariff" && <TraderTariffTab tariffId={open.tariff || "TF-001"} />}
          {tab === "merchants" && <TraderMerchantsTab trader={open} />}
          {tab === "access" && <TraderAccessTab trader={open} />}
        </Drawer>
      )}
      {editTrader && (
        <AddTraderWizard trader={editTrader} onClose={() => setEditTrader(null)} />
      )}
    </>
  );
}

// ─── Trader Overview (with period filters) ───────────────────────────────
function TraderOverviewTab({ trader }) {
  const [period, setPeriod] = React.useState("today");
  const PERIODS = {
    "hour":      { label: "Час",     k: 0.07 },
    "today":     { label: "Сегодня", k: 1    },
    "yesterday": { label: "Вчера",   k: 0.92 },
    "month":     { label: "Месяц",   k: 22.4 },
    "all":       { label: "Всё",     k: 184.6 },
  };
  const p = PERIODS[period];
  const periodChips = Object.keys(PERIODS).map((id) => ({ value: id, label: PERIODS[id].label }));

  const payInUsdt  = ((trader.today?.payInRub  ?? trader.payInDay  ?? 0) / 92.4) * p.k;
  const payOutUsdt = ((trader.today?.payOutRub ?? trader.payOutDay ?? 0) / 92.4) * p.k;
  const payInOrdersBase  = PAY_IN.filter((o) => o.trader === trader.id).length || 1;
  const payOutOrdersBase = PAY_OUT.filter((o) => o.trader === trader.id).length || 1;
  const payInOrders  = Math.max(0, Math.round(payInOrdersBase  * p.k * 8));
  const payOutOrders = Math.max(0, Math.round(payOutOrdersBase * p.k * 1.4));

  const disputesAll = (typeof DISPUTES !== "undefined") ? DISPUTES.filter((d) => d.trader === trader.id) : [];
  const openBase    = trader.counts?.openDisputes ?? disputesAll.filter((d) => ["open","waiting-trader","waiting-admin","escalated"].includes(d.status)).length;
  const totalBase   = Math.max(disputesAll.length, openBase + 9);
  const openDisputes  = Math.max(0, Math.round(openBase  * p.k));
  const totalDisputes = Math.max(openDisputes, Math.round(totalBase * p.k));
  const conv = Math.round((trader.success || 0) * 100);

  return (
    <>
      <FilterChips filters={periodChips} value={period} onChange={setPeriod} />

      <div className="stat-row stat-row--3">
        <div className="stat">
          <div className="stat__label">Платежи · {PERIODS[period].label.toLowerCase()}</div>
          <div className="stat__value">{payInUsdt.toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="stat__delta">{payInOrders.toLocaleString("ru-RU")} ордеров</div>
        </div>
        <div className="stat">
          <div className="stat__label">Выплаты · {PERIODS[period].label.toLowerCase()}</div>
          <div className="stat__value">{payOutUsdt.toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="stat__delta">{payOutOrders.toLocaleString("ru-RU")} ордеров</div>
        </div>
        <div className="stat">
          <div className="stat__label">Споры</div>
          <div className="stat__value">{openDisputes} <span className="ccy">из {totalDisputes}</span></div>
          <div className="stat__delta">конверсия <b style={{ color: "var(--ink)" }}>{conv}%</b></div>
        </div>
      </div>

      <Section title="Контакт">
        <KV items={[
          ["Имя", <strong>{trader.name}</strong>],
          ["Trader ID", <span className="mono">{trader.id}</span>],
          ["Телефон", <span className="mono">{trader.phone || "—"}</span>],
          ["Email", <span className="mono">{trader.email || "—"}</span>],
          ["Telegram", <span className="mono">{trader.telegram || "@" + (trader.login || trader.id.toLowerCase())}</span>],
          ["Работает с VIP", trader.vip ? <Pill tone="ok">Да</Pill> : <span className="muted">Нет</span>],
        ]} />
      </Section>
      <Section title="USDT кошельки">
        <KV items={[
          ["Кошелёк рабочего депозита", <MonoCopy value={trader.workingWallet || ("TWk7" + trader.id.replace("TR-", "") + "qP4nL9bHfJ7Lm3xZ4dYsN5w8z")} />],
        ]} />
      </Section>
      <Section title="Прочее">
        <KV items={[
          ["Статус", <StatusPill map={TRADER_STATUS} value={trader.status} />],
          ["Команда", trader.team || "—"],
          ["Зарегистрирован", <span className="mono">{trader.registered || "—"}</span>],
          ["Рейтинг", <>{Math.round((trader.rating || 0) * 20)} / 100</>],
          ["Last activity", trader.last || "—"],
        ]} />
      </Section>
    </>
  );
}

// ─── Trader Access (login + password reset) ─────────────────────────────
function genPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digit = "23456789";
  const sym = "!@#$%&*?";
  const all = upper + lower + digit + sym;
  const pick = (s) => s[Math.floor(Math.random() * s.length)];
  let out = [pick(upper), pick(lower), pick(digit), pick(sym)];
  for (let i = 0; i < 8; i++) out.push(pick(all));
  // shuffle
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join("");
}

function TraderAccessTab({ trader }) {
  const login = trader.login || trader.id.toLowerCase();
  const [newPw, setNewPw] = React.useState(null);
  const [resetAt, setResetAt] = React.useState(null);
  const [reveal, setReveal] = React.useState(true);

  const doReset = () => {
    setNewPw(genPassword());
    setReveal(true);
    const now = new Date();
    setResetAt(now.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }));
  };

  return (
    <>
      <Section title="Учётные данные">
        <KV items={[
          ["Логин / Email", <MonoCopy value={trader.email || login} />],
          ["Trader ID", <span className="mono">{trader.id}</span>],
          ["Статус", <StatusPill map={TRADER_STATUS} value={trader.status} />],
          ["Последний вход", trader.last || "—"],
        ]} />
      </Section>

      <Section
        title="Пароль"
        action={<Btn variant={newPw ? "ghost" : "primary"} size="sm" onClick={doReset}>
          {newPw ? "Сбросить ещё раз" : "Сбросить пароль"}
        </Btn>}
      >
        {!newPw && (
          <Note tone="neutral">
            Сброс сгенерирует новый временный пароль для трейдера. Текущий пароль перестанет действовать сразу после сброса.
          </Note>
        )}

        {newPw && (
          <>
            <div style={{ border: "1px solid var(--line-2)", borderRadius: "var(--radius)", padding: "12px 14px", background: "var(--paper-2)", marginBottom: 10 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--ink-3)", marginBottom: 6 }}>Новый пароль</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{ fontSize: 17, letterSpacing: 0.5, color: "var(--ink)" }}>
                  {reveal ? newPw : "•".repeat(newPw.length)}
                </span>
                <span className="spacer" style={{ flex: 1 }} />
                <Btn variant="ghost" size="sm" onClick={() => setReveal((r) => !r)}>
                  {reveal ? "Скрыть" : "Показать"}
                </Btn>
                <CopyBtn value={newPw} />
              </div>
            </div>
            <Note tone="warn">
              Пароль показывается только сейчас. Скопируйте и передайте трейдеру по защищённому каналу — повторно посмотреть его будет нельзя.
            </Note>
            <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              Сброшен: <span className="mono">{resetAt}</span> · оператор <span className="mono">a.smirnov</span>
            </div>
          </>
        )}
      </Section>

      <Section title="Безопасность">
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost">Завершить все сессии</Btn>
          <Btn variant="danger">Заблокировать вход</Btn>
        </div>
      </Section>
    </>
  );
}

// ─── Trader Deposit (mirrors trader-app Finance section) ─────────────────
function TraderDepositTab({ trader }) {
  const [period, setPeriod] = React.useState("today");
  const [filter, setFilter] = React.useState("all");
  const [extra, setExtra] = React.useState([]);  // manually-added rows
  // inline form state
  const [fDir, setFDir] = React.useState("deposit");
  const [fAcct, setFAcct] = React.useState("working");
  const [fAmount, setFAmount] = React.useState("");
  const [fNote, setFNote] = React.useState("");
  const [overdraft, setOverdraft] = React.useState(String(trader.overdraftUsdt ?? 0));
  const PERIODS = {
    "hour":      { label: "Час",     k: 0.07 },
    "today":     { label: "Сегодня", k: 1    },
    "yesterday": { label: "Вчера",   k: 0.92 },
    "month":     { label: "Месяц",   k: 22.4 },
    "all":       { label: "Всё",     k: 184.6 },
  };
  const p = PERIODS[period];
  const periodChips = Object.keys(PERIODS).map((id) => ({ value: id, label: PERIODS[id].label }));

  const dep = DEPOSITS.find((d) => d.trader === trader.id);
  const baseWorking   = dep?.workingUsdt ?? 0;
  const baseInsurance = dep?.insuranceUsdt ?? 0;
  const locked    = dep?.workingLockedUsdt ?? 0;
  // live balances reflect manually-added rows
  const delta = (kind) => extra
    .filter((e) => e.kind === kind)
    .reduce((s, e) => s + (e.direction === "deposit" ? e.amountUsdt : -e.amountUsdt), 0);
  const working   = baseWorking   + delta("working");
  const insurance = baseInsurance + delta("insurance");

  const baseHistory = (typeof DEPOSIT_HISTORY !== "undefined" ? DEPOSIT_HISTORY : []).filter((h) => h.trader === trader.id);
  const history = [...extra, ...baseHistory];
  const filters = [
    { value: "all",       label: "Все",        count: history.length },
    { value: "working",   label: "Рабочий",    count: history.filter((h) => h.kind === "working").length },
    { value: "insurance", label: "Страховой",  count: history.filter((h) => h.kind === "insurance").length },
  ];
  const visible = history.filter((h) => {
    if (filter === "all") return true;
    if (filter === "working") return h.kind === "working";
    if (filter === "insurance") return h.kind === "insurance";
    return true;
  });

  const dirSign = (d) => (d === "deposit" || d === "release" || d === "commission") ? 1 : -1;

  const fAmt = parseFloat(fAmount);
  const fAvail = fAcct === "working" ? working : insurance;
  const fOverdraw = fDir === "withdraw" && fAmt > fAvail;
  const fValid = fAmt > 0 && !fOverdraw;
  const submitMove = () => {
    if (!fValid) return;
    const seq = Math.floor(1000 + Math.random() * 9000);
    setExtra((prev) => [{
      id: (fDir === "deposit" ? "DH-D" : "DH-W") + seq,
      ts: "сейчас",
      trader: trader.id,
      kind: fAcct,
      direction: fDir,
      amountUsdt: +fAmt.toFixed(2),
      ref: fNote || "ручная операция",
      note: fDir === "deposit" ? "Ручное пополнение" : "Ручной вывод",
    }, ...prev]);
    setFAmount("");
    setFNote("");
  };

  return (
    <>
      <div className="stat-row stat-row--3" style={{ marginBottom: 14 }}>
        <div className="stat">
          <div className="stat__label">Рабочий депозит</div>
          <div className="stat__value">{working.toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="stat__delta">минимум 300 USDT</div>
        </div>
        <div className="stat">
          <div className="stat__label">Заморожено</div>
          <div className="stat__value">{locked.toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="stat__delta">{PAY_OUT.filter((x) => x.trader === trader.id && (x.status === "claimed" || x.status === "in_progress")).length} активных ордеров</div>
        </div>
        <div className="stat">
          <div className="stat__label">Страховой депозит</div>
          <div className="stat__value">{insurance.toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="stat__delta">минимум {(dep?.insuranceMinUsdt ?? 0).toFixed(0)} USDT</div>
        </div>
      </div>

      <Section
        title="Лимит овердрафта"
        action={<Btn variant="primary" size="sm">Сохранить</Btn>}
      >
        <Field label="Лимит овердрафта (USDT)" hint="Насколько рабочий баланс может уйти в минус при выполнении выплат">
          <TextInput mono value={overdraft} onChange={setOverdraft} placeholder="напр. 500" />
        </Field>
      </Section>

      <Section
        title="Депозит / вывод"
        action={
          <Btn variant={fDir === "deposit" ? "ok" : "danger"} size="sm" disabled={!fValid} onClick={submitMove}>
            {fDir === "deposit" ? "＋ Зачислить" : "− Списать"}
          </Btn>
        }
      >
        <div className="row-2">
          <Field label="Операция">
            <Select value={fDir} onChange={setFDir} options={[
              { value: "deposit",  label: "Пополнение" },
              { value: "withdraw", label: "Вывод" },
            ]} />
          </Field>
          <Field label="Счёт">
            <Select value={fAcct} onChange={setFAcct} options={[
              { value: "working",   label: `Рабочий · ${working.toFixed(2)} USDT` },
              { value: "insurance", label: `Страховой · ${insurance.toFixed(2)} USDT` },
            ]} />
          </Field>
        </div>
        <div className="row-2">
          <Field label="Сумма (USDT)" hint={fOverdraw ? "Больше доступного баланса" : undefined}>
            <TextInput value={fAmount} onChange={setFAmount} placeholder="напр. 500" mono />
          </Field>
          <Field label="TX">
            <TextInput value={fNote} onChange={setFNote} placeholder="напр. 0x9f2c…a31b" mono />
          </Field>
        </div>
      </Section>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <FilterChips filters={periodChips} value={period} onChange={setPeriod} />
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>Тип</th>
            <th className="num">Сумма USDT</th>
            <th>Счёт</th>
            <th>Ссылка</th>
            <th>Дата</th>
            <th>ID</th>
          </tr></thead>
          <tbody>
            {visible.slice(0, 12).map((h) => {
              const sign = dirSign(h.direction);
              return (
                <tr key={h.id} className="is-static">
                  <td><StatusPill map={DEPOSIT_DIRECTION} value={h.direction} /></td>
                  <td className="num">
                    <strong style={{ color: sign >= 0 ? "var(--ok)" : "var(--bad)" }}>
                      {sign >= 0 ? "+" : "−"}{h.amountUsdt.toFixed(2)} USDT
                    </strong>
                  </td>
                  <td><Pill tone={DEPOSIT_KIND[h.kind]?.tone || "neutral"}>{DEPOSIT_KIND[h.kind]?.label || h.kind}</Pill></td>
                  <td className="mono muted">{h.ref || "—"}</td>
                  <td className="mono">{h.ts}</td>
                  <td className="mono">{h.id}</td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr><td colSpan={6}><Empty>Операций по этому фильтру нет</Empty></td></tr>
            )}
          </tbody>
        </table>
        {visible.length > 0 && (
          <div className="table-foot">Показано <strong>{Math.min(visible.length, 12)}</strong> из <strong>{history.length}</strong></div>
        )}
      </div>
    </>
  );
}

// ─── Trader Tariff (per-method, mirrors trader app) ──────────────────────
const TRADER_METHOD_LABELS = { sbp: "СБП", card: "Карта", c2c: "C2C", phone: "Phone", account: "Счёт" };
const TRADER_METHOD_OPTIONS = Object.keys(TRADER_METHOD_LABELS).map((v) => ({ value: v, label: TRADER_METHOD_LABELS[v] }));

function TraderTariffTab({ tariffId }) {
  const t = TARIFFS.find((x) => x.id === tariffId) || TARIFFS[0];
  const [tab, setTab] = React.useState("payin");
  const [editing, setEditing] = React.useState(null);
  const inBase = t.payInTrader;
  const outBase = t.payOutTrader;
  const [methods, setMethods] = React.useState({
    payIn: [
      { method: "sbp",     rate: +(inBase + 0.0).toFixed(1), min: 100,  max: 100000 },
      { method: "card",    rate: +(inBase + 0.3).toFixed(1), min: 500,  max: 200000 },
      { method: "c2c",     rate: +(inBase + 0.5).toFixed(1), min: 1000, max: 150000 },
      { method: "phone",   rate: +(inBase + 0.0).toFixed(1), min: 100,  max: 100000 },
      { method: "account", rate: +(inBase - 0.5).toFixed(1), min: 5000, max: 500000 },
    ],
    payOut: [
      { method: "sbp",     rate: +(outBase + 0.0).toFixed(1), min: 100,  max: 100000 },
      { method: "card",    rate: +(outBase + 0.3).toFixed(1), min: 500,  max: 150000 },
      { method: "c2c",     rate: +(outBase + 0.5).toFixed(1), min: 1000, max: 150000 },
      { method: "phone",   rate: +(outBase + 0.0).toFixed(1), min: 100,  max: 100000 },
      { method: "account", rate: +(outBase - 0.3).toFixed(1), min: 5000, max: 500000 },
    ],
  });

  const key = tab === "payin" ? "payIn" : "payOut";
  const rows = methods[key];
  const setRow = (i, patch) => setMethods((prev) => ({ ...prev, [key]: prev[key].map((r, idx) => idx === i ? { ...r, ...patch } : r) }));
  const removeRow = (i) => { setMethods((prev) => ({ ...prev, [key]: prev[key].filter((_, idx) => idx !== i) })); setEditing(null); };
  const addRow = () => { setMethods((prev) => ({ ...prev, [key]: [...prev[key], { method: "sbp", rate: tab === "payin" ? +inBase.toFixed(1) : +outBase.toFixed(1), min: 100, max: 100000 }] })); setEditing(rows.length); };
  const numStyle = (w) => ({ fontFamily: "var(--font-mono)", fontSize: 12.5, width: w, padding: "4px 8px", textAlign: "right" });

  return (
    <>
      <Section title="Ставки по платёжным методам">
        <FilterChips
          filters={[
            { value: "payin",  label: "Платежи",  count: methods.payIn.length },
            { value: "payout", label: "Выплаты", count: methods.payOut.length },
          ]}
          value={tab}
          onChange={(v) => { setTab(v); setEditing(null); }}
        />
        <table className="table table--inset">
          <thead><tr>
            <th>Метод</th>
            <th className="num">Ставка (трейдеру)</th>
            <th className="num">Мин. сумма</th>
            <th className="num">Макс. сумма</th>
            <th style={{ width: 130 }}></th>
          </tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5}><Empty>Нет ставок — добавьте строку</Empty></td></tr>
            ) : rows.map((m, i) => {
              const isEdit = editing === i;
              return (
                <tr key={i}>
                  <td>
                    {isEdit ? (
                      <select className="field__input" style={{ fontSize: 12.5, width: 110, padding: "4px 8px" }}
                        value={m.method} onChange={(e) => setRow(i, { method: e.target.value })}>
                        {TRADER_METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <span className={"pd-card__method pd-card__method--" + m.method}>
                        {TRADER_METHOD_LABELS[m.method] || m.method}
                      </span>
                    )}
                  </td>
                  <td className="num mono">
                    {isEdit ? (
                      <input className="field__input" style={numStyle(72)}
                        value={m.rate} onChange={(e) => setRow(i, { rate: parseFloat(e.target.value) || 0 })} />
                    ) : (Number(m.rate).toFixed(1) + "%")}
                  </td>
                  <td className="num mono">
                    {isEdit ? (
                      <input className="field__input" style={numStyle(96)}
                        value={m.min} onChange={(e) => setRow(i, { min: parseInt(e.target.value) || 0 })} />
                    ) : fmtMoney(m.min, "RUB")}
                  </td>
                  <td className="num mono">
                    {isEdit ? (
                      <input className="field__input" style={numStyle(110)}
                        value={m.max} onChange={(e) => setRow(i, { max: parseInt(e.target.value) || 0 })} />
                    ) : fmtMoney(m.max, "RUB")}
                  </td>
                  <td className="num">
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      {isEdit ? (
                        <Btn variant="primary" size="sm" onClick={() => setEditing(null)}>Готово</Btn>
                      ) : (
                        <Btn variant="ghost" size="sm" onClick={() => setEditing(i)}>Редактировать</Btn>
                      )}
                      <button className="btn btn--ghost" title="Удалить строку" style={{ padding: "4px 8px", fontSize: 14, lineHeight: 1 }}
                        onClick={() => removeRow(i)}>✕</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 10 }}>
          <Btn variant="ghost" size="sm" onClick={addRow}>＋ Добавить строку</Btn>
        </div>
      </Section>

      <Section title="История изменений">
        <Timeline items={[
          { time: "12.03.2024", text: "Тариф «" + t.name + "» назначен админом при регистрации" },
          { time: "—", text: "Изменений с этого момента не было", muted: true },
        ]} />
      </Section>
    </>
  );
}

// ─── Trader Merchants (whitelist) ────────────────────────────────────────
function TraderMerchantsTab({ trader }) {
  const tid = trader.id;
  const initial = React.useMemo(() => {
    const map = {};
    MERCHANTS.forEach((m) => {
      const allowed = Array.isArray(m.allowedTraders) ? m.allowedTraders : [];
      const blocked = Array.isArray(m.blockedTraders) ? m.blockedTraders : [];
      // Connected = NOT blocked AND (whitelist empty OR includes this trader)
      map[m.id] = !blocked.includes(tid) && (allowed.length === 0 || allowed.includes(tid));
    });
    return map;
  }, [tid]);

  const [conn, setConn] = React.useState(initial);
  const [filter, setFilter] = React.useState("all");

  React.useEffect(() => { setConn(initial); }, [initial]);

  const counts = {
    all: MERCHANTS.length,
    connected: MERCHANTS.filter((m) => conn[m.id]).length,
    disconnected: MERCHANTS.filter((m) => !conn[m.id]).length,
  };
  const filters = [
    { value: "all",          label: "Все",        count: counts.all },
    { value: "connected",    label: "Подключены", count: counts.connected },
    { value: "disconnected", label: "Отключены",  count: counts.disconnected },
  ];

  const visible = MERCHANTS.filter((m) => {
    if (filter === "connected") return conn[m.id];
    if (filter === "disconnected") return !conn[m.id];
    return true;
  });

  const toggle = (mid) => setConn((s) => ({ ...s, [mid]: !s[mid] }));
  const connectAll = () => {
    const next = {};
    MERCHANTS.forEach((m) => { next[m.id] = m.status === "active" ? true : conn[m.id]; });
    setConn(next);
  };
  const disconnectAll = () => {
    const next = {};
    MERCHANTS.forEach((m) => { next[m.id] = false; });
    setConn(next);
  };

  return (
    <>
      <Section
        title="Доступ к мерчантам"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" onClick={connectAll}>Подключить всех</Btn>
            <Btn size="sm" variant="ghost" onClick={disconnectAll}>Отключить всех</Btn>
          </div>
        }
      >
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
          <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {visible.map((m) => {
            const isOn = !!conn[m.id];
            const isSuspended = m.status === "suspended";
            const success = m.today?.success ? Math.round(m.today.success * 100) : null;
            return (
              <div
                key={m.id}
                style={{
                  background: "#fff",
                  border: "1px solid " + (isOn ? "var(--line-2)" : "var(--line)"),
                  borderRadius: "var(--radius, 12px)",
                  padding: "16px 16px 14px",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  opacity: isSuspended ? 0.75 : 1,
                  boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.03))",
                }}
              >
                {isOn && (
                  <span style={{
                    content: "",
                    position: "absolute",
                    left: 0, top: 14, bottom: 14, width: 3,
                    borderRadius: "0 3px 3px 0",
                    background: "var(--accent)",
                  }} />
                )}

                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{m.id}</div>
                    <div style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 17,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.2,
                      marginTop: 2,
                      color: "var(--ink)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>{m.name}</div>
                  </div>
                  <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                    <StatusPill map={MERCHANT_STATUS} value={m.status} />
                  </div>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 0,
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "var(--paper, #fafaf6)",
                }}>
                  {[
                    { label: "Платежи",   val: fmtMoney(m.today?.payInRub || 0, "RUB"),  sub: (m.today?.payInCount || 0) + " ord" },
                    { label: "Выплаты",  val: fmtMoney(m.today?.payOutRub || 0, "RUB"), sub: (m.today?.payOutCount || 0) + " ord" },
                    { label: "Success", val: success !== null ? success + "%" : "—",  sub: "" },
                  ].map((s, i) => (
                    <div key={s.label} style={{
                      padding: "8px 10px",
                      borderLeft: i === 0 ? "none" : "1px solid var(--line)",
                    }}>
                      <div style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--ink-3)",
                      }}>{s.label}</div>
                      <div className="mono" style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "var(--ink)",
                        marginTop: 3,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>{s.val}</div>
                      {s.sub && (
                        <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 1 }}>{s.sub}</div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  paddingTop: 10,
                  borderTop: "1px solid var(--line)",
                }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    color: isOn ? "var(--ok)" : "var(--ink-3)",
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: 999,
                      background: isOn ? "var(--ok)" : "var(--ink-4)",
                      display: "inline-block",
                    }} />
                    {isOn ? "Подключён" : "Отключён"}
                  </span>
                  {isOn
                    ? <Btn size="sm" variant="danger" disabled={isSuspended} onClick={() => toggle(m.id)}>Отключить</Btn>
                    : <Btn size="sm" variant="ok"     disabled={isSuspended} onClick={() => toggle(m.id)}>Подключить</Btn>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          Подключено мерчантов: <strong style={{ color: "var(--fg)" }}>{counts.connected}</strong> из {counts.all}
        </div>
      </Section>
    </>
  );
}

// ─── Terminals (card grid) ──────────────────────────────────────────────────
function SectionTerminals({ onOpenAddTerminal }) {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [displayed, setDisplayed] = React.useState(filter);
  const [fading, setFading] = React.useState(false);
  React.useEffect(() => {
    if (filter === displayed) return;
    setFading(true);
    const t = setTimeout(() => { setDisplayed(filter); setFading(false); }, 180);
    return () => clearTimeout(t);
  }, [filter, displayed]);

  const filters = [
    { value: "all",     label: "Все",     count: TERMINALS.length },
    { value: "online",  label: "Online",  count: TERMINALS.filter((t) => t.status === "online").length },
    { value: "offline", label: "Offline", count: TERMINALS.filter((t) => t.status === "offline").length },
    { value: "blocked", label: "Заблок.", count: TERMINALS.filter((t) => t.status === "blocked").length },
  ];
  const visible = TERMINALS.filter((t) => displayed === "all" || t.status === displayed);
  const open = TERMINALS.find((t) => t.id === openId);

  return (
    <>
      <PageHead
        title="Terminals"
        sub="Android-устройства трейдеров. К каждому привязаны реквизиты."
      />
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
      </div>
      <div className={"term-grid" + (fading ? " is-fading" : "")} key={displayed}>
        {visible.map((t) => {
          const batteryTone = t.battery < 20 ? "bad" : t.battery < 40 ? "warn" : "ok";
          const isOffline = t.status === "offline";
          const isBlocked = t.status === "blocked";
          const pdCount = PAYMENT_DETAILS.filter((p) => p.terminal === t.id).length;
          return (
            <div
              key={t.id}
              className={"term-card" + (isOffline ? " term-card--offline" : isBlocked ? " term-card--blocked" : "") + (openId === t.id ? " is-selected" : "")}
              onClick={() => setOpenId(t.id)}
            >
              <div className="term-card__head">
                <div style={{ minWidth: 0 }}>
                  <div className="term-card__id">{t.id}</div>
                  <div className="term-card__name">{t.device}</div>
                  <div className="term-card__sim">{t.phone}</div>
                  <div className="term-card__owner">Trader · <b>{t.traderName}</b> <span className="mono" style={{ color: "var(--ink-4)" }}>{t.trader}</span></div>
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
                  <div className="term-card__stat-label">SMS сегодня</div>
                  <div className="term-card__stat-value">
                    {t.smsToday}
                    {t.errors > 0 && <span className="is-bad"> · {t.errors} err</span>}
                  </div>
                </div>
                <div className="term-card__stat">
                  <div className="term-card__stat-label">Реквизитов</div>
                  <div className="term-card__stat-value">{pdCount}</div>
                </div>
                <div className="term-card__stat">
                  <div className="term-card__stat-label">Heartbeat</div>
                  <div className={"term-card__stat-value" + (isOffline ? " is-bad" : "")}>{t.heartbeat}</div>
                </div>
              </div>

              <div className="term-card__foot">
                <svg className="term-card__foot-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 1.5" strokeLinecap="round" />
                </svg>
                <span className="mono">{t.heartbeat}</span>
                <span style={{ marginLeft: "auto" }} className={"term-card__note" + (isOffline ? " term-card__note--bad" : "")}>
                  {t.notes || (isOffline ? "Offline" : "—")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {open && (
        <Drawer
          title={open.device}
          id={open.id}
          status={open.status}
          statusMap={TERMINAL_STATUS}
          onClose={() => setOpenId(null)}
          wide
          footer={<>
            {open.status === "online" ? <Btn variant="danger">Close Terminal</Btn> : <Btn variant="ok">Reopen</Btn>}
            <span className="spacer" />
            <Btn variant="ghost">Add note</Btn>
            <Btn variant="primary">＋ Add Payment Details</Btn>
          </>}
        >
          <Section title="Terminal">
            <KV items={[
              ["Trader", <><strong>{open.traderName}</strong> <span className="mono muted">· {open.trader}</span></>],
              ["Device", open.device],
              ["Phone (SIM)", <span className="mono">{open.phone}</span>],
              ["App version", <span className="mono">{open.appVersion}</span>],
              ["Battery", <strong style={{ color: open.battery < 20 ? "var(--bad)" : open.battery < 40 ? "var(--warn)" : "var(--ok)" }}>{open.battery}%</strong>],
              ["Heartbeat", <span className="mono">{open.heartbeat}</span>],
              ["SMS today", <>{open.smsToday}{open.errors > 0 && <span style={{ color: "var(--bad)" }}> · {open.errors} err</span>}</>],
              ["Notes", open.notes || <span className="muted">—</span>],
            ]} />
          </Section>
          <Section title={`Привязанные реквизиты (${PAYMENT_DETAILS.filter((p) => p.terminal === open.id).length})`}>
            <table className="table table--inset">
              <thead><tr><th>ID</th><th>Метод</th><th>Банк</th><th>Реквизит</th><th>Статус</th></tr></thead>
              <tbody>
                {PAYMENT_DETAILS.filter((p) => p.terminal === open.id).map((pd) => (
                  <tr key={pd.id}>
                    <td className="mono">{pd.id}</td>
                    <td><span className={"pd-card__method pd-card__method--" + pd.method}>{METHOD_LABEL[pd.method] || pd.method}</span></td>
                    <td>{bankName(pd.bank)}</td>
                    <td className="mono">{pd.target}</td>
                    <td><StatusPill map={PD_STATUS} value={pd.status} /></td>
                  </tr>
                ))}
                {PAYMENT_DETAILS.filter((p) => p.terminal === open.id).length === 0 && (
                  <tr><td colSpan={5}><span className="muted">Реквизиты не привязаны</span></td></tr>
                )}
              </tbody>
            </table>
          </Section>
        </Drawer>
      )}
    </>
  );
}

// ── Payment-detail drawer body: Обзор + Платежи (как в приложении трейдера) ──
function AdminPdDrawerBody({ open }) {
  const [tab, setTab] = React.useState("overview");
  const [payId, setPayId] = React.useState(null);
  const [payFilter, setPayFilter] = React.useState("all");
  const [period, setPeriod] = React.useState("all");
  const payRow = payId ? PAY_IN.find((o) => o.id === payId) : null;
  const PayDrawer = window.PayInDrawerV2;

  const payCat = (st) => {
    if (["created", "matching", "waiting-payment", "manual-review"].includes(st)) return "inwork";
    if (["completed", "auto-confirmed"].includes(st)) return "ok";
    return "failed";
  };
  const pdPayments = PAY_IN.filter((o) => o.details === open.id);

  const PERIOD_CHIPS = [
    { value: "hour",      label: "Час" },
    { value: "today",     label: "Сегодня" },
    { value: "yesterday", label: "Вчера" },
    { value: "month",     label: "Месяц" },
    { value: "all",       label: "Всё" },
  ];
  const toMin = (ts) => {
    const x = /(\d{2}):(\d{2})/.exec(ts || "");
    return x ? (+x[1]) * 60 + (+x[2]) : 0;
  };
  const latestPay = pdPayments.reduce((mx, o) => Math.max(mx, toMin(o.date)), 0);
  const inPeriod = (o) => {
    if (period === "yesterday") return false;
    if (period === "hour") return toMin(o.date) >= latestPay - 60;
    return true;
  };
  const timePayments = pdPayments.filter(inPeriod);

  const statusFilters = [
    { value: "inwork", label: "В работе",     count: timePayments.filter((o) => payCat(o.status) === "inwork").length },
    { value: "ok",     label: "Успешные",     count: timePayments.filter((o) => payCat(o.status) === "ok").length },
    { value: "failed", label: "Не выполнены", count: timePayments.filter((o) => payCat(o.status) === "failed").length },
    { value: "all",    label: "Все",          count: timePayments.length },
  ];
  const pdPaymentsShown = timePayments.filter((o) => payFilter === "all" || payCat(o.status) === payFilter);

  return (
    <>
      <Tabs
        tabs={[
          { id: "overview", label: "Обзор" },
          { id: "payments", label: `Платежи (${pdPayments.length})` },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "overview" && <>
        {open.blockReason && <Note tone="bad">{open.blockReason}</Note>}
        <Section title="Реквизит">
          <KV items={[
            ["Метод", <span className={"pd-card__method pd-card__method--" + open.method}>{METHOD_LABEL[open.method] || open.method}</span>],
            ["Банк", <strong>{bankName(open.bank)}</strong>],
            ["Держатель", open.holder],
            ["Цель / номер", <span className="mono"><strong>{open.target}</strong></span>],
            ["Trader", <><strong>{traderName(open.trader)}</strong> <span className="mono muted">· {open.trader}</span></>],
            ["Terminal", <span className="mono">{open.terminal}</span>],
          ]} />
          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, userSelect: "none", opacity: 0.85 }} title="Редактируется при редактировании реквизита">
            <input type="checkbox" checked={!!open.vip} disabled readOnly style={{ width: 18, height: 18, accentColor: "var(--accent)", cursor: "not-allowed", flexShrink: 0 }} />
            <span>
              <span style={{ fontWeight: 600 }}>VIP-реквизит</span>
              <span className="muted" style={{ display: "block", fontSize: 12.5 }}>Используется только для платежей VIP-клиентов · редактируется в карточке реквизита</span>
            </span>
          </label>
        </Section>
        <Section title="Лимиты и использование">
          <div className="row-2">
            <div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Daily — {fmtMoney(open.dailyLimit)}</div>
              <UsageBar value={open.dailyUsed} large />
              <div className="mono muted" style={{ fontSize: 11.5, marginTop: 4 }}>{fmtMoney(open.todayRub)} использовано</div>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Monthly — {fmtMoney(open.monthlyLimit)}</div>
              <UsageBar value={open.monthlyUsed} large />
              <div className="mono muted" style={{ fontSize: 11.5, marginTop: 4 }}>{fmtMoney(open.monthRub)} использовано</div>
            </div>
          </div>
        </Section>
        <Section title="Производительность">
          <KV items={[
            ["Опер. сегодня",  <>{open.opsToday} / {open.opsLimit}</>],
            ["Success rate",   <strong>{Math.round(open.success * 100)}%</strong>],
            ["Open disputes",  open.disputes || "—"],
            ["Объём сегодня",  fmtMoney(open.todayRub)],
            ["Объём за месяц", fmtMoney(open.monthRub)],
          ]} />
        </Section>
      </>}

      {tab === "payments" && <>
        <div className="pd-pay-filters" style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 8, marginBottom: 14 }}>
          <ChipSelect value={payFilter} onChange={setPayFilter} options={statusFilters} align="left" />
          <ChipSelect value={period} onChange={setPeriod} options={PERIOD_CHIPS} align="left" />
        </div>
        <Section title="Платежи по реквизиту">
          {pdPayments.length === 0 ? <Empty>Платежей нет</Empty> :
            pdPaymentsShown.length === 0 ? <Empty>Нет платежей по фильтру</Empty> :
            <table className="table table--inset">
              <thead><tr><th>Статус</th><th className="num">Сумма</th><th>Мерчант</th><th>Создана</th></tr></thead>
              <tbody>
                {pdPaymentsShown.map((o) =>
                  <tr key={o.id} onClick={() => PayDrawer && setPayId(o.id)} style={{ cursor: PayDrawer ? "pointer" : "default" }}>
                    <td><PayInStatusCell order={o} /></td>
                    <td className="num">{fmtMoney(o.amount, "RUB")}</td>
                    <td>{o.merchantName || o.merchant || <span className="muted">—</span>}</td>
                    <td className="mono">{o.date}</td>
                  </tr>
                )}
              </tbody>
            </table>
          }
        </Section>
      </>}

      {payRow && PayDrawer && (
        <div style={{ position: "relative", zIndex: 40 }}>
          <PayDrawer order={payRow} onClose={() => setPayId(null)} />
        </div>
      )}
    </>
  );
}

// ─── Payment Details (card grid) ────────────────────────────────────────────
function SectionPaymentDetails() {
  const [filter, setFilter] = React.useState("all");
  const [vipFilter, setVipFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [displayed, setDisplayed] = React.useState(filter);
  const [fading, setFading] = React.useState(false);
  React.useEffect(() => {
    if (filter === displayed) return;
    setFading(true);
    const t = setTimeout(() => { setDisplayed(filter); setFading(false); }, 180);
    return () => clearTimeout(t);
  }, [filter, displayed]);

  const OFFLINE_STATUSES = ["limit-exceeded", "terminal-offline", "blocked", "cooldown", "trader-off", "admin-off", "frozen"];
  // Реквизиты, привязанные к VIP-клиенту (из карты VIPS → traders[].details)
  const VIP_PD_IDS = React.useMemo(() => {
    const s = new Set();
    (VIPS || []).forEach((v) => (v.traders || []).forEach((t) => t.details && s.add(t.details)));
    return s;
  }, []);
  const filters = [
    { value: "all",     label: "Все",     count: PAYMENT_DETAILS.length },
    { value: "active",  label: "Active",  count: PAYMENT_DETAILS.filter((p) => p.status === "active").length },
    { value: "offline", label: "Offline", count: PAYMENT_DETAILS.filter((p) => OFFLINE_STATUSES.includes(p.status)).length },
    { value: "blocked", label: "Blocked", count: PAYMENT_DETAILS.filter((p) => p.status === "blocked").length },
  ];
  const VIP_OPTIONS = [
    { value: "all",     label: "Все реквизиты" },
    { value: "vip",     label: "Только VIP" },
    { value: "not-vip", label: "Не VIP" },
  ];
  const visible = PAYMENT_DETAILS.filter((p) => {
    const statusOk = displayed === "all" ? true : displayed === "offline" ? OFFLINE_STATUSES.includes(p.status) : p.status === displayed;
    const vipOk = vipFilter === "all" ? true : vipFilter === "vip" ? VIP_PD_IDS.has(p.id) : !VIP_PD_IDS.has(p.id);
    return statusOk && vipOk;
  });
  const open = PAYMENT_DETAILS.find((p) => p.id === openId);

  return (
    <>
      <PageHead
        title="Payment Details"
        sub="Реквизиты для Платежи — карта или СБП, привязанная к терминалу трейдера."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
        <ChipSelect value={vipFilter} onChange={setVipFilter} options={VIP_OPTIONS} align="left" />
      </div>

      <div className={"pd-grid" + (fading ? " is-fading" : "")} key={displayed}>
        {visible.map((p) => {
          const usage = p.dailyUsed;
          const tone = usage >= 0.9 ? "bad" : usage >= 0.7 ? "warn" : "ok";
          const opsTone = p.opsToday / p.opsLimit >= 0.9 ? "bad" : p.opsToday / p.opsLimit >= 0.7 ? "warn" : "";
          const accent =
            p.status === "limit-exceeded" ? " pd-card--limit" :
            p.status === "blocked" ? " pd-card--blocked" :
            p.status === "frozen" ? " pd-card--frozen" :
            p.status === "terminal-offline" ? " pd-card--offline" : "";
          return (
            <div
              key={p.id}
              className={"pd-card" + accent + (openId === p.id ? " is-selected" : "")}
              onClick={() => setOpenId(p.id)}
            >
              <div className="pd-card__head">
                <div style={{ minWidth: 0 }}>
                  <div className="pd-card__id">{p.id}</div>
                  <div className="pd-card__target">{p.target}</div>
                  <div className="pd-card__sub">
                    <span>{bankName(p.bank)}</span>
                    <span className="pd-card__sub-sep" />
                    <span>{p.holder}</span>
                  </div>
                </div>
                <div className="pd-card__head-r">
                  <div className="pd-card__methods">
                    {VIP_PD_IDS.has(p.id) && (
                      <span className="pd-card__method pd-card__method--vip" title="Привязан к VIP-клиенту">★ VIP</span>
                    )}
                    <span className={"pd-card__method pd-card__method--" + p.method}>
                      {METHOD_LABEL[p.method] || p.method}
                    </span>
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
                  {fmtMoney(p.todayRub, "RUB")} / {fmtMoney(p.dailyLimit, "RUB")}
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
                <span className="pd-card__owner">Trader · <b>{traderName(p.trader)}</b></span>
                <span style={{ marginLeft: "auto" }} className="mono">{p.terminal}</span>
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <Drawer
          title="Payment Details"
          id={open.id}
          status={open.status}
          statusMap={PD_STATUS}
          onClose={() => setOpenId(null)}
          wide
          footer={<>
            {open.status === "active" && <><Btn variant="ghost">Freeze</Btn><Btn variant="ghost">Deactivate</Btn><Btn variant="danger">Write off</Btn></>}
            {open.status === "frozen" && <Btn variant="ok">Unfreeze</Btn>}
            {open.status === "limit-exceeded" && <Btn variant="ok">Сбросить лимит</Btn>}
            {open.status === "blocked" && <Btn variant="ok">Разблокировать</Btn>}
            <span className="spacer" />
            <Btn variant="primary">Edit limits</Btn>
          </>}
        >
          <AdminPdDrawerBody open={open} />
        </Drawer>
      )}
    </>
  );
}

function UsageBar({ value, large }) {
  const pct = Math.round(value * 100);
  const tone = pct > 85 ? "bad" : pct > 65 ? "warn" : "ok";
  return (
    <span className={"usage usage--" + tone + (large ? " usage--lg" : "")}>
      <span className="usage__bar"><span style={{ width: pct + "%" }} /></span>
      <span className="usage__num">{pct}%</span>
    </span>
  );
}

// ─── Deposits (заявки трейдеров на пополнение) ───────────────────────────
function SectionDeposits({ initOpenId }) {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  React.useEffect(() => { if (initOpenId) setOpenId(initOpenId); }, [initOpenId]);
  const filters = [
    { value: "all",       label: "Все",          count: DEPOSIT_REQUESTS.length },
    { value: "in-progress", label: "В работе",    count: DEPOSIT_REQUESTS.filter((d) => d.status === "pending" || d.status === "reviewing").length },
    { value: "confirmed", label: "Подтверждены", count: DEPOSIT_REQUESTS.filter((d) => d.status === "confirmed").length },
    { value: "rejected",  label: "Отклонены",    count: DEPOSIT_REQUESTS.filter((d) => d.status === "rejected" || d.status === "expired").length },
  ];
  const visible = DEPOSIT_REQUESTS.filter((d) =>
    filter === "all" ||
    (filter === "in-progress" ? (d.status === "pending" || d.status === "reviewing") :
     filter === "rejected" ? (d.status === "rejected" || d.status === "expired") :
     d.status === filter)
  );
  const open = DEPOSIT_REQUESTS.find((d) => d.id === openId);

  const fmtTx = (h) => h ? (h.slice(0, 6) + "…" + h.slice(-6)) : "—";

  return (
    <>
      <PageHead
        title="Депозиты"
        sub="Заявки трейдеров на пополнение счёта (USDT TRC-20). Большинство зачисляется автоматически — здесь только то, что требует ручной проверки."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
        <Btn variant="primary" size="sm" style={{ borderRadius: 999, padding: "6px 14px", fontSize: 13, marginLeft: "auto" }} onClick={() => setShowAdd(true)}>＋ Добавить депозит</Btn>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Статус</th>
              <th className="num">Сумма</th>
              <th>Trader</th>
              <th>ID · создано</th>
              <th>Счёт</th>
              <th>TX</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((d) => {
              const tr = TRADERS.find((t) => t.id === d.trader);
              const inWork = d.status === "pending" || d.status === "reviewing";
              return (
                <tr key={d.id} className={openId === d.id ? "is-selected" : ""} onClick={() => setOpenId(d.id)}>
                  <td><StatusPill map={DEPOSIT_REQUEST_STATUS} value={d.status} /></td>
                  <td className="num"><strong>{d.amount.toFixed(2)}</strong> <span className="muted">USDT</span></td>
                  <td>
                    <div className="cell-stack">
                      <strong>{traderName(d.trader)}</strong>
                      <span className="muted">{tr?.team || "—"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="mono">{d.id}</div>
                    <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{d.ts}</div>
                  </td>
                  <td>{d.account === "working" ? "Рабочий" : "Страховой"}</td>
                  <td className="mono muted" style={{ fontSize: 12 }}>
                    {d.txHash ? (
                      <span className="mono-copy">
                        <span className="mono" style={{ fontSize: 12 }}>{fmtTx(d.txHash)}</span>
                        <CopyBtn value={d.txHash} />
                      </span>
                    ) : "—"}
                  </td>
                  <td className="num" onClick={(e) => e.stopPropagation()}>
                    {inWork && (
                      <Btn variant="ok" size="sm" disabled={d.confirmations < d.requiredConfirmations}>
                        Подтвердить
                      </Btn>
                    )}
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr><td colSpan={7}><Empty>Нет заявок в этой категории</Empty></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Drawer
          title="Заявка на депозит"
          id={open.id}
          status={open.status}
          statusMap={DEPOSIT_REQUEST_STATUS}
          onClose={() => setOpenId(null)}
          wide
          extraTags={<span className="dispute-sla mono">{open.network}</span>}
          footer={(open.status === "pending" || open.status === "reviewing") ? (
            <>
              <Btn variant="danger">Отклонить</Btn>
              <span className="spacer" />
              <Btn variant="ok" disabled={open.confirmations < open.requiredConfirmations}>
                Подтвердить и зачислить
              </Btn>
            </>
          ) : (
            <><span className="spacer" /><Btn variant="ghost">Закрыть</Btn></>
          )}
        >
          <Section title="Заявка">
            <KV items={[
              ["Trader", <><strong>{traderName(open.trader)}</strong> <span className="mono muted">· {open.trader}</span></>],
              ["Счёт зачисления", open.account === "working" ? "Рабочий баланс" : "Страховой депозит"],
              ["Сумма", <strong className="mono">{open.amount.toFixed(2)} USDT</strong>],
              ["Сеть", <span className="mono">{open.network}</span>],
              ["Создана", <span className="mono">{open.ts}</span>],
              ...(open.confirmedAt ? [["Подтверждена", <><span className="mono">{open.confirmedAt}</span> <span className="muted">· {open.confirmedBy}</span></>]] : []),
              ...(open.rejectedAt ? [["Обработана", <><span className="mono">{open.rejectedAt}</span> <span className="muted">· {open.rejectedBy}</span></>]] : []),
              ...(open.assignedTo ? [["Назначено", <span className="mono">{open.assignedTo}</span>]] : []),
            ]} />
          </Section>

          <Section title="Транзакция">
            <KV items={[
              ["Адрес зачисления", <MonoCopy value={open.wallet} />],
              ["Адрес отправителя", <MonoCopy value={open.fromAddress} />],
              ["TX hash", open.txHash
                ? <MonoCopy value={open.txHash} />
                : <span className="muted">не получен</span>],
            ]} />
          </Section>

          {(open.status === "pending" || open.status === "reviewing") && open.reason && (
            <Note tone="warn"><strong>Причина ручной проверки.</strong> {open.reason}</Note>
          )}
          {(open.status === "rejected" || open.status === "expired") && open.rejectionReason && (
            <Note tone="bad"><strong>Заявка не зачислена.</strong> {open.rejectionReason}</Note>
          )}
          {open.status === "confirmed" && (
            <Note tone="ok">Средства зачислены на {open.account === "working" ? "рабочий" : "страховой"} счёт трейдера.</Note>
          )}

          <Section title="Timeline">
            <Timeline items={[
              { time: open.ts, text: "Заявка создана трейдером" },
              ...(open.txHash ? [{ time: open.ts, text: "TX обнаружен в сети " + open.network }] : []),
              ...(open.assignedTo ? [{ time: open.ts, text: "Взято на проверку: " + open.assignedTo, muted: true }] : []),
              ...(open.confirmedAt ? [{ time: open.confirmedAt, text: "Подтверждено и зачислено — " + open.confirmedBy }] : []),
              ...(open.rejectedAt ? [{ time: open.rejectedAt, text: "Отклонено — " + open.rejectedBy }] : []),
            ]} />
          </Section>
        </Drawer>
      )}

      {showAdd && <AddDepositModal onClose={() => setShowAdd(false)} />}
    </>
  );
}

function AddDepositModal({ onClose }) {
  const [trader, setTrader] = React.useState(TRADERS[0]?.id || "");
  const [account, setAccount] = React.useState("working");
  const [amount, setAmount] = React.useState("");
  const [txHash, setTxHash] = React.useState("");
  const traderOptions = TRADERS.map((t) => ({ value: t.id, label: t.name + " · " + t.id }));
  const amountValid = parseFloat(amount) > 0;
  return (
    <Modal
      title="Добавить депозит вручную"
      onClose={onClose}
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <span className="spacer" />
        <Btn variant="primary" onClick={onClose} disabled={!amountValid}>Зачислить</Btn>
      </>}
    >
      <Note tone="info">
        Ручной депозит создаёт запись в ledger со статусом «confirmed» и моментально пополняет баланс трейдера. Используется для корректировок и off-chain зачислений.
      </Note>
      <Field label="Trader">
        <Select value={trader} onChange={setTrader} options={traderOptions} />
      </Field>
      <div className="row-2">
        <Field label="Счёт">
          <Select value={account} onChange={setAccount} options={[
            { value: "working",   label: "Рабочий баланс" },
            { value: "insurance", label: "Страховой депозит" },
          ]} />
        </Field>
        <Field label="Сумма (USDT)" hint="Эквивалент TRC-20">
          <TextInput value={amount} onChange={setAmount} placeholder="500.00" />
        </Field>
      </div>
      <Field label="TX hash" hint="Опционально — если зачисление имеет on-chain пруф">
        <TextInput value={txHash} onChange={setTxHash} placeholder="0x… или TRC-20 hash" />
      </Field>
    </Modal>
  );
}

// ─── Withdrawals (заявки трейдеров на вывод USDT) ─────────────────────────
function SectionWithdrawals({ initOpenId }) {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  React.useEffect(() => { if (initOpenId) setOpenId(initOpenId); }, [initOpenId]);
  const filters = [
    { value: "all",         label: "Все",          count: WITHDRAW_REQUESTS.length },
    { value: "in-progress", label: "В работе",     count: WITHDRAW_REQUESTS.filter((d) => d.status === "pending" || d.status === "reviewing").length },
    { value: "confirmed",   label: "Подтверждены", count: WITHDRAW_REQUESTS.filter((d) => d.status === "confirmed").length },
    { value: "rejected",    label: "Отклонены",    count: WITHDRAW_REQUESTS.filter((d) => d.status === "rejected" || d.status === "expired").length },
  ];
  const visible = WITHDRAW_REQUESTS.filter((d) =>
    filter === "all" ||
    (filter === "in-progress" ? (d.status === "pending" || d.status === "reviewing") :
     filter === "rejected" ? (d.status === "rejected" || d.status === "expired") :
     d.status === filter)
  );
  const open = WITHDRAW_REQUESTS.find((d) => d.id === openId);

  const fmtTx = (h) => h ? (h.slice(0, 6) + "…" + h.slice(-6)) : "—";

  return (
    <>
      <PageHead
        title="Выводы"
        sub="Заявки трейдеров на вывод USDT (TRC-20) на внешний кошелёк. В таблице — то, что требует ручной проверки."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
        <Btn variant="primary" size="sm" style={{ borderRadius: 999, padding: "6px 14px", fontSize: 13, marginLeft: "auto" }} onClick={() => setShowAdd(true)}>＋ Добавить вывод</Btn>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Статус</th>
              <th className="num">Сумма</th>
              <th>Trader</th>
              <th>ID · создано</th>
              <th>Счёт</th>
              <th>TX</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((d) => {
              const tr = TRADERS.find((t) => t.id === d.trader);
              const inWork = d.status === "pending" || d.status === "reviewing";
              return (
                <tr key={d.id} className={openId === d.id ? "is-selected" : ""} onClick={() => setOpenId(d.id)}>
                  <td><StatusPill map={DEPOSIT_REQUEST_STATUS} value={d.status} /></td>
                  <td className="num"><strong style={{ color: "var(--bad)" }}>−{d.amount.toFixed(2)}</strong> <span className="muted">USDT</span></td>
                  <td>
                    <div className="cell-stack">
                      <strong>{traderName(d.trader)}</strong>
                      <span className="muted">{tr?.team || "—"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="mono">{d.id}</div>
                    <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{d.ts}</div>
                  </td>
                  <td>{d.account === "working" ? "Рабочий" : "Страховой"}</td>
                  <td className="mono muted" style={{ fontSize: 12 }}>
                    {d.txHash ? (
                      <span className="mono-copy">
                        <span className="mono" style={{ fontSize: 12 }}>{fmtTx(d.txHash)}</span>
                        <CopyBtn value={d.txHash} />
                      </span>
                    ) : "—"}
                  </td>
                  <td className="num" onClick={(e) => e.stopPropagation()}>
                    {inWork && (
                      <Btn variant="ok" size="sm">Подтвердить</Btn>
                    )}
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr><td colSpan={7}><Empty>Нет заявок в этой категории</Empty></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Drawer
          title="Заявка на вывод"
          id={open.id}
          status={open.status}
          statusMap={DEPOSIT_REQUEST_STATUS}
          onClose={() => setOpenId(null)}
          wide
          extraTags={<>
            <span className="dispute-sla mono">{open.network}</span>
            {open.txHash ? (
              <span className="dispute-sla mono" title={open.txHash} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                TX {fmtTx(open.txHash)}
                <CopyBtn value={open.txHash} />
              </span>
            ) : (
              <span className="dispute-sla mono muted">TX —</span>
            )}
          </>}
          footer={(open.status === "pending" || open.status === "reviewing") ? (
            <>
              <Btn variant="danger">Отклонить</Btn>
              <span className="spacer" />
              <Btn variant="ok">Подтвердить и выплатить</Btn>
            </>
          ) : (
            <><span className="spacer" /><Btn variant="ghost">Закрыть</Btn></>
          )}
        >
          <Section title="Заявка">
            <KV items={[
              ["Trader", <><strong>{traderName(open.trader)}</strong> <span className="mono muted">· {open.trader}</span></>],
              ["Счёт списания", open.account === "working" ? "Рабочий баланс" : "Страховой депозит"],
              ["Сумма", <strong className="mono">−{open.amount.toFixed(2)} USDT</strong>],
              ["Сеть", <span className="mono">{open.network}</span>],
              ["Создана", <span className="mono">{open.ts}</span>],
              ...(open.confirmedAt ? [["Подтверждена", <><span className="mono">{open.confirmedAt}</span> <span className="muted">· {open.confirmedBy}</span></>]] : []),
              ...(open.rejectedAt ? [["Обработана", <><span className="mono">{open.rejectedAt}</span> <span className="muted">· {open.rejectedBy}</span></>]] : []),
              ...(open.assignedTo ? [["Назначено", <span className="mono">{open.assignedTo}</span>]] : []),
            ]} />
          </Section>

          <Section title="Транзакция">
            <KV items={[
              ["Адрес получателя", <MonoCopy value={open.wallet} />],
              ["TX hash", open.txHash
                ? <MonoCopy value={open.txHash} />
                : <span className="muted">не отправлен</span>],
            ]} />
          </Section>

          {(open.status === "pending" || open.status === "reviewing") && open.reason && (
            <Note tone="warn"><strong>Причина ручной проверки.</strong> {open.reason}</Note>
          )}
          {(open.status === "rejected" || open.status === "expired") && open.rejectionReason && (
            <Note tone="bad"><strong>Вывод не выполнен.</strong> {open.rejectionReason}</Note>
          )}
          {open.status === "confirmed" && (
            <Note tone="ok">Средства отправлены трейдеру со {open.account === "working" ? "рабочего" : "страхового"} счёта.</Note>
          )}

          <Section title="Timeline">
            <Timeline items={[
              { time: open.ts, text: "Заявка на вывод создана трейдером" },
              ...(open.assignedTo ? [{ time: open.ts, text: "Взято на проверку: " + open.assignedTo, muted: true }] : []),
              ...(open.confirmedAt ? [{ time: open.confirmedAt, text: "Выплачено — " + open.confirmedBy }] : []),
              ...(open.txHash && open.confirmedAt ? [{ time: open.confirmedAt, text: "TX отправлен в сети " + open.network }] : []),
              ...(open.rejectedAt ? [{ time: open.rejectedAt, text: "Отклонено — " + open.rejectedBy }] : []),
            ]} />
          </Section>
        </Drawer>
      )}

      {showAdd && <AddWithdrawModal onClose={() => setShowAdd(false)} />}
    </>
  );
}

function AddWithdrawModal({ onClose }) {
  const [trader, setTrader] = React.useState(TRADERS[0]?.id || "");
  const [account, setAccount] = React.useState("working");
  const [amount, setAmount] = React.useState("");
  const [wallet, setWallet] = React.useState("");
  const traderOptions = TRADERS.map((t) => ({ value: t.id, label: t.name + " · " + t.id }));
  const amountValid = parseFloat(amount) > 0;
  return (
    <Modal
      title="Создать вывод вручную"
      onClose={onClose}
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <span className="spacer" />
        <Btn variant="primary" onClick={onClose} disabled={!amountValid || !wallet}>Создать заявку</Btn>
      </>}
    >
      <Note tone="info">
        Ручной вывод создаёт заявку от имени трейдера. После создания она появляется в очереди и требует подтверждения админом.
      </Note>
      <Field label="Trader">
        <Select value={trader} onChange={setTrader} options={traderOptions} />
      </Field>
      <div className="row-2">
        <Field label="Счёт списания">
          <Select value={account} onChange={setAccount} options={[
            { value: "working",   label: "Рабочий баланс" },
            { value: "insurance", label: "Страховой депозит" },
          ]} />
        </Field>
        <Field label="Сумма (USDT)">
          <TextInput value={amount} onChange={setAmount} placeholder="500.00" />
        </Field>
      </div>
      <Field label="Адрес получателя (TRC-20)" hint="Кошелёк трейдера, на который пойдёт вывод">
        <TextInput value={wallet} onChange={setWallet} placeholder="T…" />
      </Field>
    </Modal>
  );
}


// ─── Disputes ───────────────────────────────────────────────────────────────
function SectionDisputes() {
  const [filter, setFilter] = React.useState("all");
  const [teamFilter, setTeamFilter] = React.useState("all");
  const [traderFilter, setTraderFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const filters = [
    { value: "all", label: "Все", count: DISPUTES.length },
    { value: "open", label: "Open", count: DISPUTES.filter((d) => d.status === "open").length },
    { value: "resolved", label: "Resolved", count: DISPUTES.filter((d) => d.status === "resolved").length },
  ];
  const teamOf = (id) => { const t = TRADERS.find((x) => x.id === id); return t ? (t.team || "") : ""; };
  const teamOptions = React.useMemo(() => {
    const set = new Set();
    DISPUTES.forEach((d) => { const tm = teamOf(d.trader); if (tm) set.add(tm); });
    return [{ value: "all", label: "Все команды" }, ...Array.from(set).map((t) => ({ value: t, label: t }))];
  }, []);
  const traderOptions = React.useMemo(() => {
    const seen = new Map();
    DISPUTES.forEach((d) => { if (!seen.has(d.trader)) seen.set(d.trader, d.traderName || traderName(d.trader)); });
    return [{ value: "all", label: "Все трейдеры" }, ...Array.from(seen, ([id, name]) => ({ value: id, label: name }))];
  }, []);
  const visible = DISPUTES.filter((d) =>
    (filter === "all" || d.status === filter) &&
    (teamFilter === "all" || teamOf(d.trader) === teamFilter) &&
    (traderFilter === "all" || d.trader === traderFilter)
  );
  const open = DISPUTES.find((d) => d.id === openId);
  return (
    <>
      <PageHead
        title="Disputes"
        sub="Споры по Платежи или Выплаты. Внутри — чат между админом и трейдером, доказательства, решение."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
        <ChipSelect value={teamFilter} onChange={setTeamFilter} options={teamOptions} placeholder="Команда" align="left" />
        <ChipSelect value={traderFilter} onChange={setTraderFilter} options={traderOptions} placeholder="Трейдер" align="left" />
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Статус</th>
              <th className="num">Сумма</th>
              <th>Открыт</th>
              <th>Тип</th>
              <th>Трейдер</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((d) => (
              <tr key={d.id} className={openId === d.id ? "is-selected" : ""} onClick={() => setOpenId(d.id)}>
                <td><StatusPill map={DISPUTE_STATUS} value={d.status} /></td>
                <td className="num">{fmtMoney(d.amount)}</td>
                <td className="mono muted" style={{ fontSize: 12.5 }}>{d.opened || "—"}</td>
                <td><span className="badge-type">{d.orderType || d.type}</span></td>
                <td>
                  <div className="cell-stack">
                    <strong>{d.traderName || traderName(d.trader)}</strong>
                    <span className="muted">{teamOf(d.trader) || "—"}</span>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={5}><Empty>Споров по выбранным фильтрам нет</Empty></td></tr>
            )}
          </tbody>
        </table>
      </div>
      {open && <DisputeDrawer dispute={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function DisputeDrawer({ dispute, onClose }) {
  const teamOf = (id) => { const t = TRADERS.find((x) => x.id === id); return t ? (t.team || "") : ""; };
  const seedChat = (dispute.chat && dispute.chat.length)
    ? dispute.chat
    : [
        { from: "support", ts: dispute.opened || "—", text: "Открыт спор. " + (dispute.reason || "Требуется разбор.") },
        { from: "trader",  ts: dispute.opened || "—", text: "Принял. Загружаю чек и переписку с клиентом." },
        { from: "trader",  ts: dispute.opened || "—", attach: "receipt_" + (dispute.order || dispute.id) + ".jpg" },
      ];
  const [chat, setChat] = React.useState(seedChat);
  const [draft, setDraft] = React.useState("");
  const isResolved = /resolved/.test(dispute.status);
  const canSend = !isResolved;
  const send = () => {
    if (!draft.trim()) return;
    setChat([...chat, { from: "support", ts: "сейчас", text: draft.trim() }]);
    setDraft("");
  };
  const attach = () => setChat([...chat, { from: "support", ts: "сейчас", attach: "support_note_" + dispute.id + ".pdf" }]);
  const [orderOpen, setOrderOpen] = React.useState(false);
  const [traderOpen, setTraderOpen] = React.useState(false);
  const [merchantOpen, setMerchantOpen] = React.useState(false);
  const piOrder = (typeof PAY_IN !== "undefined") ? PAY_IN.find((o) => o.id === dispute.order) : null;
  const poOrder = (typeof PAY_OUT !== "undefined") ? PAY_OUT.find((o) => o.id === dispute.order) : null;
  const traderObj = (typeof TRADERS !== "undefined") ? TRADERS.find((t) => t.id === dispute.trader) : null;
  const merchantObj = (typeof MERCHANTS !== "undefined") ? MERCHANTS.find((m) => m.id === dispute.merchant) : null;
  const MerchantDrawerC = window.MerchantDrawer;
  const linkStyle = { color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" };
  return (
    <>
    <Drawer
      title="Спор"
      status={dispute.status}
      statusMap={DISPUTE_STATUS}
      onClose={onClose}
      wide
      footer={isResolved ? (
        <span className="muted" style={{ fontSize: 12 }}>Спор закрыт{dispute.reason ? " · " + dispute.reason : ""}</span>
      ) : (
        <>
          <Btn variant="ghost">Запросить чек</Btn>
          <span className="spacer" />
          <Btn variant="danger">В пользу мерчанта</Btn>
          <Btn variant="ok">В пользу трейдера</Btn>
        </>
      )}
    >
      <Section title="Сводка">
        <KV items={[
          ["Ордер", (
            <a
              href={"#" + (dispute.order || "")}
              onClick={(e) => { e.preventDefault(); setOrderOpen(true); }}
              className="mono"
              style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}
            >
              {(dispute.order || "—")} · {dispute.orderType || dispute.type}
            </a>
          )],
          ["Сумма", <strong>{fmtMoney(dispute.amount)}</strong>],
          ["Открыт", <span className="mono">{dispute.opened || "—"}</span>],
          ["Трейдер", (
            <>
              <a href="#trader" onClick={(e) => { e.preventDefault(); setTraderOpen(true); }} style={linkStyle}>
                {dispute.traderName || traderName(dispute.trader)}
              </a> <span className="mono muted">· {teamOf(dispute.trader) || "—"}</span>
            </>
          )],
          ["Мерчант", (
            <a href="#merchant" onClick={(e) => { e.preventDefault(); setMerchantOpen(true); }} style={linkStyle}>
              {dispute.merchantName || dispute.merchant || "—"}
            </a>
          )],
          ["Клиент", dispute.customer || "—"],
          ["Причина", dispute.reason || "—"],
          ["ID", <MonoCopy value={dispute.id} />],
        ]} />
      </Section>

      <Section title="Переписка">
        <div className="chat">
          {chat.map((m, i) => {
            const role = m.from === "trader" ? "trader" : m.from === "merchant" ? "client" : "admin";
            const author = m.from === "trader"
              ? (dispute.traderName || traderName(dispute.trader))
              : m.from === "merchant" ? (dispute.merchantName || dispute.merchant || "Мерчант")
              : "Саппорт (вы)";
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
            placeholder={canSend ? "Написать сообщение трейдеру…" : "Спор закрыт — отправка недоступна"}
            value={draft}
            disabled={!canSend}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          />
          <Btn variant="primary" size="sm" onClick={send} disabled={!canSend || !draft.trim()}>Отправить</Btn>
        </div>
      </Section>
    </Drawer>

    {orderOpen && piOrder && (
      <PayInDrawerV2 order={piOrder} onClose={() => setOrderOpen(false)} />
    )}
    {orderOpen && !piOrder && (
      <DisputeOrderDrawer dispute={dispute} order={poOrder} onClose={() => setOrderOpen(false)} />
    )}
    {traderOpen && (
      <TraderQuickDrawer trader={traderObj} fallbackName={dispute.traderName || traderName(dispute.trader)} fallbackId={dispute.trader} onClose={() => setTraderOpen(false)} />
    )}
    {merchantOpen && merchantObj && MerchantDrawerC && (
      <MerchantDrawerC merchant={merchantObj} onClose={() => setMerchantOpen(false)} />
    )}
    {merchantOpen && !(merchantObj && MerchantDrawerC) && (
      <Drawer title="Мерчант" id={dispute.merchant} onClose={() => setMerchantOpen(false)} wide>
        <Section title="Сводка">
          <KV items={[
            ["Название", <strong>{dispute.merchantName || "—"}</strong>],
            ["Merchant ID", <MonoCopy value={dispute.merchant || "—"} />],
          ]} />
        </Section>
      </Drawer>
    )}
    </>
  );
}

// ─── Compact trader view opened from a dispute ──────────────────────────────
function TraderQuickDrawer({ trader, fallbackName, fallbackId, onClose }) {
  if (!trader) {
    return (
      <Drawer title={fallbackName} id={fallbackId} onClose={onClose} wide>
        <Section title="Контакт">
          <KV items={[
            ["Имя", <strong>{fallbackName}</strong>],
            ["Trader ID", <MonoCopy value={fallbackId} />],
          ]} />
        </Section>
      </Drawer>
    );
  }
  return (
    <Drawer
      title={trader.name}
      id={trader.id}
      status={trader.status}
      statusMap={TRADER_STATUS}
      onClose={onClose}
      wide
    >
      <TraderOverviewTab trader={trader} />
    </Drawer>
  );
}

// ─── Compact order view opened from a dispute (Выплаты / fallback) ──────────
function DisputeOrderDrawer({ dispute, order, onClose }) {
  const isPayout = (dispute.orderType || dispute.type) === "Выплаты";
  const amount = order ? order.amount : dispute.amount;
  const statusMap = isPayout ? (typeof PAY_OUT_STATUS !== "undefined" ? PAY_OUT_STATUS : undefined)
                             : (typeof PAY_IN_STATUS !== "undefined" ? PAY_IN_STATUS : undefined);
  return (
    <Drawer
      title={isPayout ? "Выплаты Order" : "Платежи Order"}
      id={dispute.order}
      status={order ? order.status : (isPayout ? "disputed" : "disputed")}
      statusMap={statusMap}
      onClose={onClose}
      wide
      footer={<span className="muted" style={{ fontSize: 12 }}>Связано со спором <span className="mono">{dispute.id}</span></span>}
    >
      <Section title="Сводка по ордеру">
        <KV items={[
          ["Сумма", <strong>{fmtMoney(amount)}</strong>],
          ["В USDT", <span className="mono">{(amount / 92.4).toFixed(2)} USDT</span>],
          ["Мерчант", <>{order?.merchantName || dispute.merchantName || "—"} <span className="mono muted">· {order?.merchant || dispute.merchant || "—"}</span></>],
          ["Клиент", order?.customer || dispute.customer || "—"],
          ...(isPayout && order ? [["Получатель", <span className="mono">{bankName(order.customerBank)} · {order.customerTarget}</span>]] : []),
          ["Трейдер", <>{dispute.traderName || traderName(dispute.trader)} <span className="mono muted">· {dispute.trader}</span></>],
          ["Дата", <span className="mono">{order?.date || dispute.opened || "—"}</span>],
          ["ID ордера", <MonoCopy value={dispute.order} />],
        ]} />
      </Section>
      {isPayout && (
        <Section title="Proof">
          <PlaceholderImg label={"receipt_" + dispute.order + ".jpg"} h={120} />
        </Section>
      )}
      {!order && (
        <Note tone="neutral">Полная карточка ордера доступна в разделах «Платежи» / «Выплаты» — здесь показана сводка из спора.</Note>
      )}
    </Drawer>
  );
}

// ─── Tariffs ────────────────────────────────────────────────────────────────
function SectionTariffs() {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const filters = [
    { value: "all", label: "Все", count: TARIFFS.length },
    { value: "active", label: "Active", count: TARIFFS.filter((t) => t.status === "active").length },
    { value: "disabled", label: "Disabled", count: TARIFFS.filter((t) => t.status === "disabled").length },
  ];
  const visible = TARIFFS.filter((t) => filter === "all" || t.status === filter);
  const open = TARIFFS.find((t) => t.id === openId);
  return (
    <>
      <PageHead
        title="Tariffs"
        sub="Тарифные правила: Платежи/Выплаты share, Withdrawal, Settlement. Trader видит, не редактирует."
        actions={<Btn variant="accent"><span className="mono">＋</span> New Tariff</Btn>}
      />
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Tariff ID</th>
              <th>Name</th>
              <th>Платежи share</th>
              <th>Выплаты share</th>
              <th>Withdrawal</th>
              <th>Settlement</th>
              <th>Applies to</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => (
              <tr key={t.id} className={openId === t.id ? "is-selected" : ""} onClick={() => setOpenId(t.id)}>
                <td className="mono">{t.id}</td>
                <td><strong>{t.name}</strong></td>
                <td className="mono">{t.payInShare}</td>
                <td className="mono">{t.payOutShare}</td>
                <td className="muted">{t.withdrawal}</td>
                <td className="muted">{t.settlement}</td>
                <td className="muted">{t.appliesTo}</td>
                <td><StatusPill map={TARIFF_STATUS} value={t.status} /></td>
                <td className="mono muted">{t.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Drawer
          title={open.name}
          id={open.id}
          status={open.status}
          statusMap={TARIFF_STATUS}
          onClose={() => setOpenId(null)}
          footer={<>
            <Btn variant="ghost">Duplicate</Btn>
            {open.status === "active" ? <Btn variant="danger">Disable</Btn> : <Btn variant="ok">Enable</Btn>}
            <span className="spacer" />
            <Btn variant="primary">Edit tariff</Btn>
          </>}
        >
          <Section title="Tariff">
            <KV items={[
              ["Name", <strong>{open.name}</strong>],
              ["Tariff ID", <span className="mono">{open.id}</span>],
              ["Applies to", open.appliesTo],
              ["Updated", <span className="mono">{open.updated}</span>],
            ]} />
          </Section>
          <Section title="Платежи / Выплаты">
            <KV items={[
              ["Платежи trader share", <span className="mono">{open.payInShare}</span>],
              ["Выплаты trader share", <span className="mono">{open.payOutShare}</span>],
            ]} />
          </Section>
          <Section title="Withdrawal & Settlement">
            <KV items={[
              ["Withdrawal", open.withdrawal],
              ["Settlement", open.settlement],
            ]} />
          </Section>
          <Section title="Bank-specific overrides">
            <Note tone="info">Для Bank A установлен повышенный Платежи share <span className="mono">2.2%</span> с 09:00 до 21:00.</Note>
          </Section>
          <Section title="Assigned traders">
            <table className="table table--inset">
              <thead><tr><th>Trader</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td>Alex Morozov <span className="mono muted">· TR-1042</span></td><td><StatusPill map={TRADER_STATUS} value="active" /></td></tr>
                <tr><td>Roman Petrov <span className="mono muted">· TR-1077</span></td><td><StatusPill map={TRADER_STATUS} value="active" /></td></tr>
              </tbody>
            </table>
          </Section>
        </Drawer>
      )}
    </>
  );
}

// ─── Create Team Modal ───────────────────────────────────────────────────
function AddTeamModal({ existingNames = [], team = null, onClose }) {
  const isEdit = !!team;
  const [name, setName] = React.useState(team ? team.name : "");

  // Teamlead — создаётся с нуля либо подставляется из команды
  const [leadName, setLeadName] = React.useState(team && team.lead ? team.lead.name : "");
  const [leadPhone, setLeadPhone] = React.useState(team && team.lead ? (team.lead.phone || "") : "");
  const [leadEmail, setLeadEmail] = React.useState(team && team.lead ? (team.lead.email || "") : "");
  const [leadTelegram, setLeadTelegram] = React.useState(team && team.lead ? (team.lead.telegram || "") : "");

  // Тариф лида — две ставки: на ввод и на вывод
  const [payInRate, setPayInRate] = React.useState(team && team.tariff ? String(team.tariff.payIn) : "2.0");
  const [payOutRate, setPayOutRate] = React.useState(team && team.tariff ? String(team.tariff.payOut) : "1.0");

  const otherNames = isEdit ? existingNames.filter((n) => n.toLowerCase() !== team.name.toLowerCase()) : existingNames;
  const nameTaken = name.trim() && otherNames.map((n) => n.toLowerCase()).includes(name.trim().toLowerCase());
  const canCreate = name.trim().length >= 2 && !nameTaken && leadName.trim().length >= 2;

  return (
    <Modal
      title={isEdit ? ("Редактировать команду · " + team.name) : "Новая команда"}
      onClose={onClose}
      wide
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <span className="spacer" />
        <Btn variant="accent" disabled={!canCreate} onClick={onClose}>{isEdit ? "Сохранить" : "Создать команду"}</Btn>
      </>}
    >
      <Section title="Команда">
        <Field
          label="Название команды"
          hint={nameTaken ? "Команда с таким названием уже есть" : "Короткое, узнаваемое (например, «Дельта»)"}
        >
          <TextInput value={name} onChange={setName} placeholder="Например, Дельта" />
        </Field>
      </Section>

      <Section title="Teamlead">
        <Field label="Имя"><TextInput value={leadName} onChange={setLeadName} placeholder="Например, Anna Smirnova" /></Field>
        <div className="row-2">
          <Field label="Телефон"><TextInput mono value={leadPhone} onChange={setLeadPhone} placeholder="+7 900 …" /></Field>
          <Field label="Email"><TextInput value={leadEmail} onChange={setLeadEmail} placeholder="lead@example.com" /></Field>
        </div>
        <Field label="Telegram"><TextInput mono value={leadTelegram} onChange={setLeadTelegram} placeholder="@username" /></Field>
      </Section>

      <Section title="Тариф лида">
        <div className="row-2">
          <Field label="Ставка на ввод, %" hint="% с каждого платежа">
            <TextInput mono value={payInRate} onChange={setPayInRate} placeholder="2.0" />
          </Field>
          <Field label="Ставка на вывод, %" hint="% с каждой выплаты">
            <TextInput mono value={payOutRate} onChange={setPayOutRate} placeholder="1.0" />
          </Field>
        </div>
      </Section>
    </Modal>
  );
}

// ─── Teams ──────────────────────────────────────────────────────────────────
function SectionTeams() {
  const [openTeamName, setOpenTeamName] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const teamsMap = {};
  TRADERS.forEach((t) => {
    const key = t.team || "—";
    if (!teamsMap[key]) {
      teamsMap[key] = {
        name: key, traders: 0, active: 0, suspended: 0, deactivated: 0,
        payInRub: 0, payOutRub: 0,
        payInCount: 0, payOutCount: 0,
        successSum: 0, disputes: 0, details: 0,
      };
    }
    const tm = teamsMap[key];
    tm.traders += 1;
    if (t.status === "active")      tm.active += 1;
    if (t.status === "suspended")   tm.suspended += 1;
    if (t.status === "deactivated") tm.deactivated += 1;
    tm.payInRub  += (t.today?.payInRub)  || 0;
    tm.payOutRub += (t.today?.payOutRub) || 0;
    tm.successSum += t.success || 0;
    tm.disputes += (t.counts?.openDisputes) || 0;
    tm.details += (t.counts?.detailsActive) || 0;
  });
  // Платежи/Выплаты counts — детерминированно по командам
  const TEAM_COUNTS = {
    "Альфа": { payIn: 610, payOut: 59 },
    "Бета":  { payIn: 521, payOut: 64 },
    "Гамма": { payIn: 287, payOut: 32 },
  };
  const TEAM_LEAD = {
    "Альфа": { name: "Алексей Морозов", login: "a.morozov" },
    "Бета":  { name: "Денис Волков",    login: "d.volkov" },
    "Гамма": { name: "Роман Петров",    login: "r.petrov" },
  };
  const teams = Object.values(teamsMap).map((tm) => {
    let status = "active";
    if (tm.suspended > 0)                          status = "suspended";
    else if (tm.active === 0 && tm.deactivated > 0) status = "deactivated";
    return {
      ...tm,
      status,
      payInCount:  (TEAM_COUNTS[tm.name]?.payIn)  ?? 0,
      payOutCount: (TEAM_COUNTS[tm.name]?.payOut) ?? 0,
      success: tm.traders ? tm.successSum / tm.traders : 0,
      lead: TEAM_LEAD[tm.name] || null,
    };
  });

  return (
    <>
      <PageHead
        title="Команды"
        sub="Группы трейдеров. Суммарные обороты и активность по команде."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, justifyContent: "flex-end" }}>
        <Btn variant="primary" size="sm" style={{ borderRadius: 999, padding: "6px 14px", fontSize: 13, marginLeft: "auto" }} onClick={() => setShowAdd(true)}>Создать команду</Btn>
      </div>
      <div className="pd-grid">
        {teams.map((tm) => {
          const isSelected = openTeamName === tm.name;
          const successPct = Math.round((tm.success || 0) * 100);
          const successTone = successPct >= 97 ? " is-ok" : successPct < 90 ? " is-bad" : "";
          const dispTone = tm.disputes > 4 ? " is-bad" : tm.disputes > 0 ? " is-warn" : "";
          const accent =
            tm.status === "suspended"   ? " pd-card--blocked" :
            tm.status === "deactivated" ? " pd-card--offline" : "";
          return (
            <div
              key={tm.name}
              className={"pd-card" + accent + (isSelected ? " is-selected" : "")}
              onClick={() => setOpenTeamName(tm.name)}
            >
              <div className="pd-card__head">
                <div style={{ minWidth: 0 }}>
                  <div className="pd-card__target">{tm.name}</div>
                  <div className="pd-card__sub">
                    {tm.lead ? (
                      <>
                        <span>{tm.lead.name}</span>
                        <span className="pd-card__sub-sep" />
                        <span className="mono">{tm.lead.login}</span>
                      </>
                    ) : <span>Без тимлида</span>}
                  </div>
                </div>
                <div className="pd-card__head-r">
                  <StatusPill map={TRADER_STATUS} value={tm.status} />
                </div>
              </div>

              <div className="pd-card__stats" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="pd-card__stat">
                  <div className="pd-card__stat-label">Платежи</div>
                  <div className="pd-card__stat-value">{fmtMoney(tm.payInRub / 92.4, "USDT")}</div>
                  <div className="pd-card__limit-nums">{tm.payInCount} ord</div>
                </div>
                <div className="pd-card__stat">
                  <div className="pd-card__stat-label">Выплаты</div>
                  <div className="pd-card__stat-value">{fmtMoney(tm.payOutRub / 92.4, "USDT")}</div>
                  <div className="pd-card__limit-nums">{tm.payOutCount} ord</div>
                </div>
                <div className="pd-card__stat">
                  <div className="pd-card__stat-label">Success</div>
                  <div className={"pd-card__stat-value" + successTone}>{successPct}%</div>
                </div>
                <div className="pd-card__stat">
                  <div className="pd-card__stat-label">Disputes</div>
                  <div className={"pd-card__stat-value" + dispTone}>{tm.disputes || "—"}</div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
      {openTeamName && (() => {
        const openTeam = teams.find((tm) => tm.name === openTeamName);
        if (!openTeam) return null;
        return <TeamDrawer team={openTeam} existingTeamNames={teams.map((t) => t.name)} onClose={() => setOpenTeamName(null)} />;
      })()}
      {showAdd && <AddTeamModal existingNames={teams.map((t) => t.name)} onClose={() => setShowAdd(false)} />}
    </>
  );
}

// ─── Team Lead Access (login + password reset) ─────────────────────────────
function TeamLeadAccessTab({ team }) {
  const lead = team.lead;
  const [newPw, setNewPw] = React.useState(null);
  const [resetAt, setResetAt] = React.useState(null);
  const [reveal, setReveal] = React.useState(true);

  const doReset = () => {
    setNewPw(genPassword());
    setReveal(true);
    const now = new Date();
    setResetAt(now.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }));
  };

  if (!lead) {
    return (
      <Section title="Учётные данные тимлида">
        <Empty>В команде не назначен тимлид — управлять доступом нечем.</Empty>
      </Section>
    );
  }

  const email = lead.email || (lead.login + "@crowdpay.demo");

  return (
    <>
      <Section title="Учётные данные тимлида">
        <KV items={[
          ["Логин / Email", <MonoCopy value={email} />],
          ["Команда", team.name],
          ["Статус", <StatusPill map={TRADER_STATUS} value={team.status} />],
        ]} />
      </Section>

      <Section
        title="Пароль"
        action={<Btn variant={newPw ? "ghost" : "primary"} size="sm" onClick={doReset}>
          {newPw ? "Сбросить ещё раз" : "Сбросить пароль"}
        </Btn>}
      >
        {!newPw && (
          <Note tone="neutral">
            Сброс сгенерирует новый временный пароль для тимлида. Текущий пароль перестанет действовать сразу после сброса.
          </Note>
        )}

        {newPw && (
          <>
            <div style={{ border: "1px solid var(--line-2)", borderRadius: "var(--radius)", padding: "12px 14px", background: "var(--paper-2)", marginBottom: 10 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--ink-3)", marginBottom: 6 }}>Новый пароль</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{ fontSize: 17, letterSpacing: 0.5, color: "var(--ink)" }}>
                  {reveal ? newPw : "•".repeat(newPw.length)}
                </span>
                <span className="spacer" style={{ flex: 1 }} />
                <Btn variant="ghost" size="sm" onClick={() => setReveal((r) => !r)}>
                  {reveal ? "Скрыть" : "Показать"}
                </Btn>
                <CopyBtn value={newPw} />
              </div>
            </div>
            <Note tone="warn">
              Пароль показывается только сейчас. Скопируйте и передайте тимлиду по защищённому каналу — повторно посмотреть его будет нельзя.
            </Note>
            <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              Сброшен: <span className="mono">{resetAt}</span> · оператор <span className="mono">a.smirnov</span>
            </div>
          </>
        )}
      </Section>

      <Section title="Безопасность">
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost">Завершить все сессии</Btn>
          <Btn variant="danger">Заблокировать вход</Btn>
        </div>
      </Section>
    </>
  );
}

// ─── Team Drawer ──────────────────────────────────────────────────────────
function TraderRateInput({ value, onChange }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
      <input
        type="number"
        step="0.1"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        style={{ width: 56, padding: "4px 6px", border: "1px solid var(--line-2)", borderRadius: 6, fontFamily: "var(--mono, ui-monospace, monospace)", fontSize: 12.5, textAlign: "right", background: "var(--paper)", color: "var(--ink)" }}
      />
      <span className="muted" style={{ fontSize: 11.5 }}>%</span>
    </span>
  );
}

function TeamDrawer({ team, existingTeamNames = [], onClose }) {
  const [period, setPeriod] = React.useState("today");
  const [tab, setTab] = React.useState("overview");
  const [showEdit, setShowEdit] = React.useState(false);
  const [traderRates, setTraderRates] = React.useState({}); // { [traderId]: { payIn, payOut } } — переопределения комиссии
  const [balExtra, setBalExtra] = React.useState([]); // manual balance ops
  const [bDir, setBDir] = React.useState("deposit");
  const [bAmount, setBAmount] = React.useState("");
  const [bTx, setBTx] = React.useState("");
  const PERIODS = {
    "hour":      { label: "Час",     k: 0.07 },
    "today":     { label: "Сегодня", k: 1    },
    "yesterday": { label: "Вчера",   k: 0.92 },
    "month":     { label: "Месяц",   k: 22.4 },
    "all":       { label: "Всё",     k: 184.6 },
  };
  const p = PERIODS[period];
  const periodChips = Object.keys(PERIODS).map((id) => ({ value: id, label: PERIODS[id].label }));

  const traders = TRADERS.filter((t) => (t.team || "—") === team.name);

  const payInUsdt  = (team.payInRub  / 92.4) * p.k;
  const payOutUsdt = (team.payOutRub / 92.4) * p.k;
  const payInOrders  = Math.round(team.payInCount  * p.k);
  const payOutOrders = Math.round(team.payOutCount * p.k);

  const openDisputesBase = team.disputes || 0;
  const totalDisputesBase = Math.max(openDisputesBase + 9, openDisputesBase * 2);
  const openDisputes  = Math.max(0, Math.round(openDisputesBase  * p.k));
  const totalDisputes = Math.max(openDisputes, Math.round(totalDisputesBase * p.k));
  const conv = Math.round((team.success || 0) * 100);

  const LEAD_TARIFFS = {
    "Альфа": { payIn: 1.5, payOut: 1.0, balance: 482.40 },
    "Бета":  { payIn: 2.0, payOut: 1.5, balance: 1247.85 },
    "Гамма": { payIn: 1.2, payOut: 0.8, balance: 218.60 },
  };
  const tariff = LEAD_TARIFFS[team.name] || { payIn: 1.5, payOut: 1.0, balance: 0 };
  const profitIn  = payInUsdt  * (tariff.payIn  / 100);
  const profitOut = payOutUsdt * (tariff.payOut / 100);
  const profit = profitIn + profitOut;

  const balDelta = balExtra.reduce((s, e) => s + (e.direction === "deposit" ? e.amountUsdt : -e.amountUsdt), 0);
  const liveBalance = tariff.balance + balDelta;
  const bAmt = parseFloat(bAmount);
  const bOverdraw = bDir === "withdraw" && bAmt > liveBalance;
  const bValid = bAmt > 0 && !bOverdraw;
  const submitBal = () => {
    if (!bValid) return;
    const seq = Math.floor(1000 + Math.random() * 9000);
    setBalExtra((prev) => [{
      id: (bDir === "deposit" ? "TB-D" : "TB-W") + seq,
      ts: "сейчас",
      direction: bDir,
      amountUsdt: +bAmt.toFixed(2),
      tx: bTx || "ручная операция",
    }, ...prev]);
    setBAmount("");
    setBTx("");
  };
  // demo history of past balance operations (mostly withdrawals)
  const BASE_BAL_HISTORY = {
    "Альфа": [
      { id: "TB-7741", ts: "27.04 12:10", direction: "withdraw", amountUsdt: 1200.00, tx: "0x9f2c…a31b" },
      { id: "TB-7720", ts: "24.04 09:32", direction: "withdraw", amountUsdt: 850.00,  tx: "0x41ad…77e2" },
      { id: "TB-7698", ts: "20.04 18:44", direction: "deposit",  amountUsdt: 500.00,  tx: "0xb12c…0f9a" },
      { id: "TB-7655", ts: "15.04 11:08", direction: "withdraw", amountUsdt: 2100.00, tx: "0x7d3e…c401" },
    ],
    "Бета": [
      { id: "TB-6610", ts: "26.04 16:20", direction: "withdraw", amountUsdt: 1800.00, tx: "0x55fa…9b21" },
      { id: "TB-6588", ts: "22.04 10:15", direction: "withdraw", amountUsdt: 940.00,  tx: "0x2c8d…41ee" },
      { id: "TB-6540", ts: "18.04 13:02", direction: "deposit",  amountUsdt: 1000.00, tx: "0x9a01…3f7c" },
    ],
    "Гамма": [
      { id: "TB-5510", ts: "25.04 14:48", direction: "withdraw", amountUsdt: 420.00,  tx: "0x6e21…a907" },
      { id: "TB-5489", ts: "19.04 09:55", direction: "withdraw", amountUsdt: 360.00,  tx: "0xf201…48cb" },
    ],
  };
  const balHistory = [...balExtra, ...(BASE_BAL_HISTORY[team.name] || [])];

  return (
    <>
    <Drawer
      title={team.name}
      status={team.status}
      statusMap={TRADER_STATUS}
      onClose={onClose}
      wide
      footer={<>
        <Btn variant="primary" onClick={() => setShowEdit(true)}>Редактировать</Btn>
        <span className="spacer" />
        {team.status === "active"
          ? <Btn variant="danger">Блокировать команду</Btn>
          : <Btn variant="ok">Активировать команду</Btn>}
      </>}
    >
      <Tabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "balance",  label: "Баланс" },
          { id: "access",   label: "Доступ" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "overview" && (
      <>
      <FilterChips filters={periodChips} value={period} onChange={setPeriod} />

      <div className="stat-row stat-row--3">
        <div className="stat">
          <div className="stat__label">Платежи · {PERIODS[period].label.toLowerCase()}</div>
          <div className="stat__value">{payInUsdt.toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="stat__delta">{payInOrders.toLocaleString("ru-RU")} ордеров</div>
        </div>
        <div className="stat">
          <div className="stat__label">Выплаты · {PERIODS[period].label.toLowerCase()}</div>
          <div className="stat__value">{payOutUsdt.toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="stat__delta">{payOutOrders.toLocaleString("ru-RU")} ордеров</div>
        </div>
        <div className="stat">
          <div className="stat__label">Конверсия</div>
          <div className="stat__value">{conv}<span className="ccy">%</span></div>
          <div className="stat__delta">{(payInOrders + payOutOrders).toLocaleString("ru-RU")} ордеров</div>
        </div>
      </div>

      <Section title="Профиль">
        <KV items={[
          ["Название", <strong>{team.name}</strong>],
          ["Teamlead", team.lead
            ? <><strong>{team.lead.name}</strong> <span className="mono muted">· {team.lead.login}</span></>
            : <span className="muted">не назначен</span>],
          ["Статус", <StatusPill map={TRADER_STATUS} value={team.status} />],
          ["Трейдеры", <>{team.active} активных <span className="muted">/ всего {team.traders}</span></>],
          ["Реквизиты (активные)", team.details],
          ["Success rate", Math.round(team.success * 100) + "%"],
        ]} />
      </Section>

      {(() => {
        return (
          <Section title="Тариф тимлида">
            <KV items={[
              ["Комиссия с платежей",  <><strong>{tariff.payIn.toFixed(1)}%</strong> <span className="muted">от оборота трейдеров</span></>],
              ["Комиссия с выплат",    <><strong>{tariff.payOut.toFixed(1)}%</strong> <span className="muted">от оборота трейдеров</span></>],
            ]} />
          </Section>
        );
      })()}

      <Section title={`Трейдеры команды (${traders.length})`}>
        <table className="table table--inset">
          <thead><tr>
            <th>Trader</th>
            <th>Status</th>
            <th className="num">% платёж</th>
            <th className="num">% выплата</th>
            <th className="num">Платежи / day</th>
            <th className="num">Выплаты / day</th>
          </tr></thead>
          <tbody>
            {traders.map((t) => {
              const r = traderRates[t.id] || {};
              const payIn = r.payIn != null ? r.payIn : tariff.payIn.toFixed(1);
              const payOut = r.payOut != null ? r.payOut : tariff.payOut.toFixed(1);
              const overridden = r.payIn != null || r.payOut != null;
              const setRate = (key, val) => setTraderRates((prev) => ({ ...prev, [t.id]: { ...prev[t.id], [key]: val } }));
              return (
              <tr key={t.id}>
                <td>
                  <strong>{t.name}</strong> <span className="mono muted">· {t.id}</span>
                  {overridden && <span className="muted" style={{ fontSize: 11 }}> · инд.</span>}
                </td>
                <td><StatusPill map={TRADER_STATUS} value={t.status} /></td>
                <td className="num"><TraderRateInput value={payIn} onChange={(v) => setRate("payIn", v)} /></td>
                <td className="num"><TraderRateInput value={payOut} onChange={(v) => setRate("payOut", v)} /></td>
                <td className="num">{(((t.today?.payInRub) || 0) / 92.4).toFixed(2)} USDT</td>
                <td className="num">{(((t.today?.payOutRub) || 0) / 92.4).toFixed(2)} USDT</td>
              </tr>
              );
            })}
            {traders.length === 0 && (
              <tr><td colSpan={6}><Empty>В команде пока нет трейдеров</Empty></td></tr>
            )}
          </tbody>
        </table>
      </Section>
      </>
      )}

      {tab === "balance" && (
      <>
      <FilterChips filters={periodChips} value={period} onChange={setPeriod} />

      <div className="stat-row" style={{ marginBottom: 4, display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%" }}>
        <div className="stat">
          <div className="stat__label">Профит · {PERIODS[period].label.toLowerCase()}</div>
          <div className="stat__value">{profit.toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="stat__delta">{profitIn.toFixed(2)} + {profitOut.toFixed(2)}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Текущий баланс</div>
          <div className="stat__value">{liveBalance.toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="stat__delta">баланс тимлида</div>
        </div>
      </div>

      <Section
        title="Депозит / вывод"
        action={
          <Btn variant={bDir === "deposit" ? "ok" : "danger"} size="sm" disabled={!bValid} onClick={submitBal}>
            {bDir === "deposit" ? "＋ Зачислить" : "− Списать"}
          </Btn>
        }
      >
        <div className="row-2">
          <Field label="Операция">
            <Select value={bDir} onChange={setBDir} options={[
              { value: "deposit",  label: "Пополнение" },
              { value: "withdraw", label: "Вывод" },
            ]} />
          </Field>
          <Field label="Сумма (USDT)" hint={bOverdraw ? "Больше текущего баланса" : undefined}>
            <TextInput value={bAmount} onChange={setBAmount} placeholder="напр. 500" mono />
          </Field>
        </div>
        <Field label="TX">
          <TextInput value={bTx} onChange={setBTx} placeholder="напр. 0x9f2c…a31b" mono />
        </Field>
      </Section>

      <Section title="История операций">
        {balHistory.length === 0 ? (
          <Empty>Операций ещё не было</Empty>
        ) : (
          <table className="table table--inset">
            <thead><tr>
              <th>Тип</th>
              <th className="num">Сумма USDT</th>
              <th>TX</th>
              <th>Дата</th>
              <th>ID</th>
            </tr></thead>
            <tbody>
              {balHistory.map((e) => (
                <tr key={e.id}>
                  <td><StatusPill map={DEPOSIT_DIRECTION} value={e.direction} /></td>
                  <td className="num">
                    <strong style={{ color: e.direction === "deposit" ? "var(--ok)" : "var(--bad)" }}>
                      {e.direction === "deposit" ? "+" : "−"}{e.amountUsdt.toFixed(2)} USDT
                    </strong>
                  </td>
                  <td className="mono muted">{e.tx}</td>
                  <td className="mono">{e.ts}</td>
                  <td className="mono">{e.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
      </>
      )}

      {tab === "access" && <TeamLeadAccessTab team={team} />}
    </Drawer>
    {showEdit && (
      <AddTeamModal
        existingNames={existingTeamNames}
        team={{ ...team, tariff }}
        onClose={() => setShowEdit(false)}
      />
    )}
    </>
  );
}

// ─── Запросы (все входящие запросы от мерчантов) ─────────────────────────────
function RequestJsonBlock({ obj }) {
  const json = JSON.stringify(obj, null, 2);
  return (
    <pre style={{
      margin: 0, padding: "12px 14px", borderRadius: 10, background: "var(--paper-2)",
      border: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: 12,
      lineHeight: 1.6, color: "var(--ink-2)", overflowX: "auto", whiteSpace: "pre",
    }}>{json}</pre>
  );
}

function SectionRequests({ onGo }) {
  const [filter, setFilter] = React.useState("all");
  const [merchantFilter, setMerchantFilter] = React.useState("all");
  const [methodFilter, setMethodFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const provName = (id) => {
    const p = (typeof PROVIDERS !== "undefined" ? PROVIDERS : []).find((x) => x.id === id);
    return p ? p.name : id;
  };
  const go = (sec, id) => { if (onGo) onGo(sec, id); };

  const merchantOptions = [
    { value: "all", label: "Все мерчанты" },
    ...Array.from(new Set(REQUESTS.map((r) => r.merchant))).map((id) => ({ value: id, label: merchantName(id) })),
  ];
  const methodOptions = [
    { value: "all", label: "Все методы" },
    ...Array.from(new Set(REQUESTS.map((r) => r.payload && r.payload.method).filter(Boolean))).map((m) => ({ value: m, label: METHOD_LABEL[m] || m })),
  ];
  const filters = [
    { value: "all",     label: "Все",   count: REQUESTS.length },
    { value: "success", label: "Успех", count: REQUESTS.filter((r) => r.status === "success").length },
    { value: "reject",  label: "Отказ", count: REQUESTS.filter((r) => r.status === "reject").length },
  ];
  const visible = REQUESTS.filter((r) => {
    if (merchantFilter !== "all" && r.merchant !== merchantFilter) return false;
    if (methodFilter !== "all" && (!r.payload || r.payload.method !== methodFilter)) return false;
    if (filter === "all") return true;
    return r.status === filter;
  });
  const open = REQUESTS.find((r) => r.id === openId);

  const execCell = (r) => {
    if (r.status !== "success") return <span className="muted">—</span>;
    if (r.trader) return <><strong>{traderName(r.trader)}</strong> <span className="muted" style={{ fontSize: 12 }}>· трейдер</span></>;
    if (r.provider) return <><strong>{provName(r.provider)}</strong> <span className="muted" style={{ fontSize: 12 }}>· провайдер</span></>;
    return <span className="muted">—</span>;
  };

  return (
    <>
      <PageHead
        title="Запросы"
        sub="Все входящие запросы от мерчантов на приём и выплату — независимо от того, создался ли по ним платёж."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
        <ChipSelect value={merchantFilter} onChange={setMerchantFilter} options={merchantOptions} placeholder="Мерчант" align="left" />
        <ChipSelect value={methodFilter} onChange={setMethodFilter} options={methodOptions} placeholder="Метод" />
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 110 }}>Статус</th>
              <th className="num">Сумма</th>
              <th>Мерчант</th>
              <th>Метод</th>
              <th>Трейдер / провайдер</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className={openId === r.id ? "is-selected" : ""} onClick={() => setOpenId(r.id)}>
                <td>
                  <StatusPill map={REQUEST_STATUS} value={r.status} />
                  <div className="mono muted" style={{ fontSize: 11, marginTop: 3 }}>{r.type === "payin" ? "платёж" : "выплата"}</div>
                </td>
                <td className="num">
                  <strong>{fmtMoney(r.amount)}</strong>
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{(r.amount / 92.4).toFixed(2)} USDT</div>
                </td>
                <td>{merchantName(r.merchant)}</td>
                <td>{r.payload && r.payload.method ? <span className={"pd-card__method pd-card__method--" + r.payload.method}>{METHOD_LABEL[r.payload.method] || r.payload.method}</span> : <span className="muted">—</span>}</td>
                <td>{execCell(r)}</td>
                <td className="mono muted">{r.createdAt}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={6}><Empty>Нет запросов по фильтру</Empty></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Drawer
          title="Запрос"
          id={open.id}
          status={open.status}
          statusMap={REQUEST_STATUS}
          onClose={() => setOpenId(null)}
          wide
        >
          <Section title="Данные запроса">
            <KV items={[
              ["Статус", <StatusPill map={REQUEST_STATUS} value={open.status} />],
              ["Тип", open.type === "payin" ? "Платёж (payin)" : "Выплата (payout)"],
              ["Сумма", <><strong>{fmtMoney(open.amount)}</strong> <span className="muted">· {(open.amount / 92.4).toFixed(2)} USDT</span></>],
              ["Дата заявки", <span className="mono">{open.createdAt}</span>],
              ["Дата ответа", <span className="mono">{open.respondedAt}</span>],
              ["Мерчант", <><strong>{merchantName(open.merchant)}</strong> <span className="mono muted">· {open.merchant}</span></>],
              ["Трейдер / провайдер", open.trader
                ? <a className="link-cell" style={{ cursor: "pointer", color: "var(--accent)" }} onClick={() => go("traders", open.trader)}><strong>{traderName(open.trader)}</strong> <span className="mono muted">· {open.trader}</span></a>
                : open.provider
                ? <a className="link-cell" style={{ cursor: "pointer", color: "var(--accent)" }} onClick={() => go("providers", open.provider)}><strong>{provName(open.provider)}</strong> <span className="mono muted">· {open.provider}</span></a>
                : <span className="muted">—</span>],
              ["Платёж / выплата", open.order
                ? (() => {
                    const pool = open.type === "payin" ? (typeof PAY_IN !== "undefined" ? PAY_IN : []) : (typeof PAY_OUT !== "undefined" ? PAY_OUT : []);
                    const o = pool.find((x) => x.id === open.order);
                    const smap = open.type === "payin" ? PAY_IN_STATUS : PAY_OUT_STATUS;
                    return o
                      ? <a className="link-cell" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }} onClick={() => go(open.type, open.order)}>
                          <strong style={{ color: "var(--accent)" }}>{fmtMoney(o.amount)}</strong>
                          <span className="mono muted">{o.date}</span>
                          <StatusPill map={smap} value={o.status} />
                        </a>
                      : <a className="link-cell" style={{ cursor: "pointer", color: "var(--accent)" }} onClick={() => go(open.type, open.order)}><span className="mono">{open.order} ↗</span></a>;
                  })()
                : <span className="muted">— не создан</span>],
              ...(open.status === "reject" && open.rejectReason ? [["Причина отказа", <span style={{ color: "var(--bad)" }}>{open.rejectReason}</span>]] : []),
            ]} />
          </Section>

          <Section title="Текст запроса">
            <RequestJsonBlock obj={open.payload} />
          </Section>

          <Section title="Текст ответа">
            <RequestJsonBlock obj={open.response || (open.status === "success"
              ? { status: "success", request_id: open.id, order_id: open.order || null, method: open.payload && open.payload.method, responded_at: open.respondedAt }
              : { status: "reject", request_id: open.id, error: open.rejectReason || "rejected", responded_at: open.respondedAt })} />
          </Section>
        </Drawer>
      )}
    </>
  );
}

// ─── Вызовы (все исходящие вызовы к провайдерам) ────────────────────────────
function SectionCalls({ onGo }) {
  const [filter, setFilter] = React.useState("all");
  const [merchantFilter, setMerchantFilter] = React.useState("all");
  const [methodFilter, setMethodFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const provName = (id) => {
    const p = (typeof PROVIDERS !== "undefined" ? PROVIDERS : []).find((x) => x.id === id);
    return p ? p.name : id;
  };
  const go = (sec, id) => { if (onGo) onGo(sec, id); };

  const merchantOptions = [
    { value: "all", label: "Все мерчанты" },
    ...Array.from(new Set(CALLS.map((c) => c.merchant))).map((id) => ({ value: id, label: merchantName(id) })),
  ];
  const methodOptions = [
    { value: "all", label: "Все методы" },
    ...Array.from(new Set(CALLS.map((c) => c.payload && c.payload.method_type).filter(Boolean))).map((m) => ({ value: m, label: METHOD_LABEL[m] || m })),
  ];
  const filters = [
    { value: "all",     label: "Все",   count: CALLS.length },
    { value: "success", label: "Успех", count: CALLS.filter((c) => c.status === "success").length },
    { value: "reject",  label: "Отказ", count: CALLS.filter((c) => c.status === "reject").length },
  ];
  const visible = CALLS.filter((c) => {
    if (merchantFilter !== "all" && c.merchant !== merchantFilter) return false;
    if (methodFilter !== "all" && (!c.payload || c.payload.method_type !== methodFilter)) return false;
    if (filter === "all") return true;
    return c.status === filter;
  });
  const open = CALLS.find((c) => c.id === openId);

  return (
    <>
      <PageHead
        title="Вызовы"
        sub="Все исходящие вызовы к провайдерам — независимо от того, успешны они или нет."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
        <ChipSelect value={merchantFilter} onChange={setMerchantFilter} options={merchantOptions} placeholder="Мерчант" align="left" />
        <ChipSelect value={methodFilter} onChange={setMethodFilter} options={methodOptions} placeholder="Метод" />
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 110 }}>Статус</th>
              <th className="num">Сумма</th>
              <th>Провайдер</th>
              <th>Мерчант</th>
              <th>Метод</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c) => (
              <tr key={c.id} className={openId === c.id ? "is-selected" : ""} onClick={() => setOpenId(c.id)}>
                <td>
                  <StatusPill map={REQUEST_STATUS} value={c.status} />
                  <div className="mono muted" style={{ fontSize: 11, marginTop: 3 }}>{c.type === "payin" ? "платёж" : "выплата"}</div>
                </td>
                <td className="num">
                  <strong>{fmtMoney(c.amount)}</strong>
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{(c.amount / 92.4).toFixed(2)} USDT</div>
                </td>
                <td>{provName(c.provider)} <span className="mono muted" style={{ fontSize: 11 }}>· {c.provider}</span></td>
                <td>{merchantName(c.merchant)}</td>
                <td>{c.payload && c.payload.method_type ? <span className={"pd-card__method pd-card__method--" + c.payload.method_type}>{METHOD_LABEL[c.payload.method_type] || c.payload.method_type}</span> : <span className="muted">—</span>}</td>
                <td className="mono muted">{c.createdAt}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={6}><Empty>Нет вызовов по фильтру</Empty></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Drawer
          title="Вызов"
          id={open.id}
          status={open.status}
          statusMap={REQUEST_STATUS}
          onClose={() => setOpenId(null)}
          wide
        >
          <Section title="Данные вызова">
            <KV items={[
              ["Статус", <StatusPill map={REQUEST_STATUS} value={open.status} />],
              ["Тип", open.type === "payin" ? "Платёж (payin)" : "Выплата (payout)"],
              ["Сумма", <><strong>{fmtMoney(open.amount)}</strong> <span className="muted">· {(open.amount / 92.4).toFixed(2)} USDT</span></>],
              ["Дата заявки", <span className="mono">{open.createdAt}</span>],
              ["Дата ответа", <span className="mono">{open.respondedAt}</span>],
              ["Мерчант", <><strong>{merchantName(open.merchant)}</strong> <span className="mono muted">· {open.merchant}</span></>],
              ["Провайдер", <a className="link-cell" style={{ cursor: "pointer", color: "var(--accent)" }} onClick={() => go("providers", open.provider)}><strong>{provName(open.provider)}</strong> <span className="mono muted">· {open.provider}</span></a>],
              ["Платёж / выплата", open.order
                ? (() => {
                    const pool = open.type === "payin" ? (typeof PAY_IN !== "undefined" ? PAY_IN : []) : (typeof PAY_OUT !== "undefined" ? PAY_OUT : []);
                    const o = pool.find((x) => x.id === open.order);
                    const smap = open.type === "payin" ? PAY_IN_STATUS : PAY_OUT_STATUS;
                    return o
                      ? <a className="link-cell" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }} onClick={() => go(open.type, open.order)}>
                          <strong style={{ color: "var(--accent)" }}>{fmtMoney(o.amount)}</strong>
                          <span className="mono muted">{o.date}</span>
                          <StatusPill map={smap} value={o.status} />
                        </a>
                      : <a className="link-cell" style={{ cursor: "pointer", color: "var(--accent)" }} onClick={() => go(open.type, open.order)}><span className="mono">{open.order} ↗</span></a>;
                  })()
                : <span className="muted">— не создан</span>],
              ...(open.status === "reject" && open.rejectReason ? [["Причина отказа", <span style={{ color: "var(--bad)" }}>{open.rejectReason}</span>]] : []),
            ]} />
          </Section>

          <Section title="Текст запроса">
            <RequestJsonBlock obj={open.payload} />
          </Section>

          <Section title="Текст ответа">
            <RequestJsonBlock obj={open.response || (open.status === "success"
              ? { status: "success", call_id: open.id, order_id: open.order || null, provider: open.provider, method: open.payload && open.payload.method_type, responded_at: open.respondedAt }
              : { status: "reject", call_id: open.id, error: open.rejectReason || "rejected", responded_at: open.respondedAt })} />
          </Section>
        </Drawer>
      )}
    </>
  );
}

Object.assign(window, {
  SectionPayIn, SectionPayOut, SectionTraders, SectionTeams, SectionTerminals,
  SectionPaymentDetails, SectionDeposits, SectionWithdrawals,
  SectionDisputes, SectionTariffs, SectionRequests, SectionCalls,
  PayInStatusCell,
});
