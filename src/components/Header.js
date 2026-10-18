import React from "react"

function Header() {
	return (
		<header className="site-header">
			<a className="brand" href="/" aria-label="Cardly home">
				<span className="brand-mark" aria-hidden="true">✳</span>
				<span className="brand-name">Cardly</span>
			</a>
			<span className="header-note">Made for the moments that matter</span>
		</header>
	)
}

export default Header