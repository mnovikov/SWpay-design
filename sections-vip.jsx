// CrowdPay — раздел «VIP»
// Реестр известных нам VIP-клиентов (крупных плательщиков).
//  • статус: привязан (есть трейдеры) / ожидает (ещё не привязан)
//  • в карточке — трейдеры с реквизитами и платежи клиента по трейдерам

const VIP_METHOD_LABEL = { sbp: "СБП", card: "Карта", c2c: "C2C", phone: "Phone", account: "Счёт" };

// платежи VIP-клиента (по идентификатору плательщика)
function vipPayments(vip) {
  const pool = typeof PAY_IN !== "undefined" ? PAY_IN : [];
  return pool.filter((o) => o.customer === vip.customer);
}
function vipLastPayment(vip) {
  const ps = vipPayments(vip);
  if (!ps.length) return null;
  return ps.map((o) => o.date).sort().slice(-1)[0];
}

// VIP-слоты реквизита: всего 3 на реквизит, занятые считаем по привязкам во всех VIP
const VIP_SLOTS_TOTAL = 3;
function vipUsedSlots(detailsId) {
  const pool = typeof VIPS !== "undefined" ? VIPS : [];
  let n = 0;
  pool.forEach((v) => v.traders.forEach((t) => { if (t.details === detailsId) n++; }));
  return n;
}
function vipFreeSlots(detailsId) {
  return Math.max(0, VIP_SLOTS_TOTAL - vipUsedSlots(detailsId));
}

