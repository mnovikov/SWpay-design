// CrowdPay Trader App — mock data + status maps
// Соответствует постановке P2P-процессинга v4 (M.Novikov, 30.04.2026)
// Один трейдер: Алексей Морозов. Балансы в USDT, обороты в RUB.

// ─── Banks ──────────────────────────────────────────────────────────────────
const BANKS = [
  { id: "B-A", name: "Bank A", short: "A" },
  { id: "B-B", name: "Bank B", short: "B" },
  { id: "B-C", name: "Bank C", short: "C" },
  { id: "B-D", name: "Bank D", short: "D" },
];

// ─── Trader (себя) ──────────────────────────────────────────────────────────
const ME = {
  id: "TR-1042",
  name: "Алексей Морозов",
  status: "active",
  rating: 4.82,
  team: "Альфа",
  email: "alex.morozov@crowdpay.demo",
  phone: "+7 900 123-45-67",
  registered: "12.03.2024",
  tariff: "Стандарт",
  rights: { payIn: true, payOut: true },
  notes: "KYC пройден, проверенный",
  // курс для отображения USDT↔RUB
  usdtRate: 92.4,
};

// ─── Балансы трейдера (USDT) ────────────────────────────────────────────────
const BALANCES = {
  working: {           // Рабочий баланс
    amount: 4280.50,   // USDT
    currency: "USDT",
    rubEquivalent: 395558,
    minRequired: 500,
    frozenUsdt: 850,   // заблокировано под взятые в работу заявки
  },
  insurance: {         // Страховой депозит
    amount: 2000.00,
    currency: "USDT",
    rubEquivalent: 184800,
    locked: 180,       // заморожено по спорам
    minRequired: 1000,
  },
  // оперативные показатели
  todayPayInRub: 482300,
  todayPayOutRub: 318000,
  todayCommissionUsdt: 34.6,
  monthPayInRub: 4920000,
  monthPayOutRub: 3120000,
  monthCommissionUsdt: 412.8,
};

// ─── Rating breakdown ───────────────────────────────────────────────────────
const RATING = {
  score: 4.82,
  trend: +0.04,
  factors: [
    { id: "payin-success",  label: "Конверсия Платежей",       value: "97%",     impact: +0.8, weight: 0.25 },
    { id: "payout-success", label: "Успешность Выплат",        value: "94%",     impact: +0.4, weight: 0.20 },
    { id: "payout-speed",   label: "Скорость Выплат",          value: "ср. 4:12",impact: +0.3, weight: 0.15 },
    { id: "disputes-lost",  label: "Проигранные споры",        value: "1 / мес", impact: -0.2, weight: 0.15 },
    { id: "uptime",         label: "Стабильность терминалов",  value: "99.2%",   impact: +0.3, weight: 0.10 },
    { id: "details-active", label: "Активные реквизиты",       value: "4 / 5",   impact: +0.2, weight: 0.10 },
    { id: "manual",         label: "Ручной приоритет",          value: "+0.0",   impact: 0,    weight: 0.05 },
  ],
  effects: [
    { label: "Объём трафика",      value: "+18% к базе" },
    { label: "Доступ к крупным",   value: "разрешён" },
    { label: "Доступ к Выплатам",  value: "разрешён" },
  ],
};

// ─── Terminals (Android-устройства) ─────────────────────────────────────────
const TERMINALS = [
  {
    id: "T-1001",
    name: "Pixel 6a",
    phone: "+7 900 123-45-67",
    status: "online",
    battery: 86,
    appVersion: "1.18.4",
    lastHeartbeat: "12 сек назад",
    detailsCount: 2,
    smsToday: 142,
    pushToday: 56,
    smsErrorsToday: 0,
    notes: "Основной",
    sms: [
      { time: "14:22:14", bank: "Bank A", parsed: true,  amount: 15000, kind: "SMS",  msg: "Перевод 15 000 ₽ от ИВАНОВ И. И. Баланс 124 580 ₽" },
      { time: "14:18:03", bank: "Bank A", parsed: true,  amount: 8500,  kind: "Push", msg: "+8 500 ₽ Перевод по СБП" },
      { time: "14:10:51", bank: "Bank A", parsed: true,  amount: 24000, kind: "Push", msg: "Зачисление 24 000 ₽" },
      { time: "13:58:44", bank: "Bank A", parsed: true,  amount: 5200,  kind: "SMS",  msg: "Перевод 5 200 ₽ от ПЕТРОВ А. А." },
      { time: "13:51:02", bank: "Bank A", parsed: false, amount: null,  kind: "SMS",  msg: "Уведомление об операции (не распознано)" },
    ],
  },
  {
    id: "T-1002",
    name: "Redmi Note 12",
    phone: "+7 901 555-10-20",
    status: "online",
    battery: 42,
    appVersion: "1.18.4",
    lastHeartbeat: "8 сек назад",
    detailsCount: 2,
    smsToday: 88,
    pushToday: 21,
    smsErrorsToday: 1,
    notes: "",
    sms: [
      { time: "14:24:11", bank: "Bank B", parsed: true,  amount: 6000,  kind: "Push", msg: "+6 000 ₽ Перевод" },
      { time: "14:00:33", bank: "Bank B", parsed: true,  amount: 11200, kind: "SMS",  msg: "Перевод 11 200 ₽" },
    ],
  },
  {
    id: "T-1003",
    name: "Резерв (старый Honor)",
    phone: "+7 902 333-44-55",
    status: "offline",
    battery: 12,
    appVersion: "1.16.0",
    lastHeartbeat: "47 мин назад",
    detailsCount: 1,
    smsToday: 0,
    pushToday: 0,
    smsErrorsToday: 0,
    notes: "Требует обновления приложения",
    offlineReason: "Heartbeat не получен > 5 мин",
    sms: [],
  },
];

