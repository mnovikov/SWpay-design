// Reusable UI primitives for CrowdPay v3

function Pill({ tone = "neutral", children, icon }) {
  return (
    <span className={"pill pill--" + tone + (icon ? " pill--icon" : "")}>
      {icon ? <span className="pill__glyph">{icon}</span> : null}
      {children}
    </span>
  );
}

const PILL_TONE_ICON = {
  ok:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  warn: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></svg>,
  bad:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
};

function StatusPill({ map, value }) {
  const s = map[value] || { label: value, tone: "neutral" };
  const icon = PILL_TONE_ICON[s.tone] || null;
  return <Pill tone={s.tone} icon={icon}>{s.label}</Pill>;
}

function Btn({ variant = "default", size, onClick, children, disabled, title, style }) {
  const cls = ["btn"];
  if (variant !== "default") cls.push("btn--" + variant);
  if (size === "sm") cls.push("btn--sm");
  return (
    <button className={cls.join(" ")} onClick={onClick} disabled={disabled} title={title} style={style}>
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

function TextInput({ value, defaultValue, onChange, placeholder, mono, readOnly, disabled, onKeyDown }) {
  return (
    <input
      className="field__input"
      style={mono ? { fontFamily: "var(--font-mono)", fontSize: 12.5 } : null}
      {...(value !== undefined ? { value } : { defaultValue: defaultValue ?? "" })}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      onChange={(e) => onChange && onChange(e.target.value)}
      onKeyDown={onKeyDown}
    />
  );
}

function Select({ value, onChange, options, disabled }) {
  return (
    <select className="field__input" value={value} disabled={disabled} onChange={(e) => onChange && onChange(e.target.value)}>
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
    </div>
  );
}

function ChipSelect({ value, onChange, options, placeholder, align }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const current = options.find((o) => o.value === value);
  const isDefault = options[0] && value === options[0].value;
  const label = current ? current.label : (placeholder || "—");
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className={"chip" + (isDefault ? "" : " chip--active")}
        onClick={() => setOpen((v) => !v)}
        style={{ paddingRight: 10 }}
      >
        {label}
        {current && current.count != null && <span className="chip__count" style={{ marginLeft: 5 }}>{current.count}</span>}
        <svg width="10" height="10" viewBox="0 0 10 10" style={{ marginLeft: 2, opacity: 0.7 }} aria-hidden="true">
          <path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            ...(align === "left" ? { left: 0 } : { right: 0 }),
            minWidth: 180,
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: 4,
            zIndex: 50,
          }}
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  textAlign: "left",
                  padding: "7px 10px",
                  border: "none",
                  background: active ? "var(--paper-2, #f5f1e6)" : "transparent",
                  cursor: "pointer",
                  borderRadius: 6,
                  fontSize: 13,
                  color: "var(--ink)",
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--paper, #faf8f1)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span>{o.label}{o.count != null && <span className="chip__count" style={{ marginLeft: 8 }}>{o.count}</span>}</span>
                {active && (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2.5 6.5 L5 9 L9.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
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

function CopyBtn({ value, title = "Скопировать" }) {
  const [done, setDone] = React.useState(false);
  const onClick = (e) => {
    e.stopPropagation();
    if (!value) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(String(value));
      } else {
        const ta = document.createElement("textarea");
        ta.value = String(value);
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setDone(true);
      setTimeout(() => setDone(false), 1100);
    } catch (_) {}
  };
  return (
    <button
      type="button"
      className={"copy-btn" + (done ? " copy-btn--ok" : "")}
      onClick={onClick}
      title={done ? "Скопировано" : title}
      aria-label={done ? "Скопировано" : title}
    >
      {done ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="11" height="11" rx="2"></rect>
          <path d="M5 15V6a2 2 0 0 1 2-2h9"></path>
        </svg>
      )}
    </button>
  );
}

function MonoCopy({ value, size = 12 }) {
  if (!value) return <span className="muted">—</span>;
  return (
    <span className="mono-copy">
      <span className="mono" style={{ fontSize: size }}>{value}</span>
      <CopyBtn value={value} />
    </span>
  );
}

Object.assign(window, {
  Pill, StatusPill, Btn, Chip, Section, Field, TextInput, Select,
  Drawer, Modal, Tabs, PageHead, Timeline, KV, Empty, FilterChips, ChipSelect,
  PlaceholderImg, Note, CopyBtn, MonoCopy,
});
