// ── Справочник банков — SMS/Push шаблоны и deeplinks ────────────────────────
const BANKS_DIR = [
  {
    code: "alfa_bank",
    name: "Alfa Bank",
    country: "RU",
    paymentMethods: [
      "Card",
      "RuFpsPhone"
    ],
    sourceTemplates: [
      {
        channel: "Sms",
        senders: [
          "Alfa-Bank",
          "A-Business"
        ]
      },
      {
        channel: "Push",
        senders: [
          "ru.alfabank.mobile.android",
          "ru.alfabank.oavdo.amc"
        ]
      }
    ],
    messageTemplates: [
      {
        name: "Alfa SMS card credit",
        channel: "Sms",
        bodyPattern: "Пополнение\\s*\\*(?<cardLast4>\\d{4})\\s*на\\s*(?<amount>[\\d\\s.,]+)\\s*р",
        currency: "RUB",
        paymentMethod: "Card",
        priority: 100,
        isActive: true
      }
    ],
    samples: [
      {
        channel: "Sms",
        source: "Alfa-Bank",
        text: "Пополнение *6718 на 8645р Баланс: 8645р",
        expectAmount: "8645",
        expectCardLast4: "6718"
      },
      {
        channel: "Sms",
        source: "Alfa-Bank",
        text: "Пополнение *6718 на 5814р Баланс: 14360р",
        expectAmount: "5814",
        expectCardLast4: "6718"
      }
    ],
    deeplinkTemplates: [
      {
        name: "Alfa iOS Card · kluch",
        platform: "Ios",
        paymentMethod: "Card",
        uriTemplate: "kluch://card_to_card?recipientCardNumber={card}",
        scope: "Any",
        country: null,
        priority: 100,
        isActive: true
      },
      {
        name: "Alfa iOS Card · alfoto",
        platform: "Ios",
        paymentMethod: "Card",
        uriTemplate: "alfoto://card_to_card?recipientCardNumber={card}",
        scope: "Any",
        country: null,
        priority: 99,
        isActive: true
      },
      {
        name: "Alfa iOS Card · splitactivities",
        platform: "Ios",
        paymentMethod: "Card",
        uriTemplate: "splitactivities://card_to_card?recipientCardNumber={card}",
        scope: "Any",
        country: null,
        priority: 98,
        isActive: true
      },
      {
        name: "Alfa iOS Card · smartfinancementor",
        platform: "Ios",
        paymentMethod: "Card",
        uriTemplate: "smartfinancementor://card_to_card?recipientCardNumber={card}",
        scope: "Any",
        country: null,
        priority: 97,
        isActive: true
      },
      {
        name: "Alfa iOS Card · assistmekz",
        platform: "Ios",
        paymentMethod: "Card",
        uriTemplate: "assistmekz://card_to_card?recipientCardNumber={card}",
        scope: "Any",
        country: null,
        priority: 96,
        isActive: true
      },
      {
        name: "Alfa iOS Card · cashline",
        platform: "Ios",
        paymentMethod: "Card",
        uriTemplate: "cashline://card_to_card?recipientCardNumber={card}",
        scope: "Any",
        country: null,
        priority: 95,
        isActive: true
      },
      {
        name: "Alfa iOS Card · triptally",
        platform: "Ios",
        paymentMethod: "Card",
        uriTemplate: "triptally://card_to_card?recipientCardNumber={card}",
        scope: "Any",
        country: null,
        priority: 94,
        isActive: true
      },
      {
        name: "Alfa iOS Card · kittycash",
        platform: "Ios",
        paymentMethod: "Card",
        uriTemplate: "kittycash://card_to_card?recipientCardNumber={card}",
        scope: "Any",
        country: null,
        priority: 93,
        isActive: true
      },
      {
        name: "Alfa iOS Card · aconcierge",
        platform: "Ios",
        paymentMethod: "Card",
        uriTemplate: "aconcierge://card_to_card?recipientCardNumber={card}",
        scope: "Any",
        country: null,
        priority: 92,
        isActive: true
      },
      {
        name: "Alfa iOS Card · alfabank",
        platform: "Ios",
        paymentMethod: "Card",
        uriTemplate: "alfabank://card_to_card?recipientCardNumber={card}",
        scope: "Any",
        country: null,
        priority: 91,
        isActive: true
      },
      {
        name: "Alfa iOS Card · a-interior",
        platform: "Ios",
        paymentMethod: "Card",
        uriTemplate: "a-interior://card_to_card?recipientCardNumber={card}",
        scope: "Any",
        country: null,
        priority: 90,
        isActive: true
      },
      {
        name: "Alfa Android Card",
        platform: "Android",
        paymentMethod: "Card",
        uriTemplate: "alfabank://card_to_card?recipientCardNumber={card}",
        scope: "Any",
        country: null,
        priority: 100,
        isActive: true
      },
      {
        name: "Alfa iOS SBP RU · kluch",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "kluch://external_phone_transfer?recipientPhoneNumber={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 100,
        isActive: true
      },
      {
        name: "Alfa iOS SBP RU · alfoto",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "alfoto://external_phone_transfer?recipientPhoneNumber={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 99,
        isActive: true
      },
      {
        name: "Alfa iOS SBP RU · splitactivities",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "splitactivities://external_phone_transfer?recipientPhoneNumber={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 98,
        isActive: true
      },
      {
        name: "Alfa iOS SBP RU · smartfinancementor",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "smartfinancementor://external_phone_transfer?recipientPhoneNumber={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 97,
        isActive: true
      },
      {
        name: "Alfa iOS SBP RU · assistmekz",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "assistmekz://external_phone_transfer?recipientPhoneNumber={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 96,
        isActive: true
      },
      {
        name: "Alfa iOS SBP RU · cashline",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "cashline://external_phone_transfer?recipientPhoneNumber={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 95,
        isActive: true
      },
      {
        name: "Alfa iOS SBP RU · triptally",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "triptally://external_phone_transfer?recipientPhoneNumber={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 94,
        isActive: true
      },
      {
        name: "Alfa iOS SBP RU · kittycash",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "kittycash://external_phone_transfer?recipientPhoneNumber={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 93,
        isActive: true
      },
      {
        name: "Alfa iOS SBP RU · aconcierge",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "aconcierge://external_phone_transfer?recipientPhoneNumber={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 92,
        isActive: true
      },
      {
        name: "Alfa iOS SBP RU · alfabank",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "alfabank://external_phone_transfer?recipientPhoneNumber={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 91,
        isActive: true
      },
      {
        name: "Alfa iOS SBP RU · a-interior",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "a-interior://external_phone_transfer?recipientPhoneNumber={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 90,
        isActive: true
      },
      {
        name: "Alfa Android SBP RU",
        platform: "Android",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "alfabank://external_phone_transfer?recipientPhoneNumber={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 100,
        isActive: true
      },
      {
        name: "Alfa Web SBP RU",
        platform: "Web",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "https://web.alfabank.ru/transfers/phone?recipientPhoneNumber={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 100,
        isActive: true
      },
      {
        name: "Alfa iOS SBP Foreign · kluch",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "kluch://external_phone_transfer?recipientPhoneNumber={phone}&flow=INTERNATIONAL_FAST_PAY",
        scope: "Foreign",
        country: "RU",
        priority: 100,
        isActive: true
      },
      {
        name: "Alfa iOS SBP Foreign · alfabank",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "alfabank://external_phone_transfer?recipientPhoneNumber={phone}&flow=INTERNATIONAL_FAST_PAY",
        scope: "Foreign",
        country: "RU",
        priority: 99,
        isActive: true
      },
      {
        name: "Alfa Android SBP Foreign",
        platform: "Android",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "alfabank://external_phone_transfer?recipientPhoneNumber={phone}&flow=INTERNATIONAL_FAST_PAY",
        scope: "Foreign",
        country: "RU",
        priority: 100,
        isActive: true
      },
      {
        name: "Alfa Web SBP Foreign",
        platform: "Web",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "https://web.alfabank.ru/transfers/phone?recipientPhoneNumber={phone}",
        scope: "Foreign",
        country: "RU",
        priority: 100,
        isActive: true
      }
    ]
  },
  {
    code: "sberbank",
    name: "Sberbank",
    country: "RU",
    paymentMethods: [
      "Card",
      "RuFpsPhone"
    ],
    sourceTemplates: [
      {
        channel: "Sms",
        senders: [
          "900",
          "SBERBANK"
        ]
      },
      {
        channel: "Push",
        senders: [
          "ru.sberbankmobile"
        ]
      }
    ],
    messageTemplates: [
      {
        name: "Sber SMS card credit",
        channel: "Sms",
        bodyPattern: "СЧЁТ\\*(?<cardLast4>\\d{4})\\s+зачисление\\s+(?<amount>[\\d\\s.,]+)р",
        currency: "RUB",
        paymentMethod: "Card",
        priority: 100,
        isActive: true
      },
      {
        name: "Sber push SBP credit",
        channel: "Push",
        titlePattern: "СБП",
        bodyPattern: "Перевод\\s+(?<amount>[\\d\\s.,]+)\\s*₽\\s+от\\s+(?<senderName>.+)",
        currency: "RUB",
        paymentMethod: "RuFpsPhone",
        priority: 90,
        isActive: true
      }
    ],
    samples: [
      {
        channel: "Sms",
        source: "900",
        text: "СЧЁТ*4412 зачисление 12 500р от Иван И. Баланс: 15 302р",
        expectAmount: "12 500",
        expectCardLast4: "4412"
      }
    ],
    deeplinkTemplates: [
      {
        name: "Sber iOS Card · sbolonline",
        platform: "Ios",
        paymentMethod: "Card",
        uriTemplate: "sbolonline://cardtocard?to={card}",
        scope: "Any",
        country: null,
        priority: 100,
        isActive: true
      },
      {
        name: "Sber iOS Card · btripsexpenses",
        platform: "Ios",
        paymentMethod: "Card",
        uriTemplate: "btripsexpenses://cardtocard?to={card}",
        scope: "Any",
        country: null,
        priority: 99,
        isActive: true
      },
      {
        name: "Sber Android Card",
        platform: "Android",
        paymentMethod: "Card",
        uriTemplate: "android-app://ru.sberbankmobile/cardtocard?to={card}",
        scope: "Any",
        country: null,
        priority: 100,
        isActive: true
      },
      {
        name: "Sber iOS SBP RU",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "sbolonline://p2ptransfer?phone={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 100,
        isActive: true
      }
    ]
  },
  {
    code: "t_bank",
    name: "T-Bank",
    country: "RU",
    paymentMethods: [
      "Card",
      "RuFpsPhone"
    ],
    sourceTemplates: [
      {
        channel: "Sms",
        senders: [
          "T-Bank",
          "Tinkoff"
        ]
      },
      {
        channel: "Push",
        senders: [
          "com.idamob.tinkoff.android"
        ]
      }
    ],
    messageTemplates: [
      {
        name: "T-Bank SMS credit",
        channel: "Sms",
        bodyPattern: "Пополнение,\\s+счет\\s+RUB\\.\\s+(?<amount>[\\d\\s.,]+)\\s*RUB",
        currency: "RUB",
        paymentMethod: "Card",
        priority: 100,
        isActive: true
      }
    ],
    samples: [
      {
        channel: "Sms",
        source: "T-Bank",
        text: "Пополнение, счет RUB. 4 300 RUB. Доступно 9 512 RUB",
        expectAmount: "4 300"
      }
    ],
    deeplinkTemplates: [
      {
        name: "T-Bank iOS SBP RU",
        platform: "Ios",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "tinkoffbank://Main/PayByMobileNumber?numberPhone={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 100,
        isActive: true
      },
      {
        name: "T-Bank Android SBP RU",
        platform: "Android",
        paymentMethod: "RuFpsPhone",
        uriTemplate: "tinkoffbank://Main/PayByMobileNumber?numberPhone={phone}",
        scope: "Domestic",
        country: "RU",
        priority: 100,
        isActive: true
      }
    ]
  },
  {
    code: "vtb",
    name: "VTB",
    country: "RU",
    paymentMethods: [
      "Card"
    ],
    sourceTemplates: [
      {
        channel: "Sms",
        senders: [
          "VTB"
        ]
      }
    ],
    messageTemplates: [],
    samples: [],
    deeplinkTemplates: [
      {
        name: "VTB iOS Card",
        platform: "Ios",
        paymentMethod: "Card",
        uriTemplate: "vtb24privatebanking://transfers/card?to={card}",
        scope: "Any",
        country: null,
        priority: 100,
        isActive: true
      }
    ]
  }
];

