import React from "react"

// Google Analytics and AdSense stay off until the visitor accepts (PIPEDA, Quebec Law 25).
// The loaders live in public/index.html so a saved choice applies before the app renders.
export const consentKey = "cardly-consent"

export function savedConsent() {
	try {
		return localStorage.getItem(consentKey)
	} catch (error) {
		return null
	}
}

function ConsentBanner({lang, onClose}) {
	const choose = choice => {
		try {
			localStorage.setItem(consentKey, choice)
		} catch (error) {}
		if (choice === "granted") {
			if (window.loadAnalytics) window.loadAnalytics()
			if (window.loadAds) window.loadAds()
		} else {
			if (window.revokeAnalytics) window.revokeAnalytics()
			if (window.revokeAds) window.revokeAds()
		}
		onClose()
	}

	return (
		<div className="consent" role="region" aria-labelledby="consent-title">
			<p>
				<strong id="consent-title">{lang ? "Votre vie privée" : "Your privacy"}</strong>{" "}
				{lang
					? "Avec votre permission, nous utilisons les témoins (cookies) de Google Analytics pour compter les visites et ceux de Google AdSense pour afficher des publicités, qui peuvent être personnalisées. Les deux restent désactivés tant que vous n’acceptez pas. Vous pouvez modifier votre choix en tout temps à partir du pied de page."
					: "With your permission, we use cookies from Google Analytics to count visits and from Google AdSense to show ads, which may be personalized. Both stay off unless you accept. You can change your choice at any time from the footer."}{" "}
				<a href={`./privacy.html?lang=${lang ? "fr" : "en"}`}>{lang ? "Politique de confidentialité" : "Privacy policy"}</a>
			</p>
			<div className="consent-actions">
				<button type="button" className="consent-button" onClick={() => choose("denied")}>{lang ? "Refuser" : "Decline"}</button>
				<button type="button" className="consent-button" onClick={() => choose("granted")}>{lang ? "Accepter" : "Accept"}</button>
			</div>
		</div>
	)
}

export default ConsentBanner
