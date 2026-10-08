// CrowdPay v3 — раздел «Провайдеры»
// Компании-провайдеры: та же таблица и drawer, что у трейдеров, но
//  • контрагент — это компания (название юрлица), не человек
//  • провайдер не входит в команду
//  • доступ только через API — открытый (public) и закрытый (secret) ключ, без логина/пароля

const PROVIDER_STATUS = (typeof TRADER_STATUS !== "undefined") ? TRADER_STATUS : {
  active:      { label: "Активен",        tone: "ok" },
  suspended:   { label: "Приостановлен",  tone: "warn" },
  deactivated: { label: "Отключён",       tone: "bad" },
};

// ─── Providers ───────────────────────────────────────────────────────────
function SectionProviders() {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [tab, setTab] = React.useState("overview");
  const [editProvider, setEditProvider] = React.useState(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const filters = [
    { value: "all", label: "Все", count: PROVIDERS.length },
    { value: "active", label: "Active", count: PROVIDERS.filter((p) => p.status === "active").length },
    { value: "suspended", label: "Suspended", count: PROVIDERS.filter((p) => p.status === "suspended").length },
    { value: "deactivated", label: "Deactivated", count: PROVIDERS.filter((p) => p.status === "deactivated").length },
  ];
  const visible = PROVIDERS.filter((p) => filter === "all" || p.status === filter);
  const open = PROVIDERS.find((p) => p.id === openId);
  const payInOrd = [142, 78, 214, 0, 121, 0];
  return (
    <>
      <PageHead
        title="Провайдеры"
        sub="Компании-провайдеры с доступом по API. Подключаются открытым и закрытым ключом, не входят в команды."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters.map((f) => ({ value: f.value != null ? f.value : f.id, label: f.label, count: f.count }))} align="left" />
        <Btn variant="primary" size="sm" style={{ borderRadius: 999, padding: "6px 14px", fontSize: 13, marginLeft: "auto" }} onClick={() => setShowCreate(true)}>Добавить провайдера</Btn>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Статус</th>
              <th>Провайдер</th>
              <th className="num">Баланс</th>
              <th className="num">Платежи / day</th>
              <th className="num">Success</th>
              <th className="num">Disputes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p, i) => (
              <tr key={p.id} className={openId === p.id ? "is-selected" : ""} onClick={() => { setOpenId(p.id); setTab("overview"); }}>
                <td><StatusPill map={PROVIDER_STATUS} value={p.status} /></td>
                <td>
                  <div className="cell-stack">
                    <strong>{p.name}</strong>
                  </div>
                </td>
                <td className="num">
                  {(p.balance?.workingUsdt || 0).toFixed(2)} <span className="muted">USDT</span>
                  {(p.balance?.lockedUsdt || 0) > 0 && (
                    <div className="muted" style={{ fontSize: 11 }}>
                      заблок. {(p.balance.lockedUsdt).toFixed(0)} USDT
                    </div>
                  )}
                </td>
                <td className="num">
                  {fmtMoney((p.today?.payInRub ?? 0) / 92.4, "USDT")}
                  <div className="muted" style={{ fontSize: 11 }}>{payInOrd[i] ?? 0} ord</div>
                </td>
                <td className="num">{Math.round(p.success * 100)}%</td>
                <td className="num">{(p.counts?.openDisputes) || "—"}</td>
                <td className="num" onClick={(e) => e.stopPropagation()}>
                  {p.status === "active"
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
          statusMap={PROVIDER_STATUS}
          onClose={() => setOpenId(null)}
          wide
          footer={<>
            {open.status === "active" && <Btn variant="danger">Deactivate Provider</Btn>}
            {open.status === "deactivated" && <Btn variant="ok">Reactivate</Btn>}
            {open.status === "suspended" && <><Btn variant="ok">Reactivate</Btn><Btn variant="danger">Deactivate</Btn></>}
            <span className="spacer" />
            <Btn variant="primary" onClick={() => setEditProvider(open)}>Редактировать</Btn>
          </>}
        >
          <Tabs
            tabs={[
              { id: "overview",  label: "Overview" },
              { id: "deposit",   label: "Депозит" },
              { id: "tariff",    label: "Тариф" },
              { id: "calls",     label: "Вызовы" },
              { id: "merchants", label: "Мерчанты" },
              { id: "access",    label: "Доступ" },
            ]}
            value={tab}
            onChange={setTab}
          />
          {tab === "overview"  && <ProviderOverviewTab provider={open} />}
          {tab === "deposit"   && <ProviderDepositTab provider={open} />}
          {tab === "tariff"    && <ProviderTariffTab tariffId={open.tariff || "TF-001"} />}
          {tab === "calls"     && <ProviderCallsTab provider={open} />}
          {tab === "merchants" && <TraderMerchantsTab trader={open} />}
          {tab === "access"    && <ProviderAccessTab provider={open} />}
        </Drawer>
      )}
      {editProvider && (
        <ProviderFormDrawer provider={editProvider} onClose={() => setEditProvider(null)} />
      )}
      {showCreate && (
        <ProviderFormDrawer onClose={() => setShowCreate(false)} />
      )}
    </>
  );
}

