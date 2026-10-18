import React from "react"

function Footer({lang}){
	return (
		<footer>
			<span>{lang ? "Réalisé avec une petite touche de joie par " : "Made with a little extra joy by "}</span>
			<a href="https://toogreen.ca" target="_blank" rel="noopener noreferrer">David Gagnon</a>
		</footer>
	)
}

export default Footer