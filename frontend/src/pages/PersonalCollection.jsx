import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Collection.scss';

// PersonalCollection page displays personal view with item status (want/have/don't want)
export default function PersonalCollection() {
	const [communityName] = useState('Pokémon Card Collectors');
	const [view, setView] = useState('Personal');
	const [isModerator] = useState(false); // TODO: Set from user role
	const [isFavorited, setIsFavorited] = useState(false);
	const navigate = useNavigate();

	// Sample item data with status — use existing JPEGs in public/images
	const [items, setItems] = useState([
		{ id: 1, name: 'Pikachu', description: 'Rare holographic Pikachu card - Looking to add this iconic Electric-type to my collection!', status: 'want', image: '/images/Pikachu.jpeg' },
		{ id: 2, name: 'Charmander', description: 'First edition Charmander card in mint condition, one of my favorite Fire-types.', status: 'have', image: '/images/Charmander.jpeg' },
		{ id: 3, name: 'Skitty', description: 'Common Skitty card - Already have multiple copies in my collection.', status: 'dontWant', image: '/images/Skitty.jpeg' },
	]);

	const handleStatusChange = useCallback((itemId, newStatus) => {
		setItems(prevItems => 
			prevItems.map(item => 
				item.id === itemId ? { ...item, status: newStatus } : item
			)
		);
		// Status change feedback handled by radio button state
	}, []);

	const handleViewChange = useCallback((e) => {
		const newView = e.target.value;
		setView(newView);
		if (newView === 'Community') {
			navigate('/collection');
		}
	}, [navigate]);

	const handleFavorite = useCallback(() => {
		setIsFavorited(prev => !prev);
		// TODO: Update favorite status in database
	}, []);

	const handleManageItems = useCallback(() => {
		// TODO: Navigate to management page or open modal
		alert('Item management feature coming soon!');
	}, []);

	const wantItems = items.filter(item => item.status === 'want');
	const haveItems = items.filter(item => item.status === 'have');
	const dontWantItems = items.filter(item => item.status === 'dontWant');

	const renderItemCard = (item) => (
		<article key={item.id} className="itemCard" role="listitem">
			<img
				src={item.image}
				alt={`${item.name} image`}
				loading="lazy"
				onError={(e) => {
					e.target.onerror = null;
					e.target.src = '/images/Pikachu.jpeg';
				}}
			/>
			<div className="VBox">
				<h3>{item.name}</h3>
				<p>{item.description}</p>
				<fieldset className="radioSelect" aria-label={`Item status for ${item.name}`}>
					<legend className="visually-hidden">Select item status</legend>
					<div>
						<input 
							type="radio" 
							id={`want-${item.id}`}
							name={`status-${item.id}`}
							value="want" 
							checked={item.status === 'want'}
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
							checked={item.status === 'have'}
							onChange={() => handleStatusChange(item.id, 'have')}
							aria-label="Mark as have"
						/>
						<label htmlFor={`have-${item.id}`}>Have</label>
					</div>
					<div>
						<input 
							type="radio" 
							id={`dontWant-${item.id}`}
							name={`status-${item.id}`}
							value="dontWant" 
							checked={item.status === 'dontWant'}
							onChange={() => handleStatusChange(item.id, 'dontWant')}
							aria-label="Mark as don't want"
						/>
						<label htmlFor={`dontWant-${item.id}`}>Don't Want</label>
					</div>
				</fieldset>
			</div>
		</article>
	);

	return (
		<main role="main">
			<header>
				<h1>{communityName}</h1>
				<div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
					<label htmlFor="view-select-personal" className="visually-hidden">
						Select view type
					</label>
					<select 
						name="views" 
						id="view-select-personal"
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
							onClick={handleManageItems}
							type="button"
							aria-label="Manage items in community"
						>
							Manage Items
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

			<section aria-labelledby="want-heading">
				<h2 id="want-heading">Cards to Catch ({wantItems.length})</h2>
				{wantItems.length === 0 ? (
					<p>No Pokémon cards on your wishlist yet.</p>
				) : (
					<div role="list" aria-label="Pokémon cards you want">
						{wantItems.map(renderItemCard)}
					</div>
				)}
			</section>

			<section aria-labelledby="have-heading">
				<h2 id="have-heading">Caught Cards ({haveItems.length})</h2>
				{haveItems.length === 0 ? (
					<p>No Pokémon cards in your collection yet.</p>
				) : (
					<div role="list" aria-label="Pokémon cards you have">
						{haveItems.map(renderItemCard)}
					</div>
				)}
			</section>

			<section aria-labelledby="dont-want-heading">
				<h2 id="dont-want-heading">Released Cards ({dontWantItems.length})</h2>
				{dontWantItems.length === 0 ? (
					<p>No Pokémon cards marked as released.</p>
				) : (
					<div role="list" aria-label="Pokémon cards you don't want">
						{dontWantItems.map(renderItemCard)}
					</div>
				)}
			</section>
		</main>
	);
}

