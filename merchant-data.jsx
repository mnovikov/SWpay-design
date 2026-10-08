// CrowdPay — Merchant cabinet · моки

const ME = {
  name: "Денис Афанасьев",
  initials: "ДА",
  role: "Owner",
  merchant: "BetCity",
  merchantId: "M-501",
  email: "denis@betcity.demo",
  telegram: "@betcity_ops",
  joined: "12.01.2024",
};

// Баланс мерчанта — только USDT (TRC-20). Расчёты с trader-сетью идут в RUB,
// но в кабинет мерчанта приходят суммы, конвертированные по курсу момента заказа.
// fxRate показывается per-order для прозрачности, текущий курс — справочно.
const BALANCE = {
  usdt: {
    available: 29_480.42,    // доступно к выводу
    frozen:    3_320.18,     // заморожено по спорам и ожидающим settlement
    pending:   1_870.50,     // settlement в обработке
  },
  fxRateNow: 96.4,           // текущий справочный курс RUB/USDT
  network:   "TRC-20",
  wallet:    "TQrYa8Pq2nKv9bHfJ7Lm3xZ4dYsN5w8zpN",
};

const NAV = [
  { id: "dashboard", label: "Dashboard",     icon: "◇" },
  { id: "payin",     label: "PayIn",         icon: "↘", count: 3 },
  { id: "payout",    label: "PayOut",        icon: "↗", count: 2 },
  { id: "disputes",  label: "Споры",          icon: "✕", count: 2 },
  { id: "balance",   label: "Баланс",        icon: "₽" },
  { id: "api",       label: "API ключи",     icon: "⌥" },
  { id: "webhooks",  label: "Webhooks",      icon: "↻" },
  { id: "docs",      label: "Документация",  icon: "▤" },
  { id: "settings",  label: "Настройки",     icon: "·" },
];

const NAV_GROUPS = [
  { label: "Overview",   ids: ["dashboard"] },
  { label: "Operations", ids: ["payin", "payout", "disputes"] },
  { label: "Finance",    ids: ["balance"] },
  { label: "Integration",ids: ["api", "webhooks", "docs"] },
  { label: "Account",    ids: ["settings"] },
];

// ── Статусы ────────────────────────────────────────────────────────────────
const PAYIN_STATUS = {
  "waiting":        { label: "Ожидает оплаты",   tone: "info"    },
  "received":       { label: "Получен платёж",   tone: "warn"    },
  "completed":      { label: "Выполнен",          tone: "ok"      },
  "expired":        { label: "Просрочен",          tone: "neutral" },
  "disputed":       { label: "Спор",              tone: "bad"     },
  "manual-review":  { label: "На проверке",       tone: "warn"    },
};

const PAYOUT_STATUS = {
  "queued":      { label: "В очереди",     tone: "info"    },
  "in-progress": { label: "В работе",       tone: "warn"    },
  "proof":       { label: "Чек получен",    tone: "warn"    },
  "completed":   { label: "Выполнен",       tone: "ok"      },
  "failed":      { label: "Ошибка",         tone: "bad"     },
  "disputed":    { label: "Спор",           tone: "bad"     },
};

const DISPUTE_STATUS = {
  "open":            { label: "Открыт",            tone: "warn" },
  "waiting-trader":  { label: "Ждёт trader",        tone: "warn" },
  "waiting-merchant":{ label: "Ждёт нас",           tone: "bad"  },
  "resolved":        { label: "Решён в нашу пользу",tone: "ok"   },
  "rejected":        { label: "Отклонён",            tone: "bad"  },
};

const KEY_STATUS = {
  "active":  { label: "Active",  tone: "ok"  },
  "paused":  { label: "Paused",  tone: "warn"},
  "revoked": { label: "Revoked", tone: "bad" },
};

const HOOK_STATUS = {
  "delivered": { label: "Delivered", tone: "ok"   },
  "retrying":  { label: "Retrying",  tone: "warn" },
  "failed":    { label: "Failed",    tone: "bad"  },
};

// ── Today summary (всё в USDT) ─────────────────────────────────────────────
const TODAY = {
  payinCount: 1240,
  payinAmount: 396_472.30,            // USDT
  payoutCount: 312,
  payoutAmount: 131_120.50,           // USDT
  successRate: 96.4,
  avgPayinTime: "1м 42с",
  webhookSuccess: 99.7,
  apiCalls: 84_120,
  errors4xx: 84,
  errors5xx: 2,
};

