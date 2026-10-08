// Trader app — sections part 1: Dashboard, Платежи, Выплаты, Terminals, Реквизиты
// Соответствует ТЗ v4 (M.Novikov, 30.04.2026)

const METHOD_LABEL = {
  sbp: "СБП",
  card: "Карта",
  c2c: "Card-to-Card",
  phone: "По номеру телефона",
  account: "Расчётный счёт"
};

// ─── helpers ─────────────────────────────────────────────────────────────

// Доступность реквизита в каскаде: собирает все причины недоступности.
function pdAvailability(pd) {
  const reasons = [];
  // трейдер выключен
  if (typeof ME !== "undefined" && ME.status && ME.status !== "active") {
    reasons.push("Трейдер выключен (аккаунт не активен)");
  }
  // статус самого реквизита
  if (pd.status === "trader-off") reasons.push("Реквизит выключен трейдером");
  if (pd.status === "admin-off") reasons.push("Реквизит выключен администратором");
  if (pd.status === "blocked") reasons.push("Реквизит заблокирован" + (pd.blockReason ? " · " + pd.blockReason : ""));
  if (pd.status === "limit-exceeded") reasons.push("Исчерпан дневной лимит по сумме");
  // терминал не активен
  const term = (typeof TERMINALS !== "undefined") ? TERMINALS.find((t) => t.id === pd.terminal) : null;
  if (pd.status === "terminal-offline" || (term && term.status === "offline")) {
    reasons.push("Терминал не активен" + (term ? " (" + term.name + " offline)" : ""));
  }
  // cooldown между платежами
  if (pd.status === "cooldown" || pd.cooldown) {
    const sec = pd.cooldown ? pd.cooldown.remainingSec : 0;
    reasons.push("Cooldown между платежами" + (sec ? " · осталось " + Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0") : ""));
  }
  // нет тарифа на тип платежа
  if (typeof TARIFF !== "undefined" && TARIFF.payInMethods) {
    const tariffMethods = TARIFF.payInMethods.map((m) => m.method);
    const pdMethods = pd.methods || [pd.method];
    const covered = pdMethods.filter((m) => tariffMethods.includes(m));
    const uncovered = pdMethods.filter((m) => !tariffMethods.includes(m));
    if (covered.length === 0) {
      reasons.push("Нет тарифа на методы реквизита (" + pdMethods.map((m) => METHOD_LABEL[m] || m).join(", ") + ")");
    } else if (uncovered.length > 0) {
      // частично покрыт — не блокирует, но отметим
    }
  }
  return { available: reasons.length === 0, reasons };
}

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

// ── Компактный статус для Платежей (иконка + обратный отсчёт) ──────────────
function TPayStatusIcon({ kind, size = 13 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (kind) {
    case "check": return <svg {...common}><polyline points="20 6 9 17 4 12" /></svg>;
    case "auto":  return <svg {...common} strokeWidth="2.2"><polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2" fill="currentColor" stroke="none" /></svg>;
    case "manual":return <svg {...common}><polyline points="20 6 9 17 4 12" /><path d="M2 20h20" strokeWidth="2.1" /></svg>;
    case "clock": return <svg {...common}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></svg>;
    case "x":     return <svg {...common}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
    case "bang":  return <svg {...common}><path d="M12 7v6" /><path d="M12 17h.01" /></svg>;
    default:      return <svg {...common} strokeWidth="0" fill="currentColor"><circle cx="12" cy="12" r="4.5" /></svg>;
  }
}

function TPayCountdown({ seconds }) {
  const [left, setLeft] = React.useState(seconds);
  React.useEffect(() => {
    setLeft(seconds);
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [seconds]);
  const m = Math.floor(left / 60), s = left % 60;
  return <span>{m}:{String(s).padStart(2, "0")}</span>;
}

const TPAY_TONE_FG = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--bad)", info: "var(--info)", neutral: "var(--ink-3)" };
const TPAY_TONE_BG = { ok: "var(--ok-soft)", warn: "var(--warn-soft)", bad: "var(--bad-soft)", info: "var(--info-soft)", neutral: "var(--paper-2)" };

function TraderPayStatusCell({ order, ok, kind, disputed }) {
  let tone, iconKind, title;
  if (disputed) { tone = "bad"; iconKind = "bang"; title = "Спор"; }
  else if (ok) { tone = "ok"; iconKind = "check"; title = "Успешно — " + (kind === "auto" ? "Auto (автоподтверждение)" : "Manual (подтверждено вручную)"); }
  else {
    const meta = PAY_IN_STATUS[order.status] || { label: order.status, tone: "neutral" };
    tone = meta.tone; title = meta.label;
    iconKind = order.status === "waiting-payment" ? "clock"
      : order.status === "matching" ? "clock"
      : order.status === "disputed" ? "bang"
      : ["failed", "expired"].includes(order.status) ? "x"
      : "dot";
  }
  const isWaiting = !ok && !disputed && ["waiting-payment", "matching"].includes(order.status);
  let h = 0; for (const c of String(order.id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const secs = 45 + (h % (14 * 60));
  const shortLabel = disputed || order.status === "disputed" ? "Спор"
    : ok ? (kind === "auto" ? "Auto" : "Manual")
    : order.status === "expired" ? "Истёк"
    : order.status === "failed" ? "Ошибка"
    : isWaiting ? null : (PAY_IN_STATUS[order.status] || {}).label;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }} title={title}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: TPAY_TONE_BG[tone] || TPAY_TONE_BG.neutral, color: TPAY_TONE_FG[tone] || TPAY_TONE_FG.neutral }}>
        <TPayStatusIcon kind={iconKind} size={16} />
      </span>
      {isWaiting ? (
        <span className="mono" style={{ fontSize: 12.5, color: "var(--warn)", fontVariantNumeric: "tabular-nums" }}>
          <TPayCountdown seconds={secs} />
        </span>
      ) : shortLabel && (
        <span style={{ fontSize: 12.5, color: TPAY_TONE_FG[tone] || "var(--ink-2)", fontWeight: 600 }}>{shortLabel}</span>
      )}
    </span>
  );
}

