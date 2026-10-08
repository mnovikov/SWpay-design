// ── Permissions: action catalog, roles, pattern matching ────────────────────

const ACTION_GROUPS = [
  { label: "Оператор · Мерчанты", items: [
    ["cp.operator.merchant.read", "Просмотр мерчантов"],
    ["cp.operator.merchant.create", "Создание мерчанта"],
    ["cp.operator.merchant.edit", "Редактирование мерчанта"],
    ["cp.operator.merchant.block", "Блокировка мерчанта"],
    ["cp.operator.merchant-tariff.read", "Просмотр тарифов мерчанта"],
    ["cp.operator.merchant-tariff.edit", "Изменение тарифов мерчанта"],
    ["cp.operator.merchant-user.read", "Просмотр пользователей мерчанта"],
    ["cp.operator.merchant-user.edit", "Управление пользователями мерчанта"],
  ]},
  { label: "Оператор · Трейдеры и инфраструктура", items: [
    ["cp.operator.trader.read", "Просмотр трейдеров"],
    ["cp.operator.trader.edit", "Редактирование трейдера"],
    ["cp.operator.trader.suspend", "Приостановка трейдера"],
    ["cp.operator.terminal.read", "Просмотр терминалов"],
    ["cp.operator.terminal.reboot", "Перезапуск терминала"],
    ["cp.operator.payment-details.read", "Просмотр реквизитов"],
    ["cp.operator.payment-details.edit", "Редактирование реквизитов"],
    ["cp.operator.payment-details.block", "Блокировка реквизита"],
    ["cp.operator.vip.read", "Просмотр VIP-клиентов"],
    ["cp.operator.vip.edit", "Управление VIP-клиентами"],
  ]},
  { label: "Оператор · Платежи и споры", items: [
    ["cp.operator.payin.read", "Просмотр PayIn"],
    ["cp.operator.payin.requeue", "Повторная постановка PayIn"],
    ["cp.operator.payout.read", "Просмотр PayOut"],
    ["cp.operator.payout.approve", "Подтверждение PayOut"],
    ["cp.operator.dispute.read", "Просмотр споров"],
    ["cp.operator.dispute.resolve", "Решение споров"],
    ["cp.operator.support.read", "Просмотр тикетов поддержки"],
    ["cp.operator.support.reply", "Ответы в тикетах"],
  ]},
  { label: "Оператор · Деньги", items: [
    ["cp.operator.deposit.read", "Просмотр депозитов"],
    ["cp.operator.deposit.confirm", "Подтверждение депозита"],
    ["cp.operator.withdrawal.read", "Просмотр заявок на вывод"],
    ["cp.operator.withdrawal.approve", "Подтверждение вывода"],
    ["cp.operator.withdrawal.reject", "Отклонение вывода"],
    ["cp.operator.ledger.read", "Просмотр финансов"],
  ]},
  { label: "Оператор · Система", items: [
    ["cp.operator.operator.read", "Просмотр операторов"],
    ["cp.operator.operator.invite", "Приглашение оператора"],
    ["cp.operator.operator.edit", "Редактирование оператора"],
    ["cp.operator.role.read", "Просмотр ролей"],
    ["cp.operator.role.edit", "Редактирование ролей"],
    ["cp.operator.audit.read", "Просмотр Audit log"],
  ]},
  { label: "Мерчант · Платежи", items: [
    ["cp.merchant.payin.read", "Просмотр PayIn"],
    ["cp.merchant.payin.refund", "Возврат PayIn"],
    ["cp.merchant.payout.read", "Просмотр PayOut"],
    ["cp.merchant.payout.create", "Создание PayOut"],
    ["cp.merchant.dispute.read", "Просмотр споров"],
    ["cp.merchant.dispute.comment", "Комментарии в спорах"],
    ["cp.merchant.dispute.resolve", "Решение споров"],
    ["cp.merchant.balance.read", "Просмотр баланса"],
    ["cp.merchant.report.read", "Просмотр отчётов"],
    ["cp.merchant.report.export", "Экспорт отчётов"],
  ]},
  { label: "Мерчант · Деньги и интеграции", items: [
    ["cp.merchant.withdrawal.read", "Просмотр заявок на вывод"],
    ["cp.merchant.withdrawal.create", "Создание заявки на вывод"],
    ["cp.merchant.withdrawal.cancel", "Отмена заявки на вывод"],
    ["cp.merchant.api-key.read", "Просмотр API-ключей"],
    ["cp.merchant.api-key.create", "Выпуск API-ключа"],
    ["cp.merchant.api-key.revoke", "Отзыв API-ключа"],
    ["cp.merchant.webhook.read", "Просмотр webhooks"],
    ["cp.merchant.webhook.edit", "Настройка webhooks"],
    ["cp.merchant.user.read", "Просмотр пользователей"],
    ["cp.merchant.user.invite", "Приглашение пользователя"],
    ["cp.merchant.user.edit", "Управление пользователями"],
  ]},
];
const ALL_ACTIONS = ACTION_GROUPS.flatMap((g) => g.items.map(([code, desc]) => ({ code, desc, group: g.label })));

