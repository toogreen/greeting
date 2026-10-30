import React, {useState} from "react"
import Header from "./components/Header"
import Generator from "./components/Generator"
import Footer from "./components/Footer"
import ConsentBanner, {savedConsent} from "./components/ConsentBanner"
import "./App.css"

// French-speaking visitors get the French version first (Charter of the French Language).
const prefersFrench = (navigator.language || "").toLowerCase().startsWith("fr")

function App() {
  const [lang, setLang] = useState(prefersFrench)
  const [consentOpen, setConsentOpen] = useState(() => !savedConsent() || window.location.hash === "#cookies")
  return (
    <div className="app-shell">
      <Header lang={lang} />
      <Generator initialLang={prefersFrench} onLangChange={setLang} />
      <Footer lang={lang} onCookieSettings={() => setConsentOpen(true)} />
      {consentOpen && <ConsentBanner lang={lang} onClose={() => setConsentOpen(false)} />}
    </div>
  )
}

export default App
