import React, { useState, useCallback, useRef } from 'react';
import './Settings.scss';

const DEFAULT_SETTINGS = {
	username: 'fake_user',
	email: 'fake@example.com',
	password: '********',
	about: 'This is a short about me.',
	privacy: 'private',
};

// Settings page allows user to change account settings
export default function Settings({ initialValues = DEFAULT_SETTINGS }) {
	const [user, setUser] = useState({ ...DEFAULT_SETTINGS, ...initialValues });
	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState('');
	const aboutTextareaRef = useRef(null);

	const updateField = useCallback((field, value) => {
		setUser(prev => ({ ...prev, [field]: value }));
		setSaveMessage('');
	}, []);

	const validateField = (field, value) => {
		switch (field) {
			case 'email':
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return emailRegex.test(value) || 'Please enter a valid email address';
			case 'username':
				if (value.length < 3) return 'Username must be at least 3 characters';
				if (value.length > 20) return 'Username must be less than 20 characters';
				return true;
			case 'password':
				if (value.length < 8) return 'Password must be at least 8 characters';
				return true;
			default:
				return true;
		}
	};

	const onChangeField = useCallback((field) => {
		const currentValue = user[field] ?? '';
		const newVal = window.prompt(`Enter new ${field}:`, currentValue);
		
		if (newVal === null) return; // User cancelled
		
		const trimmedVal = newVal.trim();
		const validation = validateField(field, trimmedVal);
		
		if (validation === true) {
			updateField(field, trimmedVal);
			if (field !== 'password') {
				setSaveMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
				setTimeout(() => setSaveMessage(''), 3000);
			}
		} else {
			alert(validation);
		}
	}, [user, updateField]);

	const onSaveAbout = useCallback(async () => {
		setIsSaving(true);
		setSaveMessage('');
		
		// Simulate save
		await new Promise(resolve => setTimeout(resolve, 500));
		
		// TODO: Save to database in real implementation
		setSaveMessage('About saved successfully');
		setIsSaving(false);
		setTimeout(() => setSaveMessage(''), 3000);
	}, []);

	const handleDeleteAccount = useCallback(() => {
		const confirmed = window.confirm(
			'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
		);
		
		if (confirmed) {
			// TODO: Implement actual account deletion
			alert('Account deletion is not implemented yet. This is a demo.');
		}
	}, []);

	const handlePrivacyChange = useCallback((e) => {
		updateField('privacy', e.target.value);
		setSaveMessage('Privacy setting updated');
		setTimeout(() => setSaveMessage(''), 3000);
	}, [updateField]);

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
						marginBottom: '1rem'
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
						{user.username}
					</div>
					<button 
						type="button" 
						className="change-btn" 
						onClick={() => onChangeField('username')}
						aria-label="Change username"
					>
						Change
					</button>
				</div>

				<div className="setting-row" id="password-row">
					<label htmlFor="password-current">Password</label>
					<div id="password-current" className="current-value" aria-live="polite">
						{user.password}
					</div>
					<button 
						type="button" 
						className="change-btn" 
						onClick={() => onChangeField('password')}
						aria-label="Change password"
					>
						Change
					</button>
				</div>

				<div className="setting-row" id="email-row">
					<label htmlFor="email-current">Email</label>
					<div id="email-current" className="current-value" aria-live="polite">
						{user.email}
					</div>
					<button 
						type="button" 
						className="change-btn" 
						onClick={() => onChangeField('email')}
						aria-label="Change email"
					>
						Change
					</button>
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
					value={user.about} 
					onChange={e => updateField('about', e.target.value)}
					ref={aboutTextareaRef}
					maxLength={500}
					aria-describedby="about-hint"
				/>
				<div id="about-hint" style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
					{user.about.length}/500 characters
				</div>
				<div>
					<button 
						type="button" 
						id="save-about" 
						onClick={onSaveAbout}
						disabled={isSaving}
						aria-label="Save about me information"
					>
						{isSaving ? 'Saving...' : 'Save'}
					</button>
				</div>
			</section>

			<section id="privacy-section" className="settings-card" aria-labelledby="privacy-heading">
				<h2 id="privacy-heading">Personal collection privacy</h2>
				<label htmlFor="privacy-select">Personal collection privacy</label>
				<select 
					id="privacy-select" 
					name="privacy-select" 
					value={user.privacy} 
					onChange={handlePrivacyChange}
					aria-label="Select privacy setting for personal collection"
				>
					<option value="private">Private</option>
					<option value="public">Public</option>
				</select>

				<div>
					<button 
						type="button" 
						id="delete-account" 
						className="danger" 
						onClick={handleDeleteAccount}
						aria-label="Delete account permanently"
					>
						Delete account
					</button>
				</div>
			</section>
		</main>
	);
}