// * — один сегмент, ** — один и более сегментов
function permPatternToRegex(p) {
  const body = p.trim().split(".").map((seg) =>
    seg === "**" ? "\u0000" : seg === "*" ? "[^.]+" : seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  ).join("\\.");
  return new RegExp("^" + body.replace(/\u0000/g, ".+") + "$");
}
function permMatches(pattern, code) {
  try { return permPatternToRegex(pattern).test(code); } catch (e) { return false; }
}
// Deny всегда сильнее allow
function permAllowed(rules, code) {
  if (rules.some((r) => r.effect === "deny" && permMatches(r.pattern, code))) return false;
  return rules.some((r) => r.effect === "allow" && permMatches(r.pattern, code));
}

const PERM_ROLES_SEED = [
  { id: "operator-admin", label: "operator-admin", title: "Администратор оператора", scope: "operator", builtin: true,
    desc: "Полный доступ ко всем действиям админки. Встроенная роль — не редактируется.",
    rules: [{ effect: "allow", pattern: "cp.operator.**" }] },
  { id: "merchant-admin", label: "merchant-admin", title: "Администратор мерчанта", scope: "merchant", builtin: true,
    desc: "Полный доступ к кабинету мерчанта. Встроенная роль — не редактируется.",
    rules: [{ effect: "allow", pattern: "cp.merchant.**" }] },
  { id: "operator-support", label: "operator-support", title: "Поддержка оператора", scope: "operator", builtin: false,
    desc: "Читает всё, работает со спорами и тикетами. Не работает с выводами средств.",
    rules: [
      { effect: "allow", pattern: "cp.operator.**.read" },
      { effect: "allow", pattern: "cp.operator.dispute.**" },
      { effect: "allow", pattern: "cp.operator.support.**" },
      { effect: "deny",  pattern: "cp.operator.withdrawal.**" },
    ] },
  { id: "merchant-specialist", label: "merchant-specialist", title: "Специалист мерчанта", scope: "merchant", builtin: false,
    desc: "Работает со спорами, платежами и выплатами; читает почти всё. Не управляет ключами, webhooks и не создаёт заявки на вывод.",
    rules: [
      { effect: "allow", pattern: "cp.merchant.**.read" },
      { effect: "allow", pattern: "cp.merchant.dispute.**" },
      { effect: "allow", pattern: "cp.merchant.payin.**" },
      { effect: "allow", pattern: "cp.merchant.payout.**" },
      { effect: "deny",  pattern: "cp.merchant.api-key.**" },
      { effect: "deny",  pattern: "cp.merchant.webhook.**" },
      { effect: "deny",  pattern: "cp.merchant.withdrawal.create" },
    ] },
];

function permRoleById(id) { return PERM_ROLES_SEED.find((r) => r.id === id); }

// Роли оператора по легаси-полю role
function operatorRoleIds(o) { return o.roles || (o.role === "admin" ? ["operator-admin"] : ["operator-support"]); }

