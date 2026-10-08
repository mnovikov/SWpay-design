// Trader app — sections part 2: Финансы, Споры, Тариф, Профиль

// ─── ФИНАНСЫ ─────────────────────────────────────────────────────────────
function TraderFinance({ go }) {
  const [filter, setFilter] = React.useState("all");
  const filters = [
    { value: "all", label: "Все", count: LEDGER.length },
    { value: "working", label: "Рабочий счёт", count: LEDGER.filter((l) => l.account === "working").length },
    { value: "insurance", label: "Страховой", count: LEDGER.filter((l) => l.account === "insurance").length },
    { value: "fines", label: "Штрафы и заморозки", count: LEDGER.filter((l) => ["fine","freeze","release"].includes(l.type)).length },
    { value: "commission", label: "Комиссии", count: LEDGER.filter((l) => l.type === "commission").length },
  ];
  const visible = LEDGER.filter((l) => {
    if (filter === "all") return true;
    if (filter === "working") return l.account === "working";
    if (filter === "insurance") return l.account === "insurance";
    if (filter === "fines") return ["fine","freeze","release"].includes(l.type);
    if (filter === "commission") return l.type === "commission";
    return true;
  });

  return (
    <>
      <PageHead
        title="Финансы"
        sub="Балансы и движения по обоим счетам. Рабочий — оборотные деньги. Страховой — депозит, из которого списываются штрафы и заморозки по спорам."
        actions={<>
          <Btn variant="ghost"><span className="mono">↧</span> Экспорт CSV</Btn>
          <Btn variant="primary">Пополнить</Btn>
        </>}
      />

      {/* Балансы */}
      <div className="hero-grid">
        <div className="hero-card hero-card--accent">
          <div className="hero-card__label">Рабочий баланс</div>
          <div className="hero-card__value">{fmtMoney(BALANCES.working.amount, "USDT")}</div>
          <div className="hero-card__actions">
            <Btn variant="primary" size="sm">Запросить вывод</Btn>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Заблокировано</div>
          <div className="hero-card__value">{fmtMoney(BALANCES.working.frozenUsdt, "USDT")}</div>
          <div className="hero-card__actions">
            <Btn variant="primary" size="sm" onClick={() => go("payin", { filter: "waiting-payment" })}>{PAY_IN.filter((o) => o.status === "waiting-payment").length} активных заявок →</Btn>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Страховой депозит</div>
          <div className="hero-card__value">{fmtMoney(BALANCES.insurance.amount, "USDT")}</div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Заморожено по спорам</div>
          <div className="hero-card__value" style={{ color: "var(--warn)" }}>{fmtMoney(BALANCES.insurance.locked, "USDT")}</div>
          <div className="hero-card__actions">
            <Btn variant="primary" size="sm" onClick={() => go("disputes", { filter: "active" })}>{DISPUTES.filter((d) => ["open","waiting-trader","waiting-admin"].includes(d.status)).length} активных споров →</Btn>
          </div>
        </div>
      </div>

      <Note tone="info">
        <strong>Как это работает.</strong> Каждый принятый PayIn временно списывает с рабочего баланса эквивалент в USDT, после подтверждения возвращается с комиссией. PayOut, наоборот, зачисляет деньги. Штрафы и заморозки списываются из страхового депозита и не дают вам уйти ниже минимума.
      </Note>

      <FilterChips filters={filters} value={filter} onChange={setFilter} />

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>ID</th><th>Дата</th><th>Счёт</th><th>Тип</th><th>Ордер</th>
            <th className="num">Сумма USDT</th><th>Описание</th>
          </tr></thead>
          <tbody>
            {visible.map((l) => (
              <tr key={l.id}>
                <td className="mono">{l.id}</td>
                <td className="mono">{l.ts}</td>
                <td>{l.account === "working" ? <Pill tone="info">Рабочий</Pill> : <Pill tone="warn">Страховой</Pill>}</td>
                <td><StatusPill map={LEDGER_TYPE} value={l.type} /></td>
                <td className="mono muted">{l.orderId || "—"}</td>
                <td className="num"><strong style={{ color: l.amountUsdt >= 0 ? "var(--ok)" : "var(--bad)" }}>{l.amountUsdt >= 0 ? "+" : ""}{l.amountUsdt.toFixed(2)} USDT</strong></td>
                <td className="muted" style={{ fontSize: 13 }}>{l.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-foot">Показано <strong>{visible.length}</strong> из <strong>{LEDGER.length}</strong> · обновляется в реальном времени</div>
      </div>
    </>
  );
}

// ─── РЕЙТИНГ (отдельная страничка) ───────────────────────────────────────
function TraderRating() {
  return (
    <>
      <PageHead
        title="Рейтинг"
        sub="Что влияет на ваш рейтинг и какие он даёт привилегии. Считается ежедневно по факторам ниже."
      />

      <div className="hero-grid hero-grid--3">
        <div className="hero-card hero-card--accent">
          <div className="hero-card__label">Текущий рейтинг</div>
          <div className="hero-card__value" style={{ fontSize: 48 }}>{RATING.score.toFixed(2)}</div>
          <div className="hero-card__sub">из 5.00 · {RATING.trend > 0 ? "▲" : "▼"} {Math.abs(RATING.trend).toFixed(2)} за неделю</div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Что даёт</div>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {RATING.effects.map((e, i) => (
              <div key={i} style={{ fontSize: 13, display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span className="muted">{e.label}</span>
                <strong>{e.value}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Группа доступа</div>
          <div className="hero-card__value" style={{ fontSize: 22 }}>Уровень B+</div>
          <div className="hero-card__sub">Доступны заявки до 200 000 ₽ и Выплаты</div>
        </div>
      </div>

      <Section title="Из чего считается">
        <table className="table table--inset">
          <thead><tr>
            <th>Фактор</th><th className="num">Текущее</th><th className="num">Вес</th><th className="num">Влияние</th>
          </tr></thead>
          <tbody>
            {RATING.factors.map((f) => (
              <tr key={f.id}>
                <td>{f.label}</td>
                <td className="num mono">{f.value}</td>
                <td className="num mono muted">{Math.round(f.weight * 100)}%</td>
                <td className="num">
                  <strong style={{ color: f.impact > 0 ? "var(--ok)" : f.impact < 0 ? "var(--bad)" : "var(--ink-3)" }}>
                    {f.impact > 0 ? "+" : ""}{f.impact.toFixed(1)}
                  </strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Note tone="info">
        Рейтинг пересчитывается раз в сутки в 00:00 МСК. Возврат заявки PayOut в пул автоматически снижает рейтинг на 0.05. Проигранный спор — на 0.15.
      </Note>
    </>
  );
}

// ─── СПОРЫ ───────────────────────────────────────────────────────────────
function TraderDisputes({ initFilter }) {
  const [filter, setFilter] = React.useState("active");
  React.useEffect(() => {
    if (initFilter && initFilter.value) setFilter(initFilter.value);
  }, [initFilter && initFilter.key]);
  const [openId, setOpenId] = React.useState(null);
  const filters = [
    { value: "active", label: "Активные", count: DISPUTES.filter((d) => ["open","waiting-trader","waiting-admin"].includes(d.status)).length },
    { value: "waiting-trader", label: "Ждут меня", count: DISPUTES.filter((d) => d.status === "waiting-trader").length },
    { value: "waiting-admin", label: "У саппорта", count: DISPUTES.filter((d) => d.status === "waiting-admin").length },
    { value: "resolved", label: "Решены в мою пользу", count: DISPUTES.filter((d) => d.status === "resolved").length },
    { value: "rejected", label: "Отклонены", count: DISPUTES.filter((d) => d.status === "rejected").length },
    { value: "all", label: "Все", count: DISPUTES.length },
  ];
  const visible = DISPUTES.filter((d) => {
    if (filter === "all") return true;
    if (filter === "active") return ["open","waiting-trader","waiting-admin"].includes(d.status);
    return d.status === filter;
  });
  const open = DISPUTES.find((d) => d.id === openId);

  return (
    <>
      <PageHead
        title="Споры"
        sub="Спорные ордера. Срочно отвечайте на «Ждут меня» — иначе саппорт автоматически вынесет решение в пользу мерчанта и спишет деньги со страхового депозита."
      />
      <FilterChips filters={filters} value={filter} onChange={setFilter} />

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>ID</th><th>Открыт</th><th>Ордер</th><th>Тип</th>
            <th className="num">Сумма</th><th>Статус</th><th>SLA</th><th>Причина</th>
          </tr></thead>
          <tbody>
            {visible.map((d) => (
              <tr key={d.id} className={openId === d.id ? "is-selected" : ""} onClick={() => setOpenId(d.id)}>
                <td className="mono">{d.id}</td>
                <td className="mono">{d.opened}</td>
                <td className="mono">{d.order}</td>
                <td>{d.orderType}</td>
                <td className="num">{fmtMoney(d.amount, "RUB")}</td>
                <td><StatusPill map={DISPUTE_STATUS} value={d.status} /></td>
                <td className="mono muted">{d.sla}</td>
                <td className="muted truncate">{d.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <DisputeDrawer dispute={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function DisputeDrawer({ dispute, onClose }) {
  const [chat, setChat] = React.useState(dispute.chat);
  const [draft, setDraft] = React.useState("");
  const canSend = ["open","waiting-trader","waiting-admin"].includes(dispute.status);
  const send = () => {
    if (!draft.trim()) return;
    setChat([...chat, { from: "trader", ts: "сейчас", text: draft.trim() }]);
    setDraft("");
  };
  const attach = () => setChat([...chat, { from: "trader", ts: "сейчас", attach: "receipt_" + dispute.order + ".jpg" }]);

  return (
    <Drawer
      title="Спор"
      id={dispute.id}
      status={dispute.status}
      statusMap={DISPUTE_STATUS}
      onClose={onClose}
      wide
      extraTags={dispute.deadline !== "—" && <span className="dispute-sla mono">SLA до {dispute.deadline}</span>}
      footer={dispute.status === "waiting-trader" ? (
        <>
          <Btn variant="ghost" onClick={attach}>📎 Прикрепить чек</Btn>
          <span className="spacer" />
          <Btn variant="ok" onClick={send}>Отправить</Btn>
        </>
      ) : <span className="muted" style={{ fontSize: 12 }}>Ожидает действий другой стороны</span>}
    >
      <Section title="Сводка">
        <KV items={[
          ["Ордер", <span className="mono">{dispute.order} · {dispute.orderType}</span>],
          ["Сумма", <strong>{fmtMoney(dispute.amount, "RUB")}</strong>],
          ["Мерчант", dispute.merchant],
          ["Клиент", dispute.customer],
          ["Открыт", <span className="mono">{dispute.opened}</span>],
          ["Дедлайн ответа", <span className="mono">{dispute.deadline}</span>],
          ["Причина", dispute.reason],
          ...(dispute.decision ? [["Решение", <strong>{dispute.decision}</strong>]] : []),
        ]} />
      </Section>

      <Section title="Переписка">
        <div className="chat">
          {chat.map((m, i) => {
            const role = m.from === "trader" ? "trader" : m.from === "merchant" ? "client" : "admin";
            const author = m.from === "trader" ? "Вы" : m.from === "merchant" ? dispute.merchant : "Саппорт";
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
          <button className="btn btn--ghost btn--sm" onClick={attach} disabled={!canSend} title="Прикрепить чек" style={{ padding: "0 12px" }}>📎</button>
          <input
            className="field__input"
            placeholder={canSend ? "Напишите сообщение саппорту..." : "Спор закрыт — отправка недоступна"}
            value={draft}
            disabled={!canSend}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          />
          <Btn variant="primary" size="sm" onClick={send} disabled={!canSend || !draft.trim()}>Отправить</Btn>
        </div>
      </Section>
    </Drawer>
  );
}

// ─── ТАРИФ ───────────────────────────────────────────────────────────────
function TraderTariff() {
  const [tab, setTab] = React.useState("payin");
  const rows = tab === "payin" ? TARIFF.payInMethods : TARIFF.payOutMethods;
  const tabs = [
    { value: "payin",  label: "PayIn",  count: TARIFF.payInMethods.length },
    { value: "payout", label: "PayOut", count: TARIFF.payOutMethods.length },
  ];
  return (
    <>
      <PageHead
        title="Тариф"
        sub="Условия комиссий и ставок по платёжным методам. Меняется только админом — у трейдера режим только-чтение."
      />

      <Section title="Ставки по платёжным методам">
        <FilterChips filters={tabs} value={tab} onChange={setTab} />
        <table className="table table--inset">
          <thead><tr>
            <th>Платёжный метод</th>
            <th className="num">Ставка (мне)</th>
            <th className="num">Мин. сумма</th>
            <th className="num">Макс. сумма</th>
            <th>Особенности</th>
          </tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.method}>
                <td><strong>{m.label}</strong></td>
                <td className="num mono">{m.rate.toFixed(1)}%</td>
                <td className="num">{fmtMoney(m.min, "RUB")}</td>
                <td className="num">{fmtMoney(m.max, "RUB")}</td>
                <td className="muted">{m.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="История изменений">
        <Timeline items={[
          { time: "12.03.2024", text: "Тариф «" + TARIFF.name + "» назначен админом при KYC" },
          { time: "—", text: "Изменений с этого момента не было", muted: true },
        ]} />
      </Section>
    </>
  );
}

// ─── ПРОФИЛЬ / НАСТРОЙКИ ─────────────────────────────────────────────────
function TraderProfile() {
  const [tab, setTab] = React.useState("account");
  return (
    <>
      <PageHead
        title="Настройки"
        sub="Личные данные, безопасность и уведомления. KYC-данные меняются только через тикет в саппорт."
      />

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
            <Field label="Полное имя"><TextInput value={ME.name} readOnly /></Field>
            <Field label="Email" row><TextInput value={ME.email} readOnly /></Field>
            <Field label="Телефон" row><TextInput value={ME.phone} readOnly mono /></Field>
            <Field label="ID трейдера" row><TextInput value={ME.id} readOnly mono /></Field>
            <Field label="Команда" row><TextInput value={ME.team} readOnly /></Field>
            <Field label="Зарегистрирован" row><TextInput value={ME.registered} readOnly mono /></Field>
          </Section>
          <Section title="Безопасность аккаунта">
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost">Сменить пароль</Btn>
              <Btn variant="danger">Выйти со всех устройств</Btn>
            </div>
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
          <Section title="Активные сессии">
            <table className="table table--inset">
              <thead><tr><th>Устройство</th><th>Локация</th><th>IP</th><th>Активность</th><th></th></tr></thead>
              <tbody>
                <tr><td>MacBook · Safari</td><td>Москва</td><td className="mono">95.165.10.42</td><td className="mono">сейчас</td><td><Pill tone="ok">Текущая</Pill></td></tr>
                <tr><td>iPhone 15 · приложение</td><td>Москва</td><td className="mono">95.165.10.42</td><td className="mono">2 мин назад</td><td><Btn size="sm" variant="ghost">Завершить</Btn></td></tr>
                <tr><td>Android · приложение</td><td>Москва</td><td className="mono">95.165.10.42</td><td className="mono">10 мин назад</td><td><Btn size="sm" variant="ghost">Завершить</Btn></td></tr>
              </tbody>
            </table>
          </Section>
        </>
      )}

      {tab === "notifications" && (
        <Section title="Уведомления">
          <ToggleRow label="Новая свободная Выплата" hint="Push в приложении и Telegram" defaultOn />
          <ToggleRow label="Дедлайн взятой Выплаты подходит к концу" hint="Push за 5 минут до истечения" defaultOn />
          <ToggleRow label="Чек принят / отклонён" hint="Push + Email" defaultOn />
          <ToggleRow label="Терминал ушёл в offline" hint="Push + Telegram" defaultOn />
          <ToggleRow label="Реквизит достиг 90% дневного лимита" hint="Push" defaultOn />
          <ToggleRow label="Открыт спор по моему ордеру" hint="Push + Email" defaultOn />
          <ToggleRow label="Списание со страхового депозита" hint="Email" defaultOn />
          <ToggleRow label="Изменение тарифа админом" hint="Email" defaultOn />
          <ToggleRow label="Маркетинговые рассылки CrowdPay" />
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

function ToggleRow({ label, hint, defaultOn }) {
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
  TraderFinance, TraderRating, TraderDisputes, DisputeDrawer,
  TraderTariff, TraderProfile, ToggleRow,
});
