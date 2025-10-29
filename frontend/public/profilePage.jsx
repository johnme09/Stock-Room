import React from 'react';
import ProfileCard from './profileCard.jsx';

// ProfilePage based on profile.html prototype. Displays user profile information, and communities once data is added.
export default function ProfilePage() {
	return (
		<main>

			<ProfileCard username="Username" bio="This is a short bio about the user. Add your information here." />

			<section id="user-communities">
					<h2 id="communities-heading">Communities you are involved in</h2>
					{/*TODO Replace community article with community card. */}

					<article className="community">
						<img src="/images/default-community.png" alt="Community image" />
						<h3>community</h3>
						<p>This is a short description of the community or the user's role in it.</p>
						<button type="button">view collection</button>
					</article>
				</section>
		</main>
	);
}
