import React, { useState, useCallback, useRef, useEffect } from 'react';
import './Settings.scss';
import { useAuth } from '../context/AuthContext.jsx';
import { apiClient } from '../lib/apiClient.js';

// Settings page allows user to change account settings
export default function Settings() {
	const { user, refreshProfile } = useAuth();
	const [formState, setFormState] = useState({ username: '', email: '', about: '', pfpImageUrl: '', privacy: 'private' });
	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState('');
	const aboutTextareaRef = useRef(null);

	useEffect(() => {
		if (user) {
			setFormState((prev) => ({
				...prev,
				username: user.username,
				email: user.email,
				about: user.about || '',
				pfpImageUrl: user.image || '',
			}));
		}
	}, [user]);

	const updateField = useCallback((field, value) => {
		setFormState((prev) => ({ ...prev, [field]: value }));
		setSaveMessage('');
	}, []);

	const onSaveAll = useCallback(async () => {
		setIsSaving(true);
		setSaveMessage('');
		try {
			await apiClient.patch('/users/me', { 
				image: formState.pfpImageUrl,
				about: formState.about 
			});
			await refreshProfile();
			setSaveMessage('All changes saved successfully');
		} catch (err) {
			setSaveMessage(err.message);
		} finally {
			setIsSaving(false);
			setTimeout(() => setSaveMessage(''), 3000);
		}
	}, [formState.pfpImageUrl, formState.about, refreshProfile]);

	if (!user) {
		return <p role="alert">Please log in to access settings.</p>;
	}

	return (
		<main role="main" className="settings-page">
			<header>
				<h1>Settings</h1>
			</header>

			{saveMessage && (
				<div
					role="alert"
					aria-live="polite"
					style={{
						padding: '0.75rem',
						backgroundColor: '#d4edda',
						color: '#155724',
						border: '1px solid #c3e6cb',
						borderRadius: '4px',
						marginBottom: '1rem',
					}}
				>
					{saveMessage}
				</div>
			)}

			<section id="account-settings" className="settings-card" aria-labelledby="account-settings-heading">
				<h2 id="account-settings-heading">Account</h2>

				<div className="setting-row" id="username-row">
					<label htmlFor="username-current">Username</label>
					<div id="username-current" className="current-value" aria-live="polite">
						{formState.username}
					</div>
				</div>

				<div className="setting-row" id="email-row">
					<label htmlFor="email-current">Email</label>
					<div id="email-current" className="current-value" aria-live="polite">
						{formState.email}
					</div>
				</div>
			</section>

			<section id="about-section" className="settings-card" aria-labelledby="about-heading">
				<h2 id="about-heading">About me</h2>
				<label htmlFor="about-text" className="visually-hidden">
					Tell others about yourself
				</label>
				<textarea
					id="about-text"
					rows={4}
					placeholder="Tell others about yourself..."
					value={formState.about}
					onChange={(e) => updateField('about', e.target.value)}
					ref={aboutTextareaRef}
					maxLength={500}
					aria-describedby="about-hint"
				/>
				<div id="about-hint" style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
					{formState.about.length}/500 characters
				</div>
			</section>

			<section id="profile-image-section" className="settings-card" aria-labelledby="profile-image-heading">
				<h2 id="profile-image-heading">Profile Picture</h2>
				<label htmlFor="pfp-image-url" className="visually-hidden">
					Profile picture URL
				</label>
				<input
					id="pfp-image-url"
					type="url"
					placeholder="Enter profile picture URL..."
					value={formState.pfpImageUrl}
					onChange={(e) => updateField('pfpImageUrl', e.target.value)}
					aria-describedby="pfp-hint"
					style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5f5' }}
				/>
				<div id="pfp-hint" style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
					Provide a valid image URL
				</div>
			</section>

			<div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
				<button
					type="button"
					id="save-all"
					onClick={onSaveAll}
					disabled={isSaving}
					aria-label="Save all changes"
				>
					{isSaving ? 'Saving...' : 'Save'}
				</button>
			</div>
		</main>
	);
}