// ── PayIn (наши заказы) ────────────────────────────────────────────────────
// amountRub — что платит клиент trader'у, amount — что зачислено мерчанту в USDT
// fxRate — курс на момент создания заказа
const PAY_IN = [
  { id: "PI-7782", requestId: "ord_001a8c", amount: 128.63,  amountRub: 12_400, fxRate: 96.4, status: "received",     created: "27.04 14:08", customer: "+7 925 ***-44-12", method: "СБП → Сбербанк", traderMasked: "TR-1042", reqId: "PD-2310" },
  { id: "PI-7781", requestId: "ord_001a8b", amount: 92.32,   amountRub: 8_900,  fxRate: 96.4, status: "completed",    created: "27.04 14:06", customer: "+7 916 ***-22-87", method: "СБП → Т-Банк",   traderMasked: "TR-1077", reqId: "PD-2304" },
  { id: "PI-7780", requestId: "ord_001a8a", amount: 248.96,  amountRub: 24_000, fxRate: 96.4, status: "waiting",      created: "27.04 14:04", customer: "+7 999 ***-91-04", method: "Card → Альфа",   traderMasked: "TR-1042", reqId: "PD-2210" },
  { id: "PI-7779", requestId: "ord_001a89", amount: 58.09,   amountRub: 5_600,  fxRate: 96.4, status: "completed",    created: "27.04 14:01", customer: "+7 903 ***-55-31", method: "СБП → ВТБ",       traderMasked: "TR-1101", reqId: "PD-2188" },
  { id: "PI-7778", requestId: "ord_001a88", amount: 190.87,  amountRub: 18_400, fxRate: 96.4, status: "manual-review",created: "27.04 13:58", customer: "+7 925 ***-12-09", method: "Card → Сбербанк", traderMasked: "TR-1042", reqId: "PD-2310" },
  { id: "PI-7777", requestId: "ord_001a87", amount: 95.43,   amountRub: 9_200,  fxRate: 96.4, status: "completed",    created: "27.04 13:55", customer: "+7 916 ***-77-44", method: "СБП → Сбербанк", traderMasked: "TR-1077", reqId: "PD-2304" },
  { id: "PI-7776", requestId: "ord_001a86", amount: 35.27,   amountRub: 3_400,  fxRate: 96.4, status: "expired",      created: "27.04 13:52", customer: "+7 921 ***-33-19", method: "СБП → Т-Банк",   traderMasked: "TR-1042", reqId: "PD-2188" },
  { id: "PI-7775", requestId: "ord_001a85", amount: 153.53,  amountRub: 14_800, fxRate: 96.4, status: "disputed",     created: "27.04 13:48", customer: "+7 925 ***-66-02", method: "Card → ВТБ",      traderMasked: "TR-1101", reqId: "PD-2210" },
  { id: "PI-7774", requestId: "ord_001a84", amount: 75.73,   amountRub: 7_300,  fxRate: 96.4, status: "completed",    created: "27.04 13:45", customer: "+7 903 ***-19-77", method: "СБП → Альфа",     traderMasked: "TR-1077", reqId: "PD-2304" },
  { id: "PI-7773", requestId: "ord_001a83", amount: 228.21,  amountRub: 22_000, fxRate: 96.4, status: "completed",    created: "27.04 13:42", customer: "+7 916 ***-08-15", method: "СБП → Сбербанк", traderMasked: "TR-1042", reqId: "PD-2310" },
];

