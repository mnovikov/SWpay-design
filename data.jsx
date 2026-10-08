// CrowdPay Operator Admin — mock data + status maps
// Соответствует ТЗ v4 (M.Novikov, 30.04.2026), п. 5.8

const METHOD_LABEL = {
  sbp: "СБП",
  card: "Карта",
  account: "Счёт",
  cash: "Наличные",
};

// ─── Banks ──────────────────────────────────────────────────────────────────
const BANKS = [
  { id: "B-A", name: "Bank A", short: "A" },
  { id: "B-B", name: "Bank B", short: "B" },
  { id: "B-C", name: "Bank C", short: "C" },
  { id: "B-D", name: "Bank D", short: "D" },
];

// ─── Operators (Admin / Support) ────────────────────────────────────────────
const ME_ADMIN = {
  id: "OP-001",
  login: "a.smirnov",
  name: "Артём Смирнов",
  role: "admin",
  email: "a.smirnov@crowdpay.demo",
  rights: ["all"],
};

const OPERATORS = [
  { id: "OP-001", login: "a.smirnov", name: "Артём Смирнов", role: "admin",   online: true,  ticketsToday: 24, casesOpen: 3 },
  { id: "OP-002", login: "v.popov",   name: "Виктор Попов",   role: "support", online: true,  ticketsToday: 18, casesOpen: 5 },
  { id: "OP-003", login: "n.kuznetsova", name: "Нина Кузнецова", role: "support", online: true,  ticketsToday: 12, casesOpen: 2 },
  { id: "OP-004", login: "i.fedorov", name: "Иван Фёдоров",   role: "support", online: false, ticketsToday: 0,  casesOpen: 0 },
];

// ─── Merchants ──────────────────────────────────────────────────────────────
const MERCHANTS = [
  {
    id: "M-501", name: "BetCity",
    status: "active", joined: "12.01.2024", referral: "Орбита",
    contact: { person: "Денис Афанасьев", email: "ops@betcity.demo", telegram: "@betcity_ops" },
    balance: { rub: 2_840_000, frozen: 320_000 },
    today: { payInRub: 1_240_000, payOutRub: 482_000, payInCount: 412, payOutCount: 38, success: 0.96 },
    month: { payInRub: 38_220_000, payOutRub: 12_400_000, payInCount: 12410, payOutCount: 980 },
    tariff: "TF-001",
    payInRateMerchant: 3.0, payOutRateMerchant: 2.5,
    apiKeys: [
      { id: "AK-9001", label: "Production",  ip: "94.180.110.0/24", created: "12.01.2024", lastUsed: "сейчас", status: "active" },
      { id: "AK-9002", label: "Backup",      ip: "—",                 created: "20.04.2024", lastUsed: "вчера", status: "active" },
    ],
    allowedTraders: ["TR-1042", "TR-1058", "TR-1077"], // ← из ТЗ: список разрешённых трейдеров
    blockedTraders: ["TR-1073"],
    integrations: { webhookUrl: "https://api.betcity.demo/crowdpay/callback", webhookSecret: "wh_•••• 4421" },
    notes: "Ключевой клиент. Менеджер: А.Смирнов",
  },
  {
    id: "M-502", name: "MaxBet",
    status: "active", joined: "18.02.2024", referral: "Орбита",
    contact: { person: "Олег Кириллов", email: "tech@maxbet.demo", telegram: "@maxbet_tech" },
    balance: { rub: 1_120_000, frozen: 84_000 },
    today: { payInRub: 624_000, payOutRub: 218_000, payInCount: 198, payOutCount: 21, success: 0.94 },
    month: { payInRub: 18_460_000, payOutRub: 6_820_000, payInCount: 6204, payOutCount: 502 },
    tariff: "TF-001",
    payInRateMerchant: 3.0, payOutRateMerchant: 2.5,
    apiKeys: [
      { id: "AK-9011", label: "Production", ip: "188.42.50.0/24", created: "18.02.2024", lastUsed: "2 мин назад", status: "active" },
    ],
    allowedTraders: [], // пусто = доступны все
    blockedTraders: [],
    integrations: { webhookUrl: "https://maxbet.demo/api/cp", webhookSecret: "wh_•••• 8821" },
    notes: "",
  },
  {
    id: "M-503", name: "Casino24",
    status: "active", joined: "03.03.2024", referral: "Вектор",
    contact: { person: "Алина Шевченко", email: "ops@casino24.demo", telegram: "—" },
    balance: { rub: 480_000, frozen: 124_000 },
    today: { payInRub: 386_000, payOutRub: 142_000, payInCount: 121, payOutCount: 14, success: 0.91 },
    month: { payInRub: 11_240_000, payOutRub: 4_120_000, payInCount: 3812, payOutCount: 312 },
    tariff: "TF-002", // High Volume
    payInRateMerchant: 2.6, payOutRateMerchant: 2.2,
    apiKeys: [
      { id: "AK-9021", label: "Production", ip: "—", created: "03.03.2024", lastUsed: "10 мин назад", status: "active" },
    ],
    allowedTraders: [],
    blockedTraders: ["TR-1061"], // конфликт по DSP-441
    integrations: { webhookUrl: "https://api.casino24.demo/cp", webhookSecret: "wh_•••• 1102" },
    notes: "Повышенный уровень споров — следить",
  },
  {
    id: "M-504", name: "TopBet",
    status: "suspended", joined: "14.04.2024", referral: "Гранд",
    contact: { person: "Михаил Гордеев", email: "—", telegram: "—" },
    balance: { rub: 0, frozen: 24_000 },
    today: { payInRub: 0, payOutRub: 0, payInCount: 0, payOutCount: 0, success: 0 },
    month: { payInRub: 0, payOutRub: 0, payInCount: 0, payOutCount: 0 },
    tariff: "TF-001",
    payInRateMerchant: 3.0, payOutRateMerchant: 2.5,
    apiKeys: [],
    allowedTraders: [],
    blockedTraders: [],
    integrations: { webhookUrl: "", webhookSecret: "" },
    notes: "Приостановлен 25.04 за подделку чека (DSP-435)",
  },
];

// ─── Traders (с балансами Working+Insurance) ────────────────────────────────
const TRADERS = [
  {
    id: "TR-1042", name: "Алексей Морозов", login: "a.morozov", status: "active", vip: true,
    rating: 4.82, ratingTrend: +0.04,
    team: "Альфа",
    email: "alex.morozov@crowdpay.demo", phone: "+7 900 123-45-67",
    registered: "12.03.2024",
    tariff: "TF-001",
    rights: { payIn: true, payOut: true },
    balance: {
      workingUsdt: 4280.50, workingRub: 395558,
      insuranceUsdt: 2000.00, insuranceRub: 184800,
      lockedUsdt: 180,
    },
    today: { payInRub: 482300, payOutRub: 318000, commissionUsdt: 34.6 },
    month: { payInRub: 4920000, payOutRub: 3120000, commissionUsdt: 412.8 },
    counts: { terminals: 3, terminalsOnline: 2, details: 5, detailsActive: 4, openDisputes: 1 },
    success: 0.97,
    last: "2 мин назад",
    notes: "KYC пройден, проверенный",
    kyc: { status: "verified", verifiedAt: "14.03.2024", method: "doc + selfie" },
    allowedMerchants: [], // пусто = все доступны
    blockedMerchants: [],
  },
  {
    id: "TR-1058", name: "Тимур Иванов", login: "t.ivanov", status: "active", vip: true,
    rating: 4.6, ratingTrend: -0.02,
    team: "Альфа", email: "timur@crowdpay.demo", phone: "+7 901 555-10-20",
    registered: "08.04.2024", tariff: "TF-001",
    rights: { payIn: true, payOut: true },
    balance: { workingUsdt: 1850.20, workingRub: 171000, insuranceUsdt: 1200.00, insuranceRub: 110880, lockedUsdt: 0 },
    today: { payInRub: 156800, payOutRub: 92000, commissionUsdt: 12.4 },
    month: { payInRub: 2480000, payOutRub: 1180000, commissionUsdt: 198.0 },
    counts: { terminals: 2, terminalsOnline: 2, details: 3, detailsActive: 3, openDisputes: 0 },
    success: 0.94, last: "5 мин назад",
    kyc: { status: "verified", verifiedAt: "10.04.2024", method: "doc + selfie" },
    allowedMerchants: [], blockedMerchants: [],
  },
  {
    id: "TR-1061", name: "Денис Волков", login: "d.volkov", status: "active", vip: true,
    rating: 4.2, ratingTrend: -0.08,
    team: "Бета", email: "denis@crowdpay.demo", phone: "+7 903 777-88-99",
    registered: "22.05.2024", tariff: "TF-002",
    rights: { payIn: true, payOut: true },
    balance: { workingUsdt: 8420.00, workingRub: 778008, insuranceUsdt: 3500.00, insuranceRub: 323400, lockedUsdt: 1450 },
    today: { payInRub: 612400, payOutRub: 481000, commissionUsdt: 58.2 },
    month: { payInRub: 9120000, payOutRub: 5840000, commissionUsdt: 880.0 },
    counts: { terminals: 4, terminalsOnline: 4, details: 11, detailsActive: 9, openDisputes: 2 },
    success: 0.91, last: "1 мин назад",
    notes: "Высокий объём, повышенный риск споров",
    kyc: { status: "verified", verifiedAt: "24.05.2024", method: "doc + selfie" },
    allowedMerchants: [], blockedMerchants: ["M-503"],
  },
  {
    id: "TR-1073", name: "Михаил Соколов", login: "m.sokolov", status: "suspended",
    rating: 3.9, ratingTrend: -0.15,
    team: "Бета", email: "m.sokolov@crowdpay.demo", phone: "+7 905 222-33-44",
    registered: "11.06.2024", tariff: "TF-001",
    rights: { payIn: false, payOut: false },
    balance: { workingUsdt: 240.00, workingRub: 22176, insuranceUsdt: 1000.00, insuranceRub: 92400, lockedUsdt: 480 },
    today: { payInRub: 0, payOutRub: 0, commissionUsdt: 0 },
    month: { payInRub: 380000, payOutRub: 120000, commissionUsdt: 18.4 },
    counts: { terminals: 1, terminalsOnline: 0, details: 2, detailsActive: 0, openDisputes: 1 },
    success: 0.88, last: "3 ч назад",
    notes: "Приостановлен 24.04 за просроченный settlement и проигранный спор",
    kyc: { status: "verified", verifiedAt: "13.06.2024", method: "doc + selfie" },
    allowedMerchants: [], blockedMerchants: [],
  },
  {
    id: "TR-1077", name: "Роман Петров", login: "r.petrov", status: "active", vip: true,
    rating: 4.5, ratingTrend: +0.02,
    team: "Гамма", email: "r.petrov@crowdpay.demo", phone: "+7 906 444-55-66",
    registered: "02.08.2024", tariff: "TF-002",
    rights: { payIn: true, payOut: true },
    balance: { workingUsdt: 3120.00, workingRub: 288288, insuranceUsdt: 2000.00, insuranceRub: 184800, lockedUsdt: 0 },
    today: { payInRub: 271600, payOutRub: 184000, commissionUsdt: 24.8 },
    month: { payInRub: 5640000, payOutRub: 2960000, commissionUsdt: 410.0 },
    counts: { terminals: 2, terminalsOnline: 2, details: 6, detailsActive: 6, openDisputes: 0 },
    success: 0.95, last: "только что",
    kyc: { status: "verified", verifiedAt: "04.08.2024", method: "doc + selfie" },
    allowedMerchants: [], blockedMerchants: [],
  },
  {
    id: "TR-1082", name: "Сергей Григорьев", login: "s.grigoriev", status: "deactivated",
    rating: 4.0, ratingTrend: 0,
    team: "Гамма", email: "s.g@crowdpay.demo", phone: "+7 909 000-11-22",
    registered: "12.10.2024", tariff: "TF-001",
    rights: { payIn: false, payOut: false },
    balance: { workingUsdt: 0, workingRub: 0, insuranceUsdt: 0, insuranceRub: 0, lockedUsdt: 0 },
    today: { payInRub: 0, payOutRub: 0, commissionUsdt: 0 },
    month: { payInRub: 0, payOutRub: 0, commissionUsdt: 0 },
    counts: { terminals: 0, terminalsOnline: 0, details: 0, detailsActive: 0, openDisputes: 0 },
    success: 0.90, last: "вчера, 18:42",
    notes: "Сам ушёл, баланс выведен полностью",
    kyc: { status: "verified", verifiedAt: "14.10.2024", method: "doc + selfie" },
    allowedMerchants: [], blockedMerchants: [],
  },
];

