import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from './profileCard.jsx';

// ProfilePage displays user profile information and communities
export default function Profile() {
	const navigate = useNavigate();

	const handleViewCollection = useCallback(() => {
		navigate('/collection');
	}, [navigate]);

	// Sample communities data - in real app, this would come from props/context/API
	const communities = [
		{
			id: 1,
			name: 'Trading Center',
			description: 'Trade your Pokémon cards with collectors from around the world. Find rare cards and complete your collection!',
			image: '/images/Pokemon.jpeg'
		},
		{
			id: 2,
			name: 'Rare Hunters',
			description: 'A special community dedicated to finding and collecting rare and legendary Pokémon cards.',
			image: '/images/Despotar V.jpeg'
		},
		{
			id: 3,
			name: 'Fire Types',
			description: 'For collectors focused on Fire-type Pokémon cards. Share your flames!',
			image: '/images/Charmander.jpeg'
		}
	];

	return (
		<main role="main">
			<ProfileCard username="Username" bio="This is a short bio about the user. Add your information here." />

			<section id="user-communities" aria-labelledby="communities-heading">
				<h2 id="communities-heading">Communities you are involved in</h2>

				{communities.length === 0 ? (
					<p>You are not involved in any communities yet.</p>
				) : (
					<div role="list" aria-label="User communities">
						{communities.map((community) => (
							<article key={community.id} className="community" role="listitem">
								<img 
									src={community.image} 
									alt={`${community.name} community image`}
									loading="lazy"
									onError={(e) => {
										e.target.onerror = null;
										e.target.src = '/images/Pokemon.jpeg';
									}}
								/>
								<h3>{community.name}</h3>
								<p>{community.description}</p>
								<button 
									type="button"
									onClick={handleViewCollection}
									aria-label={`View ${community.name} collection`}
								>
									view collection
								</button>
							</article>
						))}
					</div>
				)}
			</section>
		</main>
	);
}
