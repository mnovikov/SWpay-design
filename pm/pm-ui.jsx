// Paymania — UI primitives
const PM_ICONS = {
  back: <path d="m15 18-6-6 6-6" />,
  close: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  up: <><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></>,
  down: <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>,
  swap: <><path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" /></>,
  store: <><path d="M3 9 4.5 4h15L21 9" /><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" /><path d="M5 13v7h14v-7" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /><path d="M18 14a6.5 6.5 0 0 1 3.5 6" /></>,
  wallet: <><rect x="3" y="6" width="18" height="14" rx="3" /><path d="M3 10h18" /><circle cx="16.5" cy="15" r="1.2" /></>,
  chart: <><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>,
  bank: <><path d="m3 9 9-5 9 5" /><path d="M5 10v8" /><path d="M9.5 10v8" /><path d="M14.5 10v8" /><path d="M19 10v8" /><path d="M3 20h18" /></>,
  scale: <><path d="M12 3v18" /><path d="M5 21h14" /><path d="m3 13 3-7 3 7a3 3 0 0 1-6 0z" /><path d="m15 13 3-7 3 7a3 3 0 0 1-6 0z" /><path d="M6 6h12" /></>,
  card: <><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19" /><path d="M6 15h4" /></>,
  list: <><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  chev: <path d="m6 9 6 6 6-6" />,
  chevR: <path d="m9 6 6 6-6 6" />,
  shield: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />,
  code: <><path d="m8 7-5 5 5 5" /><path d="m16 7 5 5-5 5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  flame: <path d="M12 3c1 4 6 5.5 6 11a6 6 0 0 1-12 0c0-3 2-4.5 2-7 2 1 3 2.5 3 4 1.5-2 1-5 1-8z" />,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4.5" /><circle cx="12" cy="16" r=".6" fill="currentColor" /></>,
  phone: <><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M11 18.5h2" /></>,
  more: <><circle cx="12" cy="5" r="1.3" fill="currentColor" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /><circle cx="12" cy="19" r="1.3" fill="currentColor" /></>,
  lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></>,
  ban: <><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></>,
  copy: <><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
  grid: <><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></>,
};
function Ic({ n, s = 20, w = 1.8 }) {
  return <svg className="ic" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{PM_ICONS[n]}</svg>;
}
const pmFmt = (n, d = 2) => Number(n).toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d });
const pmUsd = (n, d = 0) => "$" + pmFmt(n, d);

function Tiles({ items, cols = 3, active, onPick }) {
  return (
    <div className="tiles" style={{ "--cols": cols }}>
      {items.map((t) => (
        <button key={t.id} className={"tile" + (active === t.id ? " tile--on" : "") + (t.wide ? " tile--wide" : "")} onClick={() => onPick && onPick(t.id)}>
          <Ic n={t.icon} s={22} />
          <span>{t.label}</span>
          {t.badge != null && <em className="tile__badge">{t.badge}</em>}
        </button>
      ))}
    </div>
  );
}
function Block({ title, count, right, children, className = "" }) {
  return (
    <section className={"blk " + className}>
      {(title || right) && <div className="blk__head"><h2>{title}{count != null && <small>{count}</small>}</h2>{right}</div>}
      {children}
    </section>
  );
}
function Seg({ options, value, onChange }) {
  return <div className="seg">{options.map((o) => <button key={o} className={value === o ? "on" : ""} onClick={() => onChange(o)}>{o}</button>)}</div>;
}
function Pill({ tone = "mute", children }) { return <span className={"pill pill--" + tone}>{children}</span>; }
function Avatar({ name, hue }) {
  const ini = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const h = hue != null ? hue : [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % 360;
  return <div className="ava" style={{ background: `oklch(0.62 0.13 ${h})` }}>{ini}</div>;
}
function Fold({ icon, iconTone, title, count, right, children, open: o0 = false }) {
  const [open, setOpen] = React.useState(o0);
  return (
    <div className={"fold" + (open ? " fold--open" : "")}>
      <button className="fold__head" onClick={() => setOpen(!open)}>
        {icon && <span className={"sq sq--" + (iconTone || "mute")}><Ic n={icon} s={18} w={2.2} /></span>}
        <b>{title}</b>{count != null && <small>{count}</small>}
        <span className="fold__right">{right}</span>
        <span className="fold__chev"><Ic n="chev" s={18} /></span>
      </button>
      {open && <div className="fold__body">{children}</div>}
    </div>
  );
}
function KV({ l, r, lv, rv, lTone }) {
  return <div className="kv"><div><span>{l}</span><b className={lTone ? "t-" + lTone : ""}>{lv}</b></div><div className="kv__r"><span>{r}</span><b>{rv}</b></div></div>;
}
function Progress({ parts }) {
  return <div className="prog">{parts.map((p, i) => <i key={i} style={{ width: p.v + "%", background: p.c }}></i>)}</div>;
}
function Bars({ data, labels, hi }) {
  const max = Math.max(...data);
  return (
    <div className="bars">
      {data.map((v, i) => (
        <div key={i} className={"bars__c" + (i === hi ? " on" : "")}>
          <div className="bars__b" style={{ height: (v / max * 100) + "%" }}></div>
          <span>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
function SubHead({ title, onBack }) {
  return (
    <div className="subhead">
      <button className="iconbtn" onClick={onBack}><Ic n="back" s={22} /></button>
      <h1>{title}</h1>
      <button className="iconbtn" onClick={onBack}><Ic n="close" s={20} /></button>
    </div>
  );
}
function Search({ placeholder }) {
  return <label className="search"><Ic n="search" s={18} /><input placeholder={placeholder} /></label>;
}
function ActBtn({ icon, tone, children, onClick }) {
  return <button className={"act" + (tone ? " act--" + tone : "")} onClick={onClick}><Ic n={icon} s={19} />{children}</button>;
}
function Balance({ label = "Ваш баланс", value, cur = "USDT", today, actions }) {
  return (
    <div className="bal">
      <span className="bal__l">{label}</span>
      <div className="bal__v">{value}<small>{cur}</small></div>
      {today != null && <span className="bal__t">за сегодня <b className={today >= 0 ? "t-pos" : "t-neg"}>{today >= 0 ? "+" : "−"}{pmFmt(Math.abs(today))} {cur}</b></span>}
      {actions && <div className="bal__a">{actions}</div>}
    </div>
  );
}
Object.assign(window, { Ic, pmFmt, pmUsd, Tiles, Block, Seg, Pill, Avatar, Fold, KV, Progress, Bars, SubHead, Search, ActBtn, Balance });