// ─── Реквизиты (карты/СБП) ──────────────────────────────────────────────────
const PAYMENT_DETAILS = [
  {
    id: "PD-9001",
    label: "Сбер · Алексей · основной",
    method: "sbp",
    methods: ["sbp", "phone", "c2c"],
    bank: "B-A",
    holder: "Алексей М.",
    target: "+7 900 123-45-67",
    last4Account: "4423",
    terminal: "T-1001",
    status: "active",
    minAmount: 500,
    maxAmount: 200000,
    dailyLimit: 800000,
    dailyUsed: 0.62,
    monthlyLimit: 12000000,
    monthlyUsed: 0.41,
    opsLimit: 500,
    opsToday: 142,
    cooldown: null,
    paymentDelaySec: 90,
    todayVolumeRub: 496000,
    monthVolumeRub: 4920000,
    balanceRub: 184500,
    success: 0.98,
  },
  {
    id: "PD-9002",
    label: "Тинькофф · карта 4423",
    method: "card",
    methods: ["card"],
    bank: "B-B",
    holder: "Алексей М.",
    target: "•••• 4423",
    last4Account: "4423",
    terminal: "T-1001",
    status: "active",
    minAmount: 1000,
    maxAmount: 150000,
    dailyLimit: 600000,
    dailyUsed: 0.31,
    monthlyLimit: 8000000,
    monthlyUsed: 0.22,
    opsLimit: 400,
    opsToday: 56,
    cooldown: { remainingSec: 156, after: "PI-24006" },
    paymentDelaySec: 180,
    todayVolumeRub: 186000,
    monthVolumeRub: 1760000,
    balanceRub: 62300,
    success: 0.96,
  },
  {
    id: "PD-9003",
    label: "Альфа · резерв",
    method: "sbp",
    methods: ["sbp", "card"],
    bank: "B-A",
    holder: "Алексей М.",
    target: "+7 901 555-10-20",
    last4Account: "8821",
    terminal: "T-1002",
    status: "active",
    minAmount: 500,
    maxAmount: 180000,
    dailyLimit: 700000,
    dailyUsed: 0.45,
    monthlyLimit: 10000000,
    monthlyUsed: 0.33,
    opsLimit: 500,
    opsToday: 88,
    cooldown: null,
    paymentDelaySec: 120,
    todayVolumeRub: 315000,
    monthVolumeRub: 3300000,
    balanceRub: 128700,
    success: 0.95,
  },
  {
    id: "PD-9004",
    label: "ВТБ · карта 7711",
    method: "card",
    methods: ["card", "c2c"],
    bank: "B-B",
    holder: "Алексей М.",
    target: "•••• 7711",
    last4Account: "7711",
    terminal: "T-1002",
    status: "limit-exceeded",
    minAmount: 1000,
    maxAmount: 100000,
    dailyLimit: 500000,
    dailyUsed: 0.94,
    monthlyLimit: 7000000,
    monthlyUsed: 0.81,
    opsLimit: 400,
    opsToday: 380,
    cooldown: null,
    paymentDelaySec: 60,
    todayVolumeRub: 470000,
    monthVolumeRub: 5670000,
    balanceRub: 41200,
    success: 0.88,
    blockReason: "Дневной лимит почти исчерпан — авто-отключение по правилу limit-95%",
  },
  {
    id: "PD-9005",
    label: "Райффайзен · СБП",
    method: "sbp",
    methods: ["sbp"],
    bank: "B-C",
    holder: "Алексей М.",
    target: "+7 902 333-44-55",
    last4Account: "1102",
    terminal: "T-1003",
    status: "terminal-offline",
    minAmount: 500,
    maxAmount: 80000,
    dailyLimit: 400000,
    dailyUsed: 0,
    monthlyLimit: 5000000,
    monthlyUsed: 0,
    opsLimit: 300,
    opsToday: 0,
    cooldown: null,
    paymentDelaySec: 60,
    todayVolumeRub: 0,
    monthVolumeRub: 0,
    balanceRub: 0,
    success: 0.71,
    blockReason: "Терминал T-1003 offline > 5 мин",
  },
];