// ── PayOut (наши выплаты клиентам через trader-сеть) ──────────────────────
// Списывается с баланса мерчанта в USDT, trader выдаёт клиенту RUB
const PAY_OUT = [
  { id: "PO-3392", requestId: "wd_004c12", amount: 466.80,  amountRub: 45_000, fxRate: 96.4, status: "in-progress", created: "27.04 13:48", customer: "+7 925 ***-44-12", method: "СБП",  traderMasked: "TR-1042" },
  { id: "PO-3391", requestId: "wd_004c11", amount: 128.63,  amountRub: 12_400, fxRate: 96.4, status: "proof",       created: "27.04 13:42", customer: "+7 916 ***-22-87", method: "СБП",  traderMasked: "TR-1077" },
  { id: "PO-3390", requestId: "wd_004c10", amount: 912.86,  amountRub: 88_000, fxRate: 96.4, status: "queued",      created: "27.04 13:40", customer: "+7 999 ***-91-04", method: "Card", traderMasked: "—"      },
  { id: "PO-3389", requestId: "wd_004c0f", amount: 248.96,  amountRub: 24_000, fxRate: 96.4, status: "completed",   created: "27.04 13:32", customer: "+7 903 ***-55-31", method: "СБП",  traderMasked: "TR-1042" },
  { id: "PO-3388", requestId: "wd_004c0e", amount: 67.43,   amountRub: 6_500,  fxRate: 96.4, status: "completed",   created: "27.04 13:28", customer: "+7 925 ***-12-09", method: "СБП",  traderMasked: "TR-1077" },
  { id: "PO-3387", requestId: "wd_004c0d", amount: 331.95,  amountRub: 32_000, fxRate: 96.4, status: "failed",      created: "27.04 13:22", customer: "+7 916 ***-77-44", method: "Card", traderMasked: "—"      },
  { id: "PO-3386", requestId: "wd_004c0c", amount: 190.87,  amountRub: 18_400, fxRate: 96.4, status: "completed",   created: "27.04 13:18", customer: "+7 921 ***-33-19", method: "СБП",  traderMasked: "TR-1042" },
  { id: "PO-3385", requestId: "wd_004c0b", amount: 153.53,  amountRub: 14_800, fxRate: 96.4, status: "disputed",    created: "27.04 13:12", customer: "+7 925 ***-66-02", method: "СБП",  traderMasked: "TR-1101" },
];

// ── Споры по нашим заказам ─────────────────────────────────────────────────
const DISPUTES = [
  { id: "DSP-441", relatedOrder: "PI-7775", type: "PayIn ≠ оплачен", amount: 153.53,  amountRub: 14_800, status: "waiting-merchant", openedAt: "27.04 12:18", customer: "+7 925 ***-66-02", traderMasked: "TR-1101", sla: "осталось 6ч" },
  { id: "DSP-440", relatedOrder: "PO-3385", type: "PayOut ≠ получен", amount: 153.53,  amountRub: 14_800, status: "waiting-trader",   openedAt: "27.04 11:48", customer: "+7 925 ***-66-02", traderMasked: "TR-1101", sla: "осталось 22ч" },
  { id: "DSP-438", relatedOrder: "PI-7740", type: "Сумма не сошлась", amount: 0.52,    amountRub: 50,     status: "resolved",          openedAt: "26.04 18:30", customer: "+7 916 ***-08-99", traderMasked: "TR-1042", sla: "—" },
  { id: "DSP-437", relatedOrder: "PI-7733", type: "Чек подделан",    amount: 95.43,   amountRub: 9_200,  status: "rejected",          openedAt: "26.04 14:12", customer: "+7 925 ***-44-09", traderMasked: "TR-1077", sla: "—" },
];

// ── Withdrawals (мерчант → свой кошелёк USDT TRC-20) ──────────────────────
const WITHDRAWALS = [
  { id: "WD-228", amount: 25_000,  address: "TQrYa8Pq2nKv9bHfJ7Lm3xZ4dYsN5w8zpN", txHash: "4e8b…a92c", created: "26.04 18:00", status: "completed",   fee: 1, network: "TRC-20" },
  { id: "WD-227", amount: 18_500,  address: "TQrYa8Pq2nKv9bHfJ7Lm3xZ4dYsN5w8zpN", txHash: "7b2c…d18f", created: "25.04 12:30", status: "completed",   fee: 1, network: "TRC-20" },
  { id: "WD-226", amount: 12_000,  address: "TQrYa8Pq2nKv9bHfJ7Lm3xZ4dYsN5w8zpN", txHash: "—",         created: "27.04 09:15", status: "in-progress", fee: 1, network: "TRC-20" },
];