// ─── Provider Form (создание / редактирование) ─────────────────────
function ProviderFormDrawer({ provider, onClose }) {
  const isEdit = !!provider;
  const [name, setName]       = React.useState(provider?.name || "");
  const [email, setEmail]     = React.useState(provider?.email || "");
  const [contact, setContact] = React.useState(provider?.contact || "");
  const tariff = provider?.tariff || "TF-001";

  // Редактируемый тариф по платёжным методам (только Платежи)
  const buildMethods = (id) => {
    const t = TARIFFS.find((x) => x.id === id) || TARIFFS[0];
    const inBase = t.payInTrader;
    return [
      { method: "sbp",     label: "СБП",                 rate: +(inBase + 0.0).toFixed(1), min: 100,  max: 100000 },
      { method: "card",    label: "Карта (номер)",       rate: +(inBase + 0.3).toFixed(1), min: 500,  max: 200000 },
      { method: "c2c",     label: "Card-to-Card",        rate: +(inBase + 0.5).toFixed(1), min: 1000, max: 150000 },
      { method: "phone",   label: "По номеру телефона",  rate: +(inBase + 0.0).toFixed(1), min: 100,  max: 100000 },
      { method: "account", label: "По расчётному счёту", rate: +(inBase - 0.5).toFixed(1), min: 5000, max: 500000 },
    ];
  };
  const [methods, setMethods] = React.useState(() => buildMethods(tariff));
  const setRow = (i, patch) => setMethods((rows) => rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const removeRow = (i) => setMethods((rows) => rows.filter((_, idx) => idx !== i));
  const addRow = () => setMethods((rows) => [...rows, { method: "sbp", rate: +(TARIFFS.find((x) => x.id === tariff)?.payInTrader ?? 0).toFixed(1), min: 100, max: 100000 }]);

  return (
    <Drawer
      title={isEdit ? "Редактирование провайдера" : "Новый провайдер"}
      status={isEdit ? provider.status : undefined}
      statusMap={isEdit ? PROVIDER_STATUS : undefined}
      onClose={onClose}
      wide
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <span className="spacer" />
        <Btn variant="primary" onClick={onClose}>{isEdit ? "Сохранить" : "Создать провайдера"}</Btn>
      </>}
    >
      <Section title="Провайдер">
        <Field label="Название">
          <TextInput value={name} onChange={setName} placeholder="Название компании" />
        </Field>
        <div className="row-2">
          <Field label="Email">
            <TextInput mono value={email} onChange={setEmail} placeholder="api@example.com" />
          </Field>
          <Field label="Контакт">
            <TextInput mono value={contact} onChange={setContact} placeholder="+7 …" />
          </Field>
        </div>
      </Section>

      <Section title="Тариф (Платежи)">
        <table className="table table--inset">
          <thead><tr>
            <th>Метод</th>
            <th className="num">Ставка (провайдеру)</th>
            <th className="num">Мин. сумма</th>
            <th className="num">Макс. сумма</th>
            <th style={{ width: 40 }}></th>
          </tr></thead>
          <tbody>
            {methods.length === 0 ? (
              <tr><td colSpan={5}><Empty>Нет ставок — добавьте строку</Empty></td></tr>
            ) : methods.map((m, i) => (
              <tr key={i}>
                <td>
                  <select className="field__input" style={{ fontSize: 12.5, width: 110, padding: "4px 8px" }}
                    value={m.method} onChange={(e) => setRow(i, { method: e.target.value })}>
                    {PROV_METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
                <td className="num mono">
                  <input className="field__input field__input--inline" style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, width: 78, padding: "4px 8px", textAlign: "right" }}
                    value={m.rate} onChange={(e) => setRow(i, { rate: parseFloat(e.target.value) || 0 })} />
                </td>
                <td className="num mono">
                  <input className="field__input" style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, width: 96, padding: "4px 8px", textAlign: "right" }}
                    value={m.min} onChange={(e) => setRow(i, { min: parseInt(e.target.value) || 0 })} />
                </td>
                <td className="num mono">
                  <input className="field__input" style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, width: 110, padding: "4px 8px", textAlign: "right" }}
                    value={m.max} onChange={(e) => setRow(i, { max: parseInt(e.target.value) || 0 })} />
                </td>
                <td>
                  <button className="btn btn--ghost" title="Удалить строку" style={{ padding: "4px 8px", fontSize: 14, lineHeight: 1 }}
                    onClick={() => removeRow(i)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 10 }}>
          <Btn variant="ghost" size="sm" onClick={addRow}>＋ Добавить строку</Btn>
        </div>
      </Section>

      <Note tone="neutral">
        Ключи доступа (открытый и закрытый) редактируются на вкладке «Доступ» в карточке провайдера.
      </Note>
    </Drawer>
  );
}

