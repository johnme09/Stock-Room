import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Collection.scss';
import { apiClient } from '../lib/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import Forum from '../components/Forum.jsx';

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
	const [showAddItem, setShowAddItem] = useState(false);
	const [modUsername, setModUsername] = useState('');
	const { user, refreshProfile } = useAuth();
	const navigate = useNavigate();
	const [failedImages, setFailedImages] = useState(new Set());

	const handleImageError = (id) => {
		setFailedImages((prev) => {
			const newSet = new Set(prev);
			newSet.add(id);
			return newSet;
		});
	};

	const isOwner = user?.id === community?.ownerId;
	const isModerator = community?.moderators?.some((mod) => (mod._id || mod.id) === user?.id);
	const canManage = isOwner || isModerator;

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
			setShowAddItem(false);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsSavingItem(false);
		}
	};

	const handleAddModerator = async (e) => {
		e.preventDefault();
		if (!modUsername.trim()) return;
		try {
			const { community: updatedCommunity } = await apiClient.put(
				`/communities/${communityId}/moderators`,
				{ username: modUsername, action: 'add' }
			);
			setCommunity(updatedCommunity);
			setModUsername('');
		} catch (err) {
			alert(err.message);
		}
	};

	const handleRemoveModerator = async (userId) => {
		if (!window.confirm('Remove this moderator?')) return;
		try {
			const { community: updatedCommunity } = await apiClient.put(
				`/communities/${communityId}/moderators`,
				{ username: userId, action: 'remove' } // Note: Backend expects username for add, but let's check if it handles ID for remove or if we need username.
				// Wait, backend implementation:
				// const user = await User.findOne({ username: req.body.username });
				// So we MUST send username.
			);
			// Actually, for remove, the backend implementation I saw earlier uses `req.body.username` to find the user first.
			// So I need to pass the username of the moderator I want to remove.
			setCommunity(updatedCommunity);
		} catch (err) {
			alert(err.message);
		}
	};

	// Correction for handleRemoveModerator:
	// The backend expects `username` in the body.
	// So I should pass the username to this function.

	const handleDeleteCommunity = async () => {
		if (!window.confirm('Are you sure you want to delete this community? This cannot be undone.')) return;
		try {
			await apiClient.delete(`/communities/${communityId}`);
			navigate('/');
		} catch (err) {
			alert(err.message);
		}
	};

	const handleDeleteItem = async (itemId) => {
		if (!window.confirm('Delete this item?')) return;
		try {
			await apiClient.delete(`/items/${itemId}`);
			setItems((prev) => prev.filter((item) => item.id !== itemId));
		} catch (err) {
			alert(err.message);
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
							<select
								name="views"
								id="view-select"
								value={view}
								onChange={handleViewChange}
								aria-label="Switch between community and personal view"
								className="view-selector"
							>
								<option value="Community">Community View</option>
								<option value="Personal">Personal View</option>
							</select>

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


			</header>

			{isOwner && (
				<section className="moderator-section" style={{ maxWidth: '800px', margin: '0 auto 2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
					<h3>Manage Moderators</h3>
					<div className="moderator-list" style={{ marginBottom: '1rem' }}>
						{community?.moderators?.map((mod) => (
							<div key={mod._id || mod.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
								<span>@{mod.username}</span>
								<button
									onClick={() => handleRemoveModerator(mod.username)}
									style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
								>
									Remove
								</button>
							</div>
						))}
						{(!community?.moderators || community.moderators.length === 0) && <p>No moderators yet.</p>}
					</div>
					<form onSubmit={handleAddModerator} style={{ display: 'flex', gap: '0.5rem' }}>
						<input
							value={modUsername}
							onChange={(e) => setModUsername(e.target.value)}
							placeholder="Enter username to add"
							style={{ padding: '0.5rem', flex: 1 }}
						/>
						<button type="submit" style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
							Add Moderator
						</button>
					</form>
					<div style={{ marginTop: '2rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
						<button
							onClick={handleDeleteCommunity}
							className="danger-button"
							style={{ background: '#dc3545', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
						>
							Delete Community
						</button>
					</div>
				</section>
			)}

			{canManage && (
				<div style={{ textAlign: 'center', marginBottom: '2rem' }}>
					<button
						onClick={() => setShowAddItem(!showAddItem)}
						style={{ padding: '0.75rem 1.5rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
					>
						{showAddItem ? 'Cancel Adding Item' : 'Add New Item'}
					</button>
				</div>
			)}

			{canManage && showAddItem && (
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

			<section aria-label="Community items" className="items-section">
				{items.length === 0 ? (
					<div className="empty-state">
						<div className="empty-state-icon">📦</div>
						<h3>No items yet</h3>
						<p>This community doesn't have any items yet. Be the first to add one!</p>
					</div>
				) : (
					<div role="list" aria-label="Community items" className="items-grid">
						{items.map((item) => (
							<article key={item.id} className="itemCard" role="listitem">
								{item.image && !failedImages.has(item.id) ? (
									<img
										src={item.image}
										alt={`${item.title} image`}
										loading="lazy"
										onError={() => handleImageError(item.id)}
									/>
								) : (
									<div className="item-image placeholder">
										<div className="placeholder-text">{item.title?.[0] ?? '?'}</div>
									</div>
								)}
								<div className="VBox">
									<div className="card-header">
										<h3>{item.title}</h3>
										<div className="user-info">
											<span className="username">
												Added by {item.createdBy === community.ownerId ? `@${community.ownerId?.username || 'owner'}` : (item.createdBy?.username ? `@${item.createdBy.username}` : 'community')}
											</span>
										</div>
										{canManage && (
											<button
												onClick={() => handleDeleteItem(item.id)}
												className="delete-item-btn"
												style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.2rem' }}
												aria-label="Delete item"
											>
												🗑️
											</button>
										)}
									</div>
									<p>{item.description}</p>
									{user && (
										<fieldset className="radioSelect" aria-label={`Item status for ${item.title}`}>
											<legend className="visually-hidden">Select item status</legend>
											<div>
												<input
													type="radio"
													id={`want-${item.id}`}
													name={`status-${item.id}`}
													value="want"
													checked={statuses[item.id] === 'want'}
													onChange={() => handleStatusChange(item.id, 'want')}
													aria-label="Mark as want"
												/>
												<label htmlFor={`want-${item.id}`}>Want</label>
											</div>
											<div>
												<input
													type="radio"
													id={`have-${item.id}`}
													name={`status-${item.id}`}
													value="have"
													checked={statuses[item.id] === 'have'}
													onChange={() => handleStatusChange(item.id, 'have')}
													aria-label="Mark as have"
												/>
												<label htmlFor={`have-${item.id}`}>Have</label>
											</div>
											<div>
												<input
													type="radio"
													id={`dont-${item.id}`}
													name={`status-${item.id}`}
													value="dont_have"
													checked={!statuses[item.id] || statuses[item.id] === 'dont_have'}
													onChange={() => handleStatusChange(item.id, 'dont_have')}
													aria-label="Mark as don't have"
												/>
												<label htmlFor={`dont-${item.id}`}>Don't Have</label>
											</div>
										</fieldset>
									)}
								</div>
							</article>
						))}
					</div>
				)}
			</section>



			<Forum
				communityId={communityId}
				isOwner={isOwner}
				isModerator={isModerator}
				user={user}
			/>

		</main >
	);
}