// ─── PayIn заявки ───────────────────────────────────────────────────────────
const PAY_IN = [
  { id: "PI-24001", date: "27.04 14:22", amount: 15000, currency: "RUB", merchant: "BetCity",   merchantOrder: "bc-9821", terminal: "T-1001", details: "PD-9001", bank: "B-A", status: "completed",      source: "SMS",  payTime: "00:38", commissionUsdt: 3.24, dispute: false, expiresAt: null, closedBy: "auto", closedAt: "27.04 14:22:39",
    timeline: [
      { ts: "14:22:01", event: "created",            label: "Заявка создана мерчантом BetCity" },
      { ts: "14:22:02", event: "matching",           label: "Поиск реквизита" },
      { ts: "14:22:03", event: "assigned",           label: "Закреплён реквизит PD-9001 (Bank A · СБП)" },
      { ts: "14:22:04", event: "waiting",            label: "Ожидание оплаты клиентом" },
      { ts: "14:22:39", event: "sms-detected",       label: "SMS от Bank A: +15 000 ₽" },
      { ts: "14:22:39", event: "auto-confirmed",     label: "Автоподтверждение, баланс трейдера обновлён" },
      { ts: "14:22:40", event: "merchant-callback",  label: "Webhook отправлен мерчанту" },
    ],
  },
  { id: "PI-24002", date: "27.04 14:18", amount: 8500,  currency: "RUB", merchant: "MaxBet",    merchantOrder: "mb-1244", terminal: "T-1001", details: "PD-9002", bank: "B-B", status: "waiting-payment", source: "—",    payTime: "—",     commissionUsdt: 0,    dispute: false, expiresAt: "14:33 (через 11:42)",
    timeline: [
      { ts: "14:18:11", event: "created",     label: "Заявка создана" },
      { ts: "14:18:12", event: "matching",    label: "Поиск реквизита" },
      { ts: "14:18:13", event: "assigned",    label: "Закреплён реквизит PD-9002" },
      { ts: "14:18:13", event: "waiting",     label: "Ожидание оплаты клиентом" },
    ],
  },
  { id: "PI-24003", date: "27.04 14:10", amount: 24000, currency: "RUB", merchant: "BetCity",   merchantOrder: "bc-9819", terminal: "T-1002", details: "PD-9003", bank: "B-A", status: "completed",       source: "Push", payTime: "00:21", commissionUsdt: 5.19, dispute: false, closedBy: "auto", closedAt: "27.04 14:10:21" },
  { id: "PI-24004", date: "27.04 13:58", amount: 5200,  currency: "RUB", merchant: "MaxBet",    merchantOrder: "mb-1241", terminal: "T-1001", details: "PD-9001", bank: "B-A", status: "completed",       source: "SMS",  payTime: "00:42", commissionUsdt: 1.13, dispute: false, closedBy: "manual", closedAt: "27.04 13:59:18" },
  { id: "PI-24005", date: "27.04 13:44", amount: 89200, currency: "RUB", merchant: "Casino24",  merchantOrder: "c24-512", terminal: "T-1002", details: "PD-9003", bank: "B-A", status: "disputed",        source: "SMS",  payTime: "00:55", commissionUsdt: 0,    dispute: true,
    timeline: [
      { ts: "13:44:03", event: "created",        label: "Заявка создана" },
      { ts: "13:44:11", event: "assigned",       label: "Закреплён реквизит PD-9003" },
      { ts: "13:44:58", event: "sms-detected",   label: "SMS Bank A: +89 200 ₽" },
      { ts: "13:44:58", event: "auto-confirmed", label: "Автоподтверждение" },
      { ts: "27.04 11:02", event: "dispute-opened", label: "Мерчант открыл спор: «не получили услугу»" },
    ],
  },
  { id: "PI-24006", date: "27.04 13:31", amount: 3200,  currency: "RUB", merchant: "MaxBet",    merchantOrder: "mb-1238", terminal: "T-1001", details: "PD-9002", bank: "B-B", status: "completed",       source: "Push", payTime: "00:18", commissionUsdt: 0.69, dispute: false, closedBy: "auto", closedAt: "27.04 13:31:18" },
  { id: "PI-24007", date: "27.04 13:14", amount: 51000, currency: "RUB", merchant: "BetCity",   merchantOrder: "bc-9810", terminal: "T-1002", details: "PD-9003", bank: "B-A", status: "completed",       source: "SMS",  payTime: "00:48", commissionUsdt: 11.03,dispute: false, closedBy: "manual", closedAt: "27.04 13:15:02" },
  { id: "PI-24008", date: "27.04 12:50", amount: 6700,  currency: "RUB", merchant: "Casino24",  merchantOrder: "c24-509", terminal: "T-1001", details: "PD-9001", bank: "B-A", status: "expired",         source: "—",    payTime: "—",     commissionUsdt: 0,    dispute: false,
    timeline: [
      { ts: "12:50:00", event: "created",   label: "Заявка создана" },
      { ts: "12:50:01", event: "assigned",  label: "Закреплён реквизит PD-9001" },
      { ts: "12:50:02", event: "waiting",   label: "Ожидание оплаты" },
      { ts: "13:05:00", event: "expired",   label: "Истекло время оплаты (15 мин)" },
    ],
  },
  { id: "PI-24009", date: "27.04 12:22", amount: 11200, currency: "RUB", merchant: "BetCity",   merchantOrder: "bc-9802", terminal: "T-1002", details: "PD-9003", bank: "B-A", status: "completed",       source: "SMS",  payTime: "00:25", commissionUsdt: 2.42, dispute: false, closedBy: "auto", closedAt: "27.04 12:22:25" },
  { id: "PI-24010", date: "27.04 11:48", amount: 4800,  currency: "RUB", merchant: "MaxBet",    merchantOrder: "mb-1230", terminal: "T-1001", details: "PD-9001", bank: "B-A", status: "completed",       source: "Push", payTime: "00:31", commissionUsdt: 1.04, dispute: false, closedBy: "auto", closedAt: "27.04 11:48:31" },
  { id: "PI-24011", date: "27.04 11:32", amount: 2100,  currency: "RUB", merchant: "MaxBet",    merchantOrder: "mb-1229", terminal: "T-1001", details: "PD-9001", bank: "B-A", status: "failed",          source: "—",    payTime: "—",     commissionUsdt: 0,    dispute: false,
    timeline: [
      { ts: "11:32:00", event: "created",   label: "Заявка создана" },
      { ts: "11:32:00", event: "matching",  label: "Поиск реквизита" },
      { ts: "11:32:02", event: "no-match",  label: "Нет подходящих реквизитов: cooldown PD-9001" },
      { ts: "11:32:02", event: "failed",    label: "Заявка отклонена системой" },
    ],
  },
];

