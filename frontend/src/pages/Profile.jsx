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
	const [ownedCommunities, setOwnedCommunities] = useState([]);
	const [error, setError] = useState('');
	const [failedImages, setFailedImages] = useState(new Set());

	const handleImageError = (id) => {
		setFailedImages((prev) => {
			const newSet = new Set(prev);
			newSet.add(id);
			return newSet;
		});
	};

	useEffect(() => {
		if (!user) return;

		const fetchData = async () => {
			try {
				const [userData, communitiesData] = await Promise.all([
					apiClient.get('/users/me'),
					apiClient.get('/communities?owned=true')
				]);

				setFavoriteCommunities(userData.favoriteCommunities || []);
				setOwnedCommunities(communitiesData.communities || []);
			} catch (err) {
				setError(err.message);
			}
		};

		fetchData();
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
			<ProfileCard username={user.username} bio={user.about} userProfilePic={user.image} />

			<section id="owned-communities" aria-labelledby="owned-heading" style={{ marginBottom: '3rem' }}>
				<h2 id="owned-heading">Your Communities</h2>

				{ownedCommunities.length === 0 ? (
					<p>You haven't created any communities yet.</p>
				) : (
					<div role="list" aria-label="Owned communities">
						{ownedCommunities.map((community) => (
							<article key={community.id} className="community" role="listitem">
								{community.image && !failedImages.has(community.id) ? (
									<img
										src={community.image}
										alt={`${community.title} community image`}
										loading="lazy"
										onError={() => handleImageError(community.id)}
									/>
								) : (
									<div className="community-image placeholder">
										<div className="placeholder-text">{community.title?.[0] ?? '?'}</div>
									</div>
								)}
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
								{community.image && !failedImages.has(community.id) ? (
									<img
										src={community.image}
										alt={`${community.title} community image`}
										loading="lazy"
										onError={() => handleImageError(community.id)}
									/>
								) : (
									<div className="community-image placeholder">
										<div className="placeholder-text">{community.title?.[0] ?? '?'}</div>
									</div>
								)}
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
