import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.scss';

// SignUp page for new user registration
export default function SignUp() {
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [validationErrors, setValidationErrors] = useState({});
	const navigate = useNavigate();

	const handleChange = useCallback((e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		
		// Clear errors for this field
		if (validationErrors[name]) {
			setValidationErrors(prev => {
				const next = { ...prev };
				delete next[name];
				return next;
			});
		}
		setError('');
	}, [validationErrors]);

	const validateForm = useCallback(() => {
		const errors = {};
		
		// Username validation
		if (!formData.username.trim()) {
			errors.username = 'Username is required';
		} else if (formData.username.length < 3) {
			errors.username = 'Username must be at least 3 characters';
		} else if (formData.username.length > 20) {
			errors.username = 'Username must be less than 20 characters';
		} else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
			errors.username = 'Username can only contain letters, numbers, and underscores';
		}
		
		// Email validation
		if (!formData.email.trim()) {
			errors.email = 'Email is required';
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				errors.email = 'Please enter a valid email address';
			}
		}
		
		// Password validation
		if (!formData.password.trim()) {
			errors.password = 'Password is required';
		} else if (formData.password.length < 8) {
			errors.password = 'Password must be at least 8 characters';
		}
		
		// Confirm password validation
		if (!formData.confirmPassword.trim()) {
			errors.confirmPassword = 'Please confirm your password';
		} else if (formData.password !== formData.confirmPassword) {
			errors.confirmPassword = 'Passwords do not match';
		}
		
		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	}, [formData]);

	const handleSubmit = useCallback(async (e) => {
		e.preventDefault();
		
		if (!validateForm()) {
			setError('Please fix the errors below');
			return;
		}

		setIsLoading(true);
		setError('');

		try {
			// TODO: Replace with actual API call
			// Example: const response = await fetch('/api/auth/signup', { ... });
			
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// TODO: Store token and user data after successful signup
			// localStorage.setItem('token', response.data.token);
			// localStorage.setItem('user', JSON.stringify(response.data.user));
			
			// For now, just simulate successful signup
			
			// Navigate to home after successful signup
			navigate('/');
		} catch (err) {
			setError(err.message || 'Sign up failed. Please try again.');
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
				<h1>Create an Account</h1>
				<p className="auth-subtitle">Join Stock Room and start collecting!</p>

				<form onSubmit={handleSubmit} className="auth-form" aria-label="Sign up form">
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
						<label htmlFor="signup-username">
							Username
						</label>
						<input
							type="text"
							id="signup-username"
							name="username"
							value={formData.username}
							onChange={handleChange}
							onKeyDown={handleKeyDown}
							required
							autoComplete="username"
							placeholder="Choose a username"
							aria-describedby={validationErrors.username ? "username-error" : undefined}
							aria-invalid={!!validationErrors.username}
						/>
						{validationErrors.username && (
							<span id="username-error" className="field-error" role="alert">
								{validationErrors.username}
							</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="signup-email">
							Email Address
						</label>
						<input
							type="email"
							id="signup-email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							onKeyDown={handleKeyDown}
							required
							autoComplete="email"
							placeholder="you@example.com"
							aria-describedby={validationErrors.email ? "email-error" : undefined}
							aria-invalid={!!validationErrors.email}
						/>
						{validationErrors.email && (
							<span id="email-error" className="field-error" role="alert">
								{validationErrors.email}
							</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="signup-password">
							Password
						</label>
						<input
							type="password"
							id="signup-password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							onKeyDown={handleKeyDown}
							required
							autoComplete="new-password"
							placeholder="At least 8 characters"
							aria-describedby={validationErrors.password ? "password-error" : undefined}
							aria-invalid={!!validationErrors.password}
						/>
						{validationErrors.password && (
							<span id="password-error" className="field-error" role="alert">
								{validationErrors.password}
							</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="signup-confirm-password">
							Confirm Password
						</label>
						<input
							type="password"
							id="signup-confirm-password"
							name="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
							onKeyDown={handleKeyDown}
							required
							autoComplete="new-password"
							placeholder="Re-enter your password"
							aria-describedby={validationErrors.confirmPassword ? "confirm-password-error" : undefined}
							aria-invalid={!!validationErrors.confirmPassword}
						/>
						{validationErrors.confirmPassword && (
							<span id="confirm-password-error" className="field-error" role="alert">
								{validationErrors.confirmPassword}
							</span>
						)}
					</div>

					<button
						type="submit"
						className="auth-button"
						disabled={isLoading}
						aria-label="Submit sign up form"
					>
						{isLoading ? 'Creating account...' : 'Sign Up'}
					</button>
				</form>

				<p className="auth-footer">
					Already have an account?{' '}
					<Link to="/login" className="auth-link">
						Login here
					</Link>
				</p>
			</div>
		</main>
	);
}

