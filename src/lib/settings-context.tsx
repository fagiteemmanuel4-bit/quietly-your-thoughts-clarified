import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export type UserSettings = {
  theme: "light" | "dark" | "system";
  notifications: "all" | "mentions" | "none";
  language: string;
  emailDigest: "daily" | "weekly" | "none";
  aiModel: string;
};

const defaultSettings: UserSettings = {
  theme: "system",
  notifications: "all",
  language: "en",
  emailDigest: "daily",
  aiModel: "anthropic/claude-3.5-sonnet",
};

type SettingsContextType = {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  loading: boolean;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, "users", user.uid, "config", "settings");
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as UserSettings);
      } else {
        // Initialize if not exists
        setDoc(docRef, defaultSettings);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid, "config", "settings");
    await setDoc(docRef, { ...settings, ...updates }, { merge: true });
  };

  useEffect(() => {
    // Apply theme globally
    const applyTheme = (t: UserSettings["theme"]) => {
      const isDark =
        t === "dark" ||
        (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", isDark);
    };
    applyTheme(settings.theme);
  }, [settings.theme]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
