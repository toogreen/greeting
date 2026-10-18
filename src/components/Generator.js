import React, {Component} from "react"
import domtoimage from "dom-to-image"
import Ad from "./Ad"

const designs = [
	{ id: "classic", name: "Classic", color: "#b94a42" },
	{ id: "evergreen", name: "Evergreen", color: "#28624c" },
	{ id: "midnight", name: "Midnight", color: "#555da1" },
]

class Generator extends Component {
	constructor() {
		super()
		this.state = {
			topText: "",
			bottomText: "",
			design: "classic",
			generationError: "",
			notice: "",
			activeAction: null,
			lang: false,
		}
		this.handleChange = this.handleChange.bind(this)
	}

	handleChange(event) {
		const {name, value} = event.target
		this.setState({[name]: value, notice: "", generationError: ""})
	}

	writeImageToClipboard(imageBlob) {
		if (!navigator.clipboard || !window.ClipboardItem) {
			return Promise.reject(new Error("Image clipboard is not supported by this browser"))
		}
		// Passing the pending blob keeps the write tied to the user's click while the card renders.
		return navigator.clipboard.write([new window.ClipboardItem({"image/png": imageBlob})])
	}

	openMailTab() {
		const {lang} = this.state
		const subject = lang ? "Une carte des Fêtes pour vous" : "A holiday card for you"
		const body = lang
			? "Bonjour,\n\nVoici ma carte des Fêtes pour vous !\n\nPour l’ajouter : cliquez ici dans le message, puis collez l’image (Ctrl+V ou Cmd+V).\n\n"
			: "Hi,\n\nHere's a holiday card just for you!\n\nTo add it: click here in the message, then paste the image (Ctrl+V or Cmd+V).\n\n"
		window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank")
	}

	saveImage(imageBlob) {
		const url = URL.createObjectURL(imageBlob)
		const link = document.createElement("a")
		link.href = url
		link.download = "holiday-card.png"
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		setTimeout(() => URL.revokeObjectURL(url), 1000)
	}

	async shareImage(imageBlob) {
		const {lang} = this.state
		const imageFile = new File([imageBlob], "holiday-card.png", {type: "image/png"})
		if (!navigator.share || (navigator.canShare && !navigator.canShare({files: [imageFile]}))) {
			throw new Error("Image sharing is not supported by this browser")
		}
		await navigator.share({
			title: lang ? "Ma carte des Fêtes" : "My holiday card",
			text: lang ? "Un petit mot des Fêtes pour vous !" : "A little holiday greeting for you!",
			files: [imageFile],
		})
	}

	async handleAction(action) {
		const card = document.getElementById("meme")
		if (!card || this.state.activeAction) {
			return
		}
		const {lang} = this.state
		this.setState({activeAction: action, generationError: "", notice: ""})

		// The clipboard write and the mail tab must start synchronously inside the click.
		const cardBlob = domtoimage.toBlob(card)
		cardBlob.catch(() => {})
		let clipboardWrite = null
		if (action === "copy" || action === "email") {
			clipboardWrite = this.writeImageToClipboard(cardBlob)
			clipboardWrite.catch(() => {})
		}
		if (action === "email") {
			this.openMailTab()
		}

		let stage = "generate"
		try {
			const imageBlob = await cardBlob
			stage = "deliver"
			if (action === "download") {
				this.saveImage(imageBlob)
				this.setState({notice: lang ? "Carte téléchargée !" : "Card downloaded!"})
			} else if (action === "share") {
				await this.shareImage(imageBlob)
			} else {
				await clipboardWrite
				const pasteHint = action === "email"
					? (lang ? "Collez-la (Ctrl+V ou Cmd+V) dans votre courriel." : "Paste it (Ctrl+V or Cmd+V) into your email.")
					: (lang ? "Collez-la où vous voulez." : "Paste it wherever you like.")
				this.setState({notice: `${lang ? "Carte copiée !" : "Card copied!"} ${pasteHint}`})
			}
		} catch (error) {
			if (error.name !== "AbortError") {
				console.error(`Unable to ${action} the card image.`, error)
				const downloadAdvice = action === "email"
					? (lang ? "Téléchargez la carte et joignez-la à votre courriel." : "Download your card and attach it to your email.")
					: (lang ? "Téléchargez plutôt votre carte." : "Download your card instead.")
				const messages = {
					generate: lang ? "Impossible de créer votre carte. Veuillez réessayer." : "We couldn't create your card. Please try again.",
					copy: lang ? `La copie d’image n’est pas disponible ici. ${downloadAdvice}` : `Image copying isn't available here. ${downloadAdvice}`,
					share: lang ? "Le partage d’image n’est pas disponible ici. Téléchargez la carte, puis partagez-la depuis votre appareil." : "Image sharing isn't available here. Download your card, then share it from your device.",
					download: lang ? "Impossible de télécharger la carte. Veuillez réessayer." : "We couldn't download your card. Please try again.",
				}
				const deliveryKey = action === "email" ? "copy" : action
				this.setState({generationError: messages[stage === "generate" ? "generate" : deliveryKey]})
			}
		} finally {
			this.setState({activeAction: null})
		}
	}

