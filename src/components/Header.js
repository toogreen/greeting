import React from "react"

function Header({lang}) {
	return (
		<header className="site-header">
			<a className="brand" href="/" aria-label={lang ? "Accueil Cardly" : "Cardly home"}>
				<span className="brand-mark" aria-hidden="true">✳</span>
				<span className="brand-name">Cardly</span>
			</a>
			<span className="header-note">{lang ? "Créée pour les moments qui comptent" : "Made for the moments that matter"}</span>
		</header>
	)
}

export default Header