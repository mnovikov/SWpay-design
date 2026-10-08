// Trader app — sections part 2: Финансы, Споры, Тариф, Профиль

// Платёж имеет GUID-идентификатор — в таблицах показываем только последние 6 символов
function shortPaymentId(value, n = 6) {
  const s = String(value || "");
  return s.length > n ? s.slice(-n) : s;
}

// ─── ФИНАНСЫ ─────────────────────────────────────────────────────────────
const DEPOSIT_WALLET = "TQrYa8Pq2nKv9bHfJ7Lm3xZ4dYsN5w8zpN";
const DEPOSIT_NETWORK = "TRC-20";
const DEPOSIT_MIN = 50;
const DEPOSIT_CONFIRMATIONS = 19;

const DEPOSIT_STATUS = {
  completed: { tone: "ok",      label: "Зачислено" },
  pending:   { tone: "warn",    label: "Ожидает подтверждения" },
  awaiting:  { tone: "warn",    label: "Ожидает перевод" },
  expired:   { tone: "neutral", label: "Истекло" },
  failed:    { tone: "bad",     label: "Ошибка" },
};

// Для демо: дедлайн ожидающего депозита — фиксируем при загрузке модуля
const AWAITING_DEADLINE = Date.now() + 14 * 60 * 1000 + 32 * 1000;

// Демо-история депозитов: по аккаунту назначения
const DEPOSIT_HISTORY = {
  working: [
    { id: "DEP-10301", ts: "сейчас",     amount: 750.00,  status: "awaiting",  txHash: null,         confirmations: 0,  expiresAt: AWAITING_DEADLINE },
    { id: "DEP-10293", ts: "27.04 09:00", amount: 500.00,  status: "completed", txHash: "a91c…f4d2", confirmations: 19 },
    { id: "DEP-10271", ts: "22.04 14:48", amount: 1000.00, status: "completed", txHash: "5e1b…71aa", confirmations: 19 },
    { id: "DEP-10260", ts: "18.04 11:02", amount: 250.00,  status: "completed", txHash: "1c80…9b3e", confirmations: 19 },
    { id: "DEP-10254", ts: "16.04 19:30", amount: 300.00,  status: "expired",   txHash: null,         confirmations: 0  },
    { id: "DEP-10231", ts: "10.04 08:21", amount: 2000.00, status: "completed", txHash: "be42…0a18", confirmations: 19 },
  ],
  insurance: [
    { id: "DEP-10300", ts: "сейчас",     amount: 300.00,  status: "awaiting",  txHash: null,         confirmations: 0,  expiresAt: AWAITING_DEADLINE },
    { id: "DEP-10288", ts: "29.04 17:14", amount: 200.00,  status: "pending",   txHash: "7f2d…c081", confirmations: 6  },
    { id: "DEP-10245", ts: "25.04 11:14", amount: 1000.00, status: "completed", txHash: "33ab…ee19", confirmations: 19 },
    { id: "DEP-10204", ts: "12.04 09:48", amount: 1000.00, status: "completed", txHash: "ab19…5520", confirmations: 19 },
  ],
};

function CopyChip({ value, mono = true, short, title }) {
  const [done, setDone] = React.useState(false);
  if (!value || value === "—") return <span className="mono muted">—</span>;
  const display = short ? (value.length > 14 ? value.slice(0, 6) + "…" + value.slice(-6) : value) : value;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0 }}>
      <span className={mono ? "mono" : undefined} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{display}</span>
      <button
        type="button"
        aria-label={done ? "Скопировано" : (title || "Скопировать")}
        title={done ? "Скопировано" : (title || "Скопировать")}
        onClick={(e) => {
          e.stopPropagation();
          try { navigator.clipboard && navigator.clipboard.writeText(value); } catch (err) {}
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        }}
        style={{
          width: 22, height: 22,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: "transparent",
          border: "1px solid var(--line)",
          borderRadius: 5,
          cursor: "pointer",
          color: done ? "var(--ok, #1e8a4f)" : "var(--ink-3)",
          padding: 0,
          flex: "0 0 auto",
        }}
      >
        {done ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        )}
      </button>
    </span>
  );
}

function TxCopy({ value }) {
  const [done, setDone] = React.useState(false);
  if (!value || value === "—") return <span className="mono muted">—</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span className="mono muted">{value}</span>
      <button
        type="button"
        aria-label={done ? "Скопировано" : "Скопировать TX"}
        title={done ? "Скопировано" : "Скопировать TX"}
        onClick={(e) => {
          e.stopPropagation();
          try { navigator.clipboard && navigator.clipboard.writeText(value); } catch (err) {}
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        }}
        style={{
          width: 22, height: 22,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: "transparent",
          border: "1px solid var(--line)",
          borderRadius: 5,
          cursor: "pointer",
          color: done ? "var(--ok, #1e8a4f)" : "var(--ink-3)",
          padding: 0,
        }}
      >
        {done ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        )}
      </button>
    </span>
  );
}

function DepositCountdown({ deadline }) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = Math.max(0, Math.floor((deadline - now) / 1000));
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>
      {left > 0 ? ("осталось " + mm + ":" + ss) : "время истекло"}
    </div>
  );
}