// ── Settlements (батч приход PayIn'ов на баланс мерчанта) ─────────────────
const SETTLEMENTS = [
  { id: "ST-512", from: "PayIn batch 26.04",          amount: 19_087.34, currency: "USDT", arrived: "26.04 23:00", status: "completed"   },
  { id: "ST-511", from: "PayIn batch 25.04",          amount: 12_863.45, currency: "USDT", arrived: "25.04 23:00", status: "completed"   },
  { id: "ST-510", from: "PayIn batch 27.04 (ongoing)", amount: 1_870.50,  currency: "USDT", arrived: "—",            status: "in-progress" },
];

// ── API ключи ──────────────────────────────────────────────────────────────
const API_KEYS = [
  { id: "key_live_8fA2k9zQrXp",  label: "Production · backend",  status: "active",  scope: "payin, payout, balance.read", created: "12.01.2024", lastUsed: "27.04 14:08", ipWhitelist: ["91.108.4.0/22"] },
  { id: "key_live_3jK7v2nW8mF",  label: "Production · refunds",  status: "active",  scope: "payout, disputes",            created: "08.02.2024", lastUsed: "27.04 13:02", ipWhitelist: ["91.108.4.0/22"] },
  { id: "key_test_aB9kL2pNqRc",  label: "Sandbox · QA",          status: "active",  scope: "all (sandbox)",                created: "12.01.2024", lastUsed: "27.04 11:12", ipWhitelist: [] },
  { id: "key_live_q1Z7M4xP8rB",  label: "Old · backend",         status: "revoked", scope: "payin, payout, balance.read", created: "01.10.2023", lastUsed: "12.01.2024", ipWhitelist: ["91.108.4.0/22"] },
];

// ── Webhook endpoints ──────────────────────────────────────────────────────
const WEBHOOK_ENDPOINTS = [
  { url: "https://api.betcity.demo/webhooks/crowdpay/payin",   events: ["payin.completed", "payin.disputed", "payin.expired"], status: "active",  successRate: 99.8 },
  { url: "https://api.betcity.demo/webhooks/crowdpay/payout",  events: ["payout.completed", "payout.failed", "payout.disputed"], status: "active",  successRate: 99.4 },
  { url: "https://api.betcity.demo/webhooks/crowdpay/balance", events: ["settlement.completed", "balance.adjusted"],          status: "active",  successRate: 100  },
];

// ── Webhook deliveries ─────────────────────────────────────────────────────
const WEBHOOK_LOGS = [
  { id: "whk_18472", event: "payin.completed", endpoint: "/webhooks/crowdpay/payin",  status: "delivered", code: 200, attempts: 1, created: "27.04 14:08:14", latencyMs: 142, refId: "PI-7781" },
  { id: "whk_18471", event: "payin.received",  endpoint: "/webhooks/crowdpay/payin",  status: "delivered", code: 200, attempts: 1, created: "27.04 14:08:02", latencyMs: 88,  refId: "PI-7782" },
  { id: "whk_18470", event: "payout.completed",endpoint: "/webhooks/crowdpay/payout", status: "delivered", code: 200, attempts: 1, created: "27.04 14:07:45", latencyMs: 124, refId: "PO-3389" },
  { id: "whk_18469", event: "payin.disputed",  endpoint: "/webhooks/crowdpay/payin",  status: "retrying",  code: 502, attempts: 3, created: "27.04 14:05:22", latencyMs: null, refId: "PI-7775" },
  { id: "whk_18468", event: "payin.completed", endpoint: "/webhooks/crowdpay/payin",  status: "delivered", code: 200, attempts: 1, created: "27.04 14:04:18", latencyMs: 102, refId: "PI-7779" },
  { id: "whk_18467", event: "payout.failed",   endpoint: "/webhooks/crowdpay/payout", status: "failed",    code: 500, attempts: 5, created: "27.04 13:22:08", latencyMs: null, refId: "PO-3387" },
  { id: "whk_18466", event: "payin.completed", endpoint: "/webhooks/crowdpay/payin",  status: "delivered", code: 200, attempts: 1, created: "27.04 13:55:14", latencyMs: 96,  refId: "PI-7777" },
  { id: "whk_18465", event: "payin.expired",   endpoint: "/webhooks/crowdpay/payin",  status: "delivered", code: 200, attempts: 1, created: "27.04 13:52:00", latencyMs: 78,  refId: "PI-7776" },
  { id: "whk_18464", event: "payin.completed", endpoint: "/webhooks/crowdpay/payin",  status: "delivered", code: 200, attempts: 1, created: "27.04 13:45:11", latencyMs: 110, refId: "PI-7774" },
  { id: "whk_18463", event: "settlement.completed", endpoint: "/webhooks/crowdpay/balance", status: "delivered", code: 200, attempts: 1, created: "26.04 23:00:12", latencyMs: 88, refId: "ST-512" },
];

