/*
  Divergify — Admin dashboard service.

  Fully local MOCK now (seeded users, subscriptions, payments) so the management
  UI is testable without a backend. SWAP POINTS to go live:
    isAdmin()         -> profiles.is_admin column (+ RLS allowing admins to read all)
    getUsers()        -> supabase.from('profiles').select() joined with auth.users
    getSubscriptions()-> supabase.from('subscriptions').select()
    getPayments()     -> supabase.from('payments') (Stripe webhooks) + on-chain txs
    getOverview()     -> aggregate queries / a Postgres view
  Feedback reuses the existing feedbackService (lib/feedback) — same table later.
*/

import { loadFeedback } from "../feedback/feedbackService";

// Email allowlist for the mock gate. Real: profiles.is_admin + RLS.
const ADMIN_EMAILS = ["igor.bragato@gmail.com", "igor@example.com", "ospite@diverge.app"];

export function isAdmin(user) {
  if (!user) return false;
  try {
    if (localStorage.getItem("diverge.admin") === "1") return true; // dev override
  } catch {
    // ignore
  }
  return ADMIN_EMAILS.includes((user.email || "").toLowerCase());
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const PRO_PRICE = 6; // €/month

export const PLAN_PRICE = { free: 0, pro: PRO_PRICE };

export function formatMoney(amount, currency = "EUR") {
  if (["BTC", "ETH", "USDC"].includes(currency)) {
    return `${amount} ${currency}`;
  }
  return new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(amount);
}

export function formatDate(iso, withTime = false) {
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

const daysAgo = (n) => new Date(Date.now() - n * 86400_000).toISOString();
const hoursAgo = (n) => new Date(Date.now() - n * 3600_000).toISOString();

// --- seeded users --------------------------------------------------------

const USERS = [
  { id: "u1", name: "Igor Bragato", email: "igor.bragato@gmail.com", plan: "pro", status: "active", isAdmin: true, createdAt: daysAgo(120), lastSeen: hoursAgo(1) },
  { id: "u2", name: "Giulia Verdi", email: "giulia.verdi@gmail.com", plan: "pro", status: "active", isAdmin: false, createdAt: daysAgo(96), lastSeen: hoursAgo(5) },
  { id: "u3", name: "Marco Bianchi", email: "marco.b@studio.it", plan: "free", status: "active", isAdmin: false, createdAt: daysAgo(80), lastSeen: daysAgo(2) },
  { id: "u4", name: "Sara Conti", email: "sara.conti@outlook.com", plan: "pro", status: "active", isAdmin: false, createdAt: daysAgo(64), lastSeen: hoursAgo(20) },
  { id: "u5", name: "Luca Ferrari", email: "luca.ferrari@gmail.com", plan: "free", status: "active", isAdmin: false, createdAt: daysAgo(51), lastSeen: daysAgo(1) },
  { id: "u6", name: "Anna Russo", email: "anna.russo@gmail.com", plan: "pro", status: "past_due", isAdmin: false, createdAt: daysAgo(47), lastSeen: daysAgo(9) },
  { id: "u7", name: "Tom Becker", email: "tom.becker@proton.me", plan: "free", status: "active", isAdmin: false, createdAt: daysAgo(33), lastSeen: hoursAgo(40) },
  { id: "u8", name: "Elena Costa", email: "elena.costa@gmail.com", plan: "pro", status: "active", isAdmin: false, createdAt: daysAgo(28), lastSeen: hoursAgo(3) },
  { id: "u9", name: "Davide Greco", email: "d.greco@icloud.com", plan: "free", status: "suspended", isAdmin: false, createdAt: daysAgo(22), lastSeen: daysAgo(14) },
  { id: "u10", name: "Chiara Moretti", email: "chiara.m@gmail.com", plan: "free", status: "active", isAdmin: false, createdAt: daysAgo(12), lastSeen: hoursAgo(8) },
  { id: "u11", name: "Paolo Rizzo", email: "paolo.rizzo@gmail.com", plan: "pro", status: "active", isAdmin: false, createdAt: daysAgo(6), lastSeen: hoursAgo(2) },
  { id: "u12", name: "Nadia Fabbri", email: "nadia.f@gmail.com", plan: "free", status: "active", isAdmin: false, createdAt: daysAgo(2), lastSeen: hoursAgo(6) },
];

const SUBSCRIPTIONS = USERS.filter((u) => u.plan === "pro").map((u, i) => ({
  id: `sub_${u.id}`,
  userId: u.id,
  user: u.name,
  plan: "Pro",
  status: u.status === "past_due" ? "past_due" : "active",
  amount: PRO_PRICE,
  currency: "EUR",
  interval: "month",
  method: i % 2 === 0 ? "card" : "crypto",
  startedAt: u.createdAt,
  renewsAt: daysAgo(-(5 + i * 3)), // future
}));

const PAYMENTS = [
  { id: "pay_1", userId: "u1", user: "Igor Bragato", amount: 6, currency: "EUR", method: { type: "card", brand: "Visa", last4: "4242" }, status: "succeeded", createdAt: hoursAgo(2), invoice: "INV-1042" },
  { id: "pay_2", userId: "u2", user: "Giulia Verdi", amount: 6, currency: "EUR", method: { type: "card", brand: "Mastercard", last4: "5511" }, status: "succeeded", createdAt: hoursAgo(26), invoice: "INV-1041" },
  { id: "pay_3", userId: "u4", user: "Sara Conti", amount: 0.00018, currency: "BTC", method: { type: "crypto", asset: "BTC", tx: "bc1q…9f3a" }, status: "succeeded", createdAt: daysAgo(2), invoice: "INV-1040" },
  { id: "pay_4", userId: "u8", user: "Elena Costa", amount: 6, currency: "USDC", method: { type: "crypto", asset: "USDC", tx: "0x7a…b21c" }, status: "succeeded", createdAt: daysAgo(3), invoice: "INV-1039" },
  { id: "pay_5", userId: "u6", user: "Anna Russo", amount: 6, currency: "EUR", method: { type: "card", brand: "Visa", last4: "0931" }, status: "failed", createdAt: daysAgo(4), invoice: "INV-1038" },
  { id: "pay_6", userId: "u11", user: "Paolo Rizzo", amount: 0.0024, currency: "ETH", method: { type: "crypto", asset: "ETH", tx: "0x3c…7d40" }, status: "pending", createdAt: daysAgo(5), invoice: "INV-1037" },
  { id: "pay_7", userId: "u2", user: "Giulia Verdi", amount: 6, currency: "EUR", method: { type: "card", brand: "Mastercard", last4: "5511" }, status: "succeeded", createdAt: daysAgo(31), invoice: "INV-1031" },
  { id: "pay_8", userId: "u4", user: "Sara Conti", amount: 6, currency: "EUR", method: { type: "card", brand: "Amex", last4: "1007" }, status: "refunded", createdAt: daysAgo(34), invoice: "INV-1029" },
  { id: "pay_9", userId: "u1", user: "Igor Bragato", amount: 6, currency: "EUR", method: { type: "card", brand: "Visa", last4: "4242" }, status: "succeeded", createdAt: daysAgo(32), invoice: "INV-1028" },
  { id: "pay_10", userId: "u8", user: "Elena Costa", amount: 6, currency: "USDC", method: { type: "crypto", asset: "USDC", tx: "0x9e…2a55" }, status: "succeeded", createdAt: daysAgo(33), invoice: "INV-1027" },
];

// --- public API (mock) ---------------------------------------------------

export async function getUsers() {
  await delay(350);
  return USERS.map((u) => ({ ...u }));
}

export async function getSubscriptions() {
  await delay(350);
  return SUBSCRIPTIONS.map((s) => ({ ...s }));
}

export async function getPayments() {
  await delay(350);
  return PAYMENTS.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getOverview() {
  await delay(350);
  const activeUsers = USERS.filter((u) => new Date(u.lastSeen) > new Date(daysAgo(7))).length;
  const proCount = USERS.filter((u) => u.plan === "pro").length;
  const mrr = SUBSCRIPTIONS.filter((s) => s.status === "active").reduce((s) => s + PRO_PRICE, 0);
  const openFeedback = loadFeedback().filter((f) => f.status === "new").length;

  // Signups per day over the last 14 days (for a small bar chart).
  const signups = Array.from({ length: 14 }, (_, i) => {
    const day = 13 - i;
    const start = new Date(daysAgo(day));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 86400_000);
    const count = USERS.filter((u) => {
      const c = new Date(u.createdAt);
      return c >= start && c < end;
    }).length;
    return { day: start.toISOString(), count };
  });

  return {
    totalUsers: USERS.length,
    activeUsers,
    proCount,
    freeCount: USERS.length - proCount,
    mrr,
    arr: mrr * 12,
    openFeedback,
    signups,
  };
}
