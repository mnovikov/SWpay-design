// Reusable UI primitives for CrowdPay v3

function Pill({ tone = "neutral", children }) {
  return <span className={"pill pill--" + tone}>{children}</span>;
}

function StatusPill({ map, value }) {
  const s = map[value] || { label: value, tone: "neutral" };
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

function Btn({ variant = "default", size, onClick, children, disabled, title }) {
  const cls = ["btn"];
  if (variant !== "default") cls.push("btn--" + variant);
  if (size === "sm") cls.push("btn--sm");
  return (
    <button className={cls.join(" ")} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  );
}

function Chip({ active, onClick, children, removable, dashed }) {
  const cls = ["chip"];
  if (active) cls.push("chip--active");
  if (dashed) cls.push("chip--add");
  return (
    <button className={cls.join(" ")} onClick={onClick}>
      {children}
      {removable && <span className="chip__x">×</span>}
    </button>
  );
}

function Section({ title, action, children }) {
  return (
    <div className="section">
      <div className="section__head">
        <span className="section__title">{title}</span>
        <span className="section__rule" />
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children, row }) {
  return (
    <div className={"field" + (row ? " field--row" : "")}>
      <label className="field__label">{label}</label>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, mono, readOnly }) {
  return (
    <input
      className="field__input"
      style={mono ? { fontFamily: "var(--font-mono)", fontSize: 12.5 } : null}
      value={value || ""}
      placeholder={placeholder}
      readOnly={readOnly}
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select className="field__input" value={value} onChange={(e) => onChange && onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Drawer({ title, id, status, statusMap, children, footer, onClose, wide, extraTags }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose && onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className={"drawer" + (wide ? " drawer--wide" : "")}>
        <header className="drawer__head">
          <h3>{title}</h3>
          {id && <span className="drawer__id">{id}</span>}
          {status && statusMap && <StatusPill map={statusMap} value={status} />}
          {extraTags}
          <button className="drawer__close" onClick={onClose} aria-label="Закрыть">✕</button>
        </header>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__foot">{footer}</div>}
      </aside>
    </>
  );
}

function Modal({ title, children, footer, onClose, wide }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose && onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={wide ? { maxWidth: 760, width: "92%" } : null} onClick={(e) => e.stopPropagation()}>
        <header className="modal__head">
          <h3>{title}</h3>
          <button className="drawer__close" style={{ marginLeft: "auto" }} onClick={onClose} aria-label="Закрыть">✕</button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>
  );
}

function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t.id} className={"tab " + (value === t.id ? "tab--active" : "")} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function PageHead({ title, sub, actions }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <div className="page-head__sub">{sub}</div>}
      </div>
      {actions && <div className="page-head__actions">{actions}</div>}
    </div>
  );
}

function Timeline({ items }) {
  return (
    <ul className="timeline">
      {items.map((it, i) => (
        <li key={i} className={it.muted ? "is-muted" : ""}>
          <time>{it.time}</time>
          {it.text}
        </li>
      ))}
    </ul>
  );
}

function KV({ items }) {
  return (
    <dl className="kv">
      {items.map(([k, v], i) => (
        <React.Fragment key={i}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

function Empty({ children }) {
  return <div className="empty">{children}</div>;
}

function FilterChips({ filters, value, onChange }) {
  return (
    <div className="chips">
      {filters.map((f) => (
        <Chip key={f.value} active={value === f.value} onClick={() => onChange(f.value)}>
          {f.label}{f.count != null && <span className="chip__count">{f.count}</span>}
        </Chip>
      ))}
      <span className="chips__sep" />
      <Chip dashed>+ Фильтр</Chip>
      <span className="chips__saved">Сохранённые виды: <strong>Сегодня</strong></span>
    </div>
  );
}

function PlaceholderImg({ label = "Чек / документ", h = 120 }) {
  return (
    <div className="wf-placeholder" style={{ height: h }}>
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, marginBottom: 4 }}>📎</div>
        {label}
      </div>
    </div>
  );
}

function Note({ tone = "neutral", children }) {
  return <div className={"note note--" + tone}>{children}</div>;
}

Object.assign(window, {
  Pill, StatusPill, Btn, Chip, Section, Field, TextInput, Select,
  Drawer, Modal, Tabs, PageHead, Timeline, KV, Empty, FilterChips,
  PlaceholderImg, Note,
});
