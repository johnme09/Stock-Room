import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.scss";
import { useAuth } from "../context/AuthContext.jsx";
import { apiClient } from "../lib/apiClient.js";

// HomePage displays favorited communities and community search functionality
export default function Home() {
	const [searchQuery, setSearchQuery] = useState("");
	const [hasSearched, setHasSearched] = useState(false);
	const [searchResults, setSearchResults] = useState([]);
	const [randomCommunities, setRandomCommunities] = useState([]);
	const [isLoadingRandom, setIsLoadingRandom] = useState(false);
	const [userSearchQuery, setUserSearchQuery] = useState("");
	const [hasSearchedUsers, setHasSearchedUsers] = useState(false);
	const [userSearchResults, setUserSearchResults] = useState([]);
	const [favoriteCommunities, setFavoriteCommunities] = useState([]);
	const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [isSearchingUsers, setIsSearchingUsers] = useState(false);
	const [error, setError] = useState("");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [newComm, setNewComm] = useState({ title: "", description: "", image: "" });

	const navigate = useNavigate();
	const { user } = useAuth();

	useEffect(() => {
		if (!user) {
			setFavoriteCommunities([]);
			return;
		}

		setIsLoadingFavorites(true);
		apiClient
			.get("/communities?favoriteOnly=true")
			.then((data) => setFavoriteCommunities(data.communities))
			.catch((err) => setError(err.message))
			.finally(() => setIsLoadingFavorites(false));
	}, [user]);

	// Fetch random communities on component mount
	useEffect(() => {
		const fetchRandomCommunities = async () => {
			setIsLoadingRandom(true);
			try {
				const data = await apiClient.get("/communities");
				const allCommunities = data.communities || [];
				// Randomly shuffle and take up to 4
				const shuffled = [...allCommunities].sort(() => Math.random() - 0.5);
				const random = shuffled.slice(0, 4);
				setRandomCommunities(random);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoadingRandom(false);
			}
		};

		fetchRandomCommunities();
	}, []);

	const fetchSearchResults = useCallback(async () => {
		const trimmedQuery = searchQuery.trim();
		if (!trimmedQuery) {
			setHasSearched(false);
			setSearchResults([]);
			return;
		}
		setHasSearched(true);
		setIsSearching(true);
		try {
			const data = await apiClient.get(`/communities?q=${encodeURIComponent(trimmedQuery)}`);
			setSearchResults(data.communities);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsSearching(false);
		}
	}, [searchQuery]);

	const handleSearch = useCallback(
		(e) => {
			e.preventDefault();
			fetchSearchResults();
		},
		[fetchSearchResults]
	);

	const handleSearchInputKeyDown = (e) => {
		if (e.key === "Enter") {
			handleSearch(e);
		}
	};

	const fetchUserSearchResults = useCallback(async () => {
		const trimmedQuery = userSearchQuery.trim();
		if (!trimmedQuery) {
			setHasSearchedUsers(false);
			setUserSearchResults([]);
			return;
		}
		setHasSearchedUsers(true);
		setIsSearchingUsers(true);
		try {
			const data = await apiClient.get(`/users?q=${encodeURIComponent(trimmedQuery)}`);
			setUserSearchResults(data.users);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsSearchingUsers(false);
		}
	}, [userSearchQuery]);

	const handleUserSearch = useCallback(
		(e) => {
			e.preventDefault();
			fetchUserSearchResults();
		},
		[fetchUserSearchResults]
	);

	const handleUserSearchInputKeyDown = (e) => {
		if (e.key === "Enter") {
			handleUserSearch(e);
		}
	};

	const handleViewCommunity = (community) => {
		navigate(`/collection/${community.id}`);
	};

	const handleViewUser = (user) => {
		navigate("/profile", { state: { User: user } });
	};

	const handleCreateCommunity = () => {
		if (!user) {
			navigate("/login");
			return;
		}
		setShowCreateModal(true);
	};

	const closeModal = () => {
		setShowCreateModal(false);
		setNewComm({ title: "", description: "", image: "" });
	};

	const handleCreateSubmit = async (e) => {
		e.preventDefault();
		try {
			const payload = {
				title: newComm.title.trim(),
				description: newComm.description.trim(),
				image: newComm.image.trim() || undefined,
			};
			const data = await apiClient.post("/communities", payload);
			setFavoriteCommunities((prev) => [data.community, ...prev]);
			closeModal();
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<main role="main">
			<section className="welcome-panel" aria-labelledby="welcome-heading">
				<h1 id="welcome-heading">Welcome to Stockroom!</h1>
				<div className="welcome-content">
					<p className="welcome-description">
						Stockroom is your centralized hub for tracking collectibles and connecting with fellow collectors. 
						Create or join communities for any type of collection—from Pokémon cards and vinyl records to 
						digital comics and plushies.
					</p>
					<div className="welcome-features">
						<div className="welcome-feature">
							<h3>📦 Track Your Collection</h3>
							<p>Mark items as "have", "want", or "don't have" to keep track of what's in your collection without manually checking.</p>
						</div>
						<div className="welcome-feature">
							<h3>👥 Join Communities</h3>
							<p>Discover communities created by other collectors, or create your own to share your passion with others.</p>
						</div>
						<div className="welcome-feature">
							<h3>💬 Connect & Discuss</h3>
							<p>Engage in forum-style discussions about finding collectibles, maintenance tips, and more with moderated communities.</p>
						</div>
					</div>
					<div className="welcome-cta">
						<p>Ready to start? Create your own community or search for existing ones below!</p>
						<button
							type="button"
							id="create-community-btn"
							onClick={handleCreateCommunity}
							aria-label="Create a new community"
							className="welcome-create-btn"
						>
							Create your own community
						</button>
					</div>
				</div>
			</section>

			<section id="FavoriteComms" aria-labelledby="fav-heading">
				<div className="section-header">
					<h2 id="fav-heading">Favorited Communities</h2>
				</div>

				{error && (
					<p className="error" role="alert">
						{error}
					</p>
				)}

				{!user ? (
					<p className="default-text">Log in to track your favorite communities.</p>
				) : isLoadingFavorites ? (
					<p className="default-text">Loading favorites...</p>
				) : favoriteCommunities.length === 0 ? (
					<p className="default-text" aria-live="polite">
						No favorite communities yet.
					</p>
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

				{showCreateModal && (
					<div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Create community form">
						<div className="modal">
							<h3>Create a Community</h3>
							<form onSubmit={handleCreateSubmit}>
								<label htmlFor="new-title">Title</label>
								<input
									id="new-title"
									value={newComm.title}
									onChange={(e) => setNewComm((prev) => ({ ...prev, title: e.target.value }))}
									required
								/>
								<label htmlFor="new-desc">Description</label>
								<textarea
									id="new-desc"
									value={newComm.description}
									onChange={(e) => setNewComm((prev) => ({ ...prev, description: e.target.value }))}
								/>
								<label htmlFor="new-image">Image URL (optional)</label>
								<input
									id="new-image"
									value={newComm.image}
									onChange={(e) => setNewComm((prev) => ({ ...prev, image: e.target.value }))}
								/>
								<div className="modal-actions">
									<button type="button" onClick={closeModal}>
										Cancel
									</button>
									<button type="submit" className="community-action">
										Create
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</section>

			<section id="searchComms" aria-labelledby="search-heading">
				<h2 id="search-heading">Find Communities:</h2>

				<form className="search-bar" onSubmit={handleSearch} role="search" aria-label="Search communities">
					<label htmlFor="community-search" className="visually-hidden">
						Search for communities
					</label>
					<input
						type="search"
						id="community-search"
						name="community-search"
						placeholder="Search communities..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={handleSearchInputKeyDown}
						aria-describedby="search-hint"
					/>
					<button type="submit" id="community-search-btn" aria-label="Submit search">
						{isSearching ? "Searching..." : "Search"}
					</button>
					<span id="search-hint" className="visually-hidden">
						Press Enter or click Search to find communities
					</span>
				</form>

				{!hasSearched ? (
					isLoadingRandom ? (
						<p className="search-default-text" aria-live="polite">
							Loading communities...
						</p>
					) : randomCommunities.length === 0 ? (
						<p className="search-default-text" aria-live="polite">
							No communities available.
						</p>
					) : (
						<div role="list" aria-label="Random communities">
							{randomCommunities.map((community) => (
								<article key={community.id} className="community" role="listitem">
									{community.image ? (
										<img src={community.image} alt={`${community.title} community image`} loading="lazy" />
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
										onClick={() => handleViewCommunity(community)}
										aria-label={`View ${community.title} community`}
									>
										View Community
									</button>
								</article>
							))}
						</div>
					)
				) : searchResults.length === 0 ? (
					<p className="search-default-text" aria-live="polite">
						No communities found for "{searchQuery}"
					</p>
				) : (
					<div role="list" aria-label="Search results">
						{searchResults.map((community) => (
							<article key={community.id} className="community" role="listitem">
								{community.image ? (
									<img src={community.image} alt={`${community.title} community image`} loading="lazy" />
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
									onClick={() => handleViewCommunity(community)}
									aria-label={`View ${community.title} community`}
								>
									View Community
								</button>
							</article>
						))}
					</div>
				)}
			</section>

			<section id="searchUsers" aria-labelledby="user-search-heading">
				<h2 id="user-search-heading">Search Users:</h2>

				<form className="search-bar" onSubmit={handleUserSearch} role="search" aria-label="Search users">
					<label htmlFor="user-search" className="visually-hidden">
						Search for users
					</label>
					<input
						type="search"
						id="user-search"
						name="user-search"
						placeholder="Search users..."
						value={userSearchQuery}
						onChange={(e) => setUserSearchQuery(e.target.value)}
						onKeyDown={handleUserSearchInputKeyDown}
						aria-describedby="user-search-hint"
					/>
					<button type="submit" id="user-search-btn" aria-label="Submit search">
						{isSearchingUsers ? "Searching..." : "Search"}
					</button>
					<span id="user-search-hint" className="visually-hidden">
						Press Enter or click Search to find users
					</span>
				</form>

				{!hasSearchedUsers ? (
					<p className="search-default-text" aria-live="polite">
						Start typing to find a user.
					</p>
				) : userSearchResults.length === 0 ? (
					<p className="search-default-text" aria-live="polite">
						No users found for "{userSearchQuery}"
					</p>
				) : (
					<div className="users-list" role="list" aria-label="User search results">
						{userSearchResults.map((user) => (
							<article key={user.id} className="user-card" role="listitem">
								<button
									type="button"
									className="user-card-button"
									onClick={() => handleViewUser(user)}
									aria-label={`View ${user.username}'s profile`}
								>
									{user.image ? (
										<img
											src={user.image}
											alt={`${user.username}'s profile picture`}
											className="user-avatar"
											loading="lazy"
											onError={(e) => {
												e.target.onerror = null;
												e.target.src = "/images/Profile-picture.png";
											}}
										/>
									) : (
										<div className="user-avatar-placeholder">
											<img
												src="/images/Profile-picture.png"
												alt={`${user.username}'s profile picture`}
												className="user-avatar"
												loading="lazy"
											/>
										</div>
									)}
									<span className="user-username">{user.username}</span>
								</button>
							</article>
						))}
					</div>
				)}
			</section>
		</main>
	);
}