// ─── PayOut заявки ──────────────────────────────────────────────────────────
const PAY_OUT = [
  // free pool — другие трейдеры тоже видят
  { id: "PO-55021", date: "27.04 14:34", amount: 18000, currency: "RUB", merchant: "BetCity",  customerBank: "B-A", customerTarget: "+7 911 111-22-33", customerName: "Иванов И. И.",   status: "free",         takenBy: null,    deadlineMin: 15, commissionUsdt: 3.89, proof: "none",   timeline: [
      { ts: "14:34:00", event: "created", label: "Заявка от мерчанта BetCity, в пуле свободных выплат" },
    ],
  },
  { id: "PO-55020", date: "27.04 14:18", amount: 42500, currency: "RUB", merchant: "Casino24", customerBank: "B-B", customerTarget: "+7 911 222-33-44", customerName: "Петров А. А.",   status: "in-progress",  takenBy: "TR-1042", deadlineMin: 8, commissionUsdt: 9.20, proof: "none",   timeline: [
      { ts: "14:18:00", event: "created",     label: "Заявка от мерчанта Casino24" },
      { ts: "14:24:11", event: "claimed",     label: "Взята в работу трейдером (вы)" },
    ],
  },
  { id: "PO-55019", date: "27.04 14:02", amount: 7800,  currency: "RUB", merchant: "BetCity",  customerBank: "B-A", customerTarget: "+7 911 333-44-55", customerName: "Сидоров К.",     status: "free",         takenBy: null,    deadlineMin: 15, commissionUsdt: 1.69, proof: "none" },
  { id: "PO-55018", date: "27.04 13:54", amount: 25000, currency: "RUB", merchant: "MaxBet",   customerBank: "B-A", customerTarget: "+7 911 444-55-66", customerName: "Кузнецов В.",    status: "waiting-review", takenBy: "TR-1042", deadlineMin: 0, commissionUsdt: 5.41, proof: "uploaded", proofTime: "13:58:42",
    timeline: [
      { ts: "13:54:00", event: "created",        label: "Заявка от мерчанта MaxBet" },
      { ts: "13:55:12", event: "claimed",        label: "Взята в работу трейдером (вы)" },
      { ts: "13:58:40", event: "transfer-done",  label: "Перевод выполнен" },
      { ts: "13:58:42", event: "proof-uploaded", label: "Чек загружен, ожидает проверки саппорта" },
    ],
  },
  { id: "PO-55017", date: "27.04 13:30", amount: 9000,  currency: "RUB", merchant: "BetCity",  customerBank: "B-B", customerTarget: "+7 911 555-66-77", customerName: "Морозов А.",     status: "completed",    takenBy: "TR-1042", deadlineMin: 0, commissionUsdt: 1.95, proof: "uploaded", proofTime: "13:34:11" },
  { id: "PO-55016", date: "27.04 13:12", amount: 14500, currency: "RUB", merchant: "Casino24", customerBank: "B-A", customerTarget: "+7 911 666-77-88", customerName: "Орлов П.",       status: "completed",    takenBy: "TR-1042", deadlineMin: 0, commissionUsdt: 3.14, proof: "uploaded" },
  { id: "PO-55015", date: "27.04 12:54", amount: 6500,  currency: "RUB", merchant: "MaxBet",   customerBank: "B-C", customerTarget: "+7 911 777-88-99", customerName: "Власов Д.",      status: "returned",     takenBy: null,    deadlineMin: 15, commissionUsdt: 0,    proof: "none",
    timeline: [
      { ts: "12:54:00", event: "created",   label: "Заявка от мерчанта MaxBet" },
      { ts: "12:55:30", event: "claimed",   label: "Взята в работу TR-1058" },
      { ts: "13:10:30", event: "expired",   label: "Не выполнена за 15 мин — возврат в пул" },
      { ts: "13:10:30", event: "rating",    label: "TR-1058: рейтинг −0.05" },
    ],
  },
  { id: "PO-55014", date: "27.04 12:30", amount: 32000, currency: "RUB", merchant: "BetCity",  customerBank: "B-A", customerTarget: "+7 911 888-99-00", customerName: "Соколов Е.",     status: "rejected",     takenBy: "TR-1042", deadlineMin: 0, commissionUsdt: 0,    proof: "rejected", proofTime: "12:38:00",
    timeline: [
      { ts: "12:30:00", event: "created",         label: "Заявка от мерчанта BetCity" },
      { ts: "12:31:14", event: "claimed",         label: "Взята в работу" },
      { ts: "12:37:55", event: "proof-uploaded",  label: "Чек загружен" },
      { ts: "12:38:00", event: "proof-rejected",  label: "Саппорт: чек не читается, отправлено на доработку" },
    ],
  },
  { id: "PO-55013", date: "27.04 12:08", amount: 11800, currency: "RUB", merchant: "Casino24", customerBank: "B-A", customerTarget: "+7 911 999-00-11", customerName: "Лебедев И.",     status: "disputed",     takenBy: "TR-1042", deadlineMin: 0, commissionUsdt: 0,    proof: "uploaded",
    timeline: [
      { ts: "12:08:00", event: "created",        label: "Заявка от мерчанта Casino24" },
      { ts: "12:09:22", event: "claimed",        label: "Взята в работу" },
      { ts: "12:14:55", event: "proof-uploaded", label: "Чек загружен" },
      { ts: "12:15:30", event: "completed",      label: "Подтверждена саппортом" },
      { ts: "26.04 16:21", event: "dispute-opened", label: "Мерчант открыл спор: «клиент денег не получил»" },
    ],
  },
];

