// Paymania — shell
const PM_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dir": "graphite",
  "app": "admin"
}/*EDITMODE-END*/;

const PM_APPS = {
  admin: { label: "Админ", user: "a.smirnov", role: "Администратор", tiles: () => ADMIN_TILES, Screen: (p) => <AdminScreen {...p} /> },
  merchant: { label: "Мерчант", user: "BetCity", role: "Мерчант · M-501", tiles: () => MERCHANT_TILES, Screen: (p) => <MerchantScreen {...p} /> },
  trader: { label: "Трейдер", user: "a.morozov", role: "Трейдер · VIP", tiles: () => TRADER_TILES, Screen: (p) => <TraderScreen {...p} /> },
};

function PmApp() {
  const [t, setTweak] = useTweaks(PM_DEFAULTS);
  const [screen, setScreen] = React.useState(() => localStorage.getItem("pm_screen") || "home");
  const app = PM_APPS[t.app] || PM_APPS.admin;
  const go = (s) => { setScreen(s); localStorage.setItem("pm_screen", s); window.scrollTo(0, 0); };
  React.useEffect(() => { document.documentElement.dataset.dir = t.dir; }, [t.dir]);
  const tiles = app.tiles();
  const cur = tiles.find((x) => x.id === screen);
  const isHome = screen === "home" || !cur;

  return (
    <div className="pm">
      <header className="top">
        <div className="top__brand"><span className="logo">p</span><span className="wm">paymania</span></div>
        <div className="top__user"><Avatar name={app.user} hue={145} /><div><b>{app.user}</b><small>{app.role}</small></div></div>
        <div className="top__apps">{Object.entries(PM_APPS).map(([k, a]) => <button key={k} className={t.app === k ? "on" : ""} onClick={() => { setTweak("app", k); go("home"); }}>{a.label}</button>)}</div>
        <button className="iconbtn iconbtn--bell"><Ic n="bell" s={20} /><em>3</em></button>
      </header>
      <div className="glow"></div>
      <main className="main" data-screen-label={app.label + " · " + (isHome ? "Главная" : cur.label)}>
        {isHome ? <app.Screen screen="home" go={go} /> : (
          <div className="sub">
            <SubHead title={cur.label} onBack={() => go("home")} />
            <div className="sub__tiles"><Tiles items={tiles} cols={tiles.length} active={screen} onPick={go} /></div>
            <div className="sub__body"><app.Screen screen={screen} go={go} /></div>
          </div>
        )}
      </main>
      <TweaksPanel>
        <TweakSection label="Направление" />
        <TweakRadio label="Стиль" value={t.dir} options={[{ value: "graphite", label: "Графит" }, { value: "obsidian", label: "Обсидиан" }, { value: "chalk", label: "Мел" }]} onChange={(v) => setTweak("dir", v)} />
        <TweakSection label="Приложение" />
        <TweakRadio label="Роль" value={t.app} options={[{ value: "admin", label: "Админ" }, { value: "merchant", label: "Мерчант" }, { value: "trader", label: "Трейдер" }]} onChange={(v) => { setTweak("app", v); go("home"); }} />
      </TweaksPanel>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<PmApp />);