const BANK_CHANNELS = [{ value: "Sms", label: "Sms" }, { value: "Push", label: "Push" }];
const BANK_PLATFORMS = [{ value: "Ios", label: "Ios" }, { value: "Android", label: "Android" }, { value: "Web", label: "Web" }];
const BANK_CURRENCIES = [{ value: "RUB", label: "RUB" }, { value: "USD", label: "USD" }, { value: "EUR", label: "EUR" }, { value: "KZT", label: "KZT" }, { value: "UZS", label: "UZS" }];
const BANK_SCOPES = [{ value: "Any", label: "Any" }, { value: "Domestic", label: "Domestic" }, { value: "Foreign", label: "Foreign" }];
const BANK_COUNTRIES = [{ value: "", label: "—" }, { value: "RU", label: "RU" }, { value: "KZ", label: "KZ" }, { value: "UZ", label: "UZ" }, { value: "AZ", label: "AZ" }, { value: "TR", label: "TR" }];

const BANK_METHOD_CLASS = { Card: "card", RuFpsPhone: "sbp" };
const BANK_METHOD_LABEL_MAP = { Card: "Карта", RuFpsPhone: "СБП" };
function BankMethodBadge({ m }) {
  return <span className={"pd-card__method pd-card__method--" + (BANK_METHOD_CLASS[m] || "card")}>{BANK_METHOD_LABEL_MAP[m] || m}</span>;
}
function BankYesNo({ on, label }) {
  return on ? <span className="pd-card__method" style={{ background: "var(--paper-2)", color: "var(--ink-2)" }}>{label}</span> : null;
}
function bankMethodOptions(bank) { return bank.paymentMethods.map((m) => ({ value: m, label: m })); }

