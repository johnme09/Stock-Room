import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProfileCard from './profileCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiClient } from '../lib/apiClient.js';

// ProfilePage displays user profile information and communities
export default function Profile() {
	const navigate = useNavigate();
	const { userId } = useParams();
	const { user: currentUser } = useAuth();
	const [profileUser, setProfileUser] = useState(null);
	const [favoriteCommunities, setFavoriteCommunities] = useState([]);
	const [ownedCommunities, setOwnedCommunities] = useState([]);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	const isViewingOwnProfile = !userId || (currentUser && userId === currentUser.id);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			setError('');
			try {
				if (isViewingOwnProfile) {
					// Viewing own profile
					if (!currentUser) {
						setIsLoading(false);
						return;
					}
					const [userData, communitiesData] = await Promise.all([
						apiClient.get('/users/me'),
						apiClient.get('/communities?owned=true')
					]);
					setProfileUser(userData.user);
					setFavoriteCommunities(userData.favoriteCommunities || []);
					setOwnedCommunities(communitiesData.communities || []);
				} else {
					// Viewing another user's profile
					const [userData, communitiesData] = await Promise.all([
						apiClient.get(`/users/${userId}`),
						apiClient.get(`/communities?ownerId=${userId}`)
					]);
					setProfileUser(userData.user);
					setOwnedCommunities(communitiesData.communities || []);
					setFavoriteCommunities([]); // Don't show favorites for other users
				}
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [userId, currentUser, isViewingOwnProfile]);

	const handleViewCollection = useCallback(
		(communityId) => {
			navigate(`/collection/${communityId}`);
		},
		[navigate]
	);

	if (isLoading) {
		return <p className="default-text">Loading profile...</p>;
	}

	if (isViewingOwnProfile && !currentUser) {
		return <p role="alert">Please log in to view your profile.</p>;
	}

	if (!profileUser) {
		return <p role="alert">User not found.</p>;
	}

	return (
		<main role="main">
			<ProfileCard username={profileUser.username} bio={profileUser.about} userProfilePic={profileUser.image} />

			<section id="owned-communities" aria-labelledby="owned-heading" style={{ marginBottom: '3rem' }}>
				<h2 id="owned-heading">{isViewingOwnProfile ? 'Your Communities' : `${profileUser.username}'s Communities`}</h2>

				{ownedCommunities.length === 0 ? (
					<p>{isViewingOwnProfile ? "You haven't created any communities yet." : `${profileUser.username} hasn't created any communities yet.`}</p>
				) : (
					<div role="list" aria-label="Owned communities">
						{ownedCommunities.map((community) => (
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

			{isViewingOwnProfile && (
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
			)}
		</main>
	);
}
