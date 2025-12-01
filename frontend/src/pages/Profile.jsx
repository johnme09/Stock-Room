import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from './profileCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiClient } from '../lib/apiClient.js';

// ProfilePage displays user profile information and communities
export default function Profile() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [favoriteCommunities, setFavoriteCommunities] = useState([]);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!user) return;
		apiClient
			.get('/users/me')
			.then((data) => setFavoriteCommunities(data.favoriteCommunities || []))
			.catch((err) => setError(err.message));
	}, [user]);

	const handleViewCollection = useCallback(
		(communityId) => {
			navigate(`/collection/${communityId}`);
		},
		[navigate]
	);

	if (!user) {
		return <p role="alert">Please log in to view your profile.</p>;
	}

	return (
		<main role="main">
			<ProfileCard username={user.username} bio={user.about} />

			<section id="user-communities" aria-labelledby="communities-heading">
				<h2 id="communities-heading">Your Favorite Communities</h2>

				{error && (
					<p role="alert" style={{ color: '#b91c1c' }}>
						{error}
					</p>
				)}

				{favoriteCommunities.length === 0 ? (
					<p>You have not favorited any communities yet.</p>
				) : (
				 <div role="list" aria-label="User communities">
					{favoriteCommunities.map((community) => (
						<article key={community.id} className="community" role="listitem">
							<img
								src={community.image || '/images/Pokemon.jpeg'}
								alt={`${community.title} community image`}
								loading="lazy"
								onError={(e) => {
									e.target.onerror = null;
									e.target.src = '/images/Pokemon.jpeg';
								}}
							/>
							<h3>{community.title}</h3>
							<p>{community.description}</p>
							<button
								type="button"
								onClick={() => handleViewCollection(community.id)}
								aria-label={`View ${community.title} collection`}
							>
								View collection
							</button>
						</article>
					))}
				  </div>
				)}
			</section>
		</main>
	);
}
