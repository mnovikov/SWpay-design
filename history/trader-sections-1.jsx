// Trader app — sections part 1: Dashboard, PayIn, PayOut, Terminals, Реквизиты
// Соответствует ТЗ v4 (M.Novikov, 30.04.2026)

const METHOD_LABEL = {
  sbp: "СБП",
  card: "Карта",
  c2c: "Card-to-Card",
  phone: "По номеру телефона",
  account: "Расчётный счёт",
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
    </span>
  );
}

function MoneyBig({ rub, usdt }) {
  return (
    <div className="money-big">
      <div className="money-big__usdt">{fmtMoney(usdt, "USDT")}</div>
      <div className="money-big__rub muted">≈ {fmtMoney(rub, "RUB")}</div>
    </div>
  );
}

function tone(v) {
  if (v > 0.85) return "bad";
  if (v > 0.6) return "warn";
  return "ok";
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────
function TraderDashboard({ go }) {
  const freePO = PAY_OUT.filter((o) => o.status === "free");
  const myActivePO = PAY_OUT.filter((o) => o.takenBy === ME.id && ["in-progress","waiting-review"].includes(o.status));
  const recentPI = PAY_IN.slice(0, 5);
  const openDisputes = DISPUTES.filter((d) => ["open","waiting-trader"].includes(d.status));

  return (
    <>
      <PageHead
        title={"Здравствуйте, " + ME.name.split(" ")[1]}
        sub="Сводка за сегодня. Сначала разберите свободные Выплаты — на них быстрее всего идёт оборот."
        actions={<>
          <Btn variant="ghost" onClick={() => go("finance")}>Финансы</Btn>
          <Btn variant="primary" onClick={() => go("payout")}>В очередь Выплат</Btn>
        </>}
      />

      {/* Балансы */}
      <div className="hero-grid hero-grid--3">
        <div className="hero-card hero-card--accent">
          <div className="hero-card__label">Рабочий баланс</div>
          <div className="hero-card__value">{fmtMoney(BALANCES.working.amount, "USDT")}</div>
          <div className="hero-card__sub"><b>+ {fmtMoney(BALANCES.working.frozenUsdt, "USDT")}</b> заблокировано</div>
          <div className="hero-card__actions">
            <Btn variant="primary" size="sm" onClick={() => go("finance")}>Все движения →</Btn>
          </div>
        </div>
        {(() => {
          const cardsBalance = PAYMENT_DETAILS.reduce((s, p) => s + (p.balanceRub || 0), 0);
          const expectedRub = BALANCES.working.frozenUsdt * ME.usdtRate;
          return (
            <div className="hero-card">
              <div className="hero-card__label">Сумма на картах</div>
              <div className="hero-card__value">{fmtMoney(cardsBalance, "RUB")}</div>
              <div className="hero-card__sub"><b>+ {fmtMoney(expectedRub, "RUB")}</b> ожидается</div>
              <div className="hero-card__actions">
                <Btn variant="primary" size="sm" onClick={() => go("payout")}>В Выплаты →</Btn>
              </div>
            </div>
          );
        })()}
        <div className="hero-card">
          <div className="hero-card__label">Страховой депозит</div>
          <div className="hero-card__value">{fmtMoney(BALANCES.insurance.amount, "USDT")}</div>
          <div className="hero-card__sub"><b>+ {fmtMoney(BALANCES.insurance.locked, "USDT")}</b> заморожено</div>
        </div>
      </div>

      {/* Сегодня */}
      <div className="stat-row">
        <div className="stat">
          <div className="stat__label">Платежи сегодня</div>
          <div className="stat__value">{fmtMoney(BALANCES.todayPayInRub, "RUB")}</div>
          <div className="stat__delta">{PAY_IN.filter((o) => o.status === "completed").length} успешных</div>
        </div>
        <div className="stat">
          <div className="stat__label">Выплаты сегодня</div>
          <div className="stat__value">{fmtMoney(BALANCES.todayPayOutRub, "RUB")}</div>
          <div className="stat__delta">{PAY_OUT.filter((o) => o.takenBy === ME.id && o.status === "completed").length} успешных</div>
        </div>
        <div className="stat">
          <div className="stat__label">Заработано</div>
          <div className="stat__value">{fmtMoney(BALANCES.todayCommissionUsdt, "USDT")}</div>
          <div className="stat__delta">≈ {fmtMoney(BALANCES.todayCommissionUsdt * ME.usdtRate, "RUB")}</div>
        </div>
        <div className="stat">
          <div className="stat__label">За месяц</div>
          <div className="stat__value">{fmtMoney(BALANCES.monthCommissionUsdt, "USDT")}</div>
          <div className="stat__delta">оборот ≈ {fmtMoney(BALANCES.monthPayInRub + BALANCES.monthPayOutRub, "RUB")}</div>
        </div>
      </div>

      {/* Свободные выплаты */}
      <Section
        title={"Свободные выплаты · " + freePO.length + " в пуле"}
        action={<Btn size="sm" variant="ghost" onClick={() => go("payout")}>Открыть очередь →</Btn>}
      >
        {freePO.length === 0 ? <Empty>Свободных выплат нет</Empty> : (
          <div className="payout-feed">
            {freePO.slice(0, 3).map((o) => (
              <div key={o.id} className="payout-card">
                <div className="payout-card__head">
                  <span className="mono">{o.id}</span>
                  <span className="payout-card__time mono">⏱ {o.deadlineMin} мин</span>
                </div>
                <div className="payout-card__amount">{fmtMoney(o.amount, "RUB")}</div>
                <div className="payout-card__meta">
                  <div><span className="muted">Куда:</span> <span className="mono">{o.customerTarget}</span></div>
                  <div><span className="muted">Банк:</span> {bankName(o.customerBank)}</div>
                  <div><span className="muted">Мерчант:</span> {o.merchant}</div>
                </div>
                <div className="payout-card__actions">
                  <Btn variant="primary" size="sm" onClick={() => go("payout")}>Взять</Btn>
                  <Btn variant="ghost" size="sm" onClick={() => go("payout")}>Не могу</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="dash-grid">
        <Section
          title={"Мои выплаты в работе · " + myActivePO.length}
          action={<Btn size="sm" variant="ghost" onClick={() => go("payout")}>Все →</Btn>}
        >
          {myActivePO.length === 0 ? <Empty>Нет выплат в работе</Empty> : (
            <table className="table table--inset">
              <thead><tr><th>ID</th><th className="num">Сумма</th><th>Статус</th><th>Куда</th></tr></thead>
              <tbody>
                {myActivePO.map((o) => (
                  <tr key={o.id}>
                    <td className="mono">{o.id}</td>
                    <td className="num">{fmtMoney(o.amount, "RUB")}</td>
                    <td><StatusPill map={PAY_OUT_STATUS} value={o.status} /></td>
                    <td className="mono">{o.customerTarget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <Section
          title={"Последние платежи · " + recentPI.length}
          action={<Btn size="sm" variant="ghost" onClick={() => go("payin")}>Все →</Btn>}
        >
          <table className="table table--inset">
            <thead><tr><th>ID</th><th className="num">Сумма</th><th>Статус</th><th className="num">Время</th></tr></thead>
            <tbody>
              {recentPI.map((o) => (
                <tr key={o.id}>
                  <td className="mono">{o.id}{o.dispute && <span className="dot-dispute"> ●</span>}</td>
                  <td className="num">{fmtMoney(o.amount, "RUB")}</td>
                  <td><StatusPill map={PAY_IN_STATUS} value={o.status} /></td>
                  <td className="num mono muted">{o.payTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>

      <div className="dash-grid">
        <Section title="Терминалы" action={<Btn size="sm" variant="ghost" onClick={() => go("terminals")}>Все →</Btn>}>
          <table className="table table--inset">
            <thead><tr><th>ID</th><th>Устройство</th><th>Статус</th><th className="num">Реквизиты</th><th>Активность</th></tr></thead>
            <tbody>
              {TERMINALS.map((t) => (
                <tr key={t.id}>
                  <td className="mono">{t.id}</td>
                  <td>{t.name}</td>
                  <td><StatusPill map={TERMINAL_STATUS} value={t.status} /></td>
                  <td className="num">{t.detailsCount}</td>
                  <td className="muted mono">{t.lastHeartbeat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section
          title={"Открытые споры · " + openDisputes.length}
          action={<Btn size="sm" variant="ghost" onClick={() => go("disputes")}>Все →</Btn>}
        >
          {openDisputes.length === 0 ? <Empty>Открытых споров нет</Empty> : (
            <table className="table table--inset">
              <thead><tr><th>ID</th><th>Ордер</th><th className="num">Сумма</th><th>Статус</th><th className="muted">SLA</th></tr></thead>
              <tbody>
                {openDisputes.map((d) => (
                  <tr key={d.id}>
                    <td className="mono">{d.id}</td>
                    <td className="mono">{d.order}</td>
                    <td className="num">{fmtMoney(d.amount, "RUB")}</td>
                    <td><StatusPill map={DISPUTE_STATUS} value={d.status} /></td>
                    <td className="muted mono">{d.sla}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      </div>
    </>
  );
}

// ─── PAYIN ────────────────────────────────────────────────────────────────
function TraderPayIn({ initFilter }) {
  const [filter, setFilter] = React.useState("all");
  React.useEffect(() => {
    if (initFilter && initFilter.value) setFilter(initFilter.value);
  }, [initFilter && initFilter.key]);
  const [openId, setOpenId] = React.useState(null);
  const filters = [
    { value: "all", label: "Все", count: PAY_IN.length },
    { value: "waiting-payment", label: "Ждут оплаты", count: PAY_IN.filter((o) => o.status === "waiting-payment").length },
    { value: "completed", label: "Успешные", count: PAY_IN.filter((o) => o.status === "completed").length },
    { value: "disputed", label: "Спор", count: PAY_IN.filter((o) => o.status === "disputed").length },
    { value: "failed", label: "Не выполнены", count: PAY_IN.filter((o) => ["failed","expired"].includes(o.status)).length },
  ];
  const visible = PAY_IN.filter((o) => {
    if (filter === "all") return true;
    if (filter === "failed") return ["failed","expired"].includes(o.status);
    return o.status === filter;
  });
  const open = PAY_IN.find((o) => o.id === openId);

  return (
    <>
      <PageHead
        title="Платежи (PayIn)"
        sub="Заявки от мерчантов: клиент платит на ваши реквизиты, система автоматически распознаёт SMS/Push."
        actions={<Btn variant="ghost"><span className="mono">↧</span> Экспорт CSV</Btn>}
      />
      <FilterChips filters={filters} value={filter} onChange={setFilter} />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID заявки</th>
              <th>Статус</th>
              <th className="num">Сумма</th>
              <th className="num">Комиссия</th>
              <th className="num">Курс</th>
              <th>Реквизит</th>
              <th>Метод</th>
              <th>Создана</th>
              <th className="num">Время</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => {
              const pd = PAYMENT_DETAILS.find((p) => p.id === o.details);
              const rate = ME.usdtRate;
              const usdt = o.amount / rate;
              const fee = usdt * 0.02;
              const isOk = o.status === "completed";
              return (
              <tr key={o.id} className={openId === o.id ? "is-selected" : ""} onClick={() => setOpenId(o.id)}>
                <td className="mono">{o.id}{o.dispute && <span className="dot-dispute"> ●</span>}</td>
                <td><StatusPill map={PAY_IN_STATUS} value={o.status} /></td>
                <td className="num">
                  {fmtMoney(o.amount, "RUB")}
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{usdt.toFixed(2)} USDT</div>
                </td>
                <td className="num mono">{isOk ? fee.toFixed(2) : <span className="muted">—</span>}</td>
                <td className="num mono muted">{rate.toFixed(2)}</td>
                <td>
                  {pd ? (
                    <>
                      <div>{pd.holder}</div>
                      <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{pd.target}</div>
                    </>
                  ) : <span className="mono">{o.details}</span>}
                </td>
                <td>{pd ? (METHOD_LABEL[pd.method] || pd.method) : <span className="muted">—</span>}<div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{bankName(o.bank)}</div></td>
                <td className="mono">{o.date}</td>
                <td className="num mono muted">{o.payTime}</td>
              </tr>
            );})}
          </tbody>
        </table>
        <div className="table-foot">Показано <strong>{visible.length}</strong> из <strong>{PAY_IN.length}</strong></div>
      </div>

      {open && (
        <Drawer
          title="Заявка на платёж"
          id={open.id}
          status={open.status}
          statusMap={PAY_IN_STATUS}
          onClose={() => setOpenId(null)}
          wide
          extraTags={open.expiresAt && <span className="dispute-sla mono">⏱ истечёт {open.expiresAt}</span>}
          footer={<>
            <Btn variant="ghost">Не вижу платёж — открыть спор</Btn>
            <span className="spacer" />
            {open.status === "completed" ? (
              <Btn variant="ghost">Скачать чек</Btn>
            ) : open.status === "waiting-payment" ? (
              <Btn variant="ok">Подтвердить вручную</Btn>
            ) : null}
          </>}
        >
          <Section title="Сводка">
            <KV items={[
              ["Сумма", <strong>{fmtMoney(open.amount, "RUB")}</strong>],
              ["Эквивалент в USDT", <span className="mono">≈ {fmtMoney(open.amount / ME.usdtRate, "USDT")}</span>],
              ["Мерчант", <>{open.merchant} <span className="muted mono"> · заказ {open.merchantOrder}</span></>],
              ["Создана", <span className="mono">{open.date}</span>],
              ["Время до подтверждения", <span className="mono">{open.payTime}</span>],
              ["Комиссия трейдера", <strong>{fmtMoney(open.commissionUsdt, "USDT")}</strong>],
            ]} />
          </Section>

          <Section title="Куда поступил платёж">
            <KV items={[
              ["Терминал", <span className="mono">{open.terminal}</span>],
              ["Реквизит", <span className="mono">{open.details}</span>],
              ["Банк", <strong>{bankName(open.bank)}</strong>],
            ]} />
          </Section>

          <Section title="SMS / Push от банка">
            {open.source !== "—" ? (
              <Note tone="info">
                <div className="mono" style={{ fontSize: 12, marginBottom: 6 }}>{open.source} · {bankName(open.bank)} · {open.date}</div>
                <div>«Поступление {fmtMoney(open.amount, "RUB")}. Баланс счёта: 184 220,00 ₽. {bankName(open.bank)}»</div>
              </Note>
            ) : <Empty>Сообщение от банка не получено</Empty>}
          </Section>

          {open.timeline && (
            <Section title="История статусов">
              <Timeline items={open.timeline.map((t) => ({ time: t.ts, text: t.label }))} />
            </Section>
          )}
        </Drawer>
      )}
    </>
  );
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
    { value: "mine", label: "Мои в работе", count: PAY_OUT.filter((o) => o.takenBy === ME.id && ["in-progress","waiting-review"].includes(o.status)).length },
    { value: "completed", label: "Выполненные", count: PAY_OUT.filter((o) => o.takenBy === ME.id && o.status === "completed").length },
    { value: "rejected", label: "Отклонённые", count: PAY_OUT.filter((o) => o.takenBy === ME.id && o.status === "rejected").length },
    { value: "disputed", label: "Спор", count: PAY_OUT.filter((o) => o.status === "disputed").length },
    { value: "all", label: "Все", count: PAY_OUT.length },
  ];
  const visible = PAY_OUT.filter((o) => {
    if (filter === "all") return true;
    if (filter === "free") return o.status === "free";
    if (filter === "mine") return o.takenBy === ME.id && ["in-progress","waiting-review"].includes(o.status);
    if (filter === "completed") return o.takenBy === ME.id && o.status === "completed";
    if (filter === "rejected") return o.takenBy === ME.id && o.status === "rejected";
    if (filter === "disputed") return o.status === "disputed";
    return true;
  });
  const open = PAY_OUT.find((o) => o.id === openId);

  return (
    <>
      <PageHead
        title="Выплаты (PayOut)"
        sub="Свободные заявки попадают в общий пул. Возьмите → переведите клиенту → загрузите чек. На исполнение даётся 15 минут."
        actions={<Btn variant="ghost"><span className="mono">↧</span> Экспорт CSV</Btn>}
      />
      <FilterChips filters={filters} value={filter} onChange={setFilter} />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Создана</th>
              <th style={{ width: 110 }}>Статус</th>
              <th className="num">Сумма</th>
              <th className="num">Курс</th>
              <th className="num">Комиссия</th>
              <th>Реквизит</th>
              <th>Получатель</th>
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
                <td className="mono">{o.id}</td>
                <td className="mono">{o.date}</td>
                <td><StatusPill map={PAY_OUT_STATUS} value={o.status} /></td>
                <td className="num">
                  {fmtMoney(o.amount, "RUB")}
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{usdt.toFixed(2)} USDT</div>
                </td>
                <td className="num mono muted">{rate.toFixed(2)}</td>
                <td className="num mono">{fee.toFixed(2)}</td>
                <td>
                  {showPd && myPd ? (
                    <>
                      <div>{myPd.holder}</div>
                      <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{myPd.target}</div>
                    </>
                  ) : <span className="muted">—</span>}
                </td>
                <td>
                  <div><span className="muted">{bankName(o.customerBank)}</span> {o.customerName}</div>
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{o.customerTarget}</div>
                </td>
                <td className="num">
                  {o.status === "free" && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                      <Btn size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); setOpenId(o.id); }}>Взять</Btn>
                      <span className="mono muted" style={{ fontSize: 11 }}>⧖ {o.deadlineMin} мин</span>
                    </div>
                  )}
                  {o.status === "in-progress" && o.takenBy === ME.id && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                      <Btn size="sm" variant="ok" onClick={(e) => { e.stopPropagation(); setOpenId(o.id); }}>Чек</Btn>
                      <span className="mono muted" style={{ fontSize: 11 }}>⧖ {o.deadlineMin} мин</span>
                    </div>
                  )}
                </td>
              </tr>
            );})}
          </tbody>
        </table>
        <div className="table-foot">Показано <strong>{visible.length}</strong> из <strong>{PAY_OUT.length}</strong></div>
      </div>

      {open && <PayOutDrawer order={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function PayOutDrawer({ order, onClose }) {
  const isFree = order.status === "free";
  const isMine = order.takenBy === ME.id;
  const inWork = isMine && order.status === "in-progress";
  const waitingReview = isMine && order.status === "waiting-review";

  return (
    <Drawer
      title="Заявка на выплату"
      id={order.id}
      status={order.status}
      statusMap={PAY_OUT_STATUS}
      onClose={onClose}
      wide
      extraTags={(isFree || inWork) && <span className="dispute-sla mono">⏱ {order.deadlineMin} мин</span>}
      footer={
        isFree ? (
          <>
            <Btn variant="ghost" title="Заявка вернётся в пул, без штрафа но с уменьшением рейтинга">Не могу взять</Btn>
            <span className="spacer" />
            <Btn variant="primary">Взять в работу</Btn>
          </>
        ) : inWork ? (
          <>
            <Btn variant="ghost">Вернуть в пул (−0.05 рейтинга)</Btn>
            <span className="spacer" />
            <Btn variant="ok">Перевод сделан → загрузить чек</Btn>
          </>
        ) : waitingReview ? (
          <>
            <Btn variant="ghost">Открыть спор</Btn>
            <span className="spacer" />
            <Btn variant="ghost" disabled>Ждём проверки саппорта</Btn>
          </>
        ) : (
          <>
            <Btn variant="ghost">Открыть спор</Btn>
            <span className="spacer" />
            {order.proof === "uploaded" && <Btn variant="ghost">Скачать чек</Btn>}
          </>
        )
      }
    >
      <Section title="Куда платить">
        <KV items={[
          ["Сумма к переводу", <strong>{fmtMoney(order.amount, "RUB")}</strong>],
          ["Куда", <span className="mono"><strong>{order.customerTarget}</strong></span>],
          ["Банк получателя", <strong>{bankName(order.customerBank)}</strong>],
          ["Имя", order.customerName],
          ["Мерчант", order.merchant],
          ["Создана", <span className="mono">{order.date}</span>],
        ]} />
      </Section>

      {isFree && (
        <Note tone="warn">
          <strong>Внимание.</strong> При взятии заявки на ваш рабочий баланс заморозятся ≈ {fmtMoney(order.amount / ME.usdtRate, "USDT")} до подтверждения чека саппортом. Если не успеете за 15 минут — заявка вернётся в пул и рейтинг −0.05.
        </Note>
      )}

      <Section title="Расчёт">
        <KV items={[
          ["Эквивалент", <span className="mono">≈ {fmtMoney(order.amount / ME.usdtRate, "USDT")}</span>],
          ["Тариф PayOut", "2.0%"],
          ["Ваша комиссия", <strong>{fmtMoney(order.commissionUsdt, "USDT")}</strong>],
        ]} />
      </Section>

      <Section title="Чек / подтверждение">
        {order.proof === "uploaded" ? (
          <PlaceholderImg label={"Чек по " + order.id + (order.proofTime ? " · " + order.proofTime : "")} h={160} />
        ) : order.proof === "rejected" ? (
          <Note tone="bad">Чек отклонён саппортом: «Не читается номер операции». Загрузите новый чек.</Note>
        ) : inWork ? (
          <div>
            <PlaceholderImg label="Перетащите файл чека или нажмите «Загрузить»" h={120} />
            <div style={{ marginTop: 8 }}><Btn variant="ghost" size="sm">📎 Загрузить чек</Btn></div>
          </div>
        ) : <Empty>Чек ещё не загружен</Empty>}
      </Section>

      {order.timeline && (
        <Section title="История">
          <Timeline items={order.timeline.map((t) => ({ time: t.ts, text: t.label }))} />
        </Section>
      )}
    </Drawer>
  );
}

// ─── TERMINALS ───────────────────────────────────────────────────────────
function TraderTerminals() {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const filters = [
    { value: "all", label: "Все", count: TERMINALS.length },
    { value: "online", label: "Online", count: TERMINALS.filter((t) => t.status === "online").length },
    { value: "offline", label: "Offline", count: TERMINALS.filter((t) => t.status === "offline").length },
  ];
  const visible = TERMINALS.filter((t) => filter === "all" || t.status === filter);
  const open = TERMINALS.find((t) => t.id === openId);

  return (
    <>
      <PageHead
        title="Терминалы"
        sub="Android-устройства с банковскими приложениями. Ловят SMS/Push, шлют heartbeat. Если терминал >5 мин offline — реквизиты автоматически отключаются."
        actions={<Btn variant="primary" onClick={() => setShowAdd(true)}><span className="mono">＋</span> Привязать терминал</Btn>}
      />
      <FilterChips filters={filters} value={filter} onChange={setFilter} />

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>ID</th><th>Устройство</th><th>SIM</th><th>Статус</th>
            <th className="num">Заряд</th><th className="num">Версия</th>
            <th>Heartbeat</th>
            <th>Заметка</th>
          </tr></thead>
          <tbody>
            {visible.map((t) => (
              <tr key={t.id} className={openId === t.id ? "is-selected" : ""} onClick={() => setOpenId(t.id)}>
                <td className="mono">{t.id}</td>
                <td>{t.name}</td>
                <td className="mono">{t.phone}</td>
                <td><StatusPill map={TERMINAL_STATUS} value={t.status} /></td>
                <td className="num">
                  <span className={"battery " + (t.battery < 20 ? "battery--bad" : t.battery < 40 ? "battery--warn" : "battery--ok")}>
                    {t.battery}%
                  </span>
                </td>
                <td className="num mono">{t.appVersion}</td>
                <td className="mono muted">{t.lastHeartbeat}</td>
                <td className="muted">{t.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
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
            {open.status === "online"
              ? <Btn variant="danger">Закрыть терминал</Btn>
              : <Btn variant="ok">Активировать</Btn>}
          </>}
        >
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
                {PAYMENT_DETAILS.filter((p) => p.terminal === open.id).map((p) => (
                  <tr key={p.id}>
                    <td className="mono">{p.id}</td>
                    <td>{p.method === "sbp" ? "СБП" : "Карта"}</td>
                    <td>{bankName(p.bank)}</td>
                    <td className="mono">{p.target}</td>
                    <td><StatusPill map={PD_STATUS} value={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title={"Лог сообщений сегодня (" + (open.sms?.length || 0) + ")"}>
            {(open.sms?.length || 0) === 0 ? <Empty>Сообщений пока нет</Empty> : (
              <table className="table table--inset">
                <thead><tr><th>Время</th><th>Источник</th><th>Банк</th><th className="num">Сумма</th><th>Текст</th></tr></thead>
                <tbody>
                  {open.sms.map((s, i) => (
                    <tr key={i} style={!s.parsed ? { background: "var(--bad-soft)" } : null}>
                      <td className="mono">{s.time}</td>
                      <td className="mono">{s.kind}</td>
                      <td>{s.bank}</td>
                      <td className="num">{s.parsed ? fmtMoney(s.amount, "RUB") : <span style={{ color: "var(--bad)" }}>не распознано</span>}</td>
                      <td className="muted" style={{ fontSize: 12 }}>{s.msg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>
        </Drawer>
      )}

      {showAdd && (
        <Modal
          title="Привязать новый терминал"
          onClose={() => setShowAdd(false)}
          footer={<>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Btn>
            <Btn variant="primary" onClick={() => setShowAdd(false)}>Сгенерировать QR</Btn>
          </>}
        >
          <Field label="Название устройства" hint="Чтобы отличать в списке">
            <TextInput placeholder="Напр. «Pixel 7 — Москва»" />
          </Field>
          <Field label="Телефон SIM" hint="С него будут приходить SMS/Push от банка">
            <TextInput placeholder="+7 ___ ___-__-__" mono />
          </Field>
          <Field label="Заметка"><TextInput placeholder="Опционально" /></Field>
          <Note tone="info">После генерации QR откройте мобильное приложение CrowdPay Trader и отсканируйте код.</Note>
        </Modal>
      )}
    </>
  );
}

// ─── PAYMENT DETAILS ─────────────────────────────────────────────────────
function TraderPaymentDetails() {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const filters = [
    { value: "all", label: "Все", count: PAYMENT_DETAILS.length },
    { value: "active", label: "Активные", count: PAYMENT_DETAILS.filter((p) => p.status === "active").length },
    { value: "limit-exceeded", label: "Лимит", count: PAYMENT_DETAILS.filter((p) => p.status === "limit-exceeded").length },
    { value: "terminal-offline", label: "Терминал offline", count: PAYMENT_DETAILS.filter((p) => p.status === "terminal-offline").length },
    { value: "blocked", label: "Заблокированы", count: PAYMENT_DETAILS.filter((p) => p.status === "blocked").length },
  ];
  const visible = PAYMENT_DETAILS.filter((p) => filter === "all" || p.status === filter);
  const open = PAYMENT_DETAILS.find((p) => p.id === openId);

  return (
    <>
      <PageHead
        title="Реквизиты"
        sub="Карты и СБП-номера, на которые принимаются платежи. У каждого — лимиты по сумме, день, месяц и количеству операций. Метод и банк зашиты в реквизит."
        actions={<Btn variant="primary" onClick={() => setShowAdd(true)}><span className="mono">＋</span> Добавить реквизит</Btn>}
      />
      <FilterChips filters={filters} value={filter} onChange={setFilter} />

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>ID</th><th>Метод</th><th>Реквизит</th>
            <th>Терминал</th><th>Статус</th>
            <th className="num">Лимит / день</th>
            <th className="num">Опер. сегодня</th>
            <th className="num">Успех</th>
          </tr></thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id} className={openId === p.id ? "is-selected" : ""} onClick={() => setOpenId(p.id)}>
                <td className="mono">{p.id}</td>
                <td><span className="badge-type">{p.method === "sbp" ? "СБП" : "Карта"}</span></td>
                <td><div className="mono">{p.target}</div><div className="muted" style={{ fontSize: 11 }}>{bankName(p.bank)}</div></td>
                <td className="mono">{p.terminal}</td>
                <td>
                  <StatusPill map={PD_STATUS} value={p.status} />
                  {p.cooldown && <span className="muted mono" style={{ fontSize: 11, marginLeft: 6 }}>⏱ {Math.floor(p.cooldown.remainingSec/60)}:{String(p.cooldown.remainingSec%60).padStart(2,"0")}</span>}
                </td>
                <td className="num">
                  <Bar v={p.dailyUsed} />
                  <div className="muted mono" style={{ fontSize: 11, marginTop: 2 }}>{fmtMoney(p.todayVolumeRub, "RUB")} / {fmtMoney(p.dailyLimit, "RUB")}</div>
                </td>
                <td className="num mono">{p.opsToday}/{p.opsLimit}</td>
                <td className="num mono">{Math.round(p.success * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Drawer
          title="Реквизит"
          id={open.id}
          status={open.status}
          statusMap={PD_STATUS}
          onClose={() => setOpenId(null)}
          wide
          extraTags={open.cooldown && <span className="dispute-sla mono">cooldown {Math.floor(open.cooldown.remainingSec/60)}:{String(open.cooldown.remainingSec%60).padStart(2,"0")} после {open.cooldown.after}</span>}
          footer={<>
            <Btn variant="ghost">Изменить лимиты</Btn>
            <span className="spacer" />
            {open.status === "active"
              ? <Btn variant="danger">Отключить</Btn>
              : <Btn variant="ok">Включить</Btn>}
          </>}
        >
          {open.blockReason && <Note tone="bad">{open.blockReason}</Note>}

          <Section title="Реквизит">
            <KV items={[
              ["Метод", open.method === "sbp" ? "СБП (по номеру телефона)" : "Карта"],
              ["Банк", <strong>{bankName(open.bank)}</strong>],
              ["Держатель", open.holder],
              ["Цель / номер", <span className="mono"><strong>{open.target}</strong></span>],
              ["Привязка к терминалу", <span className="mono">{open.terminal}</span>],
            ]} />
          </Section>

          <Section title="Лимиты">
            <KV items={[
              ["Мин. сумма заявки", fmtMoney(open.minAmount, "RUB")],
              ["Макс. сумма заявки", fmtMoney(open.maxAmount, "RUB")],
              ["Дневной лимит", <><Bar v={open.dailyUsed} /> {fmtMoney(open.todayVolumeRub, "RUB")} / {fmtMoney(open.dailyLimit, "RUB")}</>],
              ["Месячный лимит", <><Bar v={open.monthlyUsed} /> {fmtMoney(open.monthVolumeRub, "RUB")} / {fmtMoney(open.monthlyLimit, "RUB")}</>],
              ["Операций сегодня", <>{open.opsToday} / {open.opsLimit}</>],
              ["Задержка между платежами", <span className="mono">{open.paymentDelaySec ? (open.paymentDelaySec >= 60 ? Math.floor(open.paymentDelaySec/60) + " мин" + (open.paymentDelaySec%60 ? " " + (open.paymentDelaySec%60) + " сек" : "") : open.paymentDelaySec + " сек") : "—"}</span>],
              ["Успешность", <strong>{Math.round(open.success * 100)}%</strong>],
            ]} />
          </Section>

          <Section title="Последние платежи">
            {PAY_IN.filter((o) => o.details === open.id).length === 0 ? <Empty>Платежей нет</Empty> : (
              <table className="table table--inset">
                <thead><tr><th>ID</th><th>Дата</th><th className="num">Сумма</th><th>Статус</th></tr></thead>
                <tbody>
                  {PAY_IN.filter((o) => o.details === open.id).slice(0, 8).map((o) => (
                    <tr key={o.id}>
                      <td className="mono">{o.id}</td>
                      <td className="mono">{o.date}</td>
                      <td className="num">{fmtMoney(o.amount, "RUB")}</td>
                      <td><StatusPill map={PAY_IN_STATUS} value={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>
        </Drawer>
      )}

      {showAdd && (
        <Modal
          title="Добавить реквизит"
          onClose={() => setShowAdd(false)}
          footer={<>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Btn>
            <Btn variant="primary" onClick={() => setShowAdd(false)}>Создать</Btn>
          </>}
        >
          <div className="row-2">
            <Field label="Метод"><Select value="sbp" options={[{ value: "sbp", label: "СБП" }, { value: "card", label: "Карта" }]} /></Field>
            <Field label="Банк"><Select value="B-A" options={BANKS.map((b) => ({ value: b.id, label: b.name }))} /></Field>
          </div>
          <Field label="Держатель"><TextInput placeholder="ФИО, как в банке" /></Field>
          <Field label="Реквизит" hint="Номер телефона для СБП или последние 4 цифры карты"><TextInput placeholder="+7 ___ ___-__-__ или •••• ____" mono /></Field>
          <Field label="Терминал"><Select value="T-1001" options={TERMINALS.filter((t) => t.status === "online").map((t) => ({ value: t.id, label: t.id + " · " + t.name }))} /></Field>
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
      )}
    </>
  );
}

Object.assign(window, {
  TraderDashboard, TraderPayIn, TraderPayOut, TraderTerminals, TraderPaymentDetails,
  Bar, MoneyBig, PayOutDrawer,
});