// ─── PAYIN ────────────────────────────────────────────────────────────────
function TraderPayIn({ initFilter }) {
  const [filter, setFilter] = React.useState("in-progress");
  React.useEffect(() => {
    if (initFilter && initFilter.value) setFilter(initFilter.value);
  }, [initFilter && initFilter.key]);
  const [openId, setOpenId] = React.useState(null);
  const [confirmCloseId, setConfirmCloseId] = React.useState(null);
  const [closedManual, setClosedManual] = React.useState({});  // id -> closedAt
  const [disputeFormId, setDisputeFormId] = React.useState(null);  // id of order whose dispute form is open
  const [disputedManual, setDisputedManual] = React.useState({});  // id -> dispute id
  const [disputeReason, setDisputeReason] = React.useState("Платёж не поступил на счёт");
  const getKind = (o) => closedManual[o.id] ? "manual" : (o.closedBy || (o.source === "SMS" || o.source === "Push" ? "auto" : "manual"));
  const getClosedAt = (o) => closedManual[o.id] || o.closedAt;
  const isClosed = (o) => o.status === "completed" || !!closedManual[o.id];
  const filters = [
  { value: "in-progress", label: "В работе", count: PAY_IN.filter((o) => ["waiting-payment", "disputed"].includes(o.status)).length },
  { value: "completed", label: "Успешные", count: PAY_IN.filter((o) => o.status === "completed").length },
  { value: "failed", label: "Не выполнены", count: PAY_IN.filter((o) => ["failed", "expired"].includes(o.status)).length },
  { value: "all", label: "Все", count: PAY_IN.length }];

  const visible = PAY_IN.filter((o) => {
    const manualOk = !!closedManual[o.id];
    if (filter === "all") return true;
    if (filter === "in-progress") return !manualOk && ["waiting-payment", "disputed"].includes(o.status);
    if (filter === "failed") return !manualOk && ["failed", "expired"].includes(o.status);
    if (filter === "completed") return o.status === "completed" || manualOk;
    return o.status === filter;
  });
  const open = PAY_IN.find((o) => o.id === openId);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 118 }}>Статус</th>
              <th>Реквизит</th>
              <th className="num">Сумма</th>
              <th className="num">Профит</th>
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
              const isDisputedManual = !!disputedManual[o.id];
              const kind = isOk ? getKind(o) : null;
              const closedAt = getClosedAt(o);
              return (
                <tr key={o.id} className={openId === o.id ? "is-selected" : ""} onClick={() => setOpenId(o.id)}>
                <td>
                  <TraderPayStatusCell order={o} ok={isOk} kind={kind} disputed={isDisputedManual} />
                </td>
                <td>
                  {pd ?
                    <>
                      <div>{pd.holder}</div>
                      <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}><span style={{ fontFamily: "var(--font-body, inherit)" }}>{bankName(pd.bank)}</span> · {pd.target}</div>
                    </> :
                    <span className="mono">{o.details}</span>}
                </td>
                <td className="num" style={{ fontFamily: "\"Inter Tight\"" }}>
                  {fmtMoney(o.amount, "RUB")}
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{usdt.toFixed(2)} USDT</div>
                </td>
                <td className="num mono">{isOk ? <>{fee.toFixed(2)} <span className="muted">USDT</span></> : <span className="muted">—</span>}</td>
                <td className="mono">{o.date}{o.dispute && <span className="dot-dispute"> ●</span>}</td>
                <td className="mono">{closedAt || <span className="muted">—</span>}</td>
              </tr>);
            })}
          </tbody>
        </table>
        <div className="table-foot">Показано <strong>{visible.length}</strong> из <strong>{PAY_IN.length}</strong></div>
      </div>

      {open && <PayInDrawer order={open} onClose={() => setOpenId(null)} received={!!closedManual[open.id]} onMarkReceived={() => setConfirmCloseId(open.id)} disputed={!!disputedManual[open.id]} disputeId={disputedManual[open.id]} onOpenDispute={() => { setDisputeReason("Платёж не поступил на счёт"); setDisputeFormId(open.id); }} />}

      {confirmCloseId && (() => {
        const o = PAY_IN.find((x) => x.id === confirmCloseId);
        if (!o) return null;
        const wasExpired = o.status === "expired";
        return (
          <Modal
            title={wasExpired ? "Платёж действительно получен?" : "Подтвердить получение платежа?"}
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
              }}>Да, платёж получен</Btn>
            </>}
          >
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              {wasExpired
                ? <>Время оплаты на сумму <strong>{fmtMoney(o.amount, "RUB")}</strong> уже истекло. Вы уверены, что средства действительно поступили?</>
                : <>Подтвердите, что платёж на сумму <strong>{fmtMoney(o.amount, "RUB")}</strong> получен.</>}
              <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                Платёж будет вручную переведён в статус «Успешно — Manual», ваш рабочий лимит будет уменьшен на <strong style={{ color: "var(--ink)" }}>{fmtMoney(o.amount / ME.usdtRate, "USDT")}</strong>, и вы получите комиссию <strong style={{ color: "var(--ok)" }}>{fmtMoney((o.amount / ME.usdtRate) * 0.02, "USDT")}</strong>. Действие нельзя отменить.
              </div>
            </div>
          </Modal>
        );
      })()}

      {disputeFormId && (() => {
        const o = PAY_IN.find((x) => x.id === disputeFormId);
        if (!o) return null;
        const reasons = [
          "Платёж не поступил на счёт",
          "Сумма не совпадает с заявкой",
          "Дубликат платежа",
          "Платёж от третьего лица",
          "Другое",
        ];
        const submit = () => {
          const now = new Date();
          const pad = (n) => String(n).padStart(2, "0");
          const ts = `${pad(now.getDate())}.${pad(now.getMonth()+1)} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
          const dl = new Date(now.getTime() + 24 * 3600 * 1000);
          const deadline = `${pad(dl.getDate())}.${pad(dl.getMonth()+1)} ${pad(dl.getHours())}:${pad(dl.getMinutes())}`;
          const maxNum = DISPUTES.reduce((m, d) => Math.max(m, parseInt(String(d.id).replace(/\D/g, ""), 10) || 0), 0);
          const dispId = "DSP-" + (maxNum + 1);
          const dispute = {
            id: dispId,
            opened: ts,
            order: o.id,
            orderType: "PayIn",
            amount: o.amount,
            merchant: o.merchant,
            customer: "—",
            status: "waiting-admin",
            sla: "24ч 00м",
            deadline,
            reason: "Трейдер: " + disputeReason,
            chat: [{ from: "trader", ts, text: "Открыт спор по платежу " + o.id + ". Причина: " + disputeReason + "." }],
          };
          DISPUTES.unshift(dispute);
          setDisputedManual((m) => ({ ...m, [o.id]: dispId }));
          setDisputeFormId(null);
        };
        return (
          <Modal
            title="Открыть спор по платежу"
            onClose={() => setDisputeFormId(null)}
            footer={<>
              <Btn onClick={() => setDisputeFormId(null)}>Отмена</Btn>
              <span className="spacer" />
              <Btn variant="primary" onClick={submit}>Открыть спор</Btn>
            </>}
          >
            <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 14 }}>
              Платёж <strong className="mono">{o.id}</strong> на сумму <strong>{fmtMoney(o.amount, "RUB")}</strong> ({o.merchant}) будет переведён в статус «Спор», по нему будет создан связанный спор и передан саппорту.
            </div>
            <div className="field">
              <label className="field__label">Причина спора</label>
              <select className="field__input" value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)}>
                {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <Note tone="warn">После открытия спора платёж блокируется до резолюции саппорта.</Note>
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
  const [cancelById, setCancelById] = React.useState(null);  // payout id pending cancel confirmation
  const [cancelledManual, setCancelledManual] = React.useState({});  // id -> ts
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
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 110 }}>Статус</th>
              <th>Получатель</th>
              <th className="num">Сумма</th>
              <th className="num">Профит</th>
              <th>Создана</th>
              <th>Метод</th>
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
                <td><StatusPill map={PAY_OUT_STATUS} value={cancelledManual[o.id] ? "returned" : o.status} /></td>
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
                <td>
                  <div>{myPd ? METHOD_LABEL[myPd.method] || myPd.method : o.customerTarget && /^\+?\d/.test(o.customerTarget) ? METHOD_LABEL.sbp : METHOD_LABEL.card}</div>
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{bankName(o.customerBank)}</div>
                </td>
              </tr>);
            })}
          </tbody>
        </table>
        <div className="table-foot">Показано <strong>{visible.length}</strong> из <strong>{PAY_OUT.length}</strong></div>
      </div>

      {open && <PayOutDrawer order={open} onClose={() => setOpenId(null)} cancelled={!!cancelledManual[open.id]} onCancel={() => setCancelById(open.id)} />}

      {cancelById && (() => {
        const o = PAY_OUT.find((x) => x.id === cancelById);
        if (!o) return null;
        const usdt = o.amount / ME.usdtRate;
        return (
          <Modal
            title="Отменить выплату?"
            onClose={() => setCancelById(null)}
            footer={<>
              <Btn onClick={() => setCancelById(null)}>Назад</Btn>
              <span className="spacer" />
              <Btn variant="danger" onClick={() => {
                const now = new Date();
                const pad = (n) => String(n).padStart(2, "0");
                const ts = `${pad(now.getDate())}.${pad(now.getMonth()+1)} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
                setCancelledManual((m) => ({ ...m, [o.id]: ts }));
                setCancelById(null);
              }}>Отменить выплату</Btn>
            </>}
          >
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              Вы собираетесь отменить уже выполненную выплату <strong className="mono">{o.id}</strong> на сумму <strong>{fmtMoney(o.amount, "RUB")}</strong>.
            </div>
            <div style={{ marginTop: 12 }}>
              <Note tone="bad">
                Действие необратимо. С вашего рабочего счёта будет списано <strong>{fmtMoney(usdt, "USDT")}</strong>, а выплата вернётся в общий пул свободных заявок.
              </Note>
            </div>
          </Modal>
        );
      })()}
    </>);

}

