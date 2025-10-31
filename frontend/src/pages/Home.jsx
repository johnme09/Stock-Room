import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import './Home.scss';

// HomePage displays favorited communities and community search functionality
export default function Home() {
	const [searchQuery, setSearchQuery] = useState('');
	const [hasSearched, setHasSearched] = useState(false);
	const navigate = useNavigate();

	const handleSearch = useCallback((e) => {
		e.preventDefault();
		const trimmedQuery = searchQuery.trim();
		if (trimmedQuery) {
			setHasSearched(true);
		}
	}, [searchQuery]);

	const handleSearchInputKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleSearch(e);
		}
	};

	const handleViewCommunity = (community) => {
		navigate(`/collection/${community.id}`, { state: { community } });
	};

	const handleCreateCommunity = () => {
		setShowCreateModal(true);
	};

	// Modal form state and handlers
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [newComm, setNewComm] = useState({ title: '', description: '', image: '' });

	const closeModal = () => {
		setShowCreateModal(false);
		setNewComm({ title: '', description: '', image: '' });
	};

	const handleCreateSubmit = (e) => {
		e.preventDefault();
		const title = newComm.title.trim();
		if (!title) {
			alert('Community title is required');
			return;
		}

		// create a new community object
		const nextId = favoriteCommunities && favoriteCommunities.length > 0
			? Math.max(...favoriteCommunities.map(c => c.id)) + 1
			: 1;
			const created = {
				id: nextId,
				title,
				description: newComm.description.trim() || 'No description provided.',
				// Do not default to the Pokemon logo; keep empty if user didn't provide one
				image: newComm.image.trim() || ''
			};

		// Add to favorites list (optimistic update)
		setFavoriteCommunities(prev => [created, ...prev]);

			// close modal and show success message
			closeModal();
			alert(`Community "${created.title}" has been created successfully!`);
	};

	// Sample communities data - in real app, this would come from props/context/API
	const [favoriteCommunities, setFavoriteCommunities] = useState([
		{
			id: 1,
			title: 'Pokemon Cards',
			description: 'A community for Pokémon card collectors and traders.',
			image: '/images/Pokemon.jpeg'
		}
	]);

	const searchResults = hasSearched && searchQuery.trim() ? favoriteCommunities : [];

	return (
		<main role="main">
			<section id="FavoriteComms" aria-labelledby="fav-heading">
				<h2 id="fav-heading">Favorited Communities</h2>
				<button 
					type="button" 
					id="create-community-btn"
					onClick={handleCreateCommunity}
					aria-label="Create a new community"
				>
					Create your own community
				</button>

				{favoriteCommunities.length === 0 ? (
					<p className="default-text" aria-live="polite">no favorite communities</p>
				) : (
					<div className="communities-grid" role="list" aria-label="Favorited communities">
						{favoriteCommunities.map((community) => (
							<article key={community.id} className="community-card" role="listitem">
								{community.image ? (
									<img
										className="card-image"
										src={community.image}
										alt={`${community.title} community image`}
										loading="lazy"
									/>
								) : (
									<div className="card-image community-placeholder" aria-hidden>
										No image
									</div>
								)}
								<div className="card-content">
									<h3>{community.title}</h3>
									<p>{community.description}</p>
								</div>
								<div className="card-actions">
									<button
										type="button"
										onClick={() => handleViewCommunity(community)}
										aria-label={`View ${community.title} community`}
									>
										View Community
									</button>
								</div>
							</article>
						))}
					</div>
				)}

				{/* Create Community Modal */}
				{showCreateModal && (
					<div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Create community form">
						<div className="modal">
							<h3>Create a Community</h3>
							<form onSubmit={handleCreateSubmit}>
								<label htmlFor="new-title">Title</label>
								<input id="new-title" value={newComm.title} onChange={e => setNewComm(prev => ({ ...prev, title: e.target.value }))} required />
								<label htmlFor="new-desc">Description</label>
								<textarea id="new-desc" value={newComm.description} onChange={e => setNewComm(prev => ({ ...prev, description: e.target.value }))} />
								<label htmlFor="new-image">Image URL (optional)</label>
								<input id="new-image" value={newComm.image} onChange={e => setNewComm(prev => ({ ...prev, image: e.target.value }))} />
								<div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
									<button type="button" onClick={closeModal}>Cancel</button>
									<button type="submit" className="community-action">Create</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</section>

			<section id="searchComms" aria-labelledby="search-heading">
				<h2 id="search-heading">Find Communities:</h2>

				<form 
					className="search-bar" 
					onSubmit={handleSearch}
					role="search"
					aria-label="Search communities"
				>
					<label htmlFor="community-search" className="visually-hidden">
						Search for communities
					</label>
					<input 
						type="search" 
						id="community-search" 
						name="community-search" 
						placeholder="Search communities..." 
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							if (!e.target.value.trim()) {
								setHasSearched(false);
							}
						}}
						onKeyDown={handleSearchInputKeyDown}
						aria-describedby="search-hint"
					/>
					<button 
						type="submit" 
						id="community-search-btn"
						aria-label="Submit search"
					>
						Search
					</button>
					<span id="search-hint" className="visually-hidden">
						Press Enter or click Search to find communities
					</span>
				</form>

				{!hasSearched ? (
					<p className="search-default-text" aria-live="polite">no search results</p>
				) : searchResults.length === 0 ? (
					<p className="search-default-text" aria-live="polite">
						No communities found for "{searchQuery}"
					</p>
				) : (
					<div role="list" aria-label="Search results">
						{searchResults.map((community) => (
							<article key={community.id} className="community" role="listitem">
								{community.image ? (
									<img
										src={community.image}
										alt={`${community.title} community image`}
										loading="lazy"
									/>
								) : (
									<div className="community-placeholder" aria-hidden>
										No image
									</div>
								)}
								<h3 className="community-title">{community.title}</h3>
								<p className="community-desc">{community.description}</p>
								<button
									type="button"
									className="community-action"
									onClick={handleViewCommunity}
									aria-label={`View ${community.title} community`}
								>
									View Community
								</button>
							</article>
						))}
					</div>
				)}
			</section>
		</main>
	);
}
