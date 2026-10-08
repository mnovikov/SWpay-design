// CrowdPay Team Lead — sections (reuses admin data.jsx)
// Команда «Альфа»: TR-1042 (lead), TR-1058

const LEAD_TEAM_NAME = "Альфа";
const LEAD_TRADERS = TRADERS.filter((t) => t.team === LEAD_TEAM_NAME);
const LEAD_TRADER_IDS = LEAD_TRADERS.map((t) => t.id);
const LEAD = (() => {
  const leadTrader = LEAD_TRADERS.find((t) => t.id === "TR-1042") || LEAD_TRADERS[0];
  const todayPayIn = LEAD_TRADERS.reduce((s, t) => s + ((t.today && t.today.payInRub) || 0), 0);
  const todayPayOut = LEAD_TRADERS.reduce((s, t) => s + ((t.today && t.today.payOutRub) || 0), 0);
  const activeCount = LEAD_TRADERS.filter((t) => t.status === "active").length;
  return {
    team: LEAD_TEAM_NAME,
    name: leadTrader.name,
    login: leadTrader.login,
    initials: leadTrader.name.split(" ").map((w) => w[0]).join("").slice(0, 2),
    id: leadTrader.id,
    email: leadTrader.email,
    phone: leadTrader.phone,
    registered: leadTrader.registered,
    todayPayIn, todayPayOut,
    activeCount, totalCount: LEAD_TRADERS.length,
  };
})();

const LEAD_PAY_IN  = PAY_IN.filter((o) => LEAD_TRADER_IDS.includes(o.trader));
const LEAD_PAY_OUT = PAY_OUT.filter((o) => o.trader && LEAD_TRADER_IDS.includes(o.trader)).concat(
                     PAY_OUT.filter((o) => !o.trader)); // свободные тоже видим
const LEAD_TERMINALS = TERMINALS.filter((t) => LEAD_TRADER_IDS.includes(t.trader));
const LEAD_PD = PAYMENT_DETAILS.filter((p) => LEAD_TRADER_IDS.includes(p.trader));
const LEAD_DISPUTES = DISPUTES.filter((d) => LEAD_TRADER_IDS.includes(d.trader));

const LEAD_SMS_LOG = [
  { id: "SM-2401", terminal: "TM-1042-A", source: "900",         time: "27.04 14:22:14", bank: "B-A", details: "PD-9001", payment: "PI-83401", amount: 15000, parsed: true,
    message: "+15 000 ₽ Перевод от ИВАНОВ И. И. Баланс: 124 580 ₽; ··4423" },
  { id: "SM-2402", terminal: "TM-1042-A", source: "ru.alfabank", time: "27.04 14:18:03", bank: "B-A", details: "PD-9001", payment: "PI-83402", amount: 8500,  parsed: true,
    message: "+8 500 ₽. Поступление СБП. Остаток: 116 080 ₽; ··4423" },
  { id: "SM-2403", terminal: "TM-1042-B", source: "mts",         time: "27.04 14:10:51", bank: "B-A", details: "PD-9003", payment: "PI-83403", amount: 24000, parsed: true,
    message: "+24 000 ₽ Зачисление. Карта ··4423. Доступно: 107 580 ₽" },
  { id: "SM-2404", terminal: "TM-1058-A", source: "ru.alfabank", time: "27.04 14:00:33", bank: "B-A", details: null,        payment: null,        amount: 6000,  parsed: true,
    message: "+6 000 ₽. Поступление: Остаток: 62 300 ₽; ··7711" },
  { id: "SM-2405", terminal: "TM-1058-B", source: "beeline",     time: "27.04 13:58:11", bank: "B-B", details: "PD-9013", payment: "PI-83392", amount: 5200,  parsed: true,
    message: "+5 200 ₽ Перевод СБП от ПЕТРОВ А. А. Остаток: 51 280 ₽; ··8821" },
  { id: "SM-2406", terminal: "TM-1061-A", source: "900",         time: "27.04 13:51:11", bank: "B-A", details: "PD-9021", payment: null,        amount: 5000,  parsed: true,
    message: "+5 000 ₽. Поступление: Остаток: 5 106 ₽; ··3374" },
  { id: "SM-2407", terminal: "TM-1061-B", source: "ru.alfabank", time: "27.04 13:44:58", bank: "B-B", details: "PD-9023", payment: "PI-83393", amount: 89200, parsed: true,
    message: "+89 200 ₽ СБП. Остаток: 215 280 ₽; ··8821" },
  { id: "SM-2408", terminal: "TM-1077-A", source: "mts",         time: "27.04 13:31:02", bank: "B-A", details: "PD-9041", payment: "PI-83391", amount: 3200,  parsed: true,
    message: "+3 200 ₽ Зачисление по карте ··4423. Доступно: 18 200 ₽" },
  { id: "SM-2409", terminal: "TM-1077-B", source: "beeline",     time: "27.04 13:14:40", bank: "B-B", details: "PD-9043", payment: "PI-83390", amount: 51000, parsed: true,
    message: "+51 000 ₽ Перевод СБП. Остаток: 209 280 ₽; ··4423" },
  { id: "SM-2410", terminal: "TM-1058-A", source: "ru.alfabank", time: "27.04 12:50:22", bank: "B-A", details: null,        payment: null,        amount: 6700,  parsed: true,
    message: "+6 700 ₽. Поступление: Остаток: 18 050 ₽; ··2210" },
  { id: "SM-2411", terminal: "TM-1042-C", source: "mts",         time: "27.04 11:48:33", bank: "B-A", details: null,        payment: null,        amount: null,  parsed: false,
    message: "Уведомление об операции. Подробности в приложении банка." },
  { id: "SM-2412", terminal: "TM-1061-D", source: "900",         time: "27.04 11:32:18", bank: "B-A", details: "PD-9025", payment: "PI-83388", amount: 2100,  parsed: true,
    message: "+2 100 ₽ Перевод от АНТОНОВ С. Остаток: 158 280 ₽; ··4423" },
];

const SMS_SOURCE = {
  "mts":         { label: "МТС",          tone: "mts" },
  "beeline":     { label: "Билайн",       tone: "beeline" },
  "900":         { label: "900 · Сбер",   tone: "sber" },
  "ru.alfabank": { label: "ru.alfabank",  tone: "alfa" },
};

const LEAD_NAV = [
  { id: "dashboard", label: "Главная",      icon: "◐", count: 0 },
  { id: "team",      label: "Трейдеры",   icon: "◉", count: LEAD_TRADERS.length },
  { id: "finance",   label: "Финансы",     icon: "₽", count: 0 },
  { id: "payin",     label: "Платежи",    icon: "↘", count: LEAD_PAY_IN.length },
  { id: "payout",    label: "Выплаты",    icon: "↗", count: LEAD_PAY_OUT.filter((o) => ["free","in-progress","waiting-review"].includes(o.status)).length },
  { id: "terminals", label: "Терминалы",  icon: "▣", count: LEAD_TERMINALS.filter((t) => t.status === "online").length },
  { id: "details",   label: "Реквизиты",  icon: "≡", count: LEAD_PD.filter((p) => p.status === "active").length },
  { id: "disputes",  label: "Споры",      icon: "✕", count: LEAD_DISPUTES.filter((d) => ["open","waiting-trader","waiting-admin"].includes(d.status)).length },
  { id: "tariff",    label: "Тариф",       icon: "%", count: 0 },
  { id: "profile",   label: "Настройки", icon: "◉", count: 0 },
];

