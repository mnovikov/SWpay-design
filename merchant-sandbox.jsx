// CrowdPay — Merchant integration sandbox
// Эмулирует клиентский запрос на платёж/выплату, показывает наш виджет и webhook-лог.

const { useState, useEffect, useRef, useMemo } = React;

// ─── Sandbox state maps ─────────────────────────────────────────────────────
const SBX_STATUS = {
  "waiting-bank":   { label: "Выбор банка",      tone: "info" },
  "waiting-payment":{ label: "Ждём платёж",      tone: "warn" },
  "manual-review":  { label: "На проверке",      tone: "info" },
  "partial":        { label: "Частичная оплата", tone: "warn" },
  completed:        { label: "Успех",            tone: "ok"   },
  failed:           { label: "Ошибка",           tone: "bad"  },
  expired:          { label: "Таймаут",          tone: "bad"  },
  disputed:         { label: "Спор",             tone: "warn" },
  matching:         { label: "Подбор трейдера",  tone: "info" },
  "waiting-trader": { label: "Ждём трейдера",    tone: "warn" },
  "trader-paid":    { label: "Трейдер выплатил", tone: "info" },
};

const TERMINAL_STATUSES = new Set(["completed","failed","expired","disputed"]);
const isTerminal = (s) => TERMINAL_STATUSES.has(s);

let __counter = 1000;
function genId(direction) {
  __counter++;
  return (direction === "payin" ? "PI-" : "PO-") + (90000 + __counter);
}
function nowTime() {
  const d = new Date();
  const p = (n) => n.toString().padStart(2, "0");
  return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
}
const fmtRub = (n) => (n != null ? Math.round(n).toLocaleString("ru-RU") + " ₽" : "—");

let __custCounter = 50000 + Math.floor(Math.random() * 40000);
function genCustomerId() {
  __custCounter += 1 + Math.floor(Math.random() * 7);
  return "cust_" + __custCounter;
}

// Демо-учётки API для песочницы — выдаются вместе с приёмкой мерчанта.
// В реальности API key/secret хранятся в кабинете мерчанта; здесь — захардкожены для демо.
const MERCHANT_CREDS = {
  "M-501": { apiKey: "pk_live_betcity_a9f2c1",  apiSecret: "sk_live_4421a9f2c1bd8e63" },
  "M-502": { apiKey: "pk_live_maxbet_71e0fd",   apiSecret: "sk_live_8b3c71e0fd245a17" },
  "M-503": { apiKey: "pk_live_casino24_3df8a2", apiSecret: "sk_live_c0f23df8a2901b54" },
};
function findMerchantByCreds(apiKey, apiSecret) {
  const key = (apiKey || "").trim();
  const secret = (apiSecret || "").trim();
  if (!key || !secret) return null;
  for (const [id, c] of Object.entries(MERCHANT_CREDS)) {
    if (c.apiKey === key && c.apiSecret === secret) return id;
  }
  return null;
}

