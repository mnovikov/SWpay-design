// CrowdPay v3 — Dashboard, Reports, System Config, AddTraderWizard

// ─── Dashboard ──────────────────────────────────────────────────────────────
function SectionDashboard({ onGo }) {
  return (
    <>
      <PageHead title="Dashboard" sub="Сводка по сети P2P-процессинга: объёмы, очереди, риск-картина." />
      <div className="stat-row">
        <Stat label="Платежи volume / today" value={fmtMoney(2480000)} delta="+8% к вчера" />
        <Stat label="Выплаты volume / today" value={fmtMoney(1640000)} delta="+3% к вчера" />
        <Stat label="Active Traders" value="5" delta="из 6" />
        <Stat label="Active Terminals" value="7" delta="из 8" />
      </div>
      <div className="stat-row">
        <Stat label="Active Payment Details" value="6" delta="из 8" />
        <Stat label="Pending Выплаты" value="1" delta="доступно к claim" onClick={() => onGo("payout")} clickable />
        <Stat label="Open Disputes" value="3" delta="требуют действий" onClick={() => onGo("disputes")} clickable />
        <Stat label="Депозиты · внимание" value={String(KPI.lowDeposits)} delta="ниже минимума" onClick={() => onGo("deposits")} clickable />
      </div>
      <div className="stat-row">
        <Stat label="Страховые депозиты" value={fmtMoney(KPI.insuranceTotalUsdt, "USDT")} delta="по всем трейдерам" onClick={() => onGo("deposits")} clickable />
        <Stat label="Success rate / today" value="94%" delta="+1.2 п.п." />
        <Stat label="Avg Платежи confirm" value="00:24" delta="время до Auto" />
        <Stat label="Avg Выплаты complete" value="08:42" delta="claim → Completed" />
      </div>

      <div className="row-2">
        <div>
          <Section title="Network activity — Платежи / Выплаты by hour">
            <ChartPlaceholder />
          </Section>
        </div>
        <div>
          <Section title="Risk / Attention queue">
            <ul className="risk-list">
              <li onClick={() => onGo("payout")}><Pill tone="warn">Frozen Выплаты</Pill> <span>1 заявка ожидает решения</span> <span className="mono muted">PO-55016</span></li>
              <li onClick={() => onGo("disputes")}><Pill tone="bad">Disputed</Pill> <span>3 спора требуют действий</span> <span className="mono muted">DSP-441, 440, 439</span></li>
              <li onClick={() => onGo("details")}><Pill tone="info">Frozen Details</Pill> <span>1 реквизит заморожен</span> <span className="mono muted">PD-9004</span></li>
              <li onClick={() => onGo("deposits")}><Pill tone="bad">Low Deposit</Pill> <span>1 трейдер ниже минимума</span> <span className="mono muted">TR-1061</span></li>
            </ul>
          </Section>
        </div>
      </div>

      <Section title="Top Traders">
        <table className="table table--inset">
          <thead><tr><th>Trader</th><th className="num">Платежи vol.</th><th className="num">Выплаты vol.</th><th className="num">Success</th><th className="num">Terminals</th><th className="num">Disputes</th></tr></thead>
          <tbody>
            {TRADERS.filter((t) => t.status === "active").slice(0, 5).map((t) => (
              <tr key={t.id} onClick={() => onGo("traders")} style={{ cursor: "pointer" }}>
                <td><strong>{t.name}</strong> <span className="mono muted">· {t.id}</span></td>
                <td className="num">{fmtMoney(t.payInDay)}</td>
                <td className="num">{fmtMoney(t.payOutDay)}</td>
                <td className="num">{Math.round(t.success * 100)}%</td>
                <td className="num">{t.terminals}</td>
                <td className="num">{t.disputes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Recent Orders">
        <table className="table table--inset">
          <thead><tr><th>ID</th><th>Type</th><th>Time</th><th className="num">Amount</th><th>Trader</th><th>Status</th></tr></thead>
          <tbody>
            {[...PAY_IN.slice(0, 4).map((o) => ({ ...o, _t: "Платежи", _map: PAY_IN_STATUS })),
              ...PAY_OUT.slice(0, 3).map((o) => ({ ...o, _t: "Выплаты", _map: PAY_OUT_STATUS }))].map((o) => (
              <tr key={o._t + o.id} onClick={() => onGo(o._t === "Платежи" ? "payin" : "payout")} style={{ cursor: "pointer" }}>
                <td className="mono">{o.id}</td>
                <td><span className="badge-type">{o._t}</span></td>
                <td className="mono">{o.date}</td>
                <td className="num">{fmtMoney(o.amount)}</td>
                <td>{o.trader ? traderName(o.trader) : <span className="muted">—</span>}</td>
                <td><StatusPill map={o._map} value={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

function Stat({ label, value, delta, onClick, clickable }) {
  return (
    <div className={"stat" + (clickable ? " stat--clickable" : "")} onClick={onClick}>
      <div className="stat__label">{label}</div>
      <div className="stat__value">{value}</div>
      <div className="stat__delta">{delta}</div>
    </div>
  );
}

function ChartPlaceholder() {
  // simple SVG bar chart placeholder, two series
  const hours = Array.from({ length: 12 }, (_, i) => i);
  const payIn = [40, 55, 62, 70, 80, 95, 110, 105, 92, 78, 60, 45];
  const payOut = [25, 30, 38, 45, 50, 60, 72, 68, 55, 48, 35, 28];
  const max = 120;
  return (
    <div className="chart">
      <svg viewBox="0 0 480 160" width="100%" height="160">
        {[0, 40, 80, 120].map((v) => (
          <line key={v} x1="30" y1={150 - (v/max)*140} x2="470" y2={150 - (v/max)*140} stroke="#e3dcc9" strokeDasharray="3 4" />
        ))}
        {hours.map((h) => {
          const x = 40 + h * 36;
          const piH = (payIn[h]/max)*140;
          const poH = (payOut[h]/max)*140;
          return (
            <g key={h}>
              <rect x={x} y={150 - piH} width="13" height={piH} fill="#ef6a3c" rx="2" />
              <rect x={x + 14} y={150 - poH} width="13" height={poH} fill="#5b4b8a" rx="2" />
              <text x={x + 13} y="158" fontSize="9" fill="#807a6e" textAnchor="middle" fontFamily="JetBrains Mono">{8 + h}h</text>
            </g>
          );
        })}
      </svg>
      <div className="chart__legend">
        <span><i style={{ background: "#ef6a3c" }} /> Платежи</span>
        <span><i style={{ background: "#5b4b8a" }} /> Выплаты</span>
      </div>
    </div>
  );
}

// ─── Reports ────────────────────────────────────────────────────────────────
function SectionReports() {
  const [tab, setTab] = React.useState("network");
  return (
    <>
      <PageHead
        title="Reports"
        sub="Управленческая аналитика по сети, трейдерам, банкам и комиссиям."
        actions={<Btn variant="ghost"><span className="mono">↧</span> Экспорт CSV</Btn>}
      />
      <Tabs
        tabs={[
          { id: "network", label: "Network Overview" },
          { id: "trader", label: "Trader Performance" },
          { id: "bank", label: "Bank Performance" },
          { id: "commission", label: "Commission" },
          { id: "deposits", label: "Deposits" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "network" && (
        <>
          <div className="stat-row">
            <Stat label="Total Платежи" value={fmtMoney(48200000)} delta="последние 30 дней" />
            <Stat label="Total Выплаты" value={fmtMoney(32400000)} delta="последние 30 дней" />
            <Stat label="Net flow" value={fmtMoney(15800000)} delta="к оператору" />
            <Stat label="Success rate" value="94%" delta="среднее за период" />
          </div>
          <div className="stat-row">
            <Stat label="Avg processing" value="00:36" delta="Платежи confirm" />
            <Stat label="Active Traders" value="5" delta="6 всего" />
            <Stat label="Active Terminals" value="7" delta="8 всего" />
            <Stat label="Active Payment Details" value="6" delta="8 всего" />
          </div>
          <Section title="Volume by day"><ChartPlaceholder /></Section>
        </>
      )}
      {tab === "trader" && (
        <Section title="Trader Performance — last 30 days">
          <table className="table table--inset">
            <thead><tr><th>Trader</th><th className="num">Платежи</th><th className="num">Выплаты</th><th className="num">Commission</th><th className="num">Disputes</th><th className="num">Failed</th><th className="num">Success</th></tr></thead>
            <tbody>
              {TRADERS.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong> <span className="mono muted">· {t.id}</span></td>
                  <td className="num">{fmtMoney(t.payInDay * 22)}</td>
                  <td className="num">{fmtMoney(t.payOutDay * 22)}</td>
                  <td className="num">{fmtMoney(Math.round(t.payInDay * 22 * 0.02))}</td>
                  <td className="num">{t.disputes}</td>
                  <td className="num">{Math.round((1 - t.success) * 100)}</td>
                  <td className="num">{Math.round(t.success * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}
      {tab === "bank" && (
        <Section title="Bank Performance — last 30 days">
          <table className="table table--inset">
            <thead><tr><th>Bank</th><th className="num">Платежи</th><th className="num">Выплаты</th><th className="num">Success</th><th className="num">Failed</th><th className="num">Disputed</th></tr></thead>
            <tbody>
              {BANKS.map((b, i) => (
                <tr key={b.id}>
                  <td><strong>{b.name}</strong></td>
                  <td className="num">{fmtMoney([18200000, 12400000, 11800000, 5800000][i])}</td>
                  <td className="num">{fmtMoney([12100000, 8900000, 7800000, 3600000][i])}</td>
                  <td className="num">{[96, 94, 91, 88][i]}%</td>
                  <td className="num">{[12, 18, 22, 14][i]}</td>
                  <td className="num">{[2, 3, 4, 1][i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}
      {tab === "commission" && (
        <Section title="Commission Report">
          <table className="table table--inset">
            <thead><tr><th>Trader</th><th>Period</th><th className="num">Gross volume</th><th className="num">Commission earned</th><th className="num">Avg per order</th></tr></thead>
            <tbody>
              {TRADERS.filter((t) => t.status === "active").map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td className="mono">21–27.04</td>
                  <td className="num">{fmtMoney(t.payInDay * 7)}</td>
                  <td className="num">{fmtMoney(Math.round(t.payInDay * 7 * 0.02))}</td>
                  <td className="num">{fmtMoney(Math.round((t.payInDay * 7 * 0.02) / 80))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}
      {tab === "deposits" && (
        <Section title="Deposits Overview — USDT">
          <table className="table table--inset">
            <thead><tr><th>Trader</th><th className="num">Insurance</th><th className="num">Min</th><th className="num">Working</th><th className="num">Locked</th><th className="num">Utilization</th><th>Статус</th></tr></thead>
            <tbody>
              {DEPOSITS.map((d) => (
                <tr key={d.trader}>
                  <td><strong>{traderName(d.trader)}</strong> <span className="mono muted">· {d.trader}</span></td>
                  <td className="num">{fmtMoney(d.insuranceUsdt, "USDT")}</td>
                  <td className="num muted">{fmtMoney(d.insuranceMinUsdt, "USDT")}</td>
                  <td className="num">{fmtMoney(d.workingUsdt, "USDT")}</td>
                  <td className="num muted">{fmtMoney(d.workingLockedUsdt, "USDT")}</td>
                  <td className="num">{Math.round(d.utilization * 100)}%</td>
                  <td><StatusPill map={DEPOSIT_STATUS} value={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}
    </>
  );
}

// ─── System Config ──────────────────────────────────────────────────────────
function SectionConfig() {
  const [tab, setTab] = React.useState("operator");
  return (
    <>
      <PageHead title="System Config" sub="Системные настройки оператора, банков, вебхуков и правил распределения." />
      <div className="settings">
        <nav className="settings__nav">
          {[
            { id: "operator", label: "Operator Settings" },
            { id: "banks", label: "Banks" },
            { id: "webhooks", label: "Webhooks" },
            { id: "payin-rules", label: "Платежи Distribution" },
            { id: "payout-rules", label: "Выплаты Claim Rules" },
            { id: "audit", label: "Audit log" },
          ].map((s) => (
            <button key={s.id} className={tab === s.id ? "is-active" : ""} onClick={() => setTab(s.id)}>{s.label}</button>
          ))}
        </nav>
        <div>
          {tab === "operator" && (
            <Section title="Operator Settings">
              <Field label="Operator name" row><TextInput value="CrowdPay LLC" /></Field>
              <Field label="Default currency" row><Select value="RUB" options={[{value:"RUB",label:"RUB"},{value:"USD",label:"USD"}]} /></Field>
              <Field label="Timezone" row><Select value="Europe/Moscow" options={[{value:"Europe/Moscow",label:"Europe/Moscow (UTC+3)"}]} /></Field>
              <Field label="Платежи timeout" row hint="секунды до Expired"><TextInput value="900" mono /></Field>
              <Field label="Выплаты lock timeout" row hint="секунды на claim"><TextInput value="600" mono /></Field>
            </Section>
          )}
          {tab === "banks" && (
            <Section title="Banks" action={<Btn size="sm" variant="ghost">＋ Add Bank</Btn>}>
              <table className="table table--inset">
                <thead><tr><th>Bank</th><th>Type</th><th className="num">Default daily limit</th><th>SMS profile</th><th>Status</th></tr></thead>
                <tbody>
                  {BANKS.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.name}</strong></td>
                      <td>SBP</td>
                      <td className="num">{fmtMoney(800000)}</td>
                      <td className="mono muted">{b.short.toLowerCase()}-sms-v2</td>
                      <td><Pill tone="ok">Enabled</Pill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}
          {tab === "webhooks" && (
            <Section title="Webhooks" action={<Btn size="sm" variant="ghost">＋ Add Webhook</Btn>}>
              <Field label="Endpoint" row><TextInput value="https://api.crowdpay.example/webhooks/orders" mono /></Field>
              <Field label="Events" row><TextInput value="payin.completed, payout.completed, dispute.opened" mono /></Field>
              <Field label="Retry policy" row hint="3 попытки, экспоненциальный backoff"><TextInput value="exponential, max 3" mono /></Field>
              <Field label="Last delivery" row><div><Pill tone="ok">200 OK</Pill> <span className="mono muted" style={{ marginLeft: 8 }}>27.04 14:22</span></div></Field>
            </Section>
          )}
          {tab === "payin-rules" && (
            <Section title="Платежи Distribution Rules">
              <Note tone="info">Правила определяют, какие Payment Details получают входящий Платежи.</Note>
              <Field label="Distribute by bank" row><span><Pill tone="ok">On</Pill></span></Field>
              <Field label="Respect daily/monthly limits" row><span><Pill tone="ok">On</Pill></span></Field>
              <Field label="Respect active Payment Details only" row><span><Pill tone="ok">On</Pill></span></Field>
              <Field label="Fallback if assigned PD fails" row><span><Pill tone="info">Reassign within bank</Pill></span></Field>
            </Section>
          )}
          {tab === "payout-rules" && (
            <Section title="Выплаты Claim Rules">
              <Field label="Lock timeout" row hint="секунды"><TextInput value="600" mono /></Field>
              <Field label="Max active Выплаты per Trader" row><TextInput value="3" mono /></Field>
              <Field label="Auto-release on timeout" row><span><Pill tone="ok">On</Pill></span></Field>
            </Section>
          )}
          {tab === "audit" && (
            <Section title="Audit log">
              <table className="table table--inset">
                <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th></tr></thead>
                <tbody>
                  <tr><td className="mono">27.04 14:30</td><td className="mono">a.smirnov</td><td>Resolved dispute</td><td className="mono">DSP-438</td></tr>
                  <tr><td className="mono">27.04 13:42</td><td className="mono">a.smirnov</td><td>Approved Выплаты proof</td><td className="mono">PO-55018</td></tr>
                  <tr><td className="mono">27.04 12:14</td><td className="mono">v.popov</td><td>Created Settlement Request</td><td className="mono">ST-7700</td></tr>
                  <tr><td className="mono">27.04 11:02</td><td className="mono">a.smirnov</td><td>Opened dispute</td><td className="mono">DSP-441</td></tr>
                  <tr><td className="mono">27.04 09:48</td><td className="mono">a.smirnov</td><td>Frozen Payment Details</td><td className="mono">PD-9004</td></tr>
                </tbody>
              </table>
            </Section>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Add Trader Wizard ──────────────────────────────────────────────────────
function AddTraderWizard({ onClose, trader }) {
  const isEdit = !!trader;
  const baseTariffs = TARIFFS.filter((t) => t.status === "active");
  const [tariffId, setTariffId] = React.useState(trader?.tariff || baseTariffs[0]?.id || "TF-001");
  const baseTariff = TARIFFS.find((t) => t.id === tariffId) || baseTariffs[0];
  const [tab, setTab] = React.useState("payin");

  const [name, setName] = React.useState(trader?.name || "");
  const [phone, setPhone] = React.useState(trader?.phone || "");
  const [email, setEmail] = React.useState(trader?.email || "");
  const [telegram, setTelegram] = React.useState(trader?.telegram || "");
  const [team, setTeam] = React.useState(trader?.team || "Альфа");
  const [walletWorking, setWalletWorking] = React.useState(trader?.walletWorking || "");
  const [walletInsurance, setWalletInsurance] = React.useState(trader?.walletInsurance || "");
  const [worksVip, setWorksVip] = React.useState(!!trader?.vip);

  // Пример тарифа в формате приложения трейдера: по платёжным методам
  const buildMethods = (t) => {
    const inBase = t.payInTrader;
    const outBase = t.payOutTrader;
    return {
      payIn: [
        { method: "sbp",     label: "СБП",                 rate: +(inBase + 0.0).toFixed(1), min: 100,  max: 100000 },
        { method: "card",    label: "Карта (номер)",       rate: +(inBase + 0.3).toFixed(1), min: 500,  max: 200000 },
        { method: "c2c",     label: "Card-to-Card",        rate: +(inBase + 0.5).toFixed(1), min: 1000, max: 150000 },
        { method: "phone",   label: "По номеру телефона",  rate: +(inBase + 0.0).toFixed(1), min: 100,  max: 100000 },
        { method: "account", label: "По расчётному счёту", rate: +(inBase - 0.5).toFixed(1), min: 5000, max: 500000 },
      ],
      payOut: [
        { method: "sbp",     label: "СБП",                 rate: +(outBase + 0.0).toFixed(1), min: 100,  max: 100000 },
        { method: "card",    label: "Карта (номер)",       rate: +(outBase + 0.3).toFixed(1), min: 500,  max: 150000 },
        { method: "c2c",     label: "Card-to-Card",        rate: +(outBase + 0.5).toFixed(1), min: 1000, max: 150000 },
        { method: "phone",   label: "По номеру телефона",  rate: +(outBase + 0.0).toFixed(1), min: 100,  max: 100000 },
        { method: "account", label: "По расчётному счёту", rate: +(outBase - 0.3).toFixed(1), min: 5000, max: 500000 },
      ],
    };
  };

  const [methods, setMethods] = React.useState(() => buildMethods(baseTariff));
  React.useEffect(() => { setMethods(buildMethods(baseTariff)); /* eslint-disable-next-line */ }, [tariffId]);

  const rows = tab === "payin" ? methods.payIn : methods.payOut;
  const setRow = (i, patch) => {
    const key = tab === "payin" ? "payIn" : "payOut";
    const next = methods[key].map((r, idx) => idx === i ? { ...r, ...patch } : r);
    setMethods({ ...methods, [key]: next });
  };
  const removeRow = (i) => {
    const key = tab === "payin" ? "payIn" : "payOut";
    setMethods((prev) => ({ ...prev, [key]: prev[key].filter((_, idx) => idx !== i) }));
  };
  const addRow = () => {
    const key = tab === "payin" ? "payIn" : "payOut";
    const base = tab === "payin" ? baseTariff.payInTrader : baseTariff.payOutTrader;
    setMethods((prev) => ({ ...prev, [key]: [...prev[key], { method: "sbp", rate: +base.toFixed(1), min: 100, max: 100000 }] }));
  };
  const traderMethodOptions = [
    { value: "sbp", label: "СБП" }, { value: "card", label: "Карта" }, { value: "c2c", label: "C2C" },
    { value: "phone", label: "Phone" }, { value: "account", label: "Счёт" },
  ];

  return (
    <Modal
      title={isEdit ? ("Редактировать трейдера · " + trader.id) : "Добавить трейдера"}
      onClose={onClose}
      wide
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <span className="spacer" />
        <Btn variant="accent" onClick={onClose}>{isEdit ? "Сохранить" : "Создать трейдера"}</Btn>
      </>}
    >
      <Section title="Контакт">
        <Field label="Имя"><TextInput value={name} onChange={setName} placeholder="Например, Alex Morozov" /></Field>
        <div className="row-2">
          <Field label="Телефон"><TextInput mono value={phone} onChange={setPhone} placeholder="+7 900 …" /></Field>
          <Field label="Email"><TextInput value={email} onChange={setEmail} placeholder="trader@example.com" /></Field>
        </div>
        <div className="row-2">
          <Field label="Telegram"><TextInput mono value={telegram} onChange={setTelegram} placeholder="@username" /></Field>
          <Field label="Команда">
            <Select value={team} onChange={setTeam} options={[
              { value: "Альфа", label: "Альфа" },
              { value: "Бета",  label: "Бета" },
              { value: "Гамма", label: "Гамма" },
            ]} />
          </Field>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, cursor: "pointer", userSelect: "none" }}>
          <input type="checkbox" checked={worksVip} onChange={(e) => setWorksVip(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--accent)", cursor: "pointer", flexShrink: 0 }} />
          <span>
            <span style={{ fontWeight: 600 }}>Работает с VIP</span>
            <span className="muted" style={{ display: "block", fontSize: 12.5 }}>Трейдер может принимать платежи от VIP-клиентов</span>
          </span>
        </label>
      </Section>

      <Section title="USDT кошельки">
        <Field label="Кошелёк рабочего депозита" hint="Используется для оборота под Выплаты">
          <TextInput mono value={walletWorking} onChange={setWalletWorking} placeholder="T...  (TRC-20)" />
        </Field>
        <Field label="Кошелёк страхового депозита" hint="Используется для покрытия штрафов и спорных операций">
          <TextInput mono value={walletInsurance} onChange={setWalletInsurance} placeholder="T...  (TRC-20)" />
        </Field>
      </Section>

      <Section title="Тариф">
        <FilterChips
          filters={[
            { value: "payin",  label: "Платежи",  count: methods.payIn.length },
            { value: "payout", label: "Выплаты", count: methods.payOut.length },
          ]}
          value={tab}
          onChange={setTab}
        />

        <table className="table table--inset">
          <thead><tr>
            <th>Метод</th>
            <th className="num">Ставка (трейдеру)</th>
            <th className="num">Мин. сумма</th>
            <th className="num">Макс. сумма</th>
            <th style={{ width: 40 }}></th>
          </tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5}><Empty>Нет ставок — добавьте строку</Empty></td></tr>
            ) : rows.map((m, i) => (
              <tr key={i}>
                <td>
                  <select className="field__input" style={{ fontSize: 12.5, width: 110, padding: "4px 8px" }}
                    value={m.method} onChange={(e) => setRow(i, { method: e.target.value })}>
                    {traderMethodOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
    </Modal>
  );
}

Object.assign(window, { SectionDashboard, SectionReports, SectionConfig, AddTraderWizard });
