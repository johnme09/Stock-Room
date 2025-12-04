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
			<header>
				<h1>{community?.title || 'Personal Collection'}</h1>
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
				</div>
			</header>

			{error && (
				<p role="alert" style={{ color: '#b91c1c' }}>
					{error}
				</p>
			)}

			<section aria-labelledby="want-heading">
				<h2 id="want-heading">Wishlist ({wantItems.length})</h2>
				{wantItems.length === 0 ? (
					<p>No items on your wishlist yet.</p>
				) : (
					<div role="list" aria-label="Items you want">
						{wantItems.map(renderItemCard)}
					</div>
				)}
			</section>

			<section aria-labelledby="have-heading">
				<h2 id="have-heading">Owned ({haveItems.length})</h2>
				{haveItems.length === 0 ? (
					<p>You have not added any items yet.</p>
				) : (
					<div role="list" aria-label="Items you have">
						{haveItems.map(renderItemCard)}
					</div>
				)}
			</section>

			<section aria-labelledby="dont-heading">
				<h2 id="dont-heading">Still Searching ({dontHaveItems.length})</h2>
				{dontHaveItems.length === 0 ? (
					<p>You have marked every item as want or have!</p>
				) : (
					<div role="list" aria-label="Items you don't have yet">
						{dontHaveItems.map(renderItemCard)}
					</div>
				)}
			</section>
		</main>
	);
}
