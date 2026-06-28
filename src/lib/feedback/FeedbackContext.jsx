import { createContext, useCallback, useContext, useMemo, useState } from "react";
import FeedbackModal from "../../components/feedback/FeedbackModal";

/*
  One feedback modal for the whole app. Any widget (or a global button) calls
  open({ widgetId, widgetName }); the modal captures context and submits.
*/
const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [target, setTarget] = useState(null); // null = closed

  const open = useCallback((ctx = {}) => setTarget(ctx), []);
  const close = useCallback(() => setTarget(null), []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <FeedbackModal target={target} onClose={close} />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  return useContext(FeedbackContext) ?? { open: () => {} };
}