// ─── Terminals ──────────────────────────────────────────────────────────────
const TERMINALS = [
  { id: "TM-1042-A", trader: "TR-1042", traderName: "Алексей Морозов", device: "Pixel 6a",      phone: "+7 900 123-45-67", status: "online",  battery: 86, appVersion: "1.18.4", heartbeat: "12 сек", details: 2, smsToday: 142, errors: 0, notes: "Основной" },
  { id: "TM-1042-B", trader: "TR-1042", traderName: "Алексей Морозов", device: "Redmi Note 12", phone: "+7 901 555-10-20", status: "online",  battery: 42, appVersion: "1.18.4", heartbeat: "8 сек",  details: 2, smsToday: 88,  errors: 1, notes: "" },
  { id: "TM-1042-C", trader: "TR-1042", traderName: "Алексей Морозов", device: "Honor 8X",      phone: "+7 902 333-44-55", status: "offline", battery: 12, appVersion: "1.16.0", heartbeat: "47 мин", details: 1, smsToday: 0,   errors: 0, notes: "Резерв, требует обновления" },
  { id: "TM-1058-A", trader: "TR-1058", traderName: "Тимур Иванов",    device: "Pixel 7",       phone: "+7 901 555-10-20", status: "online",  battery: 71, appVersion: "1.18.4", heartbeat: "15 сек", details: 2, smsToday: 96,  errors: 0, notes: "" },
  { id: "TM-1058-B", trader: "TR-1058", traderName: "Тимур Иванов",    device: "Redmi 12",      phone: "+7 901 555-22-44", status: "online",  battery: 58, appVersion: "1.18.4", heartbeat: "20 сек", details: 1, smsToday: 41,  errors: 0, notes: "" },
  { id: "TM-1061-A", trader: "TR-1061", traderName: "Денис Волков",    device: "Galaxy A52",    phone: "+7 903 777-88-99", status: "online",  battery: 92, appVersion: "1.18.4", heartbeat: "5 сек",  details: 4, smsToday: 312, errors: 2, notes: "" },
  { id: "TM-1061-B", trader: "TR-1061", traderName: "Денис Волков",    device: "Redmi Note 11", phone: "+7 903 888-99-00", status: "online",  battery: 64, appVersion: "1.18.4", heartbeat: "11 сек", details: 3, smsToday: 218, errors: 0, notes: "" },
  { id: "TM-1061-C", trader: "TR-1061", traderName: "Денис Волков",    device: "Pixel 6",       phone: "+7 903 999-00-11", status: "online",  battery: 38, appVersion: "1.18.4", heartbeat: "18 сек", details: 2, smsToday: 154, errors: 1, notes: "" },
  { id: "TM-1061-D", trader: "TR-1061", traderName: "Денис Волков",    device: "Galaxy A34",    phone: "+7 903 123-22-11", status: "online",  battery: 81, appVersion: "1.18.4", heartbeat: "9 сек",  details: 2, smsToday: 84,  errors: 0, notes: "" },
  { id: "TM-1073-A", trader: "TR-1073", traderName: "Михаил Соколов",  device: "Pixel 6a",      phone: "+7 905 222-33-44", status: "blocked", battery: 0,  appVersion: "1.16.0", heartbeat: "—",      details: 0, smsToday: 0,   errors: 0, notes: "Заблокирован вместе с трейдером" },
  { id: "TM-1077-A", trader: "TR-1077", traderName: "Роман Петров",    device: "Galaxy A34",    phone: "+7 906 444-55-66", status: "online",  battery: 88, appVersion: "1.18.4", heartbeat: "3 сек",  details: 3, smsToday: 162, errors: 0, notes: "" },
  { id: "TM-1077-B", trader: "TR-1077", traderName: "Роман Петров",    device: "Pixel 7a",      phone: "+7 906 555-66-77", status: "online",  battery: 54, appVersion: "1.18.4", heartbeat: "14 сек", details: 3, smsToday: 124, errors: 0, notes: "" },
];

// ─── Payment Details ────────────────────────────────────────────────────────
const PAYMENT_DETAILS = [
  { id: "PD-9001", method: "sbp",  bank: "B-A", trader: "TR-1042", terminal: "TM-1042-A", target: "+7 900 123-45-67", holder: "Алексей М.", status: "active",         min: 500,  max: 200000, dailyLimit: 800000,  monthlyLimit: 12000000, dailyUsed: 0.62, monthlyUsed: 0.41, opsToday: 142, opsLimit: 500, success: 0.98, disputes: 0, todayRub: 496000,  monthRub: 4920000 },
  { id: "PD-9002", method: "card", bank: "B-B", trader: "TR-1042", terminal: "TM-1042-A", target: "•••• 4423",        holder: "Алексей М.", status: "active",         min: 1000, max: 150000, dailyLimit: 600000,  monthlyLimit: 8000000,  dailyUsed: 0.31, monthlyUsed: 0.22, opsToday: 56,  opsLimit: 400, success: 0.96, disputes: 0, todayRub: 186000,  monthRub: 1760000 },
  { id: "PD-9003", method: "sbp",  bank: "B-A", trader: "TR-1042", terminal: "TM-1042-B", target: "+7 901 555-10-20", holder: "Алексей М.", status: "active",         min: 500,  max: 180000, dailyLimit: 700000,  monthlyLimit: 10000000, dailyUsed: 0.45, monthlyUsed: 0.33, opsToday: 88,  opsLimit: 500, success: 0.95, disputes: 0, todayRub: 315000,  monthRub: 3300000 },
  { id: "PD-9004", method: "card", bank: "B-B", trader: "TR-1042", terminal: "TM-1042-B", target: "•••• 7711",        holder: "Алексей М.", status: "limit-exceeded", min: 1000, max: 100000, dailyLimit: 500000,  monthlyLimit: 7000000,  dailyUsed: 0.94, monthlyUsed: 0.81, opsToday: 380, opsLimit: 400, success: 0.88, disputes: 1, todayRub: 470000,  monthRub: 5670000, blockReason: "Дневной лимит 95% — авто-отключение" },
  { id: "PD-9005", method: "sbp",  bank: "B-C", trader: "TR-1042", terminal: "TM-1042-C", target: "+7 902 333-44-55", holder: "Алексей М.", status: "terminal-offline", min: 500, max: 80000, dailyLimit: 400000, monthlyLimit: 5000000, dailyUsed: 0, monthlyUsed: 0, opsToday: 0, opsLimit: 300, success: 0.71, disputes: 0, todayRub: 0, monthRub: 0, blockReason: "Терминал TM-1042-C offline >5 мин" },
  { id: "PD-9011", method: "sbp",  bank: "B-A", trader: "TR-1058", terminal: "TM-1058-A", target: "+7 901 555-10-20", holder: "Тимур И.",   status: "active",         min: 500,  max: 150000, dailyLimit: 700000,  monthlyLimit: 10000000, dailyUsed: 0.45, monthlyUsed: 0.33, opsToday: 88,  opsLimit: 500, success: 0.95, disputes: 0, todayRub: 315000,  monthRub: 3300000 },
  { id: "PD-9012", method: "card", bank: "B-A", trader: "TR-1058", terminal: "TM-1058-A", target: "•••• 8821",        holder: "Тимур И.",   status: "active",         min: 1000, max: 100000, dailyLimit: 500000,  monthlyLimit: 7000000,  dailyUsed: 0.22, monthlyUsed: 0.18, opsToday: 24,  opsLimit: 400, success: 0.94, disputes: 0, todayRub: 110000,  monthRub: 1260000 },
  { id: "PD-9013", method: "sbp",  bank: "B-B", trader: "TR-1058", terminal: "TM-1058-B", target: "+7 901 555-22-44", holder: "Тимур И.",   status: "active",         min: 500,  max: 120000, dailyLimit: 600000,  monthlyLimit: 8000000,  dailyUsed: 0.33, monthlyUsed: 0.21, opsToday: 41,  opsLimit: 400, success: 0.93, disputes: 0, todayRub: 198000,  monthRub: 1680000 },
  { id: "PD-9021", method: "sbp",  bank: "B-A", trader: "TR-1061", terminal: "TM-1061-A", target: "+7 903 777-88-99", holder: "Денис В.",   status: "active",         min: 500,  max: 200000, dailyLimit: 1000000, monthlyLimit: 15000000, dailyUsed: 0.71, monthlyUsed: 0.55, opsToday: 312, opsLimit: 700, success: 0.93, disputes: 0, todayRub: 710000,  monthRub: 8250000 },
  { id: "PD-9022", method: "card", bank: "B-C", trader: "TR-1061", terminal: "TM-1061-A", target: "•••• 1102",        holder: "Денис В.",   status: "frozen",         min: 1000, max: 150000, dailyLimit: 700000,  monthlyLimit: 10000000, dailyUsed: 0.94, monthlyUsed: 0.81, opsToday: 380, opsLimit: 500, success: 0.88, disputes: 1, todayRub: 658000,  monthRub: 8100000, blockReason: "Заморожен до резолюции спора DSP-441" },
  { id: "PD-9023", method: "sbp",  bank: "B-B", trader: "TR-1061", terminal: "TM-1061-B", target: "+7 903 888-99-00", holder: "Денис В.",   status: "active",         min: 500,  max: 180000, dailyLimit: 800000,  monthlyLimit: 12000000, dailyUsed: 0.55, monthlyUsed: 0.44, opsToday: 218, opsLimit: 600, success: 0.92, disputes: 0, todayRub: 440000,  monthRub: 5280000 },
  { id: "PD-9024", method: "sbp",  bank: "B-A", trader: "TR-1061", terminal: "TM-1061-C", target: "+7 903 999-00-11", holder: "Денис В.",   status: "active",         min: 500,  max: 150000, dailyLimit: 700000,  monthlyLimit: 10000000, dailyUsed: 0.42, monthlyUsed: 0.31, opsToday: 154, opsLimit: 500, success: 0.94, disputes: 0, todayRub: 294000,  monthRub: 3100000 },
  { id: "PD-9025", method: "card", bank: "B-D", trader: "TR-1061", terminal: "TM-1061-D", target: "•••• 2244",        holder: "Денис В.",   status: "active",         min: 1000, max: 80000,  dailyLimit: 400000,  monthlyLimit: 5000000,  dailyUsed: 0.21, monthlyUsed: 0.14, opsToday: 84,  opsLimit: 300, success: 0.91, disputes: 0, todayRub: 84000,   monthRub: 700000 },
  { id: "PD-9031", method: "sbp",  bank: "B-D", trader: "TR-1073", terminal: "TM-1073-A", target: "+7 905 222-33-44", holder: "Михаил С.",  status: "blocked",        min: 500,  max: 80000,  dailyLimit: 400000,  monthlyLimit: 5000000,  dailyUsed: 0,    monthlyUsed: 0.12, opsToday: 0,   opsLimit: 300, success: 0.85, disputes: 1, todayRub: 0,       monthRub: 600000, blockReason: "Трейдер приостановлен 24.04" },
  { id: "PD-9041", method: "sbp",  bank: "B-A", trader: "TR-1077", terminal: "TM-1077-A", target: "+7 906 444-55-66", holder: "Роман П.",   status: "active",         min: 500,  max: 200000, dailyLimit: 800000,  monthlyLimit: 12000000, dailyUsed: 0.48, monthlyUsed: 0.34, opsToday: 162, opsLimit: 600, success: 0.94, disputes: 0, todayRub: 384000,  monthRub: 4080000 },
  { id: "PD-9042", method: "card", bank: "B-A", trader: "TR-1077", terminal: "TM-1077-A", target: "•••• 7766",        holder: "Роман П.",   status: "active",         min: 1000, max: 150000, dailyLimit: 700000,  monthlyLimit: 10000000, dailyUsed: 0.36, monthlyUsed: 0.28, opsToday: 84,  opsLimit: 500, success: 0.92, disputes: 0, todayRub: 252000,  monthRub: 2800000 },
  { id: "PD-9043", method: "sbp",  bank: "B-B", trader: "TR-1077", terminal: "TM-1077-B", target: "+7 906 555-66-77", holder: "Роман П.",   status: "active",         min: 500,  max: 150000, dailyLimit: 600000,  monthlyLimit: 8000000,  dailyUsed: 0.42, monthlyUsed: 0.32, opsToday: 124, opsLimit: 500, success: 0.93, disputes: 0, todayRub: 252000,  monthRub: 2560000 },
];

