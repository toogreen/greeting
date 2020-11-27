import React, {Component} from "react"
import Ad from "./Ad"
import $ from "jquery"
import domtoimage from "dom-to-image"
import MemeList from "./MemeList"
import {isSafari, isMobile, isIPad13, isIPhone13} from "react-device-detect"
import TextArea from "react-expanding-textarea"

class Generator extends Component {

	constructor() {
		super()
		this.state = {
			topText: "",
			bottomTet: "",
			//randomImg: "https://toogreen.ca/greeting/img/card1.jpg",
			//randomImg: "https://juju-d903432991d89cc85964a44935c6699d.s3.amazonaws.com/card1.jpg",
			randomImg: "https://p0.pxfuel.com/preview/443/99/669/christmas-snow-winter-christmas-time.jpg",
			allMemeImgs: [],
			count: 0,
			favImage: "",
			foo: "",
			lang: false
		}
		this.handleChange = this.handleChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleCopy = this.handleCopy.bind(this)
	}

	componentDidMount() {
		this.setState({loading: true})
		fetch("https://api.imgflip.com/get_memes")
			.then(response => response.json())
			.then(response => {
				const {memes} = response.data

				this.setState({ allMemeImgs: memes })
				console.log(memes[0])
			})
	}

	handleChange(event){
		const {name, value} = event.target
		name === "favImage" ? this.setState({ randomImg: event.target.value }) : this.setState({[name]: value})

	}

	handleSubmit(event){

		event.preventDefault()

		//get a a random number
		const randNum = Math.floor(Math.random() * this.state.allMemeImgs.length)

		// get the meme from that index
		const randMemeImg = this.state.allMemeImgs[randNum].url

		// set "randomImg" to the ".url"  of the random item I grabbed
		this.setState({ randomImg: randMemeImg})

	}

	handleCopy(event){

		event.preventDefault()

		// Copy the content of the "meme" DIV and make it an image
		const render = node =>
		  domtoimage.toPng(node)
		  .then(dataUrl => {
		    console.log(performance.now() - pf)
		    const img = new Image();
		    img.src = dataUrl;

		    $('.imgZone').append(this.state.count > 0 && "<hr />").append("<h2>Image # " + this.state.count+ "</h2>")
		    $('.imgZone').append(img)
		    $('.hidden').show();

		  })
		  .catch(error =>
		    console.error('oops, something went wrong!', error)
		  ),

		foo = document.getElementById('meme');

		var pf = performance.now();
		render(foo);

		// Increment the value of count
		this.setState(prevState => {
			return {
				count: prevState.count + 1
			}
		})

		// scroll down to new image
		window.scrollTo(0,document.body.scrollHeight);
 
	}

	closeModal() {
		$('.hidden').hide();
	}

	toggleLang() {
        this.setState(prevState => ({ lang: !prevState.lang }));
    }


	render() {

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
					<img src={this.state.randomImg} alt="" />
					<span className="title">{this.state.lang ? "Joyeuses Fêtes" : "Happy Holidays"}</span>
					<h2 className="top">{this.state.topText}</h2>
					<h2 className="bottom">{this.state.bottomText}</h2>
				</div>

				<button id="buttonCopy" onClick={this.handleCopy}>{this.state.lang ? "Generer une carte que vous pourrez copier-coller" : "Generate an Image to copy it elsewhere"}</button>


				<div className="hidden">
					
					{/* Added this for warning users on iPad or iPhone or Safari that the image may not copy on first try - this is a bug i'm trying to figure out. */}
					{this.state.lang ? (
							<p>{(this.state.count > 0 && (isSafari || isIPad13 || isIPhone13)) && "Erreur? Cliquez de nouveau sur le bouton (c'est un bogue d'Apple)"}</p>
						) : (
							<p>{(this.state.count > 0 && (isSafari || isIPad13 || isIPhone13)) && "If it didn't work on the last click, try clicking the above button one more time (Apple Bug)"}</p>
						)
					}

					<br />
					<div className="imgContainer">
						<div className="close" onClick={this.closeModal}>X</div>
						{this.state.lang ? (
								<h1>Copiez et collez {this.state.count > 1 ? "les " : "l'"}image{this.state.count > 1 && "s"} ci-bas</h1>
							) : (
								<h1>Copy and paste the image{this.state.count > 1 && "s"} from below</h1>
							)
						}
						<span className="imgZone"></span>
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