// ─── SMS / Push лог с терминалов ──────────────────────────────────────────
const SMS_LOG = [
  { id: "SM-2401", terminal: "T-1001", source: "900",         time: "27.04 14:22:14", bank: "B-A", details: "PD-9001", payment: "PI-24001", amount: 15000, parsed: true,
    message: "+15 000 ₽ Перевод от ИВАНОВ И. И. Баланс: 124 580 ₽; ··4423" },
  { id: "SM-2402", terminal: "T-1001", source: "ru.alfabank", time: "27.04 14:18:03", bank: "B-A", details: "PD-9001", payment: "PI-24002", amount: 8500,  parsed: true,
    message: "+8 500 ₽. Поступление СБП. Остаток: 116 080 ₽; ··4423" },
  { id: "SM-2403", terminal: "T-1001", source: "mts",         time: "27.04 14:10:51", bank: "B-A", details: "PD-9001", payment: "PI-24003", amount: 24000, parsed: true,
    message: "+24 000 ₽ Зачисление. Карта ··4423. Доступно: 107 580 ₽" },
  { id: "SM-2404", terminal: "T-1002", source: "ru.alfabank", time: "27.04 14:00:33", bank: "B-B", details: null,       payment: null,       amount: 6000,  parsed: true,
    message: "+6 000 ₽. Поступление: Остаток: 62 300 ₽; ··7711" },
  { id: "SM-2405", terminal: "T-1002", source: "beeline",     time: "27.04 13:58:11", bank: "B-A", details: "PD-9003", payment: "PI-24004", amount: 5200,  parsed: true,
    message: "+5 200 ₽ Перевод СБП от ПЕТРОВ А. А. Остаток: 51 280 ₽; ··8821" },
  { id: "SM-2406", terminal: "T-1002", source: "900",         time: "27.04 13:51:11", bank: "B-A", details: "PD-9003", payment: null,       amount: 5000,  parsed: true,
    message: "+5 000 ₽. Поступление: Остаток: 5 106 ₽; ··3374" },
  { id: "SM-2407", terminal: "T-1002", source: "ru.alfabank", time: "27.04 13:44:58", bank: "B-A", details: "PD-9003", payment: "PI-24005", amount: 89200, parsed: true,
    message: "+89 200 ₽ СБП. Остаток: 215 280 ₽; ··8821" },
  { id: "SM-2408", terminal: "T-1001", source: "mts",         time: "27.04 13:31:02", bank: "B-B", details: "PD-9002", payment: "PI-24006", amount: 3200,  parsed: true,
    message: "+3 200 ₽ Зачисление по карте ··4423. Доступно: 18 200 ₽" },
  { id: "SM-2409", terminal: "T-1001", source: "beeline",     time: "27.04 13:14:40", bank: "B-A", details: "PD-9001", payment: "PI-24007", amount: 51000, parsed: true,
    message: "+51 000 ₽ Перевод СБП. Остаток: 209 280 ₽; ··4423" },
  { id: "SM-2410", terminal: "T-1002", source: "ru.alfabank", time: "27.04 12:50:22", bank: "B-A", details: null,       payment: null,       amount: 6700,  parsed: true,
    message: "+6 700 ₽. Поступление: Остаток: 18 050 ₽; ··2210" },
  { id: "SM-2411", terminal: "T-1003", source: "mts",         time: "27.04 11:48:33", bank: "B-A", details: null,       payment: null,       amount: null,  parsed: false,
    message: "Уведомление об операции. Подробности в приложении банка." },
  { id: "SM-2412", terminal: "T-1001", source: "900",         time: "27.04 11:32:18", bank: "B-A", details: "PD-9001", payment: "PI-24011", amount: 2100,  parsed: true,
    message: "+2 100 ₽ Перевод от АНТОНОВ С. Остаток: 158 280 ₽; ··4423" },
];

