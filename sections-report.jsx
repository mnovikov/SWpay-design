// ── Section: Сверка (отчёт по периоду: сальдо → операции → выводы → сальдо) ──
function SectionReconciliation() {
  const RATE = 92.4;
  const FEES = { trader: 7.5, merchant: 9.5, lead: 0.8, ref: 0.5 };
  const today = new Date(2026, 8, 8);
  const iso = (d) => d.toISOString().slice(0, 10);
  const startOfWeek = (d) => { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); return x; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const presets = {
    "Сегодня": () => [today, today],
    "Эта неделя": () => [startOfWeek(today), addDays(startOfWeek(today), 6)],
    "Прошлая неделя": () => [addDays(startOfWeek(today), -7), addDays(startOfWeek(today), -1)],
    "Этот месяц": () => [new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0)],
    "Прошлый месяц": () => [new Date(today.getFullYear(), today.getMonth() - 1, 1), new Date(today.getFullYear(), today.getMonth(), 0)],
  };
  const [preset, setPreset] = React.useState("Эта неделя");
  const [from, setFrom] = React.useState(iso(presets["Эта неделя"]()[0]));
  const [to, setTo] = React.useState(iso(presets["Эта неделя"]()[1]));
  const [merchant, setMerchant] = React.useState("all");
  const [trader, setTrader] = React.useState("all");
  const [provider, setProvider] = React.useState("all");
  const applyPreset = (k) => { setPreset(k); const [a, b] = presets[k](); setFrom(iso(a)); setTo(iso(b)); };

  const merchantOptions = [{ value: "all", label: "Все мерчанты" }].concat(MERCHANTS.map((m) => ({ value: m.id, label: m.name + " · " + m.id })));
  const traderOptions = [{ value: "all", label: "Все трейдеры" }].concat(TRADERS.map((t) => ({ value: t.id, label: t.name + " · " + t.id })));
  const providerOptions = [{ value: "all", label: "Все провайдеры" }].concat(PROVIDERS.map((p) => ({ value: p.id, label: p.name + " · " + p.id })));
  const periodOptions = Object.keys(presets).map((k) => ({ value: k, label: k })).concat([{ value: "custom", label: "Произвольный период" }]);

  // Модель: детерминированные цифры от периода и фильтров
  const days = Math.max(1, Math.round((new Date(to) - new Date(from)) / 864e5) + 1);
  const seed = (from + to + merchant + trader + provider).split("").reduce((s, c) => (s * 31 + c.charCodeAt(0)) % 100000, 7);
  const rnd = (i) => ((seed * (i + 3) * 9301 + 49297) % 233280) / 233280;
  const scope = merchant !== "all" ? 0.22 : trader !== "all" ? 0.12 : provider !== "all" ? 0.3 : 1;
  const payments = Math.round(1840000 * days * scope * (0.8 + rnd(1) * 0.4)) / RATE;
  const pct = (k) => payments * FEES[k] / 100;
  const ops = { traders: payments - pct("trader") - pct("lead"), merchants: payments - pct("merchant") + pct("ref"), leads: pct("lead"), refs: pct("ref") };
  ops.profit = ops.traders - ops.merchants;
  const outs = { traders: ops.traders * (0.85 + rnd(2) * 0.3), merchants: ops.merchants * (0.8 + rnd(3) * 0.3), leads: ops.leads * (0.6 + rnd(4) * 0.5), refs: ops.refs * (0.5 + rnd(5) * 0.6), profit: ops.profit * (0.4 + rnd(6) * 0.5) };
  const start = { traders: ops.traders * 0.7 * scope, merchants: ops.merchants * 0.62 * scope, leads: ops.leads * 0.9, refs: ops.refs * 0.8, profit: 42680.4 * scope - ops.profit * 0.2 };
  const end = {}; ["traders", "merchants", "leads", "refs", "profit"].forEach((k) => { end[k] = start[k] + ops[k] - outs[k]; });
  const bal = (s) => -s.traders + s.merchants + s.leads + s.refs;

  // Релевантность колонок при фильтре: нерелевантные → прочерк
  const rel = { traders: merchant === "all", merchants: trader === "all" && provider === "all", leads: merchant === "all", refs: trader === "all" && provider === "all", profit: true, balance: merchant === "all" && trader === "all" && provider === "all" };
  const cell = (k, v, opts = {}) => {
    if (!rel[k] && !opts.all) return <span style={{ color: "var(--ink-4)" }}>—</span>;
    if (k === "traders") v = -v;
    const neg = opts.neg ? v > 0 : v < 0;
    return <span className="mono" style={{ color: neg ? "var(--danger, #c62828)" : undefined, whiteSpace: "nowrap" }}>{neg ? "−" : ""}{Math.abs(v).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
  };
  const pctOf = (v) => payments > 0 ? (v / payments * 100).toFixed(2).replace(".", ",") + "%" : "—";

  const cols = [
    { k: "traders", label: "Трейдеры" },
    { k: "merchants", label: "Мерчанты" },
    { k: "leads", label: "Тимлиды" },
    { k: "refs", label: "Рефералы" },
    { k: "profit", label: "Прибыль" },
    { k: "balance", label: "Баланс", hint: "мерчанты + тимлиды + рефералы − трейдеры" },
  ];
  const Row = ({ title, sub, data, neg, showPct, strong, all }) => (
    <tr style={strong ? { background: "var(--paper)" } : undefined}>
      <td style={{ fontWeight: strong ? 700 : 500 }}>{title}{sub && <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 400 }}>{sub}</div>}</td>
      {cols.map((c) => (
        <td key={c.k} style={{ textAlign: "right", fontWeight: strong ? 700 : 400 }}>
          {c.k === "balance" ? (data.balance !== undefined ? cell("balance", data.balance) : <span style={{ color: "var(--ink-4)" }}>—</span>) : cell(c.k, data[c.k], { neg, all })}
          {showPct && c.k !== "balance" && (rel[c.k] || all) && <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{pctOf(data[c.k])}</div>}
        </td>
      ))}
    </tr>
  );

  const csv = (rows, name) => {
    const text = rows.map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(";")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + text], { type: "text/csv;charset=utf-8" })); a.download = name; a.click();
  };
  const scopeName = merchant !== "all" ? MERCHANTS.find((m) => m.id === merchant).name : trader !== "all" ? TRADERS.find((t) => t.id === trader).name : provider !== "all" ? PROVIDERS.find((p) => p.id === provider).name : "all";
  const exportOps = () => {
    const head = ["ID", "Создан", "Подтверждён", "Мерчант", "Трейдер/провайдер", "Сумма ₽", "Сумма USDT", "Курс", "Тариф трейдера %", "Комиссия трейдера", "Тариф мерчанта %", "Комиссия мерчанта", "Тариф тимлида %", "Комиссия тимлида", "Тариф реферала %", "Комиссия реферала", "Прибыль платформы"];
    const n = Math.min(400, Math.max(12, Math.round(payments * RATE / 12400)));
    const rows = [head];
    for (let i = 0; i < n; i++) {
      const rub = Math.round(3000 + rnd(i + 10) * 22000); const u = rub / RATE;
      const m = merchant !== "all" ? MERCHANTS.find((x) => x.id === merchant) : MERCHANTS[i % MERCHANTS.length];
      const t = trader !== "all" ? TRADERS.find((x) => x.id === trader) : provider !== "all" ? PROVIDERS.find((x) => x.id === provider) : TRADERS[i % TRADERS.length];
      const d = addDays(new Date(from), Math.floor(rnd(i + 20) * days)); const created = iso(d) + " " + String(8 + (i % 12)).padStart(2, "0") + ":" + String((i * 7) % 60).padStart(2, "0");
      const f = (k) => (u * FEES[k] / 100).toFixed(2);
      rows.push(["PAY-" + (700000 + seed % 1000 + i), created, created.slice(0, 11) + String(8 + (i % 12)).padStart(2, "0") + ":" + String((i * 7 + 4) % 60).padStart(2, "0"), m.name, t.name, rub, u.toFixed(2), RATE, FEES.trader, f("trader"), FEES.merchant, f("merchant"), FEES.lead, f("lead"), FEES.ref, f("ref"), (u * (FEES.merchant - FEES.trader - FEES.lead - FEES.ref) / 100).toFixed(2)]);
    }
    csv(rows, `operations_${from}_${to}_${scopeName}.csv`);
  };
  const exportOuts = () => {
    const rows = [["ID", "Дата", "Тип", "Получатель", "Сумма USDT", "Сеть", "Статус"]];
    const groups = [["traders", "Трейдер", TRADERS], ["merchants", "Мерчант", MERCHANTS], ["leads", "Тимлид", TRADERS], ["refs", "Реферал", MERCHANTS], ["profit", "Платформа", [{ name: "CrowdPay treasury" }]]];
    let i = 0;
    groups.forEach(([k, type, list]) => {
      if (!rel[k]) return;
      const n = k === "profit" ? 1 : 3 + Math.floor(rnd(i + 40) * 5); const per = outs[k] / n;
      for (let j = 0; j < n; j++, i++) rows.push(["WD-" + (30000 + seed % 500 + i), iso(addDays(new Date(from), Math.floor(rnd(i + 50) * days))), type, list[j % list.length].name, per.toFixed(2), "TRC-20", "done"]);
    });
    csv(rows, `withdrawals_${from}_${to}_${scopeName}.csv`);
  };

  const periodLabel = new Date(from).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) + " — " + new Date(to).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
  const dateInput = { border: "1px solid var(--line-2)", borderRadius: 999, padding: "5px 10px", fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--ink)", background: "#fff" };

  return (
    <>
      <PageHead title="Сверка" sub={`Сальдо и движения за период · ${periodLabel}`} actions={<div style={{ display: "flex", gap: 8 }}><Btn onClick={exportOps}>↓ Операции CSV</Btn><Btn onClick={exportOuts}>↓ Выводы CSV</Btn></div>} />

      <div className="chips" style={{ gap: 8 }}>
        <input type="date" value={from} max={to} onChange={(e) => { setFrom(e.target.value); setPreset(null); }} style={dateInput} />
        <span style={{ color: "var(--ink-3)" }}>—</span>
        <input type="date" value={to} min={from} onChange={(e) => { setTo(e.target.value); setPreset(null); }} style={dateInput} />
        <span className="chips__sep"></span>
        <ChipDropdown options={periodOptions} value={preset === null ? "custom" : preset} neutralValue="__none__" onChange={(v) => { if (v === "custom") setPreset(null); else applyPreset(v); }} />
        <span className="chips__sep"></span>
        <ChipDropdown options={merchantOptions} value={merchant} onChange={(v) => { setMerchant(v); if (v !== "all") { setTrader("all"); setProvider("all"); } }} />
        <ChipDropdown options={traderOptions} value={trader} onChange={(v) => { setTrader(v); if (v !== "all") { setMerchant("all"); setProvider("all"); } }} />
        <ChipDropdown options={providerOptions} value={provider} onChange={(v) => { setProvider(v); if (v !== "all") { setMerchant("all"); setTrader("all"); } }} />
      </div>

      <div className="section" style={{ padding: 0, overflowX: "auto" }}>
        <table className="table" style={{ width: "100%", minWidth: 720 }}>
          <thead>
            <tr>
              <th style={{ width: 170 }}>Задолженность, USDT</th>
              {cols.map((c) => <th key={c.k} style={{ textAlign: "right" }}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            <Row title="Сальдо на начало" sub={new Date(from).toLocaleDateString("ru-RU")} data={{ ...start, balance: bal(start) }} strong />
            <Row title="Операции за период" sub={"платежи " + fmtMoney(payments, "USDT")} data={ops} showPct all />
            <Row title="Выводы за период" data={outs} neg />
            <Row title="Сальдо на конец" sub={new Date(to).toLocaleDateString("ru-RU")} data={{ ...end, balance: bal(end) }} strong />
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8 }}><b>Баланс</b> = мерчанты + тимлиды + рефералы − трейдеры (трейдеры со знаком «−»: должны платформе). Ставки: трейдеры {FEES.trader}% · мерчанты {FEES.merchant}% · тимлиды {FEES.lead}% · рефералы {FEES.ref}%. Прочерк — показатель не относится к выбранному контрагенту.</div>
    </>
  );
}
Object.assign(window, { SectionReconciliation });