// ─── Provider Overview (без команды, с реквизитами компании) ─────────────
function ProviderOverviewTab({ provider }) {
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

  const payInUsdt = ((provider.today?.payInRub ?? 0) / 92.4) * p.k;
  const payInOrders = Math.max(0, Math.round((provider.today?.payInRub ?? 0) / 6200 * p.k));
  const openDisputes = Math.max(0, Math.round((provider.counts?.openDisputes ?? 0) * p.k));
  const totalDisputes = Math.max(openDisputes, Math.round((openDisputes + 6) * p.k));
  const conv = Math.round((provider.success || 0) * 100);

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
          <div className="stat__label">Success rate</div>
          <div className="stat__value">{conv}<span className="ccy">%</span></div>
          <div className="stat__delta">за {PERIODS[period].label.toLowerCase()}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Споры</div>
          <div className="stat__value">{openDisputes} <span className="ccy">из {totalDisputes}</span></div>
          <div className="stat__delta">открыто сейчас</div>
        </div>
      </div>

      <Section title="Компания">
        <KV items={[
          ["Название", <strong>{provider.name}</strong>],
          ["Provider ID", <span className="mono">{provider.id}</span>],
          ["Контакт", <span className="mono">{provider.contact || "—"}</span>],
          ["Email", <span className="mono">{provider.email || "—"}</span>],
        ]} />
      </Section>
      <Section title="Интеграция">
        <KV items={[
          ["Тип доступа", <Pill tone="info">API · REST</Pill>],
          ["Public key", <MonoCopy value={provider.publicKey} />],
          ["Secret key", <span className="mono muted">sk_live_••••••••{provider.keyLast4}</span>],
        ]} />
      </Section>
      <Section title="Прочее">
        <KV items={[
          ["Статус", <StatusPill map={PROVIDER_STATUS} value={provider.status} />],
          ["Тариф", <span className="mono">{provider.tariff || "—"}</span>],
          ["Зарегистрирован", <span className="mono">{provider.registered || "—"}</span>],
          ["Last activity", provider.last || "—"],
        ]} />
      </Section>
    </>
  );
}

