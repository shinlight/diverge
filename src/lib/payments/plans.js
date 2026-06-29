/*
  Divergify — SaaS billing predisposition.

  No real charges happen yet. This file defines the product tiers and a
  single entry point, startCheckout(), that we'll later wire to:
    - Stripe Checkout  (cards / SEPA / Apple Pay…)
    - a crypto gateway (e.g. Coinbase Commerce / wallet connect)

  Keeping it behind one function means the UI never has to change when the
  real providers are plugged in.
*/

export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "EUR",
    period: "sempre",
    features: ["Fino a 4 widget", "1 tema", "Sincronizzazione locale"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 6,
    currency: "EUR",
    period: "mese",
    features: [
      "Widget illimitati",
      "Tutti i temi + colori custom",
      "Sync cloud tra dispositivi",
      "Widget premium (in arrivo)",
    ],
    highlighted: true,
  },
];

export const PAYMENT_METHODS = [
  { id: "stripe", label: "Carta / Stripe", enabled: false },
  { id: "crypto", label: "Crypto", enabled: false },
];

/**
 * Placeholder checkout. In Phase 4 this will redirect to a real provider.
 * @param {string} planId
 * @param {"stripe"|"crypto"} method
 */
export async function startCheckout(planId, method) {
  // eslint-disable-next-line no-console
  console.info(`[Divergify] Checkout richiesto: piano="${planId}" metodo="${method}"`);
  return {
    ok: false,
    pending: true,
    message:
      "I pagamenti non sono ancora attivi. Predisposizione pronta per Stripe e Crypto (Fase 4).",
  };
}