function DepositDrawer({ account, onClose }) {
  const isWorking = account === "working";
  const title = isWorking ? "Пополнить рабочий баланс" : "Пополнить страховой депозит";
  const subtitle = isWorking
    ? "USDT поступит на рабочий счёт и будет доступен для приёма платежей"
    : "USDT поступит на страховой депозит и будет учтён в лимите доступа к ордерам";
  const [amount, setAmount] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [openDepId, setOpenDepId] = React.useState(null);
  const rate = (typeof ME !== "undefined" && ME.usdtRate) ? ME.usdtRate : 92.4;
  const num = parseFloat(String(amount).replace(",", ".")) || 0;
  const rub = num * rate;

  const history = DEPOSIT_HISTORY[account] || [];

  const copyWallet = () => {
    try { navigator.clipboard && navigator.clipboard.writeText(DEPOSIT_WALLET); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const presets = [100, 500, 1000, 5000];

  return (
    <>
    <Drawer
      title={title}
      onClose={onClose}
      wide
      extraTags={<span className="dispute-sla mono">{DEPOSIT_NETWORK}</span>}

    >
      <Section title="Сумма пополнения">
        <Field label="USDT" hint={num > 0 ? ("≈ " + fmtMoney(rub, "RUB") + " по курсу " + rate.toFixed(2) + " ₽/USDT") : ("Минимум " + DEPOSIT_MIN + " USDT")}>
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
            <Btn variant="primary" onClick={onClose} disabled={num < DEPOSIT_MIN}>Отправить</Btn>
          </div>
        </Field>
      </Section>

      <Section title="Адрес для пополнения">
        <div style={{ display: "grid", gridTemplateColumns: "108px 1fr", gap: 16, alignItems: "stretch" }}>
          <div style={{
            background: "var(--paper-2)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            display: "grid",
            placeItems: "center",
            padding: 8,
          }}>
            <div aria-hidden style={{
              width: 88, height: 88,
              backgroundColor: "var(--paper)",
              backgroundImage:
                "radial-gradient(circle at 12px 12px, var(--ink) 4px, transparent 4.5px)," +
                "radial-gradient(circle at 12px 76px, var(--ink) 4px, transparent 4.5px)," +
                "radial-gradient(circle at 76px 12px, var(--ink) 4px, transparent 4.5px)," +
                "linear-gradient(var(--ink), var(--ink))",
              backgroundSize: "100% 100%, 100% 100%, 100% 100%, 6px 6px",
              backgroundRepeat: "no-repeat, no-repeat, no-repeat, repeat",
              backgroundPosition: "0 0, 0 0, 0 0, 0 0",
              maskImage:
                "linear-gradient(white,white)," +
                "radial-gradient(circle at 12px 12px, black 9px, transparent 9.5px)," +
                "radial-gradient(circle at 12px 76px, black 9px, transparent 9.5px)," +
                "radial-gradient(circle at 76px 12px, black 9px, transparent 9.5px)",
              borderRadius: 6,
              boxShadow: "inset 0 0 0 6px var(--paper)",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", inset: 6,
                backgroundImage:
                  "repeating-linear-gradient(45deg, var(--ink) 0 2px, transparent 2px 5px)," +
                  "repeating-linear-gradient(-45deg, var(--ink) 0 2px, transparent 2px 6px)",
                opacity: 0.85,
              }} />
              <div style={{
                position: "absolute", top: 4, left: 4, width: 18, height: 18,
                background: "var(--paper)", border: "4px solid var(--ink)", borderRadius: 3,
              }} />
              <div style={{
                position: "absolute", top: 4, right: 4, width: 18, height: 18,
                background: "var(--paper)", border: "4px solid var(--ink)", borderRadius: 3,
              }} />
              <div style={{
                position: "absolute", bottom: 4, left: 4, width: 18, height: 18,
                background: "var(--paper)", border: "4px solid var(--ink)", borderRadius: 3,
              }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <div style={{
              padding: "8px 8px 8px 12px",
              background: "var(--paper-2)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              lineHeight: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
            }}>
              <span style={{ wordBreak: "break-all", flex: 1, minWidth: 0 }}>{DEPOSIT_WALLET}</span>
              <button
                type="button"
                onClick={copyWallet}
                title={copied ? "Скопировано" : "Скопировать адрес"}
                aria-label="Скопировать адрес"
                style={{
                  flex: "0 0 auto",
                  width: 28, height: 28,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: copied ? "var(--accent, #1e8a4f)" : "var(--ink)",
                  padding: 0,
                }}
              >
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                )}
              </button>
            </div>
            <span className="muted" style={{ fontSize: 12 }}>
              Сеть <strong>{DEPOSIT_NETWORK}</strong> · USDT (Tether)
            </span>
          </div>
        </div>
        <Note tone="info">
          Отправьте {num > 0 ? <strong>ровно {num.toFixed(2)} USDT</strong> : <>заявленную сумму</>} на указанный кошелёк в течение <strong>15 минут</strong>.
          Комиссия сети — за счёт отправителя.
        </Note>
      </Section>

      <Section title="Предыдущие депозиты">
        {history.length === 0 ? (
          <Empty>Депозитов ещё не было</Empty>
        ) : (
          <table className="table table--inset">
            <thead><tr>
              <th>Статус</th>
              <th className="num">Сумма</th>
              <th>Дата</th>
              <th>TX</th>
            </tr></thead>
            <tbody>
              {history.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setOpenDepId(d.id)}
                  className={openDepId === d.id ? "is-selected" : ""}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <StatusPill map={DEPOSIT_STATUS} value={d.status} />
                    {d.status === "pending" && (
                      <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                        {d.confirmations}/{DEPOSIT_CONFIRMATIONS} подтверждений
                      </div>
                    )}
                    {d.status === "awaiting" && d.expiresAt && (
                      <DepositCountdown deadline={d.expiresAt} />
                    )}
                  </td>
                  <td className="num"><strong>+{d.amount.toFixed(2)} USDT</strong></td>
                  <td className="mono">{d.ts}</td>
                  <td><TxCopy value={d.txHash} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </Drawer>
    {openDepId && (() => {
      const dep = history.find((d) => d.id === openDepId);
      return dep ? <DepositDetailDrawer dep={dep} onClose={() => setOpenDepId(null)} /> : null;
    })()}
    </>
  );
}

function DepositDetailDrawer({ dep, onClose }) {
  return (
    <Drawer
      title="Депозит"
      id={dep.id}
      status={dep.status}
      statusMap={DEPOSIT_STATUS}
      onClose={onClose}
      extraTags={<span className="dispute-sla mono">{DEPOSIT_NETWORK}</span>}
      footer={dep.status === "awaiting" ? (
        <>
          <Btn variant="ghost" onClick={onClose}>Закрыть</Btn>
          <span className="spacer" />
          <Btn variant="danger">Отменить пополнение</Btn>
        </>
      ) : (
        <>
          <span className="spacer" />
          <Btn variant="ghost" onClick={onClose}>Закрыть</Btn>
        </>
      )}
    >
      <Section title="Сводка">
        <KV items={[
          ["Сумма", <strong className="mono">+{dep.amount.toFixed(2)} USDT</strong>],
          ["Сеть", <span className="mono">{DEPOSIT_NETWORK}</span>],
          ["Дата", <span className="mono">{dep.ts}</span>],
          ["TX hash", dep.txHash ? <TxCopy value={dep.txHash} /> : <span className="mono muted">—</span>],
          ...(dep.status === "pending" ? [["Подтверждения", <span className="mono">{dep.confirmations}/{DEPOSIT_CONFIRMATIONS}</span>]] : []),
          ...(dep.status === "awaiting" && dep.expiresAt ? [["Осталось времени", <DepositCountdown deadline={dep.expiresAt} />]] : []),
        ]} />
      </Section>

      {dep.status === "awaiting" && (
        <Note tone="warn">
          Отправьте ровно <strong>{dep.amount.toFixed(2)} USDT</strong> на адрес пополнения до истечения таймера.
          Если время истечёт — заявка будет автоматически отменена.
        </Note>
      )}

      <Section title="Timeline">
        <Timeline items={[
          { time: dep.ts, text: "Заявка на депозит создана" },
          ...(dep.txHash ? [{ time: dep.ts, text: "Транзакция обнаружена в сети " + DEPOSIT_NETWORK }] : []),
          ...(dep.status === "completed" ? [{ time: dep.ts, text: DEPOSIT_CONFIRMATIONS + " подтверждений — зачислено на баланс" }] : []),
          ...(dep.status === "pending" ? [{ time: "сейчас", text: "Ожидание подтверждений сети", muted: true }] : []),
          ...(dep.status === "awaiting" ? [{ time: "—", text: "Ожидаем поступления средств", muted: true }] : []),
          ...(dep.status === "expired" ? [{ time: dep.ts, text: "Время оплаты истекло — заявка отменена" }] : []),
        ]} />
      </Section>
    </Drawer>
  );
}

// ─── ВЫВОД USDT ─────────────────────────────────────────────────────────
const WITHDRAW_NETWORK = "TRC-20";
const WITHDRAW_MIN = 20;
const WITHDRAW_FEE = 1.0; // USDT, сетевая комиссия

const WITHDRAW_STATUS = {
  sent:       { tone: "ok",      label: "Отправлено" },
  processing: { tone: "warn",    label: "В обработке" },
  manual:     { tone: "info",    label: "Ручная проверка" },
  rejected:   { tone: "bad",     label: "Отклонено" },
  cancelled:  { tone: "neutral", label: "Отменено" },
};

// Сохранённые адреса вывода — пользователь выбирает из своих
const SAVED_WALLETS = [
  { label: "Личный Trust Wallet", address: "TJ7m5pQs8Wd2BvN4cYf6aR1eL3oZ9hK0pX" },
  { label: "Binance · USDT", address: "TXa8VkPq3sNm1ZfB6yL4hC9dE2wR7uM5jK" },
];

// История выводов
const WITHDRAW_HISTORY = {
  working: [
    { id: "WD-20418", ts: "26.04 21:14", amount: 800.00,  fee: 1.00, address: "TJ7m5pQs8Wd2BvN4cYf6aR1eL3oZ9hK0pX", txHash: "f284…a91c", status: "sent" },
    { id: "WD-20402", ts: "21.04 18:30", amount: 1200.00, fee: 1.00, address: "TXa8VkPq3sNm1ZfB6yL4hC9dE2wR7uM5jK", txHash: "7a13…ee05", status: "sent" },
    { id: "WD-20391", ts: "20.04 12:08", amount: 350.00,  fee: 1.00, address: "TJ7m5pQs8Wd2BvN4cYf6aR1eL3oZ9hK0pX", txHash: "1b29…3f44", status: "sent" },
    { id: "WD-20377", ts: "17.04 09:42", amount: 500.00,  fee: 0,    address: "TXa8VkPq3sNm1ZfB6yL4hC9dE2wR7uM5jK", txHash: null,     status: "rejected" },
  ],
  insurance: [
    { id: "WD-20410", ts: "29.04 11:02", amount: 300.00, fee: 1.00, address: "TJ7m5pQs8Wd2BvN4cYf6aR1eL3oZ9hK0pX", txHash: null,     status: "processing" },
    { id: "WD-20355", ts: "12.04 16:18", amount: 500.00, fee: 1.00, address: "TJ7m5pQs8Wd2BvN4cYf6aR1eL3oZ9hK0pX", txHash: "c920…78bd", status: "sent" },
  ],
};

function WithdrawDrawer({ account, onClose }) {
  const isWorking = account === "working";
  const title = isWorking ? "Вывод с рабочего баланса" : "Вывод со страхового депозита";
  const balances = (typeof BALANCES !== "undefined") ? BALANCES : { working: { amount: 0, frozenUsdt: 0 }, insurance: { amount: 0, locked: 0 } };
  const total = isWorking ? balances.working.amount : balances.insurance.amount;
  const frozen = isWorking ? (balances.working.frozenUsdt || 0) : (balances.insurance.locked || 0);
  const available = total;
  const rate = (typeof ME !== "undefined" && ME.usdtRate) ? ME.usdtRate : 92.4;

  const [amount, setAmount] = React.useState("");
  const [address, setAddress] = React.useState("");
  const num = parseFloat(String(amount).replace(",", ".")) || 0;
  const rub = num * rate;
  const receive = Math.max(0, num - WITHDRAW_FEE);

  const looksValid = /^T[A-Za-z0-9]{25,40}$/.test(address.trim());
  const addrError = address.trim().length > 0 && !looksValid;
  const overBalance = num > available;
  const belowMin = num > 0 && num < WITHDRAW_MIN;
  const canSubmit = num >= WITHDRAW_MIN && !overBalance && looksValid;

  const history = WITHDRAW_HISTORY[account] || [];
  const [openWId, setOpenWId] = React.useState(null);

  return (
    <>
    <Drawer
      title={title}
      onClose={onClose}
      wide
      extraTags={<span className="dispute-sla mono">{WITHDRAW_NETWORK}</span>}
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Закрыть</Btn>
        <span className="spacer" />
        <Btn variant="primary" onClick={onClose} disabled={!canSubmit}>Подтвердить вывод</Btn>
      </>}
    >
      <div className="hero-grid" style={{ gridTemplateColumns: isWorking ? "repeat(2, 1fr)" : "1fr" }}>
        <div className="hero-card">
          <div className="hero-card__label">Рабочий баланс</div>
          <div className="hero-card__value" style={{ fontSize: 24 }}>{fmtMoney(total, "USDT")}</div>
        </div>
        {isWorking && (
          <div className="hero-card">
            <div className="hero-card__label">Заморожено в ордерах</div>
            <div className="hero-card__value" style={{ fontSize: 24 }}>{fmtMoney(frozen, "USDT")}</div>
          </div>
        )}
      </div>

      <Section title="Сумма вывода">
        <Field
          label="USDT"
          hint={
            belowMin ? <span style={{ color: "var(--bad)" }}>Минимум {WITHDRAW_MIN} USDT</span> :
            overBalance ? <span style={{ color: "var(--bad)" }}>Превышен доступный баланс</span> :
            num > 0 ? ("≈ " + fmtMoney(rub, "RUB") + " по курсу " + rate.toFixed(2) + " ₽/USDT") :
            ("Минимум " + WITHDRAW_MIN + " USDT · доступно " + available.toFixed(2) + " USDT")
          }
        >
          <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
            <input
              className="field__input mono"
              style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}
              placeholder="0.00"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            />
            <span className="mono" style={{ color: "var(--ink-3)", fontSize: 14, alignSelf: "center" }}>USDT</span>
            <Btn
              variant="ghost"
              onClick={() => setAmount(available.toFixed(2))}
              style={{ padding: "0 20px", fontSize: 14, fontWeight: 700, letterSpacing: "0.04em" }}
            >MAX</Btn>
          </div>
        </Field>
      </Section>

      <Section title="Кошелёк для вывода">
        <Field
          label="Адрес USDT"
          hint={
            addrError ? <span style={{ color: "var(--bad)" }}>Адрес выглядит некорректно для сети {WITHDRAW_NETWORK}</span> :
            looksValid ? <span style={{ color: "var(--ok)" }}>✓ Адрес валиден для сети {WITHDRAW_NETWORK}</span> :
            ("Сеть " + WITHDRAW_NETWORK + " · адрес начинается с T")
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
      </Section>

      <Section title="История выводов">
        {history.length === 0 ? (
          <Empty>Выводов ещё не было</Empty>
        ) : (
          <table className="table table--inset">
            <thead><tr>
              <th>Статус</th>
              <th className="num">Сумма</th>
              <th>Дата</th>
              <th>Адрес</th>
              <th>TX</th>
              <th>ID</th>
            </tr></thead>
            <tbody>
              {history.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => setOpenWId(w.id)}
                  className={openWId === w.id ? "is-selected" : ""}
                  style={{ cursor: "pointer" }}
                >
                  <td><StatusPill map={WITHDRAW_STATUS} value={w.status} /></td>
                  <td className="num">
                    <strong>−{w.amount.toFixed(2)} USDT</strong>
                    {w.fee > 0 && <div className="mono muted" style={{ fontSize: 11.5 }}>+{w.fee.toFixed(2)} комиссия</div>}
                  </td>
                  <td className="mono">{w.ts}</td>
                  <td style={{ fontSize: 12 }}><CopyChip value={w.address} short title="Скопировать адрес" /></td>
                  <td style={{ fontSize: 12 }}><CopyChip value={w.txHash} title="Скопировать TX" /></td>
                  <td style={{ fontSize: 12 }}><CopyChip value={w.id} title="Скопировать ID" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </Drawer>
    {openWId && (() => {
      const w = history.find((x) => x.id === openWId);
      return w ? <WithdrawDetailDrawer w={w} onClose={() => setOpenWId(null)} /> : null;
    })()}
    </>
  );
}

function WithdrawDetailDrawer({ w, onClose }) {
  const rate = (typeof ME !== "undefined" && ME.usdtRate) ? ME.usdtRate : 92.4;
  return (
    <Drawer
      title="Вывод"
      id={w.id}
      status={w.status}
      statusMap={WITHDRAW_STATUS}
      onClose={onClose}
      extraTags={<span className="dispute-sla mono">{WITHDRAW_NETWORK}</span>}
      footer={<><span className="spacer" /><Btn variant="ghost" onClick={onClose}>Закрыть</Btn></>}
    >
      <Section title="Сводка">
        <KV items={[
          ["Сумма", <strong className="mono">−{w.amount.toFixed(2)} USDT</strong>],
          ["Комиссия сети", <span className="mono">{w.fee.toFixed(2)} USDT</span>],
          ["К списанию", <strong className="mono">{(w.amount + w.fee).toFixed(2)} USDT</strong>],
          ["Эквивалент", <span className="mono">≈ {fmtMoney(w.amount * rate, "RUB")}</span>],
          ["Сеть", <span className="mono">{WITHDRAW_NETWORK}</span>],
          ["Дата", <span className="mono">{w.ts}</span>],
        ]} />
      </Section>

      <Section title="Реквизиты">
        <KV items={[
          ["Адрес", <CopyChip value={w.address} title="Скопировать адрес" />],
          ["TX hash", w.txHash
            ? <CopyChip value={w.txHash} title="Скопировать TX" />
            : <span className="mono muted">— транзакция ещё не отправлена</span>],
          ["ID вывода", <CopyChip value={w.id} title="Скопировать ID" />],
        ]} />
      </Section>

      <Section title="Timeline">
        <Timeline items={[
          { time: w.ts, text: "Заявка на вывод создана" },
          ...(w.status === "manual" ? [{ time: "сейчас", text: "Ручная проверка саппортом", muted: true }] : []),
          ...(w.status === "processing" ? [{ time: "сейчас", text: "Обрабатывается казначейством", muted: true }] : []),
          ...(w.txHash ? [{ time: w.ts, text: "Транзакция отправлена в сеть " + WITHDRAW_NETWORK }] : []),
          ...(w.status === "sent" ? [{ time: w.ts, text: "Средства доставлены получателю" }] : []),
          ...(w.status === "rejected" ? [{ time: w.ts, text: "Вывод отклонён — средства возвращены на баланс" }] : []),
          ...(w.status === "cancelled" ? [{ time: w.ts, text: "Отменён пользователем", muted: true }] : []),
        ]} />
      </Section>
    </Drawer>
  );
}

function TraderFinance({ go }) {
  const [filter, setFilter] = React.useState("all");
  const [period, setPeriod] = React.useState("today");
  const [depositAccount, setDepositAccount] = React.useState(null);
  const [withdrawAccount, setWithdrawAccount] = React.useState(null);
  const [openOrderId, setOpenOrderId] = React.useState(null);
  const openPayIn  = openOrderId && openOrderId.startsWith("PI-") ? PAY_IN.find((o) => o.id === openOrderId)  : null;
  const openPayOut = openOrderId && openOrderId.startsWith("PO-") ? PAY_OUT.find((o) => o.id === openOrderId) : null;
  const PERIODS = {
    "hour":      { label: "Час",     title: "за час",      k: 0.07, take: 1 },
    "today":     { label: "Сегодня", title: "сегодня",     k: 1,    take: 4 },
    "yesterday": { label: "Вчера",   title: "вчера",       k: 0.92, take: 3 },
    "month":     { label: "Месяц",   title: "за месяц",    k: 22.4, take: Infinity },
    "all":       { label: "Всё",     title: "за всё время",k: 184.6, take: Infinity },
  };
  const p = PERIODS[period];
  const periodChips = Object.keys(PERIODS).map((id) => ({ value: id, label: PERIODS[id].label }));
  const filters = [
    { value: "all", label: "Все", count: LEDGER.length },
    { value: "payin", label: "Платежи", count: LEDGER.filter((l) => l.orderId && l.orderId.startsWith("PI-")).length },
    { value: "payout", label: "Выплаты", count: LEDGER.filter((l) => l.orderId && l.orderId.startsWith("PO-")).length },
    { value: "commission", label: "Комиссии", count: LEDGER.filter((l) => l.type === "commission").length },
  ];
  const visible = LEDGER.filter((l) => {
    if (filter === "all") return true;
    if (filter === "payin") return l.orderId && l.orderId.startsWith("PI-");
    if (filter === "payout") return l.orderId && l.orderId.startsWith("PO-");
    if (filter === "working") return l.account === "working";
    if (filter === "insurance") return l.account === "insurance";
    if (filter === "fines") return ["fine","freeze","release"].includes(l.type);
    if (filter === "commission") return l.type === "commission";
    return true;
  });

  return (
    <>
      <FilterChips filters={periodChips} value={period} onChange={setPeriod} />

      {/* Балансы */}
      {(() => {
        const payInRub  = 682400 * p.k;
        const payOutRub = BALANCES.todayPayOutRub * p.k;
        const profitIn  = (payInRub  / ME.usdtRate) * 0.065;
        const profitOut = (payOutRub / ME.usdtRate) * 0.035;
        return (
      <div className="hero-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="hero-card hero-card--accent">
          <div className="hero-card__label">Рабочий баланс</div>
          <div className="hero-card__value">{fmtMoney(BALANCES.working.amount, "USDT")}</div>
          <div className="hero-card__actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn variant="primary" size="sm" onClick={() => setDepositAccount("working")}>Пополнить</Btn>
            <Btn variant="primary" size="sm" onClick={() => setWithdrawAccount("working")}>Вывод</Btn>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Заморожено</div>
          <div className="hero-card__value">{fmtMoney(BALANCES.working.frozenUsdt, "USDT")}</div>
          <div className="hero-card__actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(() => {
              const piN = PAY_IN.filter((o) => o.status === "waiting-payment").length;
              const dspN = DISPUTES.filter((d) => ["open","waiting-trader","waiting-admin"].includes(d.status)).length;
              const plural = (n, one, few, many) => {
                const m10 = n % 10, m100 = n % 100;
                if (m10 === 1 && m100 !== 11) return one;
                if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
                return many;
              };
              return (
                <>
                  <Btn variant="primary" size="sm" onClick={() => go("payin", { filter: "in-progress" })}>{piN} {plural(piN, "платёж", "платежа", "платежей")}</Btn>
                  <Btn variant="primary" size="sm" onClick={() => go("disputes")}>{dspN} {plural(dspN, "спор", "спора", "споров")}</Btn>
                </>
              );
            })()}
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Страховой депозит</div>
          <div className="hero-card__value">{fmtMoney(BALANCES.insurance.amount, "USDT")}</div>
          <div className="hero-card__actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn variant="primary" size="sm" onClick={() => setDepositAccount("insurance")}>Пополнить</Btn>
            <Btn variant="primary" size="sm" onClick={() => setWithdrawAccount("insurance")}>Вывод</Btn>
          </div>
        </div>
        <div className="hero-card" onClick={() => go("payin")} style={{ cursor: "pointer" }}>
          <div className="hero-card__label">Платежи {p.title}</div>
          <div className="hero-card__value">{fmtMoney(payInRub / ME.usdtRate, "USDT")}</div>
          <div className="hero-card__sub">{fmtMoney(payInRub, "RUB")} · профит <b>{profitIn.toFixed(2)} USDT</b></div>
        </div>
        <div className="hero-card" onClick={() => go("payout")} style={{ cursor: "pointer" }}>
          <div className="hero-card__label">Выплаты {p.title}</div>
          <div className="hero-card__value">{fmtMoney(payOutRub / ME.usdtRate, "USDT")}</div>
          <div className="hero-card__sub">{fmtMoney(payOutRub, "RUB")} · профит <b>{profitOut.toFixed(2)} USDT</b></div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Профит {p.title}</div>
          <div className="hero-card__value">{fmtMoney(profitIn + profitOut, "USDT")}</div>
          <div className="hero-card__sub"><span className="mono" style={{ color: "var(--ink-3)" }}>↓</span> <b>{profitIn.toFixed(2)}</b> · <span className="mono" style={{ color: "var(--ink-3)" }}>↑</span> <b>{profitOut.toFixed(2)}</b></div>
        </div>
      </div>
        );
      })()}

      <FilterChips filters={filters} value={filter} onChange={setFilter} />

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>Тип</th>
            <th className="num">Сумма USDT</th>
            <th>Ордер</th>
            <th>Дата</th>
            <th>ID</th>
          </tr></thead>
          <tbody>
            {visible.slice(0, p.take).map((l) => {
              const clickable = !!l.orderId && (l.orderId.startsWith("PI-") || l.orderId.startsWith("PO-"));
              return (
                <tr
                  key={l.id}
                  className={(openOrderId && openOrderId === l.orderId ? "is-selected" : "") + (clickable ? "" : " is-static")}
                  style={clickable ? { cursor: "pointer" } : null}
                  onClick={clickable ? () => setOpenOrderId(l.orderId) : undefined}
                >
                  <td><StatusPill map={LEDGER_TYPE} value={l.type} /></td>
                  <td className="num"><strong style={{ color: l.amountUsdt >= 0 ? "var(--ok)" : "var(--bad)" }}>{l.amountUsdt >= 0 ? "+" : ""}{l.amountUsdt.toFixed(2)} USDT</strong></td>
                  <td className="mono muted" title={l.orderId || undefined}>{l.orderId
                    ? clickable
                      ? <span style={{ color: "var(--ink)" }}>{shortPaymentId(l.orderId)} <span className="muted" style={{ fontSize: 11 }}>↗</span></span>
                      : shortPaymentId(l.orderId)
                    : "—"}</td>
                  <td className="mono">{l.ts}</td>
                  <td className="mono">{l.id}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="table-foot">Показано <strong>{Math.min(visible.length, p.take)}</strong> из <strong>{LEDGER.length}</strong> · обновляется в реальном времени</div>
      </div>

      {depositAccount && <DepositDrawer account={depositAccount} onClose={() => setDepositAccount(null)} />}
      {withdrawAccount && <WithdrawDrawer account={withdrawAccount} onClose={() => setWithdrawAccount(null)} />}
      {openPayIn  && <PayInDrawer  order={openPayIn}  onClose={() => setOpenOrderId(null)} />}
      {openPayOut && <PayOutDrawer order={openPayOut} onClose={() => setOpenOrderId(null)} />}
    </>
  );
}

// ─── РЕЙТИНГ (отдельная страничка) ───────────────────────────────────────
function TraderRating() {
  return (
    <>
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
    { value: "closed", label: "Закрытые", count: DISPUTES.filter((d) => ["resolved","rejected"].includes(d.status)).length },
    { value: "all", label: "Все", count: DISPUTES.length },
  ];
  const visible = DISPUTES.filter((d) => {
    if (filter === "all") return true;
    if (filter === "active") return ["open","waiting-trader","waiting-admin"].includes(d.status);
    if (filter === "closed") return ["resolved","rejected"].includes(d.status);
    return d.status === filter;
  });
  const open = DISPUTES.find((d) => d.id === openId);

  return (
    <>
      <FilterChips filters={filters} value={filter} onChange={setFilter} />

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>Статус</th><th className="num">Сумма</th><th>Открыт</th><th>ID</th><th>Ордер</th><th>Тип</th>
            <th>SLA</th>
          </tr></thead>
          <tbody>
            {visible.map((d) => (
              <tr key={d.id} className={openId === d.id ? "is-selected" : ""} onClick={() => setOpenId(d.id)}>
                <td><StatusPill map={DISPUTE_STATUS} value={d.status} /></td>
                <td className="num" style={{ fontFamily: "\"Inter Tight\"" }}>
                  {fmtMoney(d.amount, "RUB")}
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{(d.amount / ME.usdtRate).toFixed(2)} USDT</div>
                </td>
                <td className="mono">{d.opened}</td>
                <td className="mono">{d.id}</td>
                <td className="mono" title={d.order}>{shortPaymentId(d.order)}</td>
                <td>{d.orderType}</td>
                <td className="mono muted">{d.sla}</td>
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
          ["Ордер", (
            <a
              href={"#" + dispute.order}
              onClick={(e) => e.preventDefault()}
              className="mono"
              style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              {dispute.order} · {dispute.orderType}
            </a>
          )],
          ["Сумма", <strong>{fmtMoney(dispute.amount, "RUB")}</strong>],
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
      <Section title="Ставки по платёжным методам">
        <FilterChips filters={tabs} value={tab} onChange={setTab} />
        <table className="table table--inset">
          <thead><tr>
            <th>Метод</th>
            <th className="num">Ставка (мне)</th>
            <th className="num">Мин. сумма</th>
            <th className="num">Макс. сумма</th>
          </tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.method}>
                <td>
                  <span className={"pd-card__method pd-card__method--" + m.method}>
                    {m.method === "sbp" ? "СБП" : m.method === "card" ? "Карта" : m.method === "c2c" ? "C2C" : m.method === "phone" ? "Phone" : m.method === "account" ? "Счёт" : m.label}
                  </span>
                </td>
                <td className="num mono">{m.rate.toFixed(1)}%</td>
                <td className="num">{fmtMoney(m.min, "RUB")}</td>
                <td className="num">{fmtMoney(m.max, "RUB")}</td>
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
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "account", label: "Аккаунт" },
          { id: "security", label: "Безопасность" },
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

      {tab === "notifications" && null}

      {tab === "kyc" && null}
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
  TraderFinance, TraderRating, TraderDisputes, DisputeDrawer, DepositDrawer, WithdrawDrawer,
  TraderTariff, TraderProfile, ToggleRow, TraderSms,
});

// ─── SMS / Push с терминалов ──────────────────────────────────────────────
function TraderSms() {
  const [filter, setFilter] = React.useState("all");
  const [terminal, setTerminal] = React.useState("all");
  const [bindId, setBindId] = React.useState(null);
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
    { value: "all", label: "Все", count: SMS_LOG.length },
    { value: "unlinked", label: "Не привязаны", count: SMS_LOG.filter((s) => !s.payment || !s.details).length },
    { value: "unparsed", label: "Не распознаны", count: SMS_LOG.filter((s) => !s.parsed).length },
    { value: "linked", label: "Привязаны", count: SMS_LOG.filter((s) => s.payment && s.details && s.parsed).length },
  ];

  const smsAfterStatus = SMS_LOG.filter((s) => {
    if (filter === "unlinked") return !s.payment || !s.details;
    if (filter === "unparsed") return !s.parsed;
    if (filter === "linked") return s.payment && s.details && s.parsed;
    return true;
  });

  const termOptions = [{ value: "all", label: "Все терминалы", count: smsAfterStatus.length }].concat(
    TERMINALS.map((t) => ({
      value: t.id,
      label: t.id + " · " + t.name,
      count: smsAfterStatus.filter((s) => s.terminal === t.id).length,
    }))
  );
  const termActive = termOptions.find((o) => o.value === terminal) || termOptions[0];
  const termIsAll = terminal === "all";

  const visible = smsAfterStatus.filter((s) => terminal === "all" || s.terminal === terminal);

  const bindRow = bindId ? SMS_LOG.find((s) => s.id === bindId) : null;

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
            <th>Источник</th>
            <th>Время</th>
            <th>Банк</th>
            <th>Реквизит</th>
            <th>Платёж</th>
            <th className="num">Сумма</th>
            <th>Сообщение</th>
            <th />
          </tr></thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan={9}><Empty>Нет сообщений по выбранным фильтрам</Empty></td></tr>
            ) : visible.map((s) => {
              const src = SMS_SOURCE[s.source];
              const needsBind = !s.payment || !s.details;
              return (
                <tr key={s.id}>
                  <td className="mono">{s.terminal}</td>
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
                      ? <CopyId value={s.payment} short />
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
                  <td className="num">
                    {needsBind && (
                      <Btn variant="primary" size="sm" onClick={() => setBindId(s.id)}>Привязать</Btn>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {bindRow && (
        <SmsBindModal row={bindRow} onClose={() => setBindId(null)} />
      )}
    </>
  );
}

function SmsBindModal({ row, onClose }) {
  const [det, setDet] = React.useState(row.details || "");
  const [pay, setPay] = React.useState(row.payment || "");
  return (
    <Modal
      title="Привязать SMS к платежу"
      onClose={onClose}
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <Btn variant="primary" onClick={onClose}>Привязать</Btn>
      </>}>
      <Section title="Сообщение">
        <KV items={[
          ["Терминал", <span className="mono">{row.terminal}</span>],
          ["Источник", <span className={"sms-source sms-source--" + ((SMS_SOURCE[row.source] || {}).tone || "mts")}>{(SMS_SOURCE[row.source] || {}).label || row.source}</span>],
          ["Время", <span className="mono">{row.time}</span>],
          ["Сумма", row.amount != null ? <span className="sms-amount">+{fmtMoney(row.amount, "RUB")}</span> : "—"],
          ["Текст", <span className="sms-msg">{row.message}</span>],
        ]} />
      </Section>
      <Section title="Привязка">
        <Field label="Реквизит">
          <Select
            value={det}
            onChange={setDet}
            options={[{ value: "", label: "— Выберите реквизит —" }].concat(
              PAYMENT_DETAILS.filter((p) => p.terminal === row.terminal).map((p) => ({
                value: p.id, label: p.id + " · " + p.target,
              }))
            )} />
        </Field>
        <Field label="Платёж" hint="Можно оставить пустым, если SMS не относится к платежу">
          <Select
            value={pay}
            onChange={setPay}
            options={[{ value: "", label: "— Нет подходящего платежа —" }].concat(
              PAY_IN
                .filter((o) => row.amount == null || o.amount === row.amount)
                .slice(0, 8)
                .map((o) => ({ value: o.id, label: o.id + " · " + fmtMoney(o.amount, "RUB") + " · " + o.merchant }))
            )} />
        </Field>
      </Section>
    </Modal>
  );
}
