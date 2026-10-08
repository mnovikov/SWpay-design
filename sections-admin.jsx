/* ── sections-admin.jsx ────────────────────────────────────────────────────
 * Admin-only sections per TЗ v4 п.5.8:
 *   - Merchants (CRUD + tabs)
 *   - Support Queue + Role switcher
 *   - Ledger / Manual balance ops
 *   - Auto-rules
 *   - Audit log
 *   - Operators
 *   - Расширенный Dashboard
 *   - DisputeDrawer SLA + эскалация (mount-and-replace pattern)
 *
 * Использует window.* из data.jsx + примитивы (Btn, Section, KV, Tabs, ...).
 */

// ── Local mock data (не ломаем существующее inline-data) ───────────────────

const ADMIN_OPERATORS = [
  { id: "OP-001", login: "a.smirnov",     name: "Артём Смирнов",   role: "admin",   active: true,  online: true,  ticketsToday: 24, casesOpen: 3 },
  { id: "OP-002", login: "v.popov",       name: "Виктор Попов",    role: "support", active: true,  online: true,  ticketsToday: 18, casesOpen: 5 },
  { id: "OP-003", login: "n.kuznetsova",  name: "Нина Кузнецова",  role: "support", active: true,  online: true,  ticketsToday: 12, casesOpen: 2 },
  { id: "OP-004", login: "i.fedorov",     name: "Иван Фёдоров",    role: "support", active: false, online: false, ticketsToday: 0,  casesOpen: 0 },
];

const ADMIN_MERCHANTS = [
  {
    id: "M-501", name: "BetCity", status: "active", joined: "12.01.24",
    contactPerson: "Денис Афанасьев", email: "ops@betcity.demo", telegram: "@betcity_ops",
    balanceRub: 2_840_000, frozenRub: 320_000,
    todayPayInRub: 1_240_000, todayPayOutRub: 482_000, todayCount: 450, todayPayOutCount: 84, success: 0.96,
    monthPayInRub: 38_220_000, monthPayOutRub: 12_400_000,
    tariff: "TF-001", payInRate: 3.0, payOutRate: 2.5,
    apiKeys: [
      { id: "AK-9001", label: "Production", ip: "94.180.110.0/24", lastUsed: "сейчас", status: "active" },
      { id: "AK-9002", label: "Backup",     ip: "—",                lastUsed: "вчера", status: "active" },
    ],
    allowedTraders: ["TR-1042", "TR-1058", "TR-1077"],
    blockedTraders: ["TR-1073"],
    webhookUrl: "https://api.betcity.demo/crowdpay/callback",
    webhookSecret: "wh_•••• 4421",
    notes: "Ключевой клиент. Менеджер: А. Смирнов",
  },
  {
    id: "M-502", name: "MaxBet", status: "active", joined: "18.02.24",
    contactPerson: "Олег Кириллов", email: "tech@maxbet.demo", telegram: "@maxbet_tech",
    balanceRub: 1_120_000, frozenRub: 84_000,
    todayPayInRub: 624_000, todayPayOutRub: 218_000, todayCount: 219, todayPayOutCount: 38, success: 0.94,
    monthPayInRub: 18_460_000, monthPayOutRub: 6_820_000,
    tariff: "TF-001", payInRate: 3.0, payOutRate: 2.5,
    apiKeys: [
      { id: "AK-9011", label: "Production", ip: "188.42.50.0/24", lastUsed: "2 мин назад", status: "active" },
    ],
    allowedTraders: [], blockedTraders: [],
    webhookUrl: "https://maxbet.demo/api/cp",
    webhookSecret: "wh_•••• 8821",
    notes: "",
  },
  {
    id: "M-503", name: "Casino24", status: "active", joined: "03.03.24",
    contactPerson: "Алина Шевченко", email: "ops@casino24.demo", telegram: "—",
    balanceRub: 480_000, frozenRub: 124_000,
    todayPayInRub: 386_000, todayPayOutRub: 142_000, todayCount: 135, todayPayOutCount: 24, success: 0.91,
    monthPayInRub: 11_240_000, monthPayOutRub: 4_120_000,
    tariff: "TF-002", payInRate: 2.6, payOutRate: 2.2,
    apiKeys: [
      { id: "AK-9021", label: "Production", ip: "—", lastUsed: "10 мин назад", status: "active" },
    ],
    allowedTraders: [], blockedTraders: ["TR-1061"],
    webhookUrl: "https://api.casino24.demo/cp",
    webhookSecret: "wh_•••• 1102",
    notes: "Повышенный уровень споров — следить",
  },
  {
    id: "M-504", name: "TopBet", status: "suspended", joined: "14.04.24",
    contactPerson: "Михаил Гордеев", email: "—", telegram: "—",
    balanceRub: 0, frozenRub: 24_000,
    todayPayInRub: 0, todayPayOutRub: 0, todayCount: 0, todayPayOutCount: 0, success: 0,
    monthPayInRub: 0, monthPayOutRub: 0,
    tariff: "TF-001", payInRate: 3.0, payOutRate: 2.5,
    apiKeys: [],
    allowedTraders: [], blockedTraders: [],
    webhookUrl: "", webhookSecret: "",
    notes: "Приостановлен 25.04 за подделку чека (DSP-435)",
  },
];

const ADMIN_AUTO_RULES = [
  { id: "AR-001", name: "Auto-disable PD при 95% дневного лимита", scope: "PaymentDetail",
    when: "PaymentDetail.dailyUsed ≥ 0.95", then: "PaymentDetail.status → frozen + notify Trader",
    enabled: true,  firedToday: 4,  lastFired: "27.04 13:04" },
  { id: "AR-002", name: "Auto-suspend Trader при 3+ просроченных settlement", scope: "Trader",
    when: "Trader.overdueSettlements ≥ 3", then: "Trader.status → suspended + notify Admin",
    enabled: true,  firedToday: 0,  lastFired: "24.04 14:30" },
  { id: "AR-003", name: "Auto-release Выплаты при frozen > 30 минут", scope: "Выплаты",
    when: "Выплаты.frozenSince > 30m", then: "Создать DSP + notify Admin",
    enabled: true,  firedToday: 1,  lastFired: "27.04 12:42" },
  { id: "AR-004", name: "Auto-flag Платежи manual-review при > 100 000 ₽", scope: "Платежи",
    when: "Платежи.amount > 100000 RUB", then: "Платежи.status → manual-review",
    enabled: true,  firedToday: 7,  lastFired: "27.04 14:18" },
  { id: "AR-005", name: "Auto-escalate Dispute если SLA < 4ч", scope: "Dispute",
    when: "Dispute.slaRemaining < 4h",  then: "Dispute.priority → urgent + assign admin",
    enabled: true,  firedToday: 2,  lastFired: "27.04 11:02" },
  { id: "AR-006", name: "Auto-pause Terminal при offline > 30 минут",  scope: "Terminal",
    when: "Terminal.offlineSince > 30m", then: "Terminal.routing → off",
    enabled: false, firedToday: 0,  lastFired: "—" },
];

const ADMIN_AUDIT = [
  { id: "L-90220", ts: "27.04 14:34", actor: "a.smirnov",     role: "admin",   action: "trader.suspend",         target: "TR-1073",  reason: "Нарушение SLA по settlement" },
  { id: "L-90219", ts: "27.04 14:18", actor: "system",        role: "system",  action: "auto-rule.fire",         target: "PD-9004",  reason: "AR-001 fired" },
  { id: "L-90218", ts: "27.04 14:02", actor: "v.popov",       role: "support", action: "dispute.message",        target: "DSP-441",  reason: "Запрос доказательства" },
  { id: "L-90217", ts: "27.04 13:48", actor: "a.smirnov",     role: "admin",   action: "merchant.balance.add",   target: "M-501",    reason: "Возврат комиссии за тех.сбой" },
  { id: "L-90216", ts: "27.04 13:30", actor: "system",        role: "system",  action: "settlement.overdue",     target: "ST-7698",  reason: "Просрочка > 24ч" },
  { id: "L-90215", ts: "27.04 13:12", actor: "a.smirnov",     role: "admin",   action: "tariff.update",          target: "TF-002",   reason: "Снижение Платежи 1.7 → 1.6%" },
  { id: "L-90214", ts: "27.04 12:54", actor: "n.kuznetsova",  role: "support", action: "withdrawal.approve",     target: "WD-3400",  reason: "—" },
  { id: "L-90213", ts: "27.04 12:42", actor: "system",        role: "system",  action: "auto-rule.fire",         target: "PO-55016", reason: "AR-003 fired" },
  { id: "L-90212", ts: "27.04 12:30", actor: "a.smirnov",     role: "admin",   action: "trader.balance.adjust",  target: "TR-1042",  reason: "Manual top-up по тикету #128" },
  { id: "L-90211", ts: "27.04 12:08", actor: "v.popov",       role: "support", action: "dispute.open",           target: "DSP-441",  reason: "Жалоба от Casino24" },
  { id: "L-90210", ts: "27.04 11:48", actor: "a.smirnov",     role: "admin",   action: "merchant.create",        target: "M-505",    reason: "Onboarding LuckyClub" },
  { id: "L-90209", ts: "27.04 11:22", actor: "system",        role: "system",  action: "payout.assign",          target: "PO-55020", reason: "Trader claimed" },
  { id: "L-90208", ts: "27.04 11:02", actor: "a.smirnov",     role: "admin",   action: "auto-rule.toggle",       target: "AR-006",   reason: "Disabled — false positives" },
  { id: "L-90207", ts: "27.04 10:33", actor: "n.kuznetsova",  role: "support", action: "settlement.confirm",     target: "ST-7699",  reason: "Чек подтверждён" },
];

const ADMIN_SUPPORT_QUEUE = [
  { id: "DSP-441", kind: "dispute",    priority: "high",   sla: "23ч 12м", assigned: "v.popov",      subject: "PI-83399 · Casino24 vs TR-1061 · 89 200 ₽",      waitingFor: "trader" },
  { id: "DSP-440", kind: "dispute",    priority: "high",   sla: "8ч 04м",  assigned: "v.popov",      subject: "PO-55013 · Casino24 vs TR-1077 · 23 800 ₽",     waitingFor: "admin" },
  { id: "DSP-439", kind: "dispute",    priority: "urgent", sla: "3ч 48м",  assigned: "a.smirnov",    subject: "PI-83393 · BetCity vs TR-1061 · 142 000 ₽",     waitingFor: "admin" },
  { id: "WD-3401", kind: "withdrawal", priority: "normal", sla: "—",       assigned: "n.kuznetsova", subject: "TR-1042 · 48 000 ₽ · Заявка на вывод процентов", waitingFor: "support" },
  { id: "WD-3399", kind: "withdrawal", priority: "high",   sla: "—",       assigned: "—",            subject: "TR-1061 · 120 000 ₽ · Большая сумма",            waitingFor: "support" },
  { id: "ST-7701", kind: "settlement", priority: "normal", sla: "—",       assigned: "—",            subject: "TR-1061 · 480 000 ₽ · Чек загружен",             waitingFor: "support" },
  { id: "ST-7698", kind: "settlement", priority: "urgent", sla: "просрочен 14ч", assigned: "a.smirnov", subject: "TR-1058 · 18 500 ₽ · Просрочен",                  waitingFor: "trader" },
  { id: "TKT-021", kind: "ticket",     priority: "normal", sla: "—",       assigned: "n.kuznetsova", subject: "TR-1077: вопрос по тарифу TF-002",               waitingFor: "support" },
  { id: "TKT-020", kind: "ticket",     priority: "low",    sla: "—",       assigned: "—",            subject: "M-502: запрос на повышение лимитов",             waitingFor: "support" },
];

