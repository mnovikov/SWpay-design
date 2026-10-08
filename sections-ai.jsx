// ── Системные / ИИ — ИИ-сессии (ChatGPT-подобный ассистент с доступом к БД) ──

// мини-рендер markdown: заголовки, **bold**, `code`, списки, таблицы, абзацы
function aiMd(src) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
  const lines = src.split("\n");
  let html = "", i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) { rows.push(lines[i]); i++; }
      const cells = (r) => r.split("|").slice(1, -1).map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(rows[1] && /^[\s|:-]+$/.test(rows[1]) ? 2 : 1);
      html += "<table><thead><tr>" + head.map((c) => "<th>" + inline(c) + "</th>").join("") + "</tr></thead><tbody>"
        + body.map((r) => "<tr>" + cells(r).map((c) => "<td>" + inline(c) + "</td>").join("") + "</tr>").join("") + "</tbody></table>";
      continue;
    }
    if (/^### /.test(l)) { html += "<h4>" + inline(l.slice(4)) + "</h4>"; i++; continue; }
    if (/^## /.test(l)) { html += "<h3>" + inline(l.slice(3)) + "</h3>"; i++; continue; }
    if (/^[-*] /.test(l)) {
      let items = "";
      while (i < lines.length && /^[-*] /.test(lines[i])) { items += "<li>" + inline(lines[i].slice(2)) + "</li>"; i++; }
      html += "<ul>" + items + "</ul>"; continue;
    }
    if (/^\d+\. /.test(l)) {
      let items = "";
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items += "<li>" + inline(lines[i].replace(/^\d+\. /, "")) + "</li>"; i++; }
      html += "<ol>" + items + "</ol>"; continue;
    }
    if (l.trim() === "") { i++; continue; }
    let p = l; i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^([#|]|[-*] |\d+\. )/.test(lines[i])) { p += " " + lines[i]; i++; }
    html += "<p>" + inline(p) + "</p>";
  }
  return html;
}

// простая картинка-ответ: bar chart по данным (демо «ИИ вернул график»)
function AiChart({ title, data }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div className="ai-chart">
      <div className="ai-chart__title">{title}</div>
      <div className="ai-chart__bars">
        {data.map((d) => (
          <div key={d.label} className="ai-chart__col" title={d.label + ": " + d.v}>
            <div className="ai-chart__bar" style={{ height: Math.max(4, Math.round((d.v / max) * 72)) + "px" }}></div>
            <div className="ai-chart__label">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const AI_SESSIONS_SEED = [
  {
    id: "AI-508", title: "Комиссия мерчанта по платежу PAY-84112", visibility: "private",
    updated: "22.07.2026 09:41", author: "a.smirnov",
    msgs: [
      { role: "user", ts: "09:38", text: "Почему по платежу PAY-84112 комиссия мерчанта получилась 312,50 ₽? Мерчант ожидал ~250 ₽." },
      { role: "ai", ts: "09:38", md: `Разобрал платёж **PAY-84112** (LuckyWheel, 12 500 ₽, Карта RU, 21.07 18:42 UTC).

Комиссия считалась не по базовому тарифу, а по **VIP-надбавке**:

| Компонент | Ставка | Сумма |
| --- | --- | --- |
| Базовый тариф pay-in (Карта RU) | 2,0% | 250,00 ₽ |
| Надбавка VIP-маршрут (клиент привязан к трейдеру) | 0,5% | 62,50 ₽ |
| **Итого** | **2,5%** | **312,50 ₽** |

Клиент \`Customer #10052\` привязан к трейдеру TR-1042 как VIP (связка VIP-3001, активна с 14.07). По тарифу LuckyWheel VIP-платежи идут со ставкой 2,5%.` },
      { role: "user", ts: "09:40", text: "А если бы VIP-связка была выключена?" },
      { role: "ai", ts: "09:40", md: `Тогда платёж пошёл бы обычным каскадом и применилась бы базовая ставка **2,0% = 250,00 ₽**.

Но обратите внимание: конверсия VIP-маршрута у этого клиента — 98% против 91% по обычному каскаду. Надбавка 62,50 ₽ покупает ~7 п.п. вероятности успеха.` },
    ],
  },
  {
    id: "AI-507", title: "Падение конверсии Sberbank C2C 19–20 июля", visibility: "public",
    updated: "20.07.2026 16:20", author: "m.volkova",
    msgs: [
      { role: "user", ts: "16:12", text: "Конверсия pay-in по Сберу просела в выходные. Что случилось?" },
      { role: "ai", ts: "16:13", md: `Смотрю успешность платежей Sberbank C2C за неделю:`, chart: { title: "Конверсия Sberbank C2C, %", data: [{ label: "15", v: 93 }, { label: "16", v: 92 }, { label: "17", v: 94 }, { label: "18", v: 91 }, { label: "19", v: 78 }, { label: "20", v: 81 }, { label: "21", v: 92 }] },
        md2: `Провал 19–20 июля объясняется двумя факторами:

1. Терминал **SM-A546E** (TR-1042) ушёл offline в 19:10 19.07 — 41 платёж истёк без подтверждения.
2. У двух реквизитов Сбера исчерпался дневной лимит к 15:00, каскад переключал платежи на менее конверсионные банки.

С 21.07 терминал снова online, конверсия вернулась к 92%.` },
    ],
  },
  {
    id: "AI-506", title: "Сверка баланса TR-1017 после спора DSP-2214", visibility: "private",
    updated: "18.07.2026 11:05", author: "a.smirnov",
    msgs: [
      { role: "user", ts: "11:02", text: "После решения спора DSP-2214 в пользу мерчанта баланс трейдера TR-1017 изменился дважды. Это ошибка?" },
      { role: "ai", ts: "11:04", md: `Нет, всё корректно. По спору **DSP-2214** прошло две проводки:

- \`11:00:14\` — списание тела платежа 8 200 ₽ (возврат мерчанту);
- \`11:00:14\` — сторно комиссии трейдера 164 ₽ (комиссия не положена по отменённому платежу).

Итоговое изменение баланса: **−8 364 ₽**, одна операция в истории баланса развёрнута на две строки по типам.` },
    ],
  },
];

const AI_SUGGESTS = [
  "Почему по платежу PAY-84205 комиссия мерчанта 2,5%, а не 2%?",
  "Какие трейдеры теряли платежи из-за лимитов на этой неделе?",
  "Сколько заработал оператор на выплатах МТС Kassa за июль?",
];

// демо-«мозг»: подбирает ответ по ключевым словам
function aiDemoAnswer(q) {
  const s = q.toLowerCase();
  if (s.includes("комисс")) return { md: `Разбираю. По этому платежу применён тариф pay-in **2,5%** вместо базовых 2,0% — платёж прошёл по VIP-маршруту (клиент привязан к трейдеру).

| Компонент | Ставка |
| --- | --- |
| Базовый тариф | 2,0% |
| Надбавка VIP | +0,5% |

Если нужно, покажу полную историю тарифов этого мерчанта.` };
  if (s.includes("лимит")) return { md: `За последние 7 дней из-за исчерпанных лимитов каскад пропускал реквизиты у **3 трейдеров**:

- **TR-1042** — дневной лимит Сбер C2C, 19–20.07, ~38 платежей ушло дальше по каскаду;
- **TR-1017** — лимит операций СБП, 18.07;
- **TR-1101** — max-сумма реквизита ниже среднего чека мерчанта BetWin.

Рекомендация: поднять дневной лимит Сбер-реквизитов TR-1042 — он теряет ~12% потенциального объёма.` };
  if (s.includes("заработал") || s.includes("профит") || s.includes("доход")) return {
    md: `Профит оператора по выплатам **МТС Kassa** за июль (по 21.07):`,
    chart: { title: "Профит по неделям, тыс ₽", data: [{ label: "W27", v: 84 }, { label: "W28", v: 91 }, { label: "W29", v: 77 }, { label: "W30", v: 96 }] },
    md2: `Итого **348 000 ₽**: комиссия мерчанта 1,4% минус вознаграждение трейдеров 0,9% при объёме 69,6 млн ₽.` };
  return { md: `Принял. Чтобы ответить точно, мне нужны идентификаторы: платёж (\`PAY-…\`), мерчант (\`M-…\`) или трейдер (\`TR-…\`).

Я имею доступ к платежам, спорам, тарифам, балансам и настройкам каскада — сформулируйте вопрос про конкретную сущность, и я разберу её историю.` };
}

function AiMsg({ m }) {
  return (
    <div className={"ai-msg ai-msg--" + m.role}>
      {m.role === "ai" && <div className="ai-msg__avatar">ИИ</div>}
      <div className="ai-msg__body">
        {m.role === "user"
          ? <div className="ai-msg__bubble">{m.text}</div>
          : (
            <div className="ai-msg__md">
              {m.md && <div dangerouslySetInnerHTML={{ __html: aiMd(m.md) }}></div>}
              {m.chart && <AiChart title={m.chart.title} data={m.chart.data} />}
              {m.md2 && <div dangerouslySetInnerHTML={{ __html: aiMd(m.md2) }}></div>}
            </div>
          )}
        <div className="ai-msg__ts">{m.ts}</div>
      </div>
    </div>
  );
}

function SectionAI() {
  const [sessions, setSessions] = React.useState(AI_SESSIONS_SEED);
  const [activeId, setActiveId] = React.useState(AI_SESSIONS_SEED[0].id);
  const [draft, setDraft] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const scrollRef = React.useRef(null);
  const session = sessions.find((s) => s.id === activeId);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeId, session && session.msgs.length, thinking]);

  const nowTs = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };

  const newSession = () => {
    const id = "AI-" + (509 + sessions.length);
    const s = { id, title: "Новая сессия", visibility: "private", updated: "сейчас", author: "a.smirnov", msgs: [] };
    setSessions((ss) => [s, ...ss]);
    setActiveId(id);
    setDraft("");
  };

  const send = (text) => {
    const q = (text != null ? text : draft).trim();
    if (!q || thinking || !session) return;
    setDraft("");
    setSessions((ss) => ss.map((s) => s.id === activeId ? {
      ...s,
      title: s.msgs.length === 0 ? (q.length > 60 ? q.slice(0, 57) + "…" : q) : s.title,
      updated: "сейчас",
      msgs: [...s.msgs, { role: "user", ts: nowTs(), text: q }],
    } : s));
    setThinking(true);
    setTimeout(() => {
      const a = aiDemoAnswer(q);
      setSessions((ss) => ss.map((s) => s.id === activeId ? { ...s, msgs: [...s.msgs, { role: "ai", ts: nowTs(), ...a }] } : s));
      setThinking(false);
    }, 1400 + Math.random() * 900);
  };

  const toggleVis = () => setSessions((ss) => ss.map((s) => s.id === activeId ? { ...s, visibility: s.visibility === "private" ? "public" : "private" } : s));

  return (
    <>
      <PageHead title="ИИ" sub="ИИ-ассистент с доступом к БД и доменной модели: платежи, тарифы, споры, балансы, каскад" />
      <div className="ai-layout">
        <div className="ai-list">
          <Btn variant="primary" size="sm" style={{ width: "100%", marginBottom: 10 }} onClick={newSession}>＋ Новая сессия</Btn>
          {sessions.map((s) => (
            <div key={s.id} className={"ai-list__item" + (s.id === activeId ? " is-active" : "")} onClick={() => setActiveId(s.id)}>
              <div className="ai-list__title">{s.title}</div>
              <div className="ai-list__meta">
                <span className="mono">{s.updated}</span>
                {s.visibility === "public" && <Pill tone="info">public</Pill>}
              </div>
            </div>
          ))}
        </div>
        <div className="ai-chat">
          {session && (
            <div className="ai-chat__head">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.title}</div>
                <div className="muted mono" style={{ fontSize: 11 }}>{session.id} · {session.author}</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <Pill tone={session.visibility === "public" ? "info" : "neutral"}>{session.visibility}</Pill>
                <Btn size="sm" variant="ghost" onClick={toggleVis}>{session.visibility === "private" ? "Сделать public" : "Сделать private"}</Btn>
              </div>
            </div>
          )}
          <div className="ai-chat__scroll" ref={scrollRef}>
            {session && session.msgs.length === 0 && (
              <div className="ai-empty">
                <div className="ai-empty__title">Чем помочь?</div>
                <div className="ai-empty__sub">Я вижу платежи, споры, тарифы, балансы и настройки каскада. Спросите «почему» про любую цифру.</div>
                <div className="ai-empty__suggests">
                  {AI_SUGGESTS.map((q) => (
                    <button key={q} className="ai-suggest" onClick={() => send(q)}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            {session && session.msgs.map((m, i) => <AiMsg key={i} m={m} />)}
            {thinking && (
              <div className="ai-msg ai-msg--ai">
                <div className="ai-msg__avatar">ИИ</div>
                <div className="ai-msg__body"><div className="ai-msg__md ai-thinking"><span></span><span></span><span></span></div></div>
              </div>
            )}
          </div>
          <div className="ai-chat__input">
            <textarea className="field__input" rows={1} placeholder="Спросите про платёж, комиссию, спор, баланс…" value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}></textarea>
            <Btn variant="primary" disabled={!draft.trim() || thinking} onClick={() => send()}>Отправить</Btn>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { SectionAI });
