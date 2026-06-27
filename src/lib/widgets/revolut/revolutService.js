/*
  DiVerge — Revolut (retail) service.

  Revolut retail has no direct public API: the only sanctioned way to read a
  personal account is Open Banking (PSD2 / AIS) through a licensed aggregator.
  This file is the SWAP POINT: today it stores a "connected" flag locally and
  serves a mock account + transactions so the widget UX is fully testable.

  To go live, replace each body with a call to a serverless proxy
  (`/api/revolut`) that talks to GoCardless Bank Account Data (ex Nordigen):

    connect()           -> POST /api/revolut { action: "link" }      // create a
                           requisition, redirect the user to Revolut consent,
                           then store the returned account id(s).
    fetchAccounts()     -> POST /api/revolut { action: "balances" }  // GET
                           /accounts/{id}/balances/ per linked account.
    fetchTransactions() -> POST /api/revolut { action: "transactions" } // GET
                           /accounts/{id}/transactions/

  The GoCardless secret_id / secret_key and the access token must stay
  SERVER-ONLY (never VITE_-prefixed); the serverless proxy holds them. PSD2
  consent expires ~90 days, after which connect() must re-run.

  Read-only: no payment / transfer is ever issued from here, by design.
*/

import { relativeTime, fullDate } from "../gmail/gmailService";

export { relativeTime, fullDate };

const CONNECTED_KEY = "diverge.revolut.connected";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// --- connection state (mock) --------------------------------------------

export function isConnected() {
  try {
    return localStorage.getItem(CONNECTED_KEY) === "1";
  } catch {
    return false;
  }
}

export async function connect() {
  // PHASE: this is where the GoCardless requisition link / consent redirect
  // happens. The mock just simulates the round-trip and flips the flag.
  await delay(900);
  localStorage.setItem(CONNECTED_KEY, "1");
  return true;
}

export function disconnect() {
  localStorage.removeItem(CONNECTED_KEY);
}

// --- currency formatting -------------------------------------------------

const LOCALE = { EUR: "it-IT", USD: "en-US", GBP: "en-GB" };

export function formatMoney(amount, currency = "EUR", { signed = false } = {}) {
  const fmt = new Intl.NumberFormat(LOCALE[currency] || "it-IT", {
    style: "currency",
    currency,
    signDisplay: signed ? "exceptZero" : "auto",
  });
  return fmt.format(amount);
}

// --- mock data (seeded) --------------------------------------------------

function minutesAgo(n) {
  return new Date(Date.now() - n * 60_000).toISOString();
}
function hoursAgo(n) {
  return minutesAgo(n * 60);
}
function daysAgo(n) {
  return hoursAgo(n * 24);
}

// Primary EUR account + two multi-currency pockets (balance-only in the mock).
function seedAccounts() {
  return [
    { id: "acc_eur", currency: "EUR", balance: 2847.63, primary: true },
    { id: "pkt_usd", currency: "USD", balance: 312.4, primary: false },
    { id: "pkt_gbp", currency: "GBP", balance: 88.1, primary: false },
  ];
}

// All transactions belong to the primary (EUR) account in the mock.
function seedTransactions() {
  return [
    { id: "t1", merchant: "Spotify", category: "Abbonamenti", amount: -10.99, currency: "EUR", date: hoursAgo(3) },
    { id: "t2", merchant: "Esselunga", category: "Spesa", amount: -47.32, currency: "EUR", date: hoursAgo(7) },
    { id: "t3", merchant: "Stipendio ACME S.r.l.", category: "Entrate", amount: 1850.0, currency: "EUR", date: daysAgo(1) },
    { id: "t4", merchant: "Trenitalia", category: "Trasporti", amount: -29.9, currency: "EUR", date: daysAgo(1) },
    { id: "t5", merchant: "Amazon", category: "Shopping", amount: -63.5, currency: "EUR", date: daysAgo(2) },
    { id: "t6", merchant: "Bar Centrale", category: "Ristoranti", amount: -4.2, currency: "EUR", date: daysAgo(2) },
    { id: "t7", merchant: "Rimborso Marco", category: "Entrate", amount: 25.0, currency: "EUR", date: daysAgo(3) },
    { id: "t8", merchant: "Enel Energia", category: "Bollette", amount: -78.14, currency: "EUR", date: daysAgo(4) },
    { id: "t9", merchant: "IKEA", category: "Casa", amount: -119.0, currency: "EUR", date: daysAgo(5) },
    { id: "t10", merchant: "Netflix", category: "Abbonamenti", amount: -12.99, currency: "EUR", date: daysAgo(6) },
  ];
}

// --- public API (mock; swap with /api/revolut) ---------------------------

export async function fetchAccounts() {
  await delay(500);
  return seedAccounts();
}

export async function fetchTransactions() {
  await delay(650);
  return seedTransactions().sort((a, b) => new Date(b.date) - new Date(a.date));
}