// ─── Платежи Orders ───────────────────────────────────────────────────────────
const PAY_IN = [
  { id: "PI-83410", date: "27.04 15:02", amount: 6400,   merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10024", trader: "TR-1042", terminal: "TM-1042-A", bank: "B-A", details: "PD-9001", status: "waiting-payment", source: "—",    time: "—",     commissionUsdt: 0,    dispute: false },
  { id: "PI-83409", date: "27.04 14:58", amount: 31500,  merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10025", trader: "TR-1058", terminal: "TM-1058-A", bank: "B-A", details: "PD-9011", status: "manual-review",   source: "SMS",  time: "00:48", commissionUsdt: 0,    dispute: false },
  { id: "PI-83408", date: "27.04 14:50", amount: 18900,  merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10026", trader: "TR-1042", terminal: "TM-1042-B", bank: "B-B", details: "PD-9002", status: "disputed",        source: "SMS",  time: "00:55", commissionUsdt: 0,    dispute: true  },
  { id: "PI-83407", date: "27.04 14:40", amount: 2200,   merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10027", trader: "TR-1077", terminal: "TM-1077-A", bank: "B-A", details: "PD-9041", status: "expired",         source: "—",    time: "—",     commissionUsdt: 0,    dispute: false },
  { id: "PI-83406", date: "27.04 14:33", amount: 9700,   merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10028", trader: "TR-1077", terminal: "TM-1077-B", bank: "B-B", details: "PD-9043", status: "waiting-payment", source: "—",    time: "—",     commissionUsdt: 0,    dispute: false },
  { id: "PI-83405", date: "27.04 14:28", amount: 54000,  merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10029", trader: "TR-1058", terminal: "TM-1058-B", bank: "B-B", details: "PD-9013", status: "failed",          source: "—",    time: "—",     commissionUsdt: 0,    dispute: false },
  { id: "PI-83401", date: "27.04 14:22", amount: 4800,   merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10024", trader: "TR-1042", terminal: "TM-1042-A", bank: "B-A", details: "PD-9001", status: "completed",       source: "SMS",  time: "00:38", commissionUsdt: 1.04, dispute: false },
  { id: "PI-83400", date: "27.04 14:21", amount: 12500,  merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10025", trader: "TR-1042", terminal: "TM-1042-B", bank: "B-B", details: "PD-9002", status: "auto-confirmed",       source: "Push", time: "00:21", commissionUsdt: 2.71, dispute: false },
  { id: "PI-83399", date: "27.04 14:18", amount: 89200,  merchant: "M-503", merchantName: "Casino24", customer: "Customer #10026", trader: "TR-1061", terminal: "TM-1061-A", bank: "B-A", details: "PD-9021", status: "disputed",        source: "SMS",  time: "00:55", commissionUsdt: 0,    dispute: true  },
  { id: "PI-83398", date: "27.04 14:14", amount: 1500,   merchant: "M-502", merchantName: "MaxBet",   customer: "Customer #10027", trader: "TR-1058", terminal: "TM-1058-A", bank: "B-A", details: "PD-9011", status: "completed",       source: "SMS",  time: "00:14", commissionUsdt: 0.32, dispute: false },
  { id: "PI-83397", date: "27.04 14:10", amount: 24000,  merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10028", trader: "TR-1042", terminal: "TM-1042-B", bank: "B-A", details: "PD-9003", status: "auto-confirmed",       source: "Push", time: "00:21", commissionUsdt: 5.19, dispute: false },
  { id: "PI-83396", date: "27.04 14:02", amount: 3200,   merchant: "M-502", merchantName: "MaxBet",   customer: "Customer #10029", trader: "TR-1042", terminal: "TM-1042-A", bank: "B-A", details: "PD-9001", status: "expired",         source: "—",    time: "—",     commissionUsdt: 0,    dispute: false },
  { id: "PI-83395", date: "27.04 13:58", amount: 65000,  merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10030", trader: "TR-1077", terminal: "TM-1077-A", bank: "B-A", details: "PD-9041", status: "completed",       source: "SMS",  time: "00:42", commissionUsdt: 14.07,dispute: false },
  { id: "PI-83394", date: "27.04 13:51", amount: 920,    merchant: "M-502", merchantName: "MaxBet",   customer: "Customer #10031", trader: "TR-1058", terminal: "TM-1058-A", bank: "B-A", details: "PD-9011", status: "auto-confirmed",       source: "Push", time: "00:11", commissionUsdt: 0.20, dispute: false },
  { id: "PI-83393", date: "27.04 13:44", amount: 142000, merchant: "M-503", merchantName: "Casino24", customer: "Customer #10032", trader: "TR-1061", terminal: "TM-1061-B", bank: "B-B", details: "PD-9023", status: "manual-review",   source: "SMS",  time: "00:55", commissionUsdt: 0,    dispute: false },
  { id: "PI-83392", date: "27.04 13:40", amount: 7800,   merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10033", trader: "TR-1042", terminal: "TM-1042-B", bank: "B-B", details: "PD-9002", status: "completed",       source: "SMS",  time: "00:19", commissionUsdt: 1.69, dispute: false },
  { id: "PI-83391", date: "27.04 13:31", amount: 51000,  merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10034", trader: "TR-1077", terminal: "TM-1077-A", bank: "B-A", details: "PD-9041", status: "failed",          source: "—",    time: "—",     commissionUsdt: 0,    dispute: false },
  { id: "PI-83390", date: "27.04 13:22", amount: 11200,  merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10035", trader: "TR-1042", terminal: "TM-1042-A", bank: "B-A", details: "PD-9001", status: "auto-confirmed",       source: "Push", time: "00:08", commissionUsdt: 2.42, dispute: false },
  { id: "PI-83389", date: "27.04 12:58", amount: 33000,  merchant: "M-503", merchantName: "Casino24", customer: "Customer #10036", trader: "TR-1077", terminal: "TM-1077-B", bank: "B-B", details: "PD-9043", status: "waiting-payment", source: "—",    time: "—",     commissionUsdt: 0,    dispute: false },
];

// ─── Выплаты Orders ──────────────────────────────────────────────────────────
const PAY_OUT = [
  { id: "PO-55021", date: "27.04 14:34", amount: 18000,  merchant: "M-501", merchantName: "BetCity",  customer: "Иванов И. И.",   customerBank: "B-A", customerTarget: "+7 911 111-22-33", trader: null,        proof: "none",     adminApproval: "—",       status: "free",          deadlineMin: 15, commissionUsdt: 3.89 },
  { id: "PO-55020", date: "27.04 14:18", amount: 42500,  merchant: "M-503", merchantName: "Casino24", customer: "Петров А. А.",   customerBank: "B-B", customerTarget: "+7 911 222-33-44", trader: "TR-1042",   proof: "uploaded", adminApproval: "pending", status: "waiting-review",deadlineMin: 0,  commissionUsdt: 9.20  },
  { id: "PO-55019", date: "27.04 14:02", amount: 9000,   merchant: "M-501", merchantName: "BetCity",  customer: "Сидоров К.",     customerBank: "B-A", customerTarget: "+7 911 333-44-55", trader: null,        proof: "none",     adminApproval: "—",       status: "free",          deadlineMin: 15, commissionUsdt: 1.95  },
  { id: "PO-55018", date: "27.04 13:48", amount: 134000, merchant: "M-501", merchantName: "BetCity",  customer: "Кузнецов В.",    customerBank: "B-A", customerTarget: "+7 911 444-55-66", trader: "TR-1077",   proof: "uploaded", adminApproval: "approved",status: "completed",     deadlineMin: 0,  commissionUsdt: 29.01 },
  { id: "PO-55017", date: "27.04 13:30", amount: 7500,   merchant: "M-502", merchantName: "MaxBet",   customer: "Морозов А.",     customerBank: "B-D", customerTarget: "+7 911 555-66-77", trader: "TR-1058",   proof: "rejected", adminApproval: "rejected",status: "rejected",      deadlineMin: 0,  commissionUsdt: 0     },
  { id: "PO-55016", date: "27.04 13:12", amount: 28000,  merchant: "M-503", merchantName: "Casino24", customer: "Орлов П.",       customerBank: "B-A", customerTarget: "+7 911 666-77-88", trader: "TR-1042",   proof: "uploaded", adminApproval: "—",       status: "in-progress",   deadlineMin: 6,  commissionUsdt: 6.06  },
  { id: "PO-55015", date: "27.04 12:54", amount: 11000,  merchant: "M-502", merchantName: "MaxBet",   customer: "Власов Д.",      customerBank: "B-B", customerTarget: "+7 911 777-88-99", trader: null,        proof: "none",     adminApproval: "—",       status: "returned",      deadlineMin: 15, commissionUsdt: 0     },
  { id: "PO-55014", date: "27.04 12:30", amount: 56000,  merchant: "M-501", merchantName: "BetCity",  customer: "Соколов Е.",     customerBank: "B-C", customerTarget: "+7 911 888-99-00", trader: "TR-1061",   proof: "uploaded", adminApproval: "approved",status: "completed",     deadlineMin: 0,  commissionUsdt: 12.13 },
  { id: "PO-55013", date: "27.04 12:08", amount: 23800,  merchant: "M-503", merchantName: "Casino24", customer: "Лебедев И.",     customerBank: "B-A", customerTarget: "+7 911 999-00-11", trader: "TR-1077",   proof: "uploaded", adminApproval: "—",       status: "disputed",      deadlineMin: 0,  commissionUsdt: 0     },
  { id: "PO-55012", date: "27.04 11:42", amount: 19500,  merchant: "M-502", merchantName: "MaxBet",   customer: "Тарасов Г.",     customerBank: "B-B", customerTarget: "+7 912 111-22-33", trader: "TR-1042",   proof: "uploaded", adminApproval: "—",       status: "waiting-review",deadlineMin: 0,  commissionUsdt: 4.22  },
];

// ─── Disputes (с SLA, эскалацией, перепиской) ───────────────────────────────
const DISPUTES = [
  {
    id: "DSP-452", opened: "27.04 14:55", order: "PI-83408", orderType: "Платежи",
    amount: 18900, merchant: "M-501", merchantName: "BetCity", customer: "Customer #10026",
    trader: "TR-1042", traderName: "Алексей Морозов",
    status: "waiting-admin",
    sla: "23ч 40м", deadline: "28.04 14:55",
    slaTotal: 48*3600, slaRemaining: 23*3600 + 40*60,
    escalated: false, assignedTo: "v.popov",
    reason: "Клиент: оплатил, баланс не пополнился",
    chat: [
      { from: "merchant", ts: "27.04 14:55", text: "Клиент оплатил 18 900 ₽, зачисление не прошло. Прикладываю чек клиента." },
      { from: "merchant", ts: "27.04 14:55", attach: "client_receipt_10026.png" },
      { from: "support",  ts: "27.04 15:10", text: "Запросили выписку по реквизиту у трейдера." },
    ],
  },
  {
    id: "DSP-451", opened: "27.04 13:40", order: "PO-55014", orderType: "Выплаты",
    amount: 56000, merchant: "M-501", merchantName: "BetCity", customer: "Customer #20031",
    trader: "TR-1061", traderName: "Денис Волков",
    status: "waiting-trader",
    sla: "9ч 12м", deadline: "28.04 13:40",
    slaTotal: 48*3600, slaRemaining: 9*3600 + 12*60,
    escalated: false, assignedTo: "n.kuznetsova",
    reason: "Клиент: выплата не пришла на счёт",
    chat: [
      { from: "merchant", ts: "27.04 13:40", text: "Клиент сообщает, что выплата не поступила на карту." },
    ],
  },
  {
    id: "DSP-448", opened: "27.04 13:31", order: "PI-83391", orderType: "Платежи",
    amount: 51000, merchant: "M-501", merchantName: "BetCity", customer: "Customer #10034",
    trader: "TR-1077", traderName: "Роман Петров",
    status: "escalated",
    sla: "просрочен 1ч", deadline: "28.04 13:31",
    slaTotal: 48*3600, slaRemaining: -1*3600,
    escalated: true, assignedTo: "a.smirnov",
    reason: "Платёж не зачислен, чек требует уточнения. Эскалация после просрочки SLA.",
    chat: [
      { from: "merchant", ts: "27.04 13:31", text: "Платёж не зачислился, статус «ошибка»." },
      { from: "support",  ts: "27.04 16:40", text: "SLA нарушен — эскалация на админа." },
    ],
  },
  {
    id: "DSP-447", opened: "26.04 19:10", order: "PI-83390", orderType: "Платежи",
    amount: 11200, merchant: "M-501", merchantName: "BetCity", customer: "Customer #10035",
    trader: "TR-1042", traderName: "Алексей Морозов",
    status: "resolved-merchant",
    sla: "—", deadline: "—",
    escalated: false, assignedTo: "a.smirnov",
    reason: "Резолюция: в пользу мерчанта — подтверждено отсутствие зачисления.",
    decision: "Возврат 11 200 ₽ зачислен на баланс мерчанта.",
    chat: [
      { from: "merchant", ts: "26.04 19:10", text: "Зачисление не подтверждено клиентом." },
      { from: "support",  ts: "27.04 09:00", text: "Резолюция: в пользу мерчанта." },
    ],
  },
  {
    id: "DSP-441", opened: "27.04 11:02", order: "PI-83399", orderType: "Платежи",
    amount: 89200, merchant: "M-503", merchantName: "Casino24", customer: "Customer #10026",
    trader: "TR-1061", traderName: "Денис Волков",
    status: "waiting-trader",
    sla: "23ч 12м", deadline: "28.04 11:02",
    slaTotal: 48*3600, slaRemaining: 23*3600 + 12*60,
    escalated: false,
    assignedTo: "v.popov",
    reason: "Клиент: оплатил, услуги не получил",
    chat: [
      { from: "merchant", ts: "27.04 11:02", text: "Клиент утверждает, что оплатил, баланс не пополнился. Прикладываю чек клиента." },
      { from: "merchant", ts: "27.04 11:02", attach: "client_receipt.png" },
      { from: "support",  ts: "27.04 12:18", text: "Запрашиваю выписку по реквизиту PD-9021 за 13:30–14:00." },
    ],
  },
  {
    id: "DSP-440", opened: "26.04 16:21", order: "PO-55013", orderType: "Выплаты",
    amount: 23800, merchant: "M-503", merchantName: "Casino24", customer: "Customer #20019",
    trader: "TR-1077", traderName: "Роман Петров",
    status: "waiting-admin",
    sla: "8ч 04м", deadline: "28.04 16:21",
    slaTotal: 48*3600, slaRemaining: 8*3600 + 4*60,
    escalated: false,
    assignedTo: "v.popov",
    reason: "Клиент: денег не получил",
    chat: [
      { from: "merchant", ts: "26.04 16:21", text: "Клиент пишет, что выплата не пришла." },
      { from: "trader",   ts: "27.04 09:40", text: "Перевод выполнен в 12:14:55. Прикладываю выписку." },
      { from: "trader",   ts: "27.04 09:40", attach: "trader_bank_app.jpg" },
    ],
  },
  {
    id: "DSP-439", opened: "26.04 09:11", order: "PI-83393", orderType: "Платежи",
    amount: 142000, merchant: "M-503", merchantName: "Casino24", customer: "Customer #10032",
    trader: "TR-1061", traderName: "Денис Волков",
    status: "escalated",
    sla: "просрочен 2ч", deadline: "28.04 09:11",
    slaTotal: 48*3600, slaRemaining: -2*3600,
    escalated: true,
    assignedTo: "a.smirnov",
    reason: "Чек требует уточнения. Эскалирован после просрочки SLA трейдером.",
    chat: [
      { from: "merchant", ts: "26.04 09:11", text: "Платёж зачислен с задержкой и не той суммой" },
      { from: "support",  ts: "26.04 11:00", text: "Запрос трейдеру: выписка" },
      { from: "support",  ts: "27.04 09:11", text: "SLA нарушен — эскалация на админа" },
    ],
  },
  {
    id: "DSP-438", opened: "25.04 14:30", order: "PO-54998", orderType: "Выплаты",
    amount: 33000, merchant: "M-501", merchantName: "BetCity", customer: "Customer #10912",
    trader: "TR-1042", traderName: "Алексей Морозов",
    status: "resolved-trader",
    sla: "—", deadline: "—",
    escalated: false, assignedTo: "a.smirnov",
    reason: "Резолюция: в пользу трейдера. Чек подтверждён.",
    decision: "Заморозка 120 USDT снята.",
    chat: [
      { from: "merchant", ts: "25.04 14:30", text: "Клиент жалуется на отсутствие зачисления." },
      { from: "trader",   ts: "25.04 18:00", text: "Прикладываю чек СБП и выписку." },
      { from: "support",  ts: "26.04 18:00", text: "Резолюция: в пользу трейдера." },
    ],
  },
  {
    id: "DSP-437", opened: "24.04 19:00", order: "PI-83001", orderType: "Платежи",
    amount: 9900, merchant: "M-502", merchantName: "MaxBet", customer: "Customer #10822",
    trader: "TR-1058", traderName: "Тимур Иванов",
    status: "resolved-merchant",
    sla: "—", deadline: "—",
    escalated: false, assignedTo: "a.smirnov",
    reason: "Резолюция: в пользу мерчанта. Подтверждено что трейдер не получил платёж.",
    decision: "Списание 9 900 ₽ × 100% со страхового депозита трейдера.",
    chat: [],
  },
];

// ─── Депозиты трейдеров (страховой + рабочий, в USDT TRC-20) ─────────────────
// Insurance — обеспечение под штрафы/споры. Working — обеспечение под объём операций.
// locked — часть working, замороженная под активные ордера. История ниже.
const DEPOSIT_HISTORY = [
  // TR-1042
  { id: "DH-2210", ts: "27.04 13:48", trader: "TR-1042", kind: "working",   direction: "lock",     amountUsdt: 248.96, balanceAfterUsdt: 4031.54, ref: "PO-3392",  note: "Заморозка под активную выплату" },
  { id: "DH-2209", ts: "27.04 13:22", trader: "TR-1042", kind: "working",   direction: "release",  amountUsdt: 331.95, balanceAfterUsdt: 4280.50, ref: "PO-3387",  note: "Возврат failed Выплаты" },
  { id: "DH-2208", ts: "27.04 11:18", trader: "TR-1042", kind: "insurance", direction: "deposit",  amountUsdt: 500.00, balanceAfterUsdt: 2000.00, ref: "TX 4f8a…b921", note: "Пополнение страхового" },
  { id: "DH-2207", ts: "26.04 22:14", trader: "TR-1042", kind: "insurance", direction: "fine",     amountUsdt:  50.00, balanceAfterUsdt: 1500.00, ref: "DSP-438",  note: "Списание по проигранному спору" },
  { id: "DH-2206", ts: "26.04 18:00", trader: "TR-1042", kind: "working",   direction: "deposit",  amountUsdt: 1000.00,balanceAfterUsdt: 4612.45, ref: "TX 7b2c…d18f", note: "Пополнение рабочего" },
  // TR-1058
  { id: "DH-2205", ts: "27.04 14:08", trader: "TR-1058", kind: "working",   direction: "lock",     amountUsdt: 128.63, balanceAfterUsdt: 8291.37, ref: "PO-3391",  note: "Заморозка под активную выплату" },
  { id: "DH-2204", ts: "27.04 09:15", trader: "TR-1058", kind: "insurance", direction: "deposit",  amountUsdt: 1000.00,balanceAfterUsdt: 3500.00, ref: "TX a92c…4e8b", note: "Пополнение страхового (плановое)" },
  { id: "DH-2203", ts: "25.04 12:30", trader: "TR-1058", kind: "working",   direction: "deposit",  amountUsdt: 2000.00,balanceAfterUsdt: 8420.00, ref: "TX d18f…7b2c", note: "Пополнение рабочего" },
  // TR-1061
  { id: "DH-2202", ts: "27.04 11:48", trader: "TR-1061", kind: "working",   direction: "release",  amountUsdt: 153.53, balanceAfterUsdt: 240.00,  ref: "DSP-440",  note: "Освобождение после спора" },
  { id: "DH-2201", ts: "26.04 14:11", trader: "TR-1061", kind: "insurance", direction: "fine",     amountUsdt: 200.00, balanceAfterUsdt: 1000.00, ref: "DSP-440",  note: "Списание по проигранному спору" },
  { id: "DH-2200", ts: "20.04 10:22", trader: "TR-1061", kind: "insurance", direction: "deposit",  amountUsdt: 1200.00,balanceAfterUsdt: 1200.00, ref: "TX 1102…f4a8", note: "Регистрационный взнос" },
  // TR-1077
  { id: "DH-2199", ts: "27.04 14:06", trader: "TR-1077", kind: "working",   direction: "lock",     amountUsdt:  92.32, balanceAfterUsdt: 3027.68, ref: "PI-7781",  note: "Заморозка под Платежи" },
  { id: "DH-2198", ts: "26.04 18:00", trader: "TR-1077", kind: "working",   direction: "deposit",  amountUsdt: 800.00, balanceAfterUsdt: 3120.00, ref: "TX 8821…2310", note: "Пополнение рабочего" },
  // TR-1101
  { id: "DH-2197", ts: "27.04 13:48", trader: "TR-1101", kind: "working",   direction: "lock",     amountUsdt: 153.53, balanceAfterUsdt: 86.47,   ref: "PI-7775",  note: "Заморозка под спорный Платежи" },
  // TR-1067 — отстранён
  { id: "DH-2196", ts: "24.04 12:00", trader: "TR-1067", kind: "insurance", direction: "fine",     amountUsdt: 1000.00,balanceAfterUsdt: 0.00,    ref: "ST-7698 + DSP-431", note: "Списание после suspend" },
];

// Сводная таблица депозитов всех трейдеров (для раздела «Депозиты»)
const DEPOSITS = [
  { trader: "TR-1042", insuranceUsdt: 2000.00, insuranceMinUsdt: 1500, workingUsdt: 4280.50, workingLockedUsdt: 0,    lastTopUp: "27.04 11:18", status: "ok",        utilization: 0.62 },
  { trader: "TR-1058", insuranceUsdt: 3500.00, insuranceMinUsdt: 2000, workingUsdt: 8420.00, workingLockedUsdt: 1450, lastTopUp: "27.04 09:15", status: "ok",        utilization: 0.81 },
  { trader: "TR-1061", insuranceUsdt: 1000.00, insuranceMinUsdt: 1500, workingUsdt:  240.00, workingLockedUsdt:  480, lastTopUp: "20.04 10:22", status: "low",       utilization: 1.20 }, // ниже минимума
  { trader: "TR-1077", insuranceUsdt: 1200.00, insuranceMinUsdt: 1000, workingUsdt: 1850.20, workingLockedUsdt:    0, lastTopUp: "12.04 14:30", status: "ok",        utilization: 0.40 },
  { trader: "TR-1101", insuranceUsdt: 1000.00, insuranceMinUsdt: 1000, workingUsdt:  240.00, workingLockedUsdt:  480, lastTopUp: "10.04 09:00", status: "depleted",  utilization: 1.00 },
  { trader: "TR-1067", insuranceUsdt:    0.00, insuranceMinUsdt: 1000, workingUsdt:    0.00, workingLockedUsdt:    0, lastTopUp: "—",            status: "frozen",    utilization: 0    },
];

const DEPOSIT_KIND = {
  insurance: { label: "Страховой", tone: "info"    },
  working:   { label: "Рабочий",   tone: "neutral" },
};

const DEPOSIT_DIRECTION = {
  deposit: { label: "Пополнение",       tone: "ok"      },
  withdraw:{ label: "Вывод",            tone: "bad"     },
  fine:    { label: "Штраф / списание", tone: "bad"     },
  lock:    { label: "Заморозка",        tone: "warn"    },
  release: { label: "Освобождение",     tone: "neutral" },
  payout:  { label: "Выплата комиссии", tone: "info"    },
};

const DEPOSIT_STATUS = {
  ok:       { label: "В норме",       tone: "ok"   },
  low:      { label: "Ниже минимума", tone: "warn" },
  depleted: { label: "Исчерпан",      tone: "bad"  },
  frozen:   { label: "Заморожен",     tone: "neutral" },
  blocked:  { label: "Блок",          tone: "bad"  },
};

// ─── Депозитные заявки от трейдеров (требуют подтверждения админом) ─────────
// USDT-перевод трейдера → его рабочий/страховой счёт. После 19 подтверждений
// сети авто-зачисление; админ обрабатывает только то, что зависло (нет TX,
// расхождение суммы, ручной флаг) или большие суммы > 5 000 USDT.
const DEPOSIT_REQUEST_STATUS = {
  pending:    { label: "Ожидает",      tone: "warn"    },
  reviewing:  { label: "На проверке",  tone: "info"    },
  confirmed:  { label: "Подтверждено", tone: "ok"      },
  rejected:   { label: "Отклонено",    tone: "bad"     },
  expired:    { label: "Истекло",      tone: "neutral" },
};

const DEPOSIT_REQUESTS = [
  { id: "DR-10412", ts: "27.04 14:32", trader: "TR-1061", account: "working",
    amount: 8000.00, network: "TRC-20", confirmations: 19, requiredConfirmations: 19,
    wallet: "TQrYa8Pq2nKv9bHfJ7Lm3xZ4dYsN5w8zpN",
    fromAddress: "TJ7m5pQs8Wd2BvN4cYf6aR1eL3oZ9hK0pX",
    txHash: "9a4f8c2bde712f0a4c91be3877bd11a04e2b9c45e1d2a8b3c5d6e7f0a1b2c3d4",
    reason: "Сумма > 5 000 USDT — требуется ручное подтверждение",
    status: "pending" },

  { id: "DR-10411", ts: "27.04 14:18", trader: "TR-1042", account: "working",
    amount: 500.00, network: "TRC-20", confirmations: 12, requiredConfirmations: 19,
    wallet: "TQrYa8Pq2nKv9bHfJ7Lm3xZ4dYsN5w8zpN",
    fromAddress: "TXa8VkPq3sNm1ZfB6yL4hC9dE2wR7uM5jK",
    txHash: "4e8ba91c5e1b71aa1c809b3ebe420a18c4d3f5e6a7b8c9d0e1f2a3b4c5d6e7f8",
    reason: "Ожидание подтверждений сети",
    status: "pending" },

  { id: "DR-10410", ts: "27.04 13:51", trader: "TR-1058", account: "insurance",
    amount: 2000.00, network: "TRC-20", confirmations: 0, requiredConfirmations: 19,
    wallet: "TQrYa8Pq2nKv9bHfJ7Lm3xZ4dYsN5w8zpN",
    fromAddress: "TJ9k4mNb7Yp2eR1aL8cZ5dF6gH3iK0oQpX",
    txHash: null,
    reason: "TX hash не получен от трейдера — ожидание",
    status: "reviewing", assignedTo: "v.popov" },

  { id: "DR-10409", ts: "27.04 12:08", trader: "TR-1077", account: "working",
    amount: 1500.00, network: "TRC-20", confirmations: 0, requiredConfirmations: 19,
    wallet: "TQrYa8Pq2nKv9bHfJ7Lm3xZ4dYsN5w8zpN",
    fromAddress: "TVc7nQa2sLp9MfB4yK1hC6dE8wR3uN7jKx",
    txHash: "1c809b3ebe420a18c4d3f5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6",
    reason: "Расхождение суммы: заявка 1500 / пришло 1495.20",
    status: "reviewing", assignedTo: "a.smirnov" },

  { id: "DR-10408", ts: "27.04 11:14", trader: "TR-1042", account: "insurance",
    amount: 1000.00, network: "TRC-20", confirmations: 19, requiredConfirmations: 19,
    wallet: "TQrYa8Pq2nKv9bHfJ7Lm3xZ4dYsN5w8zpN",
    fromAddress: "TXa8VkPq3sNm1ZfB6yL4hC9dE2wR7uM5jK",
    txHash: "33ab1c809b3ebe420a18c4d3f5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2ee19",
    confirmedAt: "27.04 11:22", confirmedBy: "a.smirnov",
    status: "confirmed" },

  { id: "DR-10407", ts: "27.04 09:00", trader: "TR-1042", account: "working",
    amount: 500.00, network: "TRC-20", confirmations: 19, requiredConfirmations: 19,
    wallet: "TQrYa8Pq2nKv9bHfJ7Lm3xZ4dYsN5w8zpN",
    fromAddress: "TXa8VkPq3sNm1ZfB6yL4hC9dE2wR7uM5jK",
    txHash: "a91cf4d25e1b71aa1c809b3ebe420a18c4d3f5e6a7b8c9d0e1f2a3b4c5d6e7f8",
    confirmedAt: "27.04 09:08", confirmedBy: "system",
    status: "confirmed" },

  { id: "DR-10406", ts: "26.04 18:14", trader: "TR-1101", account: "working",
    amount: 300.00, network: "TRC-20", confirmations: 0, requiredConfirmations: 19,
    wallet: "TQrYa8Pq2nKv9bHfJ7Lm3xZ4dYsN5w8zpN",
    fromAddress: "TM4kBpR2nQa9sLp6FyB1yK8hC4dE3wR0uN5",
    txHash: null,
    rejectedAt: "26.04 18:32", rejectedBy: "a.smirnov",
    rejectionReason: "Не получен платёж в течение 15 минут — заявка отменена",
    status: "expired" },

  { id: "DR-10405", ts: "26.04 16:48", trader: "TR-1067", account: "insurance",
    amount: 1000.00, network: "TRC-20", confirmations: 19, requiredConfirmations: 19,
    wallet: "TQrYa8Pq2nKv9bHfJ7Lm3xZ4dYsN5w8zpN",
    fromAddress: "TZ8nRfP2sBmQ4yL6hC9dE2wR7uM5jKxYpQ",
    txHash: "be420a18c4d3f5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
    rejectedAt: "26.04 17:02", rejectedBy: "v.popov",
    rejectionReason: "Адрес отправителя в blacklist",
    status: "rejected" },
];

const _OBSOLETE = [
  // оставлено для совместимости — не использовать
];

// ─── Withdraw requests (заявки трейдеров на вывод USDT) ─────────────────────
const WITHDRAW_REQUESTS = [
  { id: "WR-3398", ts: "27.04 13:08", trader: "TR-1077", account: "working",
    amount: 185.00, network: "TRC-20",
    wallet: "TXa8VkPq3sNm1ZfB6yL4hC9dE2wR7uM5jK",
    txHash: null,
    reason: "Стандартный вывод по дневной отсечке",
    status: "pending" },

  { id: "WR-3397", ts: "27.04 11:42", trader: "TR-1058", account: "working",
    amount: 800.00, network: "TRC-20",
    wallet: "TVc7nQa2sLp9MfB4yK1hC6dE8wR3uN7jKx",
    txHash: null,
    reason: "Сумма > 500 USDT — требуется ручная проверка",
    status: "reviewing", assignedTo: "a.smirnov" },

  { id: "WR-3396", ts: "27.04 09:20", trader: "TR-1042", account: "working",
    amount: 240.00, network: "TRC-20",
    wallet: "TJ7m5pQs8Wd2BvN4cYf6aR1eL3oZ9hK0pX",
    txHash: "8c2bde712f0a4c91be3877bd11a04e2b9c45e1d2a8b3c5d6e7f0a1b2c3d4e5f6",
    confirmedAt: "27.04 09:34", confirmedBy: "a.smirnov",
    status: "confirmed" },

  { id: "WR-3395", ts: "26.04 22:11", trader: "TR-1042", account: "working",
    amount: 1200.00, network: "TRC-20",
    wallet: "TJ7m5pQs8Wd2BvN4cYf6aR1eL3oZ9hK0pX",
    txHash: null,
    rejectedAt: "26.04 22:48", rejectedBy: "a.smirnov",
    rejectionReason: "Повторная заявка в течение часа — отклонено",
    status: "rejected" },

  { id: "WR-3394", ts: "26.04 18:00", trader: "TR-1061", account: "working",
    amount: 320.00, network: "TRC-20",
    wallet: "TZ8nRfP2sBmQ4yL6hC9dE2wR7uM5jKxYpQ",
    txHash: "f4d25e1b71aa1c809b3ebe420a18c4d3f5e6a7b8c9d0e1f2a3b4c5d6e7f8a91c",
    confirmedAt: "26.04 18:22", confirmedBy: "system",
    status: "confirmed" },

  { id: "WR-3393", ts: "25.04 14:30", trader: "TR-1077", account: "working",
    amount: 420.00, network: "TRC-20",
    wallet: "TM4kBpR2nQa9sLp6FyB1yK8hC4dE3wR0uN5",
    txHash: "1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    confirmedAt: "25.04 15:12", confirmedBy: "v.popov",
    status: "confirmed" },

  { id: "WR-3392", ts: "23.04 11:48", trader: "TR-1077", account: "working",
    amount: 200.00, network: "TRC-20",
    wallet: "TM4kBpR2nQa9sLp6FyB1yK8hC4dE3wR0uN5",
    txHash: null,
    rejectedAt: "23.04 12:20", rejectedBy: "system",
    rejectionReason: "Адрес кошелька не верифицирован",
    status: "expired" },
];

// ─── Tariffs (с overrides по банкам) ────────────────────────────────────────
const TARIFFS = [
  {
    id: "TF-001", name: "Стандарт", status: "active",
    payInMerchant: 3.0, payInTrader: 2.0,
    payOutMerchant: 2.5, payOutTrader: 2.0,
    minCommissionUsdt: 0.30, settlementPolicy: "Еженедельно", withdrawalPolicy: "Ежедневно, без комиссии",
    appliesTo: "По умолчанию",
    bankOverrides: [
      { bank: "B-A", payInTrader: 2.0, payOutTrader: 2.0, min: 100, max: 200000, notes: "—" },
      { bank: "B-B", payInTrader: 2.2, payOutTrader: 2.0, min: 100, max: 150000, notes: "Повышенная ставка Платежи 09:00–21:00" },
      { bank: "B-C", payInTrader: 2.0, payOutTrader: 1.8, min: 100, max: 100000, notes: "—" },
      { bank: "B-D", payInTrader: 1.8, payOutTrader: 1.6, min: 100, max: 80000,  notes: "Только Платежи" },
    ],
    updated: "20.04.2026",
  },
  {
    id: "TF-002", name: "High Volume", status: "active",
    payInMerchant: 2.6, payInTrader: 1.8,
    payOutMerchant: 2.2, payOutTrader: 1.6,
    minCommissionUsdt: 0.30, settlementPolicy: "Еженедельно", withdrawalPolicy: "Ежедневно, без комиссии",
    appliesTo: "TR-1061, TR-1077, M-503",
    bankOverrides: [
      { bank: "B-A", payInTrader: 1.8, payOutTrader: 1.6, min: 100, max: 250000, notes: "—" },
      { bank: "B-B", payInTrader: 2.0, payOutTrader: 1.8, min: 100, max: 200000, notes: "—" },
    ],
    updated: "18.04.2026",
  },
  {
    id: "TF-003", name: "Новичок 30д", status: "active",
    payInMerchant: 3.0, payInTrader: 1.0,
    payOutMerchant: 2.5, payOutTrader: 0.8,
    minCommissionUsdt: 0.30, settlementPolicy: "Раз в 2 недели", withdrawalPolicy: "Раз в неделю, без комиссии",
    appliesTo: "Онбординг (первые 30 дней)",
    bankOverrides: [],
    updated: "12.04.2026",
  },
  {
    id: "TF-005", name: "Legacy 2024", status: "disabled",
    payInMerchant: 2.5, payInTrader: 2.0,
    payOutMerchant: 2.0, payOutTrader: 1.5,
    minCommissionUsdt: 0.50, settlementPolicy: "Ежемесячно", withdrawalPolicy: "Раз в неделю",
    appliesTo: "—",
    bankOverrides: [],
    updated: "30.12.2025",
  },
];

// ─── Auto-rules (автоматические действия) ───────────────────────────────────
const AUTO_RULES = [
  { id: "AR-001", name: "Auto-disable PD при достижении 95% дневного лимита",
    when: "PaymentDetail.dailyUsed >= 0.95",
    then: "PaymentDetail.status = limit-exceeded; уведомить трейдера",
    enabled: true, lastFired: "27.04 14:18", firedToday: 4, firedMonth: 87, scope: "all", priority: 10 },
  { id: "AR-002", name: "Terminal offline >5 мин → отключить реквизиты",
    when: "Terminal.heartbeat > 5min",
    then: "Terminal.status = offline; все его PaymentDetails → terminal-offline",
    enabled: true, lastFired: "27.04 13:31", firedToday: 2, firedMonth: 38, scope: "all", priority: 20 },
  { id: "AR-003", name: "Выплаты просрочен >15 мин → возврат в пул",
    when: "Выплаты.claimedAt + 15min < now AND status = in-progress",
    then: "Выплаты.status = free; trader.rating -= 0.05",
    enabled: true, lastFired: "27.04 13:10", firedToday: 3, firedMonth: 42, scope: "all", priority: 5 },
  { id: "AR-004", name: "Спор без ответа трейдера 24ч → эскалация",
    when: "Dispute.status = waiting-trader AND opened + 24h < now",
    then: "Dispute.status = escalated; assigned = admin",
    enabled: true, lastFired: "27.04 09:11", firedToday: 1, firedMonth: 12, scope: "all", priority: 15 },
  { id: "AR-005", name: "Working balance < минимум → блокировать новые Платежи",
    when: "Trader.workingUsdt < tariff.minWorking",
    then: "Trader.rights.payIn = false; уведомить",
    enabled: true, lastFired: "26.04 22:14", firedToday: 0, firedMonth: 3, scope: "all", priority: 8 },
  { id: "AR-006", name: "Settlement просрочен → suspend трейдера",
    when: "Settlement.status = overdue AND overdue > 24h",
    then: "Trader.status = suspended; уведомить админа",
    enabled: true, lastFired: "24.04 12:00", firedToday: 0, firedMonth: 2, scope: "all", priority: 30 },
  { id: "AR-007", name: "PD > 3 проигранных спора за неделю → заморозить",
    when: "PaymentDetail.disputesLost(7d) >= 3",
    then: "PaymentDetail.status = frozen; уведомить",
    enabled: false, lastFired: "—", firedToday: 0, firedMonth: 0, scope: "all", priority: 40 },
  { id: "AR-008", name: "Платежи клиента не оплачен 15 мин → expired",
    when: "Платежи.status = waiting-payment AND created + 15min < now",
    then: "Платежи.status = expired",
    enabled: true, lastFired: "27.04 14:17", firedToday: 18, firedMonth: 410, scope: "all", priority: 1 },
];

// ─── Audit log ──────────────────────────────────────────────────────────────
const AUDIT_LOG = [
  { id: "L-90220", ts: "27.04 14:34", actor: "a.smirnov", actorRole: "admin",   action: "trader.suspend",       target: "TR-1073",  before: { status: "active" }, after: { status: "suspended" }, reason: "Просроченный settlement и проигранный спор" },
  { id: "L-90219", ts: "27.04 14:18", actor: "system",    actorRole: "system",  action: "auto-rule.fire",       target: "PD-9004",  before: { status: "active" }, after: { status: "limit-exceeded" }, reason: "AR-001: дневной лимит 95%" },
  { id: "L-90218", ts: "27.04 14:00", actor: "v.popov",   actorRole: "support", action: "dispute.message",      target: "DSP-441",  before: null,                   after: null,                       reason: "Запрос выписки трейдеру" },
  { id: "L-90217", ts: "27.04 13:42", actor: "a.smirnov", actorRole: "admin",   action: "tariff.update",        target: "TF-002",   before: { payOutTrader: 1.8 }, after: { payOutTrader: 1.6 },     reason: "Снижение ставки по запросу TR-1061" },
  { id: "L-90216", ts: "27.04 13:31", actor: "system",    actorRole: "system",  action: "auto-rule.fire",       target: "TM-1042-C",before: { status: "online" },   after: { status: "offline" },     reason: "AR-002: heartbeat > 5 мин" },
  { id: "L-90215", ts: "27.04 12:14", actor: "v.popov",   actorRole: "support", action: "dispute.resolve",      target: "DSP-438",  before: { status: "open" },     after: { status: "resolved-trader" }, reason: "Чек подтверждён" },
  { id: "L-90214", ts: "27.04 11:48", actor: "a.smirnov", actorRole: "admin",   action: "withdrawal.approve",   target: "WD-3400",  before: { status: "requested" },after: { status: "approved" },    reason: "—" },
  { id: "L-90213", ts: "27.04 11:02", actor: "system",    actorRole: "system",  action: "dispute.open",         target: "DSP-441",  before: null,                   after: { status: "open" },         reason: "Открыт мерчантом M-503" },
  { id: "L-90212", ts: "27.04 10:18", actor: "a.smirnov", actorRole: "admin",   action: "merchant.update",      target: "M-501",    before: { allowedTraders: ["TR-1042","TR-1058"] }, after: { allowedTraders: ["TR-1042","TR-1058","TR-1077"] }, reason: "Добавлен по запросу мерчанта" },
  { id: "L-90211", ts: "27.04 09:40", actor: "n.kuznetsova", actorRole: "support", action: "payout.proof.review", target: "PO-55014", before: { adminApproval: "pending" }, after: { adminApproval: "approved" }, reason: "Чек читается, сумма совпадает" },
  { id: "L-90210", ts: "27.04 09:00", actor: "a.smirnov", actorRole: "admin",   action: "balance.topup",        target: "TR-1042",  before: { workingUsdt: 3780.50 }, after: { workingUsdt: 4280.50 }, reason: "Пополнение по заявке трейдера +500 USDT" },
  { id: "L-90209", ts: "26.04 22:14", actor: "system",    actorRole: "system",  action: "auto-rule.fire",       target: "TR-1067",  before: { rights: { payIn: true } }, after: { rights: { payIn: false } }, reason: "AR-005: working баланс < минимум" },
  { id: "L-90208", ts: "26.04 16:21", actor: "system",    actorRole: "system",  action: "dispute.open",         target: "DSP-440",  before: null,                   after: { status: "open" },         reason: "Открыт мерчантом M-503" },
  { id: "L-90207", ts: "26.04 14:11", actor: "system",    actorRole: "system",  action: "settlement.overdue",   target: "ST-7698",  before: { status: "in-progress" }, after: { status: "overdue" }, reason: "Просрочен на 2ч" },
  { id: "L-90206", ts: "26.04 11:44", actor: "v.popov",   actorRole: "support", action: "trader.note.add",      target: "TR-1061",  before: null,                   after: null,                       reason: "Замечание: повышенный уровень споров" },
];

// ─── Support queue (открытые дела/тикеты) ───────────────────────────────────
const SUPPORT_QUEUE = [
  { id: "DSP-441", kind: "dispute",   priority: "high",   sla: "23ч 12м", assigned: "v.popov",      subject: "PI-83399 · Casino24 vs TR-1061 · 89 200 ₽", waitingFor: "trader" },
  { id: "DSP-440", kind: "dispute",   priority: "high",   sla: "8ч 04м",  assigned: "v.popov",      subject: "PO-55013 · Casino24 vs TR-1077 · 23 800 ₽", waitingFor: "admin" },
  { id: "DSP-439", kind: "dispute",   priority: "urgent", sla: "просрочен 2ч", assigned: "a.smirnov",subject: "PI-83393 · ESCALATED", waitingFor: "admin" },
  { id: "PO-55020-rev", kind: "payout-proof", priority: "normal", sla: "12 мин", assigned: "n.kuznetsova", subject: "PO-55020 · Чек на проверку · 42 500 ₽", waitingFor: "support" },
  { id: "PO-55012-rev", kind: "payout-proof", priority: "normal", sla: "28 мин", assigned: "n.kuznetsova", subject: "PO-55012 · Чек на проверку · 19 500 ₽", waitingFor: "support" },
  { id: "DH-low-1061",  kind: "deposit",      priority: "high",   sla: "—",       assigned: "a.smirnov",    subject: "TR-1061 · Страховой депозит ниже минимума (1000 / 1500 USDT)", waitingFor: "trader" },
  { id: "DH-dep-1101",  kind: "deposit",      priority: "normal", sla: "—",       assigned: "a.smirnov",    subject: "TR-1101 · Рабочий депозит исчерпан (working = locked)", waitingFor: "trader" },
];

// ─── Ledger (manual ops + автоматические движения) ──────────────────────────
const LEDGER = [
  { id: "L-110", ts: "27.04 09:00", trader: "TR-1042", account: "working",   type: "topup",       amountUsdt: +500.00, ref: null,         actor: "a.smirnov", note: "Ручное пополнение working по заявке трейдера" },
  { id: "L-111", ts: "27.04 14:22", trader: "TR-1042", account: "working",   type: "payin-deduction", amountUsdt: -162.34, ref: "PI-83401", actor: "system",    note: "Платежи списание эквивалента" },
  { id: "L-112", ts: "27.04 14:22", trader: "TR-1042", account: "working",   type: "payin-creditback",amountUsdt: +159.10, ref: "PI-83401", actor: "system",    note: "Платежи возврат с комиссией" },
  { id: "L-113", ts: "27.04 14:22", trader: "TR-1042", account: "working",   type: "commission",  amountUsdt: +3.24,  ref: "PI-83401", actor: "system",    note: "Комиссия 2%" },
  { id: "L-114", ts: "27.04 12:08", trader: "TR-1077", account: "insurance", type: "freeze",      amountUsdt: -180.00,ref: "DSP-440",  actor: "system",    note: "Заморозка по спору" },
  { id: "L-115", ts: "27.04 11:44", trader: "TR-1061", account: "insurance", type: "freeze",      amountUsdt: -1450.00,ref: "DSP-441", actor: "system",    note: "Заморозка по спору 89 200 ₽" },
  { id: "L-116", ts: "26.04 22:00", trader: "TR-1073", account: "insurance", type: "fine",        amountUsdt: -200.00,ref: "DSP-435",  actor: "system",    note: "Штраф за проигранный спор" },
  { id: "L-117", ts: "25.04 11:14", trader: "TR-1042", account: "insurance", type: "topup",       amountUsdt: +1000.00,ref: null,        actor: "a.smirnov", note: "Пополнение страхового депозита по заявке" },
  { id: "L-118", ts: "24.04 16:08", trader: "TR-1042", account: "insurance", type: "release",     amountUsdt: +120.00,ref: "DSP-438",   actor: "system",    note: "Снятие заморозки (резолюция в пользу трейдера)" },
  { id: "L-119", ts: "23.04 18:42", trader: "TR-1058", account: "working",   type: "withdraw",    amountUsdt: -92.40, ref: "WD-3400",  actor: "a.smirnov", note: "Approved" },
];

// ─── Status maps ────────────────────────────────────────────────────────────
const TRADER_STATUS = {
  active:       { label: "Активен",     tone: "ok" },
  suspended:    { label: "Приостановлен", tone: "warn" },
  deactivated:  { label: "Деактивирован",tone: "neutral" },
};

const MERCHANT_STATUS = {
  active:    { label: "Активен",       tone: "ok" },
  suspended: { label: "Приостановлен", tone: "warn" },
  closed:    { label: "Закрыт",        tone: "neutral" },
};

const TERMINAL_STATUS = {
  online:  { label: "Online",          tone: "ok" },
  offline: { label: "Offline",         tone: "bad" },
  blocked: { label: "Заблокирован",    tone: "bad" },
  outdated:{ label: "Нужно обновление",tone: "warn" },
};

const PD_STATUS = {
  active:           { label: "Активен",          tone: "ok" },
  "trader-off":     { label: "Выкл. трейдером",  tone: "neutral" },
  "admin-off":      { label: "Выкл. админом",    tone: "neutral" },
  "terminal-offline":{label: "Терминал offline", tone: "warn" },
  cooldown:         { label: "Cooldown",         tone: "warn" },
  "limit-exceeded": { label: "Лимит исчерпан",   tone: "warn" },
  frozen:           { label: "Заморожен",        tone: "warn" },
  blocked:          { label: "Заблокирован",     tone: "bad"  },
};

const PAY_IN_STATUS = {
  created:           { label: "Создана",         tone: "neutral" },
  matching:          { label: "Ищем реквизит",   tone: "info" },
  "waiting-payment": { label: "Ожидает оплаты",  tone: "warn" },
  completed:         { label: "Успешно",         tone: "ok" },
  "auto-confirmed":  { label: "Успешно (авто)",  tone: "ok" },
  expired:           { label: "Истекло время",   tone: "neutral" },
  failed:            { label: "Ошибка",          tone: "bad" },
  disputed:          { label: "Спор",            tone: "bad" },
  "manual-review":   { label: "Ручная проверка", tone: "warn" },
};

const PAY_OUT_STATUS = {
  free:             { label: "Свободна",         tone: "info" },
  "in-progress":    { label: "В работе",         tone: "warn" },
  "waiting-review": { label: "Проверка чека",    tone: "info" },
  completed:        { label: "Успешно",          tone: "ok"  },
  rejected:         { label: "Отклонена",        tone: "bad" },
  returned:         { label: "Возврат в пул",    tone: "warn" },
  disputed:         { label: "Спор",             tone: "bad" },
  cancelled:        { label: "Отменена",         tone: "neutral" },
};

const DISPUTE_STATUS = {
  open:             { label: "Открыт",                  tone: "warn" },
  "waiting-trader": { label: "Ждём трейдера",           tone: "warn" },
  "waiting-admin":  { label: "Ждём саппорт",            tone: "info" },
  escalated:        { label: "Эскалирован",             tone: "bad"  },
  "resolved-trader":{ label: "В пользу трейдера",       tone: "ok"   },
  "resolved-merchant":{label: "В пользу мерчанта",      tone: "neutral" },
  rejected:         { label: "Отклонён",                tone: "neutral" },
};

const TARIFF_STATUS = {
  active:   { label: "Активен",    tone: "ok" },
  disabled: { label: "Отключён",   tone: "neutral" },
};

const LEDGER_TYPE = {
  topup:               { label: "Пополнение",       tone: "ok"   },
  withdraw:            { label: "Вывод",            tone: "neutral" },
  "payin-deduction":   { label: "Платежи списание",   tone: "neutral" },
  "payin-creditback":  { label: "Платежи зачисление", tone: "info" },
  "payout-credit":     { label: "Выплаты зачисление",tone: "info" },
  commission:          { label: "Комиссия",         tone: "ok"   },
  fine:                { label: "Штраф",            tone: "bad"  },
  freeze:              { label: "Заморозка",        tone: "warn" },
  release:             { label: "Снятие заморозки", tone: "ok"   },
  correction:          { label: "Корректировка",    tone: "neutral" },
};

const SUPPORT_PRIORITY = {
  urgent: { label: "СРОЧНО",  tone: "bad" },
  high:   { label: "Высокий", tone: "warn" },
  normal: { label: "Обычный", tone: "info" },
  low:    { label: "Низкий",  tone: "neutral" },
};

// ─── Aggregated KPI для дашборда ────────────────────────────────────────────
const KPI = {
  todayPayInRub:  PAY_IN.filter((o) => o.status === "completed").reduce((s,o) => s + o.amount, 0),
  todayPayOutRub: PAY_OUT.filter((o) => o.status === "completed").reduce((s,o) => s + o.amount, 0),
  activeTraders:  TRADERS.filter((t) => t.status === "active").length,
  activeMerchants:MERCHANTS.filter((m) => m.status === "active").length,
  onlineTerminals:TERMINALS.filter((t) => t.status === "online").length,
  totalTerminals: TERMINALS.length,
  openDisputes:   DISPUTES.filter((d) => ["open","waiting-trader","waiting-admin","escalated"].includes(d.status)).length,
  escalatedDisputes: DISPUTES.filter((d) => d.status === "escalated").length,
  lowDeposits:    DEPOSITS.filter((d) => ["low","depleted"].includes(d.status)).length,
  payInSuccess:   0.95,
  payOutSuccess:  0.92,
  insuranceLockedTotal: TRADERS.reduce((s,t) => s + (t.balance?.lockedUsdt || 0), 0),
  workingTotalUsdt: TRADERS.reduce((s,t) => s + (t.balance?.workingUsdt || 0), 0),
  insuranceTotalUsdt: TRADERS.reduce((s,t) => s + (t.balance?.insuranceUsdt || 0), 0),
};

// ─── Providers (компании-провайдеры, доступ только по API) ───────────────────
const PROVIDERS = [
  {
    id: "PV-2001", name: "PaySphere LLC", status: "active",
    company: "PaySphere Technologies LLC", country: "Кипр",
    email: "ops@paysphere.io", contact: "+357 25 000-111",
    registered: "04.02.2025", tariff: "TF-001",
    publicKey: "pk_live_8Qf2Kd9LmZ4nR7sT",
    keyCreated: "04.02.2025", keyLast4: "a31b",
    balance: { workingUsdt: 18420.00, lockedUsdt: 640 },
    today: { payInRub: 1284000, payOutRub: 0 },
    counts: { openDisputes: 1 },
    success: 0.98, last: "1 мин назад",
  },
  {
    id: "PV-2014", name: "Nexa Pay GmbH", status: "active",
    company: "Nexa Pay GmbH", country: "Германия",
    email: "api@nexapay.de", contact: "+49 30 555-2200",
    registered: "18.02.2025", tariff: "TF-002",
    publicKey: "pk_live_3Wm7BvT1nQ9pX2cF",
    keyCreated: "18.02.2025", keyLast4: "7c4e",
    balance: { workingUsdt: 9650.00, lockedUsdt: 0 },
    today: { payInRub: 642000, payOutRub: 0 },
    counts: { openDisputes: 0 },
    success: 0.96, last: "4 мин назад",
  },
  {
    id: "PV-2027", name: "FlowGate Ltd", status: "active",
    company: "FlowGate Solutions Ltd", country: "Великобритания",
    email: "support@flowgate.co", contact: "+44 20 7000-3344",
    registered: "02.03.2025", tariff: "TF-001",
    publicKey: "pk_live_6Hd4RnY8kL2mW5bV",
    keyCreated: "02.03.2025", keyLast4: "f902",
    balance: { workingUsdt: 24180.00, lockedUsdt: 1850 },
    today: { payInRub: 1968000, payOutRub: 0 },
    counts: { openDisputes: 2 },
    success: 0.94, last: "только что",
  },
  {
    id: "PV-2033", name: "Aurum Transfer", status: "suspended",
    company: "Aurum Transfer OÜ", country: "Эстония",
    email: "team@aurumtransfer.eu", contact: "+372 600-7788",
    registered: "21.03.2025", tariff: "TF-001",
    publicKey: "pk_live_1Zx9CpQ4tN7rB3mD",
    keyCreated: "21.03.2025", keyLast4: "b15d",
    balance: { workingUsdt: 1240.00, lockedUsdt: 320 },
    today: { payInRub: 0, payOutRub: 0 },
    counts: { openDisputes: 1 },
    success: 0.89, last: "2 ч назад",
  },
  {
    id: "PV-2041", name: "Velar Payments", status: "active",
    company: "Velar Payments Inc.", country: "США",
    email: "integrations@velar.com", contact: "+1 415 200-9090",
    registered: "09.04.2025", tariff: "TF-002",
    publicKey: "pk_live_5Bt2MkL9wD8sH4nQ",
    keyCreated: "09.04.2025", keyLast4: "3a77",
    balance: { workingUsdt: 14920.00, lockedUsdt: 0 },
    today: { payInRub: 1102000, payOutRub: 0 },
    counts: { openDisputes: 0 },
    success: 0.97, last: "6 мин назад",
  },
  {
    id: "PV-2050", name: "Orbit Settle", status: "deactivated",
    company: "Orbit Settle Pte Ltd", country: "Сингапур",
    email: "hello@orbitsettle.sg", contact: "+65 6000-4321",
    registered: "15.04.2025", tariff: "TF-001",
    publicKey: "pk_live_9Lr3FvX6yK1pT8cB",
    keyCreated: "15.04.2025", keyLast4: "d640",
    balance: { workingUsdt: 0, lockedUsdt: 0 },
    today: { payInRub: 0, payOutRub: 0 },
    counts: { openDisputes: 0 },
    success: 0.92, last: "5 дн назад",
  },
];

// ─── Запросы от мерчантов (все входящие API-запросы) ─────────────────────────
const REQUEST_STATUS = {
  success: { label: "Успех", tone: "ok" },
  reject:  { label: "Отказ", tone: "bad" },
};

const REQUESTS = [
  {
    id: "RQ-88012", type: "payin", status: "success", amount: 6400, merchant: "M-501",
    createdAt: "27.04 15:02:01", respondedAt: "27.04 15:02:02", trader: "TR-1042", provider: null,
    order: "PI-83410",
    payload: { event: "payin.create", merchant_order: "bc-9821", amount: 6400, currency: "RUB", method: "sbp", customer: "cust-1187", callback_url: "https://betcity.demo/api/cp/callback" },
  },
  {
    id: "RQ-88011", type: "payin", status: "success", amount: 1500, merchant: "M-502",
    createdAt: "27.04 14:14:11", respondedAt: "27.04 14:14:12", trader: "TR-1058", provider: null,
    order: "PI-83398",
    payload: { event: "payin.create", merchant_order: "mb-1244", amount: 1500, currency: "RUB", method: "sbp", customer: "cust-2251", callback_url: "https://maxbet.demo/api/cp" },
  },
  {
    id: "RQ-88010", type: "payin", status: "reject", amount: 250000, merchant: "M-503",
    createdAt: "27.04 14:15:40", respondedAt: "27.04 14:15:40", trader: null, provider: null,
    order: null, rejectReason: "Нет доступного реквизита под сумму и метод",
    payload: { event: "payin.create", merchant_order: "c24-980", amount: 250000, currency: "RUB", method: "card", customer: "cust-7781" },
  },
  {
    id: "RQ-88009", type: "payout", status: "success", amount: 42500, merchant: "M-503",
    createdAt: "27.04 14:18:00", respondedAt: "27.04 14:24:11", trader: "TR-1042", provider: null,
    order: "PO-55020",
    payload: { event: "payout.create", merchant_order: "c24-po-441", amount: 42500, currency: "RUB", method: "sbp", target: "+7 911 222-33-44", name: "Петров А. А." },
  },
  {
    id: "RQ-88008", type: "payin", status: "success", amount: 24000, merchant: "M-501",
    createdAt: "27.04 14:10:03", respondedAt: "27.04 14:10:04", trader: null, provider: "PV-2014",
    order: "PI-83397",
    payload: { event: "payin.create", merchant_order: "bc-9819", amount: 24000, currency: "RUB", method: "sbp", customer: "cust-3390" },
  },
  {
    id: "RQ-88007", type: "payin", status: "reject", amount: 3000, merchant: "M-504",
    createdAt: "27.04 13:59:22", respondedAt: "27.04 13:59:22", trader: null, provider: null,
    order: null, rejectReason: "Мерчант приостановлен (suspended)",
    payload: { event: "payin.create", merchant_order: "tb-5521", amount: 3000, currency: "RUB", method: "sbp", customer: "cust-1002" },
  },
  {
    id: "RQ-88006", type: "payout", status: "reject", amount: 500000, merchant: "M-502",
    createdAt: "27.04 13:50:14", respondedAt: "27.04 13:50:15", trader: null, provider: null,
    order: null, rejectReason: "Превышен лимит суммы выплаты по тарифу",
    payload: { event: "payout.create", merchant_order: "mb-po-88", amount: 500000, currency: "RUB", method: "card", target: "•••• 7711" },
  },
  {
    id: "RQ-88005", type: "payin", status: "success", amount: 89200, merchant: "M-503",
    createdAt: "27.04 14:18:03", respondedAt: "27.04 14:18:03", trader: "TR-1061", provider: null,
    order: "PI-83399",
    payload: { event: "payin.create", merchant_order: "c24-512", amount: 89200, currency: "RUB", method: "sbp", customer: "cust-5120" },
  },
  {
    id: "RQ-88004", type: "payin", status: "reject", amount: 120, merchant: "M-501",
    createdAt: "27.04 13:30:41", respondedAt: "27.04 13:30:41", trader: null, provider: null,
    order: null, rejectReason: "Сумма ниже минимальной по методу (min 500 ₽)",
    payload: { event: "payin.create", merchant_order: "bc-9808", amount: 120, currency: "RUB", method: "sbp", customer: "cust-0091" },
  },
  {
    id: "RQ-88003", type: "payout", status: "success", amount: 134000, merchant: "M-501",
    createdAt: "27.04 13:48:00", respondedAt: "27.04 13:49:22", trader: "TR-1077", provider: null,
    order: "PO-55018",
    payload: { event: "payout.create", merchant_order: "bc-po-18", amount: 134000, currency: "RUB", method: "sbp", target: "+7 911 444-55-66", name: "Кузнецов В." },
  },
  {
    id: "RQ-88002", type: "payin", status: "success", amount: 7800, merchant: "M-501",
    createdAt: "27.04 13:40:38", respondedAt: "27.04 13:40:40", trader: "TR-1042", provider: null,
    order: "PI-83392",
    payload: { event: "payin.create", merchant_order: "bc-9810", amount: 7800, currency: "RUB", method: "sbp", customer: "cust-8810" },
  },
  {
    id: "RQ-88001", type: "payin", status: "reject", amount: 6700, merchant: "M-503",
    createdAt: "27.04 12:50:00", respondedAt: "27.04 12:50:31", trader: null, provider: null,
    order: null, rejectReason: "Таймаут подбора реквизита (нет активных терминалов)",
    payload: { event: "payin.create", merchant_order: "c24-509", amount: 6700, currency: "RUB", method: "sbp", customer: "cust-5090" },
  },
];

// ─── Вызовы к провайдерам (все исходящие вызовы наших к провайдерам) ─────────
const CALLS = [
  {
    id: "CL-77012", type: "payin", status: "success", amount: 24000, provider: "PV-2014", merchant: "M-501",
    createdAt: "27.04 14:10:03", respondedAt: "27.04 14:10:04", order: "PI-83397",
    payload: { method: "payin.route", ext_order: "bc-9819", amount: 24000, currency: "RUB", method_type: "sbp", callback: "https://cp.internal/hooks/nexa" },
  },
  {
    id: "CL-77011", type: "payout", status: "success", amount: 42500, provider: "PV-2001", merchant: "M-503",
    createdAt: "27.04 14:18:00", respondedAt: "27.04 14:24:11", order: "PO-55020",
    payload: { method: "payout.route", ext_order: "c24-po-441", amount: 42500, currency: "RUB", method_type: "sbp", target: "+7 911 222-33-44", name: "Петров А. А." },
  },
  {
    id: "CL-77010", type: "payin", status: "reject", amount: 54000, provider: "PV-2027", merchant: "M-501",
    createdAt: "27.04 14:28:41", respondedAt: "27.04 14:28:59", order: "PI-83405", rejectReason: "Провайдер принял вызов, но платёж не прошёл (failed на стороне провайдера)",
    payload: { method: "payin.route", ext_order: "bc-9805", amount: 54000, currency: "RUB", method_type: "card" },
  },
  {
    id: "CL-77009", type: "payin", status: "success", amount: 89200, provider: "PV-2041", merchant: "M-503",
    createdAt: "27.04 14:18:03", respondedAt: "27.04 14:18:05", order: "PI-83399",
    payload: { method: "payin.route", ext_order: "c24-512", amount: 89200, currency: "RUB", method_type: "sbp" },
  },
  {
    id: "CL-77008", type: "payout", status: "reject", amount: 7500, provider: "PV-2014", merchant: "M-502",
    createdAt: "27.04 13:30:02", respondedAt: "27.04 13:30:20", order: "PO-55017", rejectReason: "Выплата отклонена провайдером после вызова",
    payload: { method: "payout.route", ext_order: "mb-po-17", amount: 7500, currency: "RUB", method_type: "card", target: "+7 911 555-66-77" },
  },
  {
    id: "CL-77007", type: "payin", status: "success", amount: 6400, provider: "PV-2001", merchant: "M-501",
    createdAt: "27.04 15:02:01", respondedAt: "27.04 15:02:02", order: "PI-83410",
    payload: { method: "payin.route", ext_order: "bc-9821", amount: 6400, currency: "RUB", method_type: "sbp" },
  },
  {
    id: "CL-77006", type: "payin", status: "reject", amount: 2200, provider: "PV-2027", merchant: "M-501",
    createdAt: "27.04 14:40:22", respondedAt: "27.04 14:55:24", order: "PI-83407", rejectReason: "Вызов ушёл провайдеру, клиент не оплатил — истекло время",
    payload: { method: "payin.route", ext_order: "bc-9807", amount: 2200, currency: "RUB", method_type: "sbp" },
  },
  {
    id: "CL-77005", type: "payout", status: "success", amount: 56000, provider: "PV-2041", merchant: "M-501",
    createdAt: "27.04 12:30:00", respondedAt: "27.04 12:31:40", order: "PO-55014",
    payload: { method: "payout.route", ext_order: "bc-po-14", amount: 56000, currency: "RUB", method_type: "card", target: "+7 911 888-99-00" },
  },
  {
    id: "CL-77004", type: "payin", status: "reject", amount: 3200, provider: "PV-2001", merchant: "M-502",
    createdAt: "27.04 14:02:00", respondedAt: "27.04 14:17:01", order: "PI-83396", rejectReason: "Платёж по вызову истёк без оплаты",
    payload: { method: "payin.route", ext_order: "mb-9206", amount: 3200, currency: "RUB", method_type: "sbp" },
  },
  {
    id: "CL-77003", type: "payin", status: "success", amount: 33000, provider: "PV-2014", merchant: "M-503",
    createdAt: "27.04 12:58:00", respondedAt: "27.04 12:58:02", order: "PI-83389",
    payload: { method: "payin.route", ext_order: "c24-889", amount: 33000, currency: "RUB", method_type: "card" },
  },
];

// ─── VIP-клиенты (известные крупные плательщики) ─────────────────────────────
const VIP_STATUS = {
  linked:  { label: "Привязан", tone: "ok" },
  waiting: { label: "Ожидает",  tone: "warn" },
};

const VIPS = [
  { id: "VIP-3001", status: "linked", merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10024", extId: "betcity-usr-4471", createdAt: "18.03.2026",
    traders: [{ trader: "TR-1042", details: "PD-9001" }] },
  { id: "VIP-3002", status: "linked", merchant: "M-501", merchantName: "BetCity",  customer: "Customer #10025", extId: "betcity-usr-5120", createdAt: "05.03.2026",
    traders: [{ trader: "TR-1058", details: "PD-9011" }, { trader: "TR-1042", details: "PD-9001" }] },
  { id: "VIP-3003", status: "linked", merchant: "M-503", merchantName: "Casino24", customer: "Customer #10026", extId: "c24-uid-88102", createdAt: "11.02.2026",
    traders: [{ trader: "TR-1042", details: "PD-9002" }, { trader: "TR-1061", details: "PD-9021" }] },
  { id: "VIP-3004", status: "linked", merchant: "M-502", merchantName: "MaxBet",   customer: "Customer #10028", extId: "mb-player-2207", createdAt: "22.01.2026",
    traders: [{ trader: "TR-1077", details: "PD-9041" }, { trader: "TR-1042", details: "PD-9003" }] },
  { id: "VIP-3005", status: "waiting", merchant: "M-502", merchantName: "MaxBet",   customer: "Customer #10031", extId: "mb-player-3390", createdAt: "27.04.2026", traders: [] },
  { id: "VIP-3006", status: "waiting", merchant: "M-503", merchantName: "Casino24", customer: "Customer #10036", extId: "c24-uid-90455", createdAt: "26.04.2026", traders: [] },
];

// ─── Navigation ─────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",  label: "Главная",       icon: "◇" },
  { id: "merchants",  label: "Мерчанты",      icon: "▢", count: MERCHANTS.filter((m) => m.status === "active").length },
  { id: "traders",    label: "Трейдеры",      icon: "◉", count: TRADERS.filter((t) => t.status === "active").length },
  { id: "providers",  label: "Провайдеры",    icon: "◎", count: PROVIDERS.filter((p) => p.status === "active").length },
  { id: "teams",      label: "Команды",       icon: "⌗", count: new Set(TRADERS.map((t) => t.team).filter(Boolean)).size },
  { id: "referrals",  label: "Рефералы",      icon: "⁂", count: new Set(MERCHANTS.map((m) => m.referral).filter(Boolean)).size },
  { id: "cascade",    label: "Каскад",         icon: "⋔" },
  { id: "payin",      label: "Платежи",       icon: "↘", count: PAY_IN.filter((o) => ["waiting-payment","manual-review","disputed"].includes(o.status)).length },
  { id: "payout",     label: "Выплаты",       icon: "↗", count: PAY_OUT.filter((o) => ["free","in-progress","waiting-review"].includes(o.status)).length },
  { id: "disputes",   label: "Споры",         icon: "✕", count: DISPUTES.filter((d) => ["open","waiting-trader","waiting-admin","escalated"].includes(d.status)).length },
  { id: "requests",   label: "Запросы",       icon: "▤", count: REQUESTS.filter((r) => r.status === "reject").length },
  { id: "calls",      label: "Вызовы",        icon: "▤", count: CALLS.filter((c) => c.status === "reject").length },
  { id: "terminals",  label: "Терминалы",     icon: "▣", count: TERMINALS.filter((t) => t.status === "online").length },
  { id: "details",    label: "Реквизиты",     icon: "≡", count: PAYMENT_DETAILS.filter((p) => p.status === "active").length },
  { id: "vip",        label: "VIP",           icon: "★", count: VIPS.filter((v) => v.status === "waiting").length },
  { id: "deposits",   label: "Депозиты",       icon: "◈", count: DEPOSITS.filter((d) => ["low","depleted"].includes(d.status)).length },
  { id: "withdrawals", label: "Выводы",         icon: "○", count: WITHDRAW_REQUESTS.filter((d) => d.status === "pending" || d.status === "reviewing").length },
  { id: "ledger",     label: "Финансы",       icon: "₿" },
  { id: "recon",      label: "Сверка",        icon: "≡" },
  { id: "tariffs",    label: "Тарифы",        icon: "%" },
  { id: "audit",      label: "Audit log",     icon: "▤" },
  { id: "operators",  label: "Операторы",     icon: "⌨" },
  { id: "permissions", label: "Права",         icon: "✓" },
  { id: "banks",      label: "Банки",          icon: "▤" },
  { id: "rates",      label: "Курсы обмена",   icon: "⇄" },
  { id: "ai",         label: "ИИ",            icon: "✦" },
];

const NAV_GROUPS = [
  { label: "",             ids: ["dashboard", "support"] },
  { label: "Контрагенты",  ids: ["merchants", "providers", "traders", "teams", "referrals", "cascade"] },
  { label: "Операции",     ids: ["payin", "payout", "disputes", "requests", "calls"] },
  { label: "Инфраструктура", ids: ["terminals", "details", "vip"] },
  { label: "Деньги",       ids: ["deposits", "withdrawals", "ledger", "recon", "tariffs"] },
  { label: "Системные",    ids: ["audit", "operators", "permissions", "banks", "rates", "ai"] },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmtMoney(v, currency = "RUB") {
  const sign = v < 0 ? "−" : "";
  const abs = Math.abs(v);
  let formatted;
  if (currency === "USDT") {
    formatted = abs.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    formatted = Math.round(abs).toLocaleString("ru-RU");
  }
  const symbol = currency === "RUB" ? " ₽" : currency === "USDT" ? " USDT" : " " + currency;
  return sign + formatted + symbol;
}

function bankName(id) {
  const b = BANKS.find((x) => x.id === id);
  return b ? b.name : id;
}

function traderName(id) {
  const t = TRADERS.find((x) => x.id === id);
  return t ? t.name : id;
}

function merchantName(id) {
  const m = MERCHANTS.find((x) => x.id === id);
  return m ? m.name : id;
}

function operatorName(login) {
  const o = OPERATORS.find((x) => x.login === login);
  return o ? o.name : login;
}

// ─── Customer display names (имя + скрытый ID) ──────────────────────────────
const CUSTOMER_NAMES = {
  "Customer #10024": "Игорь Лебедев",
  "Customer #10025": "Анна Соколова",
  "Customer #10026": "Дмитрий Орлов",
  "Customer #10027": "Мария Зайцева",
  "Customer #10028": "Павел Никитин",
  "Customer #10029": "Елена Беляева",
  "Customer #10030": "Кирилл Фомин",
  "Customer #10031": "Ольга Третьякова",
  "Customer #10032": "Андрей Гусев",
  "Customer #10033": "Наталья Ковалёва",
  "Customer #10034": "Сергей Логинов",
  "Customer #10035": "Виктория Панова",
  "Customer #10036": "Роман Ефимов",
  "Customer #20019": "Лев Кудрин",
  "Customer #20024": "Артур Белов",
  "Customer #20025": "Лидия Маркова",
  "Customer #20026": "Степан Гордеев",
  "Customer #20027": "Вера Силина",
  "Customer #20028": "Глеб Тарасов",
  "Customer #20029": "Юлия Дорохова",
  "Customer #20030": "Антон Шилов",
  "Customer #20031": "Карина Носова",
  "Customer #20032": "Эдуард Зуев",
};
function customerDisplay(c) {
  const m = String(c || "").match(/#(\d+)/);
  const id = m ? "#" + m[1] : null;
  const name = CUSTOMER_NAMES[c] || (id ? c.replace(/Customer\s*/i, "Клиент ") : c);
  return { name, id };
}

Object.assign(window, {
  ME_ADMIN, OPERATORS, BANKS,
  MERCHANTS, TRADERS, PROVIDERS, TERMINALS, PAYMENT_DETAILS,
  PAY_IN, PAY_OUT, DISPUTES,
  DEPOSITS, DEPOSIT_HISTORY, DEPOSIT_REQUESTS, DEPOSIT_REQUEST_STATUS, WITHDRAW_REQUESTS,
  TARIFFS, AUTO_RULES, AUDIT_LOG, SUPPORT_QUEUE, LEDGER,
  TRADER_STATUS, MERCHANT_STATUS, TERMINAL_STATUS, PD_STATUS,
  PAY_IN_STATUS, PAY_OUT_STATUS, DISPUTE_STATUS,
  DEPOSIT_STATUS, DEPOSIT_KIND, DEPOSIT_DIRECTION,
  TARIFF_STATUS,
  LEDGER_TYPE, SUPPORT_PRIORITY,
  KPI, NAV, NAV_GROUPS,
  REQUESTS, REQUEST_STATUS,
  VIPS, VIP_STATUS,
  CALLS,
  fmtMoney, bankName, traderName, merchantName, operatorName,
  CUSTOMER_NAMES, customerDisplay,
});
