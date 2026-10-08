// Paymania — Merchant & Trader screens
const MERCHANT_TILES = [
  { id: "payments", icon: "down", label: "Платежи" },
  { id: "payouts", icon: "up", label: "Выплаты" },
  { id: "withdraw", icon: "wallet", label: "Вывод" },
  { id: "api", icon: "code", label: "API" },
  { id: "users", icon: "users", label: "Сотрудники" },
  { id: "profile", icon: "user", label: "Профиль" },
];
const TRADER_TILES = [
  { id: "deals", icon: "swap", label: "Сделки" },
  { id: "details", icon: "card", label: "Реквизиты" },
  { id: "devices", icon: "phone", label: "Устройства" },
  { id: "disputes", icon: "alert", label: "Споры", badge: 2 },
  { id: "deposit", icon: "shield", label: "Депозит" },
  { id: "profile", icon: "user", label: "Профиль" },
];

function MerchantHome({ go }) {
  const m = PM.merchants[0];
  const [per, setPer] = React.useState("24h");
  const k = per === "24h" ? 1 : per === "7d" ? 6.8 : 27;
  return (
    <div className="grid-home">
      <div className="col">
        <Balance value={pmFmt(m.balance)} today={m.today} actions={<><ActBtn icon="up">Вывод</ActBtn><ActBtn icon="swap">История</ActBtn></>} />
        <Tiles items={MERCHANT_TILES} onPick={go} />
      </div>
      <div className="col">
        <Block title="Статистика" right={<Seg options={["24h", "7d", "30d"]} value={per} onChange={setPer} />}>
          <div className="card card--pad stack">
            <KV l="Принято" lv={pmUsd(4210 * k)} lTone="pos" r="Выплачено" rv={pmUsd(620 * k)} />
            <KV l="Конверсия оплаты" lv={m.conv.toFixed(1).replace(".", ",") + "%"} r="Средний чек" rv={"$" + m.avg} />
          </div>
        </Block>
        <Block title="Последние платежи" right={<button className="link" onClick={() => go("payments")}>Все</button>}>
          <PaymentsList items={PM.payments.filter((p) => p.m === "BetCity").slice(0, 4)} merchantCol={false} />
        </Block>
      </div>
    </div>
  );
}

function MerchantScreen({ screen, go }) {
  if (screen === "home") return <MerchantHome go={go} />;
  if (screen === "payments") return <><Seg options={["Все", "Успешно", "Ожидает", "Спор"]} value="Все" onChange={() => {}} /><Search placeholder="ID заказа или платежа…" /><PaymentsList items={PM.payments.filter((p) => p.m === "BetCity")} merchantCol={false} /></>;
  if (screen === "payouts") return <><button className="btn btn--acc btn--block"><Ic n="plus" s={18} />Создать выплату</button><PaymentsList items={PM.payouts.map((p) => ({ ...p, method: "Выплата" }))} merchantCol={false} /></>;
  return <Placeholder />;
}

function TraderHome({ go }) {
  const t = PM.traders[0];
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  return (
    <div className="grid-home grid-home--3">
      <div className="col">
        <Balance value={pmFmt(t.working)} today={t.today} actions={<><ActBtn icon="down">Депозит</ActBtn><ActBtn icon="up">Вывод</ActBtn></>} />
        <Tiles items={TRADER_TILES} onPick={go} />
      </div>
      <div className="col">
        <Block title="Серия" right={<span className="t-warn sm row-gap-xs"><Ic n="flame" s={16} />12 дней</span>}>
          <div className="card card--pad stack">
            <div className="streak">{days.map((d, i) => <div key={d} className={"streak__d" + (i < 4 ? " done" : i === 4 ? " now" : "")}><i>{i < 4 && <Ic n="check" s={14} w={3} />}</i><span>{d}</span></div>)}</div>
            <div><span className="t-mute sm">Обработано за неделю</span><div className="row-sb"><b className="big">$34 151</b><span className="t-mute sm">из $100 000 · 34%</span></div><Progress parts={[{ v: 34, c: "var(--acc)" }]} /></div>
          </div>
        </Block>
        <Block title="Упущенный трафик" right={<span className="t-mute sm">24h</span>}>
          <div className="card list">
            {[["СБП", 13124.34], ["Карта", 8124.34], ["Трансгран", 1124.34]].map(([l, v]) => <div key={l} className="li"><b>{l}</b><span className="li__r"><Pill tone="acc">{pmUsd(v, 2)}</Pill></span></div>)}
          </div>
        </Block>
      </div>
      <div className="col">
        <Block title="Успешные сделки" count={234} right={<span className="t-pos sm">+$124,34 за 24ч</span>}>
          <PaymentsList items={PM.payments.filter((p) => p.st === "ok").map((p) => ({ ...p, m: null }))} merchantCol={false} />
        </Block>
      </div>
    </div>
  );
}

function TraderDetails() {
  const [tab, setTab] = React.useState("Карты");
  return (
    <>
      <Tiles cols={4} items={[{ id: "a", icon: "plus", label: "Добавить" }, { id: "s", icon: "search", label: "Поиск" }, { id: "on", icon: "check", label: "Вкл." }, { id: "off", icon: "close", label: "Выкл." }]} />
      <Seg options={["SIM-карты", "Карты", "Временные"]} value={tab} onChange={setTab} />
      <div className="stack-sm">
        {PM.details.map((g, gi) => (
          <Fold key={g.bank} title={g.bank} count={g.items.filter((i) => i.on).length + "/" + g.items.length} open={gi === 0} icon={null}>
            {g.items.map((d, i) => (
              <div key={i} className="req">
                <div className="req__chip" style={{ background: `oklch(0.55 0.14 ${g.hue})` }}><span>{d.last}</span></div>
                <div className="li__b"><b>{d.holder}</b><small className="mono">{d.target}</small><small><span className="t-acc">{d.device}</span> · <span className={d.on ? "t-pos" : "t-mute"}>{d.on ? "Активен" : "Выключен"}</span> · {d.method}</small></div>
                <button className="iconbtn"><Ic n="more" s={18} /></button>
              </div>
            ))}
          </Fold>
        ))}
      </div>
      <Block title="Действия">
        <div className="stack-sm">
          <ActBtn icon="list">Мануалы трейдера</ActBtn>
          <ActBtn icon="ban" tone="warn">Запретить выплаты</ActBtn>
          <ActBtn icon="lock" tone="neg">Заблокировать все реквизиты</ActBtn>
        </div>
      </Block>
    </>
  );
}

function TraderScreen({ screen, go }) {
  if (screen === "home") return <TraderHome go={go} />;
  if (screen === "details") return <TraderDetails />;
  if (screen === "deals") return <><Seg options={["Активные", "Завершённые", "Споры"]} value="Активные" onChange={() => {}} /><PaymentsList items={PM.payments.map((p) => ({ ...p, m: null }))} merchantCol={false} /></>;
  return <Placeholder />;
}
function Placeholder() { return <div className="card card--pad empty"><Ic n="grid" s={28} /><span>Экран в следующей итерации</span></div>; }
Object.assign(window, { MERCHANT_TILES, TRADER_TILES, MerchantScreen, TraderScreen, Placeholder });
