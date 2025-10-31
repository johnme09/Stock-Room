import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './Collection.scss';

// Collection page displays community view of items with forum
export default function Collection() {
	const location = useLocation();
	const params = useParams();
	const passedCommunity = location.state?.community;
	const [communityName] = useState(passedCommunity?.title || 'Pokémon Card Collectors');
	const [view, setView] = useState('Community');
	const [isModerator] = useState(false); // TODO: Set from user role
	const [isFavorited, setIsFavorited] = useState(false);
	const [forumPost, setForumPost] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleViewChange = useCallback((e) => {
		const newView = e.target.value;
		setView(newView);
		if (newView === 'Personal') {
			navigate('/collection/personal');
		}
	}, [navigate]);

	const handleFavorite = useCallback(() => {
		setIsFavorited(prev => !prev);
		// TODO: Update favorite status in database
	}, []);

	const handleManageGroup = useCallback(() => {
		alert('Community management feature coming soon!');
	}, []);

	const handleForumSubmit = useCallback(async (e) => {
		e.preventDefault();
		const trimmedPost = forumPost.trim();
		
		if (trimmedPost.length < 3) {
			alert('Post must be at least 3 characters long');
			return;
		}

		setIsSubmitting(true);
		
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 500));
			
			// TODO: Submit post to backend
			alert('Post submitted: ' + trimmedPost);
			setForumPost('');
		} catch (error) {
			alert('Failed to submit post. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	}, [forumPost]);

	// Sample items data - in real app, this would come from props/context/API
	// Using existing JPEG images placed in public/images so they are served at /images/<n>
	const items = [
		{ 
			id: 1, 
			name: 'Pikachu', 
			description: 'The iconic Electric-type Pokémon known for its lightning-quick attacks and adorable appearance.', 
			image: '/images/Pikachu.jpeg',
			username: 'AshKetchum',
			addedDate: '2025-10-25'
		},
		{ 
			id: 2, 
			name: 'Charmander', 
			description: 'A Fire-type starter Pokémon whose tail flame burns brighter as it grows stronger.', 
			image: '/images/Charmander.jpeg',
			username: 'GaryOak',
			addedDate: '2025-10-28'
		},
		{ 
			id: 3, 
			name: 'Skitty', 
			description: 'A playful Normal-type Pokémon that loves to chase moving objects and its own tail.', 
			image: '/images/Skitty.jpeg',
			username: 'MayMaple',
			addedDate: '2025-10-30'
		},
	];

	return (
		<main role="main">
			<header className="community-header">
				<div className="header-content">
					{location.state?.community?.image ? (
						<div className="community-image">
							<img src={location.state.community.image} alt={`${communityName} banner`} />
						</div>
					) : (
						<div className="community-image placeholder">
							<div className="placeholder-text">{communityName[0]}</div>
						</div>
					)}
					
					<div className="community-info">
						<h1 className="community-title">{communityName}</h1>
						<p className="community-description">
							{location.state?.community?.description || 
							`Welcome to the ${communityName} community! This is a place for collectors and enthusiasts 
							to share their collections, discuss items, and connect with fellow community members.`}
						</p>
						
						<div className="community-stats">
							<div className="stat">
								<div className="number">{items.length}</div>
								<div className="label">Items</div>
							</div>
						</div>

						<div className="community-actions">
							<button className="join-button">
								Join Community
							</button>
							<button 
								className={`favorite-button ${isFavorited ? 'active' : ''}`}
								onClick={handleFavorite}
								aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
							>
								{isFavorited ? 'Favorited' : 'Favorite'}
							</button>
						</div>
					</div>
				</div>

				<div className="community-nav">
					<select 
						name="views" 
						id="view-select"
						value={view} 
						onChange={handleViewChange}
						aria-label="Switch between community and personal view"
					>
						<option value="Community">Community View</option>
						<option value="Personal">Personal View</option>
					</select>
					{isModerator && (
						<button 
							className="moderator" 
							onClick={handleManageGroup}
							type="button"
							aria-label="Manage community group"
						>
							Manage Group
						</button>
					)}
					<button 
						onClick={handleFavorite}
						type="button"
						aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
						aria-pressed={isFavorited}
						style={{ fontWeight: isFavorited ? 'bold' : 'normal' }}
					>
						{isFavorited ? '★ Favorite' : '☆ Favorite'}
					</button>
				</div>
			</header>

			<section aria-label="Community items">
				{items.length === 0 ? (
					<p>No items in this community yet.</p>
				) : (
					<div role="list" aria-label="Community items">
						{items.map((item) => (
							<article key={item.id} className="itemCard" role="listitem">
								<img
									src={item.image}
									alt={`${item.name} image`}
									loading="lazy"
									onError={(e) => {
										// fallback to Pikachu if an image fails to load
										e.target.onerror = null;
										e.target.src = '/images/Pikachu.jpeg';
									}}
								/>
								<div className="VBox">
									<div className="card-header">
										<h3>{item.name}</h3>
										<div className="user-info">
											<span className="username">Added by @{item.username}</span>
										</div>
									</div>
									<p>{item.description}</p>
								</div>
							</article>
						))}
					</div>
				)}
			</section>

			<section aria-label="Community forum">
				<h2>Community Forum</h2>
				<form onSubmit={handleForumSubmit} aria-label="Post to community forum">
					<label htmlFor="collectionForum">
						Want to share something?
					</label>
					<input 
						type="text" 
						id="collectionForum" 
						value={forumPost}
						onChange={(e) => setForumPost(e.target.value)}
						required 
						minLength={3}
						maxLength={500}
						placeholder="Share your thoughts..."
						disabled={isSubmitting}
						aria-describedby="forum-hint"
					/>
					<span id="forum-hint" className="visually-hidden">
						Enter at least 3 characters to post
					</span>
					<button 
						type="submit"
						disabled={isSubmitting || forumPost.trim().length < 3}
						aria-label="Submit forum post"
					>
						{isSubmitting ? 'Posting...' : 'Post'}
					</button>
				</form>
			</section>
		</main>
	);
}

