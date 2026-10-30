import React from "react"

function Footer({lang, onCookieSettings}){
	const langParam = `?lang=${lang ? "fr" : "en"}`
	return (
		<footer>
			<span>{lang ? "Réalisé avec une petite touche de joie par " : "Made with a little extra joy by "}</span>
			<a href="https://toogreen.ca" target="_blank" rel="noopener noreferrer">David Gagnon</a>
			<span className="footer-links">
				<a href={`./privacy.html${langParam}`}>{lang ? "Confidentialité" : "Privacy"}</a>
				{" · "}
				<a href={`./terms.html${langParam}`}>{lang ? "Conditions" : "Terms"}</a>
				{" · "}
				<button type="button" className="link-button" onClick={onCookieSettings}>{lang ? "Témoins" : "Cookies"}</button>
			</span>
		</footer>
	)
}

export default Footer