function PayInDrawer({ order, onClose, received, onMarkReceived, disputed, disputeId, onOpenDispute }) {
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
      status={disputed ? "disputed" : (received ? "completed" : order.status)}
      statusMap={PAY_IN_STATUS}
      onClose={onClose}
      wide
      extraTags={disputed
        ? <span className="dispute-sla mono">⚠ {disputeId}</span>
        : received
        ? <span className="dispute-sla mono" style={{ color: "var(--ok)", background: "var(--ok-soft)" }}>✓ Manual</span>
        : (order.expiresAt && <span className="dispute-sla mono">⏱ {(String(order.expiresAt).match(/через\s+([^)]+)/) || [, order.expiresAt])[1]}</span>)}
      footer={(() => {
        const isSuccess = received || order.status === "completed";
        if (disputed) {
          return <span className="muted" style={{ fontSize: 13 }}>Спор <strong className="mono">{disputeId}</strong> открыт — ожидает саппорта</span>;
        }
        if (isSuccess) {
          return <>
            {received && <span className="muted" style={{ fontSize: 13 }}>Платёж переведён в «Успешно» вручную</span>}
            <span className="spacer" />
            <Btn variant="ghost" onClick={onOpenDispute}>Открыть спор</Btn>
          </>;
        }
        if (order.status === "waiting-payment") {
          return <><span className="spacer" /><Btn variant="ok" onClick={onMarkReceived}>Подтвердить вручную</Btn></>;
        }
        if (order.status === "expired") {
          return <><span className="spacer" /><Btn variant="ok" onClick={onMarkReceived}>Платёж получен</Btn></>;
        }
        return <span className="spacer" />;
      })()}
    >
      <Section title="Сводка">
        <KV items={[
          ["ID", <CopyId value={order.id} />],
          ["Сумма", <strong>{fmtMoney(order.amount, "RUB")}</strong>],
          ["Сумма (USDT)", <span className="mono">{fmtMoney(order.amount / ME.usdtRate, "USDT")}</span>],
          ["Курс обмена", <span className="mono">{ME.usdtRate.toFixed(2)} ₽/USDT</span>],
          ["Создана", <span className="mono">{order.date}</span>],
          ["Время до подтверждения", <span className="mono">{order.payTime} <span className="muted">({(() => {
            const m = /^(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})$/.exec(order.date || "");
            const t = /^(\d{1,2}):(\d{2})$/.exec(order.payTime || "");
            if (!m || !t) return "—";
            const d = new Date(2026, parseInt(m[2], 10) - 1, parseInt(m[1], 10), parseInt(m[3], 10), parseInt(m[4], 10));
            d.setMinutes(d.getMinutes() + parseInt(t[1], 10));
            d.setSeconds(parseInt(t[2], 10));
            const pad = (n) => String(n).padStart(2, "0");
            return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
          })()})</span></span>],
          ["Комиссия трейдера", <strong>{fmtMoney(order.commissionUsdt, "USDT")}</strong>],
        ]} />
      </Section>

      <Section title="Куда поступил платёж">
        <KV items={[
          ["Терминал", term
            ? <button type="button" style={linkStyle} onClick={() => setLinkOpen({ kind: "terminal", id: term.id })}>
                {term.name}
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

// Reusable drawer body for one terminal — used by both Terminals page and Платежи link
function TerminalDrawerBody({ open }) {
  const [smsPeriod, setSmsPeriod] = React.useState("all");
  const [smsBind, setSmsBind] = React.useState("all");
  const [viewSmsId, setViewSmsId] = React.useState(null);
  const [viewPdId, setViewPdId] = React.useState(null);
  const smsItems = SMS_LOG.filter((s) => s.terminal === open.id);
  const fullOf = (t) => {
    const m = String(t || "").match(/(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!m) return { v: 0, day: 0, mon: 0 };
    const day = +m[1], mon = +m[2], h = +m[3], mi = +m[4], s = +(m[5] || 0);
    return { v: ((mon * 31 + day) * 24 + h) * 3600 + mi * 60 + s, day, mon };
  };
  const smsRef = smsItems.reduce((best, s) => {
    const f = fullOf(s.time);
    return f.v > best.v ? f : best;
  }, { v: 0, day: 0, mon: 0 });
  const smsPeriodOptions = [
    { value: "all", label: "Всё время" },
    { value: "hour", label: "Час" },
    { value: "today", label: "Сегодня" },
    { value: "yesterday", label: "Вчера" },
    { value: "month", label: "Месяц" },
  ];
  const smsBindOptions = [
    { value: "all", label: "Все" },
    { value: "linked", label: "Привязанные" },
    { value: "unlinked", label: "Непривязанные" },
  ];
  const isLinked = (s) => !!(s.payment && s.details);
  const smsFiltered = smsItems.filter((s) => {
    if (smsBind === "linked" && !isLinked(s)) return false;
    if (smsBind === "unlinked" && isLinked(s)) return false;
    if (smsPeriod === "all") return true;
    const f = fullOf(s.time);
    if (smsPeriod === "hour") return f.v >= smsRef.v - 3600;
    if (smsPeriod === "today") return f.day === smsRef.day && f.mon === smsRef.mon;
    if (smsPeriod === "yesterday") return f.day === smsRef.day - 1 && f.mon === smsRef.mon;
    if (smsPeriod === "month") return f.mon === smsRef.mon;
    return true;
  });
  const viewSms = viewSmsId ? smsItems.find((s) => s.id === viewSmsId) : null;
  const viewPd = viewPdId ? PAYMENT_DETAILS.find((p) => p.id === viewPdId) : null;
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
          ["ID", <span className="mono">{open.id}</span>],
        ]} />
      </Section>

      <Section
        title={"SMS (" + smsFiltered.length + ")"}
        action={smsItems.length > 0 ? (
          <div style={{ display: "flex", gap: 8 }}>
            <ChipSelect value={smsBind} onChange={setSmsBind} options={smsBindOptions} />
            <ChipSelect value={smsPeriod} onChange={setSmsPeriod} options={smsPeriodOptions} />
          </div>
        ) : null}
      >
        {smsItems.length === 0 ? <Empty>Сообщений пока нет</Empty> :
          smsFiltered.length === 0 ? <Empty>Нет сообщений по выбранным фильтрам</Empty> :
          <table className="table table--inset">
            <thead><tr><th>Время</th><th>Текст</th><th>Платёж</th></tr></thead>
            <tbody>
              {smsFiltered.map((s) =>
                <tr key={s.id} onClick={() => setViewSmsId(s.id)} style={!s.parsed ? { background: "var(--bad-soft)" } : null}>
                  <td className="mono" style={{ whiteSpace: "nowrap" }}>{(s.time.split(" ")[1] || s.time)}</td>
                  <td>
                    <div className={"sms-msg" + (s.parsed ? "" : " sms-msg--unparsed")}>{s.message}</div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {s.payment
                      ? <CopyId value={s.payment} short />
                      : <span className="sms-link-empty">—</span>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        }
      </Section>

      <Section title={"Привязанные реквизиты (" + PAYMENT_DETAILS.filter((p) => p.terminal === open.id).length + ")"}>
        <table className="table table--inset">
          <thead><tr><th>Статус</th><th>Метод</th><th>Реквизит</th><th>Банк</th></tr></thead>
          <tbody>
            {PAYMENT_DETAILS.filter((p) => p.terminal === open.id).map((p) =>
              <tr key={p.id} onClick={() => setViewPdId(p.id)}>
                <td><StatusPill map={PD_STATUS} value={p.status} /></td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(p.methods || [p.method]).map((m) => (
                      <span key={m} className={"pd-card__method pd-card__method--" + m}>
                        {m === "sbp" ? "СБП" : m === "card" ? "Карта" : m === "c2c" ? "C2C" : m === "phone" ? "Phone" : m === "account" ? "Счёт" : m}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="mono">{p.target}</td>
                <td>{bankName(p.bank)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>

      {viewSms && <SmsDrawer row={viewSms} onClose={() => setViewSmsId(null)} onBind={() => setViewSmsId(null)} />}
      {viewPd && <LinkedPdDrawer pd={viewPd} onClose={() => setViewPdId(null)} />}
    </>
  );
}

// Reusable drawer body for one payment detail — used by both PD page and Платежи link
function PdDrawerBody({ open }) {
  const [tab, setTab] = React.useState("overview");
  const [payId, setPayId] = React.useState(null);
  const [payFilter, setPayFilter] = React.useState("all");
  const [period, setPeriod] = React.useState("all");
  const [vipPeriod, setVipPeriod] = React.useState("all");
  const [unboundVip, setUnboundVip] = React.useState([]);
  const payRow = payId ? PAY_IN.find((o) => o.id === payId) : null;
  const payCat = (st) => {
    if (["created", "matching", "waiting-payment"].includes(st)) return "inwork";
    if (st === "completed") return "ok";
    return "failed";
  };
  const pdPayments = PAY_IN.filter((o) => o.details === open.id);

  // Фильтр по времени (демо: все заявки на одной дате — «Час» по времени, «Вчера» пусто)
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
          ...(open.vip ? [{ id: "vip", label: `VIP (${(open.vipClients || []).length})` }] : []),
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "overview" && <>
      {(() => {
        const av = pdAvailability(open);
        return (
          <Section title="Доступность в каскаде">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span className={"pd-avail-pill pd-avail-pill--" + (av.available ? "ok" : "bad")}>
                <span className="pd-avail-dot" />
                {av.available ? "Доступен" : "Недоступен"}
              </span>
              {av.available ? (
                <span className="muted" style={{ fontSize: 13 }}>Реквизит участвует в подборе (каскаде)</span>
              ) : (
                <span style={{ fontSize: 13, color: "var(--bad)" }}>{av.reasons.join(" · ")}</span>
              )}
            </div>
          </Section>
        );
      })()}

      <Section title="Реквизит">
        <KV items={[
          ["Название", <strong>{open.label || "—"}</strong>],
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
          ["ID", <span className="mono">{open.id}</span>],
          ...(open.vip ? [["VIP-реквизит", <><Pill tone="ok">Да</Pill> <span className="muted" style={{ marginLeft: 6 }}>· слотов: <strong>{open.vipSlots || 1}</strong></span></>]] : []),
        ]} />
      </Section>

      <Section title="Лимиты">
        <KV items={[
          ["Дневной лимит", <><strong>{Math.round(open.dailyUsed * 100)}%</strong> <span className="muted">({fmtMoney(open.todayVolumeRub, "RUB")} / {fmtMoney(open.dailyLimit, "RUB")})</span></>],
          ["Месячный лимит", <><strong>{Math.round(open.monthlyUsed * 100)}%</strong> <span className="muted">({fmtMoney(open.monthVolumeRub, "RUB")} / {fmtMoney(open.monthlyLimit, "RUB")})</span></>],
          ["Операций сегодня", <>{open.opsToday} / {open.opsLimit}</>],
          ["Успешность", <strong>{Math.round(open.success * 100)}%</strong>],
          ["Мин. сумма заявки", fmtMoney(open.minAmount, "RUB")],
          ["Макс. сумма заявки", fmtMoney(open.maxAmount, "RUB")],
          ["Задержка между платежами", <span className="mono">{open.paymentDelaySec ? open.paymentDelaySec >= 60 ? Math.floor(open.paymentDelaySec / 60) + " мин" + (open.paymentDelaySec % 60 ? " " + open.paymentDelaySec % 60 + " сек" : "") : open.paymentDelaySec + " сек" : "—"}</span>],
        ]} />
      </Section>
      </>}

      {tab === "payments" && <>
      <div className="pd-pay-filters" style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 8, marginBottom: 14 }}>
        <ChipSelect value={payFilter} onChange={setPayFilter} options={statusFilters} align="left" />
        <ChipSelect value={period} onChange={setPeriod} options={PERIOD_CHIPS} align="left" />
      </div>
      <Section title={"Платежи по реквизиту"}>
        {pdPayments.length === 0 ? <Empty>Платежей нет</Empty> :
          pdPaymentsShown.length === 0 ? <Empty>Нет платежей по фильтру</Empty> :
          <table className="table table--inset">
            <thead><tr><th>Статус</th><th className="num">Сумма</th><th>Создана</th></tr></thead>
            <tbody>
              {pdPaymentsShown.map((o) =>
                <tr key={o.id} onClick={() => setPayId(o.id)}>
                  <td><TraderPayStatusCell order={o} ok={o.status === "completed"} kind={o.closedBy || ((o.source === "SMS" || o.source === "Push") ? "auto" : "manual")} disputed={o.status === "disputed" || !!o.dispute} /></td>
                  <td className="num">{fmtMoney(o.amount, "RUB")}</td>
                  <td className="mono">{o.date}</td>
                </tr>
              )}
            </tbody>
          </table>
        }
      </Section>
      </>}

      {tab === "vip" && (() => {
        const clients = (open.vipClients || []).filter((c) => !unboundVip.includes(c.id));
        const toMinV = (ts) => { const x = /(\d{2}):(\d{2})/.exec(ts || ""); return x ? (+x[1]) * 60 + (+x[2]) : 0; };
        const latestV = clients.reduce((mx, c) => Math.max(mx, ...c.payments.map((p) => toMinV(p.date)), 0), 0);
        const inV = (p) => vipPeriod === "yesterday" ? false : vipPeriod === "hour" ? toMinV(p.date) >= latestV - 60 : true;
        const freeSlots = Math.max(0, (open.vipSlots || 0) - clients.length);
        const rows = clients.map((c) => {
          const ps = c.payments.filter(inV);
          const ok = ps.filter((p) => p.status === "completed" || p.status === "auto-confirmed").length;
          return {
            id: c.id, name: c.name,
            turnover: ps.reduce((s, p) => s + p.amount, 0),
            count: ps.length,
            conv: ps.length ? Math.round(ok / ps.length * 100) : 0,
            last: ps.length ? ps.map((p) => p.date).sort().slice(-1)[0] : null,
          };
        });
        return (
          <>
            <div className="pd-pay-filters" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span className="muted" style={{ fontSize: 13 }}>Свободные слоты</span>
                <span className="mono" style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 999, fontSize: 12.5, background: freeSlots > 0 ? "var(--ok-soft)" : "var(--paper-3)", color: freeSlots > 0 ? "var(--ok)" : "var(--ink-3)", whiteSpace: "nowrap" }}>{freeSlots} / {open.vipSlots || 0}</span>
              </span>
              <div style={{ marginLeft: "auto" }}>
                <ChipSelect value={vipPeriod} onChange={setVipPeriod} options={PERIOD_CHIPS} />
              </div>
            </div>
            <Section title={`VIP-клиенты (${clients.length})`}>
              {clients.length === 0 ? <Empty>VIP-клиенты не привязаны</Empty> :
                <table className="table table--inset">
                  <thead><tr><th>Имя</th><th className="num">Оборот · платежи</th><th className="num">Конверсия</th><th>Последний платёж</th><th></th></tr></thead>
                  <tbody>
                    {rows.map((r) =>
                      <tr key={r.id}>
                        <td>
                          <strong>{r.name}</strong>
                          <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>{r.id}</div>
                        </td>
                        <td className="num">
                          {fmtMoney(r.turnover, "RUB")}
                          <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{r.count} платежей</div>
                        </td>
                        <td className="num"><strong>{r.conv}%</strong></td>
                        <td className="mono">{r.last || <span className="muted">—</span>}</td>
                        <td style={{ textAlign: "right" }}>
                          <Btn variant="ghost" size="sm" onClick={() => setUnboundVip((prev) => [...prev, r.id])}>Отвязать</Btn>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              }
            </Section>
          </>
        );
      })()}

      {payRow && (
        <div style={{ position: "relative", zIndex: 40 }}>
          <PayInDrawer order={payRow} onClose={() => setPayId(null)} onMarkReceived={() => {}} onOpenDispute={() => {}} />
        </div>
      )}
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
    <StackedDrawer title="Терминал" status={term.status} statusMap={TERMINAL_STATUS} onClose={onClose} wide>
      <TerminalDrawerBody open={term} />
    </StackedDrawer>
  );
}

function LinkedPdDrawer({ pd, onClose }) {
  return (
    <StackedDrawer title="Реквизит" status={pd.status} statusMap={PD_STATUS} onClose={onClose} wide>
      <PdDrawerBody open={pd} />
    </StackedDrawer>
  );
}

function PayOutDrawer({ order, onClose, cancelled, onCancel }) {
  const isFree = order.status === "free";
  const isMine = order.takenBy === ME.id;
  const inWork = isMine && order.status === "in-progress";
  const waitingReview = isMine && order.status === "waiting-review";
  const targetDigits = (order.customerTarget || "").replace(/\D/g, "");
  const method = order.method || (targetDigits.length >= 16 ? "card" : targetDigits.length >= 11 ? "phone" : "sbp");
  const methodLabel = method === "sbp" ? "СБП" : method === "card" ? "Карта (по номеру)" : method === "phone" ? "СБП · по номеру телефона" : method === "c2c" ? "Card-to-Card" : method === "account" ? "По расчётному счёту" : method;

  return (
    <Drawer
      title="Выплата"
      status={cancelled ? "returned" : order.status}
      statusMap={PAY_OUT_STATUS}
      onClose={onClose}
      wide
      extraTags={(isFree || inWork) && <span className="dispute-sla mono">⏱ {order.deadlineMin} мин</span>}
      footer={
      cancelled ?
      <span className="muted" style={{ fontSize: 13 }}>Выплата отменена и возвращена в пул</span> :
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
            <span className="spacer" />
            <Btn variant="ghost" disabled>Ждём проверки саппорта</Btn>
          </> :

      order.status === "completed" ?
      <>
            <span className="spacer" />
            <Btn variant="danger" onClick={onCancel}>Отменить выплату</Btn>
          </> :

      <>
            <span className="spacer" />
          </>

      }>
      
      <Section title="Куда платить">
        <KV items={[
        ["Сумма к переводу", <strong>{fmtMoney(order.amount, "RUB")}</strong>],
        ["Метод платежа", <span className={"pd-card__method pd-card__method--" + method}>{methodLabel}</span>],
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
        ["Сумма", <span className="mono">{fmtMoney(order.amount / ME.usdtRate, "USDT")}</span>],
        ["Курс обмена", <span className="mono">1 USDT = {ME.usdtRate.toFixed(2)} ₽</span>],
        ["Тариф Выплаты", "2.0%"],
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

    </Drawer>);

}

// ─── TERMINALS ───────────────────────────────────────────────────────────
// Heartbeat терминала: по websocket приходит «terminal heartbeat registered» —
// в демо таймер раз в 30 с (со сдвигом на терминал); волна по контуру online-бейджа.
function TermHeartbeat({ termId, children }) {
  const [beat, setBeat] = React.useState(false);
  React.useEffect(() => {
    let h = 0; for (const c of String(termId)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    let t1, iv;
    const fire = () => { setBeat(true); t1 = setTimeout(() => setBeat(false), 1100); };
    const start = setTimeout(() => { fire(); iv = setInterval(fire, 30000); }, 1200 + (h % 9000));
    return () => { clearTimeout(start); clearTimeout(t1); clearInterval(iv); };
  }, [termId]);
  return (
    <span className={"hb-badge" + (beat ? " is-beat" : "")} title="Heartbeat терминала — сигнал раз в 30 с">{children}</span>
  );
}

function TraderTerminals() {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [editId, setEditId] = React.useState(null);
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
        <Btn variant="primary" size="sm" style={{ borderRadius: 999, padding: "6px 14px", fontSize: 13, marginLeft: "auto" }} onClick={() => setShowAdd(true)}>Привязать терминал</Btn>
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
                  <div className="term-card__name">{t.name}</div>
                  <div className="term-card__sim">{t.phone}</div>
                </div>
                <div className="term-card__head-r">
                  {isOffline
                    ? <StatusPill map={TERMINAL_STATUS} value={t.status} />
                    : <TermHeartbeat termId={t.id}><StatusPill map={TERMINAL_STATUS} value={t.status} /></TermHeartbeat>}
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
        status={open.status}
        statusMap={TERMINAL_STATUS}
        onClose={() => setOpenId(null)}
        wide
        footer={<>
            <Btn variant="ghost" onClick={() => setEditId(open.id)}>Изменить</Btn>
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
      {editId && <EditTerminalModal term={TERMINALS.find((t) => t.id === editId)} onClose={() => setEditId(null)} />}
    </>);

}

// ─── PAYMENT DETAILS ─────────────────────────────────────────────────────
function TraderPaymentDetails() {
  const [filter, setFilter] = React.useState("all");
  const [vipFilter, setVipFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [editId, setEditId] = React.useState(null);
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

  const VIP_OPTIONS = [
  { value: "all", label: "Все реквизиты" },
  { value: "vip", label: "Только VIP" },
  { value: "not-vip", label: "Не VIP" }];

  const visible = PAYMENT_DETAILS.filter((p) => {
    const statusOk = displayed === "all" ? true : displayed === "offline" ? OFFLINE_STATUSES.includes(p.status) : p.status === displayed;
    const vipOk = vipFilter === "all" ? true : vipFilter === "vip" ? !!p.vip : !p.vip;
    return statusOk && vipOk;
  });
  const open = PAYMENT_DETAILS.find((p) => p.id === openId);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters} align="left" />
        <ChipSelect value={vipFilter} onChange={setVipFilter} options={VIP_OPTIONS} align="left" />
        <Btn variant="primary" size="sm" style={{ borderRadius: 999, padding: "6px 14px", fontSize: 13, marginLeft: "auto" }} onClick={() => setShowAdd(true)}>Добавить реквизит</Btn>
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
                  <div className="pd-card__id">{p.label || p.id}</div>
                  <div className="pd-card__target">{p.target}</div>
                  <div className="pd-card__sub">
                    <span>{bankName(p.bank)}</span>
                    <span className="pd-card__sub-sep" />
                    <span>{p.holder}</span>
                  </div>
                </div>
                <div className="pd-card__head-r">
                  <div className="pd-card__methods">
                    {p.vip && (
                      <span className="pd-card__method pd-card__method--vip" title={"VIP-реквизит · слотов: " + (p.vipSlots || 1)}>★ VIP</span>
                    )}
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
                  return <span>{term ? term.name : p.terminal}</span>;
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
        status={open.status}
        statusMap={PD_STATUS}
        onClose={() => setOpenId(null)}
        wide
        extraTags={open.cooldown && <span className="dispute-sla mono">cooldown {Math.floor(open.cooldown.remainingSec / 60)}:{String(open.cooldown.remainingSec % 60).padStart(2, "0")} после {open.cooldown.after}</span>}
        footer={<>
            <Btn variant="ghost" onClick={() => setEditId(open.id)}>Изменить</Btn>
            <span className="spacer" />
            {open.status === "active" ?
          <Btn variant="danger">Отключить</Btn> :
          <Btn variant="ok">Включить</Btn>}
          </>}>
        
          <PdDrawerBody open={open} />
        </Drawer>
      }

      {showAdd && <AddPdModal onClose={() => setShowAdd(false)} />}
      {editId && <EditPdModal pd={PAYMENT_DETAILS.find((p) => p.id === editId)} onClose={() => setEditId(null)} />}
    </>);

}

function AddPdModal({ onClose }) {
  const ALL_METHODS = [
    { value: "sbp",     label: "СБП" },
    { value: "card",    label: "Карта" },
  ];
  const [methods, setMethods] = React.useState(["sbp", "card"]);
  const [vip, setVip] = React.useState(false);
  const [vipSlots, setVipSlots] = React.useState("1");
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 14px" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
          <input type="checkbox" checked={vip} onChange={(e) => setVip(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--accent)", cursor: "pointer", flexShrink: 0 }} />
          <span style={{ fontWeight: 600 }}>VIP-реквизит</span>
        </label>
        {vip && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <span className="muted" style={{ fontSize: 12.5 }}>Слотов</span>
            <input type="number" min="1" value={vipSlots} onChange={(e) => setVipSlots(e.target.value)} className="field__input" style={{ width: 72, fontFamily: "var(--font-mono)", fontSize: 13, padding: "6px 8px", textAlign: "right" }} />
          </span>
        )}
      </div>
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
  Bar, MoneyBig, PayOutDrawer, PayInDrawer, LinkedPdDrawer
});

function EditTerminalModal({ term, onClose }) {
  if (!term) return null;
  return (
    <Modal
      title="Редактирование терминала"
      onClose={onClose}
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <Btn variant="primary" onClick={onClose}>Сохранить</Btn>
      </>}
    >
      <Field label="Название устройства" hint="Чтобы отличать в списке">
        <TextInput defaultValue={term.name} placeholder="Напр. «Pixel 7 — Москва»" />
      </Field>
      <Field label="Заметка">
        <TextInput defaultValue={term.notes || ""} placeholder="—" />
      </Field>
    </Modal>
  );
}

function EditPdModal({ pd, onClose }) {
  if (!pd) return null;
  const ALL_METHODS = [
    { value: "sbp",     label: "СБП" },
    { value: "card",    label: "Карта" },
  ];
  const [methods, setMethods] = React.useState(pd.methods || (pd.method ? [pd.method] : []));
  const [vip, setVip] = React.useState(!!pd.vip);
  const [vipSlots, setVipSlots] = React.useState(String(pd.vipSlots || 1));
  const toggle = (v) => setMethods((m) => m.includes(v) ? m.filter((x) => x !== v) : [...m, v]);

  return (
    <Modal
      title="Редактирование реквизита"
      onClose={onClose}
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <Btn variant="primary" onClick={onClose} disabled={methods.length === 0}>Сохранить</Btn>
      </>}
    >
      <Field label="Название реквизита">
        <TextInput defaultValue={pd.label || ""} placeholder="Например: Тинькофф · Алексей · основной" />
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 14px" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
          <input type="checkbox" checked={vip} onChange={(e) => setVip(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--accent)", cursor: "pointer", flexShrink: 0 }} />
          <span style={{ fontWeight: 600 }}>VIP-реквизит</span>
        </label>
        {vip && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <span className="muted" style={{ fontSize: 12.5 }}>Слотов</span>
            <input type="number" min="1" value={vipSlots} onChange={(e) => setVipSlots(e.target.value)} className="field__input" style={{ width: 72, fontFamily: "var(--font-mono)", fontSize: 13, padding: "6px 8px", textAlign: "right" }} />
          </span>
        )}
      </div>
      <div className="row-2">
        <Field label="Банк">
          <Select value={pd.bank} options={BANKS.map((b) => ({ value: b.id, label: b.name }))} disabled />
        </Field>
        <Field label="Держатель">
          <TextInput defaultValue={pd.holder || ""} disabled />
        </Field>
      </div>

      <Field label="Терминал">
        <Select value={pd.terminal} options={TERMINALS.filter((t) => t.status === "online").map((t) => ({ value: t.id, label: t.id + " · " + t.name }))} disabled />
      </Field>

      <Section title="Реквизиты">
        <Field label="Телефон (СБП)">
          <TextInput defaultValue={(pd.methods || [pd.method]).includes("sbp") ? pd.target : ""} placeholder="+7 ___ ___-__-__" mono disabled />
        </Field>
        <Field label="Номер карты">
          <TextInput defaultValue={(pd.methods || [pd.method]).includes("card") ? pd.target : ""} placeholder="•••• •••• •••• ____" mono disabled />
        </Field>
      </Section>

      <div className="row-2">
        <Field label="Дневной лимит, ₽"><TextInput defaultValue={pd.dailyLimit} /></Field>
        <Field label="Месячный лимит, ₽"><TextInput defaultValue={pd.monthlyLimit} /></Field>
      </div>
      <div className="row-2">
        <Field label="Мин. сумма, ₽"><TextInput defaultValue={pd.minAmount} /></Field>
        <Field label="Макс. сумма, ₽"><TextInput defaultValue={pd.maxAmount} /></Field>
      </div>
      <Field label="Лимит операций / день"><TextInput defaultValue={pd.opsLimit} /></Field>
    </Modal>
  );
}