function SectionVIP({ onGo }) {
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [merchantFilter, setMerchantFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [extraVips, setExtraVips] = React.useState([]);
  const [showAddVip, setShowAddVip] = React.useState(false);
  const [importReport, setImportReport] = React.useState(null);
  const fileRef = React.useRef(null);

  const merchants = typeof MERCHANTS !== "undefined" ? MERCHANTS : [];
  const merchantNameFor = (mid) => (merchants.find((m) => m.id === mid) || {}).name || mid;
  const base = typeof VIPS !== "undefined" ? VIPS : [];
  const all = [...extraVips, ...base];

  let seq = base.length + extraVips.length;
  const makeVip = ({ merchant, extId, customer }) => {
    seq += 1;
    const n = 3000 + seq;
    return {
      id: "VIP-" + n,
      status: "waiting",
      merchant,
      merchantName: merchantNameFor(merchant),
      customer: customer || ("VIP-" + n),
      extId,
      createdAt: new Date().toLocaleDateString("ru-RU"),
      traders: [],
    };
  };

  const addOne = (rec) => setExtraVips((prev) => [makeVip(rec), ...prev]);

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const rows = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const known = new Set(merchants.map((m) => m.id));
      const byName = new Map(merchants.map((m) => [m.name.toLowerCase(), m.id]));
      const added = [];
      let skipped = 0;
      rows.forEach((line, i) => {
        if (i === 0 && /мерчант|merchant|ext/i.test(line)) return; // header
        const cols = line.split(/[;,\t]/).map((c) => c.trim());
        let [mRaw, extId, customer] = cols;
        if (!mRaw || !extId) { skipped++; return; }
        let merchant = known.has(mRaw) ? mRaw : byName.get(mRaw.toLowerCase());
        if (!merchant) { skipped++; return; }
        added.push(makeVip({ merchant, extId, customer }));
      });
      if (added.length) setExtraVips((prev) => [...added, ...prev]);
      setImportReport({ added: added.length, skipped });
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  const statusFilters = [
    { value: "all",     label: "Все",      count: all.length },
    { value: "linked",  label: "Привязаны", count: all.filter((v) => v.status === "linked").length },
    { value: "waiting", label: "Ожидают",   count: all.filter((v) => v.status === "waiting").length },
  ];
  const merchantOptions = [
    { value: "all", label: "Все мерчанты" },
    ...(typeof MERCHANTS !== "undefined" ? MERCHANTS : []).map((m) => ({ value: m.id, label: m.name })),
  ];
  const visible = all.filter((v) =>
    (statusFilter === "all" || v.status === statusFilter) &&
    (merchantFilter === "all" || v.merchant === merchantFilter)
  );
  const open = all.find((v) => v.id === openId);

  return (
    <>
      <PageHead
        title="VIP"
        sub="Реестр известных VIP-клиентов. Фиксируем плательщика, его мерчанта и привязанных трейдеров с реквизитами."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <ChipSelect value={statusFilter} onChange={setStatusFilter} options={statusFilters.map((f) => ({ value: f.value != null ? f.value : f.id, label: f.label, count: f.count }))} align="left" />
        <ChipSelect value={merchantFilter} onChange={setMerchantFilter} options={merchantOptions} placeholder="Мерчант" align="left" />
        <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" style={{ display: "none" }} onChange={handleFile} />
        <span style={{ whiteSpace: "nowrap" }}><Btn onClick={() => fileRef.current && fileRef.current.click()} title="CSV / TXT: мерчант; внешний ID; клиент">Загрузить из файла</Btn></span>
        <span style={{ whiteSpace: "nowrap" }}><Btn variant="primary" onClick={() => setShowAddVip(true)}>Добавить VIP</Btn></span>
      </div>

      {importReport && (
        <div style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 8, background: "var(--paper-3)", fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
          <span>Импорт: добавлено <strong>{importReport.added}</strong>{importReport.skipped ? <> · пропущено <strong>{importReport.skipped}</strong></> : null}</span>
          <span className="spacer" style={{ flex: 1 }} />
          <Btn size="sm" variant="ghost" onClick={() => setImportReport(null)}>Скрыть</Btn>
        </div>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 130 }}>Статус</th>
              <th>Мерчант</th>
              <th>Дата создания</th>
              <th>Последний платёж</th>
              <th>Трейдер</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((v) => {
              const first = v.traders[0];
              const extra = v.traders.length - 1;
              const lastPay = vipLastPayment(v);
              return (
                <tr key={v.id} className={openId === v.id ? "is-selected" : ""} onClick={() => setOpenId(v.id)} style={{ cursor: "pointer" }}>
                  <td>
                    <StatusPill map={VIP_STATUS} value={v.status} />
                    <div className="mono muted" style={{ fontSize: 11, marginTop: 3 }}>{v.id}</div>
                  </td>
                  <td>
                    <strong>{v.merchantName}</strong>
                    <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{v.customer}</div>
                  </td>
                  <td className="mono muted">{v.createdAt}</td>
                  <td className="mono">{lastPay ? lastPay : <span className="muted">—</span>}</td>
                  <td>
                    {first ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: "var(--paper-3)", borderRadius: 999, padding: "3px 10px", fontSize: 13, lineHeight: 1.2 }}>
                        <span>{traderName(first.trader)}</span>
                        {extra > 0 && <span style={{ fontWeight: 600, color: "var(--text-2)" }}>+{extra}</span>}
                      </span>
                    ) : <span className="muted">— не привязан</span>}
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr><td colSpan={5}><Empty>Нет VIP по фильтру</Empty></td></tr>
            )}
          </tbody>
        </table>
        <div className="table-foot">Показано <strong>{visible.length}</strong> из <strong>{all.length}</strong></div>
      </div>

      {open && <VipDrawer vip={open} onGo={onGo} onClose={() => setOpenId(null)} />}
      {showAddVip && (
        <AddVipModal
          merchants={merchants}
          onClose={() => setShowAddVip(false)}
          onAdd={(rec) => { addOne(rec); setShowAddVip(false); }}
        />
      )}
    </>
  );
}

