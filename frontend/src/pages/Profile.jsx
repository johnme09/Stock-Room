import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileCard from './profileCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiClient } from '../lib/apiClient.js';

// ProfilePage displays user profile information and communities
export default function Profile() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuth();
	const [favoriteCommunities, setFavoriteCommunities] = useState([]);
	const [ownedCommunities, setOwnedCommunities] = useState([]);
	const [error, setError] = useState('');
	const [failedImages, setFailedImages] = useState(new Set());
	
	// If a User object is passed via navigation state, use that instead of default user
	const navUser = location.state?.User;
	const displayUser = navUser
		? typeof navUser === 'object' && navUser !== null
			? navUser
			: { id: navUser }
		: user;

	const handleImageError = (id) => {
		setFailedImages((prev) => {
			const newSet = new Set(prev);
			newSet.add(id);
			return newSet;
		});
	};

	useEffect(() => {
		if (!displayUser) return;

		const fetchData = async () => {
			try {
				if (displayUser.id === user?.id) {
					// If viewing own profile, use /users/me endpoint
					const [userData, communitiesData] = await Promise.all([
						apiClient.get('/users/me'),
						apiClient.get('/communities?owned=true')
					]);

					setFavoriteCommunities(userData.favoriteCommunities || []);
					setOwnedCommunities(communitiesData.communities || []);
				} else {
					// For other users, fetch their data using the new endpoints
					const [userData, communitiesData] = await Promise.all([
						apiClient.get(`/users/${displayUser.id}`),
						apiClient.get(`/communities?ownerId=${displayUser.id}`)
					]);

					setFavoriteCommunities(userData.favoriteCommunities || []);
					setOwnedCommunities(communitiesData.communities || []);
				}
			} catch (err) {
				setError(err.message);
			}
		};

		fetchData();
	}, [displayUser, user]);

	const handleViewCollection = useCallback(
		(communityId) => {
			// Navigate to personal collection view of the profile user
			navigate(`/collection/personal?communityId=${communityId}`, { 
				state: { User: displayUser } 
			});
		},
		[navigate, displayUser]
	);

	if (!displayUser) {
		return <p role="alert">Please log in to view profiles.</p>;
	}

	const isOwnProfile = displayUser.id === user?.id;

	return (
		<main role="main">
			<ProfileCard 
				username={displayUser.username || 'Unknown User'} 
				bio={displayUser.about || ''} 
				userProfilePic={displayUser.image} 
			/>

			<section id="owned-communities" aria-labelledby="owned-heading" style={{ marginBottom: '3rem' }}>
				<h2 id="owned-heading">{isOwnProfile ? 'Your Communities' : `${displayUser.username}'s Communities`}</h2>

				{ownedCommunities.length === 0 ? (
					<p>{isOwnProfile ? "You haven't created any communities yet." : `${displayUser.username} hasn't created any communities yet.`}</p>
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
				<h2 id="communities-heading">{isOwnProfile ? 'Your Favorite Communities' : `${displayUser.username}'s Favorite Communities`}</h2>

				{error && (
					<p role="alert" style={{ color: '#b91c1c' }}>
						{error}
					</p>
				)}

				{favoriteCommunities.length === 0 ? (
					<p>{isOwnProfile ? "You have not favorited any communities yet." : `${displayUser.username} has not favorited any communities yet.`}</p>
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