const SMS_SOURCE = {
  "mts":         { label: "МТС",          tone: "mts" },
  "beeline":     { label: "Билайн",       tone: "beeline" },
  "900":         { label: "900 · Сбер",   tone: "sber" },
  "ru.alfabank": { label: "ru.alfabank",  tone: "alfa" },
};

// ─── Финансовые движения (рабочий + страховой + начисления) ────────────────
const LEDGER = [
  { id: "L-90121", ts: "27.04 14:22", account: "working",   type: "payin-deduction", orderId: "PI-24001", amountUsdt: -162.34, label: "PayIn: списание эквивалента (15 000 ₽)" },
  { id: "L-90122", ts: "27.04 14:22", account: "working",   type: "payin-payout-back",orderId: "PI-24001",amountUsdt: +159.10, label: "PayIn: зачисление 15 000 ₽ × тариф 98%" },
  { id: "L-90123", ts: "27.04 14:22", account: "working",   type: "commission",      orderId: "PI-24001", amountUsdt: +3.24,   label: "Комиссия трейдера 2.0%" },
  { id: "L-90124", ts: "27.04 14:18", account: "working",   type: "payout-credit",   orderId: "PO-55020", amountUsdt: +459.96, label: "PayOut: зачисление 42 500 ₽" },
  { id: "L-90125", ts: "27.04 14:18", account: "working",   type: "commission",      orderId: "PO-55020", amountUsdt: +9.20,   label: "Комиссия трейдера 2.0%" },
  { id: "L-90126", ts: "27.04 13:30", account: "working",   type: "payout-credit",   orderId: "PO-55017", amountUsdt: +97.40,  label: "PayOut: зачисление 9 000 ₽" },
  { id: "L-90127", ts: "27.04 13:30", account: "working",   type: "commission",      orderId: "PO-55017", amountUsdt: +1.95,   label: "Комиссия трейдера 2.0%" },
  { id: "L-90128", ts: "27.04 12:30", account: "insurance", type: "fine",            orderId: "PO-55014", amountUsdt: -8.00,   label: "Штраф: проигнорирован чек" },
  { id: "L-90129", ts: "27.04 12:08", account: "insurance", type: "freeze",          orderId: "PO-55013", amountUsdt: -180.00, label: "Заморозка по спору DSP-440" },
  { id: "L-90130", ts: "27.04 09:00", account: "working",   type: "topup",           orderId: null,        amountUsdt: +500.00, label: "Пополнение рабочего баланса (админ)" },
  { id: "L-90131", ts: "26.04 18:42", account: "working",   type: "payin-deduction", orderId: "PI-23998", amountUsdt: -54.10,  label: "PayIn: списание эквивалента (5 000 ₽)" },
  { id: "L-90132", ts: "26.04 18:42", account: "working",   type: "payin-payout-back",orderId: "PI-23998",amountUsdt: +53.02,  label: "PayIn: зачисление" },
  { id: "L-90133", ts: "25.04 11:14", account: "insurance", type: "topup",           orderId: null,        amountUsdt: +1000.00,label: "Пополнение страхового депозита (админ)" },
  { id: "L-90134", ts: "24.04 16:08", account: "insurance", type: "release",         orderId: "PO-54998", amountUsdt: +120.00, label: "Снятие заморозки по спору DSP-438 (резолюция)" },
];

