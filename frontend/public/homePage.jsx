import React from 'react';

// HomePage JSX mirrors public/landingPage.html
export default function HomePage() {
	return (
		<main>
			
			<section id="FavoriteComms">
				<h2 id="fav-heading">Favorited Communities</h2>
				<button type="button" id="create-community-btn">Create your own community</button>

				<p className="default-text">no favorite communities</p>
                {/*TODO Replace community article with community card. */}

				<article className="community">
					<img src="/images/default-community.png" alt="Default community image" />
					<h3 className="community-title">Community Title</h3>
					<p className="community-desc">This is a short description of the community.</p>
					<button type="button" className="community-action">View Community</button>
				</article>
			</section>

			<section id="searchComms">
				<h2 id="search-heading">Find Communities:</h2>

				<div className="search-bar">
					<input type="search" id="community-search" name="community-search" placeholder="Search communities..." />
					<button type="button" id="community-search-btn">Search</button>
				</div>

				<p className="search-default-text">no search results</p>

				<article className="community">
					<img src="/images/default-community.png" alt="Default community image" />
					<h3 className="community-title">Community Title</h3>
					<p className="community-desc">This is a short description of the community.</p>
					<button type="button" className="community-action">View Community</button>
				</article>
			</section>
		</main>
	);
}