const ADMIN_LEDGER = [
  { id: "L-110", ts: "27.04 09:00", trader: "TR-1042", account: "working",   type: "topup",        amountUsdt: +500.00, ref: "TX 7b2c…d18f", actor: "a.smirnov", note: "Ручное пополнение working" },
  { id: "L-111", ts: "27.04 14:22", trader: "TR-1042", account: "working",   type: "payin-deduct", amountUsdt: -162.34, ref: "PI-83401",  actor: "system",    note: "Списание эквивалента 4800₽ + комиссия 2.0%" },
  { id: "L-112", ts: "27.04 14:21", trader: "TR-1042", account: "working",   type: "payin-deduct", amountUsdt: -42.20,  ref: "PI-83400",  actor: "system",    note: "12500₽ + комиссия 2.0%" },
  { id: "L-113", ts: "27.04 14:18", trader: "TR-1061", account: "working",   type: "freeze",       amountUsdt: -300.00, ref: "DSP-441",   actor: "system",    note: "Hold 89 200₽ под спор" },
  { id: "L-114", ts: "27.04 12:30", trader: "TR-1042", account: "insurance", type: "topup",        amountUsdt: +200.00, ref: "TX 4f8a…b921", actor: "a.smirnov", note: "Manual top-up по тикету #128" },
  { id: "L-115", ts: "27.04 11:14", trader: "TR-1061", account: "working",   type: "settlement",   amountUsdt: -1614.00,ref: "ST-7701",   actor: "system",    note: "Возврат недельного оборота" },
  { id: "L-116", ts: "27.04 09:14", trader: "TR-1077", account: "working",   type: "withdraw",     amountUsdt: -185.00, ref: "WD-3398",   actor: "a.smirnov", note: "Выплата процентов" },
  { id: "L-117", ts: "26.04 22:01", trader: "TR-1042", account: "working",   type: "withdraw",     amountUsdt: -240.00, ref: "WD-3397",   actor: "a.smirnov", note: "Отклонено — повтор" },
  { id: "L-118", ts: "26.04 17:48", trader: "TR-1077", account: "working",   type: "settlement",   amountUsdt: -1056.00,ref: "ST-7699",   actor: "system",    note: "Возврат после спора" },
  { id: "L-119", ts: "26.04 14:11", trader: "TR-1058", account: "working",   type: "settlement",   amountUsdt: -185.00, ref: "ST-7698",   actor: "system",    note: "Просрочен" },
  { id: "L-120", ts: "26.04 12:00", trader: "TR-1042", account: "insurance", type: "release",      amountUsdt: -50.00,  ref: "DSP-438",   actor: "a.smirnov", note: "Возврат hold по DSP-438" },

  // ── Платежи deductions / commissions / creditbacks ──
  { id: "L-121", ts: "27.04 15:02", trader: "TR-1042", account: "working",   type: "commission",   amountUsdt: +3.24,  ref: "PI-83401", actor: "system",    note: "Комиссия 2% Платежи" },
  { id: "L-122", ts: "27.04 14:58", trader: "TR-1058", account: "working",   type: "payin-deduct", amountUsdt: -86.20, ref: "PI-83399", actor: "system",    note: "25 000₽ + комиссия 1.6%" },
  { id: "L-123", ts: "27.04 14:58", trader: "TR-1058", account: "working",   type: "commission",   amountUsdt: +1.72,  ref: "PI-83399", actor: "system",    note: "Комиссия 1.6%" },
  { id: "L-124", ts: "27.04 14:31", trader: "TR-1077", account: "working",   type: "payin-deduct", amountUsdt: -54.18, ref: "PI-83398", actor: "system",    note: "16 000₽ + комиссия 2.0%" },
  { id: "L-125", ts: "27.04 14:30", trader: "TR-1077", account: "working",   type: "commission",   amountUsdt: +1.08,  ref: "PI-83398", actor: "system",    note: "Комиссия 2%" },
  { id: "L-126", ts: "27.04 13:42", trader: "TR-1061", account: "working",   type: "payin-deduct", amountUsdt: -28.04, ref: "PI-83395", actor: "system",    note: "8 280₽ + комиссия 2.0%" },
  { id: "L-127", ts: "27.04 13:18", trader: "TR-1042", account: "working",   type: "payin-creditback", amountUsdt: +12.40, ref: "PI-83390", actor: "system", note: "Возврат failed Платежи" },
  { id: "L-128", ts: "27.04 13:18", trader: "TR-1042", account: "working",   type: "commission",   amountUsdt: -0.25,  ref: "PI-83390", actor: "system",    note: "Возврат комиссии" },

  // ── Выплаты credits / commissions ──
  { id: "L-129", ts: "27.04 13:48", trader: "TR-1042", account: "working",   type: "payout-credit", amountUsdt: +248.96, ref: "PO-3392",  actor: "system", note: "Выплаты 73 600₽ выполнен" },
  { id: "L-130", ts: "27.04 13:48", trader: "TR-1042", account: "working",   type: "commission",    amountUsdt: +4.98,  ref: "PO-3392",  actor: "system", note: "Комиссия 2.0% Выплаты" },
  { id: "L-131", ts: "27.04 13:22", trader: "TR-1042", account: "working",   type: "release",       amountUsdt: +331.95,ref: "PO-3387",  actor: "system", note: "Освобождение hold по PO-3387" },
  { id: "L-132", ts: "27.04 12:55", trader: "TR-1058", account: "working",   type: "payout-credit", amountUsdt: +428.20, ref: "PO-3389", actor: "system", note: "Выплаты 126 400₽ выполнен" },
  { id: "L-133", ts: "27.04 12:55", trader: "TR-1058", account: "working",   type: "commission",    amountUsdt: +6.42,  ref: "PO-3389",  actor: "system", note: "Комиссия 1.5%" },
  { id: "L-134", ts: "27.04 11:48", trader: "TR-1061", account: "working",   type: "release",       amountUsdt: +153.53, ref: "DSP-440", actor: "system", note: "Освобождение hold по DSP-440" },
  { id: "L-135", ts: "27.04 10:30", trader: "TR-1077", account: "working",   type: "payout-credit", amountUsdt: +92.32, ref: "PO-3385",  actor: "system", note: "Выплаты 27 200₽ выполнен" },

  // ── Top-ups (USDT TRC-20) ──
  { id: "L-136", ts: "27.04 11:18", trader: "TR-1042", account: "insurance", type: "topup",         amountUsdt: +500.00, ref: "TX 4f8a…b921", actor: "system",   note: "Депозит USDT (19/19 conf)" },
  { id: "L-137", ts: "27.04 09:15", trader: "TR-1058", account: "working",   type: "topup",         amountUsdt: +2000.00, ref: "TX a92c…4e8b", actor: "system",   note: "Депозит USDT (19/19 conf)" },
  { id: "L-138", ts: "26.04 18:00", trader: "TR-1042", account: "working",   type: "topup",         amountUsdt: +1000.00, ref: "TX 7b2c…d18f", actor: "system",   note: "Депозит USDT (19/19 conf)" },
  { id: "L-139", ts: "25.04 12:30", trader: "TR-1058", account: "working",   type: "topup",         amountUsdt: +2000.00, ref: "TX d18f…7b2c", actor: "system",   note: "Депозит USDT (19/19 conf)" },
  { id: "L-140", ts: "20.04 10:22", trader: "TR-1061", account: "insurance", type: "topup",         amountUsdt: +1200.00, ref: "TX 1102…f4a8", actor: "system",   note: "Регистрационный депозит" },
  { id: "L-141", ts: "12.04 14:30", trader: "TR-1077", account: "insurance", type: "topup",         amountUsdt: +1200.00, ref: "TX 9c45…b831", actor: "system",   note: "Регистрационный депозит" },

  // ── Fines / freezes / corrections ──
  { id: "L-142", ts: "26.04 22:14", trader: "TR-1042", account: "insurance", type: "fine",          amountUsdt: -50.00,  ref: "DSP-438", actor: "system",    note: "Штраф по проигранному спору" },
  { id: "L-143", ts: "26.04 14:11", trader: "TR-1061", account: "insurance", type: "fine",          amountUsdt: -200.00, ref: "DSP-440", actor: "system",    note: "Штраф по проигранному спору" },
  { id: "L-144", ts: "24.04 12:00", trader: "TR-1073", account: "insurance", type: "fine",          amountUsdt: -1000.00,ref: "DSP-431", actor: "system",    note: "Штраф 3+ overdue settlements" },
  { id: "L-145", ts: "27.04 12:08", trader: "TR-1077", account: "insurance", type: "freeze",        amountUsdt: -180.00, ref: "DSP-440", actor: "system",    note: "Заморозка под спор" },
  { id: "L-146", ts: "27.04 11:44", trader: "TR-1061", account: "insurance", type: "freeze",        amountUsdt: -1450.00,ref: "DSP-441", actor: "system",    note: "Заморозка под спор 89 200₽" },
  { id: "L-147", ts: "23.04 17:30", trader: "TR-1042", account: "working",   type: "correction",    amountUsdt: -12.50,  ref: "—",        actor: "a.smirnov", note: "Корректировка курса по тикету #94" },
  { id: "L-148", ts: "22.04 10:42", trader: "TR-1077", account: "working",   type: "correction",    amountUsdt: +6.80,   ref: "—",        actor: "v.popov",   note: "Возврат после расследования" },

  // ── Withdrawals ──
  { id: "L-149", ts: "25.04 18:12", trader: "TR-1058", account: "working",   type: "withdraw",      amountUsdt: -800.00,  ref: "WD-3392", actor: "a.smirnov", note: "Вывод на TRC-20" },
  { id: "L-150", ts: "24.04 14:30", trader: "TR-1042", account: "working",   type: "withdraw",      amountUsdt: -1200.00, ref: "WD-3388", actor: "a.smirnov", note: "Вывод на TRC-20" },
  { id: "L-151", ts: "23.04 11:48", trader: "TR-1077", account: "working",   type: "withdraw",      amountUsdt: -420.00,  ref: "WD-3382", actor: "a.smirnov", note: "Вывод на TRC-20" },

  // ── Earlier history ──
  { id: "L-152", ts: "21.04 14:02", trader: "TR-1058", account: "working",   type: "payin-deduct",  amountUsdt: -118.20, ref: "PI-83202", actor: "system",    note: "34 600₽ + комиссия 1.6%" },
  { id: "L-153", ts: "20.04 09:18", trader: "TR-1061", account: "working",   type: "payout-credit", amountUsdt: +312.40, ref: "PO-3340",  actor: "system",    note: "Выплаты 92 200₽ выполнен" },
  { id: "L-154", ts: "19.04 16:55", trader: "TR-1042", account: "working",   type: "settlement",    amountUsdt: -1820.00,ref: "ST-7682",  actor: "system",    note: "Недельный settlement" },
  { id: "L-155", ts: "18.04 12:30", trader: "TR-1077", account: "working",   type: "topup",         amountUsdt: +1500.00, ref: "TX 6e21…a907", actor: "system", note: "Депозит USDT" },
  { id: "L-156", ts: "16.04 22:14", trader: "TR-1073", account: "working",   type: "freeze",        amountUsdt: -240.00, ref: "DSP-428",  actor: "system",    note: "Заморозка под спор" },
  { id: "L-157", ts: "14.04 10:08", trader: "TR-1082", account: "working",   type: "topup",         amountUsdt: +300.00, ref: "TX f201…48cb", actor: "system",  note: "Депозит USDT" },
  { id: "L-158", ts: "12.04 17:24", trader: "TR-1082", account: "working",   type: "correction",    amountUsdt: -300.00, ref: "—",        actor: "a.smirnov", note: "Деактивация — возврат остатка" },
];

// Bank-overrides для тарифов (доп.данные на TARIFFS)
const TARIFF_BANK_OVERRIDES = {
  "TF-001": [
    { bank: "B-A", payInShare: "2.0%", payOutShare: "1.5%", note: "—" },
    { bank: "B-B", payInShare: "2.2%", payOutShare: "1.6%", note: "Повышенный риск" },
    { bank: "B-C", payInShare: "2.0%", payOutShare: "1.5%", note: "—" },
    { bank: "B-D", payInShare: "2.4%", payOutShare: "1.8%", note: "Низкий success" },
  ],
  "TF-002": [
    { bank: "B-A", payInShare: "1.6%", payOutShare: "1.2%", note: "—" },
    { bank: "B-B", payInShare: "1.7%", payOutShare: "1.3%", note: "—" },
  ],
};

const MERCHANT_PAYOUTS = {
  "M-501": [
    { id: "MP-2201", ts: "27.04 09:14", amountUsdt: 18420.50, txHash: "0xa42f9c1b8d4e2710f8c5a93b176d2f1eaa9b3c5704d6e8b1c9a7f2d8e4b5a6c7", actor: "a.smirnov" },
    { id: "MP-2188", ts: "25.04 14:02", amountUsdt: 22150.00, txHash: "0xb71e3d4f9a1c8b2e7f5d6a9c3e1b4d8f2a6c5e9b7d3f1a8c4e6b2d9f5a7c3e1b", actor: "a.smirnov" },
    { id: "MP-2174", ts: "22.04 11:48", amountUsdt: 31280.75, txHash: "0xc52d8a1e4f9b3c7d6e2a5f8b1c4d7e9a3b6f2c8d5e1a4b7c9d3f6e2a8b5c1d4f", actor: "v.popov" },
    { id: "MP-2160", ts: "18.04 10:30", amountUsdt: 14080.00, txHash: "0xd83f7e2c1b6a4d9e5f8c3b1a7d2e6f9c4b8a5d1e3f7c2b6a9d4e8f1c5b3a7e2d", actor: "a.smirnov" },
  ],
  "M-502": [
    { id: "MP-2195", ts: "26.04 16:21", amountUsdt: 9840.20, txHash: "0xe94a5b3c8d1f7e2a6b4c9d5e1f8a3b7c2d6e9f4a1b8c5d3e7f2a9b6c4d1e8f3a", actor: "a.smirnov" },
    { id: "MP-2170", ts: "20.04 13:05", amountUsdt: 12450.00, txHash: "0xf05b6c4d9e2a8b3c7d1f5e9a4b6c2d8e1f7a3b9c5d6e4f2a8b1c7d3e9f5a6b2c", actor: "a.smirnov" },
  ],
  "M-503": [
    { id: "MP-2192", ts: "26.04 09:48", amountUsdt: 5280.40, txHash: "0x1a6c7d4e9f2b8a5c3d1e6f4a9b7c2d5e8f1a3b6c9d4e7f2a5b8c1d3e6f9a4b7c", actor: "v.popov" },
  ],
  "M-504": [],
};

Object.assign(window, {
  ADMIN_OPERATORS, ADMIN_MERCHANTS, ADMIN_AUTO_RULES, ADMIN_AUDIT,
  ADMIN_SUPPORT_QUEUE, ADMIN_LEDGER,
  TARIFF_BANK_OVERRIDES,
  MERCHANT_PAYOUTS,
});

