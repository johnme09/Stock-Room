import React, { useState } from 'react';

const defaultSettings = {
	username: 'fake_user',
	email: 'fake@example.com',
	password: '********',
	about: 'This is a short about me.',
	privacy: 'private',
};
// Based on settings.html prototype. Allows user to change dummy account settings using local state until database implementation.
export default function Settings({ initialValues = defaultSettings }) {
	const [user, setUser] = useState({ ...defaultSettings, ...initialValues });

	const updateField = (field, value) => setUser(prev => ({ ...prev, [field]: value }));

	const onChangeField = (field) => {
        //field change prompt - in real implementation, will update actual database fields properly.
		const newVal = window.prompt(`Enter new ${field}:`, user[field] ?? '');
		if (newVal != null) updateField(field, newVal);
	};

	const onSaveAbout = () => {
		// Save indicator - in real implementation, would save to database
		alert('About saved');
	};

	return (
		<main>
			{/* Currently set for default with dummy user interaction functions to be replaced with true user once database is implemented. */}

			<header>
				<h1>Settings</h1>
			</header>

			<section id="account-settings">
				<h2 id="account-settings-heading">Account</h2>

				<div className="setting-row" id="username-row">
					<label htmlFor="username-current">Username</label>
					<div id="username-current" className="current-value">{user.username}</div>
					<button type="button" className="change-btn" onClick={() => onChangeField('username')}>Change</button>
				</div>

				<div className="setting-row" id="password-row">
					<label htmlFor="password-current">Password</label>
					<div id="password-current" className="current-value">{user.password}</div>
					<button type="button" className="change-btn" onClick={() => onChangeField('password')}>Change</button>
				</div>

				<div className="setting-row" id="email-row">
					<label htmlFor="email-current">Email</label>
					<div id="email-current" className="current-value">{user.email}</div>
					<button type="button" className="change-btn" onClick={() => onChangeField('email')}>Change</button>
				</div>
			</section>

			<section id="about-section">
				<h2 id="about-heading">About me</h2>
				<textarea id="about-text" rows={4} placeholder="Tell others about yourself..." value={user.about} onChange={e => updateField('about', e.target.value)} />
				<div>
					<button type="button" id="save-about" onClick={onSaveAbout}>Save</button>
				</div>
			</section>

			<section id="privacy-section">
				<h2 id="privacy-heading">Personal collection privacy</h2>
				<label htmlFor="privacy-select" className="visually-hidden">Personal collection privacy</label>
				<select id="privacy-select" name="privacy-select" value={user.privacy} onChange={e => updateField('privacy', e.target.value)}>
					<option value="private">private</option>
					<option value="public">public</option>
				</select>

				<div>
					<button type="button" id="delete-account" className="danger" onClick={() => { if (window.confirm('Delete account? This cannot be undone.')) alert('Account deleted (demo)'); }}>Delete account</button>
				</div>
			</section>
		</main>
	);
}