// Пользователи мерчантов с ролями (демо-справочник для счётчиков в «Правах»)
const MERCHANT_ROLE_USERS = {
  "merchant-admin": [
    { name: "Николай Ветров", sub: "BetCity · owner@betcity.io" },
    { name: "Павел Орлов", sub: "BetCity · ops2@betcity.io" },
  ],
  "merchant-specialist": [
    { name: "Ирина Соколова", sub: "BetCity · finance@betcity.io" },
    { name: "Финансовый отдел", sub: "LuckyWheel · finance@luckywheel.bet" },
  ],
};

function RoleBadges({ roles, size }) {
  if (!roles || roles.length === 0) return <span className="muted">—</span>;
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 4 }}>
      {roles.map((id) => {
        const r = permRoleById(id);
        return <span key={id} className="mono" style={{ fontSize: size === "sm" ? 10.5 : 11.5, padding: "1px 7px", borderRadius: 999, background: r && r.builtin ? "var(--accent-soft, #fdf3d0)" : "var(--paper-2)", border: "1px solid var(--line-2)", color: "var(--ink-2)", whiteSpace: "nowrap" }}>{r ? r.label : id}</span>;
      })}
    </span>
  );
}

function RolesPicker({ value = [], onChange, scope, disabled }) {
  const roles = PERM_ROLES_SEED.filter((r) => !scope || r.scope === scope);
  const toggle = (id) => { if (disabled) return; onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]); };
  return (
    <div className="chips" style={{ padding: 0, opacity: disabled ? 0.6 : 1 }}>
      {roles.map((r) => (
        <span key={r.id} className={"chip" + (value.includes(r.id) ? " chip--active" : "")} style={{ cursor: disabled ? "default" : "pointer" }} title={r.title + " — " + r.desc} onClick={() => toggle(r.id)}>
          {r.label}{r.builtin ? " ·" : ""}{r.builtin && <span style={{ fontSize: 10, marginLeft: 2 }}>встр.</span>}
        </span>
      ))}
    </div>
  );
}

