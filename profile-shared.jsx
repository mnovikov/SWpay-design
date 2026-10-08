// ── Общий профиль: футер-меню, безопасность (пароль + сессии), экран профиля ──
// Используется всеми приложениями (Admin, Merchant, Trader, Lead); зависит от primitives.jsx.

const PROFILE_SESSIONS_SEED = [
  { id: 1, device: "Chrome 126 · macOS", ip: "95.165.10.42", loc: "Москва, RU", started: "20.07.2026 08:12", last: "сейчас", current: true },
  { id: 2, device: "Safari · iPhone 15", ip: "176.59.44.108", loc: "Москва, RU", started: "19.07.2026 21:40", last: "12 мин назад" },
  { id: 3, device: "Chrome 125 · Windows", ip: "185.77.216.14", loc: "Ереван, AM", started: "15.07.2026 10:03", last: "3 дн назад" },
];

function ProfilePasswordForm() {
  const [cur, setCur] = React.useState("");
  const [nw, setNw] = React.useState("");
  const [rep, setRep] = React.useState("");
  const [done, setDone] = React.useState(false);
  const errors = [];
  if (nw && nw.length < 10) errors.push("Новый пароль — минимум 10 символов");
  if (nw && cur && nw === cur) errors.push("Новый пароль совпадает с текущим");
  if (nw && rep && nw !== rep) errors.push("Пароли не совпадают");
  const valid = cur && nw.length >= 10 && nw === rep && nw !== cur;
  const save = () => { setDone(true); setCur(""); setNw(""); setRep(""); };
  return (
    <>
      <div style={{ maxWidth: 420 }}>
        <Field label="Текущий пароль"><TextInput value={cur} onChange={(v) => { setCur(v); setDone(false); }} mono placeholder="••••••••" /></Field>
        <Field label="Новый пароль" hint="Минимум 10 символов"><TextInput value={nw} onChange={(v) => { setNw(v); setDone(false); }} mono /></Field>
        <Field label="Новый пароль ещё раз"><TextInput value={rep} onChange={(v) => { setRep(v); setDone(false); }} mono /></Field>
      </div>
      {errors.length > 0 && <Note tone="warn">{errors.join(". ")}.</Note>}
      {done && <Note tone="ok">Пароль изменён. Все остальные сессии будут разлогинены при следующем запросе.</Note>}
      <div style={{ marginTop: 10 }}>
        <Btn variant="primary" size="sm" disabled={!valid} onClick={save}>Сменить пароль</Btn>
      </div>
    </>
  );
}

function ProfileSessions() {
  const [sessions, setSessions] = React.useState(PROFILE_SESSIONS_SEED);
  const [killed, setKilled] = React.useState(false);
  const others = sessions.filter((s) => !s.current);
  const killAll = () => { setSessions((ss) => ss.filter((s) => s.current)); setKilled(true); };
  const kill = (id) => setSessions((ss) => ss.filter((s) => s.id !== id));
  return (
    <>
      {killed && others.length === 0 && <Note tone="ok">Все остальные сессии завершены — активна только текущая.</Note>}
      <div className="table-wrap" style={{ marginTop: killed ? 10 : 0 }}>
        <table className="table table--inset">
          <thead><tr><th>Устройство</th><th>IP</th><th>Локация</th><th>Начало</th><th>Активность</th><th></th></tr></thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="is-static">
                <td><strong>{s.device}</strong></td>
                <td className="mono" style={{ fontSize: 12 }}>{s.ip}</td>
                <td>{s.loc}</td>
                <td className="mono" style={{ fontSize: 12 }}>{s.started}</td>
                <td className="mono" style={{ fontSize: 12 }}>{s.last}</td>
                <td style={{ textAlign: "right" }}>
                  {s.current
                    ? <Pill tone="ok">Текущая</Pill>
                    : <Btn size="sm" variant="ghost" onClick={() => kill(s.id)}>Завершить</Btn>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {others.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <Btn variant="danger" size="sm" onClick={killAll}>Завершить все сессии, кроме текущей</Btn>
        </div>
      )}
    </>
  );
}

function ProfileSecurity() {
  return (
    <>
      <Section title="Смена пароля"><ProfilePasswordForm /></Section>
      <Section title="Активные сессии"><ProfileSessions /></Section>
    </>
  );
}

// ── Экран «Мой профиль» для Admin/Merchant (тип юзера + роли + безопасность) ──
function AccountProfile({ user }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div className="sidebar__avatar" style={{ width: 46, height: 46, fontSize: 16, ...(user.avatarStyle || {}) }}>{user.initials}</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{user.name}</div>
          <div className="muted mono" style={{ fontSize: 12 }}>{user.login}</div>
        </div>
        <span style={{ marginLeft: 8 }}><Pill tone="info">{user.type}</Pill></span>
      </div>
      <Section title="Аккаунт">
        <KV items={[
          ["Логин", <span className="mono">{user.login}</span>],
          ["ID", <span className="mono">{user.id}</span>],
          ["Тип пользователя", <Pill tone="info">{user.type}</Pill>],
          ["Роли", user.roles && user.roles.length
            ? <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>{user.roles.map((r) => <Pill key={r} tone="neutral">{r}</Pill>)}</span>
            : "—"],
          ["Организация", user.org],
          ["Создан", <span className="mono">{user.created}</span>],
          ["Последний вход", <span className="mono">{user.lastLogin}</span>],
        ]} />
      </Section>
      <ProfileSecurity />
    </>
  );
}

// ── Всплывающее меню в левом нижнем углу сайдбара ────────────────────────────
function ProfileFooterMenu({ initials, name, sub, avatarStyle, onProfile, children }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const item = { display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: "none", border: "none", padding: "9px 12px", borderRadius: 8, fontSize: 13.5, color: "var(--ink)", cursor: "pointer", fontFamily: "inherit" };
  return (
    <div ref={ref} className="sidebar__footer" style={{ position: "relative", cursor: "pointer", userSelect: "none" }} onClick={() => setOpen((v) => !v)}>
      <div className="sidebar__avatar" style={avatarStyle}>{initials}</div>
      <div style={{ lineHeight: 1.2, minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
        <div className="mono" style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>{sub}</div>
      </div>
      {children && <span onClick={(e) => e.stopPropagation()}>{children}</span>}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}><polyline points="18 15 12 9 6 15"/></svg>
      {open && (
        <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0, background: "var(--paper, #fff)", border: "1px solid var(--line-2, var(--line))", borderRadius: 12, boxShadow: "var(--shadow-md, 0 8px 24px rgba(0,0,0,0.14))", padding: 6, zIndex: 60 }}>
          <button style={item} onClick={(e) => { e.stopPropagation(); setOpen(false); onProfile && onProfile(); }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--paper-2)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
            Мой профиль
          </button>
          <button style={{ ...item, color: "var(--bad, #c0392b)" }} title="Демо — выход отключён" onClick={(e) => e.stopPropagation()}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--paper-2)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ProfileFooterMenu, ProfileSecurity, ProfileSessions, ProfilePasswordForm, AccountProfile });
