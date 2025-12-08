import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.scss';
import { useAuth } from '../context/AuthContext.jsx';

// Login page for user authentication
export default function Login() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleChange = useCallback((e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		setError(''); // Clear error on input change
	}, []);

	const validateForm = useCallback(() => {
		if (!formData.email.trim()) {
			setError('Email is required');
			return false;
		}
		if (!formData.password.trim()) {
			setError('Password is required');
			return false;
		}
		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			setError('Please enter a valid email address');
			return false;
		}
		return true;
	}, [formData]);

	const handleSubmit = useCallback(async (e) => {
		e.preventDefault();
		
		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		setError('');

		try {
			await login({
				email: formData.email.trim(),
				password: formData.password,
			});
			navigate('/');
		} catch (err) {
			setError(err.message || 'Login failed. Please check your credentials and try again.');
		} finally {
			setIsLoading(false);
		}
	}, [formData, validateForm, navigate]);

	const handleKeyDown = useCallback((e) => {
		if (e.key === 'Enter') {
			handleSubmit(e);
		}
	}, [handleSubmit]);

	return (
		<main className="auth-page" role="main">
			<div className="auth-container">
				<h1>Login to Stock Room</h1>
				<p className="auth-subtitle">Welcome back! Please enter your credentials.</p>

				<form onSubmit={handleSubmit} className="auth-form" aria-label="Login form">
					{error && (
						<div 
							className="auth-error" 
							role="alert" 
							aria-live="assertive"
						>
							{error}
						</div>
					)}

					<div className="form-group">
						<label htmlFor="login-email">
							Email Address
						</label>
						<input
							type="email"
							id="login-email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							onKeyDown={handleKeyDown}
							required
							autoComplete="email"
							placeholder="you@example.com"
							aria-describedby={error ? "login-error" : undefined}
							aria-invalid={!!error}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="login-password">
							Password
						</label>
						<input
							type="password"
							id="login-password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							onKeyDown={handleKeyDown}
							required
							autoComplete="current-password"
							placeholder="Enter your password"
							aria-describedby={error ? "login-error" : undefined}
							aria-invalid={!!error}
						/>
					</div>

					<button
						type="submit"
						className="auth-button"
						disabled={isLoading}
						aria-label="Submit login form"
					>
						{isLoading ? 'Logging in...' : 'Login'}
					</button>
				</form>

				<p className="auth-footer">
					Don't have an account?{' '}
					<Link to="/signup" className="auth-link">
						Sign up here
					</Link>
				</p>
			</div>
		</main>
	);
}