const LEAD_NAV_GROUPS = [
  { label: "",         ids: ["dashboard", "team"] },
  { label: "Операции", ids: ["payin", "payout", "disputes", "finance"] },
  { label: "Инфра",    ids: ["terminals", "details"] },
  { label: "Аккаунт", ids: ["tariff", "profile"] },
];

// Helper renderers
function TraderCell({ id }) {
  const t = LEAD_TRADERS.find((x) => x.id === id) || TRADERS.find((x) => x.id === id);
  if (!t) return <span className="muted">—</span>;
  return (
    <>
      <div>{t.name}</div>
      <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{t.id}</div>
    </>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────
function LeadDashboard({ go }) {
  const sumIn = LEAD_TRADERS.reduce((s,t) => s + ((t.today?.payInRub)||0), 0);
  const sumOut = LEAD_TRADERS.reduce((s,t) => s + ((t.today?.payOutRub)||0), 0);
  const sumCom = LEAD_TRADERS.reduce((s,t) => s + ((t.today?.commissionUsdt)||0), 0);

  const rate = (typeof ME !== "undefined" && ME.usdtRate) ? ME.usdtRate : 92.4;

  const [period, setPeriod] = React.useState("today");
  const PERIODS = {
    "hour":      { label: "Час",     title: "за час",      k: 0.07 },
    "today":     { label: "Сегодня", title: "сегодня",     k: 1 },
    "yesterday": { label: "Вчера",   title: "вчера",       k: 0.92 },
    "month":     { label: "Месяц",   title: "за месяц",    k: 22.4 },
    "all":       { label: "Всё",     title: "за всё время", k: 184.6 },
  };
  const p = PERIODS[period];
  const periodChips = Object.keys(PERIODS).map((id) => ({ value: id, label: PERIODS[id].label }));

  const payInRub  = Math.round(sumIn  * p.k);
  const payOutRub = Math.round(sumOut * p.k);
  const profitInUsdt  = (payInRub  / rate) * 0.065;
  const profitOutUsdt = (payOutRub / rate) * 0.035;
  const profitTotal   = profitInUsdt + profitOutUsdt;

  return (
    <>
      <FilterChips filters={periodChips} value={period} onChange={setPeriod} />

      <div className="hero-grid hero-grid--2">
        <div className="hero-card is-clickable" onClick={() => go && go("payin")} role="button" tabIndex={0}>
          <div className="hero-card__label">Платежи {p.title}</div>
          <div className="hero-card__value">{(payInRub / rate).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} <span className="ccy">USDT</span></div>
          <div className="hero-card__sub">{fmtMoney(payInRub, "RUB")} · профит <b>{fmtMoney(profitInUsdt, "USDT")}</b></div>
        </div>
        <div className="hero-card is-clickable" onClick={() => go && go("payout")} role="button" tabIndex={0}>
          <div className="hero-card__label">Выплаты {p.title}</div>
          <div className="hero-card__value">{(payOutRub / rate).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} <span className="ccy">USDT</span></div>
          <div className="hero-card__sub">{fmtMoney(payOutRub, "RUB")} · профит <b>{fmtMoney(profitOutUsdt, "USDT")}</b></div>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat stat--clickable" onClick={() => go && go("payin")} role="button" tabIndex={0}>
          <div className="stat__label">Профит {p.title}</div>
          <div className="stat__value">{fmtMoney(profitTotal, "USDT")}</div>
          <div className="stat__delta"><span className="mono" style={{ color: "var(--ink-3)" }}>↓</span> <b style={{ fontWeight: 700, color: "var(--ink)" }}>{fmtMoney(profitInUsdt, "USDT")}</b> · <span className="mono" style={{ color: "var(--ink-3)" }}>↑</span> <b style={{ fontWeight: 700, color: "var(--ink)" }}>{fmtMoney(profitOutUsdt, "USDT")}</b></div>
        </div>
        <div className="stat stat--clickable" onClick={() => go && go("team")} role="button" tabIndex={0}>
          <div className="stat__label">Активные трейдеры</div>
          <div className="stat__value">{LEAD.activeCount} / {LEAD.totalCount}</div>
          <div className="stat__delta">{LEAD_TRADERS.filter((t) => t.status === "suspended").length} приостановлено</div>
        </div>
        <div className="stat stat--clickable" onClick={() => go && go("terminals")} role="button" tabIndex={0}>
          <div className="stat__label">Терминалы online</div>
          <div className="stat__value">{LEAD_TERMINALS.filter((t) => t.status === "online").length} / {LEAD_TERMINALS.length}</div>
          <div className="stat__delta">{LEAD_TERMINALS.filter((t) => t.status === "offline").length} offline</div>
        </div>
        <div className="stat stat--clickable" onClick={() => go && go("disputes")} role="button" tabIndex={0}>
          <div className="stat__label">Открытые споры</div>
          <div className="stat__value">{LEAD_DISPUTES.filter((d) => ["open","waiting-trader","waiting-admin"].includes(d.status)).length}</div>
          <div className="stat__delta">всего за период: {LEAD_DISPUTES.length}</div>
        </div>
      </div>
    </>
  );
}

// ─── TEAM (Трейдеры) ────────────────────────────────────────────────────
// ─── FINANCE ─────────────────────────────────────────
const LEAD_TEAM_DEPOSITS = DEPOSITS.filter((d) => LEAD_TRADER_IDS.includes(d.trader));
const LEAD_TEAM_BALANCES = {
  workingUsdt:   LEAD_TEAM_DEPOSITS.reduce((s, d) => s + d.workingUsdt, 0),
  lockedUsdt:    LEAD_TEAM_DEPOSITS.reduce((s, d) => s + d.workingLockedUsdt, 0),
  insuranceUsdt: LEAD_TEAM_DEPOSITS.reduce((s, d) => s + d.insuranceUsdt, 0),
};

const LEAD_LEDGER = (() => {
  const items = [];
  const rate = (typeof ME !== "undefined" && ME.usdtRate) ? ME.usdtRate : 92.4;

  DEPOSIT_HISTORY
    .filter((h) => LEAD_TRADER_IDS.includes(h.trader))
    .forEach((h) => {
      let type;
      let amt = h.amountUsdt;
      if      (h.direction === "deposit")  { type = "topup";    amt = +Math.abs(amt); }
      else if (h.direction === "fine")     { type = "fine";     amt = -Math.abs(amt); }
      else if (h.direction === "lock")     { type = "freeze";   amt = -Math.abs(amt); }
      else if (h.direction === "release")  { type = "release";  amt = +Math.abs(amt); }
      else if (h.direction === "withdraw") { type = "withdraw"; amt = -Math.abs(amt); }
      else { type = "topup"; }
      items.push({
        id: h.id, ts: h.ts, account: h.kind, type,
        orderId: h.ref && h.ref.match(/^(PI|PO|DSP)-/) ? h.ref : null,
        amountUsdt: amt, trader: h.trader, note: h.note,
      });
    });

  LEAD_PAY_IN
    .filter((o) => o.status === "completed" && o.trader)
    .forEach((o) => {
      const fee = (o.amount / rate) * 0.02;
      items.push({
        id: "L-" + o.id, ts: o.date || "—", account: "working", type: "commission",
        orderId: o.id, amountUsdt: +fee, trader: o.trader, note: "Комиссия Платежи 2%",
      });
    });

  LEAD_PAY_OUT
    .filter((o) => o.status === "completed" && o.trader)
    .forEach((o) => {
      const fee = (o.amount / rate) * 0.018;
      items.push({
        id: "L-" + o.id, ts: o.date || "—", account: "working", type: "commission",
        orderId: o.id, amountUsdt: +fee, trader: o.trader, note: "Комиссия Выплаты 1.8%",
      });
    });

  items.sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));
  return items;
})();