// ── Балансовые операции (всё в USDT) ───────────────────────────────────────
const LEDGER = [
  { id: "ML-3120", time: "27.04 14:08", direction: "in",  amount: 128.63,    balance: 29_480.42, ref: "PI-7781", note: "PayIn settled"           },
  { id: "ML-3119", time: "27.04 14:06", direction: "out", amount: 92.32,     balance: 29_351.79, ref: "PO-3389", note: "PayOut · к клиенту"        },
  { id: "ML-3118", time: "27.04 14:04", direction: "in",  amount: 95.43,     balance: 29_444.11, ref: "PI-7777", note: "PayIn settled"            },
  { id: "ML-3117", time: "27.04 13:55", direction: "in",  amount: 75.73,     balance: 29_348.68, ref: "PI-7774", note: "PayIn settled"            },
  { id: "ML-3116", time: "27.04 13:48", direction: "out", amount: 3_320.18,  balance: 29_272.95, ref: "DSP-441", note: "Заморозка по спору"        },
  { id: "ML-3115", time: "27.04 13:32", direction: "out", amount: 248.96,    balance: 32_593.13, ref: "PO-3389", note: "PayOut · к клиенту"        },
  { id: "ML-3114", time: "27.04 13:22", direction: "in",  amount: 331.95,    balance: 32_842.09, ref: "PO-3387", note: "Возврат failed PayOut"     },
  { id: "ML-3113", time: "26.04 23:00", direction: "in",  amount: 19_087.34, balance: 32_510.14, ref: "ST-512", note: "Settlement batch"           },
  { id: "ML-3112", time: "26.04 18:00", direction: "out", amount: 25_001,    balance: 13_422.80, ref: "WD-228", note: "Withdrawal · USDT TRC-20"   },
];

// ── Volume сегодня по часам, USDT ──────────────────────────────────────────
const HOURLY_VOLUME = [
  { h: "00", payin: 3_320,   payout: 933   },
  { h: "02", payin: 1_867,   payout: 519   },
  { h: "04", payin: 1_245,   payout: 311   },
  { h: "06", payin: 2_490,   payout: 622   },
  { h: "08", payin: 11_203,  payout: 3_320 },
  { h: "10", payin: 23_236,  payout: 7_469 },
  { h: "12", payin: 32_365,  payout: 10_166},
  { h: "14", payin: 37_759,  payout: 12_863},
  { h: "16", payin: 0,        payout: 0      },
  { h: "18", payin: 0,        payout: 0      },
  { h: "20", payin: 0,        payout: 0      },
  { h: "22", payin: 0,        payout: 0      },
];

// ── Тариф (read-only — настраивает админ CrowdPay). Всё в USDT %. ─────────
const TARIFF = {
  id: "TF-002",
  name: "USDT TRC-20 · Premium",
  payInFee:  "1.4% (USDT)",
  payOutFee: "1.6% (USDT)",
  settlement:"бесплатно (T+0)",
  withdrawal:"1 USDT (network fee, TRC-20)",
  appliedSince: "12.01.2024",
};

// fmt — главная валюта USDT. Дробное (2 знака). Можно явно передать другую.
const fmt = (v, c="USDT") => {
  if (v == null || isNaN(v)) return "—";
  const sign = v < 0 ? "−" : "";
  const abs = Math.abs(v);
  const opts = c === "RUB"
    ? { maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  const s = abs.toLocaleString("ru-RU", opts);
  return sign + s + " " + c;
};

Object.assign(window, {
  ME, BALANCE, NAV, NAV_GROUPS,
  PAYIN_STATUS, PAYOUT_STATUS, DISPUTE_STATUS, KEY_STATUS, HOOK_STATUS,
  TODAY, PAY_IN, PAY_OUT, DISPUTES, WITHDRAWALS, SETTLEMENTS,
  API_KEYS, WEBHOOK_ENDPOINTS, WEBHOOK_LOGS, LEDGER, HOURLY_VOLUME, TARIFF,
  fmt,
});