function VipDrawer({ vip, onGo, onClose }) {
  const [tab, setTab] = React.useState("overview");
  const [payId, setPayId] = React.useState(null);
  const [traderFilter, setTraderFilter] = React.useState("all");
  const [period, setPeriod] = React.useState("all");
  const [unboundTraders, setUnboundTraders] = React.useState([]);
  const [added, setAdded] = React.useState([]);
  const [showAdd, setShowAdd] = React.useState(false);
  const PayDrawer = window.PayInDrawerV2;
  const StatusCell = window.PayInStatusCell;

  const payments = vipPayments(vip);
  const lastPay = vipLastPayment(vip);

  // фильтр по времени (демо: заявки на одной дате — «Час» по времени, «Вчера» пусто)
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
  const latest = payments.reduce((mx, o) => Math.max(mx, toMin(o.date)), 0);
  const inPeriod = (o) => {
    if (period === "yesterday") return false;
    if (period === "hour") return toMin(o.date) >= latest - 60;
    return true;
  };

  // объединённый список привязок: базовые + добавленные − отвязанные
  const traders = [...vip.traders, ...added].filter((t) => !unboundTraders.includes(t.trader));

  const traderOptions = [
    { value: "all", label: "Все трейдеры" },
    ...traders.map((t) => ({ value: t.trader, label: traderName(t.trader) })),
  ];
  const shown = payments.filter((o) => inPeriod(o) && (traderFilter === "all" || o.trader === traderFilter));
  const isOk = (o) => ["completed", "auto-confirmed"].includes(o.status);
  const paidSum = shown.reduce((s, o) => s + o.amount, 0);
  const conv = shown.length ? Math.round(shown.filter(isOk).length / shown.length * 100) : 0;

  const payRow = payId ? (typeof PAY_IN !== "undefined" ? PAY_IN.find((o) => o.id === payId) : null) : null;

  return (
    <Drawer
      title="VIP-клиент"
      status={vip.status}
      statusMap={VIP_STATUS}
      onClose={onClose}
      wide
      footer={vip.status === "waiting"
        ? <Btn variant="primary">Привязать трейдера</Btn>
        : <Btn variant="primary" onClick={() => setShowAdd(true)}>Добавить трейдера</Btn>}
    >
      <Tabs
        tabs={[
          { id: "overview", label: "Обзор" },
          { id: "payments", label: `Платежи (${payments.length})` },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "overview" && <>
        <Section title="Данные">
          <KV items={[
            ["Статус", <StatusPill map={VIP_STATUS} value={vip.status} />],
            ["Внешний ID", <MonoCopy value={vip.extId} />],
            ["Дата создания", <span className="mono">{vip.createdAt}</span>],
            ["Дата последнего платежа", lastPay ? <span className="mono">{lastPay}</span> : <span className="muted">— платежей не было</span>],
            ["Мерчант", <a className="link-cell" style={{ cursor: "pointer", color: "var(--accent)" }} onClick={() => onGo && onGo("merchants", vip.merchant)}><strong>{vip.merchantName}</strong> <span className="mono muted">· {vip.merchant}</span></a>],
            ["Клиент", <span className="mono">{vip.id}</span>],
          ]} />
        </Section>

        <Section title={`Трейдеры и реквизиты (${traders.length})`}>
          {traders.length === 0 ? <Empty>Трейдеры ещё не привязаны</Empty> : (
            <table className="table table--inset">
              <thead><tr><th>Трейдер</th><th>Метод</th><th>Реквизит</th><th>Банк</th><th></th></tr></thead>
              <tbody>
                {traders.map((t) => {
                  const pd = (typeof PAYMENT_DETAILS !== "undefined" ? PAYMENT_DETAILS : []).find((p) => p.id === t.details);
                  return (
                    <tr key={t.trader}>
                      <td>
                        <strong>{traderName(t.trader)}</strong>
                        <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>{t.trader}</div>
                      </td>
                      <td>{pd ? <span className={"pd-card__method pd-card__method--" + pd.method}>{VIP_METHOD_LABEL[pd.method] || pd.method}</span> : <span className="muted">—</span>}</td>
                      <td className="mono">{pd ? pd.target : t.details}</td>
                      <td>{pd ? bankName(pd.bank) : <span className="muted">—</span>}</td>
                      <td style={{ textAlign: "right" }}>
                        <Btn variant="ghost" size="sm" onClick={() => setUnboundTraders((prev) => [...prev, t.trader])}>Отвязать</Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Section>
      </>}

      {tab === "payments" && <>
        <div className="section">
          <div className="stat-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
            <div className="stat">
              <div className="stat__label">Сумма платежей</div>
              <div className="stat__value">{fmtMoney(paidSum, "RUB")}</div>
              <div className="stat__delta">{shown.length} операций</div>
            </div>
            <div className="stat">
              <div className="stat__label">Конверсия</div>
              <div className="stat__value">{conv}<span className="ccy">%</span></div>
              <div className="stat__delta">{shown.filter(isOk).length} из {shown.length} успешно</div>
            </div>
          </div>
        </div>

        <div className="pd-pay-filters" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <ChipSelect value={traderFilter} onChange={setTraderFilter} options={traderOptions} placeholder="Трейдер" />
          <div style={{ marginLeft: "auto" }}>
            <ChipSelect value={period} onChange={setPeriod} options={PERIOD_CHIPS} />
          </div>
        </div>

        <Section title="Платежи по трейдеру">
          {payments.length === 0 ? <Empty>Платежей нет</Empty> :
            shown.length === 0 ? <Empty>Нет платежей по фильтру</Empty> :
            <table className="table table--inset">
              <thead><tr><th>Статус</th><th className="num">Сумма</th><th>Трейдер</th><th>Создана</th></tr></thead>
              <tbody>
                {shown.map((o) =>
                  <tr key={o.id} onClick={() => PayDrawer && setPayId(o.id)} style={{ cursor: PayDrawer ? "pointer" : "default" }}>
                    <td>{StatusCell ? <StatusCell order={o} /> : <StatusPill map={PAY_IN_STATUS} value={o.status} />}</td>
                    <td className="num">{fmtMoney(o.amount, "RUB")}</td>
                    <td>{o.trader ? traderName(o.trader) : <span className="muted">—</span>}</td>
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

      {showAdd && (
        <AddVipTraderModal
          exclude={traders}
          onClose={() => setShowAdd(false)}
          onAdd={(link) => { setAdded((prev) => [...prev, link]); setShowAdd(false); }}
        />
      )}
    </Drawer>
  );
}

function AddVipTraderModal({ exclude, onClose, onAdd }) {
  const traders = (typeof TRADERS !== "undefined" ? TRADERS : []).filter((t) => t.vip && t.status === "active");
  const [traderId, setTraderId] = React.useState("");
  const [detailsId, setDetailsId] = React.useState("");

  // реквизиты выбранного трейдера, активные, со свободными VIP-слотами
  const allPd = typeof PAYMENT_DETAILS !== "undefined" ? PAYMENT_DETAILS : [];
  const pdOptions = traderId
    ? allPd.filter((p) => p.trader === traderId && p.status === "active" && vipFreeSlots(p.id) > 0)
    : [];

  const traderOpts = [
    { value: "", label: "— выберите трейдера —" },
    ...traders.map((t) => ({ value: t.id, label: `${t.name} · ${t.id}` })),
  ];
  const pdOpts = [
    { value: "", label: pdOptions.length ? "— выберите реквизит —" : "нет реквизитов со слотами" },
    ...pdOptions.map((p) => ({
      value: p.id,
      label: `${VIP_METHOD_LABEL[p.method] || p.method} · ${p.target} · ${bankName(p.bank)} · слотов ${vipFreeSlots(p.id)}/${VIP_SLOTS_TOTAL}`,
    })),
  ];

  const canAdd = traderId && detailsId;

  return (
    <Modal
      title="Добавить трейдера"
      onClose={onClose}
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <span className="spacer" />
        <Btn variant="primary" disabled={!canAdd} onClick={() => canAdd && onAdd({ trader: traderId, details: detailsId })}>Привязать</Btn>
      </>}
    >
      <Field label="Трейдер">
        <Select value={traderId} onChange={(v) => { setTraderId(v); setDetailsId(""); }} options={traderOpts} />
      </Field>
      <Field label="Реквизит" hint="Доступны активные реквизиты выбранного трейдера со свободными VIP-слотами">
        <Select value={detailsId} onChange={setDetailsId} options={pdOpts} disabled={!traderId || pdOptions.length === 0} />
      </Field>
      {traderId && pdOptions.length === 0 && (
        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>У этого трейдера нет реквизитов со свободными VIP-слотами.</div>
      )}
    </Modal>
  );
}

function AddVipModal({ merchants, onClose, onAdd }) {
  const [merchant, setMerchant] = React.useState("");
  const [extId, setExtId] = React.useState("");
  const [customer, setCustomer] = React.useState("");

  const merchantOpts = [
    { value: "", label: "— выберите мерчанта —" },
    ...merchants.map((m) => ({ value: m.id, label: `${m.name} · ${m.id}` })),
  ];
  const canAdd = merchant && extId.trim();

  return (
    <Modal
      title="Добавить VIP"
      onClose={onClose}
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <span className="spacer" style={{ flex: 1 }} />
        <Btn variant="primary" disabled={!canAdd} onClick={() => canAdd && onAdd({ merchant, extId: extId.trim(), customer: customer.trim() })}>Добавить</Btn>
      </>}
    >
      <Field label="Мерчант">
        <Select value={merchant} onChange={setMerchant} options={merchantOpts} />
      </Field>
      <Field label="Внешний ID" hint="Идентификатор плательщика на стороне мерчанта">
        <TextInput value={extId} onChange={setExtId} placeholder="напр. betcity-usr-4471" mono />
      </Field>
      <Field label="Клиент" hint="Необязательно — подставится автоматически">
        <TextInput value={customer} onChange={setCustomer} placeholder="напр. Customer #10040" />
      </Field>
    </Modal>
  );
}

Object.assign(window, { SectionVIP, VipDrawer });
