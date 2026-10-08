// Paymania — Admin screens
const ADMIN_TILES = [
  { id: "merchants", icon: "store", label: "Мерчанты" },
  { id: "traders", icon: "users", label: "Трейдеры" },
  { id: "payments", icon: "swap", label: "Платежи" },
  { id: "finance", icon: "wallet", label: "Финансы" },
  { id: "banks", icon: "bank", label: "Банки" },
  { id: "recon", icon: "scale", label: "Сверка" },
];

function AdminHome({ go }) {
  const [per, setPer] = React.useState("24h");
  const k = per === "24h" ? 1 : per === "7d" ? 6.4 : 26;
  return (
    <div className="grid-home">
      <div className="col">
        <Balance label="Профит платформы" value={pmFmt(42680.4)} today={412.86} />
        <Tiles items={ADMIN_TILES} onPick={go} />
        <Block title="Ожидания / споры" right={<button className="qbtn">?</button>}>
          <div className="card card--pad">
            <div className="row-sb"><b className="big">14<span className="t-mute">/3</span></b><span className="t-mute">$1 240</span></div>
            <Progress parts={[{ v: 78, c: "var(--warn)" }, { v: 16, c: "var(--neg)" }]} />
            <div className="row-sb sm"><span>Ожидают <b className="t-warn">14</b></span><span>Споры <b className="t-neg">3</b></span></div>
          </div>
        </Block>
      </div>
      <div className="col">
        <Block title="Статистика" right={<Seg options={["24h", "7d", "30d"]} value={per} onChange={setPer} />}>
          <div className="card card--pad stack">
            <KV l="Доля платформы" lv={pmUsd(1240 * k)} lTone="pos" r="Обработано" rv={pmUsd(41300 * k)} />
            <KV l="Конверсия" lv="29,6%" r="Средний чек" rv="$41" />
          </div>
          <Fold icon="down" iconTone="pos" title="Вход" count={Math.round(312 * k)} open>
            <div className="mini-row"><span className="cur">₽</span>RUB <small>{Math.round(298 * k)}</small><b>{pmUsd(39100 * k)}</b></div>
            <div className="mini-row"><span className="cur">₸</span>KZT <small>{Math.round(14 * k)}</small><b>{pmUsd(1180 * k)}</b></div>
          </Fold>
          <Fold icon="up" iconTone="warn" title="Выход" count={Math.round(41 * k)}>
            <div className="mini-row"><span className="cur">₽</span>RUB <small>{Math.round(41 * k)}</small><b>{pmUsd(8200 * k)}</b></div>
          </Fold>
        </Block>
        <Block title="Аналитика" right={<span className="t-mute sm">по дням</span>}>
          <div className="card card--pad"><Bars data={[31, 38, 29, 34, 22, 27, 41]} labels={["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]} hi={6} /></div>
        </Block>
      </div>
    </div>
  );
}

function PeopleList({ items, kind }) {
  const [f, setF] = React.useState("all");
  const list = items.filter((x) => f === "all" || (f === "on" ? x.status === "active" : x.status !== "active"));
  return (
    <>
      <Tiles cols={3} active={f} onPick={setF} items={[{ id: "all", icon: "list", label: "Все" }, { id: "on", icon: "check", label: "Вкл." }, { id: "off", icon: "close", label: "Выкл." }]} />
      <Search placeholder={kind === "m" ? "Поиск мерчанта…" : "Поиск трейдера…"} />
      <div className="people">
        {list.map((x) => {
          const st = PM_MST[x.status];
          return (
            <div key={x.id} className="person">
              <Avatar name={x.name} />
              <div className="person__b">
                <b>{x.name}</b>
                <span className={"t-" + st[0] + " person__st"}>{st[1]}</span>
                <span className="t-mute sm">{kind === "m" ? "Подключён с " + x.joined : x.team + " · рейтинг " + x.rating.toFixed(2).replace(".", ",")}</span>
                <span className="t-mute sm">Баланс: <b className="t-ink">{pmUsd(kind === "m" ? x.balance : x.working, 1)}</b></span>
              </div>
              <span className="person__id">{x.id}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function AdminFinance() {
  const own = 42680.4, flowIn = 24800, flowOut = 19450;
  const tr = PM.traders.reduce((s, t) => s + t.working, 0), lk = PM.traders.reduce((s, t) => s + t.locked, 0);
  const mb = PM.merchants.reduce((s, m) => s + m.balance, 0);
  const pay = 16483.77;
  const Big = ({ l, v, sub, tone }) => <div className={"fig" + (tone ? " fig--" + tone : "")}><span>{l}</span><b>{v}</b>{sub && <small>{sub}</small>}</div>;
  return (
    <div className="stack-lg">
      <div className="figs figs--3">
        <Big tone="acc" l="Кешфлоу сегодня" v={pmUsd(flowIn - flowOut, 2)} sub={"депозиты " + pmUsd(flowIn) + " − выводы " + pmUsd(flowOut)} />
        <Big l="Накопленный профит" v={pmUsd(own, 2)} sub="на балансе платформы" />
        <Big l="Резерв" v={pmUsd(own + tr + mb + lk, 2)} sub="профит + обязательства" />
      </div>
      <Block title="Сегодня">
        <div className="figs figs--3">
          <Big l="Профит" v={pmUsd(pay * 0.007 + 120, 2)} sub="0,71% от оборота" />
          <Big l="Получено от трейдеров" v={pmUsd(pay * 0.917, 2)} sub={"− трейдеры 7,5% − тимлиды 0,8%"} />
          <Big l="Задолженность мерчантам" v={pmUsd(pay * 0.91, 2)} sub={"− мерчант 9,5% + рефералы 0,5%"} />
        </div>
      </Block>
      <Block title="Балансы">
        <div className="card list">
          <div className="li"><span className="sq sq--mute"><Ic n="users" s={18} /></span><b>Трейдеры и провайдеры</b><span className="li__r"><b>{pmUsd(tr, 2)}</b><small>❄ {pmUsd(lk, 2)}</small></span></div>
          <div className="li"><span className="sq sq--mute"><Ic n="store" s={18} /></span><b>Мерчанты</b><span className="li__r"><b>{pmUsd(mb, 2)}</b><small>❄ $1 200</small></span></div>
          <div className="li"><span className="sq sq--mute"><Ic n="shield" s={18} /></span><b>Баланс платформы</b><span className="li__r"><b className="t-neg">−{pmUsd(mb + tr + lk, 2)}</b><small>обязательства</small></span></div>
        </div>
      </Block>
    </div>
  );
}

function AdminBanks() {
  return (
    <div className="stack-lg">
      <Block title="Курсы">
        <div className="stack-sm">{PM.rates.map((r) => <button key={r.c} className="card nav-row"><b>{r.c}</b><span className="t-mute">{r.src}</span><span className="t-ink mono">{pmFmt(r.v, r.v < 10 ? 4 : 2)}</span><Ic n="chevR" s={18} /></button>)}</div>
      </Block>
      <Block title="Банки" count={PM.banks.length}>
        <div className="row-gap">
          <button className="btn btn--ghost"><Ic n="copy" s={18} />Скопировать JSON</button>
          <button className="btn btn--acc"><Ic n="plus" s={18} />Добавить банк</button>
        </div>
        <Search placeholder="Поиск банка…" />
        <div className="card list">
          {PM.banks.map((b) => (
            <div key={b.id} className="li">
              <i className="dot" style={{ background: `oklch(0.66 0.15 ${b.hue})` }}></i>
              <div className="li__b"><b>{b.id}</b><small>{b.name}</small></div>
              <span className="li__tags">{b.sbp && <Pill>СБП</Pill>}{b.card && <Pill>Карта</Pill>}{b.sms && <Pill tone="acc">SMS</Pill>}{b.push && <Pill tone="acc">Push</Pill>}</span>
            </div>
          ))}
        </div>
      </Block>
    </div>
  );
}

function PaymentsList({ items, merchantCol = true }) {
  return (
    <div className="card list">
      {items.map((p) => {
        const st = PM_ST[p.st];
        return (
          <div key={p.id} className="li">
            <span className={"sq sq--" + st[0]}><Ic n={p.st === "ok" ? "check" : p.st === "wait" ? "more" : "alert"} s={17} w={2.4} /></span>
            <div className="li__b"><b>{p.method}{merchantCol && p.m ? " · " + p.m : ""}{p.bank ? " · " + p.bank : ""}</b><small><span className="mono">…{p.id}</span> · {p.t} · <span className={"t-" + st[0]}>{st[1]}</span></small></div>
            <span className="li__r"><b className="mono">₽{pmFmt(p.rub, 0)}</b><small>{pmUsd(p.rub / PM.RATE, 2)}</small></span>
          </div>
        );
      })}
    </div>
  );
}

function AdminScreen({ screen, go }) {
  if (screen === "home") return <AdminHome go={go} />;
  const map = {
    merchants: <PeopleList items={PM.merchants} kind="m" />,
    traders: <PeopleList items={PM.traders} kind="t" />,
    payments: <><Search placeholder="ID платежа, сумма, реквизит…" /><PaymentsList items={PM.payments} /></>,
    finance: <AdminFinance />,
    banks: <AdminBanks />,
    recon: <AdminFinance />,
  };
  return map[screen] || null;
}
Object.assign(window, { ADMIN_TILES, AdminScreen, PaymentsList });
