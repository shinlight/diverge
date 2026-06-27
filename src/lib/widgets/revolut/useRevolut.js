import { useCallback, useEffect, useState } from "react";
import {
  isConnected,
  connect as svcConnect,
  disconnect as svcDisconnect,
  fetchAccounts,
  fetchTransactions,
} from "./revolutService";

// One source of truth for the Revolut widget + its expanded view.
// Connected = an Open Banking consent exists. Today everything is mock; the
// service is the swap point for the real serverless GoCardless proxy.
export function useRevolut() {
  const [connected, setConnected] = useState(isConnected);
  const [connecting, setConnecting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const [accs, txs] = await Promise.all([fetchAccounts(), fetchTransactions()]);
      setAccounts(accs);
      setTransactions(txs);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (connected) refresh();
  }, [connected, refresh]);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      await svcConnect();
      setConnected(true);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    svcDisconnect();
    setConnected(false);
    setAccounts([]);
    setTransactions([]);
    setStatus("idle");
  }, []);

  const primary = accounts.find((a) => a.primary) ?? accounts[0] ?? null;
  const pockets = accounts.filter((a) => !a.primary);

  return {
    connected,
    connecting,
    status,
    accounts,
    primary,
    pockets,
    balance: primary?.balance ?? 0,
    currency: primary?.currency ?? "EUR",
    transactions,
    connect,
    disconnect,
    refresh,
  };
}