function BankTplCard({ children, onRemove }) {
  return (
    <div style={{ border: "1px solid var(--line-2)", borderRadius: "var(--radius)", padding: 14, background: "var(--paper-2)", marginBottom: 12, position: "relative" }}>
      {onRemove && <button className="btn btn--ghost btn--sm" style={{ position: "absolute", top: 10, right: 10 }} onClick={onRemove} title="Удалить">✕</button>}
      {children}
    </div>
  );
}

function BankMessagesTab({ bank, update }) {
  const setTpl = (i, patch) => update({ messageTemplates: bank.messageTemplates.map((t, ix) => ix === i ? { ...t, ...patch } : t) });
  const addTpl = () => update({ messageTemplates: [...bank.messageTemplates, { name: "Новый шаблон", channel: "Sms", bodyPattern: "", currency: "RUB", paymentMethod: null, priority: 0, isActive: true }] });
  const delTpl = (i) => update({ messageTemplates: bank.messageTemplates.filter((_, ix) => ix !== i) });
  return (
    <>
      <Section title={`Шаблоны сообщений (${bank.messageTemplates.length})`} action={<Btn variant="primary" size="sm" style={{ whiteSpace: "nowrap", flexShrink: 0 }} onClick={addTpl}>＋ Шаблон</Btn>}>
        <Note tone="neutral">Regex-шаблоны разбора SMS/push. Именованные группы: <code>amount</code>, <code>cardLast4</code>, <code>senderName</code>.</Note>
        <div style={{ marginTop: 12 }}>
          {bank.messageTemplates.length === 0 && <div className="muted" style={{ fontSize: 13 }}>Шаблонов нет — сообщения этого банка не разбираются.</div>}
          {bank.messageTemplates.map((t, i) => (
            <BankTplCard key={i} onRemove={() => delTpl(i)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, paddingRight: 44 }}>
                <span className={"chip" + (t.isActive !== false ? " chip--active" : "")} style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => setTpl(i, { isActive: t.isActive === false })}>{t.isActive !== false ? "Активен" : "Выключен"}</span>
              </div>
              <div className="row-2">
                <Field label="Название"><TextInput value={t.name} onChange={(v) => setTpl(i, { name: v })} /></Field>
                <Field label="Приоритет"><TextInput value={String(t.priority)} mono onChange={(v) => setTpl(i, { priority: parseInt(v, 10) || 0 })} /></Field>
              </div>
              <div className="row-2">
                <Field label="Канал"><Select value={t.channel} onChange={(v) => setTpl(i, { channel: v })} options={BANK_CHANNELS} /></Field>
                <Field label="Валюта"><Select value={t.currency || "RUB"} onChange={(v) => setTpl(i, { currency: v })} options={BANK_CURRENCIES} /></Field>
              </div>
              <Field label="Метод (опционально)" hint="Пусто — шаблон применяется для любого метода">
                <Select value={t.paymentMethod || ""} onChange={(v) => setTpl(i, { paymentMethod: v || null })} options={[{ value: "", label: "Любой" }, ...bankMethodOptions(bank)]} />
              </Field>
              <Field label="Title pattern (опционально)" hint="Regex заголовка push-уведомления">
                <TextInput value={t.titlePattern || ""} mono placeholder="не задан" onChange={(v) => setTpl(i, { titlePattern: v || null })} />
              </Field>
              <Field label="Body pattern (regex)">
                <textarea className="field__input" rows={2} style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, resize: "vertical" }} value={t.bodyPattern} onChange={(e) => setTpl(i, { bodyPattern: e.target.value })}></textarea>
              </Field>
            </BankTplCard>
          ))}
        </div>
      </Section>
      <Section title={`Примеры сообщений (${bank.samples.length})`}>
        {bank.samples.length === 0 ? <div className="muted" style={{ fontSize: 13 }}>Примеров нет.</div> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Канал</th><th>Отправитель</th><th>Текст</th><th className="num">amount</th><th className="num">card</th></tr></thead>
            <tbody>
              {bank.samples.map((s, i) => (
                <tr key={i}>
                  <td>{s.channel}</td>
                  <td className="mono">{s.source}</td>
                  <td style={{ fontSize: 12.5 }}>{s.text}</td>
                  <td className="num mono">{s.expectAmount || "—"}</td>
                  <td className="num mono">{s.expectCardLast4 || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </Section>
    </>
  );
}

function BankDeeplinksTab({ bank, update }) {
  const [sel, setSel] = React.useState(null);
  const list = bank.deeplinkTemplates;
  const setTpl = (i, patch) => update({ deeplinkTemplates: list.map((x, ix) => ix === i ? { ...x, ...patch } : x) });
  const addTpl = () => { update({ deeplinkTemplates: [...list, { name: "Новый deeplink", platform: "Ios", paymentMethod: bank.paymentMethods[0] || "Card", uriTemplate: "", scope: "Any", country: null, priority: 0, isActive: true }] }); setSel(list.length); };
  const delTpl = (i) => { update({ deeplinkTemplates: list.filter((_, ix) => ix !== i) }); setSel(null); };
  const tt = sel != null ? list[sel] : null;
  return (
    <Section title={`Deeplink-шаблоны (${list.length})`} action={<Btn variant="primary" size="sm" style={{ whiteSpace: "nowrap", flexShrink: 0 }} onClick={addTpl}>＋ Deeplink</Btn>}>
      <Note tone="neutral">Один шаблон — один URI. Плейсхолдеры: <code>{"{card}"}</code>, <code>{"{phone}"}</code>. Клиент пробует шаблоны по убыванию приоритета. Кликните строку для редактирования.</Note>
      {tt && (
        <BankTplCard onRemove={() => delTpl(sel)}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, paddingRight: 44 }}>
            <span className={"chip" + (tt.isActive !== false ? " chip--active" : "")} style={{ cursor: "pointer" }} onClick={() => setTpl(sel, { isActive: tt.isActive === false })}>{tt.isActive !== false ? "Активен" : "Выключен"}</span>
            <button className="btn btn--ghost btn--sm" style={{ marginLeft: "auto", marginRight: 28 }} onClick={() => setSel(null)}>Свернуть</button>
          </div>
          <div className="row-2">
            <Field label="Название"><TextInput value={tt.name} onChange={(v) => setTpl(sel, { name: v })} /></Field>
            <Field label="Приоритет"><TextInput value={String(tt.priority)} mono onChange={(v) => setTpl(sel, { priority: parseInt(v, 10) || 0 })} /></Field>
          </div>
          <div className="row-2">
            <Field label="Платформа"><Select value={tt.platform} onChange={(v) => setTpl(sel, { platform: v })} options={BANK_PLATFORMS} /></Field>
            <Field label="Метод"><Select value={tt.paymentMethod} onChange={(v) => setTpl(sel, { paymentMethod: v })} options={bankMethodOptions(bank)} /></Field>
          </div>
          <div className="row-2">
            <Field label="Scope"><Select value={tt.scope || "Any"} onChange={(v) => setTpl(sel, { scope: v })} options={BANK_SCOPES} /></Field>
            <Field label="Страна (опционально)"><Select value={tt.country || ""} onChange={(v) => setTpl(sel, { country: v || null })} options={BANK_COUNTRIES} /></Field>
          </div>
          <Field label="URI template">
            <TextInput value={tt.uriTemplate} mono onChange={(v) => setTpl(sel, { uriTemplate: v })} placeholder="scheme://path?param={card}" />
          </Field>
        </BankTplCard>
      )}
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table className="table">
          <thead><tr>
            <th>Название</th><th>Платформа</th><th>Метод</th><th>Scope</th><th className="num">Приоритет</th><th>URI</th>
          </tr></thead>
          <tbody>
            {list.map((d, i) => (
              <tr key={i} className="row-click" onClick={() => setSel(i)} style={{ opacity: d.isActive === false ? 0.45 : 1, background: sel === i ? "var(--paper-2)" : undefined }}>
                <td>{d.name}</td>
                <td>{d.platform}</td>
                <td><BankMethodBadge m={d.paymentMethod} /></td>
                <td>{(d.scope || "Any") + (d.country ? " · " + d.country : "")}</td>
                <td className="num mono">{d.priority}</td>
                <td className="mono" style={{ fontSize: 11.5, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.uriTemplate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

const BANK_ALL_METHODS = ["Card", "RuFpsPhone"];

function BankOverviewTab({ bank, update }) {
  const setSrc = (i, senders) => update({ sourceTemplates: bank.sourceTemplates.map((s, ix) => ix === i ? { ...s, senders } : s) });
  const toggleMethod = (m) => update({ paymentMethods: bank.paymentMethods.includes(m) ? bank.paymentMethods.filter((x) => x !== m) : [...bank.paymentMethods, m] });
  return (
    <>
      <Section title="Банк">
        <KV items={[
          ["Код", <span className="mono">{bank.code}</span>],
          ["Название", <strong>{bank.name}</strong>],
          ["Страна", bank.country || "—"],
          ["Методы", (
            <div className="chips" style={{ padding: 0 }}>
              {BANK_ALL_METHODS.map((m) => (
                <span key={m} className={"chip" + (bank.paymentMethods.includes(m) ? " chip--active" : "")} style={{ cursor: "pointer" }} onClick={() => toggleMethod(m)}>
                  {BANK_METHOD_LABEL_MAP[m] || m}
                </span>
              ))}
            </div>
          )],
        ]} />
      </Section>
      <Section title="Источники (senders)">
        <Note tone="neutral">Отправители SMS и package id push-уведомлений, по которым сообщения относятся к этому банку. Один на строку.</Note>
        <div style={{ marginTop: 12 }}>
          {bank.sourceTemplates.map((s, i) => (
            <Field key={s.channel} label={s.channel === "Sms" ? "SMS отправители" : "Push package id"}>
              <textarea className="field__input" rows={Math.max(2, s.senders.length)} style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, resize: "vertical" }} value={s.senders.join("\n")} onChange={(e) => setSrc(i, e.target.value.split("\n").filter((x) => x.trim() !== ""))}></textarea>
            </Field>
          ))}
        </div>
      </Section>
    </>
  );
}

function BankDrawer({ bank, update, onClose }) {
  const [tab, setTab] = React.useState("overview");
  return (
    <Drawer title={bank.name} id={bank.code} onClose={onClose} wide>
      <Tabs
        tabs={[
          { id: "overview", label: "Обзор" },
          { id: "messages", label: `Шаблоны SMS/Push (${bank.messageTemplates.length})` },
          { id: "deeplinks", label: `Deeplinks (${bank.deeplinkTemplates.length})` },
        ]}
        value={tab} onChange={setTab}
      />
      {tab === "overview" && <BankOverviewTab bank={bank} update={update} />}
      {tab === "messages" && <BankMessagesTab bank={bank} update={update} />}
      {tab === "deeplinks" && <BankDeeplinksTab bank={bank} update={update} />}
    </Drawer>
  );
}

function SectionBanks() {
  const [banks, setBanks] = React.useState(BANKS_DIR);
  const [openCode, setOpenCode] = React.useState(null);
  const [q, setQ] = React.useState("");
  const open = banks.find((b) => b.code === openCode);
  const update = (patch) => setBanks((list) => list.map((b) => b.code === openCode ? { ...b, ...patch } : b));
  const visible = banks.filter((b) => !q.trim() || (b.name + " " + b.code).toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <PageHead title="Справочник банков" sub="Шаблоны разбора SMS/push и deeplink-схемы банковских приложений" />
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14, maxWidth: 320 }}>
        <TextInput value={q} onChange={setQ} placeholder="Поиск по названию или коду" />
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>Банк</th><th>Код</th><th>Страна</th><th>Методы</th>
            <th>Senders</th><th>Шаблоны SMS/Push</th><th>Deeplinks</th>
          </tr></thead>
          <tbody>
            {visible.map((b) => (
              <tr key={b.code} className="row-click" onClick={() => setOpenCode(b.code)}>
                <td><strong>{b.name}</strong></td>
                <td className="mono">{b.code}</td>
                <td>{b.country || "—"}</td>
                <td><span style={{ display: "inline-flex", gap: 6 }}>{b.paymentMethods.map((m) => <BankMethodBadge key={m} m={m} />)}</span></td>
                <td>{(() => { const has = (ch) => b.sourceTemplates.some((s) => s.channel === ch && s.senders.length > 0); return (has("Sms") || has("Push")) ? <span style={{ display: "inline-flex", gap: 6 }}><BankYesNo on={has("Sms")} label="SMS" /><BankYesNo on={has("Push")} label="PUSH" /></span> : <span className="muted">—</span>; })()}</td>
                <td>{b.messageTemplates.length > 0 ? <span className="pd-card__method" style={{ background: "var(--paper-2)", color: "var(--ink-2)" }}>Есть</span> : <span className="muted">—</span>}</td>
                <td>{b.deeplinkTemplates.length > 0 ? <span className="pd-card__method" style={{ background: "var(--paper-2)", color: "var(--ink-2)" }}>Есть</span> : <span className="muted">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && <BankDrawer bank={open} update={update} onClose={() => setOpenCode(null)} />}
    </>
  );
}

Object.assign(window, { SectionBanks, BANKS_DIR });
