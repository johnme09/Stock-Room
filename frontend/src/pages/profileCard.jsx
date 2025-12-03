import React from 'react';
import './profileCard.scss';

// ProfileCard makes the profile header, image, and about me.
const DEFAULT_USERNAME = 'Username';
const DEFAULT_BIO = 'This is a short bio about the user. Add your information here.';
const DEFAULT_PROFILE_PIC = '/images/Profile-picture.png';

export default function ProfileCard({ 
	username = DEFAULT_USERNAME, 
	bio = DEFAULT_BIO,
	userProfilePic = DEFAULT_PROFILE_PIC,
}) {
	const handleImageError = (e) => {
		// Fallback to default image if provided image fails to load
		e.target.src = DEFAULT_PROFILE_PIC;
	};

	return (
		<section id="profile" aria-labelledby="username-heading">
			<h1 id="username-heading">{username}</h1>
			<img 
				src={(userProfilePic && userProfilePic.trim()) || DEFAULT_PROFILE_PIC} 
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
