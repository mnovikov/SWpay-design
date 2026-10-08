// CrowdPay — Merchant cabinet sections

// ─── Dashboard ────────────────────────────────────────────────────────────
function MerchantDashboard({ go }) {
  const todayPayin = TODAY.payinAmount;
  const todayPayout = TODAY.payoutAmount;
  return (
    <>
      <PageHead
        title={"Здравствуйте, " + ME.name.split(" ")[0]}
        sub={"Кабинет мерчанта " + ME.merchant + " · " + ME.merchantId}
        actions={<>
          <Btn variant="ghost" onClick={() => go("docs")}>Документация</Btn>
          <Btn variant="primary" onClick={() => go("api")}>API ключи</Btn>
        </>}
      />

      <div className="hero-grid">
        <div className="hero-card hero-card--accent">
          <div className="hero-card__label">Доступно к выводу</div>
          <div className="hero-card__value">{fmt(BALANCE.usdt.available)}</div>
          <div className="hero-card__sub">USDT · {BALANCE.network} · справочный курс {BALANCE.fxRateNow} ₽/USDT</div>
          <div className="hero-card__actions">
            <Btn variant="primary" onClick={() => go("balance")}>Вывести</Btn>
            <Btn variant="ghost" onClick={() => go("balance")}>История</Btn>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">PayIn · сегодня</div>
          <div className="hero-card__value">{fmt(todayPayin)}</div>
          <div className="hero-card__sub">{TODAY.payinCount.toLocaleString("ru-RU")} заказов · сред. время {TODAY.avgPayinTime}</div>
          <div className="hero-card__actions"><Btn variant="ghost" size="sm" onClick={() => go("payin")}>Открыть PayIn →</Btn></div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">PayOut · сегодня</div>
          <div className="hero-card__value">{fmt(todayPayout)}</div>
          <div className="hero-card__sub">{TODAY.payoutCount.toLocaleString("ru-RU")} выплат · 2 в очереди</div>
          <div className="hero-card__actions"><Btn variant="ghost" size="sm" onClick={() => go("payout")}>Открыть PayOut →</Btn></div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Success rate</div>
          <div className="hero-card__value">{TODAY.successRate}%</div>
          <div className="hero-card__sub">Webhooks delivered: {TODAY.webhookSuccess}%</div>
          <div className="hero-card__actions"><Btn variant="ghost" size="sm" onClick={() => go("webhooks")}>Webhook логи →</Btn></div>
        </div>
      </div>

      <div className="dash-grid">
        <Section title="Объём по часам · сегодня">
          <VolumeChart data={HOURLY_VOLUME} />
          <div style={{ display: "flex", gap: 18, marginTop: 12, fontSize: 12.5, color: "var(--ink-3)" }}>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--plum)", borderRadius: 2, marginRight: 6 }}></span>PayIn</span>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--accent-2)", borderRadius: 2, marginRight: 6 }}></span>PayOut</span>
          </div>
        </Section>
        <Section title="Внимание требуется">
          <ul className="risk-list">
            <li onClick={() => go("disputes")}>
              <Pill tone="bad">!</Pill>
              <span>2 спора ждут реакции мерчанта</span>
              <span className="mono">DSP-441, DSP-440</span>
            </li>
            <li onClick={() => go("payin")}>
              <Pill tone="warn">!</Pill>
              <span>1 PayIn на ручной проверке (возможно фрод)</span>
              <span className="mono">PI-7778</span>
            </li>
            <li onClick={() => go("webhooks")}>
              <Pill tone="warn">!</Pill>
              <span>1 webhook повторяется (502 от вашего endpoint)</span>
              <span className="mono">whk_18469</span>
            </li>
            <li onClick={() => go("balance")}>
              <Pill tone="info">·</Pill>
              <span>Settlement batch обрабатывается</span>
              <span className="mono">{fmt(BALANCE.usdt.pending)}</span>
            </li>
          </ul>
        </Section>
      </div>

      <Section title="Последние операции" action={<Btn variant="ghost" size="sm" onClick={() => go("payin")}>Все PayIn →</Btn>}>
        <table className="table table--inset">
          <thead><tr>
            <th>ID</th><th>Тип</th><th>Сумма</th><th>Метод</th><th>Customer</th><th>Статус</th><th>Время</th>
          </tr></thead>
          <tbody>
            {PAY_IN.slice(0, 6).map((o) => (
              <tr key={o.id} onClick={() => go("payin")}>
                <td className="mono">{o.id}</td>
                <td><Pill tone="info">PayIn</Pill></td>
                <td className="num"><strong>{fmt(o.amount)}</strong></td>
                <td className="muted">{o.method}</td>
                <td className="mono muted">{o.customer}</td>
                <td><StatusPill map={PAYIN_STATUS} value={o.status} /></td>
                <td className="mono muted">{o.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

// Простой SVG-график объёма по часам — два набора столбцов
function VolumeChart({ data }) {
  const w = 660, h = 180, pad = 24;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const max = Math.max(...data.flatMap((d) => [d.payin, d.payout]));
  const barW = innerW / data.length / 2 - 2;
  return (
    <svg viewBox={"0 0 " + w + " " + h} style={{ width: "100%", height: "auto", display: "block" }}>
      <line x1={pad} x2={w-pad} y1={h-pad} y2={h-pad} stroke="var(--line)" />
      {data.map((d, i) => {
        const x = pad + (innerW / data.length) * i;
        const hIn  = max ? (d.payin  / max) * innerH : 0;
        const hOut = max ? (d.payout / max) * innerH : 0;
        return (
          <g key={i}>
            <rect x={x + 2} y={h-pad-hIn}  width={barW} height={hIn}  rx="2" fill="var(--plum)" />
            <rect x={x + 4 + barW} y={h-pad-hOut} width={barW} height={hOut} rx="2" fill="var(--accent-2)" />
            <text x={x + barW} y={h-pad+14} fontSize="10" fill="var(--ink-3)" fontFamily="var(--font-mono)" textAnchor="middle">{d.h}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── PayIn ────────────────────────────────────────────────────────────────
function MerchantPayIn() {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const filters = [
    { value: "all", label: "Все", count: PAY_IN.length },
    { value: "waiting", label: "Ожидают", count: PAY_IN.filter((o) => o.status === "waiting").length },
    { value: "received", label: "Получены", count: PAY_IN.filter((o) => o.status === "received").length },
    { value: "manual-review", label: "Проверка", count: PAY_IN.filter((o) => o.status === "manual-review").length },
    { value: "disputed", label: "Споры", count: PAY_IN.filter((o) => o.status === "disputed").length },
    { value: "completed", label: "Выполнены", count: PAY_IN.filter((o) => o.status === "completed").length },
  ];
  const visible = PAY_IN.filter((o) => filter === "all" || o.status === filter);
  const open = PAY_IN.find((o) => o.id === openId);
  return (
    <>
      <PageHead title="PayIn" sub="Все ваши заказы на приём платежей. Trader берёт заказ, клиент платит, вы получаете чек и settlement." />
      <FilterChips filters={filters} value={filter} onChange={setFilter} />
      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>Order ID</th><th>Request ID</th><th className="num">USDT зачислено</th><th className="num">Клиент платит</th><th>Метод</th><th>Customer</th><th>Trader</th><th>Статус</th><th>Создан</th>
          </tr></thead>
          <tbody>
            {visible.map((o) => (
              <tr key={o.id} className={openId === o.id ? "is-selected" : ""} onClick={() => setOpenId(o.id)}>
                <td className="mono">{o.id}</td>
                <td className="mono muted">{o.requestId}</td>
                <td className="num"><strong>{fmt(o.amount)}</strong></td>
                <td className="num muted">{fmt(o.amountRub, "RUB")}</td>
                <td className="muted">{o.method}</td>
                <td className="mono muted">{o.customer}</td>
                <td className="mono muted">{o.traderMasked}</td>
                <td><StatusPill map={PAYIN_STATUS} value={o.status} /></td>
                <td className="mono muted">{o.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && <PayInDrawer order={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function PayInDrawer({ order, onClose }) {
  const [tab, setTab] = React.useState("info");
  return (
    <Drawer
      title="PayIn"
      id={order.id}
      status={order.status}
      statusMap={PAYIN_STATUS}
      onClose={onClose}
      wide
      footer={<>
        <Btn variant="ghost">Скачать чек</Btn>
        <span className="spacer" />
        {order.status === "received" && <Btn variant="danger">Открыть спор</Btn>}
        {order.status === "completed" && <Btn variant="ghost">Запросить refund</Btn>}
      </>}
    >
      <Tabs
        tabs={[
          { id: "info", label: "Детали" },
          { id: "payload", label: "API payload" },
          { id: "webhooks", label: "Webhooks" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "info" && (
        <>
          <Section title="Параметры заказа">
            <KV items={[
              ["Order ID",            <span className="mono">{order.id}</span>],
              ["Request ID",          <span className="mono">{order.requestId}</span>],
              ["Клиент платит",        <strong>{fmt(order.amountRub, "RUB")}</strong>],
              ["Курс на момент заказа", <span className="mono">{order.fxRate} ₽ / USDT</span>],
              ["Зачислено вам",        <strong style={{ color: "var(--ok)" }}>{fmt(order.amount)}</strong>],
              ["Способ",                order.method],
              ["Customer",            <span className="mono">{order.customer}</span>],
              ["Trader (анон)",        <span className="mono">{order.traderMasked}</span>],
              ["Реквизит (анон)",      <span className="mono">{order.reqId}</span>],
              ["Создан",                <span className="mono">{order.created}</span>],
            ]} />
          </Section>
          <Section title="Чек / подтверждение">
            {order.status === "completed" || order.status === "received" ? (
              <PlaceholderImg label={"receipt-" + order.id + ".pdf"} h={140} />
            ) : (
              <Empty>Чек появится после оплаты клиентом.</Empty>
            )}
          </Section>
        </>
      )}
      {tab === "payload" && (
        <Section title="API payload">
          <Note tone="info">Полный JSON, который мы получили от вашего backend и отдадим обратно по webhook.</Note>
          <pre className="codeblock">{JSON.stringify({
            request_id: order.requestId,
            amount_rub: order.amountRub,
            currency_in:  "RUB",
            currency_out: "USDT",
            network: "TRC-20",
            fx_rate: order.fxRate,
            amount_usdt: order.amount,
            method: order.method,
            customer: { phone: order.customer },
            return_url: "https://betcity.demo/payments/" + order.requestId,
            webhook_url: "https://api.betcity.demo/webhooks/crowdpay/payin",
          }, null, 2)}</pre>
        </Section>
      )}
      {tab === "webhooks" && (
        <Section title="Webhooks по этому заказу">
          <table className="table table--inset">
            <thead><tr><th>Time</th><th>Event</th><th>Code</th><th>Attempt</th></tr></thead>
            <tbody>
              {WEBHOOK_LOGS.filter((w) => w.refId === order.id).map((w) => (
                <tr key={w.id}>
                  <td className="mono muted">{w.created}</td>
                  <td className="mono">{w.event}</td>
                  <td className="mono">{w.code}</td>
                  <td className="mono">#{w.attempts}</td>
                </tr>
              ))}
              {WEBHOOK_LOGS.filter((w) => w.refId === order.id).length === 0 && (
                <tr><td colSpan="4"><Empty>Webhooks ещё не отправлены.</Empty></td></tr>
              )}
            </tbody>
          </table>
        </Section>
      )}
    </Drawer>
  );
}

// ─── PayOut ────────────────────────────────────────────────────────────────
function MerchantPayOut() {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const filters = [
    { value: "all", label: "Все", count: PAY_OUT.length },
    { value: "queued", label: "В очереди", count: PAY_OUT.filter((o) => o.status === "queued").length },
    { value: "in-progress", label: "В работе", count: PAY_OUT.filter((o) => o.status === "in-progress").length },
    { value: "proof", label: "Чек получен", count: PAY_OUT.filter((o) => o.status === "proof").length },
    { value: "failed", label: "Ошибка", count: PAY_OUT.filter((o) => o.status === "failed").length },
    { value: "disputed", label: "Споры", count: PAY_OUT.filter((o) => o.status === "disputed").length },
    { value: "completed", label: "Выполнены", count: PAY_OUT.filter((o) => o.status === "completed").length },
  ];
  const visible = PAY_OUT.filter((o) => filter === "all" || o.status === filter);
  const open = PAY_OUT.find((o) => o.id === openId);
  return (
    <>
      <PageHead title="PayOut" sub="Выплаты вашим клиентам через trader-сеть. Деньги списываются с вашего баланса в момент создания заявки." actions={<Btn variant="primary"><span className="mono">＋</span> New PayOut</Btn>} />
      <FilterChips filters={filters} value={filter} onChange={setFilter} />
      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>Order ID</th><th>Request ID</th><th className="num">USDT списано</th><th className="num">Клиент получит</th><th>Метод</th><th>Customer</th><th>Trader</th><th>Статус</th><th>Создан</th>
          </tr></thead>
          <tbody>
            {visible.map((o) => (
              <tr key={o.id} className={openId === o.id ? "is-selected" : ""} onClick={() => setOpenId(o.id)}>
                <td className="mono">{o.id}</td>
                <td className="mono muted">{o.requestId}</td>
                <td className="num"><strong>{fmt(o.amount)}</strong></td>
                <td className="num muted">{fmt(o.amountRub, "RUB")}</td>
                <td className="muted">{o.method}</td>
                <td className="mono muted">{o.customer}</td>
                <td className="mono muted">{o.traderMasked}</td>
                <td><StatusPill map={PAYOUT_STATUS} value={o.status} /></td>
                <td className="mono muted">{o.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Drawer title="PayOut" id={open.id} status={open.status} statusMap={PAYOUT_STATUS} onClose={() => setOpenId(null)}
          footer={<>
            <Btn variant="ghost">API payload</Btn>
            <span className="spacer" />
            {open.status === "proof" && <Btn variant="ok">Подтвердить</Btn>}
            {open.status === "proof" && <Btn variant="danger">Отклонить (открыть спор)</Btn>}
            {(open.status === "queued" || open.status === "in-progress") && <Btn variant="danger">Отменить</Btn>}
          </>}
        >
          <Section title="Параметры">
            <KV items={[
              ["Order ID",            <span className="mono">{open.id}</span>],
              ["Request ID",          <span className="mono">{open.requestId}</span>],
              ["Списано с баланса",     <strong>{fmt(open.amount)}</strong>],
              ["Курс на момент заказа", <span className="mono">{open.fxRate} ₽ / USDT</span>],
              ["Клиент получит",       <strong>{fmt(open.amountRub, "RUB")}</strong>],
              ["Способ",                open.method],
              ["Customer",            <span className="mono">{open.customer}</span>],
              ["Trader (анон)",        <span className="mono">{open.traderMasked}</span>],
              ["Создан",                <span className="mono">{open.created}</span>],
            ]} />
          </Section>
          {open.status === "proof" && (
            <Section title="Чек от trader'а">
              <PlaceholderImg label={"proof-" + open.id + ".pdf"} h={160} />
              <Note tone="warn">Подтвердите получение средств клиентом или откройте спор в течение 24 часов.</Note>
            </Section>
          )}
          {open.status === "failed" && (
            <Section title="Причина ошибки">
              <Note tone="bad">Trader отметил «не могу выполнить». Сумма возвращена на ваш баланс. Заявка автоматически уйдёт другому trader'у через ретрай.</Note>
            </Section>
          )}
        </Drawer>
      )}
    </>
  );
}

// ─── Disputes ─────────────────────────────────────────────────────────────
function MerchantDisputes() {
  const [openId, setOpenId] = React.useState(null);
  const open = DISPUTES.find((d) => d.id === openId);
  return (
    <>
      <PageHead title="Споры" sub="Споры по заказам, в которых вы — сторона. SLA — 72 часа на ответ." />
      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>ID</th><th>Order</th><th>Тип</th><th className="num">USDT</th><th className="num">₽</th><th>Customer</th><th>Trader</th><th>Статус</th><th>SLA</th><th>Открыт</th>
          </tr></thead>
          <tbody>
            {DISPUTES.map((d) => (
              <tr key={d.id} className={openId === d.id ? "is-selected" : ""} onClick={() => setOpenId(d.id)}>
                <td className="mono">{d.id}</td>
                <td className="mono">{d.relatedOrder}</td>
                <td><span className="badge-type">{d.type}</span></td>
                <td className="num"><strong>{fmt(d.amount)}</strong></td>
                <td className="num muted">{fmt(d.amountRub, "RUB")}</td>
                <td className="mono muted">{d.customer}</td>
                <td className="mono muted">{d.traderMasked}</td>
                <td><StatusPill map={DISPUTE_STATUS} value={d.status} /></td>
                <td><span className="dispute-sla">{d.sla}</span></td>
                <td className="mono muted">{d.openedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Drawer title="Dispute" id={open.id} status={open.status} statusMap={DISPUTE_STATUS} onClose={() => setOpenId(null)} wide
          extraTags={<span className="dispute-sla">SLA: {open.sla}</span>}
          footer={<>
            <Btn variant="ghost">Запросить чек у trader'a</Btn>
            <span className="spacer" />
            <Btn variant="danger">Reject</Btn>
            <Btn variant="ok">Accept</Btn>
          </>}
        >
          <Section title="Сводка">
            <KV items={[
              ["Связанный заказ", <span className="mono">{open.relatedOrder}</span>],
              ["Тип",            <span className="badge-type">{open.type}</span>],
              ["Сумма USDT",     <strong>{fmt(open.amount)}</strong>],
              ["Сумма RUB",      <span className="muted">{fmt(open.amountRub, "RUB")}</span>],
              ["Customer",       open.customer],
              ["Trader (анон)", <span className="mono">{open.traderMasked}</span>],
              ["Открыт",         <span className="mono">{open.openedAt}</span>],
            ]} />
          </Section>
          <Section title="Доказательства">
            <PlaceholderImg label="screenshot-customer.png" h={120} />
            <div style={{ marginTop: 8, fontSize: 13 }}>«Деньги списались, но в кабинете не отразились».</div>
          </Section>
          <Section title="Чек от trader'a">
            <PlaceholderImg label={"receipt-" + open.relatedOrder + ".pdf"} h={120} />
          </Section>
          <Section title="Внутренние пометки">
            <TextInput placeholder="Заметка для команды (клиент не видит)…" />
          </Section>
        </Drawer>
      )}
    </>
  );
}

// ─── Balance ──────────────────────────────────────────────────────────────
function MerchantBalance() {
  const [tab, setTab] = React.useState("ledger");
  return (
    <>
      <PageHead title="Баланс" sub="Settlement в USDT TRC-20. Зачисление batch'ами ежедневно в 23:00 МСК." actions={<>
        <Btn variant="ghost">Скачать выписку</Btn>
        <Btn variant="primary">Запросить вывод</Btn>
      </>} />
      <div className="hero-grid hero-grid--3">
        <div className="hero-card hero-card--accent">
          <div className="hero-card__label">Доступно к выводу</div>
          <div className="hero-card__value">{fmt(BALANCE.usdt.available)}</div>
          <div className="hero-card__sub">Заморожено {fmt(BALANCE.usdt.frozen)} · в обработке {fmt(BALANCE.usdt.pending)}</div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Кошелёк зачисления</div>
          <div className="hero-card__value mono" style={{ fontSize: 16, lineHeight: 1.4, wordBreak: "break-all" }}>{BALANCE.wallet}</div>
          <div className="hero-card__sub">Сеть {BALANCE.network} · справочный курс {BALANCE.fxRateNow} ₽/USDT</div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Тариф</div>
          <div className="hero-card__value" style={{ fontSize: 22 }}>{TARIFF.name}</div>
          <div className="hero-card__sub">PayIn {TARIFF.payInFee} · PayOut {TARIFF.payOutFee}</div>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "ledger", label: "Движения" },
          { id: "settlements", label: "Settlements" },
          { id: "withdrawals", label: "Withdrawals" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "ledger" && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>ID</th><th>Время</th><th>Направление</th><th className="num">Сумма</th><th className="num">Баланс после</th><th>Ref</th><th>Комментарий</th></tr></thead>
            <tbody>
              {LEDGER.map((l) => (
                <tr key={l.id}>
                  <td className="mono">{l.id}</td>
                  <td className="mono muted">{l.time}</td>
                  <td>{l.direction === "in" ? <Pill tone="ok">↑ IN</Pill> : <Pill tone="warn">↓ OUT</Pill>}</td>
                  <td className="num"><strong style={{ color: l.direction === "in" ? "var(--ok)" : "var(--ink-2)" }}>{l.direction === "in" ? "+" : "−"}{fmt(l.amount).replace(/^−/, "")}</strong></td>
                  <td className="num mono muted">{fmt(l.balance)}</td>
                  <td className="mono">{l.ref}</td>
                  <td className="muted">{l.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "settlements" && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>ID</th><th>Источник</th><th className="num">Сумма</th><th>Дата</th><th>Статус</th></tr></thead>
            <tbody>
              {SETTLEMENTS.map((s) => (
                <tr key={s.id}>
                  <td className="mono">{s.id}</td>
                  <td>{s.from}</td>
                  <td className="num"><strong>{fmt(s.amount)}</strong></td>
                  <td className="mono muted">{s.arrived}</td>
                  <td>{s.status === "completed" ? <Pill tone="ok">Зачислен</Pill> : <Pill tone="warn">В работе</Pill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "withdrawals" && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>ID</th><th className="num">Сумма</th><th>Сеть</th><th>Адрес кошелька</th><th>TX hash</th><th>Создан</th><th>Комиссия</th><th>Статус</th></tr></thead>
            <tbody>
              {WITHDRAWALS.map((w) => (
                <tr key={w.id}>
                  <td className="mono">{w.id}</td>
                  <td className="num"><strong>{fmt(w.amount)}</strong></td>
                  <td className="mono">{w.network}</td>
                  <td className="mono muted" style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis" }}>{w.address}</td>
                  <td className="mono muted">{w.txHash}</td>
                  <td className="mono muted">{w.created}</td>
                  <td className="mono muted">{fmt(w.fee)}</td>
                  <td>{w.status === "completed" ? <Pill tone="ok">Выполнен</Pill> : <Pill tone="warn">В работе</Pill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ─── API keys ─────────────────────────────────────────────────────────────
function MerchantApiKeys() {
  const [openId, setOpenId] = React.useState(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const open = API_KEYS.find((k) => k.id === openId);
  return (
    <>
      <PageHead title="API ключи" sub="Используйте Production-ключи для боевого трафика, Sandbox — для тестов. Ключи показываются полностью только один раз." actions={<Btn variant="primary" onClick={() => setShowCreate(true)}><span className="mono">＋</span> Создать ключ</Btn>} />

      <Note tone="info">Аутентификация: <span className="mono">Authorization: Bearer &lt;key&gt;</span>. Все запросы должны идти с IP из белого списка (см. ниже).</Note>

      <div className="table-wrap" style={{ marginTop: 14 }}>
        <table className="table">
          <thead><tr>
            <th>Label</th><th>Key</th><th>Scope</th><th>IP whitelist</th><th>Last used</th><th>Создан</th><th>Status</th>
          </tr></thead>
          <tbody>
            {API_KEYS.map((k) => (
              <tr key={k.id} className={openId === k.id ? "is-selected" : ""} onClick={() => setOpenId(k.id)}>
                <td><strong>{k.label}</strong></td>
                <td className="mono muted">{k.id.slice(0, 18)}…</td>
                <td className="muted" style={{ fontSize: 12.5 }}>{k.scope}</td>
                <td className="mono muted">{k.ipWhitelist.length ? k.ipWhitelist.join(", ") : "—"}</td>
                <td className="mono muted">{k.lastUsed}</td>
                <td className="mono muted">{k.created}</td>
                <td><StatusPill map={KEY_STATUS} value={k.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Drawer title={open.label} id={open.id} status={open.status} statusMap={KEY_STATUS} onClose={() => setOpenId(null)}
          footer={<>
            <Btn variant="ghost">Rotate</Btn>
            <span className="spacer" />
            {open.status === "active"  && <Btn variant="danger">Revoke</Btn>}
            {open.status === "active"  && <Btn variant="ghost">Pause</Btn>}
            {open.status === "paused"  && <Btn variant="ok">Resume</Btn>}
          </>}
        >
          <Section title="Ключ">
            <Field label="Key">
              <TextInput value={open.id} mono readOnly />
            </Field>
            <Field label="Scope" hint="Какие endpoints может вызвать ключ">
              <TextInput value={open.scope} readOnly />
            </Field>
            <Field label="Last used">
              <TextInput value={open.lastUsed} mono readOnly />
            </Field>
          </Section>
          <Section title="IP whitelist" action={<Btn variant="ghost" size="sm">＋ Добавить IP</Btn>}>
            {open.ipWhitelist.length === 0 ? (
              <Empty>IP-фильтр выключен. Добавьте подсети для production-ключей.</Empty>
            ) : (
              <table className="table table--inset">
                <thead><tr><th>CIDR</th><th>Note</th><th></th></tr></thead>
                <tbody>
                  {open.ipWhitelist.map((ip) => (
                    <tr key={ip}>
                      <td className="mono">{ip}</td>
                      <td className="muted">Production backend</td>
                      <td className="num"><Btn variant="ghost" size="sm">Удалить</Btn></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>
          <Section title="Использование за 24ч">
            <KV items={[
              ["Запросов", <span className="mono">42 180</span>],
              ["Ошибок 4xx", <span className="mono">12</span>],
              ["Ошибок 5xx", <span className="mono">0</span>],
              ["P50 latency", <span className="mono">38мс</span>],
              ["P99 latency", <span className="mono">214мс</span>],
            ]} />
          </Section>
        </Drawer>
      )}

      {showCreate && <CreateKeyModal onClose={() => setShowCreate(false)} />}
    </>
  );
}

function CreateKeyModal({ onClose }) {
  const [step, setStep] = React.useState(1);
  const [label, setLabel] = React.useState("");
  const [env, setEnv] = React.useState("live");
  const newKey = "key_" + env + "_" + Math.random().toString(36).slice(2, 14);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <strong>Создать API ключ</strong>
          <span style={{ marginLeft: "auto", color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>Шаг {step} / 2</span>
          <button className="btn btn--ghost btn--sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">
          {step === 1 && (
            <>
              <Field label="Название" hint="Короткое описание, где будет использоваться ключ">
                <TextInput value={label} onChange={setLabel} placeholder="Production · payments backend" />
              </Field>
              <Field label="Окружение">
                <Select value={env} onChange={setEnv} options={[
                  { value: "live", label: "Production (live)" },
                  { value: "test", label: "Sandbox (test)" },
                ]} />
              </Field>
              <Field label="Scope">
                <Select value="all" onChange={() => {}} options={[
                  { value: "all", label: "Все эндпоинты" },
                  { value: "ro",  label: "Read-only" },
                  { value: "po",  label: "Только PayOut" },
                ]} />
              </Field>
            </>
          )}
          {step === 2 && (
            <>
              <Note tone="warn">Сохраните ключ сейчас — позже он будет показан только в маскированном виде.</Note>
              <Field label="API key">
                <TextInput value={newKey} mono readOnly />
              </Field>
              <KV items={[
                ["Label", label || "—"],
                ["Окружение", env === "live" ? "Production" : "Sandbox"],
                ["Создан", "только что"],
              ]} />
            </>
          )}
        </div>
        <div className="modal__foot">
          <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
          <span className="spacer" />
          {step === 1 && <Btn variant="primary" onClick={() => setStep(2)} disabled={!label}>Создать ключ</Btn>}
          {step === 2 && <Btn variant="primary" onClick={onClose}>Скопировал, готово</Btn>}
        </div>
      </div>
    </div>
  );
}

// ─── Webhooks ─────────────────────────────────────────────────────────────
function MerchantWebhooks() {
  const [tab, setTab] = React.useState("logs");
  const [openId, setOpenId] = React.useState(null);
  const open = WEBHOOK_LOGS.find((w) => w.id === openId);
  return (
    <>
      <PageHead title="Webhooks" sub="Endpoints, события и история доставки. Retry: 5 попыток с exponential backoff." />

      <Tabs tabs={[{id:"logs",label:"Деливери логи"},{id:"endpoints",label:"Endpoints"},{id:"events",label:"События"}]} value={tab} onChange={setTab} />

      {tab === "logs" && (
        <>
          <div className="hero-grid hero-grid--3" style={{ marginBottom: 14 }}>
            <div className="hero-card"><div className="hero-card__label">Сегодня delivered</div><div className="hero-card__value">2 184</div><div className="hero-card__sub">99.7% success</div></div>
            <div className="hero-card"><div className="hero-card__label">Retrying</div><div className="hero-card__value">6</div><div className="hero-card__sub">0.3% от трафика</div></div>
            <div className="hero-card"><div className="hero-card__label">Failed (за 24ч)</div><div className="hero-card__value">1</div><div className="hero-card__sub">5/5 попыток исчерпаны</div></div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr>
                <th>ID</th><th>Event</th><th>Endpoint</th><th>Code</th><th>Attempt</th><th>Latency</th><th>Ref</th><th>Time</th><th>Status</th>
              </tr></thead>
              <tbody>
                {WEBHOOK_LOGS.map((w) => (
                  <tr key={w.id} className={openId === w.id ? "is-selected" : ""} onClick={() => setOpenId(w.id)}>
                    <td className="mono">{w.id}</td>
                    <td className="mono">{w.event}</td>
                    <td className="mono muted truncate">{w.endpoint}</td>
                    <td className="mono">{w.code}</td>
                    <td className="mono muted">#{w.attempts}</td>
                    <td className="mono muted">{w.latencyMs ? w.latencyMs + "мс" : "—"}</td>
                    <td className="mono">{w.refId}</td>
                    <td className="mono muted">{w.created}</td>
                    <td><StatusPill map={HOOK_STATUS} value={w.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "endpoints" && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>URL</th><th>Events</th><th>Success rate</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {WEBHOOK_ENDPOINTS.map((e) => (
                <tr key={e.url}>
                  <td className="mono">{e.url}</td>
                  <td><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {e.events.map((ev) => <span key={ev} className="badge-type">{ev}</span>)}
                  </div></td>
                  <td className="num mono">{e.successRate}%</td>
                  <td><Pill tone="ok">Active</Pill></td>
                  <td className="num"><Btn variant="ghost" size="sm">Изменить</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "events" && (
        <Section title="Все типы событий">
          <table className="table table--inset">
            <thead><tr><th>Event</th><th>Когда отправляется</th><th>Payload</th></tr></thead>
            <tbody>
              <tr><td className="mono">payin.received</td><td>Trader отметил приём средств</td><td className="muted">order, customer, amount</td></tr>
              <tr><td className="mono">payin.completed</td><td>Settlement зачислен на ваш баланс</td><td className="muted">order, settlement_id</td></tr>
              <tr><td className="mono">payin.expired</td><td>Клиент не оплатил вовремя</td><td className="muted">order, ttl</td></tr>
              <tr><td className="mono">payin.disputed</td><td>Открыт спор</td><td className="muted">order, dispute_id, reason</td></tr>
              <tr><td className="mono">payout.completed</td><td>Trader подтвердил перевод клиенту</td><td className="muted">order, proof_url</td></tr>
              <tr><td className="mono">payout.failed</td><td>Все trader'ы отказались</td><td className="muted">order, refund_amount</td></tr>
              <tr><td className="mono">settlement.completed</td><td>Daily settlement завершён</td><td className="muted">batch, total</td></tr>
              <tr><td className="mono">balance.adjusted</td><td>Ручная корректировка от admin</td><td className="muted">delta, reason, by</td></tr>
            </tbody>
          </table>
        </Section>
      )}

      {open && (
        <Drawer title="Webhook delivery" id={open.id} status={open.status} statusMap={HOOK_STATUS} onClose={() => setOpenId(null)} wide
          footer={<>
            <Btn variant="ghost">Replay</Btn>
            <span className="spacer" />
            {open.status !== "delivered" && <Btn variant="primary">Retry now</Btn>}
          </>}
        >
          <Section title="Детали">
            <KV items={[
              ["Event",      <span className="mono">{open.event}</span>],
              ["Endpoint",   <span className="mono">{open.endpoint}</span>],
              ["Status code",<span className="mono">{open.code}</span>],
              ["Attempt",    <span className="mono">#{open.attempts} / 5</span>],
              ["Latency",    <span className="mono">{open.latencyMs ? open.latencyMs + "мс" : "—"}</span>],
              ["Ref",        <span className="mono">{open.refId}</span>],
              ["Time",       <span className="mono">{open.created}</span>],
            ]} />
          </Section>
          <Section title="Request payload">
            <pre className="codeblock">{JSON.stringify({
              id: open.id,
              event: open.event,
              created_at: open.created,
              data: { order_id: open.refId, status: open.event.split(".")[1] },
            }, null, 2)}</pre>
          </Section>
          <Section title="Response">
            {open.status === "delivered" ? (
              <pre className="codeblock">HTTP/1.1 200 OK{"\n"}content-type: application/json{"\n\n"}{"{\"ok\": true}"}</pre>
            ) : open.status === "retrying" ? (
              <Note tone="warn">Получили <span className="mono">{open.code}</span> — retry в очереди (попытка {open.attempts + 1} из 5).</Note>
            ) : (
              <Note tone="bad">Все 5 попыток исчерпаны. Проверьте endpoint и нажмите Retry now.</Note>
            )}
          </Section>
        </Drawer>
      )}
    </>
  );
}

// ─── Docs ─────────────────────────────────────────────────────────────────
function MerchantDocs() {
  return (
    <>
      <PageHead title="Документация" sub="Минимальная интеграция за 4 endpoint'а. Полное API — на developers.crowdpay.demo." />
      <div className="dash-grid">
        <Section title="Endpoints">
          <table className="table table--inset">
            <thead><tr><th>Method</th><th>Path</th><th>Описание</th></tr></thead>
            <tbody>
              <tr><td><span className="badge-type">POST</span></td><td className="mono">/v1/payin</td><td>Создать заказ на приём платежа</td></tr>
              <tr><td><span className="badge-type">GET</span></td><td className="mono">/v1/payin/&#123;id&#125;</td><td>Получить статус PayIn</td></tr>
              <tr><td><span className="badge-type">POST</span></td><td className="mono">/v1/payout</td><td>Создать выплату клиенту</td></tr>
              <tr><td><span className="badge-type">GET</span></td><td className="mono">/v1/balance</td><td>Текущий баланс</td></tr>
              <tr><td><span className="badge-type">POST</span></td><td className="mono">/v1/disputes/&#123;id&#125;/respond</td><td>Ответ по спору</td></tr>
            </tbody>
          </table>
        </Section>
        <Section title="Quick start">
          <Note tone="info">Минимальная интеграция: 1) создать sandbox-ключ, 2) сделать POST /payin, 3) показать клиенту платёжную страницу, 4) принять webhook.</Note>
          <ol style={{ paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, marginTop: 10 }}>
            <li>Создайте Sandbox API ключ в разделе «API ключи».</li>
            <li>Зарегистрируйте webhook endpoint, куда мы будем слать уведомления.</li>
            <li>Сделайте тестовый <span className="mono">POST /v1/payin</span> с amount = 100 RUB.</li>
            <li>Откройте полученный <span className="mono">payment_url</span> — это страница, которую вы покажете клиенту.</li>
            <li>В Sandbox режиме платёж завершается через 30 секунд автоматически.</li>
          </ol>
        </Section>
      </div>

      <Section title="Пример: создать PayIn">
        <pre className="codeblock">{`POST /v1/payin
Authorization: Bearer key_live_8fA2k9zQrXp
Content-Type: application/json

{
  "request_id":   "ord_001a8c",
  "amount_rub":   12400,
  "currency_in":  "RUB",
  "currency_out": "USDT",
  "network":      "TRC-20",
  "method":       "sbp",
  "customer":     { "phone": "+79991112233" },
  "return_url":   "https://example.com/payments/ord_001a8c",
  "webhook_url":  "https://api.example.com/webhooks/crowdpay/payin"
}

→ 200 OK
{
  "id":          "PI-7782",
  "status":      "waiting",
  "fx_rate":     96.4,
  "amount_usdt": 128.63,
  "payment_url": "https://pay.crowdpay.demo/p/PI-7782",
  "expires_at":  "2024-04-27T15:08:00Z"
}`}</pre>
      </Section>

      <Section title="Подпись webhook'а">
        <Note tone="info">Каждый webhook содержит заголовок <span className="mono">X-CrowdPay-Signature: t=&lt;ts&gt;,v1=&lt;hex&gt;</span>. Проверка: HMAC-SHA256 по <span className="mono">ts.body</span> с вашим webhook secret.</Note>
      </Section>
    </>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────
function MerchantSettings() {
  return (
    <>
      <PageHead title="Настройки" sub="Контактная информация, нотификации, юридические данные." />

      <Section title="Контакты">
        <Field label="Контактное лицо" row><TextInput value={ME.name} readOnly /></Field>
        <Field label="Email" row><TextInput value={ME.email} mono readOnly /></Field>
        <Field label="Telegram" row><TextInput value={ME.telegram} mono readOnly /></Field>
        <Field label="Подключён с" row><TextInput value={ME.joined} mono readOnly /></Field>
      </Section>

      <Section title="Нотификации">
        <div className="toggle-row"><span style={{ flex: 1 }}>Email при failed PayOut</span><Pill tone="ok">Включено</Pill></div>
        <div className="toggle-row"><span style={{ flex: 1 }}>Email при открытии спора</span><Pill tone="ok">Включено</Pill></div>
        <div className="toggle-row"><span style={{ flex: 1 }}>Telegram-бот: ежедневная сводка</span><Pill tone="ok">Включено</Pill></div>
        <div className="toggle-row"><span style={{ flex: 1 }}>SMS при критических событиях</span><Pill tone="neutral">Выключено</Pill></div>
      </Section>

      <Section title="Юридические данные">
        <Field label="Название компании" row><TextInput value="ООО «БетСити»" readOnly /></Field>
        <Field label="ИНН" row><TextInput value="7712345678" mono readOnly /></Field>
        <Field label="КПП" row><TextInput value="771201001" mono readOnly /></Field>
        <Field label="Адрес" row><TextInput value="г. Москва, ул. Тверская, д. 1" readOnly /></Field>
      </Section>

      <Section title="Тариф">
        <KV items={[
          ["Тариф", <strong>{TARIFF.name}</strong>],
          ["Tariff ID", <span className="mono">{TARIFF.id}</span>],
          ["PayIn fee", TARIFF.payInFee],
          ["PayOut fee", TARIFF.payOutFee],
          ["Settlement", TARIFF.settlement],
          ["Withdrawal", TARIFF.withdrawal],
          ["Применён с", <span className="mono">{TARIFF.appliedSince}</span>],
        ]} />
        <Note tone="info">Тариф настраивает CrowdPay. Чтобы запросить изменение — напишите вашему account manager'у.</Note>
      </Section>
    </>
  );
}

// Делаем доступными в shell
Object.assign(window, {
  MerchantDashboard, MerchantPayIn, MerchantPayOut, MerchantDisputes,
  MerchantBalance, MerchantApiKeys, MerchantWebhooks, MerchantDocs, MerchantSettings,
});
