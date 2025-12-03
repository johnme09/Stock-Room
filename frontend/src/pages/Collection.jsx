import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Collection.scss';
import { apiClient } from '../lib/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';

// Collection page displays community view of items with forum
export default function Collection() {
	const { id: communityId } = useParams();
	const [community, setCommunity] = useState(null);
	const [items, setItems] = useState([]);
	const [view, setView] = useState('Community');
	const [isFavorited, setIsFavorited] = useState(false);
	const [forumPost, setForumPost] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [statuses, setStatuses] = useState({});
	const [newItem, setNewItem] = useState({ title: '', description: '', image: '' });
	const [isSavingItem, setIsSavingItem] = useState(false);
	const { user, refreshProfile } = useAuth();
	const navigate = useNavigate();

	const loadCommunity = useCallback(async () => {
		if (!communityId) return;
		setIsLoading(true);
		try {
			const [{ community: communityData }, { items: communityItems }] = await Promise.all([
				apiClient.get(`/communities/${communityId}`),
				apiClient.get(`/communities/${communityId}/items`),
			]);
			setCommunity(communityData);
			setItems(communityItems);
			setIsFavorited(user?.favorites?.includes(communityData.id) ?? false);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, [communityId, user]);

	const loadStatuses = useCallback(async () => {
		if (!user || !communityId) {
			setStatuses({});
			return;
		}
		try {
			const data = await apiClient.get(`/user-items?communityId=${communityId}`);
			const map = {};
			data.userItems.forEach(({ item, status }) => {
				if (item) {
					map[item.id] = status;
				}
			});
			setStatuses(map);
		} catch (err) {
			console.error(err);
		}
	}, [communityId, user]);

	useEffect(() => {
		loadCommunity();
	}, [loadCommunity]);

	useEffect(() => {
		loadStatuses();
	}, [loadStatuses]);

	const handleViewChange = useCallback(
		(e) => {
			const newView = e.target.value;
			setView(newView);
			if (newView === 'Personal' && communityId) {
				navigate(`/collection/personal?communityId=${communityId}`);
			}
		},
		[navigate, communityId]
	);

	const handleFavorite = useCallback(async () => {
		if (!user || !communityId) {
			navigate('/login');
			return;
		}

		try {
			if (isFavorited) {
				await apiClient.delete(`/users/me/favorites/${communityId}`);
			} else {
				await apiClient.post(`/users/me/favorites/${communityId}`);
			}
			setIsFavorited(!isFavorited);
			await refreshProfile();
		} catch (err) {
			setError(err.message);
		}
	}, [communityId, isFavorited, user, navigate, refreshProfile]);

	const handleStatusChange = async (itemId, status) => {
		if (!user) {
			navigate('/login');
			return;
		}
		try {
			await apiClient.put('/user-items', { itemId, status });
			setStatuses((prev) => ({ ...prev, [itemId]: status }));
		} catch (err) {
			setError(err.message);
		}
	};

	const handleAddItem = async (e) => {
		e.preventDefault();
		if (!communityId) return;
		setIsSavingItem(true);
		try {
			const payload = {
				title: newItem.title.trim(),
				description: newItem.description.trim(),
				image: newItem.image.trim() || undefined,
			};
			const data = await apiClient.post(`/communities/${communityId}/items`, payload);
			setItems((prev) => [data.item, ...prev]);
			setNewItem({ title: '', description: '', image: '' });
		} catch (err) {
			setError(err.message);
		} finally {
			setIsSavingItem(false);
		}
	};

	if (!communityId) {
		return <p role="alert">No community selected.</p>;
	}

	if (isLoading) {
		return <p role="status">Loading community...</p>;
	}

	if (error) {
		return (
			<main role="main">
				<p role="alert">{error}</p>
			</main>
		);
	}

	return (
		<main role="main">
			<header className="community-header">
				<div className="header-content">
					{community?.image ? (
						<div className="community-image">
							<img src={community.image} alt={`${community.title} banner`} />
						</div>
					) : (
						<div className="community-image placeholder">
							<div className="placeholder-text">{community?.title?.[0] ?? '?'}</div>
						</div>
					)}

					<div className="community-info">
						<h1 className="community-title">{community?.title}</h1>
						<p className="community-description">
							{community?.description ||
								`Welcome to the ${community?.title} community! Connect with other collectors and track your progress.`}
						</p>

						<div className="community-stats">
							<div className="stat">
								<div className="number">{items.length}</div>
								<div className="label">Items</div>
							</div>
						</div>

						<div className="community-actions">
							<button className="join-button" disabled>
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

			{user?.id === community?.ownerId && (
				<section aria-label="Add new item" className="add-item-section">
					<h2>Add New Item</h2>
					<form onSubmit={handleAddItem} className="add-item-form">
						<label htmlFor="item-title">Title</label>
						<input
							id="item-title"
							value={newItem.title}
							onChange={(e) => setNewItem((prev) => ({ ...prev, title: e.target.value }))}
							required
						/>
						<label htmlFor="item-desc">Description</label>
						<textarea
							id="item-desc"
							value={newItem.description}
						onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
					/>
					{/* also here */}
					<label htmlFor="item-image">Image URL</label>
					<input
						id="item-image"
						value={newItem.image}
						onChange={(e) => setNewItem((prev) => ({ ...prev, image: e.target.value }))}
					/>
					<button type="submit" disabled={isSavingItem}>
						{isSavingItem ? 'Saving...' : 'Add Item'}
						</button>
					</form>
				</section>
			)}

			<section aria-label="Community items">
				{items.length === 0 ? (
					<p>No items in this community yet.</p>
				) : (
					<div role="list" aria-label="Community items">
						{items.map((item) => (
							<article key={item.id} className="itemCard" role="listitem">
								<img
									src={item.image || '/images/Pokemon.jpeg'}
									alt={`${item.title} image`}
									loading="lazy"
									onError={(e) => {
										e.target.onerror = null;
										e.target.src = '/images/Pikachu.jpeg';
									}}
								/>
								<div className="VBox">
									<div className="card-header">
										<h3>{item.title}</h3>
										<div className="user-info">
											<span className="username">Added by {item.createdBy ? '@owner' : 'community'}</span>
										</div>
									</div>
									<p>{item.description}</p>
									{user && (
										<div className="status-controls">
											<label htmlFor={`status-${item.id}`}>Status</label>
											<select
												id={`status-${item.id}`}
												value={statuses[item.id] || 'dont_have'}
												onChange={(e) => handleStatusChange(item.id, e.target.value)}
											>
												<option value="have">Have</option>
												<option value="want">Want</option>
												<option value="dont_have">Don't have</option>
											</select>
										</div>
									)}
								</div>
							</article>
						))}
					</div>
				)}
			</section>

			<section aria-label="Community forum">
				<h2>Community Forum</h2>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						alert('Forum posting is coming soon!');
						setForumPost('');
					}}
					aria-label="Post to community forum"
				>
					<label htmlFor="collectionForum">Want to share something?</label>
					<input
						type="text"
						id="collectionForum"
						value={forumPost}
						onChange={(e) => setForumPost(e.target.value)}
						required
						minLength={3}
						maxLength={500}
						placeholder="Share your thoughts..."
						aria-describedby="forum-hint"
					/>
					<span id="forum-hint" className="visually-hidden">
						Enter at least 3 characters to post
					</span>
					<button type="submit" aria-label="Submit forum post">
						Post
					</button>
				</form>
			</section>
		</main>
	);
}
