import React, {Component} from "react"
import Ad from "./Ad"
import domtoimage from "dom-to-image"
import {isSafari, isIPad13, isIPhone13} from "react-device-detect"
import TextArea from "react-expanding-textarea"

class Generator extends Component {

	constructor() {
		super()
		this.state = {
			topText: "",
			bottomText: "",
			randomImg: `${process.env.PUBLIC_URL}/img/card1.jpg`,
			allMemeImgs: [],
			generatedImages: [],
			generationError: "",
			isGenerating: false,
			showGeneratedImages: false,
			lang: false,
		}
		this.handleChange = this.handleChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleGenerate = this.handleGenerate.bind(this)
	}

	componentDidMount() {
		fetch("https://api.imgflip.com/get_memes")
			.then(response => {
				if (!response.ok) {
					throw new Error(`Meme API responded with ${response.status}`)
				}
				return response.json()
			})
			.then(response => {
				const memes = response.data && response.data.memes
				if (!Array.isArray(memes)) {
					throw new Error("Meme API response did not contain a meme list")
				}
				this.setState({ allMemeImgs: memes })
			})
			.catch(error => {
				console.error("Unable to load meme images.", error)
			})
	}

	handleChange(event){
		const {name, value} = event.target
		this.setState({[name]: value})
	}

	handleSubmit(event){
		event.preventDefault()

		if (this.state.allMemeImgs.length === 0) {
			return
		}
		const randNum = Math.floor(Math.random() * this.state.allMemeImgs.length)
		this.setState({
			randomImg: this.state.allMemeImgs[randNum].url,
			generationError: "",
		})
	}

	async handleGenerate(event){
		event.preventDefault()
		const meme = document.getElementById("meme")

		if (!meme || this.state.isGenerating) {
			return
		}
		this.setState({isGenerating: true, generationError: ""})
		try {
			const image = await domtoimage.toPng(meme)
			this.setState(prevState => ({
				generatedImages: [...prevState.generatedImages, image],
				isGenerating: false,
				showGeneratedImages: true,
			}), () => window.scrollTo(0, document.body.scrollHeight))
		} catch (error) {
			console.error("Unable to generate the card image.", error)
			this.setState({
				isGenerating: false,
				generationError: this.state.lang
					? "Impossible de générer l’image. Essayez de nouveau."
					: "The image could not be generated. Please try again.",
			})
		}
	}

	closeModal() {
		this.setState({showGeneratedImages: false})
	}

	toggleLang() {
        this.setState(prevState => ({ lang: !prevState.lang }));
    }


	render() {
		const count = this.state.generatedImages.length

		return(
			<main>

<button className="langButton" onClick={() => {this.toggleLang(); }} >{this.state.lang ? "EN" : "FR"}</button>

				<form className="meme-form" onSubmit={this.handleSubmit}>

				{/* <button>Random image</button> */}

				<TextArea 
					className="maintextarea"
					rows="5"
					type="textarea"
					name="topText"
					value={this.state.topText}
					placeholder={this.state.lang ? "Texte principal" : "Main Text"} 
					onChange={this.handleChange} 
				/>

				<br />
				
				<input 
					type="text"
					name="bottomText"
					value={this.state.bottomText}
					placeholder={this.state.lang ? "Signature (De:)" : "Signature (From:)"} 
					onChange={this.handleChange} 
				/>

				<br />
					
				</form>

				{/* <select 
					name="favImage"
					onChange={this.handleChange} 
				>
					<option value="">-- SELECT A MEME --</option>
					<MemeList 
						data={this.state}
					/>
				</select> */}

				<div id="meme" className="meme"> 
					<img src={this.state.randomImg} alt="Holiday card background" />
					<span className="title">{this.state.lang ? "Joyeuses Fêtes" : "Happy Holidays"}</span>
					<h2 className="top">{this.state.topText}</h2>
					<h2 className="bottom">{this.state.bottomText}</h2>
				</div>

				{this.state.generationError && <p role="alert">{this.state.generationError}</p>}
				<button
					id="buttonCopy"
					type="button"
					onClick={this.handleGenerate}
					disabled={this.state.isGenerating}
				>
					{this.state.isGenerating
						? (this.state.lang ? "Génération..." : "Generating...")
						: (this.state.lang ? "Generer une carte que vous pourrez copier-coller" : "Generate an Image to copy it elsewhere")}
				</button>


				<div className={this.state.showGeneratedImages ? "hidden visible" : "hidden"}>
					
					{/* Added this for warning users on iPad or iPhone or Safari that the image may not copy on first try - this is a bug i'm trying to figure out. */}
					{this.state.lang ? (
							<p>{(count > 0 && (isSafari || isIPad13 || isIPhone13)) && "Erreur? Cliquez de nouveau sur le bouton (c'est un bogue d'Apple)"}</p>
						) : (
							<p>{(count > 0 && (isSafari || isIPad13 || isIPhone13)) && "If it didn't work on the last click, try clicking the above button one more time (Apple Bug)"}</p>
						)
					}

					<br />
					<div className="imgContainer">
						<button className="close" type="button" onClick={() => this.closeModal()}>X</button>
						{this.state.lang ? (
								<h1>Copiez et collez {count > 1 ? "les " : "l'"}image{count > 1 && "s"} ci-bas</h1>
							) : (
								<h1>Copy and paste the image{count > 1 && "s"} from below</h1>
							)
						}
						<div className="imgZone">
							{this.state.generatedImages.map((image, index) => (
								<React.Fragment key={index}>
									{index > 0 && <hr />}
									<h2>Image # {index + 1}</h2>
									<img src={image} alt={`Generated holiday card ${index + 1}`} />
								</React.Fragment>
							))}
						</div>
					</div>
				</div>

				

				<br />
				<br />

				<Ad />

			</main>
		)
	}

}

export default Generator