// ─── Споры ──────────────────────────────────────────────────────────────────
const DISPUTES = [
  {
    id: "DSP-441",
    opened: "27.04 11:02",
    order: "PI-24005",
    orderType: "PayIn",
    amount: 89200,
    merchant: "Casino24",
    customer: "Customer #10028",
    status: "waiting-trader",
    sla: "23ч 12м",
    deadline: "28.04 11:02",
    reason: "Клиент: оплатил, услугу не получил",
    chat: [
      { from: "merchant",  ts: "27.04 11:02", text: "Клиент утверждает, что оплатил, но баланс не пополнился. Прикладываю чек клиента." },
      { from: "merchant",  ts: "27.04 11:02", attach: "client_receipt.png" },
      { from: "support",   ts: "27.04 12:18", text: "Запрашиваю выписку по реквизиту PD-9003 за 13:30–14:00." },
    ],
  },
  {
    id: "DSP-440",
    opened: "26.04 16:21",
    order: "PO-55013",
    orderType: "PayOut",
    amount: 11800,
    merchant: "Casino24",
    customer: "Customer #11006",
    status: "waiting-admin",
    sla: "8ч 04м",
    deadline: "28.04 16:21",
    reason: "Клиент: денег не получил",
    chat: [
      { from: "merchant",  ts: "26.04 16:21", text: "Клиент пишет, что выплата не пришла на телефон." },
      { from: "trader",    ts: "27.04 09:40", text: "Перевод выполнен в 12:14:55. Прикладываю выписку из приложения банка." },
      { from: "trader",    ts: "27.04 09:40", attach: "trader_bank_app.jpg" },
    ],
  },
  {
    id: "DSP-438",
    opened: "25.04 14:30",
    order: "PO-54998",
    orderType: "PayOut",
    amount: 33000,
    merchant: "BetCity",
    customer: "Customer #10912",
    status: "resolved",
    sla: "—",
    deadline: "—",
    reason: "Резолюция в пользу трейдера",
    decision: "Подтверждено: выплата зачислена. Заморозка 120 USDT снята.",
    chat: [
      { from: "merchant",  ts: "25.04 14:30", text: "Клиент жалуется на отсутствие зачисления." },
      { from: "trader",    ts: "25.04 18:00", text: "Прикладываю чек СБП и выписку." },
      { from: "support",   ts: "26.04 18:00", text: "Резолюция: в пользу трейдера. Заморозка снимается." },
    ],
  },
  {
    id: "DSP-437",
    opened: "24.04 19:00",
    order: "PI-23901",
    orderType: "PayIn",
    amount: 9900,
    merchant: "MaxBet",
    customer: "Customer #10822",
    status: "rejected",
    sla: "—",
    deadline: "—",
    reason: "Подозрение на мошенничество клиента",
    decision: "Спор отклонён. Клиент мерчанта прислал поддельный чек.",
    chat: [],
  },
];

// ─── Тариф (read-only) ──────────────────────────────────────────────────────
const TARIFF = {
  name: "Стандарт",
  effectiveSince: "12.03.2024",
  payInRateMerchant: 9.0,    // % с мерчанта
  payInRateTrader: 7.5,      // % трейдеру (средняя)
  platformShare: 1.5,
  payOutRateMerchant: 4.5,
  payOutRateTrader: 3.5,     // средняя
  minCommissionUsdt: 0.30,
  payInMethods: [
    { method: "sbp",         label: "СБП",                  rate: 7.5, min: 100,  max: 100000, notes: "Базовый метод, без ограничений" },
    { method: "card",        label: "Карта (номер)",        rate: 7.8, min: 500,  max: 200000, notes: "—" },
    { method: "c2c",         label: "Card-to-Card",         rate: 8.0, min: 1000, max: 150000, notes: "Перевод по номеру карты" },
    { method: "phone",       label: "По номеру телефона",   rate: 7.5, min: 100,  max: 100000, notes: "СБП по телефону" },
    { method: "account",     label: "По расчётному счёту",  rate: 7.0, min: 5000, max: 500000, notes: "Только для верифицированных" },
  ],
  payOutMethods: [
    { method: "sbp",         label: "СБП",                  rate: 3.5, min: 100,  max: 100000, notes: "—" },
    { method: "card",        label: "Карта (номер)",        rate: 3.8, min: 500,  max: 150000, notes: "—" },
    { method: "c2c",         label: "Card-to-Card",         rate: 4.0, min: 1000, max: 150000, notes: "—" },
    { method: "phone",       label: "По номеру телефона",   rate: 3.5, min: 100,  max: 100000, notes: "СБП по телефону" },
    { method: "account",     label: "По расчётному счёту",  rate: 3.2, min: 5000, max: 500000, notes: "Только для верифицированных" },
  ],
  banks: [
    { bank: "B-A", payInTrader: 7.5, payOutTrader: 3.5, min: 100, max: 200000, notes: "—" },
    { bank: "B-B", payInTrader: 7.8, payOutTrader: 3.6, min: 100, max: 150000, notes: "Повышенная ставка по PayIn 09:00–21:00" },
    { bank: "B-C", payInTrader: 2.0, payOutTrader: 1.8, min: 100, max: 100000, notes: "—" },
    { bank: "B-D", payInTrader: 1.8, payOutTrader: 1.6, min: 100, max: 80000,  notes: "Только PayIn" },
  ],
};

// ─── Status maps ────────────────────────────────────────────────────────────
const TERMINAL_STATUS = {
  online:  { label: "Online",       tone: "ok" },
  offline: { label: "Offline",      tone: "bad" },
  blocked: { label: "Заблокирован", tone: "bad" },
  outdated:{ label: "Нужно обновление", tone: "warn" },
};

const PD_STATUS = {
  active:           { label: "Активен",            tone: "ok" },
  "trader-off":     { label: "Выкл. трейдером",    tone: "neutral" },
  "admin-off":      { label: "Выкл. админом",      tone: "neutral" },
  "terminal-offline":{label: "Терминал offline",   tone: "warn" },
  cooldown:         { label: "Cooldown",           tone: "warn" },
  "limit-exceeded": { label: "Лимит исчерпан",     tone: "warn" },
  blocked:          { label: "Заблокирован",       tone: "bad"  },
};

