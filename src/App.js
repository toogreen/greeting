import React, {useState} from "react"
import Header from "./components/Header"
import Generator from "./components/Generator"
import Footer from "./components/Footer"
import "./App.css"

function App() {
  const [lang, setLang] = useState(false)
  return (
    <div className="app-shell">
      <Header lang={lang} />
      <Generator onLangChange={setLang} />
      <Footer lang={lang} />
    </div>
  )
}

export default App