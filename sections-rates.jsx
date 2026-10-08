// ── Системные / Курсы обмена — CurrencyExchangeRate ─────────────────────────
const RATE_CURRENCIES = ["RUB", "USDT", "AMD"];
const RATE_SOURCE = {
  Manual:   { label: "Ручной",    tone: "info" },
  Provider: { label: "Провайдер", tone: "plum" },
  Seed:     { label: "Seed",      tone: "neutral" },
};
// USDT-пары приходят от провайдера каждые 5 минут — генерируем последние 6 часов
function genUsdtTicks() {
  const out = [];
  const end = Date.parse("2026-07-20T09:00:00Z");
  const N = 72; // 6 часов по 5 минут
  for (let i = 0; i < N; i++) {
    const from = new Date(end - i * 5 * 60000).toISOString();
    const to = i === 0 ? null : new Date(end - (i - 1) * 5 * 60000).toISOString();
    const usdtRub = 81.30 + Math.sin(i / 5) * 0.35 + Math.sin(i / 17) * 0.5;
    out.push({ id: "FX-U" + (9000 - i * 2), sell: "USDT", buy: "RUB", rate: +usdtRub.toFixed(6), from, to, source: "Provider", comment: null });
    out.push({ id: "FX-U" + (9001 - i * 2), sell: "RUB", buy: "USDT", rate: +(1 / usdtRub).toFixed(6), from, to, source: "Provider", comment: null });
  }
  return out;
}
const RATES_SEED = [
  ...genUsdtTicks(),
  { id: "FX-1039", sell: "RUB", buy: "AMD",  rate: 4.7915,    from: "2026-07-19T10:30Z", to: null,                  source: "Manual",   comment: "Сверено с ЦБ РА, спред 0.6%" },
  { id: "FX-1038", sell: "AMD", buy: "RUB",  rate: 0.207431,  from: "2026-07-19T10:30Z", to: null,                  source: "Manual",   comment: "Сверено с ЦБ РА, спред 0.6%" },
  { id: "FX-1035", sell: "RUB", buy: "AMD",  rate: 4.8102,    from: "2026-07-14T09:12Z", to: "2026-07-19T10:30Z",   source: "Manual",   comment: "Ручная коррекция после скачка драма" },
  { id: "FX-1034", sell: "AMD", buy: "RUB",  rate: 0.206625,  from: "2026-07-14T09:12Z", to: "2026-07-19T10:30Z",   source: "Manual",   comment: "Ручная коррекция после скачка драма" },
  { id: "FX-1001", sell: "RUB", buy: "AMD",  rate: 4.75,      from: "2026-06-01T00:00Z", to: "2026-07-14T09:12Z",   source: "Seed",     comment: "Стартовое значение (миграция)" },
  { id: "FX-1000", sell: "AMD", buy: "RUB",  rate: 0.210526,  from: "2026-06-01T00:00Z", to: "2026-07-14T09:12Z",   source: "Seed",     comment: "Стартовое значение (миграция)" },
];

function rateFmt(v, scale = 6) {
  return (+v).toLocaleString("ru-RU", { maximumFractionDigits: scale, minimumFractionDigits: scale });
}
// человекочитаемое отображение: для курсов < 1 показываем 1/обратное
function RateValue({ rate, big }) {
  const inv = rate < 1;
  const main = inv ? 1 / rate : rate;
  return (
    <span className="mono" style={{ fontVariantNumeric: "tabular-nums", fontWeight: big ? 700 : 600, fontSize: big ? 24 : undefined }}>
      {inv && <span className="muted" style={{ fontWeight: 400, fontSize: big ? 15 : "0.85em" }}>1/</span>}
      {rateFmt(main)}
    </span>
  );
}
function rateDT(s) {
  if (!s) return null;
  const d = new Date(s);
  const p = (n) => String(n).padStart(2, "0");
  return p(d.getUTCDate()) + "." + p(d.getUTCMonth() + 1) + "." + d.getUTCFullYear() + " " + p(d.getUTCHours()) + ":" + p(d.getUTCMinutes()) + " UTC";
}

