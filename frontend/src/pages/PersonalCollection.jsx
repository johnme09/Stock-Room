import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import './Collection.scss';
import { apiClient } from '../lib/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';

// PersonalCollection page displays personal view with item status (want/have/don't have)
export default function PersonalCollection() {
	const [searchParams] = useSearchParams();
	const communityId = searchParams.get('communityId');
	const [community, setCommunity] = useState(null);
	const [items, setItems] = useState([]);
	const [statuses, setStatuses] = useState({});
	const [view, setView] = useState('Personal');
	const [error, setError] = useState('');

	const navigate = useNavigate();
	const { user } = useAuth();
	const [failedImages, setFailedImages] = useState(new Set());

	const handleImageError = (id) => {
		setFailedImages((prev) => {
			const newSet = new Set(prev);
			newSet.add(id);
			return newSet;
		});
	};
	const location = useLocation();
	// If a `User` object or numeric user id is passed via navigation state, use that instead of default user.
	// Formatting fixer for displayUser.
	const navUser = location.state?.User;
	const displayUser = navUser
		? // normalize numeric id to an object with `id` so downstream code can use `displayUser.id`
		typeof navUser === 'object' && navUser !== null
			? navUser
			: { id: navUser }
		: user;

	const loadCommunityData = useCallback(async () => {
		if (!communityId) return;
		try {
			// Prevent late responses from overwriting newer data
			const reqId = ++latestCommunityRequestRef.current;
			const [{ community: communityData }, { items: itemList }] = await Promise.all([
				apiClient.get(`/communities/${communityId}`),
				apiClient.get(`/communities/${communityId}/items`),
			]);
			if (reqId !== latestCommunityRequestRef.current) return;
			setCommunity(communityData);
			setItems(itemList);
		} catch (err) {
			setError(err.message);
		}
	}, [communityId]);

	const latestStatusRequestRef = useRef(0);
	const latestCommunityRequestRef = useRef(0);

	const loadStatuses = useCallback(async () => {
		if (!communityId || !displayUser) return;
		// increment token to prevent late responses.
		const reqId = ++latestStatusRequestRef.current;
		try {
			// Request statuses for the profile user. Backend should accept userId query param.
			const userIdParam = displayUser?.id ? `&userId=${displayUser.id}` : '';
			const data = await apiClient.get(`/user-items?communityId=${communityId}${userIdParam}`);
			// ignore late responses
			if (reqId !== latestStatusRequestRef.current) return;
			const map = {};
			data.userItems.forEach(({ item, status }) => {
				if (item) {
					map[item.id] = status;
				}
			});
			setStatuses(map);
		} catch (err) {
			// only set error if this is the latest request
			if (reqId === latestStatusRequestRef.current) setError(err.message);
		}
	}, [communityId, displayUser]);

	useEffect(() => {
		loadCommunityData();
	}, [loadCommunityData]);

	useEffect(() => {
		loadStatuses();
	}, [loadStatuses]);

	const handleStatusChange = useCallback(
		async (itemId, newStatus) => {
			try {
				await apiClient.put('/user-items', { itemId, status: newStatus });
				setStatuses((prev) => ({ ...prev, [itemId]: newStatus }));
			} catch (err) {
				setError(err.message);
			}
		},
		[]
	);

	const handleViewChange = useCallback(
		(e) => {
			const newView = e.target.value;
			setView(newView);
			if (newView === 'Community' && communityId) {
				navigate(`/collection/${communityId}`);
			}
		},
		[navigate, communityId]
	);

	if (!displayUser) {
		return <p role="alert">Please log in to view this personal collection.</p>;
	}

	if (!communityId) {
		return <p role="alert">Select a community from the community view first.</p>;
	}

	const mergedItems = items.map((item) => ({
		...item,
		status: statuses[item.id] || 'dont_have',
	}));

	const wantItems = mergedItems.filter((item) => item.status === 'want');
	const haveItems = mergedItems.filter((item) => item.status === 'have');
	const dontHaveItems = mergedItems.filter((item) => item.status === 'dont_have');

	const statusLabel = (s) => {
		if (s === 'want') return 'Want';
		if (s === 'have') return 'Have';
		return "Don't Have";
	};

	const renderItemCard = (item) => (
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
				<h3>{item.title}</h3>
				<p>{item.description}</p>
				{//Added system for displaying options for own collection, text for anyone else.
				}
				{displayUser && user && displayUser.id === user.id ? (
					<fieldset className="radioSelect" aria-label={`Item status for ${item.title}`}>
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
								id={`dont-${item.id}`}
								name={`status-${item.id}`}
								value="dont_have"
								checked={item.status === 'dont_have'}
								onChange={() => handleStatusChange(item.id, 'dont_have')}
								aria-label="Mark as don't have"
							/>
							<label htmlFor={`dont-${item.id}`}>Don't Have</label>
						</div>
					</fieldset>
				) : (
					<div className="readonly-status">
						<label htmlFor={`status-text-${item.id}`} className="visually-hidden">Status</label>
						<input id={`status-text-${item.id}`} type="text" readOnly value={statusLabel(item.status)} />
					</div>
				)}
			</div>
		</article>
	);

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
						<h1 className="community-title">
							{displayUser && user && displayUser.id === user.id ? 'My Collection' : `${displayUser?.username || 'User'}'s Collection`}
						</h1>
						<p className="community-description">
							{community?.title} Community
						</p>

						<div className="community-stats">
							<div className="stat">
								<div className="number">{haveItems.length}</div>
								<div className="label">Owned</div>
							</div>
							<div className="stat">
								<div className="number">{wantItems.length}</div>
								<div className="label">Wishlist</div>
							</div>
						</div>

						<div className="community-actions">
							<select
								name="views"
								id="view-select-personal"
								value={view}
								onChange={handleViewChange}
								aria-label="Switch between community and personal view"
								className="view-selector"
							>
								<option value="Community">Community View</option>
								<option value="Personal">Personal View</option>
							</select>
						</div>
					</div>
				</div>
			</header>

			{error && (
				<div style={{ maxWidth: '1200px', margin: '0 auto 2rem', padding: '0 2rem' }}>
					<p role="alert" style={{ color: '#dc3545', padding: '1rem', background: '#f8d7da', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
						{error}
					</p>
				</div>
			)}

			<div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
				<section aria-labelledby="want-heading" style={{ marginBottom: '3rem' }}>
					<h2 id="want-heading" style={{
						fontSize: '1.75rem',
						borderBottom: '2px solid #e2e8f0',
						paddingBottom: '0.5rem',
						marginBottom: '1.5rem',
						color: '#2d3748'
					}}>
						Wishlist <span style={{ fontSize: '1rem', color: '#718096', fontWeight: 'normal' }}>({wantItems.length})</span>
					</h2>
					{wantItems.length === 0 ? (
						<div className="empty-state" style={{ padding: '3rem 1rem', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
							<p>No items on your wishlist yet.</p>
						</div>
					) : (
						<div role="list" aria-label="Items you want" className="items-grid">
							{wantItems.map(renderItemCard)}
						</div>
					)}
				</section>

				<section aria-labelledby="have-heading" style={{ marginBottom: '3rem' }}>
					<h2 id="have-heading" style={{
						fontSize: '1.75rem',
						borderBottom: '2px solid #e2e8f0',
						paddingBottom: '0.5rem',
						marginBottom: '1.5rem',
						color: '#2d3748'
					}}>
						Owned <span style={{ fontSize: '1rem', color: '#718096', fontWeight: 'normal' }}>({haveItems.length})</span>
					</h2>
					{haveItems.length === 0 ? (
						<div className="empty-state" style={{ padding: '3rem 1rem', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
							<p>You have not added any items yet.</p>
						</div>
					) : (
						<div role="list" aria-label="Items you have" className="items-grid">
							{haveItems.map(renderItemCard)}
						</div>
					)}
				</section>

				<section aria-labelledby="dont-heading" style={{ marginBottom: '3rem' }}>
					<h2 id="dont-heading" style={{
						fontSize: '1.75rem',
						borderBottom: '2px solid #e2e8f0',
						paddingBottom: '0.5rem',
						marginBottom: '1.5rem',
						color: '#2d3748'
					}}>
						Still Searching <span style={{ fontSize: '1rem', color: '#718096', fontWeight: 'normal' }}>({dontHaveItems.length})</span>
					</h2>
					{dontHaveItems.length === 0 ? (
						<div className="empty-state" style={{ padding: '3rem 1rem', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
							<p>You have marked every item as want or have!</p>
						</div>
					) : (
						<div role="list" aria-label="Items you don't have yet" className="items-grid">
							{dontHaveItems.map(renderItemCard)}
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