const PAY_IN_STATUS = {
  created:           { label: "Создана",          tone: "neutral" },
  matching:          { label: "Ищем реквизит",    tone: "info" },
  "waiting-payment": { label: "Ожидает оплаты",   tone: "warn" },
  completed:         { label: "Успешно",          tone: "ok" },
  expired:           { label: "Истекло время",    tone: "neutral" },
  failed:            { label: "Ошибка",           tone: "bad" },
  disputed:          { label: "Спор",             tone: "bad" },
  cancelled:         { label: "Отменена",         tone: "neutral" },
};

const PAY_OUT_STATUS = {
  free:             { label: "Свободна",          tone: "info" },
  "in-progress":    { label: "В работе",          tone: "warn" },
  "waiting-review": { label: "Проверка чека",     tone: "info" },
  completed:        { label: "Выполнена",          tone: "ok"  },
  rejected:         { label: "Отклонена",         tone: "bad" },
  returned:         { label: "Возврат в пул",     tone: "warn" },
  disputed:         { label: "Спор",              tone: "bad" },
  cancelled:        { label: "Отменена",          tone: "neutral" },
};

const DISPUTE_STATUS = {
  open:             { label: "Открыт",            tone: "warn" },
  "waiting-trader": { label: "Ждём трейдера",     tone: "warn" },
  "waiting-admin":  { label: "Ждём саппорт",      tone: "info" },
  resolved:         { label: "Подтверждён",       tone: "ok"   },
  rejected:         { label: "Отклонён",          tone: "neutral" },
};

const LEDGER_TYPE = {
  topup:               { label: "Пополнение",       tone: "ok"   },
  withdraw:            { label: "Вывод",            tone: "neutral" },
  "payin-deduction":   { label: "PayIn списание",   tone: "neutral" },
  "payin-payout-back": { label: "PayIn зачисление", tone: "info" },
  "payout-credit":     { label: "PayOut зачисление",tone: "info" },
  commission:          { label: "Комиссия",         tone: "ok"   },
  fine:                { label: "Штраф",            tone: "bad"  },
  freeze:              { label: "Заморозка",        tone: "warn" },
  release:             { label: "Снятие заморозки", tone: "ok"   },
  correction:          { label: "Корректировка",    tone: "neutral" },
};

// ─── Navigation ─────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",  label: "Главная",     icon: "◇" },
  { id: "payin",      label: "Платежи",     icon: "↓", count: PAY_IN.filter((o) => ["waiting-payment","matching","disputed"].includes(o.status)).length },
  { id: "payout",     label: "Выплаты",     icon: "↑", count: PAY_OUT.filter((o) => ["free","in-progress","waiting-review","disputed"].includes(o.status)).length },
  { id: "disputes",   label: "Споры",       icon: "✕", count: DISPUTES.filter((d) => ["open","waiting-trader"].includes(d.status)).length },
  { id: "terminals",  label: "Терминалы",   icon: "▣", count: TERMINALS.filter((t) => t.status === "online").length },
  { id: "details",    label: "Реквизиты",   icon: "≡", count: PAYMENT_DETAILS.filter((d) => d.status === "active").length },
  { id: "sms",        label: "SMS",         icon: "✉", count: SMS_LOG.filter((s) => !s.payment || !s.details).length },
  { id: "finance",    label: "Финансы",     icon: "$" },
  { id: "tariff",     label: "Тариф",       icon: "%" },
  { id: "profile",    label: "Настройки",   icon: "◉" },
];

const NAV_GROUPS = [
  { label: "",          ids: ["dashboard"] },
  { label: "Работа",    ids: ["payin", "payout", "disputes", "finance"] },
  { label: "Инфраструктура", ids: ["terminals", "details", "sms"] },
  { label: "Аккаунт",   ids: ["tariff", "profile"] },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function fmtMoney(v, currency = "RUB") {
  const sign = v < 0 ? "−" : "";
  const abs = Math.abs(v);
  let formatted;
  if (currency === "USDT") {
    formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    formatted = Math.round(abs).toLocaleString("ru-RU");
  }
  const symbol = currency === "RUB" ? "₽" : currency === "USDT" ? "USDT" : currency;
  return (
    <>
      {sign + formatted}
      <span className="ccy"> {symbol}</span>
    </>
  );
}

function fmtPct(v) {
  return (v * 100).toFixed(0) + "%";
}

function bankName(id) {
  const b = BANKS.find((x) => x.id === id);
  return b ? b.name : id;
}

Object.assign(window, {
  ME, BANKS, BALANCES, RATING,
  TERMINALS, PAYMENT_DETAILS, SMS_LOG, SMS_SOURCE,
  PAY_IN, PAY_OUT, LEDGER, DISPUTES, TARIFF,
  TERMINAL_STATUS, PD_STATUS, PAY_IN_STATUS, PAY_OUT_STATUS,
  DISPUTE_STATUS, LEDGER_TYPE,
  NAV, NAV_GROUPS,
  fmtMoney, fmtPct, bankName,
});