function RateAddForm({ list, onAdd, onCancel }) {
  const [sell, setSell] = React.useState("USDT");
  const [buy, setBuy] = React.useState("RUB");
  const [rateStr, setRateStr] = React.useState("");
  const [from, setFrom] = React.useState(() => new Date().toISOString().slice(0, 16));
  const [comment, setComment] = React.useState("");
  const rate = parseFloat(String(rateStr).replace(",", "."));
  const decimals = (String(rateStr).replace(",", ".").split(".")[1] || "").length;
  const errors = [];
  if (sell === buy) errors.push("Валюты продажи и покупки должны различаться");
  if (rateStr !== "" && !(rate > 0)) errors.push("Курс должен быть больше нуля");
  if (decimals > 6) errors.push("Не больше 6 знаков после запятой (RateRoundToScale)");
  if (comment.length > 500) errors.push("Комментарий — не длиннее 500 символов");
  const valid = rateStr !== "" && rate > 0 && sell !== buy && decimals <= 6 && comment.length <= 500;
  const curOpts = RATE_CURRENCIES.map((c) => ({ value: c, label: c }));
  const cur = list.find((r) => r.sell === sell && r.buy === buy && !r.to);
  return (
    <div style={{ border: "1px solid var(--line-2)", borderRadius: "var(--radius)", padding: 14, background: "var(--paper-2)", margin: "12px 0" }}>
      <div className="row-2">
        <Field label="Продаём (Sell)"><Select value={sell} onChange={setSell} options={curOpts} /></Field>
        <Field label="Покупаем (Buy)"><Select value={buy} onChange={setBuy} options={curOpts} /></Field>
      </div>
      <div className="row-2">
        <Field label={"Курс — сколько " + buy + " за 1 " + sell} hint={rate > 0 && sell !== buy ? ("Обратная запись: 1 " + buy + " = " + rateFmt(1 / rate) + " " + sell) : "До 6 знаков после запятой"}>
          <TextInput value={rateStr} onChange={setRateStr} mono placeholder={sell === "RUB" ? "напр. 0,012207" : "напр. 81,30"} />
        </Field>
        <Field label="Действует с (UTC)">
          <input type="datetime-local" className="field__input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
      </div>
      <Field label={"Комментарий (" + comment.length + "/500, опционально)"}>
        <TextInput value={comment} onChange={setComment} placeholder="Например: сверено с провайдером ликвидности" />
      </Field>
      {errors.length > 0 && <Note tone="bad">{errors.join(". ")}.</Note>}
      {valid && cur && <div className="muted" style={{ fontSize: 12.5, margin: "8px 0" }}>Текущий курс {sell} → {buy} ({rateFmt(cur.rate)}) будет закрыт этим же моментом.</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <Btn variant="primary" size="sm" disabled={!valid} onClick={() => onAdd({ sell, buy, rate, from: from + "Z", comment: comment.trim() || null })}>Добавить курс</Btn>
        <Btn variant="ghost" size="sm" onClick={onCancel}>Отмена</Btn>
      </div>
    </div>
  );
}

function SectionRates() {
  const [list, setList] = React.useState(RATES_SEED);
  const [pair, setPair] = React.useState("all");
  const [src, setSrc] = React.useState("all");
  const [dFrom, setDFrom] = React.useState("");
  const [dTo, setDTo] = React.useState("");
  const [showAdd, setShowAdd] = React.useState(false);
  const current = list.filter((r) => !r.to);
  const pairs = Array.from(new Set(list.map((r) => r.sell + "→" + r.buy)));
  const pairOpts = [{ value: "all", label: "Все пары" }, ...pairs.map((p) => ({ value: p, label: p.replace("→", " → ") }))];
  const srcOpts = [{ value: "all", label: "Все источники" }, ...Object.keys(RATE_SOURCE).map((s) => ({ value: s, label: RATE_SOURCE[s].label }))];
  const visible = list
    .filter((r) => pair === "all" || r.sell + "→" + r.buy === pair)
    .filter((r) => src === "all" || r.source === src)
    .filter((r) => !dFrom || r.from >= dFrom + "T00:00:00Z")
    .filter((r) => !dTo || r.from <= dTo + "T23:59:59Z")
    .sort((a, b) => (b.from > a.from ? 1 : -1));
  const add = ({ sell, buy, rate, from, comment }) => {
    setList((ls) => {
      const closed = ls.map((r) => (r.sell === sell && r.buy === buy && !r.to) ? { ...r, to: from } : r);
      const id = "FX-" + (1000 + ls.length + 42);
      return [{ id, sell, buy, rate, from, to: null, source: "Manual", comment }, ...closed];
    });
    setShowAdd(false);
  };
  return (
    <>
      <PageHead title="Курсы обмена" sub="Курсы конвертации между валютами платформы. Новый курс закрывает предыдущий для той же пары; история сохраняется." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12, marginBottom: 20 }}>
        {current.map((r) => (
          <div key={r.id} className="section" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <strong style={{ fontSize: 13.5 }}>{r.sell} → {r.buy}</strong>
              <span style={{ marginLeft: "auto" }}><Pill tone={RATE_SOURCE[r.source].tone}>{RATE_SOURCE[r.source].label}</Pill></span>
            </div>
            <RateValue rate={r.rate} big />
            {r.rate < 1 && <div className="muted mono" style={{ fontSize: 11.5, marginTop: 2 }}>точное: {rateFmt(r.rate)}</div>}
            <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>с {rateDT(r.from)}</div>
            {r.comment && <div className="muted" style={{ fontSize: 11.5, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.comment}>{r.comment}</div>}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, rowGap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <ChipSelect value={pair} onChange={setPair} options={pairOpts} align="left" />
        <ChipSelect value={src} onChange={setSrc} options={srcOpts} align="left" />
        <span className="muted" style={{ fontSize: 12.5, marginLeft: 4 }}>с</span>
        <input type="date" className="field__input" style={{ width: 132, padding: "5px 8px", fontSize: 12.5 }} value={dFrom} onChange={(e) => setDFrom(e.target.value)} />
        <span className="muted" style={{ fontSize: 12.5 }}>по</span>
        <input type="date" className="field__input" style={{ width: 132, padding: "5px 8px", fontSize: 12.5 }} value={dTo} onChange={(e) => setDTo(e.target.value)} />
        <Btn variant={showAdd ? "ghost" : "primary"} size="sm" style={{ borderRadius: 999, padding: "6px 14px", fontSize: 13, marginLeft: "auto", whiteSpace: "nowrap" }} onClick={() => setShowAdd((v) => !v)}>{showAdd ? "Отмена" : "＋ Новый курс"}</Btn>
      </div>
      {showAdd && <RateAddForm list={list} onAdd={add} onCancel={() => setShowAdd(false)} />}
      <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>{visible.length} записей{(dFrom || dTo) ? " за выбранный период" : ""}</div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>Пара</th><th className="num">Курс</th><th>Действует с</th><th>Действует по</th><th>Источник</th><th>Комментарий</th>
          </tr></thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="is-static" style={{ opacity: r.to ? 0.6 : 1 }}>
                <td><strong>{r.sell} → {r.buy}</strong></td>
                <td className="num"><RateValue rate={r.rate} />{r.rate < 1 && <div className="muted mono" style={{ fontSize: 10.5 }}>{rateFmt(r.rate)}</div>}</td>
                <td className="mono" style={{ fontSize: 12 }}>{rateDT(r.from)}</td>
                <td>{r.to ? <span className="mono" style={{ fontSize: 12 }}>{rateDT(r.to)}</span> : <Pill tone="ok">текущий</Pill>}</td>
                <td><Pill tone={RATE_SOURCE[r.source].tone}>{RATE_SOURCE[r.source].label}</Pill></td>
                <td className="muted" style={{ fontSize: 12.5, maxWidth: 260 }}>{r.comment || "—"}</td>
              </tr>
            ))}
            {visible.length === 0 && <tr><td colSpan={6}><Empty>Нет курсов под выбранные фильтры</Empty></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

Object.assign(window, { SectionRates });