// ── Section: Merchants ─────────────────────────────────────────────────────
function SectionMerchants() {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const all = ADMIN_MERCHANTS;
  const filters = [
    { id: "all", label: "Все", count: all.length },
    { id: "active", label: "Active", count: all.filter((m) => m.status === "active").length },
    { id: "suspended", label: "Suspended", count: all.filter((m) => m.status === "suspended").length },
  ];
  const list = filter === "all" ? all : all.filter((m) => m.status === filter);
  const open = openId ? all.find((m) => m.id === openId) : null;

  return (
    <>
      <PageHead
        title="Мерчанты"
        sub="Юр.лица, для которых процессим платежи. Балансы, ключи, allowed-traders."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters.map((f) => ({ value: f.value != null ? f.value : f.id, label: f.label, count: f.count }))} align="left" />
        <Btn variant="primary" size="sm" style={{ borderRadius: 999, padding: "6px 14px", fontSize: 13, marginLeft: "auto" }} onClick={() => setShowAdd(true)}>Добавить мерчанта</Btn>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Статус</th>
              <th>Мерчант</th>
              <th>Контакт</th>
              <th className="num">Сегодня Платежи</th>
              <th className="num">Сегодня Выплаты</th>
              <th className="num">Баланс</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} onClick={() => setOpenId(m.id)} className={openId === m.id ? "is-selected" : ""}>
                <td><StatusPill map={MERCHANT_STATUS} value={m.status} /></td>
                <td>
                  <div className="cell-stack">
                    <strong>{m.name}</strong>
                    <span className="mono muted">{m.id}</span>
                  </div>
                </td>
                <td>
                  <div className="cell-stack">
                    <span>{m.contactPerson}</span>
                    <span className="mono muted">{m.telegram}</span>
                  </div>
                </td>
                <td className="num">
                  {fmtMoney(m.todayPayInRub / 92.4, "USDT")}
                  <div className="muted" style={{ fontSize: 11 }}>{m.todayCount} ord · {Math.round(m.success * 100)}%</div>
                </td>
                <td className="num">
                  {fmtMoney(m.todayPayOutRub / 92.4, "USDT")}
                  {m.todayPayOutCount > 0 && <div className="muted" style={{ fontSize: 11 }}>{m.todayPayOutCount} ord</div>}
                </td>
                <td className="num">
                  {(m.balanceRub / 92.4).toFixed(2)} <span className="muted">USDT</span>
                  {m.frozenRub > 0 && <div className="muted" style={{ fontSize: 11 }}>frozen {(m.frozenRub / 92.4).toFixed(0)}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-foot">
          <span>{list.length} из {all.length} мерчантов</span>
        </div>
      </div>
      {open && <MerchantDrawer merchant={open} onClose={() => setOpenId(null)} />}
      {showAdd && <AddMerchantModal onClose={() => setShowAdd(false)} />}
    </>
  );
}

// ── Merchant tariff (per-method, редактируемые строки + добавление) ────────
const TARIFF_METHOD_LABELS = { sbp: "СБП", card: "Карта", c2c: "C2C", phone: "Phone", account: "Счёт" };
const TARIFF_METHOD_OPTIONS = Object.keys(TARIFF_METHOD_LABELS).map((v) => ({ value: v, label: TARIFF_METHOD_LABELS[v] }));

