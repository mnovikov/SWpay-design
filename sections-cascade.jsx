// CrowdPay v3 — раздел «Каскад» (Контрагенты)
// Оператор выбирает Мерчанта, Метод и Сумму — система строит каскад:
// по какому порядку будут предлагаться реквизиты трейдеров и провайдеров.
// Порядок = рейтинг + конверсия при условии, что есть подходящие активные
// реквизиты (по методу, сумме, лимитам и статусу терминала).

const CASC_USD = 92.4; // курс для оценки комиссии в USDT

// какие методы кто умеет принимать
const CASC_TRADER_METHODS   = ["sbp", "card"];
const CASC_PROVIDER_METHODS = ["sbp", "card", "account"];

// ставка тарифа для конкретного метода (что платформа платит контрагенту)
function cascRate(tariffId, method) {
  const t = (typeof TARIFFS !== "undefined" ? TARIFFS : []).find((x) => x.id === tariffId) || (TARIFFS && TARIFFS[0]);
  const base = t ? t.payInTrader : 2.0;
  const adj = { sbp: 0, card: 0.3, account: -0.5, cash: 0.5 }[method] || 0;
  return Math.max(0.5, +(base + adj).toFixed(1));
}

// сортировочные ключи каскада
function cascVipBound(kind, id) {
  if (kind !== "trader") return false;
  const vips = (typeof VIPS !== "undefined" ? VIPS : []);
  return vips.some((v) => (v.traders || []).some((x) => x.trader === id));
}
function cascHash(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

// строим строку кандидата-трейдера
function cascTrader(tr, method, amount) {
  const supports = CASC_TRADER_METHODS.includes(method);
  const pds = (typeof PAYMENT_DETAILS !== "undefined" ? PAYMENT_DETAILS : [])
    .filter((pd) => pd.trader === tr.id && pd.method === method);
  const activeCount = pds.filter((pd) => pd.status === "active").length;
  const available = pds.filter((pd) =>
    pd.status === "active" &&
    amount >= pd.min && amount <= pd.max &&
    (pd.dailyUsed ?? 0) < 0.98 &&
    (pd.opsToday ?? 0) < (pd.opsLimit ?? 1e9)
  );

  let reason = null;
  if (tr.status !== "active") reason = "Трейдер не активен";
  else if (!(tr.rights && tr.rights.payIn)) reason = "Нет прав на приём";
  else if (!supports) reason = "Метод не поддерживается";
  else if (activeCount === 0) reason = "Нет активных реквизитов";
  else if (available.length === 0) reason = "Реквизиты не проходят по сумме / лимитам";

  const rate = cascRate(tr.tariff, method);
  const actPds = pds.filter((pd) => pd.status === "active");
  return {
    kind: "trader", id: tr.id, name: tr.name, sub: tr.team ? "команда " + tr.team : tr.login,
    rating: tr.rating, conv: tr.success, rate,
    vip: cascVipBound("trader", tr.id),
    assignActive: tr.status === "active",
    freeLimit: actPds.length ? Math.max(...actPds.map((pd) => 1 - (pd.dailyUsed ?? 0))) : 0,
    commissionUsdt: (amount * rate / 100) / CASC_USD,
    activeCount, availableCount: available.length,
    eligible: !reason, reason,
  };
}

// строим строку кандидата-провайдера (доступ по API, без физических реквизитов)
function cascProvider(pv, method, amount) {
  const supports = CASC_PROVIDER_METHODS.includes(method);
  let reason = null;
  if (pv.status !== "active") reason = "Провайдер не активен";
  else if (!supports) reason = "Метод не поддерживается";

  const rate = cascRate(pv.tariff, method);
  return {
    kind: "provider", id: pv.id, name: pv.name, sub: pv.company || "API · REST",
    rating: +Math.min(5, (pv.success || 0) * 5).toFixed(2), conv: pv.success, rate,
    vip: false, assignActive: pv.status === "active", freeLimit: 1,
    commissionUsdt: (amount * rate / 100) / CASC_USD,
    activeCount: null, availableCount: null, // API — реквизиты не применимы
    eligible: !reason, reason,
  };
}

// ── Разбор причин: почему реквизит трейдера не проходит в каскад ──────────
const cascFmtRub = (v) => Math.round(v).toLocaleString("ru-RU");
const CASC_PD_STATUS = {
  active: "Активен", "limit-exceeded": "Лимит превышен",
  "terminal-offline": "Терминал offline", frozen: "Заморожен", blocked: "Заблокирован",
};
function cascPdReason(pd, method, amount) {
  const ml = (typeof METHOD_LABEL !== "undefined" && METHOD_LABEL) || {};
  if (pd.method !== method) return { ok: false, reason: "Другой метод — " + (ml[pd.method] || pd.method) };
  if (pd.status !== "active") {
    const pending = pd.status === "limit-exceeded";
    return { ok: false, pending, reason: (CASC_PD_STATUS[pd.status] || pd.status) + (pd.blockReason ? " · " + pd.blockReason : "") };
  }
  if (amount < pd.min) return { ok: false, reason: "Сумма ниже минимума " + cascFmtRub(pd.min) + " ₽" };
  if (amount > pd.max) return { ok: false, reason: "Сумма выше максимума " + cascFmtRub(pd.max) + " ₽" };
  if ((pd.dailyUsed ?? 0) >= 0.98) return { ok: false, pending: true, reason: "Дневной лимит почти исчерпан (" + Math.round((pd.dailyUsed ?? 0) * 100) + "%)" };
  if ((pd.opsToday ?? 0) >= (pd.opsLimit ?? 1e9)) return { ok: false, pending: true, reason: "Достигнут лимит операций (" + pd.opsToday + "/" + pd.opsLimit + ")" };
  return { ok: true, reason: "Проходит по методу, сумме и лимитам" };
}

// детерминированное время до освобождения реквизита (для «в ожидании»)
function cascPendingSec(pd) {
  let h = 0; for (const c of String(pd.id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 120 + (h % (38 * 60));
}

function CascCountdown({ seconds }) {
  const [left, setLeft] = React.useState(seconds);
  React.useEffect(() => {
    setLeft(seconds);
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [seconds]);
  const pad = (n) => String(n).padStart(2, "0");
  const h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
  return <span>{h > 0 ? h + ":" : ""}{pad(m)}:{pad(s)}</span>;
}

function SectionCascade() {
  const merchants = (typeof MERCHANTS !== "undefined" ? MERCHANTS : []);
  const firstActive = merchants.find((m) => m.status === "active") || merchants[0];
  const [merchant, setMerchant] = React.useState(firstActive ? firstActive.id : "");
  const [method, setMethod] = React.useState("sbp");
  const [amount, setAmount] = React.useState(15000);
  const [showExcluded, setShowExcluded] = React.useState(true);
  const allTraders = (typeof TRADERS !== "undefined" ? TRADERS : []);
  const allProviders = (typeof PROVIDERS !== "undefined" ? PROVIDERS : []);
  const [reasonTrader, setReasonTrader] = React.useState("");
  const [reasonProvider, setReasonProvider] = React.useState("");
  const [showFunnel, setShowFunnel] = React.useState(false);
  // Каскад считается только по кнопке — храним «применённые» параметры отдельно
  const [applied, setApplied] = React.useState(null);

  const methodChips = Object.keys(typeof METHOD_LABEL !== "undefined" ? METHOD_LABEL : { sbp: "СБП" })
    .map((k) => ({ value: k, label: METHOD_LABEL[k] }));

  const rows = React.useMemo(() => {
    if (!applied) return [];
    const t = (typeof TRADERS !== "undefined" ? TRADERS : []).map((x) => cascTrader(x, applied.method, applied.amount));
    const p = (typeof PROVIDERS !== "undefined" ? PROVIDERS : []).map((x) => cascProvider(x, applied.method, applied.amount));
    return [...t, ...p];
  }, [applied]);

  const ranked = rows
    .filter((r) => r.eligible)
    .sort((a, b) => ((b.vip ? 1 : 0) - (a.vip ? 1 : 0)) || ((b.assignActive ? 1 : 0) - (a.assignActive ? 1 : 0)) || (b.rating - a.rating) || (b.conv - a.conv) || (b.freeLimit - a.freeLimit) || (a.rate - b.rate));
  const excluded = rows.filter((r) => !r.eligible);

  const fmtRub = (v) => Math.round(v).toLocaleString("ru-RU");
  const merchName = (typeof merchantName !== "undefined") ? merchantName(applied ? applied.merchant : merchant) : (applied ? applied.merchant : merchant);

  // отличаются ли текущие поля от последнего расчёта
  const dirty = !applied || applied.merchant !== merchant || applied.method !== method || applied.amount !== amount;
  const build = () => setApplied({ merchant, method, amount });

  return (
    <>
      <PageHead
        title="Каскад"
        sub="Выберите мерчанта, метод и сумму — система построит порядок, в котором будут предлагаться реквизиты трейдеров и провайдеров, исходя из рейтинга, конверсии и наличия подходящих активных реквизитов."
      />

      {/* ── Панель параметров ─────────────────────────────────────────── */}
      <div className="section" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 240px", minWidth: 200 }}>
            <Field label="Мерчант">
              <Select value={merchant} onChange={setMerchant}
                options={merchants.map((m) => ({ value: m.id, label: m.name + " · " + m.id }))} />
            </Field>
          </div>
          <div style={{ flex: "1 1 220px", minWidth: 180 }}>
            <Field label="Метод">
              <div style={{ marginTop: 2 }}>
                <FilterChips filters={methodChips} value={method} onChange={setMethod} />
              </div>
            </Field>
          </div>
          <div style={{ flex: "1 1 200px", minWidth: 170 }}>
            <Field label="Сумма, ₽">
              <TextInput mono value={String(amount)}
                onChange={(v) => setAmount(Math.max(0, parseInt(String(v).replace(/\D/g, ""), 10) || 0))}
                placeholder="напр. 15000" />
            </Field>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <Btn variant="primary" onClick={build}>Построить каскад</Btn>
          {applied && dirty && (
            <span className="muted" style={{ fontSize: 13 }}>Параметры изменены — нажмите, чтобы пересчитать</span>
          )}
        </div>
      </div>

      {!applied && (
        <Empty>Задайте параметры и нажмите «Построить каскад», чтобы увидеть порядок контрагентов</Empty>
      )}

      {applied && (
      <>
      {/* ── Сводка ────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 14 }}>
          Каскад для <strong>{merchName}</strong> ·{" "}
          <strong>{(typeof METHOD_LABEL !== "undefined" && METHOD_LABEL[applied.method]) || applied.method}</strong> ·{" "}
          <strong>{fmtRub(applied.amount)} ₽</strong>
        </div>
        <span className="muted" style={{ fontSize: 13 }}>
          {ranked.length} подходящих · {excluded.length} отсеяно
        </span>
      </div>

      {/* ── Каскад: ранжированная таблица ─────────────────────────────── */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 44 }}>#</th>
              <th>Тип</th>
              <th>Контрагент</th>
              <th className="num">Рейтинг</th>
              <th className="num">Стоимость (тариф)</th>
              <th className="num">Конверсия</th>
              <th className="num">Реквизиты сейчас</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => (
              <tr key={r.kind + r.id} className={i === 0 ? "is-selected" : ""}>
                <td>
                  <span className="mono" style={{ fontWeight: 700, color: i === 0 ? "var(--accent-ink)" : "var(--ink-3)" }}>
                    {i + 1}
                  </span>
                </td>
                <td>
                  <Pill tone={r.kind === "trader" ? "info" : "plum"}>
                    {r.kind === "trader" ? "Трейдер" : "Провайдер"}
                  </Pill>
                </td>
                <td>
                  <div className="cell-stack">
                    <strong>{r.name}</strong>
                    <span className="muted mono" style={{ fontSize: 11 }}>{r.id} · {r.sub}</span>
                  </div>
                </td>
                <td className="num">
                  <span style={{ fontWeight: 600 }}>{r.rating.toFixed(2)}</span>
                  <span className="muted" style={{ fontSize: 11 }}> ★</span>
                </td>
                <td className="num">
                  <strong>{r.rate.toFixed(1)}%</strong>
                  <div className="muted" style={{ fontSize: 11 }}>≈ {r.commissionUsdt.toFixed(2)} USDT</div>
                </td>
                <td className="num">{Math.round(r.conv * 100)}%</td>
                <td className="num">
                  {r.kind === "trader" ? (
                    <>
                      <strong style={{ color: "var(--ok)" }}>{r.availableCount}</strong>
                      <span className="muted"> / {r.activeCount} акт.</span>
                    </>
                  ) : (
                    <span className="muted">API · без лимита</span>
                  )}
                </td>
              </tr>
            ))}
            {ranked.length === 0 && (
              <tr><td colSpan={7}><Empty>Нет подходящих контрагентов для этих параметров</Empty></td></tr>
            )}
          </tbody>
        </table>
        {ranked.length > 0 && (
          <div className="table-foot">
            Первым будет предложен <strong>{ranked[0].name}</strong>; при отказе или таймауте каскад
            переходит к следующему по списку.
          </div>
        )}
      </div>

      {/* ── Детальный анализ: вердикт по выбранному контрагенту ─────────── */}
      {(() => {
        const tr = allTraders.find((x) => x.id === reasonTrader);
        const pv = allProviders.find((x) => x.id === reasonProvider);
        const selKind = tr ? "trader" : pv ? "provider" : null;
        const selId = tr ? tr.id : pv ? pv.id : null;
        const selName = tr ? tr.name : pv ? pv.name : null;
        const ml = (typeof METHOD_LABEL !== "undefined" && METHOD_LABEL) || {};
        const cand = selKind ? rows.find((r) => r.kind === selKind && r.id === selId) : null;
        const rank = cand ? ranked.findIndex((r) => r.kind === selKind && r.id === selId) + 1 : 0;
        const winner = ranked[0] || null;
        const outcome = !cand ? "missing" : (rank === 1 ? "won" : (cand.eligible ? "lost" : "rejected"));
        const selPds = tr ? (typeof PAYMENT_DETAILS !== "undefined" ? PAYMENT_DETAILS : []).filter((pd) => pd.trader === tr.id) : [];
        const methodPds = selPds.filter((pd) => pd.method === applied.method);
        const passPds = methodPds.filter((pd) => cascPdReason(pd, applied.method, applied.amount).ok);
        const failPds = (methodPds.length ? methodPds : selPds).map((pd) => ({ pd, r: cascPdReason(pd, applied.method, applied.amount) })).filter((x) => !x.r.ok);
        const bn = (b) => (typeof bankName !== "undefined" ? bankName(b) : b);
        // сравнение с победителем по ключам сортировки
        const CMP_KEYS = [
          { k: "vip",          label: "Привязка к VIP-клиенту",   fmt: (v) => (v ? "да" : "нет"), bool: true, onlyDiff: true },
          { k: "assignActive", label: "Статус назначения",        fmt: (v) => (v ? "Активно" : "На паузе"), bool: true, onlyDiff: true },
          { k: "rating",       label: "Рейтинг",                  fmt: (v) => v.toFixed(2) },
          { k: "conv",         label: "Конверсия (7 дн)",          fmt: (v) => Math.round(v * 100) + "%" },
          { k: "freeLimit",    label: "Свободный дневной лимит",  fmt: (v) => Math.round(v * 100) + "%" },
        ];
        let decisive = null;
        if (outcome === "lost" && winner && cand) {
          for (const row of CMP_KEYS) {
            const w = winner[row.k], s = cand[row.k];
            if ((row.bool ? (w ? 1 : 0) !== (s ? 1 : 0) : w !== s)) { decisive = row.k; break; }
          }
        }
        const cmpRows = (outcome === "lost" && winner && cand)
          ? CMP_KEYS.filter((row) => !row.onlyDiff || winner[row.k] !== cand[row.k])
          : [];
        const decisiveLabel = decisive ? CMP_KEYS.find((r) => r.k === decisive).label : null;
        // воронка по всем кандидатам
        const funnelSteps = [
          { label: "Контрагент активен", cond: "статус active, не заблокирован и не на паузе", match: (r) => r.reason === "Трейдер не активен" || r.reason === "Провайдер не активен" },
          { label: "Права на приём (pay-in)", cond: "у контрагента включён приём платежей", match: (r) => r.reason === "Нет прав на приём" },
          { label: "Метод поддерживается", cond: "«" + (ml[applied.method] || applied.method) + "» входит в методы контрагента", match: (r) => r.reason === "Метод не поддерживается" },
          { label: "Есть активные реквизиты", cond: "хотя бы один реквизит в статусе «Активен»", match: (r) => r.reason === "Нет активных реквизитов" },
          { label: "Реквизиты проходят по сумме и лимитам", cond: cascFmtRub(applied.amount) + " ₽ в пределах min–max, дневной лимит и лимит операций не исчерпаны", match: (r) => r.reason === "Реквизиты не проходят по сумме / лимитам" },
        ];
        let rem = rows.length;
        const funnel = funnelSteps.map((s) => {
          const drop = rows.filter((r) => s.match(r)).length;
          const row = { ...s, before: rem, drop, after: rem - drop };
          rem -= drop;
          return row;
        });
        const loadCell = (pd) => {
          const awaiting = cascHash(pd.id) % 3, parallel = 3;
          return Math.round((pd.dailyUsed ?? 0) * 100) + "% дн · " + (pd.opsToday ?? 0) + "/" + (pd.opsLimit ?? "∞") + " оп · " + awaiting + "/" + parallel;
        };
        return (
          <div className="section" style={{ marginTop: 18 }}>
            <div className="section__title" style={{ marginBottom: 4 }}>Детальный анализ</div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
              Выберите трейдера или провайдера — система покажет, получит ли он платёж для{" "}
              <strong>{ml[applied.method] || applied.method}</strong> на сумму <strong>{fmtRub(applied.amount)} ₽</strong> и почему.
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
              <div style={{ flex: "1 1 260px", minWidth: 220 }}>
                <Field label="Трейдер">
                  <Select value={reasonTrader} onChange={(v) => { setReasonTrader(v); if (v) setReasonProvider(""); }}
                    options={[{ value: "", label: "— не выбрано —" }, ...allTraders.map((x) => ({ value: x.id, label: x.name + " · " + x.id }))]} />
                </Field>
              </div>
              <div style={{ flex: "1 1 260px", minWidth: 220 }}>
                <Field label="Провайдер">
                  <Select value={reasonProvider} onChange={(v) => { setReasonProvider(v); if (v) setReasonTrader(""); }}
                    options={[{ value: "", label: "— не выбрано —" }, ...allProviders.map((x) => ({ value: x.id, label: x.name + " · " + x.id }))]} />
                </Field>
              </div>
            </div>

            {!selKind && <Empty>Выберите трейдера или провайдера, чтобы увидеть вердикт</Empty>}

            {selKind && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                  <strong>{selName}</strong>
                  <span className="muted mono" style={{ fontSize: 11 }}>{selId}</span>
                  {outcome === "won" && <Pill tone="ok">Получил платёж</Pill>}
                  {outcome === "lost" && <Pill tone="warn">Проиграл сортировку</Pill>}
                  {outcome === "rejected" && <Pill tone="bad">Отсеян</Pill>}
                  {outcome === "missing" && <Pill tone="neutral">Не найден</Pill>}
                </div>

                {outcome === "missing" && (
                  <Note tone="neutral">Не найден среди кандидатов: контрагент не назначен на этого мерчанта, назначение отсутствует, либо делегированный маршрут выключен.</Note>
                )}

                {outcome === "won" && (
                  <Note tone="ok">Выбран для исполнения — первым в каскаде.</Note>
                )}

                {outcome === "lost" && winner && cand && (
                  <>
                    <Note tone="warn">Дошёл до сортировки (позиция {rank}), но приоритет выше у другого кандидата.</Note>
                    <div style={{ marginTop: 12, border: "1px solid var(--line)", borderRadius: 10, background: "var(--paper-2)", padding: "12px 14px" }}>
                      <div style={{ fontSize: 13.5, marginBottom: 10 }}>
                        Платёж ушёл <strong>{winner.name}</strong>
                        {decisiveLabel
                          ? <span className="muted"> · выше по показателю «{decisiveLabel}»</span>
                          : <span className="muted"> · равны по всем ключам — победитель выбран случайно</span>}
                      </div>
                      <table className="table table--inset" style={{ background: "#fff", borderRadius: 8 }}>
                        <thead><tr><th>Показатель</th><th className="num">Победитель</th><th className="num">Выбранный</th></tr></thead>
                        <tbody>
                          {cmpRows.map((row) => {
                            const isDec = row.k === decisive;
                            return (
                              <tr key={row.k} className="is-static" style={isDec ? { background: "var(--accent-soft, var(--warn-soft))" } : undefined}>
                                <td style={isDec ? { fontWeight: 700 } : undefined}>
                                  {row.label}
                                  {isDec && <span className="pill pill--warn pill--icon" style={{ marginLeft: 8, fontSize: 10.5, padding: "1px 8px" }}>решает</span>}
                                </td>
                                <td className="num mono" style={{ fontVariantNumeric: "tabular-nums", color: "var(--ok)", fontWeight: isDec ? 700 : 500 }}>{row.fmt(winner[row.k])}</td>
                                <td className="num mono" style={{ fontVariantNumeric: "tabular-nums", fontWeight: isDec ? 700 : 400 }}>{row.fmt(cand[row.k])}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {outcome === "rejected" && (
                  <>
                    <Note tone="bad">Отсеян фильтром. Не выполнено условие: {cand.reason ? cand.reason.toLowerCase() : "—"}.</Note>
                    {selKind === "provider" && (
                      <div style={{ marginTop: 10 }}>
                        <Note tone="neutral">Провайдер работает по API — физических реквизитов нет, проверяются только статус и поддержка метода.</Note>
                      </div>
                    )}
                    {selKind === "trader" && failPds.length > 0 && (
                      <div className="table-wrap" style={{ marginTop: 12 }}>
                        <div className="muted" style={{ fontSize: 12.5, margin: "0 0 6px 2px", fontWeight: 600 }}>Невыполненные условия по реквизитам</div>
                        <table className="table table--inset">
                          <thead><tr><th>Реквизит</th><th>Метод</th><th>Условие</th></tr></thead>
                          <tbody>
                            {failPds.map(({ pd, r }) => (
                              <tr key={pd.id} className="is-static">
                                <td><div className="cell-stack"><strong>{bn(pd.bank)}</strong><span className="muted mono" style={{ fontSize: 11 }}>{pd.target}</span></div></td>
                                <td>{ml[pd.method] || pd.method}</td>
                                <td style={{ color: "var(--bad)", fontWeight: 600 }}>{r.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {selKind === "trader" && failPds.length === 0 && (
                      <div style={{ marginTop: 10 }}>
                        <Note tone="neutral">У трейдера нет реквизитов для метода «{ml[applied.method] || applied.method}».</Note>
                      </div>
                    )}
                  </>
                )}

                {(outcome === "won" || outcome === "lost") && selKind === "trader" && passPds.length > 0 && (
                  <div className="table-wrap" style={{ marginTop: 16 }}>
                    <div className="muted" style={{ fontSize: 12.5, margin: "0 0 6px 2px", fontWeight: 600 }}>Проходящие реквизиты</div>
                    <table className="table table--inset">
                      <thead><tr><th>Реквизит</th><th>Метод</th><th className="num">Лимиты сумм</th><th className="num">Загрузка</th></tr></thead>
                      <tbody>
                        {passPds.map((pd) => (
                          <tr key={pd.id} className="is-static">
                            <td><div className="cell-stack"><strong>{bn(pd.bank)}</strong><span className="muted mono" style={{ fontSize: 11 }}>{pd.target}</span></div></td>
                            <td>{ml[pd.method] || pd.method}</td>
                            <td className="num mono" style={{ fontSize: 12 }}>{cascFmtRub(pd.min)}–{cascFmtRub(pd.max)} ₽</td>
                            <td className="num mono" style={{ fontSize: 12 }}>{loadCell(pd)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Полная воронка (свёрнута по умолчанию) ────────────────── */}
            <div style={{ marginTop: 18 }}>
              <button className="btn btn--ghost btn--sm" style={{ padding: 0, color: "var(--info, #1f4e92)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontSize: 13 }} onClick={() => setShowFunnel((v) => !v)}>
                {showFunnel ? "Скрыть полную воронку каскада" : "Показать полную воронку каскада"}
              </button>
              {showFunnel && (
                <div style={{ marginTop: 10 }}>
                  <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>Счётчики До/Отсеяно/После считаются по всем кандидатам сразу, а не по выбранному.</div>
                  <div className="table-wrap">
                    <table className="table table--inset">
                      <thead><tr><th>Фильтр</th><th className="num">До</th><th className="num">Отсеяно</th><th className="num">После</th></tr></thead>
                      <tbody>
                        {funnel.map((f) => (
                          <tr key={f.label} className="is-static">
                            <td><div className="cell-stack"><strong>{f.label}</strong><span className="muted" style={{ fontSize: 11.5 }}>{f.cond}</span></div></td>
                            <td className="num mono">{f.before}</td>
                            <td className="num mono" style={f.drop > 0 ? { color: "var(--bad)", fontWeight: 600 } : undefined}>{f.drop > 0 ? "−" + f.drop : "0"}</td>
                            <td className="num mono" style={{ fontWeight: 600 }}>{f.after}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
      </>
      )}
    </>
  );
}
