/* eslint-disable */

// ─────────────────────────────────────────────────────────────────────────
// QR code — stylized rendering. Not a real QR, just a grid of cells with
// the three finder squares. Looks the part without claiming to be real.
// ─────────────────────────────────────────────────────────────────────────
function FakeQR({ size = 156, seed = "T-1001" }) {
  // 25×25 grid; deterministic from seed
  const n = 25;
  // hash to bits
  let h = 2166136261;
  const s = seed + "::cp-terminal-pair";
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = (i) => {
    h ^= i + 0x9e3779b9 + (h << 6) + (h >> 2);
    return (h >>> 0) / 4294967295;
  };
  const cells = [];
  const cell = size / n;
  // helper: is this a finder square location?
  const inFinder = (r, c) => {
    const top = r < 7 && c < 7;
    const tr  = r < 7 && c >= n - 7;
    const bl  = r >= n - 7 && c < 7;
    return top || tr || bl;
  };
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (inFinder(r, c)) continue;
      const v = rand(r * n + c);
      if (v > 0.52) {
        cells.push(
          <rect
            key={r + "-" + c}
            x={c * cell}
            y={r * cell}
            width={cell}
            height={cell}
            fill="#0a0a0a"
          />
        );
      }
    }
  }
  // finder squares
  const finder = (x, y) => (
    <g key={"f-" + x + y}>
      <rect x={x} y={y} width={cell * 7} height={cell * 7} fill="#0a0a0a" />
      <rect x={x + cell} y={y + cell} width={cell * 5} height={cell * 5} fill="#fff" />
      <rect x={x + 2 * cell} y={y + 2 * cell} width={cell * 3} height={cell * 3} fill="#0a0a0a" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill="#fff" />
      {cells}
      {finder(0, 0)}
      {finder((n - 7) * cell, 0)}
      {finder(0, (n - 7) * cell)}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Generic terminal-app phone wrapper. Matches Android frame but with our
// dark "trader app" chrome. Sits inside <AndroidDevice dark> from
// android-frame.jsx (which gives us the bezel, status bar and gesture pill).
// ─────────────────────────────────────────────────────────────────────────
const APP = {
  bg: "#0a0a0a",
  surface: "#161616",
  surface2: "#1f1f1f",
  line: "#262626",
  ink: "#f5f5f5",
  ink2: "#c8c8c8",
  ink3: "#7a7a7a",
  accent: "#ffc107",
  accent2: "#ffd54f",
  ok: "#3ad07c",
  warn: "#ffc107",
  bad: "#ff5b5b",
};

// ── Environment badge for the in-app top bar (tap or hover to open) ─────────
const TERM_ENV = { env: "UAT", envLabel: "Pre-prod", frontend: "1.9.1-708755ca", backend: "1.8.6-3f1a9c20", health: "ok", pingMs: 38 };
function TerminalEnvBadge() {
  const [open, setOpen] = React.useState(false);
  const toneMap = { DEV: "#3b82f6", UAT: APP.warn, PROD: APP.ok };
  const healthMap = { ok: { label: "operational", dot: APP.ok }, degraded: { label: "degraded", dot: APP.warn }, down: { label: "down", dot: APP.bad } };
  const dot = toneMap[TERM_ENV.env] || toneMap.DEV;
  const health = healthMap[TERM_ENV.health] || healthMap.ok;
  const row = { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, fontSize: 11.5 };
  const lbl = { color: APP.ink3 };
  const val = { color: APP.ink, fontFamily: "JetBrains Mono, monospace", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" };
  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button onClick={() => setOpen((o) => !o)} style={{
        display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px 3px 7px",
        borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
        cursor: "pointer", fontFamily: "JetBrains Mono, monospace",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot }} />
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: dot }}>{TERM_ENV.env}</span>
      </button>
      {open && (
        <div role="tooltip" style={{
          position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", zIndex: 50, width: 206,
          padding: "12px 13px 13px", background: APP.surface, border: `1px solid ${APP.line}`,
          borderRadius: 12, boxShadow: "0 14px 34px rgba(0,0,0,0.5)", textAlign: "left",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot }} />
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: dot }}>{TERM_ENV.env}</span>
            <span style={{ fontSize: 11, color: APP.ink3, marginLeft: "auto" }}>{TERM_ENV.envLabel}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 10 }}>
            <div style={row}><span style={lbl}>Frontend</span><b style={val}>{TERM_ENV.frontend}</b></div>
            <div style={row}><span style={lbl}>Backend</span><b style={val}>{TERM_ENV.backend}</b></div>
          </div>
          <div style={{ height: 1, background: APP.line, margin: "10px -13px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={row}><span style={lbl}>Статус</span><b style={{ ...val, display: "inline-flex", alignItems: "center", gap: 5 }}><i style={{ width: 6, height: 6, borderRadius: "50%", background: health.dot, display: "inline-block" }} />{health.label}</b></div>
            <div style={row}><span style={lbl}>Пинг</span><b style={val}>{TERM_ENV.pingMs} ms</b></div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppTopBar({ subtitle, status }) {
  return (
    <div style={{
      padding: "14px 18px 12px",
      borderBottom: `1px solid ${APP.line}`,
      display: "flex", alignItems: "center", gap: 10,
      background: APP.bg,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: APP.accent, color: "#000",
        display: "grid", placeItems: "center",
        fontWeight: 800, fontFamily: "Fraunces, serif", fontSize: 15,
        boxShadow: "0 2px 0 rgba(255,193,7,0.4)",
      }}>S</div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em" }}>
          <span style={{ color: APP.ink }}>SW</span>
          <span style={{ color: APP.accent }}>Pay</span>
        </div>
        {subtitle && (
          <div style={{ color: APP.ink3, fontSize: 11.5, marginTop: 3, fontFamily: "JetBrains Mono, monospace" }}>
            {subtitle}
          </div>
        )}
      </div>
      <TerminalEnvBadge />
      {status && (
        <div style={{ marginLeft: "auto", ...status.style }}>{status.node}</div>
      )}
    </div>
  );
}

// status dot pill
function StatusPill({ tone = "ok", children }) {
  const map = {
    ok:   { bg: "rgba(58,208,124,0.14)", fg: APP.ok },
    warn: { bg: "rgba(255,193,7,0.16)",  fg: APP.warn },
    bad:  { bg: "rgba(255,91,91,0.16)",  fg: APP.bad },
    idle: { bg: "#222",                  fg: APP.ink3 },
  }[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 9px 3px 8px", borderRadius: 999,
      background: map.bg, color: map.fg,
      fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, fontWeight: 600,
      letterSpacing: "0.04em", textTransform: "uppercase",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: map.fg }} />
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Screen 1: Empty — first run after install
// ─────────────────────────────────────────────────────────────────────────
function ScreenEmpty() {
  return (
    <div style={{ background: APP.bg, color: APP.ink, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <AppTopBar subtitle="v1.18.4 · build 4421" status={{
        node: <StatusPill tone="idle">не привязан</StatusPill>,
      }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 22px", textAlign: "center", gap: 14 }}>
        <div style={{
          width: 96, height: 96, borderRadius: 22,
          background: APP.surface, border: `1px solid ${APP.line}`,
          display: "grid", placeItems: "center", marginBottom: 6,
        }}>
          {/* QR icon glyph */}
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke={APP.accent} strokeWidth="1.6">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3M21 14v3M14 18v3h3M18 21h3" />
          </svg>
        </div>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
          Привяжите устройство
        </div>
        <div style={{ color: APP.ink3, fontSize: 13.5, maxWidth: 280, lineHeight: 1.45 }}>
          Откройте кабинет трейдера → <span style={{ color: APP.ink2 }}>Терминалы → Добавить</span> и отсканируйте показанный QR-код этим устройством.
        </div>
        <div style={{ height: 6 }} />
        <button style={{
          background: APP.accent, color: "#000", border: 0,
          padding: "13px 22px", borderRadius: 12, fontSize: 15, fontWeight: 700,
          display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 6px 18px rgba(255,193,7,0.28)",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
            <path d="M3 7V5a2 2 0 012-2h2M21 7V5a2 2 0 00-2-2h-2M3 17v2a2 2 0 002 2h2M21 17v2a2 2 0 01-2 2h-2" />
            <rect x="7" y="7" width="10" height="10" rx="1" />
          </svg>
          Сканировать QR
        </button>
        {/* Secondary path: paste JSON config from clipboard (no camera needed) */}
        <button style={{
          background: "transparent", color: APP.ink2, border: `1px solid ${APP.line}`,
          padding: "10px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 600,
          display: "inline-flex", alignItems: "center", gap: 8, marginTop: -2,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={APP.ink3} strokeWidth="1.8">
            <rect x="8" y="3" width="8" height="4" rx="1" />
            <path d="M16 5h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h2" />
          </svg>
          Вставить конфиг (JSON)
        </button>
        <div style={{ marginTop: 14, fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: APP.ink3, letterSpacing: "0.04em" }}>
          DEVICE-ID&nbsp;·&nbsp;a91f-6b22-d014
        </div>
      </div>
      <PermissionsFoot />
    </div>
  );
}

function PermissionsFoot() {
  const rows = [
    ["SMS",   "разрешено", "ok"],
    ["Уведомления (Push)", "разрешено", "ok"],
    ["Автозапуск", "разрешено", "ok"],
    ["Энергосбережение", "выкл. для приложения", "ok"],
  ];
  return (
    <div style={{ borderTop: `1px solid ${APP.line}`, padding: "10px 16px 12px", background: APP.bg }}>
      <div style={{ color: APP.ink3, fontFamily: "JetBrains Mono, monospace", fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
        разрешения
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
        {rows.map(([l, v]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: APP.ok }} />
            <span style={{ color: APP.ink2 }}>{l}</span>
            <span style={{ color: APP.ink3, marginLeft: "auto", fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Screen 2: QR scanner — camera viewfinder
// ─────────────────────────────────────────────────────────────────────────
function ScreenScanner() {
  return (
    <div style={{ background: "#000", color: APP.ink, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <AppTopBar subtitle="режим: QR-сканер" status={{
        node: <StatusPill tone="warn">ожидание</StatusPill>,
      }} />
      <div style={{
        flex: 1, position: "relative", background: "#0d0d0f",
        backgroundImage:
          "radial-gradient(ellipse at center, rgba(60,60,80,0.55) 0%, rgba(10,10,12,1) 70%)",
        overflow: "hidden",
      }}>
        {/* simulated camera grain / surface */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,0.015) 3px 4px)",
        }} />
        {/* viewfinder */}
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <div style={{
            width: 238, height: 238, position: "relative",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            borderRadius: 18,
          }}>
            {/* faint pre-scan QR ghost */}
            <div style={{ position: "absolute", inset: 18, opacity: 0.18 }}>
              <FakeQR size={202} seed="ghost" />
            </div>
            {/* corner brackets */}
            {[
              { top: -2, left: -2, borderTop: 3, borderLeft: 3 },
              { top: -2, right: -2, borderTop: 3, borderRight: 3 },
              { bottom: -2, left: -2, borderBottom: 3, borderLeft: 3 },
              { bottom: -2, right: -2, borderBottom: 3, borderRight: 3 },
            ].map((s, i) => (
              <div key={i} style={{
                position: "absolute", width: 32, height: 32,
                borderColor: APP.accent, borderStyle: "solid",
                borderTopWidth: s.borderTop || 0,
                borderLeftWidth: s.borderLeft || 0,
                borderRightWidth: s.borderRight || 0,
                borderBottomWidth: s.borderBottom || 0,
                borderRadius: 4,
                ...s,
              }} />
            ))}
            {/* scan line */}
            <div style={{
              position: "absolute", left: 8, right: 8, top: "48%",
              height: 2, background: APP.accent,
              boxShadow: `0 0 14px ${APP.accent}, 0 0 30px rgba(255,193,7,0.6)`,
            }} />
          </div>
        </div>
        {/* helper text */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 18,
          textAlign: "center", color: APP.ink2, fontSize: 13.5,
          padding: "0 24px", lineHeight: 1.4,
        }}>
          Наведите камеру на QR-код в кабинете трейдера
          <div style={{ color: APP.ink3, fontSize: 11.5, marginTop: 4, fontFamily: "JetBrains Mono, monospace" }}>
            ждём 13 сек…
          </div>
        </div>
        {/* torch toggle */}
        <button style={{
          position: "absolute", left: 16, bottom: 70,
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(20,20,22,0.7)", border: `1px solid ${APP.line}`,
          color: APP.ink2, display: "grid", placeItems: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M8 2h8l-1 6h2l-7 14 1-10H8l1-10z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Screen 2-alt: Paste config — alternative to the QR scan (no camera path)
// ─────────────────────────────────────────────────────────────────────────
const PASTE_CONFIG = `{
  "v": 1,
  "terminal_id": "T-1004",
  "trader_id": "TR-2041",
  "server": "api.swpay.io",
  "pair_token": "pt_3f1a9c20…755ca",
  "token_exp": "2026-07-27T14:25Z"
}`;

function ScreenPaste() {
  return (
    <div style={{ background: APP.bg, color: APP.ink, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <AppTopBar subtitle="режим: вставка конфига" status={{
        node: <StatusPill tone="warn">ожидание</StatusPill>,
      }} />
      <div style={{ flex: 1, padding: "16px 16px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          Вставьте конфиг
        </div>
        <div style={{ color: APP.ink3, fontSize: 12.5, lineHeight: 1.45 }}>
          Скопируйте JSON из&nbsp;кабинета (<span style={{ color: APP.ink2 }}>Терминалы → Добавить → Скопировать конфиг</span>) и&nbsp;вставьте сюда.
        </div>

        {/* paste-from-clipboard button */}
        <button style={{
          background: APP.surface, color: APP.ink, border: `1px solid ${APP.line}`,
          padding: "11px 14px", borderRadius: 12, fontSize: 13.5, fontWeight: 600,
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={APP.accent} strokeWidth="1.8">
            <rect x="8" y="3" width="8" height="4" rx="1" />
            <path d="M16 5h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h2" />
          </svg>
          Вставить из буфера обмена
        </button>

        {/* textarea with pasted JSON */}
        <div style={{
          background: "#0d0d0f", border: `1px solid ${APP.line}`, borderRadius: 12,
          padding: "11px 12px", flex: 1, minHeight: 150, position: "relative",
        }}>
          <pre style={{
            margin: 0, fontFamily: "JetBrains Mono, monospace", fontSize: 11.5,
            lineHeight: 1.6, color: APP.ink2, whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>{PASTE_CONFIG}</pre>
        </div>

        {/* validation: parsed OK */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(58,208,124,0.1)", border: `1px solid rgba(58,208,124,0.3)`,
          borderRadius: 10, padding: "9px 12px", fontSize: 12, color: APP.ok,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Конфиг распознан · терминал T-1004
        </div>

        <button style={{
          background: APP.accent, color: "#000", border: 0,
          padding: "13px 18px", borderRadius: 12, fontSize: 15, fontWeight: 700,
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          Продолжить
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Screen 3: Confirm pairing — what came back from the QR
// ─────────────────────────────────────────────────────────────────────────
function ScreenConfirm() {
  return (
    <div style={{ background: APP.bg, color: APP.ink, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <AppTopBar subtitle="привязка устройства" status={{
        node: <StatusPill tone="warn">подтвердите</StatusPill>,
      }} />
      <div style={{ padding: "16px 16px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          Привязать к&nbsp;трейдеру?
        </div>
        <div style={{ color: APP.ink3, fontSize: 12.5, lineHeight: 1.45 }}>
          QR-код расшифрован. Проверьте, что данные совпадают с&nbsp;тем, что показано в&nbsp;кабинете.
        </div>

        <div style={{
          marginTop: 4,
          background: APP.surface, border: `1px solid ${APP.line}`,
          borderRadius: 14, padding: "14px 14px 12px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: APP.accent, color: "#000",
              display: "grid", placeItems: "center",
              fontWeight: 800, fontFamily: "Fraunces, serif", fontSize: 16,
            }}>А</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>Алексей М.</div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: APP.ink3, marginTop: 3 }}>
                TR-2041 · team Charlie
              </div>
            </div>
            <StatusPill tone="ok"></StatusPill>
          </div>
          <div style={{ height: 1, background: APP.line }} />
          <KV k="ID терминала"   v="T-1004" mono />
          <KV k="Назначить как"  v="Pixel 6a · основной" />
          <KV k="Сервер"          v="api.swpay.io" mono />
          <KV k="Срок токена"     v="60 дней" />
          <KV k="Реквизиты"      v="будут назначены позже" muted />
        </div>

        <div style={{
          background: "rgba(255,193,7,0.08)",
          border: `1px solid rgba(255,193,7,0.25)`,
          borderRadius: 12, padding: "10px 12px",
          fontSize: 11.5, color: APP.accent2, lineHeight: 1.45,
        }}>
          После подтверждения приложение получит токен и&nbsp;начнёт пересылать SMS / Push-уведомления привязанным реквизитам. Отвязать можно из&nbsp;кабинета трейдера.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 8, marginTop: 4 }}>
          <button style={{
            background: APP.surface, color: APP.ink2, border: `1px solid ${APP.line}`,
            padding: "12px 14px", borderRadius: 12, fontSize: 14, fontWeight: 600,
          }}>Отмена</button>
          <button style={{
            background: APP.accent, color: "#000", border: 0,
            padding: "12px 14px", borderRadius: 12, fontSize: 14, fontWeight: 700,
            boxShadow: "0 6px 18px rgba(255,193,7,0.25)",
          }}>Привязать терминал</button>
        </div>
      </div>
    </div>
  );
}

function KV({ k, v, mono, muted }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, fontSize: 13 }}>
      <span style={{ color: APP.ink3, fontSize: 11.5 }}>{k}</span>
      <span style={{ flex: 1, borderBottom: `1px dotted ${APP.line}`, marginBottom: 4 }} />
      <span style={{
        color: muted ? APP.ink3 : APP.ink,
        fontFamily: mono ? "JetBrains Mono, monospace" : "inherit",
        fontSize: mono ? 12 : 13, fontWeight: mono ? 500 : 600,
      }}>{v}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Screen 4: Live — main terminal dashboard
// ─────────────────────────────────────────────────────────────────────────
function ScreenLive() {
  return (
    <div style={{ background: APP.bg, color: APP.ink, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <AppTopBar subtitle="T-1004 · Алексей М." status={{
        node: <StatusPill tone="ok">online</StatusPill>,
      }} />
      <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* battery / heartbeat / since strip */}
        <div style={{
          background: APP.surface, border: `1px solid ${APP.line}`,
          borderRadius: 14, padding: "12px 14px",
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10,
        }}>
          <MiniStat label="батарея"  value="86%" sub="сеть" />
          <MiniStat label="ping"     value="0.4 с" sub="heartbeat" />
          <MiniStat label="привязан" value="14 ч" sub="без сбоев" />
        </div>

        {/* Bound payment details */}
        <Card title="Привязанные реквизиты" extra="2">
          <Detail
            bank="Сбер"
            label="СБП · основной"
            target="+7 900 123-45-67"
            limit="62% · 496 / 800k ₽"
          />
          <div style={{ height: 1, background: APP.line, margin: "8px 0" }} />
          <Detail
            bank="Тинькофф"
            label="Карта"
            target="•••• 4423"
            limit="31% · 186 / 600k ₽"
            cooldown="2:36"
          />
        </Card>

        {/* Today counters */}
        <Card title="Сегодня · сводка">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Counter label="SMS обработано" value="142" tone="ok" />
            <Counter label="Push обработано" value="56" tone="ok" />
            <Counter label="Не распознано"   value="0"   tone="idle" />
            <Counter label="Ошибки парсера"  value="0"   tone="idle" />
          </div>
        </Card>

        {/* Last events */}
        <Card title="Последние события">
          <Event time="14:22:14" amt="+15 000 ₽" src="Сбер" parsed />
          <Event time="14:18:03" amt="+8 500 ₽"  src="Альфа · Push" parsed />
          <Event time="14:10:51" amt="+24 000 ₽" src="МТС-SMS" parsed />
          <Event time="13:58:44" amt="+5 200 ₽"  src="Сбер" parsed />
        </Card>
      </div>
    </div>
  );
}

function MiniStat({ label, value, sub }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ color: APP.ink3, fontFamily: "JetBrains Mono, monospace", fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em" }}>{value}</div>
      <div style={{ color: APP.ink3, fontSize: 10.5 }}>{sub}</div>
    </div>
  );
}

function Card({ title, extra, children }) {
  return (
    <div style={{
      background: APP.surface, border: `1px solid ${APP.line}`,
      borderRadius: 14, padding: "12px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 9 }}>
        <div style={{ color: APP.ink3, fontFamily: "JetBrains Mono, monospace", fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</div>
        {extra && (
          <div style={{ marginLeft: "auto", color: APP.ink3, fontFamily: "JetBrains Mono, monospace", fontSize: 10.5 }}>{extra}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function Detail({ bank, label, target, limit, cooldown }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: APP.surface2, color: APP.ink2,
        display: "grid", placeItems: "center",
        fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, fontWeight: 700,
        border: `1px solid ${APP.line}`,
      }}>{bank.slice(0, 1)}</div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.15 }}>
          {bank} <span style={{ color: APP.ink3, fontWeight: 400 }}>· {label}</span>
        </div>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: APP.ink3, marginTop: 2 }}>
          {target}
        </div>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: APP.ink3, marginTop: 2 }}>
          {limit}
        </div>
      </div>
      {cooldown && (
        <div style={{
          background: "rgba(255,193,7,0.14)", color: APP.accent2,
          padding: "3px 8px", borderRadius: 999, fontSize: 10.5,
          fontFamily: "JetBrains Mono, monospace", fontWeight: 600,
        }}>
          cd&nbsp;{cooldown}
        </div>
      )}
    </div>
  );
}

function Counter({ label, value, tone }) {
  const c = { ok: APP.ok, idle: APP.ink2, warn: APP.warn, bad: APP.bad }[tone] || APP.ink2;
  return (
    <div style={{
      background: APP.surface2, borderRadius: 10, padding: "9px 11px",
      display: "flex", flexDirection: "column", gap: 2,
      border: `1px solid ${APP.line}`,
    }}>
      <div style={{ color: APP.ink3, fontFamily: "JetBrains Mono, monospace", fontSize: 9.5, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 18, color: c, letterSpacing: "-0.01em" }}>{value}</div>
    </div>
  );
}

function Event({ time, amt, src, parsed }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: parsed ? APP.ok : APP.ink3 }} />
      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: APP.ink3, width: 60 }}>{time}</span>
      <span style={{ fontWeight: 700, color: APP.ok, fontSize: 13, fontFamily: "JetBrains Mono, monospace" }}>{amt}</span>
      <span style={{ marginLeft: "auto", color: APP.ink2, fontSize: 12 }}>{src}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Screen 5: SMS log — full feed
// ─────────────────────────────────────────────────────────────────────────
function ScreenLog() {
  const items = [
    { t: "14:22:14", src: "Сбер · 900",        amt: "+15 000 ₽",  msg: "Перевод 15 000 ₽ от ИВАНОВ И. И. Баланс 124 580 ₽ ··4423", parsed: true,  payment: "PI-24001" },
    { t: "14:18:03", src: "Альфа · Push",      amt: "+8 500 ₽",   msg: "Поступление по СБП. Остаток: 116 080 ₽ ··4423", parsed: true,  payment: "PI-24002" },
    { t: "14:10:51", src: "МТС · SMS",         amt: "+24 000 ₽",  msg: "Зачисление 24 000 ₽. Карта ··4423. Доступно 107 580 ₽", parsed: true,  payment: "PI-24003" },
    { t: "13:58:44", src: "Сбер · 900",        amt: "+5 200 ₽",   msg: "Перевод 5 200 ₽ от ПЕТРОВ А. А. Остаток 51 280 ₽ ··8821", parsed: true,  payment: "PI-24004" },
    { t: "13:51:11", src: "Сбер · 900",        amt: "+5 000 ₽",   msg: "Поступление: Остаток 5 106 ₽ ··3374 (другая карта)", parsed: true,  payment: null },
    { t: "13:44:58", src: "Альфа · Push",      amt: "+89 200 ₽",  msg: "СБП. Остаток 215 280 ₽ ··8821", parsed: true,  payment: "PI-24005" },
    { t: "13:31:02", src: "МТС · SMS",         amt: "+3 200 ₽",   msg: "Зачисление по карте ··4423. Доступно 18 200 ₽", parsed: true,  payment: "PI-24006" },
    { t: "13:14:40", src: "Билайн · SMS",      amt: "+51 000 ₽",  msg: "Перевод СБП. Остаток 209 280 ₽ ··4423", parsed: true,  payment: "PI-24007" },
    { t: "12:50:22", src: "Альфа · Push",      amt: "—",          msg: "Уведомление об операции (не распознано)", parsed: false, payment: null },
  ];
  return (
    <div style={{ background: APP.bg, color: APP.ink, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <AppTopBar subtitle="лог · SMS и Push" status={{
        node: <StatusPill tone="ok">отправка ok</StatusPill>,
      }} />
      <div style={{ padding: "12px 14px", display: "flex", gap: 8, borderBottom: `1px solid ${APP.line}` }}>
        {["Все", "SMS", "Push", "Ошибки"].map((t, i) => (
          <div key={t} style={{
            padding: "5px 10px", borderRadius: 999, fontSize: 11.5,
            background: i === 0 ? APP.accent : "transparent",
            color: i === 0 ? "#000" : APP.ink3,
            border: i === 0 ? "0" : `1px solid ${APP.line}`,
            fontWeight: i === 0 ? 700 : 500,
          }}>{t}</div>
        ))}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "6px 0" }}>
        {items.map((it, i) => (
          <div key={i} style={{
            padding: "11px 14px",
            borderBottom: `1px solid ${APP.line}`,
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: it.parsed ? APP.ok : APP.bad,
              }} />
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: APP.ink3 }}>{it.t}</span>
              <span style={{ fontSize: 11.5, color: APP.ink2 }}>{it.src}</span>
              <span style={{ marginLeft: "auto", fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: it.parsed ? APP.ok : APP.ink3 }}>{it.amt}</span>
            </div>
            <div style={{ fontSize: 11.5, color: APP.ink2, lineHeight: 1.4, paddingLeft: 14 }}>{it.msg}</div>
            <div style={{ paddingLeft: 14, display: "flex", gap: 6, marginTop: 1 }}>
              {it.payment ? (
                <span style={{
                  fontFamily: "JetBrains Mono, monospace", fontSize: 10,
                  background: "rgba(58,208,124,0.12)", color: APP.ok,
                  padding: "2px 7px", borderRadius: 6, fontWeight: 600,
                }}>→ {it.payment}</span>
              ) : it.parsed ? (
                <span style={{
                  fontFamily: "JetBrains Mono, monospace", fontSize: 10,
                  background: "#222", color: APP.ink3,
                  padding: "2px 7px", borderRadius: 6, fontWeight: 600,
                }}>не сопоставлен</span>
              ) : (
                <span style={{
                  fontFamily: "JetBrains Mono, monospace", fontSize: 10,
                  background: "rgba(255,91,91,0.12)", color: APP.bad,
                  padding: "2px 7px", borderRadius: 6, fontWeight: 600,
                }}>не распознано</span>
              )}
              <span style={{
                fontFamily: "JetBrains Mono, monospace", fontSize: 10,
                color: APP.ink3,
              }}>отправлено · 0.4с</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// QR shown by trader cabinet — sits between scanner phone and confirm phone
// ─────────────────────────────────────────────────────────────────────────
function CabinetQRCard() {
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--line)",
      borderRadius: 18, padding: "18px 18px 16px",
      width: 260, boxShadow: "var(--shadow-md)",
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 10, alignSelf: "center",
    }}>
      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontFamily: "JetBrains Mono, monospace", fontSize: 10,
          letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)",
        }}>Кабинет трейдера</span>
        <span style={{
          marginLeft: "auto",
          background: "var(--accent-soft)", color: "var(--accent-ink)",
          padding: "2px 8px", borderRadius: 999,
          fontSize: 10, fontFamily: "JetBrains Mono, monospace", fontWeight: 700,
        }}>QR · 04:58</span>
      </div>
      <div style={{ padding: 8, background: "#fff", border: "1px solid var(--line)", borderRadius: 12 }}>
        <FakeQR size={188} seed="T-1004-pair-token" />
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 3, marginTop: 2 }}>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>
          T-1004
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
          одноразовая ссылка <span style={{ fontFamily: "JetBrains Mono, monospace" }}>swpay://pair?t=…</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Page-level building blocks
// ─────────────────────────────────────────────────────────────────────────
function Step({ n, title, sub }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, maxWidth: 412 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
        <span style={{
          fontFamily: "JetBrains Mono, monospace", fontSize: 11,
          background: "var(--ink)", color: "#fff",
          width: 22, height: 22, display: "grid", placeItems: "center",
          borderRadius: 999, fontWeight: 700,
        }}>{n}</span>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>{title}</span>
      </div>
      {sub && <div style={{ color: "var(--ink-3)", fontSize: 12.5, textAlign: "center", maxWidth: 320, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  );
}

function FlowArrow() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      color: "var(--ink-4)", padding: "0 4px",
    }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M6 18h24M22 10l8 8-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// JSON code block (syntax-light)
function CodeBlock({ title, kind, code }) {
  const tag = {
    POST: { bg: "#cde8e1", fg: "#0f5c50" },
    PUT:  { bg: "#fff4c2", fg: "#6c4f00" },
  }[kind] || { bg: "#ecebe6", fg: "#5a564a" };
  return (
    <div style={{
      background: "#0d0d0d", color: "#e8e8e8",
      borderRadius: 14, overflow: "hidden",
      border: "1px solid #1a1a1a",
      boxShadow: "var(--shadow-md)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px",
        borderBottom: "1px solid #1f1f1f",
        background: "#111",
      }}>
        <span style={{
          background: tag.bg, color: tag.fg,
          padding: "2px 8px", borderRadius: 6,
          fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, fontWeight: 700,
        }}>{kind}</span>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#cfcfcf" }}>{title}</span>
      </div>
      <pre style={{
        margin: 0, padding: "14px 16px 16px",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 11.5, lineHeight: 1.55,
        color: "#e8e8e8", whiteSpace: "pre", overflowX: "auto",
      }}>{colorizeJSON(code)}</pre>
    </div>
  );
}

// minimal JSON syntax colorizer
function colorizeJSON(text) {
  // tokenize on strings, numbers, keywords
  const parts = [];
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|(\btrue\b|\bfalse\b|\bnull\b)|(-?\d+(?:\.\d+)?)|([{}\[\],])/g;
  let lastIndex = 0; let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    if (m[1] && m[2]) {
      parts.push(<span key={parts.length} style={{ color: "#ffd54f" }}>{m[1]}</span>);
      parts.push(m[2]);
    } else if (m[1]) {
      parts.push(<span key={parts.length} style={{ color: "#9be7c4" }}>{m[1]}</span>);
    } else if (m[3]) {
      parts.push(<span key={parts.length} style={{ color: "#a4c8ff" }}>{m[3]}</span>);
    } else if (m[4]) {
      parts.push(<span key={parts.length} style={{ color: "#ffb38a" }}>{m[4]}</span>);
    } else if (m[5]) {
      parts.push(<span key={parts.length} style={{ color: "#888" }}>{m[5]}</span>);
    }
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

// ─────────────────────────────────────────────────────────────────────────
// Server payload examples
// ─────────────────────────────────────────────────────────────────────────
const PAYLOAD_PAIR = `{
  "device_id":   "a91f-6b22-d014",
  "pair_token":  "swpay_pair_3f9c…b21",
  "model":       "Pixel 6a",
  "android":     "14",
  "app_version": "1.18.4",
  "build":       4421,
  "sim_imsi":    "250-01-…",
  "imei_short":  "…14-72",
  "permissions": {
    "sms":        "granted",
    "post_notif": "granted",
    "autostart":  "granted",
    "battery_opt":"ignored"
  },
  "boot_time":   "2026-05-28T07:11:02Z"
}`;

const PAYLOAD_HEARTBEAT = `{
  "terminal_id":  "T-1004",
  "ts":           "2026-05-28T14:22:38Z",
  "battery":      86,
  "battery_state":"discharging",
  "charging":     false,
  "screen_on":    true,
  "network":      { "type": "wifi", "signal": -52, "carrier": "MTS" },
  "sim_state":    "ready",
  "rss_mb":       128,
  "uptime_sec":   50412,
  "sms_today":    142,
  "push_today":   56,
  "queue":        { "pending": 0, "retrying": 0 }
}`;

const PAYLOAD_SMS = `{
  "terminal_id": "T-1004",
  "event_id":    "SM-2401",
  "kind":        "sms",
  "received_at": "2026-05-28T14:22:14.812Z",
  "source": {
    "package":   "ru.sberbankmobile",
    "sender":    "900",
    "sim_slot":  1
  },
  "raw_text":    "Перевод 15 000р от ИВАНОВ И. И. Баланс 124 580р ··4423",
  "parsed": {
    "ok":        true,
    "amount":    15000,
    "currency":  "RUB",
    "last4":     "4423",
    "balance":   124580,
    "kind":      "incoming_transfer"
  },
  "details_id":  "PD-9001"
}`;

// ─────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────
function TerminalAppPage() {
  return (
    <div style={{ padding: "32px 36px 80px", maxWidth: 1840, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginBottom: 22, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12,
            background: "var(--accent)", color: "var(--ink)",
            display: "grid", placeItems: "center",
            fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 22,
            boxShadow: "0 4px 0 rgba(255,193,7,0.4)",
          }}>S</div>
          <div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              CrowdPay · Terminal · Android
            </div>
            <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
              SWPay Terminal — приложение трейдера
            </h1>
            <div style={{ color: "var(--ink-3)", fontSize: 14, marginTop: 4, maxWidth: 720 }}>
              Терминал — обычный Android-смартфон с&nbsp;SIM-картой. После установки сканируется QR из&nbsp;кабинета, после чего устройство привязывается к&nbsp;трейдеру и&nbsp;начинает пересылать SMS и&nbsp;Push на&nbsp;сервер.
            </div>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <span className="topbar__app-tag">v1.18.4 · build 4421</span>
        </div>
      </div>

      {/* SECTION 1 — User flow row */}
      <SectionHeader title="Сценарий привязки" sub="что видит трейдер на устройстве, шаг за шагом" />
      <div style={{
        display: "flex", alignItems: "stretch", gap: 16,
        padding: "8px 4px 28px", overflowX: "auto",
      }}>
        <FlowSlot n="1" title="Установлено" sub="Приложение запущено впервые, ждёт привязки.">
          <AndroidDevice dark width={310} height={620}>
            <ScreenEmpty />
          </AndroidDevice>
        </FlowSlot>
        <FlowArrow />
        <FlowSlot n="2" title="Привязка" sub="Камера на QR — или вставка конфига, если нет камеры / устройство удалённое.">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <AndroidDevice dark width={310} height={620}>
              <ScreenScanner />
            </AndroidDevice>
            <div style={{
              fontFamily: "JetBrains Mono, monospace", fontSize: 10.5,
              color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ width: 28, height: 1, background: "var(--line)" }} />или<span style={{ width: 28, height: 1, background: "var(--line)" }} />
            </div>
            <AndroidDevice dark width={310} height={620}>
              <ScreenPaste />
            </AndroidDevice>
          </div>
        </FlowSlot>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, justifyContent: "center" }}>
          <CabinetQRCard />
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.06em" }}>
            показано в&nbsp;кабинете
          </div>
        </div>
        <FlowArrow />
        <FlowSlot n="3" title="Подтверждение" sub="Что распаковано из QR. Трейдер принимает привязку.">
          <AndroidDevice dark width={310} height={620}>
            <ScreenConfirm />
          </AndroidDevice>
        </FlowSlot>
        <FlowArrow />
        <FlowSlot n="4" title="В работе" sub="Главный экран с параметрами трейдера и реквизитов.">
          <AndroidDevice dark width={310} height={620}>
            <ScreenLive />
          </AndroidDevice>
        </FlowSlot>
        <FlowArrow />
        <FlowSlot n="5" title="Лог" sub="SMS и Push, что приложение поймало и переслало.">
          <AndroidDevice dark width={310} height={620}>
            <ScreenLog />
          </AndroidDevice>
        </FlowSlot>
      </div>

      {/* SECTION 2 — Server payloads */}
      <SectionHeader
        title="Что приложение отправляет на сервер"
        sub="Три ключевых запроса в жизненном цикле терминала."
        spaceTop
      />
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
      }}>
        <CodeBlock kind="POST" title="/v1/terminals/pair — после сканирования QR" code={PAYLOAD_PAIR} />
        <CodeBlock kind="POST" title="/v1/terminals/{id}/heartbeat — каждые 15 сек" code={PAYLOAD_HEARTBEAT} />
        <CodeBlock kind="POST" title="/v1/terminals/{id}/events — на каждое SMS / Push" code={PAYLOAD_SMS} />
      </div>

      {/* SECTION 3 — what server tracks */}
      <SectionHeader
        title="Параметры терминала, которые видит сервер"
        sub="Эти поля живут в кабинете трейдера и админ-панели. Источник — приходящие пакеты сверху."
        spaceTop
      />
      <ServerSchemaTable />
    </div>
  );
}

function SectionHeader({ title, sub, spaceTop }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", gap: 16,
      marginTop: spaceTop ? 40 : 0,
      marginBottom: 14, paddingBottom: 8,
      borderBottom: "1px solid var(--line)",
    }}>
      <div>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          раздел
        </div>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, marginTop: 4 }}>
          {title}
        </div>
      </div>
      {sub && (
        <div style={{ color: "var(--ink-3)", fontSize: 13, maxWidth: 480, marginBottom: 6 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function FlowSlot({ n, title, sub, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flex: "0 0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontFamily: "JetBrains Mono, monospace", fontSize: 10.5,
          background: "var(--ink)", color: "#fff",
          padding: "2px 8px", borderRadius: 999, fontWeight: 700,
        }}>шаг {n}</span>
        <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>{title}</span>
      </div>
      {children}
      <div style={{ color: "var(--ink-3)", fontSize: 12, maxWidth: 280, textAlign: "center", lineHeight: 1.4 }}>{sub}</div>
    </div>
  );
}

function ServerSchemaTable() {
  const groups = [
    {
      label: "Идентификация",
      rows: [
        ["terminal_id",       "string",   "T-1004",                       "присваивается сервером при привязке"],
        ["device_id",         "string",   "a91f-6b22-d014",                "уникальный идентификатор устройства"],
        ["trader_id",         "ref",      "TR-2041",                       "к какому трейдеру привязан"],
        ["pair_token_exp",    "datetime", "2026-07-27T14:25Z",             "срок жизни токена, после — переподтверждение"],
      ],
    },
    {
      label: "Устройство",
      rows: [
        ["model",             "string",   "Pixel 6a",                      "из Build.MODEL"],
        ["android",           "string",   "14",                            "версия ОС"],
        ["app_version",       "string",   "1.18.4 · 4421",                 "версия + номер сборки"],
        ["sim_carrier",       "string",   "MTS",                           "оператор активной SIM"],
        ["imei_short",        "string",   "…14-72",                        "только последние 4 цифры, для опознания"],
      ],
    },
    {
      label: "Состояние",
      rows: [
        ["status",            "enum",     "online · offline · stale",      "по heartbeat (>5 мин → offline)"],
        ["last_heartbeat",    "datetime", "8 сек назад",                   "приходит каждые 15 сек"],
        ["battery",           "int",      "86%",                            "доля заряда"],
        ["charging",          "bool",     "false",                          "true, если на зарядке"],
        ["network",           "object",   "wifi · -52 dBm",                "тип, уровень сигнала"],
        ["screen_on",         "bool",     "true",                           "косвенно: жив ли пользовательский поток"],
      ],
    },
    {
      label: "Поток событий",
      rows: [
        ["sms_today",         "int",      "142",                            "обработано SMS за сутки"],
        ["push_today",        "int",      "56",                             "обработано Push-уведомлений"],
        ["sms_errors_today",  "int",      "0",                              "не распознано / отвергнуто парсером"],
        ["queue_pending",     "int",      "0",                              "ждут отправки (если сеть упала)"],
        ["bound_details",     "array",    "PD-9001, PD-9002",               "какие реквизиты слушает терминал"],
      ],
    },
  ];
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--line)",
      borderRadius: 14, overflow: "hidden",
      boxShadow: "var(--shadow-sm)",
    }}>
      {groups.map((g, gi) => (
        <div key={g.label}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 18px",
            background: "var(--paper-2)",
            borderTop: gi === 0 ? "0" : "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}>
            <span style={{
              fontFamily: "JetBrains Mono, monospace", fontSize: 10.5,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--ink-3)",
            }}>{g.label}</span>
          </div>
          <div>
            {g.rows.map((r, ri) => (
              <div key={ri} style={{
                display: "grid", gridTemplateColumns: "240px 110px 220px 1fr",
                padding: "10px 18px", alignItems: "baseline",
                borderBottom: ri === g.rows.length - 1 ? "0" : "1px solid var(--line)",
                fontSize: 13.5,
              }}>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12.5, color: "var(--ink)", fontWeight: 600 }}>{r[0]}</span>
                <span style={{
                  fontFamily: "JetBrains Mono, monospace", fontSize: 10.5,
                  background: "var(--paper-2)", color: "var(--ink-3)",
                  padding: "2px 8px", borderRadius: 6, fontWeight: 600,
                  justifySelf: "start",
                }}>{r[1]}</span>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12.5, color: "var(--ink-2)" }}>{r[2]}</span>
                <span style={{ color: "var(--ink-3)", fontSize: 13 }}>{r[3]}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<TerminalAppPage />);