// ── Запросы мерчанта (в дровере) ──────────────────────────────────────────
function MerchantRequestsTab({ m }) {
  const [openId, setOpenId] = React.useState(null);
  const [period, setPeriod] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [methodFilter, setMethodFilter] = React.useState("all");
  const raw = (typeof REQUESTS !== "undefined" ? REQUESTS : []).filter((r) => r.merchant === m.id);

  const PERIOD_CHIPS = [
    { value: "hour",      label: "Час" },
    { value: "today",     label: "Сегодня" },
    { value: "yesterday", label: "Вчера" },
    { value: "month",     label: "Месяц" },
    { value: "all",       label: "Всё" },
  ];
  // Запросы живут на одной дате (демо): «Час» отсекаем по времени,
  // «Вчера» — заведомо пусто, остальные периоды показывают всё.
  const toMin = (ts) => {
    const x = /(\d{2}):(\d{2}):(\d{2})/.exec(ts || "");
    return x ? (+x[1]) * 60 + (+x[2]) + (+x[3]) / 60 : 0;
  };
  const latest = raw.reduce((mx, r) => Math.max(mx, toMin(r.createdAt)), 0);
  const inPeriod = (r) => {
    if (period === "yesterday") return false;
    if (period === "hour") return toMin(r.createdAt) >= latest - 60;
    return true;
  };
  const all = raw.filter((r) =>
    inPeriod(r) &&
    (statusFilter === "all" || r.status === statusFilter) &&
    (methodFilter === "all" || (r.payload && r.payload.method === methodFilter))
  );

  const statusOptions = [
    { value: "all",     label: "Все статусы" },
    { value: "success", label: "Успех" },
    { value: "reject",  label: "Отказ" },
  ];
  const methodOptions = [
    { value: "all", label: "Все методы" },
    ...Array.from(new Set(raw.map((r) => r.payload && r.payload.method).filter(Boolean))).map((mt) => ({ value: mt, label: METHOD_LABEL[mt] || mt })),
  ];

  const done = all.filter((r) => r.status === "success").length;
  const pct = all.length ? Math.round(done / all.length * 100) : 0;
  // Конверсия платежей: среди запросов, создавших платёж/выплату, — сколько реально завершилось успешно
  const orderStatus = (r) => {
    if (!r.order) return null;
    const pool = r.type === "payin" ? (typeof PAY_IN !== "undefined" ? PAY_IN : []) : (typeof PAY_OUT !== "undefined" ? PAY_OUT : []);
    const o = pool.find((x) => x.id === r.order);
    return o ? o.status : null;
  };
  const OK_ORDER = ["completed", "auto-confirmed", "settled", "confirmed"];
  const withOrder = all.filter((r) => r.order);
  const paidOk = withOrder.filter((r) => OK_ORDER.includes(orderStatus(r))).length;
  const payPct = withOrder.length ? Math.round(paidOk / withOrder.length * 100) : 0;
  const open = all.find((r) => r.id === openId);
  const provName = (id) => {
    const p = (typeof PROVIDERS !== "undefined" ? PROVIDERS : []).find((x) => x.id === id);
    return p ? p.name : id;
  };
  return (
    <>
      <FilterChips filters={PERIOD_CHIPS} value={period} onChange={setPeriod} />
      <div className="section">
        <div className="stat-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
          <Stat label="Конверсия запросов" value={pct + "%"} delta={`${done} из ${all.length} успешно`} />
          <Stat label="Конверсия платежей" value={payPct + "%"} delta={`${paidOk} из ${withOrder.length} завершено`} />
        </div>
      </div>
      <Section title={`Запросы мерчанта (${all.length})`}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }} />
          <ChipSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="Статус" />
          <ChipSelect value={methodFilter} onChange={setMethodFilter} options={methodOptions} placeholder="Метод" />
        </div>
        {all.length === 0 ? <Empty>Запросов по фильтру нет</Empty> : (
          <table className="table table--inset">
            <thead><tr>
              <th>Статус</th>
              <th className="num">Сумма</th>
              <th>Исполнитель</th>
              <th>Метод</th>
              <th>Дата</th>
            </tr></thead>
            <tbody>
              {all.map((r) => (
                <tr key={r.id} onClick={() => setOpenId(r.id)} style={{ cursor: "pointer" }}>
                  <td>
                    <StatusPill map={REQUEST_STATUS} value={r.status} />
                    <div className="mono muted" style={{ fontSize: 11, marginTop: 3 }}>{r.type === "payin" ? "платёж" : "выплата"}</div>
                  </td>
                  <td className="num"><strong>{fmtMoney(r.amount, "RUB")}</strong></td>
                  <td>{r.trader ? traderName(r.trader) : r.provider ? provName(r.provider) : <span className="muted">—</span>}</td>
                  <td>{r.payload && r.payload.method ? <span className={"pd-card__method pd-card__method--" + r.payload.method}>{METHOD_LABEL[r.payload.method] || r.payload.method}</span> : <span className="muted">—</span>}</td>
                  <td className="mono muted">{r.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
      {open && (
        <StackedDrawer title="Запрос" id={open.id} status={open.status} statusMap={REQUEST_STATUS} onClose={() => setOpenId(null)} wide>
          <Section title="Данные запроса">
            <KV items={[
              ["Статус", <StatusPill map={REQUEST_STATUS} value={open.status} />],
              ["Тип", open.type === "payin" ? "Платёж (payin)" : "Выплата (payout)"],
              ["Сумма", <><strong>{fmtMoney(open.amount, "RUB")}</strong> <span className="muted">· {(open.amount / 92.4).toFixed(2)} USDT</span></>],
              ["Дата заявки", <span className="mono">{open.createdAt}</span>],
              ["Дата ответа", <span className="mono">{open.respondedAt}</span>],
              ["Трейдер / провайдер", open.trader
                ? <a className="link-cell" style={{ cursor: "pointer", color: "var(--accent)" }} onClick={() => window.__adminGo && window.__adminGo("traders", open.trader)}><strong>{traderName(open.trader)}</strong> <span className="mono muted">· {open.trader}</span></a>
                : open.provider
                ? <a className="link-cell" style={{ cursor: "pointer", color: "var(--accent)" }} onClick={() => window.__adminGo && window.__adminGo("providers", open.provider)}><strong>{provName(open.provider)}</strong> <span className="mono muted">· {open.provider}</span></a>
                : <span className="muted">—</span>],
              ["Платёж / выплата", open.order
                ? (() => {
                    const pool = open.type === "payin" ? (typeof PAY_IN !== "undefined" ? PAY_IN : []) : (typeof PAY_OUT !== "undefined" ? PAY_OUT : []);
                    const o = pool.find((x) => x.id === open.order);
                    const smap = open.type === "payin" ? PAY_IN_STATUS : PAY_OUT_STATUS;
                    return o
                      ? <a className="link-cell" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }} onClick={() => window.__adminGo && window.__adminGo(open.type, open.order)}>
                          <strong style={{ color: "var(--accent)" }}>{fmtMoney(o.amount, "RUB")}</strong>
                          <span className="mono muted">{o.date}</span>
                          <StatusPill map={smap} value={o.status} />
                        </a>
                      : <a className="link-cell" style={{ cursor: "pointer", color: "var(--accent)" }} onClick={() => window.__adminGo && window.__adminGo(open.type, open.order)}><span className="mono">{open.order} ↗</span></a>;
                  })()
                : <span className="muted">— не создан</span>],
              ...(open.status === "reject" && open.rejectReason ? [["Причина отказа", <span style={{ color: "var(--bad)" }}>{open.rejectReason}</span>]] : []),
            ]} />
          </Section>
          <Section title="Текст запроса">
            <pre style={{ margin: 0, padding: "12px 14px", borderRadius: 10, background: "var(--paper-2)", border: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6, color: "var(--ink-2)", overflowX: "auto", whiteSpace: "pre" }}>{JSON.stringify(open.payload, null, 2)}</pre>
          </Section>
        </StackedDrawer>
      )}
    </>
  );
}

function MerchantCallsTab({ m }) {
  const [openId, setOpenId] = React.useState(null);
  const [period, setPeriod] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [methodFilter, setMethodFilter] = React.useState("all");
  const raw = (typeof CALLS !== "undefined" ? CALLS : []).filter((c) => c.merchant === m.id);
  const provName = (id) => {
    const p = (typeof PROVIDERS !== "undefined" ? PROVIDERS : []).find((x) => x.id === id);
    return p ? p.name : id;
  };

  const PERIOD_CHIPS = [
    { value: "hour",      label: "Час" },
    { value: "today",     label: "Сегодня" },
    { value: "yesterday", label: "Вчера" },
    { value: "month",     label: "Месяц" },
    { value: "all",       label: "Всё" },
  ];
  const toMin = (ts) => {
    const x = /(\d{2}):(\d{2}):(\d{2})/.exec(ts || "");
    return x ? (+x[1]) * 60 + (+x[2]) + (+x[3]) / 60 : 0;
  };
  const latest = raw.reduce((mx, c) => Math.max(mx, toMin(c.createdAt)), 0);
  const inPeriod = (c) => {
    if (period === "yesterday") return false;
    if (period === "hour") return toMin(c.createdAt) >= latest - 60;
    return true;
  };

  const statusOptions = [
    { value: "all",     label: "Все статусы" },
    { value: "success", label: "Успех" },
    { value: "reject",  label: "Отказ" },
  ];
  const methodOptions = [
    { value: "all", label: "Все методы" },
    ...Array.from(new Set(raw.map((c) => c.payload && c.payload.method_type).filter(Boolean))).map((mt) => ({ value: mt, label: METHOD_LABEL[mt] || mt })),
  ];

  const all = raw.filter((c) =>
    inPeriod(c) &&
    (statusFilter === "all" || c.status === statusFilter) &&
    (methodFilter === "all" || (c.payload && c.payload.method_type === methodFilter))
  );

  const done = all.filter((c) => c.status === "success").length;
  const pct = all.length ? Math.round(done / all.length * 100) : 0;
  const open = raw.find((c) => c.id === openId);

  return (
    <>
      <FilterChips filters={PERIOD_CHIPS} value={period} onChange={setPeriod} />
      <div className="section">
        <div className="stat-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
          <Stat label="Всего вызовов" value={all.length} delta={`${done} успешно`} />
          <Stat label="Конверсия вызовов" value={pct + "%"} delta={`${done} из ${all.length}`} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }} />
        <ChipSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="Статус" />
        <ChipSelect value={methodFilter} onChange={setMethodFilter} options={methodOptions} placeholder="Метод" />
      </div>
      <Section title={`Вызовы по мерчанту (${all.length})`}>
        {all.length === 0 ? <Empty>Вызовов пока не было</Empty> : (
          <table className="table table--inset">
            <thead><tr>
              <th>Статус</th>
              <th className="num">Сумма</th>
              <th>Провайдер</th>
              <th>Метод</th>
              <th>Дата</th>
            </tr></thead>
            <tbody>
              {all.map((c) => (
                <tr key={c.id} onClick={() => setOpenId(c.id)} style={{ cursor: "pointer" }}>
                  <td>
                    <StatusPill map={REQUEST_STATUS} value={c.status} />
                    <div className="mono muted" style={{ fontSize: 11, marginTop: 3 }}>{c.type === "payin" ? "платёж" : "выплата"}</div>
                  </td>
                  <td className="num"><strong>{fmtMoney(c.amount, "RUB")}</strong></td>
                  <td>{provName(c.provider)}</td>
                  <td>{c.payload && c.payload.method_type ? <span className={"pd-card__method pd-card__method--" + c.payload.method_type}>{METHOD_LABEL[c.payload.method_type] || c.payload.method_type}</span> : <span className="muted">—</span>}</td>
                  <td className="mono muted">{c.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
      {open && (
        <StackedDrawer title="Вызов" id={open.id} status={open.status} statusMap={REQUEST_STATUS} onClose={() => setOpenId(null)} wide>
          <Section title="Данные вызова">
            <KV items={[
              ["Статус", <StatusPill map={REQUEST_STATUS} value={open.status} />],
              ["Тип", open.type === "payin" ? "Платёж (payin)" : "Выплата (payout)"],
              ["Сумма", <><strong>{fmtMoney(open.amount, "RUB")}</strong> <span className="muted">· {(open.amount / 92.4).toFixed(2)} USDT</span></>],
              ["Метод", open.payload && open.payload.method_type ? <span className={"pd-card__method pd-card__method--" + open.payload.method_type}>{METHOD_LABEL[open.payload.method_type] || open.payload.method_type}</span> : <span className="muted">—</span>],
              ["Дата заявки", <span className="mono">{open.createdAt}</span>],
              ["Дата ответа", <span className="mono">{open.respondedAt}</span>],
              ["Провайдер", <a className="link-cell" style={{ cursor: "pointer", color: "var(--accent)" }} onClick={() => window.__adminGo && window.__adminGo("providers", open.provider)}><strong>{provName(open.provider)}</strong> <span className="mono muted">· {open.provider}</span></a>],
              ["Платёж / выплата", open.order
                ? (() => {
                    const pool = open.type === "payin" ? (typeof PAY_IN !== "undefined" ? PAY_IN : []) : (typeof PAY_OUT !== "undefined" ? PAY_OUT : []);
                    const o = pool.find((x) => x.id === open.order);
                    const smap = open.type === "payin" ? PAY_IN_STATUS : PAY_OUT_STATUS;
                    return o
                      ? <a className="link-cell" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }} onClick={() => window.__adminGo && window.__adminGo(open.type, open.order)}>
                          <strong style={{ color: "var(--accent)" }}>{fmtMoney(o.amount, "RUB")}</strong>
                          <span className="mono muted">{o.date}</span>
                          <StatusPill map={smap} value={o.status} />
                        </a>
                      : <a className="link-cell" style={{ cursor: "pointer", color: "var(--accent)" }} onClick={() => window.__adminGo && window.__adminGo(open.type, open.order)}><span className="mono">{open.order} ↗</span></a>;
                  })()
                : <span className="muted">— не создан</span>],
              ...(open.status === "reject" && open.rejectReason ? [["Причина отказа", <span style={{ color: "var(--bad)" }}>{open.rejectReason}</span>]] : []),
            ]} />
          </Section>
          <Section title="Текст запроса">
            <pre style={{ margin: 0, padding: "12px 14px", borderRadius: 10, background: "var(--paper-2)", border: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6, color: "var(--ink-2)", overflowX: "auto", whiteSpace: "pre" }}>{JSON.stringify(open.payload, null, 2)}</pre>
          </Section>
          <Section title="Текст ответа">
            <pre style={{ margin: 0, padding: "12px 14px", borderRadius: 10, background: "var(--paper-2)", border: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6, color: "var(--ink-2)", overflowX: "auto", whiteSpace: "pre" }}>{JSON.stringify(open.response || (open.status === "success"
              ? { status: "success", call_id: open.id, order_id: open.order || null, provider: open.provider, method: open.payload && open.payload.method_type, responded_at: open.respondedAt }
              : { status: "reject", call_id: open.id, error: open.rejectReason || "rejected", responded_at: open.respondedAt }), null, 2)}</pre>
          </Section>
        </StackedDrawer>
      )}
    </>
  );
}

function MerchantTariffTab({ m }) {
  const [tab, setTab] = React.useState("payin");
  const [editing, setEditing] = React.useState(null); // index of row being edited
  const [methods, setMethods] = React.useState({
    payIn: [
      { method: "sbp",     rate: 12.0, min: 100,  max: 100000 },
      { method: "card",    rate: 12.3, min: 500,  max: 200000 },
      { method: "c2c",     rate: 12.5, min: 1000, max: 150000 },
      { method: "phone",   rate: 12.2, min: 100,  max: 100000 },
      { method: "account", rate: 12.8, min: 5000, max: 500000 },
    ],
    payOut: [
      { method: "sbp",     rate: 4.0, min: 100,  max: 100000 },
      { method: "card",    rate: 4.3, min: 500,  max: 150000 },
      { method: "c2c",     rate: 4.5, min: 1000, max: 150000 },
      { method: "phone",   rate: 4.2, min: 100,  max: 100000 },
      { method: "account", rate: 4.8, min: 5000, max: 500000 },
    ],
  });

  const key = tab === "payin" ? "payIn" : "payOut";
  const rows = methods[key];
  const setRow = (i, patch) => {
    setMethods((prev) => ({ ...prev, [key]: prev[key].map((r, idx) => idx === i ? { ...r, ...patch } : r) }));
  };
  const removeRow = (i) => {
    setMethods((prev) => ({ ...prev, [key]: prev[key].filter((_, idx) => idx !== i) }));
    setEditing(null);
  };
  const addRow = () => {
    setMethods((prev) => ({ ...prev, [key]: [...prev[key], { method: "sbp", rate: tab === "payin" ? 12.0 : 4.0, min: 100, max: 100000 }] }));
    setEditing(rows.length); // open the new row for editing
  };

  const numStyle = (w) => ({ fontFamily: "var(--font-mono)", fontSize: 12.5, width: w, padding: "4px 8px", textAlign: "right" });

  return (
    <Section title="Ставки по платёжным методам">
      <FilterChips
        filters={[
          { value: "payin",  label: "Платежи",  count: methods.payIn.length },
          { value: "payout", label: "Выплаты", count: methods.payOut.length },
        ]}
        value={tab}
        onChange={(v) => { setTab(v); setEditing(null); }}
      />
      <table className="table table--inset">
        <thead><tr>
          <th>Метод</th>
          <th className="num">Ставка (мерчанту)</th>
          <th className="num">Мин. сумма</th>
          <th className="num">Макс. сумма</th>
          <th style={{ width: 130 }}></th>
        </tr></thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={5}><Empty>Нет ставок — добавьте строку</Empty></td></tr>
          ) : rows.map((mm, i) => {
            const isEdit = editing === i;
            return (
              <tr key={i}>
                <td>
                  {isEdit ? (
                    <select className="field__input" style={{ fontSize: 12.5, width: 110, padding: "4px 8px" }}
                      value={mm.method} onChange={(e) => setRow(i, { method: e.target.value })}>
                      {TARIFF_METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <span className={"pd-card__method pd-card__method--" + mm.method}>
                      {TARIFF_METHOD_LABELS[mm.method] || mm.method}
                    </span>
                  )}
                </td>
                <td className="num mono">
                  {isEdit ? (
                    <input className="field__input" style={numStyle(72)}
                      value={mm.rate} onChange={(e) => setRow(i, { rate: parseFloat(e.target.value) || 0 })} />
                  ) : (Number(mm.rate).toFixed(1) + "%")}
                </td>
                <td className="num mono">
                  {isEdit ? (
                    <input className="field__input" style={numStyle(96)}
                      value={mm.min} onChange={(e) => setRow(i, { min: parseInt(e.target.value) || 0 })} />
                  ) : fmtMoney(mm.min, "RUB")}
                </td>
                <td className="num mono">
                  {isEdit ? (
                    <input className="field__input" style={numStyle(110)}
                      value={mm.max} onChange={(e) => setRow(i, { max: parseInt(e.target.value) || 0 })} />
                  ) : fmtMoney(mm.max, "RUB")}
                </td>
                <td className="num">
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {isEdit ? (
                      <Btn variant="primary" size="sm" onClick={() => setEditing(null)}>Готово</Btn>
                    ) : (
                      <Btn variant="ghost" size="sm" onClick={() => setEditing(i)}>Редактировать</Btn>
                    )}
                    <button className="btn btn--ghost" title="Удалить строку" style={{ padding: "4px 8px", fontSize: 14, lineHeight: 1 }}
                      onClick={() => removeRow(i)}>✕</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 10 }}>
        <Btn variant="ghost" size="sm" onClick={addRow}>＋ Добавить строку</Btn>
      </div>
    </Section>
  );
}

// ── Add Merchant Modal (контакты + тарифы по методам) ──────────────────────
function AddMerchantModal({ onClose, merchant }) {
  const isEdit = !!merchant;
  const [name, setName] = React.useState(merchant?.name || "");
  const [contactPerson, setContactPerson] = React.useState(merchant?.contactPerson || "");
  const [email, setEmail] = React.useState(merchant?.email || "");
  const [telegram, setTelegram] = React.useState(merchant?.telegram || "");
  const [referral, setReferral] = React.useState(
    merchant?.referral ?? ((typeof MERCHANTS !== "undefined" && MERCHANTS.find((x) => x.id === merchant?.id)?.referral) || "")
  );
  const referralNames = (typeof MERCHANTS !== "undefined")
    ? Array.from(new Set(MERCHANTS.map((x) => x.referral).filter(Boolean)))
    : [];
  const referralOptions = [{ value: "", label: "— без реферала —" }, ...referralNames.map((n) => ({ value: n, label: n }))];

  const inBase  = merchant ? (merchant.payInRate  || 12) : 12;
  const outBase = merchant ? (merchant.payOutRate || 4)  : 4;
  const [tariffTab, setTariffTab] = React.useState("payin");
  const [methods, setMethods] = React.useState({
    payIn: [
      { method: "sbp",     rate: +(inBase + 0.0).toFixed(1), min: 100,  max: 100000 },
      { method: "card",    rate: +(inBase + 0.3).toFixed(1), min: 500,  max: 200000 },
      { method: "c2c",     rate: +(inBase + 0.5).toFixed(1), min: 1000, max: 150000 },
      { method: "phone",   rate: +(inBase + 0.2).toFixed(1), min: 100,  max: 100000 },
      { method: "account", rate: +(inBase + 0.8).toFixed(1), min: 5000, max: 500000 },
    ],
    payOut: [
      { method: "sbp",     rate: +(outBase + 0.0).toFixed(1), min: 100,  max: 100000 },
      { method: "card",    rate: +(outBase + 0.3).toFixed(1), min: 500,  max: 150000 },
      { method: "c2c",     rate: +(outBase + 0.5).toFixed(1), min: 1000, max: 150000 },
      { method: "phone",   rate: +(outBase + 0.2).toFixed(1), min: 100,  max: 100000 },
      { method: "account", rate: +(outBase + 0.8).toFixed(1), min: 5000, max: 500000 },
    ],
  });

  const key = tariffTab === "payin" ? "payIn" : "payOut";
  const rows = methods[key];
  const setRow = (i, patch) => {
    const next = methods[key].map((r, idx) => idx === i ? { ...r, ...patch } : r);
    setMethods({ ...methods, [key]: next });
  };
  const removeRow = (i) => {
    setMethods((prev) => ({ ...prev, [key]: prev[key].filter((_, idx) => idx !== i) }));
  };
  const addRow = () => {
    setMethods((prev) => ({ ...prev, [key]: [...prev[key], { method: "sbp", rate: tariffTab === "payin" ? inBase : outBase, min: 100, max: 100000 }] }));
  };

  const canCreate = name.trim().length >= 2 && contactPerson.trim().length >= 2;

  return (
    <Modal
      title={isEdit ? "Редактировать мерчанта" : "Новый мерчант"}
      onClose={onClose}
      wide
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <span className="spacer" />
        <Btn variant="primary" disabled={!canCreate} onClick={onClose}>{isEdit ? "Сохранить" : "Создать мерчанта"}</Btn>
      </>}
    >
      <Section title="Мерчант">
        <Field label="Название компании">
          <TextInput value={name} onChange={setName} placeholder="Например, ООО «Ромашка»" />
        </Field>
        <Field label="Контактное лицо"><TextInput value={contactPerson} onChange={setContactPerson} placeholder="Например, Анна Смирнова" /></Field>
        <div className="row-2">
          <Field label="Email"><TextInput value={email} onChange={setEmail} placeholder="merchant@example.com" /></Field>
          <Field label="Telegram"><TextInput mono value={telegram} onChange={setTelegram} placeholder="@username" /></Field>
        </div>
        <Field label="Реферал" hint="Партнёр, привёдший мерчанта">
          <Select value={referral} onChange={setReferral} options={referralOptions} />
        </Field>
      </Section>

      <Section title="Тарифы">
        <FilterChips
          filters={[
            { value: "payin",  label: "Платежи",  count: methods.payIn.length },
            { value: "payout", label: "Выплаты", count: methods.payOut.length },
          ]}
          value={tariffTab}
          onChange={setTariffTab}
        />
        <table className="table table--inset">
          <thead><tr>
            <th>Метод</th>
            <th className="num">Ставка</th>
            <th className="num">Мин. сумма</th>
            <th className="num">Макс. сумма</th>
            <th style={{ width: 40 }}></th>
          </tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5}><Empty>Нет ставок — добавьте строку</Empty></td></tr>
            ) : rows.map((mm, i) => (
              <tr key={i}>
                <td>
                  <select className="field__input" style={{ fontSize: 12.5, width: 110, padding: "4px 8px" }}
                    value={mm.method} onChange={(e) => setRow(i, { method: e.target.value })}>
                    {TARIFF_METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
                <td className="num mono">
                  <input className="field__input" style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, width: 72, padding: "4px 8px", textAlign: "right" }}
                    value={mm.rate} onChange={(e) => setRow(i, { rate: parseFloat(e.target.value) || 0 })} />
                </td>
                <td className="num mono">
                  <input className="field__input" style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, width: 96, padding: "4px 8px", textAlign: "right" }}
                    value={mm.min} onChange={(e) => setRow(i, { min: parseInt(e.target.value) || 0 })} />
                </td>
                <td className="num mono">
                  <input className="field__input" style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, width: 110, padding: "4px 8px", textAlign: "right" }}
                    value={mm.max} onChange={(e) => setRow(i, { max: parseInt(e.target.value) || 0 })} />
                </td>
                <td>
                  <button className="btn btn--ghost" title="Удалить строку" style={{ padding: "4px 8px", fontSize: 14, lineHeight: 1 }}
                    onClick={() => removeRow(i)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 10 }}>
          <Btn variant="ghost" size="sm" onClick={addRow}>＋ Добавить строку</Btn>
        </div>
      </Section>
    </Modal>
  );
}

