import React from "react"
import Header from "./components/Header"
import Generator from "./components/Generator"
import Footer from "./components/Footer"
import "./App.css"

function App() {
  return (
    <div className="app-shell">
      <Header />
      <Generator />
      <Footer />
    </div>
  )
}

export default App