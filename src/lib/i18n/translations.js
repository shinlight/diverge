/*
  DiVerge — translations (EN default, IT available).

  Strings are looked up by dot path: t("common.save").
  Interpolation: t("profile.plan", { plan: "free" }) with "{plan}" in the value.
  Missing keys fall back to English, then to the key itself.

  Scope today: app chrome + the new widgets (Weather, Notes, Clipboard).
  The older widgets (Gmail, Calendar, Pomodoro, AI) are localized in a later pass.
*/

export const LANGUAGES = [
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "it", label: "Italiano", flag: "🇮🇹" },
];

export const DEFAULT_LANG = "en";

export const TRANSLATIONS = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      delete: "Delete",
      clear: "Clear",
      add: "Add",
      refresh: "Refresh",
      expand: "Expand",
      retry: "Retry",
      loading: "Loading…",
      back: "Back",
      copy: "Copy",
      copied: "Copied!",
      test: "Test",
    },
    toolbar: {
      customizeTheme: "Customize theme",
      goToProfile: "Go to profile",
    },
    dashboard: {
      addWidget: "Add widget",
    },
    addWidget: {
      title: "Add a widget",
      subtitle: "Choose what to keep an eye on.",
      allAdded: "You've added every available widget. 🎉",
      multiple: "Add several",
    },
    theme: {
      title: "Customize",
      theme: "Theme",
      accent: "Accent color",
      customColor: "Custom color",
      comfort: "Comfort",
      reduceMotion: "Reduce motion",
      reduceMotionDesc: "Calmer movement, fewer stimuli.",
      language: "Language",
      sound: "Notification sound",
      soundDesc: "Plays when a notification arrives.",
      haptics: "Haptic feedback",
      hapticsDesc: "Vibration on supported devices.",
    },
    sounds: { none: "None", chime: "Chime", ping: "Ping", pop: "Pop", marimba: "Marimba" },
    login: {
      tagline: "Your space, your way.\nA dashboard that follows how you think.",
      continueGoogle: "Continue with Google",
      continueMeta: "Continue with Meta",
      or: "or",
      email: "Email",
      password: "Password",
      nickname: "Nickname",
      signIn: "Sign in",
      createAccount: "Create account",
      noAccount: "No account?",
      haveAccount: "Already have an account?",
      signUp: "Sign up",
      demo: "Demo mode · no real data is sent",
    },
    profile: {
      back: "Back to dashboard",
      name: "Name",
      namePlaceholder: "Your name",
      nickname: "Nickname",
      nicknamePlaceholder: "Your nickname",
      showInBar: "Show in the bar",
      changeImage: "Change image",
      plan: "{plan} plan",
      subscription: "Subscription",
      subscriptionDesc: "Ready to go · payments coming soon (Stripe & Crypto).",
      logout: "Log out",
    },
    notifications: {
      title: "Notifications",
      markAllRead: "Mark all read",
      clearAll: "Clear all",
      empty: "You're all caught up.",
    },
    widgets: {
      gmail: { name: "Gmail", desc: "Your most recent emails, at a glance." },
      calendar: { name: "Calendar", desc: "Upcoming events from your agenda." },
      tasks: { name: "To-Do", desc: "A simple list to stay on track." },
      notes: { name: "Quick Notes", desc: "Capture a thought before it flies away." },
      weather: { name: "Weather", desc: "A quick look at today's sky." },
      focus: { name: "Focus Timer", desc: "Pomodoro-style focus sessions." },
      ai: { name: "AI Assistant", desc: "Chat with an LLM of your choice. Add more than one!" },
      clipboard: { name: "Clipboard History", desc: "Reuse anything you've copied recently." },
    },
    weather: {
      shareTitle: "See your local weather",
      shareDesc: "Share your location to get an accurate forecast.",
      share: "Share location",
      locating: "Getting your location…",
      denied: "Location access denied.",
      deniedHint: "Enable location to see the weather.",
      error: "Couldn't load the weather.",
      feelsLike: "Feels like {t}°",
      humidity: "Humidity",
      wind: "Wind",
      forecast: "Next days",
      yourLocation: "Your location",
    },
    weatherCodes: {
      clear: "Clear sky",
      mainlyClear: "Mainly clear",
      cloudy: "Cloudy",
      fog: "Fog",
      drizzle: "Drizzle",
      rain: "Rain",
      snow: "Snow",
      showers: "Showers",
      thunder: "Thunderstorm",
    },
    notes: {
      placeholder: "Write a note…",
      empty: "No notes yet.",
      emptyHint: "Jot down anything you don't want to forget.",
      update: "Update",
      saveNote: "Add note",
      count: "{n} notes",
    },
    clipboard: {
      grab: "Add from clipboard",
      placeholder: "Or type something to save…",
      empty: "Nothing saved yet.",
      emptyHint: "Copied snippets you add will appear here.",
      clear: "Clear history",
      clearConfirm: "Clear all clipboard history?",
      copyBack: "Copy",
      count: "{n}/{max}",
      grabError: "Couldn't read the clipboard. Paste it in the field instead.",
    },
  },

  it: {
    common: {
      save: "Salva",
      cancel: "Annulla",
      close: "Chiudi",
      delete: "Elimina",
      clear: "Svuota",
      add: "Aggiungi",
      refresh: "Aggiorna",
      expand: "Espandi",
      retry: "Riprova",
      loading: "Caricamento…",
      back: "Indietro",
      copy: "Copia",
      copied: "Copiato!",
      test: "Prova",
    },
    toolbar: {
      customizeTheme: "Personalizza tema",
      goToProfile: "Vai al profilo",
    },
    dashboard: {
      addWidget: "Aggiungi widget",
    },
    addWidget: {
      title: "Aggiungi un widget",
      subtitle: "Scegli cosa tenere sotto controllo.",
      allAdded: "Hai già aggiunto tutti i widget disponibili. 🎉",
      multiple: "Multipli",
    },
    theme: {
      title: "Personalizza",
      theme: "Tema",
      accent: "Colore d'accento",
      customColor: "Colore personalizzato",
      comfort: "Comfort",
      reduceMotion: "Riduci animazioni",
      reduceMotionDesc: "Movimenti più calmi, meno stimoli.",
      language: "Lingua",
      sound: "Suono notifiche",
      soundDesc: "Si attiva all'arrivo di una notifica.",
      haptics: "Feedback aptico",
      hapticsDesc: "Vibrazione sui dispositivi compatibili.",
    },
    sounds: { none: "Nessuno", chime: "Campanella", ping: "Ping", pop: "Pop", marimba: "Marimba" },
    login: {
      tagline: "Il tuo spazio, a modo tuo.\nUna dashboard che asseconda il tuo modo di pensare.",
      continueGoogle: "Continua con Google",
      continueMeta: "Continua con Meta",
      or: "oppure",
      email: "Email",
      password: "Password",
      nickname: "Nickname",
      signIn: "Accedi",
      createAccount: "Crea account",
      noAccount: "Non hai un account?",
      haveAccount: "Hai già un account?",
      signUp: "Registrati",
      demo: "Modalità demo · nessun dato reale viene inviato",
    },
    profile: {
      back: "Torna alla dashboard",
      name: "Nome",
      namePlaceholder: "Il tuo nome",
      nickname: "Nickname",
      nicknamePlaceholder: "Il tuo nickname",
      showInBar: "Mostra nella barra",
      changeImage: "Cambia immagine",
      plan: "Piano {plan}",
      subscription: "Abbonamento",
      subscriptionDesc: "Predisposizione pronta · pagamenti in arrivo (Stripe & Crypto).",
      logout: "Esci",
    },
    notifications: {
      title: "Notifiche",
      markAllRead: "Segna tutte lette",
      clearAll: "Cancella tutte",
      empty: "Sei in pari, nessuna notifica.",
    },
    widgets: {
      gmail: { name: "Gmail", desc: "Le tue email più recenti, a colpo d'occhio." },
      calendar: { name: "Calendario", desc: "I prossimi impegni dalla tua agenda." },
      tasks: { name: "To-Do", desc: "Una lista semplice per non perdere il filo." },
      notes: { name: "Note rapide", desc: "Cattura un pensiero prima che voli via." },
      weather: { name: "Meteo", desc: "Uno sguardo veloce al cielo di oggi." },
      focus: { name: "Timer Focus", desc: "Sessioni di concentrazione in stile Pomodoro." },
      ai: { name: "Assistente AI", desc: "Chatta con un LLM a tua scelta. Aggiungine più di uno!" },
      clipboard: { name: "Cronologia Appunti", desc: "Riutilizza tutto ciò che hai copiato di recente." },
    },
    weather: {
      shareTitle: "Vedi il meteo locale",
      shareDesc: "Condividi la posizione per previsioni accurate.",
      share: "Condividi posizione",
      locating: "Recupero la posizione…",
      denied: "Accesso alla posizione negato.",
      deniedHint: "Abilita la posizione per vedere il meteo.",
      error: "Impossibile caricare il meteo.",
      feelsLike: "Percepita {t}°",
      humidity: "Umidità",
      wind: "Vento",
      forecast: "Prossimi giorni",
      yourLocation: "La tua posizione",
    },
    weatherCodes: {
      clear: "Sereno",
      mainlyClear: "Quasi sereno",
      cloudy: "Nuvoloso",
      fog: "Nebbia",
      drizzle: "Pioviggine",
      rain: "Pioggia",
      snow: "Neve",
      showers: "Rovesci",
      thunder: "Temporale",
    },
    notes: {
      placeholder: "Scrivi una nota…",
      empty: "Nessuna nota.",
      emptyHint: "Annota tutto ciò che non vuoi dimenticare.",
      update: "Aggiorna",
      saveNote: "Aggiungi nota",
      count: "{n} note",
    },
    clipboard: {
      grab: "Aggiungi dagli appunti",
      placeholder: "Oppure scrivi qualcosa da salvare…",
      empty: "Niente di salvato.",
      emptyHint: "Gli appunti che aggiungi compariranno qui.",
      clear: "Svuota cronologia",
      clearConfirm: "Svuotare tutta la cronologia appunti?",
      copyBack: "Copia",
      count: "{n}/{max}",
      grabError: "Impossibile leggere gli appunti. Incollali nel campo.",
    },
  },
};

function get(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function translate(lang, key, vars) {
  let s = get(TRANSLATIONS[lang], key);
  if (s == null) s = get(TRANSLATIONS[DEFAULT_LANG], key);
  if (s == null) return key;
  if (vars) {
    for (const k of Object.keys(vars)) s = s.replaceAll(`{${k}}`, vars[k]);
  }
  return s;
}