// ── Merchant users: seed + tab (add user, reset password) ──────────────────
const MERCHANT_USER_ROLES = {
  owner:   { label: "Владелец",      tone: "info" },
  admin:   { label: "Администратор", tone: "ok"   },
  finance: { label: "Бухгалтер",     tone: "warn" },
  viewer:  { label: "Наблюдатель",   tone: "neutral" },
};

function seedMerchantUsers(m) {
  const domain = (m.email && m.email.includes("@")) ? m.email.split("@")[1] : (m.id.toLowerCase() + ".demo");
  const base = [
    { id: m.id + "-U1", name: m.contactPerson && m.contactPerson !== "—" ? m.contactPerson : "Владелец аккаунта", email: m.email && m.email !== "—" ? m.email : ("owner@" + domain), role: "owner", roles: ["merchant-admin"], status: "active", last: "сейчас", twoFa: true },
  ];
  if (m.id === "M-501") {
    base.push(
      { id: m.id + "-U2", name: "Ирина Соколова", email: "finance@" + domain, role: "finance", roles: ["merchant-specialist"], status: "active", last: "вчера, 18:42", twoFa: true },
      { id: m.id + "-U3", name: "Павел Орлов",    email: "ops2@" + domain,    role: "admin",   roles: ["merchant-admin"], status: "active", last: "сегодня, 09:15", twoFa: false },
      { id: m.id + "-U4", name: "Мария Лебедева", email: "report@" + domain,  role: "viewer",  roles: [], status: "disabled", last: "12.04, 11:08", twoFa: false },
    );
  } else if (m.id === "M-502" || m.id === "M-503") {
    base.push(
      { id: m.id + "-U2", name: "Финансовый отдел", email: "finance@" + domain, role: "finance", roles: ["merchant-specialist"], status: "active", last: "сегодня, 08:30", twoFa: true },
    );
  }
  return base;
}

function MerchantUsersTab({ m }) {
  const [users, setUsers] = React.useState(() => seedMerchantUsers(m));
  const [showAdd, setShowAdd] = React.useState(false);
  const [nName, setNName] = React.useState("");
  const [nEmail, setNEmail] = React.useState("");
  const [nRole, setNRole] = React.useState("admin");
  const [nRoles, setNRoles] = React.useState(["merchant-specialist"]);
  const [openId, setOpenId] = React.useState(null);

  const roleOptions = Object.keys(MERCHANT_USER_ROLES).map((v) => ({ value: v, label: MERCHANT_USER_ROLES[v].label }));
  const nowStr = () => new Date().toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  const toggleStatus = (uid) => {
    setUsers((list) => list.map((u) => u.id === uid ? { ...u, status: u.status === "active" ? "disabled" : "active" } : u));
  };

  const setRoles = (uid, roles) => {
    setUsers((list) => list.map((u) => u.id === uid ? { ...u, roles } : u));
  };

  const addUser = () => {
    const email = nEmail.trim();
    const name = nName.trim();
    if (!email) return;
    const id = m.id + "-U" + (users.length + 1) + Math.floor(Math.random() * 90 + 10);
    setUsers((list) => [...list, { id, name: name || email, email, role: nRole, roles: nRoles, status: "active", last: "—", twoFa: false, invited: true, invitePw: genPassword() }]);
    setShowAdd(false);
    setNName(""); setNEmail(""); setNRole("admin"); setNRoles(["merchant-specialist"]);
    setOpenId(id); // open new user so operator can copy the temp password
  };

  const open = users.find((u) => u.id === openId);

  return (
    <>
      <Section
        title={`Пользователи (${users.length})`}
        action={<Btn variant={showAdd ? "ghost" : "primary"} size="sm" onClick={() => setShowAdd((v) => !v)}>{showAdd ? "Отмена" : "＋ Добавить пользователя"}</Btn>}
      >
        <Note tone="neutral">
          Сотрудники мерчанта с доступом в кабинет <strong>{m.name}</strong>. Откройте пользователя, чтобы посмотреть данные и сбросить пароль.
        </Note>

        {showAdd && (
          <div style={{ border: "1px solid var(--line-2)", borderRadius: "var(--radius)", padding: "14px", background: "var(--paper-2)", margin: "12px 0" }}>
            <div className="row-2">
              <Field label="Имя"><TextInput value={nName} onChange={setNName} placeholder="Например, Анна Смирнова" /></Field>
              <Field label="Email (логин)"><TextInput value={nEmail} onChange={setNEmail} mono placeholder="user@домен" /></Field>
            </div>
            <Field label="Роли (система прав)"><RolesPicker value={nRoles} onChange={setNRoles} scope="merchant" /></Field>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <Btn variant="primary" size="sm" onClick={addUser}>Создать и сгенерировать пароль</Btn>
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              Пользователь получит приглашение на email и временный пароль для первого входа.
            </div>
          </div>
        )}

        <table className="table table--inset" style={{ marginTop: 4 }}>
          <thead><tr>
            <th>Пользователь</th><th>Роли</th><th>Последний вход</th><th>Статус</th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={openId === u.id ? "is-selected" : ""} style={{ cursor: "pointer" }} onClick={() => setOpenId(u.id)}>
                <td>
                  <div><strong>{u.name}</strong>{u.invited && <span className="muted" style={{ fontSize: 11.5 }}> · приглашён</span>}</div>
                  <div className="mono muted" style={{ fontSize: 11.5, marginTop: 2 }}>{u.email}</div>
                </td>
                <td><RoleBadges roles={u.roles} size="sm" /></td>
                <td className="mono muted">{u.last}</td>
                <td>{u.status === "active" ? <Pill tone="ok">активен</Pill> : <Pill tone="neutral">отключён</Pill>}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4}><Empty>Пользователей пока нет</Empty></td></tr>
            )}
          </tbody>
        </table>
      </Section>

      {open && (
        <MerchantUserDrawer
          user={open}
          merchant={m}
          onClose={() => setOpenId(null)}
          onToggleStatus={() => toggleStatus(open.id)}
          onSetRoles={(roles) => setRoles(open.id, roles)}
        />
      )}
    </>
  );
}

function MerchantUserDrawer({ user, merchant, onClose, onToggleStatus, onSetRoles }) {
  const [newPw, setNewPw] = React.useState(null);
  const [resetAt, setResetAt] = React.useState(null);
  const [reveal, setReveal] = React.useState(true);
  // for an invited user not yet reset, surface the initial temp password
  const showInvite = user.invitePw && !newPw;
  const pw = newPw || (showInvite ? user.invitePw : null);

  const doReset = () => {
    setNewPw(genPassword());
    setReveal(true);
    setResetAt(new Date().toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }));
  };

  return (
    <Drawer
      title={user.name}
      id={user.id}
      onClose={onClose}
      footer={
        <>
          {user.role !== "owner" && (
            <Btn variant={user.status === "active" ? "danger" : "primary"} onClick={() => { onToggleStatus(); onClose(); }}>
              {user.status === "active" ? "Отключить доступ" : "Включить доступ"}
            </Btn>
          )}
          <div className="spacer" style={{ flex: 1 }} />
          <Btn variant="ghost" onClick={onClose}>Закрыть</Btn>
        </>
      }
    >
      <Section title="Учётные данные">
        <KV items={[
          ["Имя",            <strong>{user.name}</strong>],
          ["Email / логин",  <MonoCopy value={user.email} />],
          ["Мерчант",        <>{merchant.name} <span className="mono muted">· {merchant.id}</span></>],
          ["Последний вход", user.last || "—"],
          ["Статус",         user.status === "active" ? <Pill tone="ok">активен</Pill> : <Pill tone="neutral">отключён</Pill>],
        ]} />
      </Section>

      <Section title="Роли">
        <RolesPicker value={user.roles || []} onChange={onSetRoles} scope="merchant" />
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          Состав разрешений — в разделе «Системные → Права». При нескольких ролях права складываются, deny сильнее allow.
        </div>
      </Section>

      <Section
        title="Пароль"
        action={<Btn variant={pw ? "ghost" : "primary"} size="sm" onClick={doReset}>
          {pw ? "Сбросить ещё раз" : "Сбросить пароль"}
        </Btn>}
      >
        {!pw && (
          <Note tone="neutral">
            Сброс сгенерирует новый временный пароль. Текущий пароль перестанет действовать сразу после сброса.
          </Note>
        )}

        {pw && (
          <>
            <div style={{ border: "1px solid var(--line-2)", borderRadius: "var(--radius)", padding: "12px 14px", background: "var(--paper-2)", marginBottom: 10 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--ink-3)", marginBottom: 6 }}>
                {showInvite ? "Временный пароль" : "Новый пароль"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{ fontSize: 17, letterSpacing: 0.5, color: "var(--ink)" }}>
                  {reveal ? pw : "•".repeat(pw.length)}
                </span>
                <span className="spacer" style={{ flex: 1 }} />
                <Btn variant="ghost" size="sm" onClick={() => setReveal((r) => !r)}>{reveal ? "Скрыть" : "Показать"}</Btn>
                <CopyBtn value={pw} />
              </div>
            </div>
            <Note tone="warn">
              Пароль показывается только сейчас. Скопируйте и передайте пользователю по защищённому каналу — повторно посмотреть его будет нельзя.
            </Note>
            {resetAt && (
              <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                Сброшен: <span className="mono">{resetAt}</span> · оператор <span className="mono">a.smirnov</span>
              </div>
            )}
          </>
        )}
      </Section>

      <Section title="Безопасность">
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost">Завершить все сессии</Btn>
        </div>
      </Section>
    </Drawer>
  );
}