// ─── WITHDRAW DRAWER ─────────────────────────────────────
const LEAD_WITHDRAW_NETWORK = "TRC-20";
const LEAD_WITHDRAW_MIN = 20;
const LEAD_WITHDRAW_FEE = 1.0;

const LEAD_WITHDRAW_STATUS = {
  sent:       { tone: "ok",      label: "Отправлено" },
  processing: { tone: "warn",    label: "В обработке" },
  manual:     { tone: "info",    label: "Ручная проверка" },
  rejected:   { tone: "bad",     label: "Отклонено" },
  cancelled:  { tone: "neutral", label: "Отменено" },
};

const LEAD_SAVED_WALLETS = [
  { label: "Личный Trust Wallet", address: "TJ7m5pQs8Wd2BvN4cYf6aR1eL3oZ9hK0pX" },
  { label: "Binance · USDT", address: "TXa8VkPq3sNm1ZfB6yL4hC9dE2wR7uM5jK" },
];

const LEAD_WITHDRAW_HISTORY = [
  { id: "WD-30418", ts: "26.04 21:14", amount: 800.00,  fee: 1.00, address: "TJ7m5pQs8Wd2BvN4cYf6aR1eL3oZ9hK0pX", txHash: "f284…a91c", status: "sent" },
  { id: "WD-30402", ts: "21.04 18:30", amount: 1200.00, fee: 1.00, address: "TXa8VkPq3sNm1ZfB6yL4hC9dE2wR7uM5jK", txHash: "7a13…ee05", status: "sent" },
  { id: "WD-30391", ts: "20.04 12:08", amount: 350.00,  fee: 1.00, address: "TJ7m5pQs8Wd2BvN4cYf6aR1eL3oZ9hK0pX", txHash: "1b29…3f44", status: "sent" },
  { id: "WD-30377", ts: "17.04 09:42", amount: 500.00,  fee: 0,    address: "TXa8VkPq3sNm1ZfB6yL4hC9dE2wR7uM5jK", txHash: null,     status: "rejected" },
];

