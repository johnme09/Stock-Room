import React from 'react';

// ProfileCard makes the profile header, image, and about me.
const defaultProps = {
	username: 'Username',
	bio: 'This is a short bio about the user. Add your information here.',
	profilePic: '/images/profile-pic.png',
};

export default function ProfileCard({ 
	username: propUsername, 
	bio: propBio,
	profilePic: propProfilePic,
}) {
    // TODO: Once database is set, set to use database values with props as fallback.
	const username = propUsername ?? defaultProps.username;
	const bio = propBio ?? defaultProps.bio;
	const profilePic = propProfilePic ?? defaultProps.profilePic;

	return (
		<section id="profile">
			<h1 id="username-heading">{username}</h1>
			<img src={profilePic} alt="Profile picture" id="profile-pic" />

			<div id="about-me">
				<h2>About me</h2>
				<p>{bio}</p>
			</div>
		</section>
	);
}