// ── Section: Права ──────────────────────────────────────────────────────────
function SectionPermissions() {
  const [roles, setRoles] = React.useState(() => PERM_ROLES_SEED.map((r) => ({ ...r, rules: r.rules.map((x) => ({ ...x })) })));
  const [openId, setOpenId] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const open = openId ? roles.find((r) => r.id === openId) : null;

  const usersOf = (rid) => {
    const ops = ADMIN_OPERATORS.filter((o) => operatorRoleIds(o).includes(rid)).map((o) => ({ name: o.name, sub: "Оператор · " + o.login }));
    return [...ops, ...(MERCHANT_ROLE_USERS[rid] || [])];
  };

  const updateRole = (rid, fn) => setRoles((list) => list.map((r) => r.id === rid ? fn(r) : r));

  return (
    <>
      <PageHead
        title="Права"
        sub="Роли и состав их разрешений. Разрешения — паттерны действий (allow / deny), deny всегда сильнее allow."
        actions={<Btn variant="accent" onClick={() => setShowAdd(true)}>＋ Новая роль</Btn>}
      />
      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>Роль</th><th>Тип</th><th>Область</th><th>Правил</th><th>Разрешено actions</th><th>Пользователей</th>
          </tr></thead>
          <tbody>
            {roles.map((r) => {
              const scopeActions = ALL_ACTIONS.filter((a) => a.code.startsWith("cp." + r.scope + "."));
              const allowed = scopeActions.filter((a) => permAllowed(r.rules, a.code)).length;
              const users = usersOf(r.id);
              return (
                <tr key={r.id} onClick={() => setOpenId(r.id)} className={openId === r.id ? "is-selected" : ""} style={{ cursor: "pointer" }}>
                  <td>
                    <div className="cell-stack">
                      <strong className="mono">{r.label}</strong>
                      <span className="muted" style={{ fontSize: 11.5 }}>{r.title}</span>
                    </div>
                  </td>
                  <td>{r.builtin ? <Pill tone="info">встроенная</Pill> : <Pill tone="neutral">кастомная</Pill>}</td>
                  <td><span className="badge-type">{r.scope}</span></td>
                  <td className="num mono">{r.rules.length}</td>
                  <td className="num mono">{allowed} / {scopeActions.length}</td>
                  <td className="num mono">{users.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <RoleDrawer
          role={open}
          users={usersOf(open.id)}
          onClose={() => setOpenId(null)}
          onChange={(fn) => updateRole(open.id, fn)}
        />
      )}
      {showAdd && (
        <RoleDrawer
          isNew
          role={{ id: "new", label: "", title: "", scope: "merchant", builtin: false, desc: "", rules: [{ effect: "allow", pattern: "cp.merchant.**.read" }] }}
          users={[]}
          onClose={() => setShowAdd(false)}
          onCreate={(r) => { setRoles((list) => [...list, r]); setShowAdd(false); }}
        />
      )}
    </>
  );
}

function RoleDrawer({ role, users, onClose, onChange, onCreate, isNew }) {
  const [draft, setDraft] = React.useState(() => ({ ...role, rules: role.rules.map((x) => ({ ...x })) }));
  const [q, setQ] = React.useState("");
  const readOnly = role.builtin;

  const setRule = (i, patch) => setDraft((d) => ({ ...d, rules: d.rules.map((r, j) => j === i ? { ...r, ...patch } : r) }));
  const addRule = () => setDraft((d) => ({ ...d, rules: [...d.rules, { effect: "allow", pattern: "cp." + d.scope + "." }] }));
  const delRule = (i) => setDraft((d) => ({ ...d, rules: d.rules.filter((_, j) => j !== i) }));

  const scopeActions = ALL_ACTIONS.filter((a) => a.code.startsWith("cp." + draft.scope + "."));
  const visibleActions = q.trim() ? scopeActions.filter((a) => (a.code + " " + a.desc).toLowerCase().includes(q.trim().toLowerCase())) : scopeActions;
  const allowedCount = scopeActions.filter((a) => permAllowed(draft.rules, a.code)).length;
  const groups = [...new Set(visibleActions.map((a) => a.group))];

  const save = () => {
    if (isNew) {
      const id = (draft.label.trim() || "custom-role").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
      onCreate({ ...draft, id, label: draft.label.trim() || id });
    } else {
      onChange(() => draft);
      onClose();
    }
  };

  return (
    <Drawer
      title={isNew ? "Новая роль" : role.label}
      id={isNew ? undefined : role.id}
      wide
      onClose={onClose}
      footer={
        <>
          {readOnly
            ? <span className="muted" style={{ fontSize: 12.5 }}>Встроенная роль — только просмотр</span>
            : <Btn variant="ghost" onClick={onClose}>Отмена</Btn>}
          <div className="spacer" style={{ flex: 1 }} />
          <Btn variant="ghost" onClick={onClose}>Закрыть</Btn>
          {!readOnly && <Btn variant="primary" onClick={save}>{isNew ? "Создать роль" : "Сохранить"}</Btn>}
        </>
      }
    >
      <Section title="Роль">
        <div className="row-2">
          <Field label="Код роли"><TextInput mono value={draft.label} onChange={(v) => !readOnly && setDraft((d) => ({ ...d, label: v }))} placeholder="merchant-specialist" /></Field>
          <Field label="Название"><TextInput value={draft.title} onChange={(v) => !readOnly && setDraft((d) => ({ ...d, title: v }))} placeholder="Специалист мерчанта" /></Field>
        </div>
        <div className="row-2">
          <Field label="Область">
            {isNew
              ? <Select value={draft.scope} onChange={(v) => setDraft((d) => ({ ...d, scope: v }))} options={[{ value: "merchant", label: "merchant" }, { value: "operator", label: "operator" }]} />
              : <span className="badge-type">{draft.scope}</span>}
          </Field>
          <Field label="Тип">{role.builtin ? <Pill tone="info">встроенная</Pill> : <Pill tone="neutral">кастомная</Pill>}</Field>
        </div>
        {draft.desc && <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{draft.desc}</div>}
      </Section>

      <Section
        title={`Правила (${draft.rules.length})`}
        action={!readOnly && <Btn variant="ghost" size="sm" onClick={addRule}>＋ Правило</Btn>}
      >
        <Note tone="neutral">
          Паттерн действия: <span className="mono">*</span> — один сегмент, <span className="mono">**</span> — несколько. <strong>Deny всегда сильнее allow.</strong>
        </Note>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {draft.rules.map((r, i) => {
            const matched = scopeActions.filter((a) => permMatches(r.pattern, a.code)).length;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => !readOnly && setRule(i, { effect: r.effect === "allow" ? "deny" : "allow" })}
                  className="mono"
                  style={{ width: 64, flexShrink: 0, padding: "5px 0", borderRadius: 8, border: "1px solid", cursor: readOnly ? "default" : "pointer", fontSize: 11.5, fontWeight: 700,
                    borderColor: r.effect === "allow" ? "#bfd8bd" : "#e4b8b4",
                    background: r.effect === "allow" ? "#eef6ec" : "#faeceb",
                    color: r.effect === "allow" ? "#2e6b34" : "#a33f38" }}
                  title={readOnly ? undefined : "Переключить allow/deny"}
                >{r.effect}</button>
                {readOnly
                  ? <span className="mono" style={{ fontSize: 13, flex: 1 }}>{r.pattern}</span>
                  : <div style={{ flex: 1 }}><TextInput mono value={r.pattern} onChange={(v) => setRule(i, { pattern: v })} /></div>}
                <span className="mono muted" style={{ fontSize: 11.5, width: 74, textAlign: "right", flexShrink: 0 }} title="Сколько actions матчится этим паттерном">{matched} act.</span>
                {!readOnly && <Btn variant="ghost" size="sm" onClick={() => delRule(i)}>✕</Btn>}
              </div>
            );
          })}
          {draft.rules.length === 0 && <Empty>Правил нет — роль ничего не разрешает</Empty>}
        </div>
      </Section>

      <Section title={`Итоговые разрешения — ${allowedCount} из ${scopeActions.length}`}>
        <Field label="Поиск по каталогу actions"><TextInput mono value={q} onChange={setQ} placeholder="dispute, withdrawal, .read…" /></Field>
        <div style={{ maxHeight: 340, overflowY: "auto", border: "1px solid var(--line-2)", borderRadius: "var(--radius)", marginTop: 4 }}>
          {groups.map((g) => (
            <div key={g}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-4)", padding: "8px 12px 4px", background: "var(--paper-2)" }}>{g}</div>
              {visibleActions.filter((a) => a.group === g).map((a) => {
                const denied = draft.rules.some((r) => r.effect === "deny" && permMatches(r.pattern, a.code));
                const ok = permAllowed(draft.rules, a.code);
                return (
                  <div key={a.code} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 12px", borderTop: "1px solid var(--line)", opacity: ok || denied ? 1 : 0.45 }}>
                    <span style={{ width: 16, textAlign: "center", flexShrink: 0, fontWeight: 700, color: ok ? "#2e6b34" : denied ? "#a33f38" : "var(--ink-4)" }}>{ok ? "✓" : denied ? "✕" : "·"}</span>
                    <span className="mono" style={{ fontSize: 12.5, textDecoration: denied ? "line-through" : "none" }}>{a.code}</span>
                    <span className="muted" style={{ fontSize: 12, marginLeft: "auto", textAlign: "right" }}>{a.desc}</span>
                  </div>
                );
              })}
            </div>
          ))}
          {visibleActions.length === 0 && <Empty>Ничего не найдено</Empty>}
        </div>
      </Section>

      {!isNew && (
        <Section title={`Пользователи с этой ролью (${users.length})`}>
          {users.length === 0 && <Empty>Роль никому не назначена</Empty>}
          {users.length > 0 && (
            <table className="table table--inset">
              <tbody>
                {users.map((u, i) => (
                  <tr key={i}>
                    <td><strong>{u.name}</strong></td>
                    <td className="mono muted" style={{ textAlign: "right" }}>{u.sub}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      )}
    </Drawer>
  );
}

Object.assign(window, {
  SectionPermissions, RoleBadges, RolesPicker,
  PERM_ROLES_SEED, ALL_ACTIONS, permMatches, permAllowed, permRoleById, operatorRoleIds,
});