	toggleLang() {
		const lang = !this.state.lang
		this.setState({lang, notice: "", generationError: ""})
		if (this.props.onLangChange) this.props.onLangChange(lang)
	}

	render() {
		const {lang, design, activeAction} = this.state
		const isBusy = activeAction !== null
		const label = (action, text, busyText) => (activeAction === action ? busyText : text)

		return (
			<main className="studio">
				<section className="intro">
					<div className="intro-copy">
						<p className="eyebrow">{lang ? "UN PETIT MOT, BEAUCOUP DE JOIE" : "A LITTLE NOTE, A LOT OF JOY"}</p>
						<h1>{lang ? "Répandez la joie." : "Make it personal."}</h1>
						<p className="intro-description">
							{lang
								? "Créez une carte des Fêtes unique à partager avec ceux que vous aimez."
								: "Create a one-of-a-kind holiday card and share a little extra joy."}
						</p>
					</div>
					<button className="language-toggle" type="button" onClick={() => this.toggleLang()} aria-label={lang ? "Switch to English" : "Passer en français"}>
						{lang ? "EN" : "FR"}
					</button>
				</section>

				<div className="studio-layout">
					<section className="editor-panel" aria-labelledby="editor-title">
						<div className="section-heading">
							<span className="step-number">01</span>
							<div>
								<h2 id="editor-title">{lang ? "Personnalisez votre carte" : "Make it yours"}</h2>
								<p>{lang ? "Ajoutez votre message et choisissez un style." : "Add your message and choose a look."}</p>
							</div>
						</div>

						<label className="field-label" htmlFor="topText">{lang ? "Votre message" : "Your message"}</label>
						<textarea
							id="topText"
							className="message-field"
							name="topText"
							rows="3"
							maxLength="100"
							value={this.state.topText}
							placeholder={lang ? "Que la magie des Fêtes vous accompagne…" : "Wishing you a season full of magic…"}
							onChange={this.handleChange}
						/>
						<div className="field-meta">
							<span>{lang ? "Un message court ressort mieux." : "Short messages look best."}</span>
							<span>{this.state.topText.length}/100</span>
						</div>

						<label className="field-label signature-label" htmlFor="bottomText">{lang ? "Signature" : "Sign off"}</label>
						<input
							id="bottomText"
							className="signature-field"
							type="text"
							name="bottomText"
							maxLength="40"
							value={this.state.bottomText}
							placeholder={lang ? "Avec amour, Alex" : "With love, Alex"}
							onChange={this.handleChange}
						/>

						<div className="field-label design-label">{lang ? "Choisissez une ambiance" : "Choose a look"}</div>
						<div className="design-options" role="group" aria-label={lang ? "Styles de carte" : "Card styles"}>
							{designs.map(item => (
								<button
									className={`design-option${design === item.id ? " selected" : ""}`}
									type="button"
									key={item.id}
									onClick={() => this.setState({design: item.id})}
									aria-pressed={design === item.id}
								>
									<span className={`design-swatch swatch-${item.id}`} style={{backgroundColor: item.color}} />
									{lang && item.id === "classic" ? "Classique" : lang && item.id === "evergreen" ? "Sapin" : lang && item.id === "midnight" ? "Minuit" : item.name}
								</button>
							))}
						</div>

						<div className="field-label design-label">{lang ? "Prête ? Envoyez-la" : "All set? Send it off"}</div>
						<div className="action-grid">
							<button className="action-button primary-action" type="button" onClick={() => this.handleAction("copy")} disabled={isBusy}>
								<span aria-hidden="true">▣</span> {label("copy", lang ? "Copier l’image" : "Copy image", lang ? "Création…" : "Creating…")}
							</button>
							<button className="action-button" type="button" onClick={() => this.handleAction("download")} disabled={isBusy}>
								<span aria-hidden="true">↓</span> {label("download", lang ? "Télécharger" : "Download", lang ? "Création…" : "Creating…")}
							</button>
							<button className="action-button" type="button" onClick={() => this.handleAction("share")} disabled={isBusy}>
								<span aria-hidden="true">↗</span> {label("share", lang ? "Partager" : "Share", lang ? "Création…" : "Creating…")}
							</button>
							<button className="action-button email-action" type="button" onClick={() => this.handleAction("email")} disabled={isBusy}>
								<span aria-hidden="true">✉</span> {label("email", lang ? "Copier et écrire un courriel" : "Copy & email it", lang ? "Création…" : "Creating…")}
							</button>
						</div>
						{this.state.notice && <p className="feedback success" role="status">{this.state.notice}</p>}
						{this.state.generationError && <p className="feedback error" role="alert">{this.state.generationError}</p>}
						<p className="private-note"><span aria-hidden="true">↗</span> {lang ? "Votre carte est créée dans votre navigateur." : "Your card is made right here in your browser."}</p>
					</section>

					<section className="preview-panel" aria-labelledby="preview-title">
						<div className="preview-heading">
							<div>
								<p className="eyebrow">{lang ? "VOTRE APERÇU" : "LIVE PREVIEW"}</p>
								<h2 id="preview-title">{lang ? "Une carte à votre image" : "A card with feeling"}</h2>
							</div>
							<span className="live-indicator"><span /> {lang ? "EN DIRECT" : "LIVE"}</span>
						</div>
						<div className="card-stage">
							<div id="meme" className={`holiday-card theme-${design}`}>
								<svg className="card-art" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
									<defs>
										<linearGradient id="card-background" x1="0" y1="0" x2="1" y2="1">
											<stop offset="0%" className="art-background-start" />
											<stop offset="100%" className="art-background-end" />
										</linearGradient>
										<linearGradient id="card-sun" x1="0" y1="0" x2="1" y2="1">
											<stop offset="0%" className="art-sun-start" />
											<stop offset="100%" className="art-sun-end" />
										</linearGradient>
									</defs>
									<rect width="600" height="800" fill="url(#card-background)" />
									<circle className="art-glow" cx="450" cy="130" r="150" />
									<circle cx="450" cy="130" r="90" fill="url(#card-sun)" />
									<circle className="art-sun-ring" cx="450" cy="130" r="108" />
									<path className="art-hill-back" d="M0 600 Q150 540 300 600 T600 590 V800 H0Z" />
									<path className="art-hill-front" d="M0 680 Q150 620 300 675 T600 660 V800 H0Z" />
									<g transform="translate(30 265) scale(0.8)">
										<path className="art-tree-shadow" d="M130 470 L205 352 H167 L238 246 H200 L270 138 L340 246 H302 L373 352 H335 L412 470Z" />
										<path className="art-tree" d="M75 514 L148 397 H111 L181 294 H144 L213 186 L283 294 H246 L316 397 H279 L352 514Z" />
										<path className="art-tree-trunk" d="M201 470 H226 V535 H201Z" />
									</g>
									<path className="art-orbit" d="M300 790 C380 725 500 705 600 735" />
									<circle className="art-star" cx="90" cy="120" r="4" />
									<circle className="art-star" cx="545" cy="330" r="4" />
									<circle className="art-star" cx="70" cy="340" r="3" />
									<circle className="art-star" cx="500" cy="560" r="3" />
									<path className="art-snow" d="M480 400v24m-12-12h24m-20-8 16 16m0-16-16 16" />
									<path className="art-snow art-snow-small" d="M95 520v16m-8-8h16m-14-6 12 12m0-12-12 12" />
								</svg>
								<div className="card-content">
									<span className="card-kicker">{lang ? "AVEC MES VŒUX LES PLUS CHALEUREUX" : "WITH WARMEST WISHES"}</span>
									<span className="card-title">{lang ? "Joyeuses Fêtes" : "Happy Holidays"}</span>
									<span className="card-message">{this.state.topText || (lang ? "Que la joie soit au rendez-vous." : "May your days be merry & bright.")}</span>
									<span className="card-signature">{this.state.bottomText || (lang ? "Avec amour" : "With love")}</span>
								</div>
								<span className="card-sparkle sparkle-one" aria-hidden="true">✳</span>
								<span className="card-sparkle sparkle-two" aria-hidden="true">✦</span>
							</div>
						</div>
						<p className="preview-hint">{lang ? "Votre carte se met à jour au fur et à mesure." : "Your card updates as you make it yours."}</p>
					</section>
				</div>
				<div className="ad-slot"><Ad /></div>
			</main>
		)
	}
}

export default Generator
