import React from 'react';
import './profileCard.scss';

// ProfileCard makes the profile header, image, and about me.
const DEFAULT_USERNAME = 'Username';
const DEFAULT_BIO = 'This is a short bio about the user. Add your information here.';
const DEFAULT_PROFILE_PIC = '/images/Profile-picture.jpg';

export default function ProfileCard({ 
	username = DEFAULT_USERNAME, 
	bio = DEFAULT_BIO,
	profilePic = DEFAULT_PROFILE_PIC,
}) {
    // TODO: Once database is set, set to use database values with props as fallback.
	const handleImageError = (e) => {
		// Fallback to default image if provided image fails to load
		if (e.target.src !== DEFAULT_PROFILE_PIC) {
			e.target.src = DEFAULT_PROFILE_PIC;
		}
	};

	return (
		<section id="profile" aria-labelledby="username-heading">
			<h1 id="username-heading">{username}</h1>
			<img 
				src={profilePic} 
				alt={`${username}'s profile picture`} 
				id="profile-pic"
				onError={handleImageError}
				loading="lazy"
			/>

			<div id="about-me">
				<h2>About me</h2>
				<p>{bio || 'No bio available.'}</p>
			</div>
		</section>
	);
}