function MerchantDrawer({ merchant: m, onClose }) {
  const [tab, setTab] = React.useState("overview");
  const [showEdit, setShowEdit] = React.useState(false);
  const [period, setPeriod] = React.useState("today");
  const PERIODS = {
    "hour":      { label: "Час",     k: 0.07 },
    "today":     { label: "Сегодня", k: 1    },
    "week":      { label: "Неделя",  k: 6.6  },
    "month":     { label: "Месяц",   k: 28.4 },
    "all":       { label: "Всё",     k: 184.6 },
  };
  const p = PERIODS[period];
  const periodChips = Object.keys(PERIODS).map((id) => ({ value: id, label: PERIODS[id].label }));
  const tabs = [
    { id: "overview",  label: "Обзор" },
    { id: "balance",   label: "Баланс" },
    { id: "tariff",    label: "Тарифы" },
    { id: "requests",  label: "Запросы" },
    { id: "api",       label: "API ключи" },
    { id: "webhook",   label: "Webhook" },
  ];
  const auditForMerchant = ADMIN_AUDIT.filter((l) => l.target === m.id || (l.target.startsWith && l.target.startsWith("M-")));

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <Drawer
        title={m.name}
        status={m.status}
        statusMap={MERCHANT_STATUS}
        wide
        onClose={onClose}
        footer={
          <>
            <Btn variant="danger">Блокировать</Btn>
            <div className="spacer" />
            <Btn variant="ghost" onClick={() => setShowEdit(true)}>Редактировать</Btn>
          </>
        }
      >
        <Tabs tabs={tabs} value={tab} onChange={setTab} />

        {tab === "overview" && (
          <>
            <div className="section">
              <FilterChips filters={periodChips} value={period} onChange={setPeriod} />
              <div className="stat-row stat-row--3">
                <Stat
                  label="Платежи"
                  value={<>{((m.todayPayInRub * p.k) / 92.4).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="ccy">USDT</span></>}
                  delta={`${Math.round(m.todayCount * p.k).toLocaleString("ru-RU")} заявок`}
                />
                <Stat
                  label="Выплаты"
                  value={<>{((m.todayPayOutRub * p.k) / 92.4).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="ccy">USDT</span></>}
                  delta={m.todayPayOutCount ? `${Math.round(m.todayPayOutCount * p.k).toLocaleString("ru-RU")} заявок` : "—"}
                />
                <Stat
                  label="Success rate"
                  value={Math.round(m.success * 100) + "%"}
                  delta={PERIODS[period].label.toLowerCase()}
                />
              </div>
            </div>
            <Section title="Контактная информация">
              <KV items={[
                ["ID",              <span className="mono">{m.id}</span>],
                ["Контактное лицо", m.contactPerson],
                ["Email",           m.email],
                ["Telegram",        m.telegram],
                ["Реферал",         (() => {
                  const ref = m.referral ?? ((typeof MERCHANTS !== "undefined" && MERCHANTS.find((x) => x.id === m.id)?.referral) || null);
                  return ref ? <strong>{ref}</strong> : <span className="muted">— не задан</span>;
                })()],
                ["Подключен",       m.joined],
              ]} />
            </Section>
            <MerchantUsersTab m={m} />
          </>
        )}

        {tab === "balance" && (
          <>
            <Section title="Баланс мерчанта">
              <div className="stat-row stat-row--3">
                <Stat label="Доступно" value={<>{(m.balanceRub / 92.4).toFixed(2)} <span className="ccy">USDT</span></>} delta="к выводу" />
                <Stat label="Hold" value={<>{(m.frozenRub / 92.4).toFixed(2)} <span className="ccy">USDT</span></>} delta="заморожено по выплатам" />
                <Stat label="Total" value={<>{((m.balanceRub + m.frozenRub) / 92.4).toFixed(2)} <span className="ccy">USDT</span></>} delta="—" />
              </div>
            </Section>
            <Section title="Добавить выплату" action={<Btn variant="primary" size="sm">＋ Добавить выплату</Btn>}>
              <div className="row-2">
                <Field label="Сумма (USDT)"><TextInput value="" placeholder="напр. 500" /></Field>
                <Field label="Тип">
                  <Select value="withdraw" options={[
                    { value: "topup",      label: "Пополнение" },
                    { value: "withdraw",   label: "Вывод" },
                  ]} />
                </Field>
              </div>
              <Field label="TX"><TextInput mono value="" placeholder="напр. 0x9f2c…a31b" /></Field>
            </Section>
            <Section title="История выплат">
              <table className="table table--inset">
                <thead><tr>
                  <th>Статус</th>
                  <th className="num">Сумма</th>
                  <th>Дата</th>
                  <th>TX</th>
                </tr></thead>
                <tbody>
                  {(MERCHANT_PAYOUTS[m.id] || []).length === 0 ? (
                    <tr><td colSpan={4}><Empty>Выплат ещё не было</Empty></td></tr>
                  ) : (MERCHANT_PAYOUTS[m.id] || []).map((p) => (
                    <tr key={p.id}>
                      <td><Pill tone="ok">подтверждено</Pill></td>
                      <td className="num"><strong>{p.amountUsdt.toFixed(2)}</strong> <span className="muted">USDT</span></td>
                      <td className="mono muted">{p.ts}</td>
                      <td>
                        <a href={`https://tronscan.org/#/transaction/${p.txHash}`} target="_blank" rel="noopener" className="mono" style={{ color: "var(--accent)", textDecoration: "none" }}>
                          {p.txHash.slice(0, 8)}…{p.txHash.slice(-6)} ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          </>
        )}

        {tab === "tariff" && <MerchantTariffTab m={m} />}

        {tab === "requests" && <MerchantRequestsTab m={m} />}

        {tab === "api" && (
          <Section title="API ключи" action={<Btn variant="ghost" size="sm">＋ Создать ключ</Btn>}>
            <table className="table table--inset">
              <thead><tr><th>ID</th><th>Label</th><th>Whitelisted IP</th><th>Last used</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {m.apiKeys.length === 0 ? (
                  <tr><td colSpan={6}><Empty>Ключей нет — мерчант не интегрирован с API</Empty></td></tr>
                ) : m.apiKeys.map((k) => (
                  <tr key={k.id}>
                    <td className="mono">{k.id}</td>
                    <td>{k.label}</td>
                    <td className="mono">{k.ip}</td>
                    <td className="mono muted">{k.lastUsed}</td>
                    <td><Pill tone="ok">{k.status}</Pill></td>
                    <td className="num"><Btn variant="ghost" size="sm">Revoke</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {tab === "webhook" && (
          <Section title="Webhook integration">
            <Field label="URL"     row><TextInput value={m.webhookUrl}    placeholder="https://..." mono /></Field>
            <Field label="Secret"  row><TextInput value={m.webhookSecret} mono readOnly /></Field>
            <Field label="События" row>
              <div className="chips" style={{ padding: 0 }}>
                <span className="chip chip--active">payin.completed</span>
                <span className="chip chip--active">payout.completed</span>
                <span className="chip chip--active">dispute.opened</span>
                <span className="chip">settlement.confirmed</span>
              </div>
            </Field>
            <Btn variant="ghost" size="sm">Послать тестовый payload</Btn>
          </Section>
        )}

      </Drawer>
      {showEdit && <AddMerchantModal merchant={m} onClose={() => setShowEdit(false)} />}
    </>
  );
}

// ── Section: Support Queue ─────────────────────────────────────────────────
function SectionSupport({ role, onChangeRole }) {
  const [filter, setFilter] = React.useState(role === "support" ? "mine" : "all");
  const all = ADMIN_SUPPORT_QUEUE;
  const me = role === "admin" ? "a.smirnov" : "v.popov";

  const filters = [
    { id: "all",       label: "Все",          count: all.length },
    { id: "mine",      label: "Мои",          count: all.filter((q) => q.assigned === me).length },
    { id: "unassigned",label: "Без исполнителя", count: all.filter((q) => q.assigned === "—").length },
    { id: "urgent",    label: "Срочные",      count: all.filter((q) => q.priority === "urgent").length },
    { id: "disputes",  label: "Споры",        count: all.filter((q) => q.kind === "dispute").length },
  ];

  const list = (() => {
    if (filter === "all") return all;
    if (filter === "mine") return all.filter((q) => q.assigned === me);
    if (filter === "unassigned") return all.filter((q) => q.assigned === "—");
    if (filter === "urgent") return all.filter((q) => q.priority === "urgent");
    if (filter === "disputes") return all.filter((q) => q.kind === "dispute");
    return all;
  })();

  return (
    <>
      <PageHead
        title="Очередь саппорта"
        sub="Споры, выводы, settlement-чеки и тикеты, требующие действия оператора."
        actions={
          <>
            <Btn variant="ghost">＋ Создать тикет</Btn>
            <RoleSwitcher role={role} onChange={onChangeRole} />
          </>
        }
      />
      <div className="stat-row">
        <Stat label="В очереди"     value={all.length}    delta={`${all.filter((q) => q.priority === "urgent").length} срочных`} />
        <Stat label="Мои"           value={all.filter((q) => q.assigned === me).length} delta={`роль: ${role}`} />
        <Stat label="Без исполнителя" value={all.filter((q) => q.assigned === "—").length} delta="нужно распределить" />
        <Stat label="SLA нарушены"  value={all.filter((q) => q.sla.includes("просрочен")).length} delta="требуют эскалации" />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters.map((f) => ({ value: f.value != null ? f.value : f.id, label: f.label, count: f.count }))} align="left" />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Тип</th><th>Приоритет</th><th>SLA</th>
              <th>Тема</th><th>Ждём</th><th>Исполнитель</th>
            </tr>
          </thead>
          <tbody>
            {list.map((q) => (
              <tr key={q.id}>
                <td className="mono">{q.id}</td>
                <td><span className="badge-type">{q.kind}</span></td>
                <td><StatusPill map={SUPPORT_PRIORITY} value={q.priority} /></td>
                <td>{q.sla === "—" ? <span className="muted">—</span> :
                     q.sla.includes("просрочен") ? <span className="dispute-sla" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>{q.sla}</span> :
                     <span className="dispute-sla">{q.sla}</span>}</td>
                <td><span className="truncate" style={{ maxWidth: 360, display: "inline-block" }}>{q.subject}</span></td>
                <td><span className="badge-type">{q.waitingFor}</span></td>
                <td>
                  {q.assigned === "—" ? <Btn variant="ghost" size="sm">Взять</Btn>
                                       : <span><strong>{q.assigned}</strong></span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function RoleSwitcher({ role, onChange }) {
  return (
    <div className="role-switcher">
      <span className="muted" style={{ fontSize: 12, marginRight: 8 }}>роль:</span>
      <button
        className={"chip" + (role === "admin" ? " chip--active" : "")}
        onClick={() => onChange("admin")}
      >Admin</button>
      <button
        className={"chip" + (role === "support" ? " chip--active" : "")}
        onClick={() => onChange("support")}
      >Support</button>
    </div>
  );
}

// ── Section: Ledger / Manual ops ──────────────────────────────────────────
// Inline nav-style icon for use inside hero-card sub lines.
function TileIcon({ id }) {
  const paths = window.NAV_ICON_PATHS && window.NAV_ICON_PATHS[id];
  if (!paths) return null;
  return <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", opacity: .75 }}>{paths}</svg>;
}
// Chip-styled dropdown filter (used in Финансы) — trigger looks like a FilterChip with ▾,
// menu shows options with counts; outside-click closes.
function ChipDropdown({ options, value, onChange, neutralValue = "all" }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const active = options.find((o) => o.value === value) || options[0];
  const isNeutral = value === neutralValue;
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className={"chip" + (!isNeutral ? " chip--active" : "")}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{active.label}</span>
        {active.count != null && <span className="chip__count">{active.count}</span>}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 2, opacity: 0.7, transform: open ? "rotate(180deg)" : "none", transition: "transform 120ms" }}>
          <path d="M2 4 L5 7 L8 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            minWidth: 260,
            maxHeight: 360,
            overflowY: "auto",
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05)",
            padding: 6,
            zIndex: 50,
          }}
        >
          {options.map((o) => {
            const isActive = o.value === value;
            return (
              <button
                key={o.value}
                role="option"
                aria-selected={isActive}
                onClick={() => { onChange(o.value); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: isActive ? "var(--paper-2)" : "transparent",
                  color: "var(--ink)",
                  fontSize: 13,
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--paper-2)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.label}</span>
                {o.count != null && <span className="chip__count">{o.count}</span>}
                {isActive && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 2 }}>
                    <path d="M2.5 6.5 L5 9 L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

function SectionLedger({ onGo }) {
  const [filter, setFilter] = React.useState("all");
  const [period, setPeriod] = React.useState("today");
  const [traderFilter, setTraderFilter] = React.useState("all");
  const [teamFilter, setTeamFilter] = React.useState("all");

  const PERIODS = {
    "hour":      { label: "Час",     title: "за час",       k: 0.07 },
    "today":     { label: "Сегодня", title: "сегодня",      k: 1    },
    "yesterday": { label: "Вчера",   title: "вчера",        k: 0.92 },
    "month":     { label: "Месяц",   title: "за месяц",     k: 22.4 },
    "all":       { label: "Всё",     title: "за всё время", k: 184.6 },
  };
  const p = PERIODS[period];
  const periodChips = Object.keys(PERIODS).map((id) => ({ value: id, label: PERIODS[id].label }));

  const all = ADMIN_LEDGER;

  // Trader → team map and option lists
  const traderToTeam = TRADERS.reduce((acc, t) => { acc[t.id] = t.team || ""; return acc; }, {});
  const teamsList = Array.from(new Set(TRADERS.map((t) => t.team).filter(Boolean)));

  // Применяем trader/team фильтры до подсчёта счётчиков статусного фильтра
  const scoped = all.filter((l) => {
    if (traderFilter !== "all" && l.trader !== traderFilter) return false;
    if (teamFilter !== "all" && traderToTeam[l.trader] !== teamFilter) return false;
    return true;
  });

  const filters = [
    { value: "all",       label: "Все",         count: scoped.length },
    { value: "payin",     label: "Платежи",     count: scoped.filter((l) => l.ref && l.ref.startsWith("PI-")).length },
    { value: "payout",    label: "Выплаты",     count: scoped.filter((l) => l.ref && l.ref.startsWith("PO-")).length },
    { value: "commission",label: "Комиссии",    count: scoped.filter((l) => l.type === "commission").length },
    { value: "topup",     label: "Top-up",      count: scoped.filter((l) => l.type === "topup").length },
    { value: "settlement",label: "Settlement",  count: scoped.filter((l) => l.type === "settlement").length },
  ];
  const list = (() => {
    if (filter === "all") return scoped;
    if (filter === "payin") return scoped.filter((l) => l.ref && l.ref.startsWith("PI-"));
    if (filter === "payout") return scoped.filter((l) => l.ref && l.ref.startsWith("PO-"));
    return scoped.filter((l) => l.type === filter);
  })();

  // Опции для dropdown'ов (счётчики считаем по полному ledger, чтобы менялись только при выборе)
  const traderOptions = [{ value: "all", label: "Все трейдеры", count: all.length }].concat(
    TRADERS.map((t) => ({
      value: t.id,
      label: t.name + " · " + t.id,
      count: all.filter((l) => l.trader === t.id).length,
    }))
  );
  const teamOptions = [{ value: "all", label: "Все команды", count: all.length }].concat(
    teamsList.map((team) => ({
      value: team,
      label: team,
      count: all.filter((l) => traderToTeam[l.trader] === team).length,
    }))
  );

  // Агрегаты по выбранным трейдерам/команде
  const tradersScope = TRADERS.filter((t) => {
    if (traderFilter !== "all" && t.id !== traderFilter) return false;
    if (teamFilter !== "all" && t.team !== teamFilter) return false;
    return true;
  });
  const totalWorking   = tradersScope.reduce((s, t) => s + (t.balance?.workingUsdt   || 0), 0);
  const totalInsurance = tradersScope.reduce((s, t) => s + (t.balance?.insuranceUsdt || 0), 0);
  const totalLocked    = tradersScope.reduce((s, t) => s + (t.balance?.lockedUsdt    || 0), 0);

  const baseIn  = tradersScope.reduce((s, t) => s + (t.today?.payInRub  || 0), 0);
  const baseOut = tradersScope.reduce((s, t) => s + (t.today?.payOutRub || 0), 0);
  const payInRub  = Math.round(baseIn  * p.k);
  const payOutRub = Math.round(baseOut * p.k);
  const profitIn  = (payInRub / 92.4) * 0.007;
  const profitOut = (payOutRub / 92.4) * 0.025;
  const fmt = (n) => Math.round(n).toLocaleString("ru-RU");
  const TRADER_FEE_PCT = 7.5;
  const LEAD_FEE_PCT = 0.8;
  const MERCHANT_FEE_PCT = 9.5;
  const REF_FEE_PCT = 0.5;
  const providerWorking = PROVIDERS.reduce((s, v) => s + v.balance.workingUsdt, 0);
  const providerLocked = PROVIDERS.reduce((s, v) => s + v.balance.lockedUsdt, 0);
  const merchantBalanceRub = MERCHANTS.reduce((s, m) => s + m.balance.rub, 0);
  const merchantFrozenRub = MERCHANTS.reduce((s, m) => s + m.balance.frozen, 0);
  const custodyNow = totalWorking + providerWorking + totalLocked + providerLocked + totalInsurance + merchantBalanceRub / 92.4 + merchantFrozenRub / 92.4;
  const ownFundsUsdt = 42680.40;
  const platformLiabilities = merchantBalanceRub / 92.4 + (totalWorking + providerWorking) + (totalLocked + providerLocked + merchantFrozenRub / 92.4);
  const platformBalance = custodyNow - platformLiabilities;
  const depositsUsdt = 24800 * p.k;
  const withdrawalsUsdt = 19450 * p.k;

  return (
    <>
      <PageHead
        title="Финансы / Ledger"
        sub="Все движения по балансам трейдеров: автоматические (Платежи deduct, settlement) и ручные (top-up, корректировка)."
      />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap", padding: "4px 0 16px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="chips" style={{ padding: 0 }}>
            {periodChips.map((f) => (
              <button
                key={f.value}
                className={"chip" + (period === f.value ? " chip--active" : "")}
                onClick={() => setPeriod(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <ChipDropdown options={teamOptions} value={teamFilter} onChange={setTeamFilter} />
        <ChipDropdown options={traderOptions} value={traderFilter} onChange={setTraderFilter} />
      </div>

      {/* Балансы — сетка 3×2 как в trader demo */}
      <div className="hero-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 12 }}>
        <div className="hero-card hero-card--accent">
          <div className="hero-card__label">Кешфлоу {p.title}</div>
          <div className="hero-card__value">{fmtMoney(depositsUsdt - withdrawalsUsdt, "USDT")}</div>
          <div className="hero-card__sub">депозиты {fmtMoney(depositsUsdt, "USDT")} − выводы {fmtMoney(withdrawalsUsdt, "USDT")}</div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Накопленный профит платформы</div>
          <div className="hero-card__value">{fmtMoney(ownFundsUsdt, "USDT")}</div>
          <div className="hero-card__sub">накопленный профит на балансе платформы</div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Резерв</div>
          <div className="hero-card__value">{fmtMoney(ownFundsUsdt + platformLiabilities, "USDT")}</div>
          <div className="hero-card__sub">профит {fmtMoney(ownFundsUsdt, "USDT")} + обязательства {fmtMoney(platformLiabilities, "USDT")}</div>
        </div>
      </div>

      <div className="hero-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="hero-card hero-card--accent">
          <div className="hero-card__label">Профит {p.title}</div>
          <div className="hero-card__value">{fmtMoney(profitIn + profitOut, "USDT")}</div>
          <div className="hero-card__sub"><b>{(((profitIn + profitOut) * 92.4 / Math.max(1, payInRub + payOutRub)) * 100).toFixed(2).replace(".", ",")}%</b> от {fmtMoney((payInRub + payOutRub) / 92.4, "USDT")}</div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Получено от трейдеров {p.title}</div>
          <div className="hero-card__value">{fmtMoney(payInRub * (1 - (TRADER_FEE_PCT + LEAD_FEE_PCT) / 100) / 92.4, "USDT")}</div>
          <div className="hero-card__sub">{fmtMoney(payInRub / 92.4, "USDT")} − <TileIcon id="traders" /> {fmtMoney(payInRub * TRADER_FEE_PCT / 100 / 92.4, "USDT")} ({TRADER_FEE_PCT.toFixed(2).replace(".", ",")}%) − <TileIcon id="teams" /> {fmtMoney(payInRub * LEAD_FEE_PCT / 100 / 92.4, "USDT")} ({LEAD_FEE_PCT.toFixed(2).replace(".", ",")}%)</div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Задолженность мерчантам {p.title}</div>
          <div className="hero-card__value">{fmtMoney(payInRub * (1 - (MERCHANT_FEE_PCT - REF_FEE_PCT) / 100) / 92.4, "USDT")}</div>
          <div className="hero-card__sub">{fmtMoney(payInRub / 92.4, "USDT")} − <TileIcon id="merchants" /> {fmtMoney(payInRub * MERCHANT_FEE_PCT / 100 / 92.4, "USDT")} ({MERCHANT_FEE_PCT.toFixed(2).replace(".", ",")}%) + <TileIcon id="referrals" /> {fmtMoney(payInRub * REF_FEE_PCT / 100 / 92.4, "USDT")} ({REF_FEE_PCT.toFixed(2).replace(".", ",")}%)</div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Баланс платформы</div>
          <div className="hero-card__value">{fmtMoney(-platformLiabilities, "USDT")}</div>
          <div className="hero-card__sub">− <TileIcon id="merchants" /> {fmtMoney(merchantBalanceRub / 92.4, "USDT")} − <TileIcon id="traders" /> {fmtMoney(totalWorking + providerWorking, "USDT")} − ❄ {fmtMoney(totalLocked + providerLocked + merchantFrozenRub / 92.4, "USDT")}</div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Балансы трейдеров и провайдеров</div>
          <div className="hero-card__value">{fmtMoney(totalWorking + providerWorking, "USDT")}</div>
          <div className="hero-card__sub">❄ <b>{fmtMoney(totalLocked + providerLocked, "USDT")}</b></div>
        </div>
        <div className="hero-card">
          <div className="hero-card__label">Балансы мерчантов</div>
          <div className="hero-card__value">{fmtMoney(merchantBalanceRub / 92.4, "USDT")}</div>
          <div className="hero-card__sub">❄ <b>{fmtMoney(merchantFrozenRub / 92.4, "USDT")}</b></div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters.map((f) => ({ value: f.value != null ? f.value : f.id, label: f.label, count: f.count }))} align="left" />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Тип</th>
              <th className="num">Сумма (USDT)</th>
              <th>Trader</th>
              <th>Дата</th>
              <th>ID</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {list.map((l) => {
              let target = null;
              if (l.ref && l.ref.startsWith("PI-")) target = "payin";
              else if (l.ref && l.ref.startsWith("PO-")) target = "payout";
              else if (l.type === "topup" || (l.ref && l.ref.startsWith("TX"))) target = "deposits";
              const clickable = !!target;
              return (
                <tr
                  key={l.id}
                  className={clickable ? "" : "is-static"}
                  style={clickable ? { cursor: "pointer" } : null}
                  onClick={clickable ? () => onGo && onGo(target, l.ref) : undefined}
                >
                  <td><StatusPill map={LEDGER_TYPE} value={l.type} /></td>
                  <td className="num" style={{ color: l.amountUsdt > 0 ? "var(--ok)" : "var(--ink)", fontWeight: 600 }}>
                    {l.amountUsdt > 0 ? "+" : ""}{l.amountUsdt.toFixed(2)}
                  </td>
                  <td>
                    <div className="cell-stack">
                      <strong>{traderName(l.trader)}</strong>
                      <span className="muted">{traderToTeam[l.trader] || "—"}</span>
                    </div>
                  </td>
                  <td className="mono muted">{l.ts}</td>
                  <td className="mono">{l.id}</td>
                  <td className="mono">{l.ref}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Section: Auto-rules ─────────────────────────────────────────────────────
function SectionAutoRules() {
  const [openId, setOpenId] = React.useState(null);
  const all = ADMIN_AUTO_RULES;
  const open = openId ? all.find((r) => r.id === openId) : null;

  return (
    <>
      <PageHead
        title="Авто-правила"
        sub="Автоматические действия системы: блокировка реквизитов, эскалация споров, suspend трейдеров. Все срабатывания логируются."
        actions={<Btn variant="accent">＋ Создать правило</Btn>}
      />
      <div className="stat-row">
        <Stat label="Правил всего"    value={all.length} delta={`${all.filter((r) => r.enabled).length} активных`} />
        <Stat label="Срабатываний"    value={all.reduce((s, r) => s + r.firedToday, 0)} delta="за сегодня" />
        <Stat label="Активных правил" value={all.filter((r) => r.enabled).length} delta={`${all.filter((r) => !r.enabled).length} выключено`} />
        <Stat label="Most active"     value="AR-004" delta="7 раз сегодня" />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Название</th><th>Scope</th>
              <th>Условие</th><th>Действие</th>
              <th className="num">Сегодня</th><th>Last fired</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {all.map((r) => (
              <tr key={r.id} onClick={() => setOpenId(r.id)} className={openId === r.id ? "is-selected" : ""}>
                <td className="mono">{r.id}</td>
                <td><strong>{r.name}</strong></td>
                <td><span className="badge-type">{r.scope}</span></td>
                <td className="mono muted truncate" style={{ maxWidth: 220 }}>{r.when}</td>
                <td className="mono muted truncate" style={{ maxWidth: 280 }}>{r.then}</td>
                <td className="num">{r.firedToday}</td>
                <td className="mono muted">{r.lastFired}</td>
                <td><Pill tone={r.enabled ? "ok" : "neutral"}>{r.enabled ? "Enabled" : "Disabled"}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <>
          <div className="drawer-overlay" onClick={() => setOpenId(null)} />
          <Drawer
            title={open.name}
            id={open.id}
            wide
            onClose={() => setOpenId(null)}
            footer={
              <>
                <Btn variant={open.enabled ? "danger" : "ok"}>{open.enabled ? "Disable" : "Enable"}</Btn>
                <div className="spacer" />
                <Btn variant="ghost">Тест на dry-run</Btn>
                <Btn variant="primary">Сохранить</Btn>
              </>
            }
          >
            <Section title="Условие">
              <Field label="When"><TextInput value={open.when} mono /></Field>
              <Field label="Scope"><span className="badge-type">{open.scope}</span></Field>
            </Section>
            <Section title="Действие">
              <Field label="Then"><TextInput value={open.then} mono /></Field>
              <Field label="Уведомить">
                <div className="chips" style={{ padding: 0 }}>
                  <span className="chip chip--active">Trader</span>
                  <span className="chip chip--active">Admin</span>
                  <span className="chip">Support</span>
                  <span className="chip">Webhook</span>
                </div>
              </Field>
            </Section>
            <Section title="Статистика">
              <KV items={[
                ["Сегодня",         open.firedToday + " срабатываний"],
                ["За месяц",        Math.round(open.firedToday * 28) + " срабатываний"],
                ["Last fired",      <span className="mono">{open.lastFired}</span>],
                ["False positives", "0 (за 30д)"],
              ]} />
            </Section>
            <Note tone="warn">Это правило выполняется в реальном времени по событиям системы. При срабатывании создаётся запись в Audit log с типом <span className="mono">auto-rule.fire</span>.</Note>
          </Drawer>
        </>
      )}
    </>
  );
}

// ── Section: Audit log ─────────────────────────────────────────────────────
function SectionAudit() {
  const [filter, setFilter] = React.useState("all");
  const all = ADMIN_AUDIT;
  const filters = [
    { id: "all",     label: "Все",        count: all.length },
    { id: "admin",   label: "Admin",      count: all.filter((l) => l.role === "admin").length },
    { id: "support", label: "Support",    count: all.filter((l) => l.role === "support").length },
    { id: "system",  label: "System",     count: all.filter((l) => l.role === "system").length },
  ];
  const list = filter === "all" ? all : all.filter((l) => l.role === filter);

  return (
    <>
      <PageHead
        title="Audit log"
        sub="Полный журнал действий: кто, когда, что изменил. Хранится бессрочно."
      />
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
        <ChipSelect value={filter} onChange={setFilter} options={filters.map((f) => ({ value: f.value != null ? f.value : f.id, label: f.label, count: f.count }))} align="left" />
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Когда</th><th>Кто</th><th>Действие</th><th>Объект</th><th>Причина</th>
            </tr>
          </thead>
          <tbody>
            {list.map((l) => (
              <tr key={l.id}>
                <td className="mono">{l.id}</td>
                <td className="mono muted">{l.ts}</td>
                <td>
                  <div className="cell-stack">
                    <strong>{l.actor}</strong>
                    <span className="muted" style={{ fontSize: 11 }}>{l.role}</span>
                  </div>
                </td>
                <td className="mono">{l.action}</td>
                <td className="mono">{l.target}</td>
                <td className="muted">{l.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Section: Operators ─────────────────────────────────────────────────────
function SectionOperators() {
  const all = ADMIN_OPERATORS;
  const [openId, setOpenId] = React.useState(null);   // редактирование существующего
  const [showAdd, setShowAdd] = React.useState(false); // создание нового
  const open = openId ? all.find((o) => o.id === openId) : null;

  return (
    <>
      <PageHead
        title="Операторы"
        sub="Сотрудники с доступом в админку. Роли: Admin (полный) / Support (ограниченный)."
        actions={<Btn variant="accent" onClick={() => setShowAdd(true)}>＋ Пригласить оператора</Btn>}
      />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Логин</th>
              <th>Роли</th>
              <th>Статус</th><th>Online</th><th></th>
            </tr>
          </thead>
          <tbody>
            {all.map((o) => (
              <tr key={o.id} onClick={() => setOpenId(o.id)} className={openId === o.id ? "is-selected" : ""}>
                <td className="mono">{o.login}</td>
                <td><RoleBadges roles={operatorRoleIds(o)} size="sm" /></td>
                <td>{o.active ? <Pill tone="ok">Активен</Pill> : <Pill tone="neutral">Неактивен</Pill>}</td>
                <td>{o.online ? <Pill tone="ok">online</Pill> : <Pill tone="neutral">offline</Pill>}</td>
                <td className="num"><Btn variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setOpenId(o.id); }}>Изменить</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <OperatorDrawer operator={open} onClose={() => setOpenId(null)} />}
      {showAdd && <OperatorDrawer onClose={() => setShowAdd(false)} />}
    </>
  );
}

// ── Operator Drawer (создание / редактирование) ────────────────────────────
function OperatorDrawer({ operator, onClose }) {
  const isEdit = !!operator;
  const [name, setName]   = React.useState(operator?.name  || "");
  const [login, setLogin] = React.useState(operator?.login || "");
  const [email, setEmail] = React.useState(operator?.email || "");
  const [role, setRole]   = React.useState(operator?.role  || "support");
  const [roles, setRoles] = React.useState(() => operator ? operatorRoleIds(operator) : ["operator-support"]);
  const [online, setOnline] = React.useState(isEdit ? !!operator.active : true);
  const [newPw, setNewPw] = React.useState(null);
  const [resetAt, setResetAt] = React.useState(null);
  const [reveal, setReveal] = React.useState(true);

  const doReset = () => {
    setNewPw(genPassword());
    setReveal(true);
    const now = new Date();
    setResetAt(now.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }));
  };

  const canSave = login.trim().length >= 2;

  const ROLE_DESC = {
    admin:   "Полный доступ: настройки, тарифы, мерчанты, трейдеры, выводы, споры, операторы.",
    support: "Ограниченный доступ: споры, выводы, settlement-чеки и тикеты.",
  };

  return (
    <>
      <Drawer
        title={isEdit ? operator.login : "Новый оператор"}
        id={isEdit ? operator.id : undefined}
        onClose={onClose}
        footer={
          <>
            {isEdit && (
              <Btn variant="ghost" onClick={onClose}>
                {online ? "Деактивировать" : "Активировать"}
              </Btn>
            )}
            <span className="spacer" />
            <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
            <Btn variant="primary" disabled={!canSave} onClick={onClose}>
              {isEdit ? "Сохранить" : "Пригласить"}
            </Btn>
          </>
        }
      >
        <Section title="Данные оператора">
          <div className="row-2">
            <Field label="Логин"><TextInput mono value={login} onChange={setLogin} placeholder="a.smirnov" /></Field>
            <Field label="Email"><TextInput value={email} onChange={setEmail} placeholder="operator@example.com" /></Field>
          </div>
        </Section>

        <Section title="Роли">
          <RolesPicker value={roles} onChange={setRoles} scope="operator" />
          <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
            Состав разрешений ролей — в разделе «Системные → Права». При нескольких ролях права складываются, deny сильнее allow.
          </div>
        </Section>


        {isEdit && (
          <Section
            title="Пароль"
            action={<Btn variant={newPw ? "ghost" : "primary"} size="sm" onClick={doReset}>
              {newPw ? "Сбросить ещё раз" : "Сбросить пароль"}
            </Btn>}
          >
            {!newPw && (
              <Note tone="neutral">
                Сброс сгенерирует новый временный пароль для оператора. Текущий пароль перестанет действовать сразу после сброса.
              </Note>
            )}

            {newPw && (
              <>
                <div style={{ border: "1px solid var(--line-2)", borderRadius: "var(--radius)", padding: "12px 14px", background: "var(--paper-2)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--ink-3)", marginBottom: 6 }}>Новый пароль</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="mono" style={{ fontSize: 17, letterSpacing: 0.5, color: "var(--ink)" }}>
                      {reveal ? newPw : "\u2022".repeat(newPw.length)}
                    </span>
                    <span className="spacer" style={{ flex: 1 }} />
                    <Btn variant="ghost" size="sm" onClick={() => setReveal((r) => !r)}>
                      {reveal ? "Скрыть" : "Показать"}
                    </Btn>
                    <CopyBtn value={newPw} />
                  </div>
                </div>
                <Note tone="warn">
                  Пароль показывается только сейчас. Скопируйте и передайте оператору по защищённому каналу — повторно посмотреть его будет нельзя.
                </Note>
                <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                  Сброшен: <span className="mono">{resetAt}</span> · оператор <span className="mono">a.smirnov</span>
                </div>
              </>
            )}
          </Section>
        )}

        {!isEdit && (
          <Note tone="info">
            На указанный email будет отправлено приглашение со ссылкой для входа и установки пароля.
          </Note>
        )}
      </Drawer>
    </>
  );
}

// ── Section: Dashboard (компактный, без таблиц) ────────────────────────────
function SectionDashboardV2({ onGo }) {
  const [period, setPeriod] = React.useState("today");
  const [traderFilter, setTraderFilter] = React.useState("all");
  const [teamFilter, setTeamFilter] = React.useState("all");

  const PERIODS = {
    "hour":      { label: "Час",     title: "за час",       k: 0.07 },
    "today":     { label: "Сегодня", title: "сегодня",      k: 1    },
    "yesterday": { label: "Вчера",   title: "вчера",        k: 0.92 },
    "month":     { label: "Месяц",   title: "за месяц",     k: 22.4 },
    "all":       { label: "Всё",     title: "за всё время", k: 184.6 },
  };
  const p = PERIODS[period];
  const periodChips = Object.keys(PERIODS).map((id) => ({ value: id, label: PERIODS[id].label }));

  // Trader/team scoping
  const scopedTraders = TRADERS.filter((t) => {
    if (traderFilter !== "all" && t.id !== traderFilter) return false;
    if (teamFilter !== "all" && t.team !== teamFilter) return false;
    return true;
  });
  const isScoped = traderFilter !== "all" || teamFilter !== "all";

  // Базовые объёмы:
  // — если фильтры выключены, берём сумму по всем мерчантам (как было);
  // — если включены, считаем по выбранным трейдерам (t.today).
  const baseIn = isScoped
    ? scopedTraders.reduce((s, t) => s + (t.today?.payInRub || 0), 0)
    : MERCHANTS.reduce((s, m) => s + (m.today?.payInRub || 0), 0);
  const baseOut = isScoped
    ? scopedTraders.reduce((s, t) => s + (t.today?.payOutRub || 0), 0)
    : MERCHANTS.reduce((s, m) => s + (m.today?.payOutRub || 0), 0);
  const baseInCount  = isScoped
    ? Math.round(baseIn  / 3000)  // demo: ≈средний чек 3000₽
    : MERCHANTS.reduce((s, m) => s + (m.today?.payInCount  || 0), 0);
  const baseOutCount = isScoped
    ? Math.round(baseOut / 8000)  // demo: ≈средний чек 8000₽
    : MERCHANTS.reduce((s, m) => s + (m.today?.payOutCount || 0), 0);

  const traderIds = new Set(scopedTraders.map((t) => t.id));

  const payInRub  = Math.round(baseIn  * p.k);
  const payOutRub = Math.round(baseOut * p.k);
  const payInCount  = Math.round(baseInCount  * p.k);
  const payOutCount = Math.round(baseOutCount * p.k);

  // Споры/депозиты — фильтруем по трейдерам в scope
  const inScope = (trader) => !isScoped || traderIds.has(trader);
  const activeDisputes = DISPUTES.filter((d) =>
    ["open","waiting-trader","waiting-admin","escalated"].includes(d.status) && inScope(d.trader)
  );
  const disputeAmount = activeDisputes.reduce((s, d) => s + d.amount, 0);
  const depositsInWork = DEPOSIT_REQUESTS.filter((d) =>
    (d.status === "pending" || d.status === "reviewing") && inScope(d.trader)
  );
  const withdrawalsInWork = WITHDRAW_REQUESTS.filter((d) =>
    (d.status === "pending" || d.status === "reviewing") && inScope(d.trader)
  );

  // Сетевые счётчики
  const visibleTraderIds = new Set(scopedTraders.map((t) => t.id));
  const filteredTerminals = isScoped ? TERMINALS.filter((t) => visibleTraderIds.has(t.trader)) : TERMINALS;
  const filteredPD = isScoped ? PAYMENT_DETAILS.filter((pd) => visibleTraderIds.has(pd.trader)) : PAYMENT_DETAILS;

  const sysActiveMerchants = MERCHANTS.filter((m) => m.status === "active").length;
  const sysActiveTraders = scopedTraders.filter((t) => t.status === "active").length;
  const sysOnlineTerminals = filteredTerminals.filter((t) => t.status === "online").length;
  const sysActivePD = filteredPD.filter((p) => p.status === "active").length;

  // Опции для dropdown'ов
  const teamsList = Array.from(new Set(TRADERS.map((t) => t.team).filter(Boolean)));
  const traderOptions = [{ value: "all", label: "Все трейдеры", count: TRADERS.length }].concat(
    TRADERS.map((t) => ({ value: t.id, label: t.name + " · " + t.id }))
  );
  const teamOptions = [{ value: "all", label: "Все команды", count: TRADERS.length }].concat(
    teamsList.map((team) => ({
      value: team,
      label: team,
      count: TRADERS.filter((t) => t.team === team).length,
    }))
  );

  const attention = [
    { tone: "bad",  pill: "SLA нарушен", msg: <>Спор <b>DSP-439</b> эскалирован на admin</>, meta: "142 000 ₽", go: "disputes" },
    { tone: "warn", pill: "Frozen PD",   msg: <>Реквизит <b>PD-9022</b> заморожен под спор DSP-441</>, meta: "PD-9022", go: "details" },
    { tone: "warn", pill: "Limit 95%",   msg: <>Реквизит <b>PD-9004</b> авто-отключён по правилу AR-001</>, meta: "PD-9004", go: "details" },
    { tone: "bad",  pill: "Offline",     msg: <>Терминал <b>TM-1042-C</b> offline 47 минут</>, meta: "TM-1042-C", go: "terminals" },
    { tone: "warn", pill: "Deposit low", msg: <>Трейдер <b>TR-1061</b> — страховой ниже минимума (1000 / 1500 USDT)</>, meta: "TR-1061", go: "deposits" },
    { tone: "bad",  pill: "Suspended",   msg: <>Трейдер <b>TR-1073</b> — 3+ overdue settlements</>, meta: "TR-1073", go: "traders" },
  ];

  const fmt = (n) => Math.round(n).toLocaleString("ru-RU");

  return (
    <>
      <PageHead
        title="Главная"
        sub="Сводка по сети: объёмы, очередь саппорта, риск-картина."
      />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap", padding: "4px 0 16px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="chips" style={{ padding: 0 }}>
            {periodChips.map((f) => (
              <button
                key={f.value}
                className={"chip" + (period === f.value ? " chip--active" : "")}
                onClick={() => setPeriod(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <ChipDropdown options={teamOptions} value={teamFilter} onChange={setTeamFilter} />
        <ChipDropdown options={traderOptions} value={traderFilter} onChange={setTraderFilter} />
      </div>

      {/* Финансовый обзор — 2 ключевые плашки в стиле trader */}
      <div className="hero-grid hero-grid--2">
        <div className="hero-card hero-card--clickable" onClick={() => onGo("payin")}>
          <div className="hero-card__label">Платежи {p.title}</div>
          <div className="hero-card__value">{(payInRub / 92.4).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} <span className="ccy">USDT</span></div>
          <div className="hero-card__sub">{fmt(payInRub)} ₽ · профит <b>{(payInRub * 0.035 / 92.4).toFixed(2)} USDT</b></div>
        </div>
        <div className="hero-card hero-card--clickable" onClick={() => onGo("payout")}>
          <div className="hero-card__label">Выплаты {p.title}</div>
          <div className="hero-card__value">{(payOutRub / 92.4).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} <span className="ccy">USDT</span></div>
          <div className="hero-card__sub">{fmt(payOutRub)} ₽ · профит <b>{(payOutRub * 0.025 / 92.4).toFixed(2)} USDT</b></div>
        </div>
      </div>

      {/* Второй ряд — как в trader demo: профит, споры, саппорт, конверсия */}
      <div className="stat-row">
        <div className="stat stat--clickable" onClick={() => onGo("ledger")}>
          <div className="stat__label">Профит {p.title}</div>
          <div className="stat__value">{((payInRub * 0.035 + payOutRub * 0.025) / 92.4).toFixed(2)} <span className="ccy">USDT</span></div>
          <div className="stat__delta"><span className="mono" style={{ color: "var(--ink-3)" }}>↓</span> <b style={{ fontWeight: 700, color: "var(--ink)" }}>{(payInRub * 0.035 / 92.4).toFixed(2)}</b> · <span className="mono" style={{ color: "var(--ink-3)" }}>↑</span> <b style={{ fontWeight: 700, color: "var(--ink)" }}>{(payOutRub * 0.025 / 92.4).toFixed(2)}</b></div>
        </div>
        <div className="stat stat--clickable" onClick={() => onGo("disputes")}>
          <div className="stat__label">Активные споры</div>
          <div className="stat__value">{activeDisputes.length}</div>
          <div className="stat__delta"><b style={{ fontWeight: 700, color: "var(--ink)" }}>{(disputeAmount / 92.4).toFixed(2)} USDT</b></div>
        </div>
        <div className="stat stat--clickable" onClick={() => onGo("requests")}>
          <div className="stat__label">Конверсия запросов</div>
          <div className="stat__value">{(typeof REQUESTS !== "undefined" && REQUESTS.length) ? Math.round(REQUESTS.filter((r) => r.status === "success").length / REQUESTS.length * 100) : 0}%</div>
          <div className="stat__delta">{(typeof REQUESTS !== "undefined" ? REQUESTS.filter((r) => r.status === "success").length : 0)} из {(typeof REQUESTS !== "undefined" ? REQUESTS.length : 0)} обработано</div>
        </div>
        <div className="stat stat--clickable" onClick={() => onGo("payin")}>
          <div className="stat__label">Конверсия платежей</div>
          <div className="stat__value">94%</div>
          <div className="stat__delta">{Math.round(payInCount * 0.94)} из {payInCount} платежей</div>
        </div>
      </div>

      {/* Состояние сети — 4 счётчика */}
      <div className="stat-row">
        <Stat label="Депозиты в работе" value={depositsInWork.length} delta={`${depositsInWork.reduce((s, d) => s + d.amount, 0).toFixed(2)} USDT`} onClick={() => onGo("deposits")} clickable />
        <Stat label="Выводы в работе" value={withdrawalsInWork.length} delta={`${withdrawalsInWork.reduce((s, d) => s + d.amount, 0).toFixed(2)} USDT`} onClick={() => onGo("withdrawals")} clickable />
        <Stat label="Active Traders"   value={`${sysActiveTraders} из ${scopedTraders.length}`}   delta={`баланс ${scopedTraders.filter((t) => t.status === "active").reduce((s, t) => s + (t.balance?.workingUsdt || 0), 0).toFixed(2)} USDT`} onClick={() => onGo("traders")}   clickable />
        <Stat label="Доступные реквизиты" value={sysActivePD}        delta={`из ${filteredPD.length} · ${filteredPD.length - sysActivePD} off`} onClick={() => onGo("details")}   clickable />
      </div>

    </>
  );
}

// ── Expose components ──────────────────────────────────────────────────────
Object.assign(window, {
  SectionMerchants, MerchantDrawer, MERCHANT_STATUS,
  SectionSupport, RoleSwitcher,
  SectionLedger,
  SectionAutoRules,
  SectionAudit,
  SectionOperators,
  SectionDashboardV2,
});