// ─── Provider Access (просто ввести открытый и закрытый ключ) ────────────
function ProviderAccessTab({ provider }) {
  const [publicKey, setPublicKey] = React.useState(provider.publicKey || "");
  const [secretKey, setSecretKey] = React.useState("");

  return (
    <>
      <Section title="Ключи доступа">
        <div className="row-2">
          <Field label="Открытый ключ (public key)">
            <TextInput mono value={publicKey} onChange={setPublicKey} placeholder="pk_live_…" />
          </Field>
          <Field label="Закрытый ключ (secret key)">
            <TextInput mono value={secretKey} onChange={setSecretKey} placeholder="sk_live_…" />
          </Field>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <Btn variant="primary" size="sm">Сохранить</Btn>
        </div>
      </Section>
    </>
  );
}

// ─── Provider Deposit (только рабочий депозит, без страхового) ────────────
function ProviderDepositTab({ provider }) {
  const [period, setPeriod] = React.useState("today");
  const [extra, setExtra] = React.useState([]);
  const [fDir, setFDir] = React.useState("deposit");
  const [fAmount, setFAmount] = React.useState("");
  const [fNote, setFNote] = React.useState("");
  const [overdraft, setOverdraft] = React.useState(String(provider.overdraftUsdt ?? 0));
  const PERIODS = {
    "hour":      { label: "Час",     k: 0.07 },
    "today":     { label: "Сегодня", k: 1    },
    "yesterday": { label: "Вчера",   k: 0.92 },
    "month":     { label: "Месяц",   k: 22.4 },
    "all":       { label: "Всё",     k: 184.6 },
  };
  const periodChips = Object.keys(PERIODS).map((id) => ({ value: id, label: PERIODS[id].label }));

  const baseWorking = provider.balance?.workingUsdt ?? 0;
  const locked = provider.balance?.lockedUsdt ?? 0;
  const delta = extra.reduce((s, e) => s + (e.direction === "deposit" ? e.amountUsdt : -e.amountUsdt), 0);
  const working = baseWorking + delta;

  const baseHistory = (typeof DEPOSIT_HISTORY !== "undefined" ? DEPOSIT_HISTORY : [])
    .filter((h) => h.trader === provider.id && h.kind === "working");
  const history = [...extra, ...baseHistory];

  const dirSign = (d) => (d === "deposit" || d === "release" || d === "commission") ? 1 : -1;

  const fAmt = parseFloat(fAmount);
  const fOverdraw = fDir === "withdraw" && fAmt > working;
  const fValid = fAmt > 0 && !fOverdraw;
  const submitMove = () => {
    if (!fValid) return;
    const seq = Math.floor(1000 + Math.random() * 9000);
    setExtra((prev) => [{
      id: (fDir === "deposit" ? "DH-D" : "DH-W") + seq,
      ts: "сейчас",
      trader: provider.id,
      kind: "working",
      direction: fDir,
      amountUsdt: +fAmt.toFixed(2),
      ref: fNote || "ручная операция",
    }, ...prev]);
    setFAmount("");
    setFNote("");
  };

  return (
    <>
      <div className="stat-row" style={{ gridTemplateColumns: "repeat(2, 1fr)", marginBottom: 14 }}>
        <div className="stat">
          <div className="stat__label">Рабочий депозит</div>
          <div className="stat__value">{working.toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="stat__delta">минимум 300 USDT</div>
        </div>
        <div className="stat">
          <div className="stat__label">Заморожено</div>
          <div className="stat__value">{locked.toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="stat__delta">в активных ордерах</div>
        </div>
      </div>

      <Section
        title="Лимит овердрафта"
        action={<Btn variant="primary" size="sm">Сохранить</Btn>}
      >
        <Field label="Лимит овердрафта (USDT)" hint="Насколько рабочий баланс может уйти в минус">
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
          <Field label="Сумма (USDT)" hint={fOverdraw ? "Больше доступного баланса" : undefined}>
            <TextInput value={fAmount} onChange={setFAmount} placeholder="напр. 500" mono />
          </Field>
        </div>
        <Field label="TX">
          <TextInput value={fNote} onChange={setFNote} placeholder="напр. 0x9f2c…a31b" mono />
        </Field>
      </Section>

      <FilterChips filters={periodChips} value={period} onChange={setPeriod} />

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>Тип</th>
            <th className="num">Сумма USDT</th>
            <th>Ссылка</th>
            <th>Дата</th>
            <th>ID</th>
          </tr></thead>
          <tbody>
            {history.slice(0, 12).map((h) => {
              const sign = dirSign(h.direction);
              return (
                <tr key={h.id} className="is-static">
                  <td><StatusPill map={DEPOSIT_DIRECTION} value={h.direction} /></td>
                  <td className="num">
                    <strong style={{ color: sign >= 0 ? "var(--ok)" : "var(--bad)" }}>
                      {sign >= 0 ? "+" : "−"}{h.amountUsdt.toFixed(2)} USDT
                    </strong>
                  </td>
                  <td className="mono muted">{h.ref || "—"}</td>
                  <td className="mono">{h.ts}</td>
                  <td className="mono">{h.id}</td>
                </tr>
              );
            })}
            {history.length === 0 && (
              <tr><td colSpan={5}><Empty>Операций по рабочему депозиту нет</Empty></td></tr>
            )}
          </tbody>
        </table>
        {history.length > 0 && (
          <div className="table-foot">Показано <strong>{Math.min(history.length, 12)}</strong> из <strong>{history.length}</strong></div>
        )}
      </div>
    </>
  );
}

// ─── Provider Tariff (только платежи, без истории изменений) ──────────────
const PROV_METHOD_LABELS = { sbp: "СБП", card: "Карта", c2c: "C2C", phone: "Phone", account: "Счёт" };
const PROV_METHOD_OPTIONS = Object.keys(PROV_METHOD_LABELS).map((v) => ({ value: v, label: PROV_METHOD_LABELS[v] }));

// ── Вызовы провайдера (в дровере) ─────────────────────────────────────────
function ProviderCallsTab({ provider }) {
  const [openId, setOpenId] = React.useState(null);
  const [period, setPeriod] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [methodFilter, setMethodFilter] = React.useState("all");
  const [merchantFilter, setMerchantFilter] = React.useState("all");
  const raw = (typeof CALLS !== "undefined" ? CALLS : []).filter((c) => c.provider === provider.id);

  const PERIOD_CHIPS = [
    { value: "hour",      label: "Час" },
    { value: "today",     label: "Сегодня" },
    { value: "yesterday", label: "Вчера" },
    { value: "month",     label: "Месяц" },
    { value: "all",       label: "Всё" },
  ];
  // Заявки живут на одной дате (демо), поэтому «Час» отсекаем по времени,
  // «Вчера» — заведомо пусто, остальные периоды показывают всё.
  const toMin = (ts) => {
    const m = /(\d{2}):(\d{2}):(\d{2})/.exec(ts || "");
    return m ? (+m[1]) * 60 + (+m[2]) + (+m[3]) / 60 : 0;
  };
  const latest = raw.reduce((mx, c) => Math.max(mx, toMin(c.createdAt)), 0);
  const inPeriod = (c) => {
    if (period === "yesterday") return false;
    if (period === "hour") return toMin(c.createdAt) >= latest - 60;
    return true;
  };
  const all = raw.filter((c) =>
    inPeriod(c) &&
    (statusFilter === "all" || c.status === statusFilter) &&
    (methodFilter === "all" || (c.payload && c.payload.method_type === methodFilter)) &&
    (merchantFilter === "all" || c.merchant === merchantFilter)
  );

  const statusOptions = [
    { value: "all",     label: "Все статусы" },
    { value: "success", label: "Успех" },
    { value: "reject",  label: "Отказ" },
  ];
  const methodOptions = [
    { value: "all", label: "Все методы" },
    ...Array.from(new Set(raw.map((c) => c.payload && c.payload.method_type).filter(Boolean))).map((mt) => ({ value: mt, label: METHOD_LABEL[mt] || mt })),
  ];
  const merchantOptions = [
    { value: "all", label: "Все мерчанты" },
    ...Array.from(new Set(raw.map((c) => c.merchant).filter(Boolean))).map((id) => ({ value: id, label: merchantName(id) })),
  ];

  const done = all.filter((c) => c.status === "success").length;
  const pct = all.length ? Math.round(done / all.length * 100) : 0;
  const orderStatus = (c) => {
    if (!c.order) return null;
    const pool = c.type === "payin" ? (typeof PAY_IN !== "undefined" ? PAY_IN : []) : (typeof PAY_OUT !== "undefined" ? PAY_OUT : []);
    const o = pool.find((x) => x.id === c.order);
    return o ? o.status : null;
  };
  const OK_ORDER = ["completed", "auto-confirmed", "settled", "confirmed"];
  const withOrder = all.filter((c) => c.order);
  const paidOk = withOrder.filter((c) => OK_ORDER.includes(orderStatus(c))).length;
  const payPct = withOrder.length ? Math.round(paidOk / withOrder.length * 100) : 0;
  const open = all.find((c) => c.id === openId);

  return (
    <>
      <FilterChips filters={PERIOD_CHIPS} value={period} onChange={setPeriod} />
      <div className="section">
        <div className="stat-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
          <Stat label="Конверсия вызовов" value={pct + "%"} delta={`${done} из ${all.length} успешно`} />
          <Stat label="Исполнение платежей" value={payPct + "%"} delta={`${paidOk} из ${withOrder.length} завершено`} />
        </div>
      </div>
      <Section title={`Вызовы к провайдеру (${all.length})`}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <ChipSelect value={merchantFilter} onChange={setMerchantFilter} options={merchantOptions} placeholder="Мерчант" />
          <ChipSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="Статус" />
          <ChipSelect value={methodFilter} onChange={setMethodFilter} options={methodOptions} placeholder="Метод" />
        </div>
        {all.length === 0 ? <Empty>Вызовов по фильтру нет</Empty> : (
          <table className="table table--inset">
            <thead><tr>
              <th>Статус</th>
              <th className="num">Сумма</th>
              <th>Мерчант</th>
              <th>Метод</th>
              <th>Дата</th>
            </tr></thead>
            <tbody>
              {all.map((c) => (
                <tr key={c.id} onClick={() => setOpenId(c.id)} style={{ cursor: "pointer" }}>
                  <td>
                    <StatusPill map={REQUEST_STATUS} value={c.status} />
                    <div className="mono muted" style={{ fontSize: 11, marginTop: 3 }}>{c.type === "payin" ? "платёж" : "выплата"}</div>
                  </td>
                  <td className="num"><strong>{fmtMoney(c.amount, "RUB")}</strong></td>
                  <td>{merchantName(c.merchant)}</td>
                  <td>{c.payload && c.payload.method_type ? <span className={"pd-card__method pd-card__method--" + c.payload.method_type}>{METHOD_LABEL[c.payload.method_type] || c.payload.method_type}</span> : <span className="muted">—</span>}</td>
                  <td className="mono muted">{c.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
      {open && (
        <StackedDrawer title="Вызов" id={open.id} status={open.status} statusMap={REQUEST_STATUS} onClose={() => setOpenId(null)} wide>
          <Section title="Данные вызова">
            <KV items={[
              ["Статус", <StatusPill map={REQUEST_STATUS} value={open.status} />],
              ["Тип", open.type === "payin" ? "Платёж (payin)" : "Выплата (payout)"],
              ["Сумма", <><strong>{fmtMoney(open.amount, "RUB")}</strong> <span className="muted">· {(open.amount / 92.4).toFixed(2)} USDT</span></>],
              ["Дата заявки", <span className="mono">{open.createdAt}</span>],
              ["Дата ответа", <span className="mono">{open.respondedAt}</span>],
              ["Метод", open.payload && open.payload.method_type ? <span className={"pd-card__method pd-card__method--" + open.payload.method_type}>{METHOD_LABEL[open.payload.method_type] || open.payload.method_type}</span> : <span className="muted">—</span>],
              ["Мерчант", <><strong>{merchantName(open.merchant)}</strong> <span className="mono muted">· {open.merchant}</span></>],
              ["Провайдер", <><strong>{provider.name}</strong> <span className="mono muted">· {provider.id}</span></>],
              ["Платёж / выплата", open.order
                ? (() => {
                    const pool = open.type === "payin" ? (typeof PAY_IN !== "undefined" ? PAY_IN : []) : (typeof PAY_OUT !== "undefined" ? PAY_OUT : []);
                    const o = pool.find((x) => x.id === open.order);
                    const smap = open.type === "payin" ? PAY_IN_STATUS : PAY_OUT_STATUS;
                    return o
                      ? <a className="link-cell" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }} onClick={() => window.__adminGo && window.__adminGo(open.type, open.order)}>
                          <strong style={{ color: "var(--accent)" }}>{fmtMoney(o.amount, "RUB")}</strong>
                          <span className="mono muted">{o.date}</span>
                          <StatusPill map={smap} value={o.status} />
                        </a>
                      : <a className="link-cell" style={{ cursor: "pointer", color: "var(--accent)" }} onClick={() => window.__adminGo && window.__adminGo(open.type, open.order)}><span className="mono">{open.order} ↗</span></a>;
                  })()
                : <span className="muted">— не создан</span>],
              ...(open.status === "reject" && open.rejectReason ? [["Причина отказа", <span style={{ color: "var(--bad)" }}>{open.rejectReason}</span>]] : []),
            ]} />
          </Section>
          <Section title="Текст запроса">
            <pre style={{ margin: 0, padding: "12px 14px", borderRadius: 10, background: "var(--paper-2)", border: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6, color: "var(--ink-2)", overflowX: "auto", whiteSpace: "pre" }}>{JSON.stringify(open.payload, null, 2)}</pre>
          </Section>
        </StackedDrawer>
      )}
    </>
  );
}

function ProviderTariffTab({ tariffId }) {
  const t = TARIFFS.find((x) => x.id === tariffId) || TARIFFS[0];
  const inBase = t.payInTrader;
  const [editing, setEditing] = React.useState(null);
  const [rows, setRows] = React.useState([
    { method: "sbp",     rate: +(inBase + 0.0).toFixed(1), min: 100,  max: 100000 },
    { method: "card",    rate: +(inBase + 0.3).toFixed(1), min: 500,  max: 200000 },
    { method: "c2c",     rate: +(inBase + 0.5).toFixed(1), min: 1000, max: 150000 },
    { method: "phone",   rate: +(inBase + 0.0).toFixed(1), min: 100,  max: 100000 },
    { method: "account", rate: +(inBase - 0.5).toFixed(1), min: 5000, max: 500000 },
  ]);
  const setRow = (i, patch) => setRows((rs) => rs.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const removeRow = (i) => { setRows((rs) => rs.filter((_, idx) => idx !== i)); setEditing(null); };
  const addRow = () => { setRows((rs) => [...rs, { method: "sbp", rate: +inBase.toFixed(1), min: 100, max: 100000 }]); setEditing(rows.length); };
  const numStyle = (w) => ({ fontFamily: "var(--font-mono)", fontSize: 12.5, width: w, padding: "4px 8px", textAlign: "right" });

  return (
    <>
      <Section title="Ставки по платёжным методам (Платежи)">
        <table className="table table--inset">
          <thead><tr>
            <th>Метод</th>
            <th className="num">Ставка (провайдеру)</th>
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
                        {PROV_METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <span className={"pd-card__method pd-card__method--" + m.method}>
                        {PROV_METHOD_LABELS[m.method] || m.method}
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
    </>
  );
}