function LeadWithdrawDrawer({ balance, onClose }) {
  const rate = (typeof ME !== "undefined" && ME.usdtRate) ? ME.usdtRate : 92.4;
  const available = Math.max(0, balance);
  const [amount, setAmount] = React.useState("");
  const [address, setAddress] = React.useState("");
  const num = parseFloat(String(amount).replace(",", ".")) || 0;
  const rub = num * rate;
  const receive = Math.max(0, num - LEAD_WITHDRAW_FEE);

  const looksValid = /^T[A-Za-z0-9]{25,40}$/.test(address.trim());
  const addrError = address.trim().length > 0 && !looksValid;
  const overBalance = num > available;
  const belowMin = num > 0 && num < LEAD_WITHDRAW_MIN;
  const canSubmit = num >= LEAD_WITHDRAW_MIN && !overBalance && looksValid;

  return (
    <Drawer
      title="Вывод с баланса"
      onClose={onClose}
      wide
      extraTags={<span className="dispute-sla mono">{LEAD_WITHDRAW_NETWORK}</span>}
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Закрыть</Btn>
        <span className="spacer" />
        <Btn variant="primary" onClick={onClose} disabled={!canSubmit}>Подтвердить вывод</Btn>
      </>}
    >
      <div className="hero-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="hero-card">
          <div className="hero-card__label">Доступно к выводу</div>
          <div className="hero-card__value" style={{ fontSize: 24 }}>{fmtMoney(available, "USDT")}</div>
          <div className="hero-card__sub">≈ {fmtMoney(available * rate, "RUB")}</div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">К получению</div>
          <div className="hero-card__value" style={{ fontSize: 24 }}>{fmtMoney(receive, "USDT")}</div>
          <div className="hero-card__sub">за вычетом комиссии сети {LEAD_WITHDRAW_FEE.toFixed(2)} USDT</div>
        </div>
      </div>

      <Section title="Сумма вывода">
        <Field
          label="USDT"
          hint={
            belowMin ? <span style={{ color: "var(--bad)" }}>Минимум {LEAD_WITHDRAW_MIN} USDT</span> :
            overBalance ? <span style={{ color: "var(--bad)" }}>Превышен доступный баланс</span> :
            num > 0 ? ("≈ " + fmtMoney(rub, "RUB") + " по курсу " + rate.toFixed(2) + " ₽/USDT") :
            ("Минимум " + LEAD_WITHDRAW_MIN + " USDT · доступно " + available.toFixed(2) + " USDT")
          }
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              className="field__input mono"
              style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}
              placeholder="0.00"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            />
            <span className="mono" style={{ color: "var(--ink-3)", fontSize: 14 }}>USDT</span>
            <Btn variant="ghost" size="sm" onClick={() => setAmount(available.toFixed(2))}>MAX</Btn>
          </div>
        </Field>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
          {[
            { label: "25%", v: available * 0.25 },
            { label: "50%", v: available * 0.5 },
            { label: "75%", v: available * 0.75 },
            { label: "Всё",  v: available },
          ].map((p) => (
            <button key={p.label} type="button" className="chip" onClick={() => setAmount(p.v.toFixed(2))}>{p.label}</button>
          ))}
        </div>
      </Section>

      <Section title="Кошелёк для вывода">
        <Field
          label="Адрес USDT"
          hint={
            addrError ? <span style={{ color: "var(--bad)" }}>Адрес выглядит некорректно для сети {LEAD_WITHDRAW_NETWORK}</span> :
            looksValid ? <span style={{ color: "var(--ok)" }}>✓ Адрес валиден для сети {LEAD_WITHDRAW_NETWORK}</span> :
            ("Сеть " + LEAD_WITHDRAW_NETWORK + " · адрес начинается с T")
          }
        >
          <input
            className="field__input mono"
            style={{ fontSize: 13 }}
            placeholder="T..."
            value={address}
            onChange={(e) => setAddress(e.target.value.trim())}
          />
        </Field>
        <div style={{ marginTop: 8 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Сохранённые адреса</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {LEAD_SAVED_WALLETS.map((w) => (
              <button
                key={w.address}
                type="button"
                onClick={() => setAddress(w.address)}
                style={{
                  textAlign: "left", padding: "10px 12px",
                  background: address === w.address ? "var(--accent-soft)" : "var(--paper-2)",
                  border: "1px solid " + (address === w.address ? "var(--accent)" : "var(--line)"),
                  borderRadius: 10, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{w.label}</span>
                <span className="mono muted" style={{ fontSize: 12, marginLeft: "auto", wordBreak: "break-all" }}>
                  {w.address.slice(0, 8)}…{w.address.slice(-6)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Итого">
        <KV items={[
          ["Сумма вывода", <strong className="mono">{num.toFixed(2)} USDT</strong>],
          ["Комиссия сети", <span className="mono">{LEAD_WITHDRAW_FEE.toFixed(2)} USDT</span>],
          ["Сеть", <span className="mono">{LEAD_WITHDRAW_NETWORK}</span>],
          ["К получению", <strong className="mono" style={{ color: "var(--ok)" }}>{receive.toFixed(2)} USDT</strong>],
        ]} />
        <Note tone="warn">
          Транзакции в блокчейне необратимы — проверьте адрес перед подтверждением.
        </Note>
      </Section>

      <Section title="История выводов">
        <table className="table table--inset">
          <thead><tr>
            <th>ID</th><th>Дата</th>
            <th className="num">Сумма</th>
            <th>Адрес</th><th>TX</th><th>Статус</th>
          </tr></thead>
          <tbody>
            {LEAD_WITHDRAW_HISTORY.map((w) => (
              <tr key={w.id}>
                <td className="mono">{w.id}</td>
                <td className="mono">{w.ts}</td>
                <td className="num">
                  <strong>−{w.amount.toFixed(2)} USDT</strong>
                  {w.fee > 0 && <div className="mono muted" style={{ fontSize: 11.5 }}>+{w.fee.toFixed(2)} комиссия</div>}
                </td>
                <td className="mono muted" style={{ fontSize: 12 }}>{w.address.slice(0, 6)}…{w.address.slice(-6)}</td>
                <td className="mono muted">{w.txHash || "—"}</td>
                <td><StatusPill map={LEAD_WITHDRAW_STATUS} value={w.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </Drawer>
  );
}

function LeadFinance({ go }) {
  const [filter, setFilter] = React.useState("all");
  const [period, setPeriod] = React.useState("today");
  const rate = (typeof ME !== "undefined" && ME.usdtRate) ? ME.usdtRate : 92.4;

  const PERIODS = {
    "hour":      { label: "Час",     title: "за час",       k: 0.07, take: 4 },
    "today":     { label: "Сегодня", title: "сегодня",      k: 1,    take: 10 },
    "yesterday": { label: "Вчера",   title: "вчера",        k: 0.92, take: 8 },
    "month":     { label: "Месяц",   title: "за месяц",    k: 22.4, take: Infinity },
    "all":       { label: "Всё",     title: "за всё время", k: 184.6, take: Infinity },
  };
  const p = PERIODS[period];
  const periodChips = Object.keys(PERIODS).map((id) => ({ value: id, label: PERIODS[id].label }));

  // Оставляем только комиссии Платежи / Выплаты
  const EXTRA_PAYOUT_COMMISSIONS = [
    { id: "L-PO-44218", ts: "27.04 13:48", account: "working", type: "commission", orderId: "PO-44218", amountUsdt: 8.42 },
    { id: "L-PO-44217", ts: "27.04 13:22", account: "working", type: "commission", orderId: "PO-44217", amountUsdt: 12.86 },
    { id: "L-PO-44210", ts: "27.04 11:48", account: "working", type: "commission", orderId: "PO-44210", amountUsdt: 5.74 },
    { id: "L-PO-44204", ts: "27.04 09:15", account: "working", type: "commission", orderId: "PO-44204", amountUsdt: 21.30 },
    { id: "L-PO-44192", ts: "26.04 22:14", account: "working", type: "commission", orderId: "PO-44192", amountUsdt: 3.18 },
    { id: "L-PO-44188", ts: "26.04 18:00", account: "working", type: "commission", orderId: "PO-44188", amountUsdt: 14.62 },
    { id: "L-PO-44175", ts: "26.04 14:11", account: "working", type: "commission", orderId: "PO-44175", amountUsdt: 9.04 },
    { id: "L-PO-44168", ts: "26.04 09:00", account: "working", type: "commission", orderId: "PO-44168", amountUsdt: 17.55 },
    { id: "L-PO-44150", ts: "25.04 22:30", account: "working", type: "commission", orderId: "PO-44150", amountUsdt: 4.92 },
    { id: "L-PO-44141", ts: "25.04 18:18", account: "working", type: "commission", orderId: "PO-44141", amountUsdt: 11.27 },
  ];
  const COMMISSIONS = LEAD_LEDGER
    .filter((l) => l.type === "commission")
    .concat(EXTRA_PAYOUT_COMMISSIONS)
    .sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));
  const isPayIn  = (l) => l.orderId && l.orderId.startsWith("PI-");
  const isPayOut = (l) => l.orderId && l.orderId.startsWith("PO-");

  const filters = [
    { value: "all",    label: "Все",    count: COMMISSIONS.length },
    { value: "payin",  label: "Платежи",  count: COMMISSIONS.filter(isPayIn).length },
    { value: "payout", label: "Выплаты", count: COMMISSIONS.filter(isPayOut).length },
  ];

  const visible = COMMISSIONS.filter((l) => {
    if (filter === "all") return true;
    if (filter === "payin") return isPayIn(l);
    if (filter === "payout") return isPayOut(l);
    return true;
  });

  const baseIn  = LEAD_TRADERS.reduce((s, t) => s + ((t.today?.payInRub)  || 0), 0);
  const baseOut = LEAD_TRADERS.reduce((s, t) => s + ((t.today?.payOutRub) || 0), 0);
  const payInRub  = Math.round(baseIn  * p.k);
  const payOutRub = Math.round(baseOut * p.k);
  const profitIn  = (payInRub  / rate) * 0.020;
  const profitOut = (payOutRub / rate) * 0.018;

  const leadOwn = LEAD_TRADERS.find((t) => t.id === "TR-1042") || LEAD_TRADERS[0];
  // Баланс тимлида — накопленные комиссии от команды (меньше трейдерского working-баланса)
  const leadBalance = 482.40;
  const [withdrawOpen, setWithdrawOpen] = React.useState(false);

  return (
    <>
      <FilterChips filters={periodChips} value={period} onChange={setPeriod} />

      <div className="hero-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="hero-card hero-card--accent">
          <div className="hero-card__label">Баланс</div>
          <div className="hero-card__value">{fmtMoney(leadBalance, "USDT")}</div>
          <div className="hero-card__actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn variant="primary" size="sm" onClick={() => setWithdrawOpen(true)}>Вывод</Btn>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Профит {p.title}</div>
          <div className="hero-card__value">{fmtMoney(profitIn + profitOut, "USDT")}</div>
          <div className="hero-card__sub"><span className="mono" style={{ color: "var(--ink-3)" }}>↓</span> <b>{profitIn.toFixed(2)}</b> · <span className="mono" style={{ color: "var(--ink-3)" }}>↑</span> <b>{profitOut.toFixed(2)}</b></div>
        </div>
      </div>

      <FilterChips filters={filters} value={filter} onChange={setFilter} />

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>ID</th><th>Дата</th><th>Тип</th><th>Ордер</th>
            <th className="num">Сумма USDT</th>
          </tr></thead>
          <tbody>
            {visible.slice(0, p.take).map((l) => (
              <tr key={l.id}>
                <td className="mono">{l.id}</td>
                <td className="mono">{l.ts}</td>
                <td><Pill tone="ok">{isPayIn(l) ? "Комиссия Платежи" : "Комиссия Выплаты"}</Pill></td>
                <td className="mono muted">{l.orderId || "—"}</td>
                <td className="num"><strong style={{ color: "var(--ok)" }}>+{l.amountUsdt.toFixed(2)} USDT</strong></td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={5}><Empty>Нет операций по выбранным фильтрам</Empty></td></tr>
            )}
          </tbody>
        </table>
        <div className="table-foot">Показано <strong>{Math.min(visible.length, p.take)}</strong> из <strong>{COMMISSIONS.length}</strong></div>
      </div>

      {withdrawOpen && (
        <LeadWithdrawDrawer
          balance={leadBalance}
          onClose={() => setWithdrawOpen(false)}
        />
      )}
    </>
  );
}

function LeadTeam() {
  const [openId, setOpenId] = React.useState(null);
  const open = LEAD_TRADERS.find((t) => t.id === openId);
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Btn variant="primary" size="sm" style={{ borderRadius: 999, padding: "6px 14px", fontSize: 13 }}>＋ Добавить трейдера</Btn>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>Trader</th><th>Status</th>
            <th className="num">Платежи сегодня</th><th className="num">Выплаты сегодня</th>
            <th className="num">Success</th><th className="num">Споры</th><th></th>
          </tr></thead>
          <tbody>
            {LEAD_TRADERS.map((t) => (
              <tr key={t.id} className={openId === t.id ? "is-selected" : ""} onClick={() => setOpenId(t.id)}>
                <td><strong>{t.name}</strong><div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{t.id} · {t.login}</div></td>
                <td><StatusPill map={TRADER_STATUS} value={t.status} /></td>
                <td className="num">{fmtMoney((t.today?.payInRub)||0)}</td>
                <td className="num">{fmtMoney((t.today?.payOutRub)||0)}</td>
                <td className="num">{Math.round((t.success||0)*100)}%</td>
                <td className="num">{(t.counts?.openDisputes)||"—"}</td>
                <td className="num" onClick={(e) => e.stopPropagation()}>
                  {t.status === "active"
                    ? <Btn variant="danger" size="sm">Заблокировать</Btn>
                    : <Btn variant="ok" size="sm">Активировать</Btn>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Drawer title="Трейдер команды" id={open.id} statusMap={TRADER_STATUS} status={open.status} onClose={() => setOpenId(null)} wide
          footer={<>
            <Btn variant="ghost">Написать в чат</Btn>
            <span className="spacer" />
            {open.status === "active"
              ? <Btn variant="danger">Приостановить</Btn>
              : <Btn variant="ok">Активировать</Btn>}
          </>}>
          <Section title="Сводка">
            <KV items={[
              ["Имя", <strong>{open.name}</strong>],
              ["Login", <span className="mono">{open.login}</span>],
              ["Email", <span className="mono">{open.email}</span>],
              ["Phone", <span className="mono">{open.phone}</span>],
              ["Регистрация", open.registered],
              ["Рейтинг", "⭐ " + open.rating + (open.ratingTrend ? "  " + (open.ratingTrend>0?"▲":"▼") + " " + Math.abs(open.ratingTrend) : "")],
            ]} />
          </Section>
          <Section title="Сегодня">
            <KV items={[
              ["Платежи", fmtMoney((open.today?.payInRub)||0)],
              ["Выплаты", fmtMoney((open.today?.payOutRub)||0)],
              ["Комиссия", ((open.today?.commissionUsdt)||0).toFixed(2) + " USDT"],
              ["Success", Math.round((open.success||0)*100) + "%"],
            ]} />
          </Section>
          <Section title="Ресурсы">
            <KV items={[
              ["Терминалы", (open.counts?.terminalsOnline||0) + " online / " + (open.counts?.terminals||0)],
              ["Реквизиты", (open.counts?.detailsActive||0) + " активных / " + (open.counts?.details||0)],
              ["Открытые споры", (open.counts?.openDisputes||0)],
            ]} />
          </Section>
          {open.notes && (
            <Section title="Заметки"><Note tone="info">{open.notes}</Note></Section>
          )}
        </Drawer>
      )}
    </>
  );
}

// ─── PAYIN ──────────────────────────────────────────────────────────────
function LeadPayIn() {
  const [filter, setFilter] = React.useState("all");
  const filters = [
    { value: "all", label: "Все", count: LEAD_PAY_IN.length },
    { value: "waiting-payment", label: "Waiting payment", count: LEAD_PAY_IN.filter((o) => o.status === "waiting-payment").length },
    { value: "manual-review", label: "Manual review", count: LEAD_PAY_IN.filter((o) => o.status === "manual-review").length },
    { value: "completed", label: "Completed", count: LEAD_PAY_IN.filter((o) => ["completed","auto-confirmed"].includes(o.status)).length },
    { value: "disputed", label: "Disputed", count: LEAD_PAY_IN.filter((o) => o.dispute).length },
  ];
  const visible = LEAD_PAY_IN.filter((o) => {
    if (filter === "all") return true;
    if (filter === "completed") return ["completed","auto-confirmed"].includes(o.status);
    if (filter === "disputed") return o.dispute;
    return o.status === filter;
  });
  return (
    <>
      <FilterChips filters={filters} value={filter} onChange={setFilter} />
      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>Статус</th>
            <th className="num">Сумма</th>
            <th>ID</th>
            <th>Trader</th>
            <th>Реквизит</th>
            <th>Создана</th>
            <th className="num">Закрыто</th>
          </tr></thead>
          <tbody>
            {visible.map((o) => {
              const pd = PAYMENT_DETAILS.find((p) => p.id === o.details);
              const usdt = o.amount / 92.5;
              return (
              <tr key={o.id}>
                <td><StatusPill map={PAY_IN_STATUS} value={o.status} /></td>
                <td className="num">{fmtMoney(o.amount)}<div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{usdt.toFixed(2)} USDT</div></td>
                <td className="mono">{o.id}{o.dispute && <span className="dot-dispute"> ●</span>}</td>
                <td><TraderCell id={o.trader} /></td>
                <td>{pd ? <><div>{pd.holder}</div><div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{pd.target}</div></> : <span className="mono">{o.details}</span>}</td>
                <td className="mono">{o.date}</td>
                <td className="num mono muted">{o.time || "—"}</td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── PAYOUT ─────────────────────────────────────────────────────────────
function LeadPayOut() {
  const [filter, setFilter] = React.useState("all");
  const filters = [
    { value: "all", label: "Все", count: LEAD_PAY_OUT.length },
    { value: "free", label: "Свободные", count: LEAD_PAY_OUT.filter((o) => o.status === "free").length },
    { value: "in-progress", label: "В работе", count: LEAD_PAY_OUT.filter((o) => o.status === "in-progress").length },
    { value: "waiting-review", label: "На проверке", count: LEAD_PAY_OUT.filter((o) => o.status === "waiting-review").length },
    { value: "completed", label: "Выполнены", count: LEAD_PAY_OUT.filter((o) => o.status === "completed").length },
    { value: "disputed", label: "Спор", count: LEAD_PAY_OUT.filter((o) => o.status === "disputed").length },
  ];
  const visible = LEAD_PAY_OUT.filter((o) => filter === "all" || o.status === filter);
  return (
    <>
      <FilterChips filters={filters} value={filter} onChange={setFilter} />
      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>ID</th><th>Статус</th><th className="num">Сумма</th>
            <th>Trader</th><th>Получатель</th><th>Реквизит</th><th>Метод</th>
            <th>Создана</th>
          </tr></thead>
          <tbody>
            {visible.map((o) => {
              const pd = o.trader
                ? (PAYMENT_DETAILS.find((p) => p.trader === o.trader && p.bank === o.customerBank)
                   || PAYMENT_DETAILS.find((p) => p.trader === o.trader))
                : null;
              return (
              <tr key={o.id}>
                <td className="mono">{o.id}</td>
                <td><StatusPill map={PAY_OUT_STATUS} value={o.status} /></td>
                <td className="num">{fmtMoney(o.amount)}<div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{(o.amount/92.5).toFixed(2)} USDT</div></td>
                <td>{o.trader ? <TraderCell id={o.trader} /> : <span className="muted">свободна</span>}</td>
                <td><div>{o.customer}</div><div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{o.customerTarget}</div></td>
                <td>{pd ? <><div>{pd.holder}</div><div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{pd.target}</div></> : <span className="muted">—</span>}</td>
                <td>{pd ? (METHOD_LABEL[pd.method] || pd.method) : <span className="muted">—</span>}<div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{bankName(o.customerBank)}</div></td>
                <td className="mono">{o.date}</td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── TERMINALS ──────────────────────────────────────────────────────────
function LeadTerminals() {
  const [filter, setFilter] = React.useState("all");
  const [displayed, setDisplayed] = React.useState("all");
  const [fading, setFading] = React.useState(false);
  React.useEffect(() => {
    if (filter === displayed) return;
    setFading(true);
    const t = setTimeout(() => { setDisplayed(filter); setFading(false); }, 180);
    return () => clearTimeout(t);
  }, [filter, displayed]);

  const filters = [
    { value: "all", label: "Все", count: LEAD_TERMINALS.length },
    { value: "online", label: "Online", count: LEAD_TERMINALS.filter((t) => t.status === "online").length },
    { value: "offline", label: "Offline", count: LEAD_TERMINALS.filter((t) => t.status === "offline").length },
    { value: "blocked", label: "Заблокированы", count: LEAD_TERMINALS.filter((t) => t.status === "blocked").length },
  ];
  const visible = LEAD_TERMINALS.filter((t) => displayed === "all" || t.status === displayed);

  return (
    <>
      <FilterChips filters={filters} value={filter} onChange={setFilter} />

      <div className={"term-grid" + (fading ? " is-fading" : "")} key={displayed}>
        {visible.map((t) => {
          const bTone = t.battery < 20 ? "bad" : t.battery < 40 ? "warn" : "ok";
          const offline = t.status === "offline" || t.status === "blocked";
          const pdCount = LEAD_PD.filter((p) => p.terminal === t.id).length;
          return (
            <div key={t.id}
              className={"term-card" + (t.status === "offline" ? " term-card--offline" : t.status === "blocked" ? " term-card--blocked" : "")}>
              <div className="term-card__head">
                <div style={{ minWidth: 0 }}>
                  <div className="term-card__id">{t.id}</div>
                  <div className="term-card__name">{t.device}</div>
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
                    <span className={"term-card__battery-bar term-card__battery--" + bTone}>
                      <i style={{ width: Math.max(4, t.battery) + "%" }} />
                    </span>
                    <span className={"term-card__battery-num is-" + bTone}>{t.battery}%</span>
                  </div>
                </div>
                <div className="term-card__stat">
                  <div className="term-card__stat-label">Реквизиты</div>
                  <div className="term-card__stat-value">{pdCount}</div>
                </div>
              </div>

              <div className="term-card__foot">
                <svg style={{ width: 14, height: 14, opacity: 0.7 }} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 1.5" strokeLinecap="round" />
                </svg>
                <span className="mono">{t.heartbeat}</span>
                <span style={{ marginLeft: "auto" }}><TraderCell id={t.trader} /></span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── PAYMENT DETAILS ────────────────────────────────────────────────────
function PDBar({ v }) {
  const pct = Math.max(0, Math.min(1, v || 0));
  return (
    <div style={{ height: 4, background: "var(--ui-bg-soft, #eef0f4)", borderRadius: 2, overflow: "hidden", width: 120 }}>
      <div style={{ width: (pct * 100) + "%", height: "100%", background: pct > 0.85 ? "var(--ui-bad, #d6534b)" : pct > 0.6 ? "var(--ui-warn, #d6a634)" : "var(--ui-ok, #2fa56a)" }} />
    </div>
  );
}
function LeadPaymentDetails() {
  const [filter, setFilter] = React.useState("all");
  const [displayed, setDisplayed] = React.useState("all");
  const [fading, setFading] = React.useState(false);
  React.useEffect(() => {
    if (filter === displayed) return;
    setFading(true);
    const t = setTimeout(() => { setDisplayed(filter); setFading(false); }, 180);
    return () => clearTimeout(t);
  }, [filter, displayed]);

  const filters = [
    { value: "all", label: "Все", count: LEAD_PD.length },
    { value: "active", label: "Активные", count: LEAD_PD.filter((p) => p.status === "active").length },
    { value: "limit-exceeded", label: "Лимит", count: LEAD_PD.filter((p) => p.status === "limit-exceeded").length },
    { value: "terminal-offline", label: "Терминал offline", count: LEAD_PD.filter((p) => p.status === "terminal-offline").length },
    { value: "blocked", label: "Заблокированы", count: LEAD_PD.filter((p) => p.status === "blocked").length },
    { value: "frozen", label: "Заморожены", count: LEAD_PD.filter((p) => p.status === "frozen").length },
  ].filter((f) => f.count > 0 || f.value === "all" || f.value === "active");
  const visible = LEAD_PD.filter((p) => displayed === "all" || p.status === displayed);

  return (
    <>
      <FilterChips filters={filters} value={filter} onChange={setFilter} />

      <div className={"pd-grid" + (fading ? " is-fading" : "")} key={displayed}>
        {visible.map((p) => {
          const usage = p.dailyUsed || 0;
          const tone = usage >= 0.9 ? "bad" : usage >= 0.7 ? "warn" : "ok";
          const opsRatio = (p.opsToday || 0) / (p.opsLimit || 1);
          const opsTone = opsRatio >= 0.9 ? "bad" : opsRatio >= 0.7 ? "warn" : "";
          const accent =
            p.status === "limit-exceeded" ? " pd-card--limit" :
            p.status === "blocked" ? " pd-card--blocked" :
            p.status === "terminal-offline" ? " pd-card--offline" :
            p.status === "frozen" ? " pd-card--frozen" : "";
          const methods = p.methods || [p.method];
          return (
            <div key={p.id} className={"pd-card" + accent}>
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
                    {methods.map((m) => (
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
                  {fmtMoney((p.todayRub ?? p.todayVolumeRub) || 0)} / {fmtMoney(p.dailyLimit || 0)}
                </div>
              </div>

              <div className="pd-card__stats">
                <div className="pd-card__stat">
                  <div className="pd-card__stat-label">Опер. сегодня</div>
                  <div className={"pd-card__stat-value" + (opsTone ? " is-" + opsTone : "")}>
                    {p.opsToday ?? "—"} <span style={{ color: "var(--ink-4)" }}>/ {p.opsLimit || "—"}</span>
                  </div>
                </div>
                <div className="pd-card__stat">
                  <div className="pd-card__stat-label">Успех</div>
                  <div className={"pd-card__stat-value" + (p.success >= 0.97 ? " is-ok" : p.success < 0.9 ? " is-bad" : "")}>
                    {p.success != null ? Math.round(p.success * 100) + "%" : "—"}
                  </div>
                </div>
              </div>

              <div className="pd-card__foot">
                <span className="mono">{p.terminal}</span>
                <span><TraderCell id={p.trader} /></span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── DISPUTES ───────────────────────────────────────────────────────────
function LeadDisputes() {
  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>ID</th><th>Order</th><th>Trader</th>
            <th>Status</th><th className="num">Сумма</th>
            <th>SLA</th><th>Открыт</th>
          </tr></thead>
          <tbody>
            {LEAD_DISPUTES.map((d) => (
              <tr key={d.id}>
                <td className="mono">{d.id}</td>
                <td className="mono">{d.order}<div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{d.orderType}</div></td>
                <td><TraderCell id={d.trader} /></td>
                <td><StatusPill map={DISPUTE_STATUS} value={d.status} /></td>
                <td className="num">{fmtMoney(d.amount)}</td>
                <td className="mono">{d.sla || "—"}</td>
                <td className="mono">{d.opened}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── TARIFF ──────────────────────────────────────────────────────────────────────
const METHOD_BY_BANK_LEAD = { "B-A": "sbp", "B-B": "card", "B-C": "account", "B-D": "sbp" };
function LeadTraderTariffDrawer({ trader, onClose }) {
  const [tab, setTab] = React.useState("payin");
  const tf = TARIFFS.find((x) => x.id === trader.tariff);
  if (!tf) return null;
  const tabs = [
    { value: "payin",  label: "Платежи",  count: tf.bankOverrides.length },
    { value: "payout", label: "Выплаты", count: tf.bankOverrides.length },
  ];
  return (
    <Drawer title={"Тариф трейдера · " + trader.name} id={tf.id} statusMap={TARIFF_STATUS} status={tf.status} onClose={onClose} wide>
      <Section title="Сводка">
        <KV items={[
          ["Трейдер", <><strong>{trader.name}</strong> <span className="mono muted">{trader.id}</span></>],
          ["Тариф", <strong>{tf.name}</strong>],
          ["Платежи (трейдеру)", tf.payInTrader + "%"],
          ["Выплаты (трейдеру)", tf.payOutTrader + "%"],
          ["Min комиссия", tf.minCommissionUsdt.toFixed(2) + " USDT"],
          ["Settlement", tf.settlementPolicy],
          ["Withdrawal", tf.withdrawalPolicy],
          ["Обновлён", tf.updated],
        ]} />
      </Section>
      <Section title="Ставки по платёжным методам">
        <FilterChips filters={tabs} value={tab} onChange={setTab} />
        {tf.bankOverrides.length === 0 ? (
          <Empty>Overrides по методам не настроены — действуют базовые ставки тарифа.</Empty>
        ) : (
          <table className="table table--inset">
            <thead><tr>
              <th>Метод</th>
              <th className="num">Ставка (мне)</th>
              <th className="num">Мин. сумма</th>
              <th className="num">Макс. сумма</th>
              <th>Особенности</th>
            </tr></thead>
            <tbody>
              {tf.bankOverrides.map((b) => {
                const m = METHOD_BY_BANK_LEAD[b.bank] || "sbp";
                const rate = tab === "payin" ? b.payInTrader : b.payOutTrader;
                return (
                  <tr key={b.bank}>
                    <td>
                      <span className={"pd-card__method pd-card__method--" + m}>
                        {m === "sbp" ? "СБП" : m === "card" ? "Карта" : m === "c2c" ? "C2C" : m === "phone" ? "Phone" : m === "account" ? "Счёт" : m}
                      </span>
                    </td>
                    <td className="num mono">{rate.toFixed(1)}%</td>
                    <td className="num">{fmtMoney(b.min, "RUB")}</td>
                    <td className="num">{fmtMoney(b.max, "RUB")}</td>
                    <td className="muted">{b.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Section>
      <Section title="История изменений">
        <Timeline items={[
          { time: trader.registered || "—", text: "Тариф «" + tf.name + "» назначен админом при KYC" },
          { time: tf.updated, text: "Ставки тарифа обновлены админом", muted: true },
        ]} />
      </Section>
    </Drawer>
  );
}

function LeadTariff() {
  const [openTraderId, setOpenTraderId] = React.useState(null);
  const openTrader = LEAD_TRADERS.find((t) => t.id === openTraderId);
  const tariffIds = Array.from(new Set(LEAD_TRADERS.map((t) => t.tariff).filter(Boolean)));
  const tariffs = tariffIds.map((id) => TARIFFS.find((t) => t.id === id)).filter(Boolean);
  return (
    <>
      {tariffs.map((tf) => {
        const traders = LEAD_TRADERS.filter((t) => t.tariff === tf.id);
        return (
          <div key={tf.id} style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>{tf.name}</h3>
              <span className="mono muted" style={{ fontSize: 12 }}>{tf.id}</span>
              <StatusPill map={TARIFF_STATUS} value={tf.status} />
              <span className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>Обновлён {tf.updated}</span>
            </div>
            <div className="table-wrap" style={{ marginBottom: 8 }}>
              <table className="table">
                <thead><tr><th>Трейдеры на этом тарифе</th><th>Status</th><th className="num">Платежи сегодня</th><th className="num">Выплаты сегодня</th></tr></thead>
                <tbody>
                  {traders.map((t) => (
                    <tr key={t.id} className={openTraderId === t.id ? "is-selected" : ""} onClick={() => setOpenTraderId(t.id)}>
                      <td><strong>{t.name}</strong> <span className="mono muted" style={{ fontSize: 11.5 }}>{t.id}</span></td>
                      <td><StatusPill map={TRADER_STATUS} value={t.status} /></td>
                      <td className="num">{fmtMoney((t.today?.payInRub)||0)}</td>
                      <td className="num">{fmtMoney((t.today?.payOutRub)||0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tf.bankOverrides && tf.bankOverrides.length > 0 && (
              <div className="table-wrap">
                <table className="table table--inset">
                  <thead><tr><th>Метод</th><th className="num">Платежи трейдер</th><th className="num">Выплаты трейдер</th><th className="num">Min</th><th className="num">Max</th><th>Примечания</th></tr></thead>
                  <tbody>
                    {tf.bankOverrides.map((b) => {
                      const methodByBank = { "B-A": "sbp", "B-B": "card", "B-C": "account", "B-D": "sbp" };
                      const m = methodByBank[b.bank] || "sbp";
                      return (
                      <tr key={b.bank}>
                        <td>
                          <span className={"pd-card__method pd-card__method--" + m}>
                            {m === "sbp" ? "СБП" : m === "card" ? "Карта" : m === "c2c" ? "C2C" : m === "phone" ? "Phone" : m === "account" ? "Счёт" : m}
                          </span>
                        </td>
                        <td className="num">{b.payInTrader}%</td>
                        <td className="num">{b.payOutTrader}%</td>
                        <td className="num mono">{b.min.toLocaleString("ru-RU")}</td>
                        <td className="num mono">{b.max.toLocaleString("ru-RU")}</td>
                        <td className="muted">{b.notes}</td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
      {openTrader && <LeadTraderTariffDrawer trader={openTrader} onClose={() => setOpenTraderId(null)} />}
    </>
  );
}

// ─── SMS / Push с терминалов ──────────────────────────────────────────────
function LeadSms() {
  const [filter, setFilter] = React.useState("all");
  const [terminal, setTerminal] = React.useState("all");
  const [termOpen, setTermOpen] = React.useState(false);
  const termRef = React.useRef(null);

  React.useEffect(() => {
    if (!termOpen) return;
    const onDoc = (e) => {
      if (termRef.current && !termRef.current.contains(e.target)) setTermOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [termOpen]);

  const filters = [
    { value: "all", label: "Все", count: LEAD_SMS_LOG.length },
    { value: "unlinked", label: "Не привязаны", count: LEAD_SMS_LOG.filter((s) => !s.payment || !s.details).length },
    { value: "unparsed", label: "Не распознаны", count: LEAD_SMS_LOG.filter((s) => !s.parsed).length },
    { value: "linked", label: "Привязаны", count: LEAD_SMS_LOG.filter((s) => s.payment && s.details && s.parsed).length },
  ];

  const smsAfterStatus = LEAD_SMS_LOG.filter((s) => {
    if (filter === "unlinked") return !s.payment || !s.details;
    if (filter === "unparsed") return !s.parsed;
    if (filter === "linked") return s.payment && s.details && s.parsed;
    return true;
  });

  const termOptions = [{ value: "all", label: "Все терминалы", count: smsAfterStatus.length }].concat(
    LEAD_TERMINALS.map((t) => ({
      value: t.id,
      label: t.id + " · " + t.device,
      count: smsAfterStatus.filter((s) => s.terminal === t.id).length,
    }))
  );
  const termActive = termOptions.find((o) => o.value === terminal) || termOptions[0];
  const termIsAll = terminal === "all";

  const visible = smsAfterStatus.filter((s) => terminal === "all" || s.terminal === terminal);

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FilterChips filters={filters} value={filter} onChange={setFilter} />
        </div>
        <div ref={termRef} style={{ position: "relative", padding: "4px 0 16px" }}>
          <button
            type="button"
            className={"chip" + (!termIsAll ? " chip--active" : "")}
            onClick={() => setTermOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={termOpen}
          >
            <span>{termActive.label}</span>
            {termActive.count != null && <span className="chip__count">{termActive.count}</span>}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 2, opacity: 0.7, transform: termOpen ? "rotate(180deg)" : "none", transition: "transform 120ms" }}>
              <path d="M2 4 L5 7 L8 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {termOpen && (
            <div
              role="listbox"
              style={{
                position: "absolute",
                top: "calc(100% - 12px)",
                right: 0,
                minWidth: 240,
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                boxShadow: "0 12px 32px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05)",
                padding: 6,
                zIndex: 50,
              }}
            >
              {termOptions.map((o) => {
                const active = o.value === terminal;
                return (
                  <button
                    key={o.value}
                    role="option"
                    aria-selected={active}
                    onClick={() => { setTerminal(o.value); setTermOpen(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: active ? "var(--paper-2)" : "transparent",
                      color: "var(--ink)",
                      fontSize: 13,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--paper-2)"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.label}</span>
                    <span className="chip__count">{o.count}</span>
                    {active && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 2 }}>
                        <path d="M2.5 6.5 L5 9 L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>Терминал</th>
            <th>Trader</th>
            <th>Источник</th>
            <th>Время</th>
            <th>Банк</th>
            <th>Реквизит</th>
            <th>Платёж</th>
            <th className="num">Сумма</th>
            <th>Сообщение</th>
          </tr></thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan={9}><Empty>Нет сообщений по выбранным фильтрам</Empty></td></tr>
            ) : visible.map((s) => {
              const src = SMS_SOURCE[s.source];
              const term = LEAD_TERMINALS.find((t) => t.id === s.terminal);
              return (
                <tr key={s.id}>
                  <td className="mono">{s.terminal}</td>
                  <td>{term ? <TraderCell id={term.trader} /> : <span className="muted">—</span>}</td>
                  <td>
                    <span className={"sms-source sms-source--" + (src ? src.tone : "mts")}>
                      {src ? src.label : s.source}
                    </span>
                  </td>
                  <td className="mono muted" style={{ fontSize: 12.5 }}>{s.time}</td>
                  <td>{bankName(s.bank)}</td>
                  <td>
                    {s.details
                      ? <span className="mono">{s.details}</span>
                      : <span className="sms-link-empty">—</span>}
                  </td>
                  <td>
                    {s.payment
                      ? <span className="mono">{s.payment}</span>
                      : <span className="sms-link-empty">—</span>}
                  </td>
                  <td className="num">
                    {s.parsed && s.amount != null
                      ? <span className="sms-amount">+{fmtMoney(s.amount, "RUB")}</span>
                      : <span className="sms-amount sms-amount--null">—</span>}
                  </td>
                  <td>
                    <div className={"sms-msg" + (s.parsed ? "" : " sms-msg--unparsed")}>{s.message}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── ПРОФИЛЬ / НАСТРОЙКИ ─────────────────────────────────────────────────
function LeadProfile() {
  const [tab, setTab] = React.useState("account");
  return (
    <>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "account", label: "Аккаунт" },
          { id: "security", label: "Безопасность" },
          { id: "notifications", label: "Уведомления" },
          { id: "kyc", label: "KYC" },
        ]}
      />

      {tab === "account" && (
        <>
          <Section title="Личные данные">
            <Field label="Тип пользователя" row><div style={{ paddingTop: 4 }}><Pill tone="info">Тимлид</Pill></div></Field>
            <Field label="Полное имя" row><TextInput value={LEAD.name} readOnly /></Field>
            <Field label="Email" row><TextInput value={LEAD.email} readOnly /></Field>
            <Field label="Телефон" row><TextInput value={LEAD.phone} readOnly mono /></Field>
            <Field label="ID team lead" row><TextInput value={LEAD.id} readOnly mono /></Field>
            <Field label="Команда" row><TextInput value={LEAD.team} readOnly /></Field>
            <Field label="Зарегистрирован" row><TextInput value={LEAD.registered} readOnly mono /></Field>
          </Section>
        </>
      )}

      {tab === "security" && (
        <>
          <Section title="Двухфакторная аутентификация (2FA)">
            <KV items={[
              ["Статус", <Pill tone="ok">Включена</Pill>],
              ["Метод", "Authenticator app (TOTP)"],
              ["Включена", <span className="mono">14.03.2024</span>],
            ]} />
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <Btn variant="ghost">Перенастроить 2FA</Btn>
              <Btn variant="ghost">Скачать резервные коды</Btn>
            </div>
          </Section>
          <ProfileSecurity />
        </>
      )}

      {tab === "notifications" && (
        <Section title="Уведомления">
          <LeadToggleRow label="Новый трейдер запросился в команду" hint="Push + Email" defaultOn />
          <LeadToggleRow label="Трейдер ушёл в suspended" hint="Push + Telegram" defaultOn />
          <LeadToggleRow label="Открыт спор по ордеру команды" hint="Push + Email" defaultOn />
          <LeadToggleRow label="Терминал команды ушёл в offline" hint="Push + Telegram" defaultOn />
          <LeadToggleRow label="Реквизит команды достиг 90% дневного лимита" hint="Push" defaultOn />
          <LeadToggleRow label="Списание со страхового депозита трейдера" hint="Email" defaultOn />
          <LeadToggleRow label="Изменение тарифа админом" hint="Email" defaultOn />
          <LeadToggleRow label="Маркетинговые рассылки CrowdPay" />
        </Section>
      )}

      {tab === "kyc" && (
        <>
          <Section title="KYC-статус">
            <KV items={[
              ["Статус", <Pill tone="ok">Verified</Pill>],
              ["Подтверждён", <span className="mono">14.03.2024</span>],
              ["Метод", "Документ + видео-селфи"],
              ["Срок действия", <span className="mono">14.03.2026</span>],
            ]} />
          </Section>
          <Section title="Документы">
            <table className="table table--inset">
              <thead><tr><th>Тип</th><th>Номер / файл</th><th>Загружен</th><th>Статус</th></tr></thead>
              <tbody>
                <tr><td>Паспорт РФ</td><td className="mono">**** **** 4421</td><td className="mono">14.03.2024</td><td><Pill tone="ok">Approved</Pill></td></tr>
                <tr><td>Селфи с документом</td><td className="mono">photo_4421.jpg</td><td className="mono">14.03.2024</td><td><Pill tone="ok">Approved</Pill></td></tr>
              </tbody>
            </table>
          </Section>
          <Note tone="info">Изменить KYC-данные можно только через запрос саппорту — откройте тикет.</Note>
        </>
      )}
    </>
  );
}

function LeadToggleRow({ label, hint, defaultOn }) {
  const [on, setOn] = React.useState(!!defaultOn);
  return (
    <div className="toggle-row">
      <div>
        <div className="toggle-row__label">{label}</div>
        {hint && <div className="toggle-row__hint">{hint}</div>}
      </div>
      <button className={"switch" + (on ? " switch--on" : "")} onClick={() => setOn(!on)} aria-pressed={on}>
        <span className="switch__thumb" />
      </button>
    </div>
  );
}

Object.assign(window, {
  LEAD, LEAD_NAV, LEAD_NAV_GROUPS,
  LeadDashboard, LeadFinance, LeadTeam, LeadPayIn, LeadPayOut, LeadTerminals, LeadPaymentDetails, LeadDisputes, LeadTariff, LeadSms,
  LeadProfile,
});
