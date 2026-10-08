// CrowdPay — раздел «Рефералы»
// Зеркало раздела «Команды», но единицей является РЕФЕРАЛ (партнёр-аффилиат),
// который привёл список МЕРЧАНТОВ (а не трейдеров, как в командах).
// Таблица-сетка карточек и drawer идентичны командам.

// Партнёр-владелец реферала (контакт, под которым он логинится)
const REFERRAL_OWNER = {
  "Орбита": { name: "Сергей Лазарев", login: "s.lazarev" },
  "Вектор": { name: "Ольга Кузьмина", login: "o.kuzmina" },
  "Гранд":  { name: "Игорь Белов",    login: "i.belov" },
};
// Комиссия реферала (что партнёр получает с оборота приведённых мерчантов) + баланс
const REFERRAL_TARIFFS = {
  "Орбита": { payIn: 0.5, payOut: 0.3, balance: 1240.50 },
  "Вектор": { payIn: 0.4, payOut: 0.2, balance: 312.80 },
  "Гранд":  { payIn: 0.3, payOut: 0.2, balance: 0 },
};

// ─── Section: Рефералы ──────────────────────────────────────────────────────
function SectionReferrals() {
  const [openName, setOpenName] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);

  const map = {};
  MERCHANTS.forEach((m) => {
    const key = m.referral || "—";
    if (!map[key]) {
      map[key] = {
        name: key, merchants: 0, active: 0, suspended: 0,
        payInRub: 0, payOutRub: 0, payInCount: 0, payOutCount: 0,
        successSum: 0,
      };
    }
    const r = map[key];
    r.merchants += 1;
    if (m.status === "active")    r.active += 1;
    if (m.status === "suspended") r.suspended += 1;
    r.payInRub   += (m.today?.payInRub)   || 0;
    r.payOutRub  += (m.today?.payOutRub)  || 0;
    r.payInCount += (m.today?.payInCount) || 0;
    r.payOutCount += (m.today?.payOutCount) || 0;
    r.successSum += (m.today?.success) || 0;
  });

  const referrals = Object.values(map).map((r) => {
    let status = "active";
    if (r.active === 0 && r.suspended > 0) status = "suspended";
    return {
      ...r,
      status,
      success: r.merchants ? r.successSum / r.merchants : 0,
      owner: REFERRAL_OWNER[r.name] || null,
    };
  });

  return (
    <>
      <PageHead
        title="Рефералы"
        sub="Партнёры-аффилиаты и приведённые ими мерчанты. Суммарные обороты по рефералу."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, justifyContent: "flex-end" }}>
        <Btn variant="primary" size="sm" style={{ borderRadius: 999, padding: "6px 14px", fontSize: 13 }} onClick={() => setShowAdd(true)}>Создать реферала</Btn>
      </div>
      <div className="pd-grid">
        {referrals.map((rf) => {
          const isSelected = openName === rf.name;
          const successPct = Math.round((rf.success || 0) * 100);
          const successTone = successPct >= 97 ? " is-ok" : successPct < 90 ? " is-bad" : "";
          const accent = rf.status === "suspended" ? " pd-card--blocked" : "";
          return (
            <div
              key={rf.name}
              className={"pd-card" + accent + (isSelected ? " is-selected" : "")}
              onClick={() => setOpenName(rf.name)}
            >
              <div className="pd-card__head">
                <div style={{ minWidth: 0 }}>
                  <div className="pd-card__target">{rf.name}</div>
                  <div className="pd-card__sub">
                    {rf.owner ? (
                      <>
                        <span>{rf.owner.name}</span>
                        <span className="pd-card__sub-sep" />
                        <span className="mono">{rf.owner.login}</span>
                      </>
                    ) : <span>Без владельца</span>}
                  </div>
                </div>
                <div className="pd-card__head-r">
                  <StatusPill map={MERCHANT_STATUS} value={rf.status} />
                </div>
              </div>

              <div className="pd-card__stats" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="pd-card__stat">
                  <div className="pd-card__stat-label">Платежи</div>
                  <div className="pd-card__stat-value">{fmtMoney(rf.payInRub / 92.4, "USDT")}</div>
                  <div className="pd-card__limit-nums">{rf.payInCount} ord</div>
                </div>
                <div className="pd-card__stat">
                  <div className="pd-card__stat-label">Выплаты</div>
                  <div className="pd-card__stat-value">{fmtMoney(rf.payOutRub / 92.4, "USDT")}</div>
                  <div className="pd-card__limit-nums">{rf.payOutCount} ord</div>
                </div>
                <div className="pd-card__stat">
                  <div className="pd-card__stat-label">Success</div>
                  <div className={"pd-card__stat-value" + successTone}>{successPct}%</div>
                </div>
                <div className="pd-card__stat">
                  <div className="pd-card__stat-label">Мерчанты</div>
                  <div className="pd-card__stat-value">{rf.merchants}</div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
      {openName && (() => {
        const open = referrals.find((rf) => rf.name === openName);
        if (!open) return null;
        return <ReferralDrawer referral={open} existingNames={referrals.map((r) => r.name)} onClose={() => setOpenName(null)} />;
      })()}
      {showAdd && <AddReferralModal existingNames={referrals.map((r) => r.name)} onClose={() => setShowAdd(false)} />}
    </>
  );
}

// ─── Referral Owner Access (login + password reset) ─────────────────────────
function ReferralOwnerAccessTab({ referral }) {
  const owner = referral.owner;
  const [newPw, setNewPw] = React.useState(null);
  const [resetAt, setResetAt] = React.useState(null);
  const [reveal, setReveal] = React.useState(true);

  const doReset = () => {
    setNewPw(genPassword());
    setReveal(true);
    const now = new Date();
    setResetAt(now.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }));
  };

  if (!owner) {
    return (
      <Section title="Учётные данные владельца">
        <Empty>У реферала не назначен владелец — управлять доступом нечем.</Empty>
      </Section>
    );
  }

  const email = owner.email || (owner.login + "@crowdpay.demo");

  return (
    <>
      <Section title="Учётные данные владельца">
        <KV items={[
          ["Логин / Email", <MonoCopy value={email} />],
          ["Реферал", referral.name],
          ["Статус", <StatusPill map={MERCHANT_STATUS} value={referral.status} />],
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
            Сброс сгенерирует новый временный пароль для владельца. Текущий пароль перестанет действовать сразу после сброса.
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
              Пароль показывается только сейчас. Скопируйте и передайте владельцу по защищённому каналу — повторно посмотреть его будет нельзя.
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

// ─── Create / Edit Referral Modal ───────────────────────────────────────────
function AddReferralModal({ existingNames = [], referral = null, onClose }) {
  const isEdit = !!referral;
  const [name, setName] = React.useState(referral ? referral.name : "");

  const [ownerName, setOwnerName] = React.useState(referral && referral.owner ? referral.owner.name : "");
  const [ownerPhone, setOwnerPhone] = React.useState(referral && referral.owner ? (referral.owner.phone || "") : "");
  const [ownerEmail, setOwnerEmail] = React.useState(referral && referral.owner ? (referral.owner.email || "") : "");
  const [ownerTelegram, setOwnerTelegram] = React.useState(referral && referral.owner ? (referral.owner.telegram || "") : "");

  const [payInRate, setPayInRate] = React.useState(referral && referral.tariff ? String(referral.tariff.payIn) : "0.5");
  const [payOutRate, setPayOutRate] = React.useState(referral && referral.tariff ? String(referral.tariff.payOut) : "0.3");

  const otherNames = isEdit ? existingNames.filter((n) => n.toLowerCase() !== referral.name.toLowerCase()) : existingNames;
  const nameTaken = name.trim() && otherNames.map((n) => n.toLowerCase()).includes(name.trim().toLowerCase());
  const canCreate = name.trim().length >= 2 && !nameTaken && ownerName.trim().length >= 2;

  return (
    <Modal
      title={isEdit ? ("Редактировать реферала · " + referral.name) : "Новый реферал"}
      onClose={onClose}
      wide
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <span className="spacer" />
        <Btn variant="accent" disabled={!canCreate} onClick={onClose}>{isEdit ? "Сохранить" : "Создать реферала"}</Btn>
      </>}
    >
      <Section title="Реферал">
        <Field
          label="Название реферала"
          hint={nameTaken ? "Реферал с таким названием уже есть" : "Короткое, узнаваемое (например, «Орбита»)"}
        >
          <TextInput value={name} onChange={setName} placeholder="Например, Орбита" />
        </Field>
      </Section>

      <Section title="Владелец">
        <Field label="Имя"><TextInput value={ownerName} onChange={setOwnerName} placeholder="Например, Сергей Лазарев" /></Field>
        <div className="row-2">
          <Field label="Телефон"><TextInput mono value={ownerPhone} onChange={setOwnerPhone} placeholder="+7 900 …" /></Field>
          <Field label="Email"><TextInput value={ownerEmail} onChange={setOwnerEmail} placeholder="partner@example.com" /></Field>
        </div>
        <Field label="Telegram"><TextInput mono value={ownerTelegram} onChange={setOwnerTelegram} placeholder="@username" /></Field>
      </Section>

      <Section title="Тариф реферала">
        <div className="row-2">
          <Field label="Ставка на ввод, %" hint="% с каждого платежа">
            <TextInput mono value={payInRate} onChange={setPayInRate} placeholder="0.5" />
          </Field>
          <Field label="Ставка на вывод, %" hint="% с каждой выплаты">
            <TextInput mono value={payOutRate} onChange={setPayOutRate} placeholder="0.3" />
          </Field>
        </div>
      </Section>
    </Modal>
  );
}

// ─── Referral Drawer ──────────────────────────────────────────────────────
function ReferralDrawer({ referral, existingNames = [], onClose }) {
  const [period, setPeriod] = React.useState("today");
  const [tab, setTab] = React.useState("overview");
  const [showEdit, setShowEdit] = React.useState(false);
  const [merchantRates, setMerchantRates] = React.useState({}); // { [merchantId]: { payIn, payOut } }
  const [balExtra, setBalExtra] = React.useState([]);
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

  const merchants = MERCHANTS.filter((m) => (m.referral || "—") === referral.name);

  const payInUsdt  = (referral.payInRub  / 92.4) * p.k;
  const payOutUsdt = (referral.payOutRub / 92.4) * p.k;
  const payInOrders  = Math.round(referral.payInCount  * p.k);
  const payOutOrders = Math.round(referral.payOutCount * p.k);
  const conv = Math.round((referral.success || 0) * 100);

  const tariff = REFERRAL_TARIFFS[referral.name] || { payIn: 0.5, payOut: 0.3, balance: 0 };
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
      id: (bDir === "deposit" ? "RB-D" : "RB-W") + seq,
      ts: "сейчас",
      direction: bDir,
      amountUsdt: +bAmt.toFixed(2),
      tx: bTx || "ручная операция",
    }, ...prev]);
    setBAmount("");
    setBTx("");
  };
  const BASE_BAL_HISTORY = {
    "Орбита": [
      { id: "RB-7741", ts: "27.04 12:10", direction: "withdraw", amountUsdt: 900.00,  tx: "0x9f2c…a31b" },
      { id: "RB-7720", ts: "24.04 09:32", direction: "withdraw", amountUsdt: 640.00,  tx: "0x41ad…77e2" },
      { id: "RB-7698", ts: "20.04 18:44", direction: "deposit",  amountUsdt: 300.00,  tx: "0xb12c…0f9a" },
    ],
    "Вектор": [
      { id: "RB-6610", ts: "26.04 16:20", direction: "withdraw", amountUsdt: 480.00,  tx: "0x55fa…9b21" },
      { id: "RB-6588", ts: "22.04 10:15", direction: "withdraw", amountUsdt: 210.00,  tx: "0x2c8d…41ee" },
    ],
  };
  const balHistory = [...balExtra, ...(BASE_BAL_HISTORY[referral.name] || [])];

  return (
    <>
    <Drawer
      title={referral.name}
      status={referral.status}
      statusMap={MERCHANT_STATUS}
      onClose={onClose}
      wide
      footer={<>
        <Btn variant="primary" onClick={() => setShowEdit(true)}>Редактировать</Btn>
        <span className="spacer" />
        {referral.status === "active"
          ? <Btn variant="danger">Блокировать реферала</Btn>
          : <Btn variant="ok">Активировать реферала</Btn>}
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
          ["Название", <strong>{referral.name}</strong>],
          ["Владелец", referral.owner
            ? <><strong>{referral.owner.name}</strong> <span className="mono muted">· {referral.owner.login}</span></>
            : <span className="muted">не назначен</span>],
          ["Статус", <StatusPill map={MERCHANT_STATUS} value={referral.status} />],
          ["Мерчанты", <>{referral.active} активных <span className="muted">/ всего {referral.merchants}</span></>],
          ["Success rate", Math.round(referral.success * 100) + "%"],
        ]} />
      </Section>

      <Section title="Тариф реферала">
        <KV items={[
          ["Комиссия с платежей",  <><strong>{tariff.payIn.toFixed(1)}%</strong> <span className="muted">от оборота мерчантов</span></>],
          ["Комиссия с выплат",    <><strong>{tariff.payOut.toFixed(1)}%</strong> <span className="muted">от оборота мерчантов</span></>],
        ]} />
      </Section>

      <Section title={`Мерчанты реферала (${merchants.length})`}>
        <table className="table table--inset">
          <thead><tr>
            <th>Мерчант</th>
            <th>Status</th>
            <th className="num">% платёж</th>
            <th className="num">% выплата</th>
            <th className="num">Платежи / day</th>
            <th className="num">Выплаты / day</th>
          </tr></thead>
          <tbody>
            {merchants.map((m) => {
              const r = merchantRates[m.id] || {};
              const payIn = r.payIn != null ? r.payIn : tariff.payIn.toFixed(1);
              const payOut = r.payOut != null ? r.payOut : tariff.payOut.toFixed(1);
              const overridden = r.payIn != null || r.payOut != null;
              const setRate = (key, val) => setMerchantRates((prev) => ({ ...prev, [m.id]: { ...prev[m.id], [key]: val } }));
              return (
              <tr key={m.id}>
                <td>
                  <strong>{m.name}</strong> <span className="mono muted">· {m.id}</span>
                  {overridden && <span className="muted" style={{ fontSize: 11 }}> · инд.</span>}
                </td>
                <td><StatusPill map={MERCHANT_STATUS} value={m.status} /></td>
                <td className="num"><TraderRateInput value={payIn} onChange={(v) => setRate("payIn", v)} /></td>
                <td className="num"><TraderRateInput value={payOut} onChange={(v) => setRate("payOut", v)} /></td>
                <td className="num">{(((m.today?.payInRub) || 0) / 92.4).toFixed(2)} USDT</td>
                <td className="num">{(((m.today?.payOutRub) || 0) / 92.4).toFixed(2)} USDT</td>
              </tr>
              );
            })}
            {merchants.length === 0 && (
              <tr><td colSpan={6}><Empty>У реферала пока нет мерчантов</Empty></td></tr>
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
          <div className="stat__delta">баланс реферала</div>
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

      {tab === "access" && <ReferralOwnerAccessTab referral={referral} />}
    </Drawer>
    {showEdit && (
      <AddReferralModal
        existingNames={existingNames}
        referral={{ ...referral, tariff }}
        onClose={() => setShowEdit(false)}
      />
    )}
    </>
  );
}

Object.assign(window, {
  SectionReferrals, ReferralDrawer, AddReferralModal,
});