// ─── App ────────────────────────────────────────────────────────────────────
function App() {
  // form state
  const [direction, setDirection] = useState("payin");
  const allowedMerchants = MERCHANTS.filter((m) => m.status === "active");
  const [merchantId, setMerchantId] = useState(""); // "" = не залогинен
  const [customer, setCustomer] = useState(null); // { id, name } | null
  const [amount, setAmount] = useState("12500");
  const [payoutBank, setPayoutBank] = useState(BANKS[0]?.id || "");
  const [payoutMethod, setPayoutMethod] = useState("sbp");
  const [payoutTarget, setPayoutTarget] = useState("+7 900 555-12-34");

  // Подсказка/плейсхолдер под выбранный метод
  const METHOD_PLACEHOLDER = {
    sbp:  "+7 900 ...",
    card: "•••• 1234 1234 1234",
  };
  const METHOD_TARGET_LABEL = {
    sbp:  "Телефон СБП",
    card: "Номер карты",
  };
  // При смене метода — обновить плейсхолдер, если значение явно несовместимо
  useEffect(() => {
    if (payoutMethod === "sbp" && !payoutTarget.startsWith("+7")) setPayoutTarget("+7 900 555-12-34");
    if (payoutMethod === "card" && !payoutTarget.includes("•")) setPayoutTarget("•••• 1234 5678 9012");
    // eslint-disable-next-line
  }, [payoutMethod]);

  // orders
  const [orders, setOrders] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const active = orders.find((o) => o.id === activeId);

  // tick — clock-driven, for timers
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // helpers
  const updateOrder = (id, patch, evt) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next = { ...o, ...patch };
        if (evt) next.events = [{ ts: nowTime(), ...evt }, ...o.events];
        return next;
      })
    );
  };

  const createOrder = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    if (!merchantId || !customer) return;
    const id = genId(direction);
    const m = MERCHANTS.find((x) => x.id === merchantId);
    const pd = PAYMENT_DETAILS.find((p) => p.status === "active");
    const order = {
      id,
      direction,
      merchant: merchantId,
      merchantName: m?.name || merchantId,
      customer,
      amount: amt,
      currency: "RUB",
      pd: pd ? { id: pd.id, bank: pd.bank, target: pd.target, holder: pd.holder, method: pd.method } : null,
      payoutBank,
      payoutMethod: direction === "payout" ? payoutMethod : null,
      payoutTarget: direction === "payout" ? payoutTarget : null,
      status: direction === "payin" ? "waiting-bank" : "matching",
      step: 1,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000,
      paidAmount: 0,
      trader: null,
      events: [
        {
          ts: nowTime(),
          type: direction === "payin" ? "payin.created" : "payout.created",
          payload: {
            id, merchant: merchantId, customer, amount: amt, currency: "RUB",
            ...(direction === "payout" ? { destination: { method: payoutMethod, bank: payoutBank, target: payoutTarget } } : {})
          },
        },
      ],
    };
    setOrders((p) => [order, ...p].slice(0, 30));
    setActiveId(id);
  };

  // Auto-advance after creation
  useEffect(() => {
    if (!active) return;
    if (active.direction === "payin" && active.status === "waiting-bank") {
      const t = setTimeout(() => {
        updateOrder(active.id, { status: "waiting-payment", step: 2 }, {
          type: "payin.routed",
          payload: { id: active.id, payment_details: active.pd?.id, bank: active.pd?.bank, expires_at: new Date(active.expiresAt).toISOString() }
        });
      }, 1200);
      return () => clearTimeout(t);
    }
    if (active.direction === "payout" && active.status === "matching") {
      const t = setTimeout(() => {
        updateOrder(active.id, { status: "waiting-trader", trader: "TR-1042", traderName: "Алексей М." }, {
          type: "payout.assigned",
          payload: { id: active.id, trader: "TR-1042", deadline_min: 30 }
        });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [active?.id, active?.status]);

  return (
    <div className="sb">
      <Topbar />
      <div className="sb__grid">
        <aside className="sb__left">
          <RequestBuilder
            direction={direction} onDirection={setDirection}
            merchants={allowedMerchants} merchantId={merchantId} onLogin={setMerchantId} onLogout={() => { setMerchantId(""); setCustomer(null); }}
            customer={customer} onCustomer={setCustomer}
            amount={amount} onAmount={setAmount}
            payoutBank={payoutBank} onPayoutBank={setPayoutBank}
            payoutMethod={payoutMethod} onPayoutMethod={setPayoutMethod}
            payoutTarget={payoutTarget} onPayoutTarget={setPayoutTarget}
            methodLabel={METHOD_TARGET_LABEL[payoutMethod]}
            methodPlaceholder={METHOD_PLACEHOLDER[payoutMethod]}
            onCreate={createOrder}
          />
          <HistoryList orders={orders} activeId={activeId} onSelect={setActiveId} />
        </aside>

        <main className="sb__center">
          {active
            ? <WidgetFrame order={active} />
            : <EmptyState />}
        </main>

        <aside className="sb__right">
          <SimControls active={active} update={updateOrder} />
          <WebhookPanel events={active?.events || []} />
        </aside>
      </div>
    </div>
  );
}

// ─── Topbar ─────────────────────────────────────────────────────────────────
function Topbar() {
  return (
    <header className="sb__top">
      <div className="sb__brand">
        <div className="sb__brand-mark">⊙</div>
        <div className="sb__brand-name">CrowdPay</div>
        <span className="sb__brand-tag">Merchant Sandbox</span>
      </div>
      <div className="sb__top-sub">
        Эмулятор интеграции: создайте заявку → увидите наш виджет → проверьте webhook-лог.
      </div>
    </header>
  );
}

// ─── Request Builder ────────────────────────────────────────────────────────
function RequestBuilder({
  direction, onDirection,
  merchants, merchantId, onLogin, onLogout,
  customer, onCustomer,
  amount, onAmount,
  payoutBank, onPayoutBank,
  payoutMethod, onPayoutMethod,
  payoutTarget, onPayoutTarget,
  methodLabel, methodPlaceholder,
  onCreate,
}) {
  const METHODS = [
    { value: "sbp",  label: "СБП" },
    { value: "card", label: "Карта" },
  ];
  const isAuthed = !!merchantId;
  const merchant = isAuthed ? merchants.find((m) => m.id === merchantId) : null;
  return (
    <div className="card">
      <div className="card__title">Запрос от клиента</div>

      <AuthBlock
        merchant={merchant}
        merchants={merchants}
        onLogin={onLogin}
        onLogout={onLogout}
      />

      {isAuthed && <>
      <CustomerBlock customer={customer} onCustomer={onCustomer} />

      {customer && <>
      <div className="seg">
        <button className={"seg__btn" + (direction === "payin" ? " seg__btn--active" : "")} onClick={() => onDirection("payin")}>
          ↘ Платежи (платёж)
        </button>
        <button className={"seg__btn" + (direction === "payout" ? " seg__btn--active" : "")} onClick={() => onDirection("payout")}>
          ↗ Выплаты (выплата)
        </button>
      </div>

      <Field label="Сумма (₽)">
        <TextInput value={amount} onChange={onAmount} placeholder="12 500" />
      </Field>

      {direction === "payout" && (
        <>
          <Field label="Метод выплаты">
            <div className="seg seg--methods">
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  className={"seg__btn" + (payoutMethod === m.value ? " seg__btn--active" : "")}
                  onClick={() => onPayoutMethod(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </Field>
          <div className="row-2">
            <Field label="Банк получателя">
              <Select value={payoutBank} onChange={onPayoutBank} options={BANKS.map((b) => ({ value: b.id, label: b.name }))} />
            </Field>
            <Field label={methodLabel}>
              <TextInput value={payoutTarget} onChange={onPayoutTarget} placeholder={methodPlaceholder} />
            </Field>
          </div>
        </>
      )}

      <div style={{ marginTop: 12 }}>
        <Btn variant="primary" onClick={onCreate} style={{ width: "100%" }}>
          {direction === "payin" ? "Создать платёж" : "Создать выплату"}
        </Btn>
      </div>
      </>}
      </>}
    </div>
  );
}

// ─── Customer (create + show current) ────────────────────────────────
function CustomerBlock({ customer, onCustomer }) {
  const [name, setName] = useState("");
  if (customer) {
    return (
      <div className="auth-card auth-card--in">
        <div className="auth-card__row">
          <div className="auth-card__col">
            <div className="auth-card__label">Текущий клиент</div>
            <div className="auth-card__name">
              {customer.name}
              <span className="auth-card__id mono">· {customer.id}</span>
            </div>
          </div>
          <Btn variant="ghost" size="sm" onClick={() => onCustomer(null)}>
            ➕ Новый
          </Btn>
        </div>
      </div>
    );
  }
  const submit = () => {
    const n = name.trim();
    if (!n) return;
    onCustomer({ id: genCustomerId(), name: n });
    setName("");
  };
  return (
    <div className="auth-card">
      <Field label="Имя клиента" hint="ID присвоится автоматически">
        <TextInput
          value={name}
          onChange={setName}
          placeholder="Иван Иванов"
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        />
      </Field>
      <Btn variant="primary" onClick={submit} disabled={!name.trim()} style={{ width: "100%" }}>
        Создать клиента
      </Btn>
    </div>
  );
}

// ─── Auth (API key + secret) ───────────────────────────────────────────────
function AuthBlock({ merchant, merchants, onLogin, onLogout }) {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [error, setError] = useState("");
  const [showHints, setShowHints] = useState(false);

  if (merchant) {
    return (
      <div className="auth-card auth-card--in">
        <div className="auth-card__row">
          <div className="auth-card__col">
            <div className="auth-card__label">Залогинены как</div>
            <div className="auth-card__name">
              {merchant.name}
              <span className="auth-card__id mono">· {merchant.id}</span>
            </div>
          </div>
          <Btn variant="ghost" size="sm" onClick={() => { setApiKey(""); setApiSecret(""); onLogout(); }}>
            Разлогиниться
          </Btn>
        </div>
      </div>
    );
  }

  const submit = () => {
    const id = findMerchantByCreds(apiKey, apiSecret);
    if (!id) {
      setError("Неверный API key или secret");
      return;
    }
    setError("");
    onLogin(id);
  };

  return (
    <div className="auth-card">
      <Field label="API key">
        <TextInput value={apiKey} onChange={(v) => { setApiKey(v); setError(""); }} placeholder="pk_live_…" />
      </Field>
      <Field label="API secret">
        <TextInput value={apiSecret} onChange={(v) => { setApiSecret(v); setError(""); }} placeholder="sk_live_…" />
      </Field>
      {error && <div className="auth-card__error">{error}</div>}
      <Btn variant="primary" onClick={submit} style={{ width: "100%", marginTop: 8 }}>
        Залогиниться
      </Btn>
      <div className="auth-card__hint">
        <button className="auth-card__hint-toggle" onClick={() => setShowHints((v) => !v)}>
          {showHints ? "Скрыть демо-учётки" : "Показать демо-учётки"}
        </button>
        {showHints && (
          <div className="auth-card__creds">
            {merchants.map((m) => {
              const c = MERCHANT_CREDS[m.id];
              if (!c) return null;
              return (
                <div key={m.id} className="auth-card__cred">
                  <div className="auth-card__cred-name">{m.name} <span className="mono muted">· {m.id}</span></div>
                  <button
                    type="button"
                    className="auth-card__cred-row mono"
                    onClick={() => { setApiKey(c.apiKey); setApiSecret(c.apiSecret); setError(""); }}
                    title="Подставить в форму"
                  >
                    <span><span className="muted">key </span>{c.apiKey}</span>
                    <span><span className="muted">secret </span>{c.apiSecret}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── History ────────────────────────────────────────────────────────────────
function HistoryList({ orders, activeId, onSelect }) {
  if (orders.length === 0) {
    return (
      <div className="card">
        <div className="card__title">История заявок</div>
        <div className="muted" style={{ fontSize: 13, padding: "8px 0" }}>
          Ещё нет заявок. Создайте первую слева ↑
        </div>
      </div>
    );
  }
  return (
    <div className="card">
      <div className="card__title">История заявок</div>
      <ul className="hist">
        {orders.slice(0, 10).map((o) => (
          <li
            key={o.id}
            className={"hist__row" + (activeId === o.id ? " hist__row--active" : "")}
            onClick={() => onSelect(o.id)}
          >
            <span className={"hist__dir hist__dir--" + o.direction}>
              {o.direction === "payin" ? "↘" : "↗"}
            </span>
            <div className="hist__main">
              <div className="mono" style={{ fontSize: 12 }}>{o.id}</div>
              <div className="muted" style={{ fontSize: 11 }}>{o.customer?.name || o.customer?.id || "—"}</div>
            </div>
            <div className="hist__amt">{fmtRub(o.amount)}</div>
            <StatusPill map={SBX_STATUS} value={o.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Empty state in center ──────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="sb__empty">
      <div className="sb__empty-iframe">
        <div className="sb__empty-chrome">
          <span className="sb__empty-dot" style={{ background: "#ed6a5e" }} />
          <span className="sb__empty-dot" style={{ background: "#f4bf4f" }} />
          <span className="sb__empty-dot" style={{ background: "#62c554" }} />
          <span className="muted mono" style={{ marginLeft: 12, fontSize: 11.5 }}>https://widget.crowdpay.io</span>
        </div>
        <div className="sb__empty-body">
          <div className="sb__empty-icon">⊙</div>
          <div className="sb__empty-title">CrowdPay Widget</div>
          <div className="sb__empty-sub">
            Здесь появится виджет с реквизитами для оплаты, как только клиент создаст заявку.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Widget frame (looks like an embedded iframe) ───────────────────────────
function WidgetFrame({ order }) {
  return (
    <div className="iframe">
      <div className="iframe__chrome">
        <span className="iframe__dot" style={{ background: "#ed6a5e" }} />
        <span className="iframe__dot" style={{ background: "#f4bf4f" }} />
        <span className="iframe__dot" style={{ background: "#62c554" }} />
        <div className="iframe__url">
          <span className="iframe__lock">🔒</span>
          <span className="mono">widget.crowdpay.io/{order.direction === "payin" ? "pay" : "payout"}/{order.id}</span>
        </div>
        <div className="iframe__chip">
          <StatusPill map={SBX_STATUS} value={order.status} />
        </div>
      </div>
      <div className="iframe__viewport">
        {order.direction === "payin"
          ? <PayInWidget order={order} />
          : <PayOutWidget order={order} />}
      </div>
    </div>
  );
}

// ─── Widget — Платежи ─────────────────────────────────────────────────────────
function PayInWidget({ order }) {
  const secondsLeft = Math.max(0, Math.floor((order.expiresAt - Date.now()) / 1000));
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="w">
      <header className="w__head">
        <div className="w__logo">⊙ CrowdPay</div>
        <div className="w__merchant">{order.merchantName}</div>
      </header>

      <div className="w__amount-block">
        <div className="muted" style={{ fontSize: 12 }}>К оплате</div>
        <div className="w__amount">{fmtRub(order.amount)}</div>
        <div className="mono muted" style={{ fontSize: 12 }}>{order.id} · {order.customer?.id || "—"}</div>
      </div>

      <Steps current={order.step || 1} labels={["Выбор банка", "Реквизит", "Подтверждение"]} status={order.status} />

      {order.status === "waiting-bank" && (
        <div className="w__panel">
          <div className="w__panel-title">Выберите банк для оплаты</div>
          <div className="w__bank-grid">
            {BANKS.slice(0, 4).map((b) => (
              <div key={b.id} className="w__bank">
                <div className="w__bank-name">{b.name}</div>
                <div className="muted" style={{ fontSize: 11 }}>СБП · Карта</div>
              </div>
            ))}
          </div>
          <div className="w__hint">Подбираем оптимальный реквизит…</div>
        </div>
      )}

      {order.status === "waiting-payment" && (
        <div className="w__panel">
          <div className="w__detail">
            <div className="w__detail-row">
              <span className="muted">Банк</span>
              <strong>{bankName(order.pd?.bank)}</strong>
            </div>
            <div className="w__detail-row">
              <span className="muted">Реквизит</span>
              <strong className="mono">{order.pd?.target}</strong>
            </div>
            <div className="w__detail-row">
              <span className="muted">Получатель</span>
              <span>{order.pd?.holder}</span>
            </div>
            <div className="w__detail-row">
              <span className="muted">Сумма</span>
              <strong>{fmtRub(order.amount)}</strong>
            </div>
          </div>
          <button className="w__copy">📋 Скопировать реквизит</button>
          <div className="w__timer">
            <span className="muted">До конца оплаты</span>
            <strong className="mono">{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</strong>
          </div>
          <div className="w__hint">
            Переведите ровно <strong>{fmtRub(order.amount)}</strong>. После оплаты дождитесь подтверждения — это занимает до 1 минуты.
          </div>
        </div>
      )}

      {order.status === "manual-review" && (
        <div className="w__panel w__panel--info">
          <div className="w__big">⏳</div>
          <div className="w__panel-title">Платёж на ручной проверке</div>
          <div className="w__hint">Поддержка CrowdPay проверяет платёж. Это может занять до 10 минут.</div>
        </div>
      )}

      {order.status === "partial" && (
        <div className="w__panel w__panel--warn">
          <div className="w__big">⚠️</div>
          <div className="w__panel-title">Получено только {fmtRub(order.paidAmount)}</div>
          <div className="w__hint">
            Доплатите <strong>{fmtRub(order.amount - order.paidAmount)}</strong> на тот же реквизит,
            либо ожидайте возврата.
          </div>
        </div>
      )}

      {order.status === "completed" && (
        <div className="w__panel w__panel--ok">
          <div className="w__big">✓</div>
          <div className="w__panel-title">Платёж подтверждён</div>
          <div className="w__hint">{fmtRub(order.amount)} зачислены мерчанту. Можете закрыть окно.</div>
        </div>
      )}

      {order.status === "expired" && (
        <div className="w__panel w__panel--bad">
          <div className="w__big">⏱</div>
          <div className="w__panel-title">Время на оплату истекло</div>
          <div className="w__hint">Заявка закрыта. Если вы успели оплатить — обратитесь в поддержку.</div>
        </div>
      )}

      {order.status === "failed" && (
        <div className="w__panel w__panel--bad">
          <div className="w__big">✕</div>
          <div className="w__panel-title">Платёж не выполнен</div>
          <div className="w__hint">Попробуйте создать новую заявку или обратитесь в поддержку.</div>
        </div>
      )}

      {order.status === "disputed" && (
        <div className="w__panel w__panel--warn">
          <div className="w__big">⚖</div>
          <div className="w__panel-title">Открыт спор</div>
          <div className="w__hint">Платёж в споре. Поддержка свяжется с вами в течение 24 часов.</div>
        </div>
      )}
    </div>
  );
}

// ─── Widget — Выплаты ────────────────────────────────────────────────────────
function PayOutWidget({ order }) {
  return (
    <div className="w">
      <header className="w__head">
        <div className="w__logo">⊙ CrowdPay</div>
        <div className="w__merchant">{order.merchantName}</div>
      </header>

      <div className="w__amount-block">
        <div className="muted" style={{ fontSize: 12 }}>К получению</div>
        <div className="w__amount">{fmtRub(order.amount)}</div>
        <div className="mono muted" style={{ fontSize: 12 }}>{order.id} · {order.customer?.id || "—"}</div>
      </div>

      <Steps current={
        order.status === "matching" ? 1
        : order.status === "waiting-trader" ? 2
        : order.status === "trader-paid" ? 3
        : 3
      } labels={["Подбор", "Выплата", "Подтверждение"]} status={order.status} />

      <div className="w__panel">
        <div className="w__detail">
          <div className="w__detail-row">
            <span className="muted">Метод</span>
            <strong>{({ sbp: "СБП", card: "Карта" }[order.payoutMethod]) || "—"}</strong>
          </div>
          <div className="w__detail-row">
            <span className="muted">Банк</span>
            <strong>{bankName(order.payoutBank)}</strong>
          </div>
          <div className="w__detail-row">
            <span className="muted">Реквизит</span>
            <strong className="mono">{order.payoutTarget}</strong>
          </div>
          <div className="w__detail-row">
            <span className="muted">Сумма</span>
            <strong>{fmtRub(order.amount)}</strong>
          </div>
        </div>
      </div>

      {order.status === "matching" && (
        <div className="w__panel w__panel--info">
          <div className="w__big">…</div>
          <div className="w__panel-title">Ищем свободного трейдера</div>
          <div className="w__hint">Обычно занимает менее минуты.</div>
        </div>
      )}

      {order.status === "waiting-trader" && (
        <div className="w__panel w__panel--info">
          <div className="w__big">⏳</div>
          <div className="w__panel-title">Трейдер делает перевод</div>
          <div className="w__hint">Трейдер {order.traderName} обрабатывает выплату. Средства поступят в течение 30 минут.</div>
        </div>
      )}

      {order.status === "trader-paid" && (
        <div className="w__panel w__panel--info">
          <div className="w__big">⏳</div>
          <div className="w__panel-title">Перевод отправлен</div>
          <div className="w__hint">Ожидаем подтверждение от вашего банка.</div>
        </div>
      )}

      {order.status === "completed" && (
        <div className="w__panel w__panel--ok">
          <div className="w__big">✓</div>
          <div className="w__panel-title">Деньги отправлены</div>
          <div className="w__hint">{fmtRub(order.amount)} переведены на {order.payoutTarget}.</div>
        </div>
      )}

      {order.status === "expired" && (
        <div className="w__panel w__panel--bad">
          <div className="w__big">⏱</div>
          <div className="w__panel-title">Истёк срок выплаты</div>
          <div className="w__hint">Не нашли свободного трейдера. Попробуйте позже.</div>
        </div>
      )}

      {order.status === "failed" && (
        <div className="w__panel w__panel--bad">
          <div className="w__big">✕</div>
          <div className="w__panel-title">Выплата не выполнена</div>
          <div className="w__hint">Деньги возвращены мерчанту.</div>
        </div>
      )}

      {order.status === "disputed" && (
        <div className="w__panel w__panel--warn">
          <div className="w__big">⚖</div>
          <div className="w__panel-title">Открыт спор</div>
          <div className="w__hint">Платёж в споре. Поддержка свяжется в течение 24 часов.</div>
        </div>
      )}
    </div>
  );
}

// ─── Steps indicator ────────────────────────────────────────────────────────
function Steps({ current, labels, status }) {
  const isError = status === "expired" || status === "failed";
  const isDone = status === "completed";
  return (
    <div className="steps">
      {labels.map((l, i) => {
        const n = i + 1;
        const state = isDone && n <= 3 ? "done"
                    : isError && n === current ? "error"
                    : n < current ? "done"
                    : n === current ? "active"
                    : "pending";
        return (
          <div key={n} className={"steps__item steps__item--" + state}>
            <div className="steps__dot">{state === "done" ? "✓" : state === "error" ? "!" : n}</div>
            <div className="steps__label">{l}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Manual simulation controls ─────────────────────────────────────────────
function SimControls({ active, update }) {
  if (!active) {
    return (
      <div className="card">
        <div className="card__title">Симуляция ответа платформы</div>
        <div className="muted" style={{ fontSize: 13, padding: "8px 0" }}>
          Создайте заявку слева — здесь появятся кнопки для симуляции событий от платформы.
        </div>
      </div>
    );
  }

  const fire = (patch, evt) => update(active.id, patch, evt);
  const disabled = isTerminal(active.status);

  if (active.direction === "payin") {
    return (
      <div className="card">
        <div className="card__title">Симуляция событий — Платежи</div>
        <div className="sim-grid">
          <SimBtn label="✓ Клиент оплатил" tone="ok" disabled={disabled || active.status === "waiting-bank"}
            onClick={() => fire({ status: "completed", paidAmount: active.amount }, {
              type: "payin.completed", payload: { id: active.id, amount: active.amount, source: "customer-confirmation" }
            })}
          />
          <SimBtn label="📱 SMS детекция" tone="ok" disabled={disabled || active.status === "waiting-bank"}
            onClick={() => fire({ status: "completed", paidAmount: active.amount }, {
              type: "payin.sms-detected", payload: { id: active.id, amount: active.amount, terminal: "T-1001", source: "sms-mts" }
            })}
          />
          <SimBtn label="⏱ Таймаут" tone="bad" disabled={disabled}
            onClick={() => fire({ status: "expired" }, {
              type: "payin.expired", payload: { id: active.id, reason: "no_payment_15min" }
            })}
          />
          <SimBtn label="◐ Частичный платёж" tone="warn" disabled={disabled || active.status === "waiting-bank"}
            onClick={() => {
              const part = Math.round(active.amount * 0.6);
              fire({ status: "partial", paidAmount: part }, {
                type: "payin.partial", payload: { id: active.id, expected: active.amount, received: part }
              });
            }}
          />
          <SimBtn label="⚖ Открыть спор" tone="warn" disabled={disabled}
            onClick={() => fire({ status: "disputed" }, {
              type: "dispute.opened", payload: { id: active.id, dispute_id: "DSP-" + (440 + Math.floor(Math.random() * 99)), reason: "customer_claim" }
            })}
          />
          <SimBtn label="? На проверку" tone="info" disabled={disabled || active.status === "waiting-bank"}
            onClick={() => fire({ status: "manual-review" }, {
              type: "payin.manual-review", payload: { id: active.id, reason: "amount_mismatch", assigned_to: "support@crowdpay" }
            })}
          />
        </div>
      </div>
    );
  }

  // Выплаты
  return (
    <div className="card">
      <div className="card__title">Симуляция событий — Выплаты</div>
      <div className="sim-grid">
        <SimBtn label="✓ Трейдер выплатил" tone="ok" disabled={disabled}
          onClick={() => fire({ status: "trader-paid" }, {
            type: "payout.trader-paid", payload: { id: active.id, trader: active.trader, proof: "receipt_98821.jpg" }
          })}
        />
        <SimBtn label="✓ Подтверждено клиентом" tone="ok" disabled={disabled}
          onClick={() => fire({ status: "completed" }, {
            type: "payout.completed", payload: { id: active.id, amount: active.amount }
          })}
        />
        <SimBtn label="⏱ Таймаут" tone="bad" disabled={disabled}
          onClick={() => fire({ status: "expired" }, {
            type: "payout.expired", payload: { id: active.id, reason: "no_trader_available" }
          })}
        />
        <SimBtn label="✕ Трейдер отказался" tone="warn" disabled={disabled}
          onClick={() => fire({ status: "matching" }, {
            type: "payout.reassigning", payload: { id: active.id, prev_trader: active.trader, reason: "trader_rejected" }
          })}
        />
        <SimBtn label="⚖ Открыть спор" tone="warn" disabled={disabled}
          onClick={() => fire({ status: "disputed" }, {
            type: "dispute.opened", payload: { id: active.id, dispute_id: "DSP-" + (440 + Math.floor(Math.random() * 99)), reason: "not_received" }
          })}
        />
        <SimBtn label="? На проверку" tone="info" disabled={disabled}
          onClick={() => fire({ status: "manual-review" }, {
            type: "payout.manual-review", payload: { id: active.id, reason: "proof_unclear", assigned_to: "support@crowdpay" }
          })}
        />
      </div>
    </div>
  );
}

function SimBtn({ label, tone, onClick, disabled }) {
  return (
    <button className={"sim-btn sim-btn--" + tone} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// ─── Webhook panel ──────────────────────────────────────────────────────────
function WebhookPanel({ events }) {
  return (
    <div className="card card--flex">
      <div className="card__title">
        Webhook log
        <span className="muted" style={{ fontWeight: 400, fontSize: 12, marginLeft: 6 }}>
          POST https://merchant.example.com/webhooks/crowdpay
        </span>
      </div>
      {events.length === 0 ? (
        <div className="muted" style={{ fontSize: 13, padding: "8px 0" }}>
          События платформы появятся здесь.
        </div>
      ) : (
        <ul className="wh">
          {events.map((e, i) => (
            <li key={i} className="wh__row">
              <div className="wh__head">
                <span className="mono" style={{ fontSize: 12 }}>{e.ts}</span>
                <span className="wh__type">{e.type}</span>
                <span className="wh__http">200 OK</span>
              </div>
              <pre className="wh__body">{JSON.stringify(e.payload, null, 2)}</pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
