// Paymania — demo data (same entities as the main demo)
const PM = {
  merchants: [
    { id: "M-501", name: "BetCity", status: "active", joined: "12.01.2024", balance: 48210.4, today: 1840.2, conv: 31.4, avg: 42 },
    { id: "M-502", name: "MaxBet", status: "active", joined: "18.02.2024", balance: 21980.0, today: 960.5, conv: 27.9, avg: 37 },
    { id: "M-503", name: "Casino24", status: "test", joined: "03.03.2024", balance: 1000, today: 0, conv: 0, avg: 0 },
    { id: "M-504", name: "TopBet", status: "off", joined: "14.04.2024", balance: 0, today: 0, conv: 0, avg: 0 },
  ],
  traders: [
    { id: "TR-1042", name: "Алексей Морозов", team: "Альфа", status: "active", rating: 4.82, working: 12480.5, locked: 1820.0, today: 412.3 },
    { id: "TR-1058", name: "Тимур Иванов", team: "Альфа", status: "active", rating: 4.6, working: 8340.0, locked: 640.0, today: 198.0 },
    { id: "TR-1061", name: "Денис Волков", team: "Бета", status: "active", rating: 4.2, working: 15120.8, locked: 2310.5, today: 520.7 },
    { id: "TR-1073", name: "Михаил Соколов", team: "Бета", status: "off", rating: 3.9, working: 0, locked: 380.0, today: 0 },
    { id: "TR-1077", name: "Роман Петров", team: "Гамма", status: "active", rating: 4.5, working: 6920.3, locked: 410.0, today: 145.9 },
    { id: "TR-1082", name: "Сергей Григорьев", team: "Гамма", status: "test", rating: 4.0, working: 500, locked: 0, today: 0 },
  ],
  banks: [
    { id: "bank_a", name: "Bank A", hue: 145, sms: true, push: true, card: true, sbp: true },
    { id: "bank_b", name: "Bank B", hue: 25, sms: true, push: false, card: true, sbp: true },
    { id: "bank_c", name: "Bank C", hue: 255, sms: false, push: true, card: false, sbp: true },
    { id: "bank_d", name: "Bank D", hue: 300, sms: true, push: true, card: true, sbp: false },
  ],
  rates: [{ c: "RUB", src: "Rapira", v: 81.92 }, { c: "KZT", src: "Bybit", v: 512.4 }, { c: "AZN", src: "Bybit", v: 1.7 }, { c: "UZS", src: "Bybit", v: 12640 }],
  payments: [
    { id: "a91f2c", t: "20:41", m: "BetCity", method: "СБП", rub: 12000, st: "ok" },
    { id: "b72e10", t: "20:38", m: "MaxBet", method: "Карта", rub: 4500, st: "ok" },
    { id: "c03d88", t: "20:31", m: "BetCity", method: "СБП", rub: 25000, st: "wait" },
    { id: "d14a5b", t: "20:22", m: "BetCity", method: "Карта", rub: 7800, st: "ok" },
    { id: "e5b6c1", t: "20:09", m: "MaxBet", method: "СБП", rub: 3000, st: "fail" },
    { id: "f61c2e", t: "19:57", m: "BetCity", method: "СБП", rub: 15500, st: "ok" },
    { id: "g8e0a4", t: "19:44", m: "MaxBet", method: "Карта", rub: 9200, st: "dispute" },
    { id: "h9a3f7", t: "19:30", m: "BetCity", method: "СБП", rub: 6100, st: "ok" },
  ],
  payouts: [
    { id: "p4410", t: "20:12", rub: 30000, bank: "Bank A", st: "ok" },
    { id: "p4409", t: "19:48", rub: 12500, bank: "Bank B", st: "wait" },
    { id: "p4408", t: "18:30", rub: 8000, bank: "Bank A", st: "ok" },
  ],
  details: [
    { bank: "Bank A", hue: 145, items: [
      { holder: "Алексей М.", target: "+7 900 123-45-67", last: "4423", device: "Pixel 6a", method: "СБП · Карта", on: true },
      { holder: "Алексей М.", target: "+7 901 555-10-20", last: "8810", device: "Redmi Note 12", method: "СБП", on: true },
    ] },
    { bank: "Bank B", hue: 25, items: [
      { holder: "Алексей М.", target: "•••• 4423", last: "4423", device: "Pixel 6a", method: "Карта", on: true },
      { holder: "Алексей М.", target: "+7 902 333-44-55", last: "1290", device: "Honor 8X", method: "СБП", on: false },
    ] },
    { bank: "Bank D", hue: 300, items: [
      { holder: "Алексей М.", target: "•••• 7781", last: "7781", device: "Redmi Note 12", method: "Карта", on: true },
    ] },
  ],
  RATE: 81.92,
};
const PM_ST = { ok: ["pos", "Успешно"], wait: ["warn", "Ожидает"], fail: ["neg", "Отклонён"], dispute: ["neg", "Спор"] };
const PM_MST = { active: ["pos", "Активен"], test: ["warn", "Тестирование"], off: ["neg", "Отключён"] };
Object.assign(window, { PM, PM_ST, PM_MST });
