import { createContext, useState, useContext, useEffect } from "react";
import en from "../lang/en";
import ar from "../lang/ar";

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState("ar");
  const translations = lang === "ar" ? ar : en;

  useEffect(() => {
  document.body.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
}, [lang]);

  const t = (key) => translations[key] || key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
