import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import './Forum.scss';

export default function Forum({ communityId, isOwner, isModerator, user }) {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const loadPosts = useCallback(async () => {
        try {
            const { posts } = await apiClient.get(`/communities/${communityId}/posts`);
            setPosts(posts);
        } catch (err) {
            console.error('Failed to load posts:', err);
            setError('Failed to load forum posts.');
        } finally {
            setIsLoading(false);
        }
    }, [communityId]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        setIsPosting(true);
        setError('');
        try {
            const { post } = await apiClient.post(`/communities/${communityId}/posts`, {
                content: newPostContent,
            });
            setPosts((prev) => [post, ...prev]);
            setNewPostContent('');
        } catch (err) {
            console.error('Failed to post:', err);
            setError(err.message || 'Failed to post message.');
        } finally {
            setIsPosting(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await apiClient.delete(`/communities/${communityId}/posts/${postId}`);
            setPosts((prev) => prev.filter((p) => p.id !== postId));
        } catch (err) {
            console.error('Failed to delete post:', err);
            alert('Failed to delete post.');
        }
    };

    if (isLoading) return <p>Loading forum...</p>;

    return (
        <section className="forum-section" aria-label="Community Forum">
            <h2>Community Forum</h2>

            {error && <p className="error-message" role="alert">{error}</p>}

            {user ? (
                <form onSubmit={handlePostSubmit} className="forum-post-form">
                    <div className="input-group">
                        <img
                            src={user.image || '/images/Profile-picture.png'}
                            alt={user.username}
                            className="user-avatar-small"
                            onError={(e) => { e.target.onerror = null; e.target.src = '/images/Profile-picture.png'; }}
                        />
                        <input
                            type="text"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Share your thoughts..."
                            maxLength={500}
                            disabled={isPosting}
                            aria-label="Write a forum post"
                        />
                        <button type="submit" disabled={isPosting || !newPostContent.trim()}>
                            {isPosting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            ) : (
                <p className="login-prompt">Please log in to post messages.</p>
            )}

            <div className="forum-posts" role="list">
                {posts.length === 0 ? (
                    <p className="no-posts">No posts yet. Be the first to share!</p>
                ) : (
                    posts.map((post) => (
                        <article key={post.id} className="forum-post" role="listitem">
                            <div className="post-header">
                                <div className="author-info">
                                    {//Clickable User pfp so we can access collection pages.
                                    }
                                    <img
                                        src={post.authorId?.image || '/images/Profile-picture.png'}
                                        alt={post.authorId?.username || 'Unknown User'}
                                        className="user-avatar"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/Profile-picture.png'; }}
                                        role="link"
                                        tabIndex={0}
                                        onClick={() => navigate('/profile', { state: { User: post.authorId } })}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/profile', { state: { User: post.authorId } }); }}}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <div className="author-details">
                                        <span className="author-name">{post.authorId?.username || 'Unknown User'}</span>
                                        <span className="post-date">{new Date(post.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                                {(isOwner || isModerator || user?.id === post.authorId?.id || user?.id === post.authorId) && (
                                    <button
                                        onClick={() => handleDeletePost(post.id)}
                                        className="delete-post-btn"
                                        aria-label="Delete post"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <p className="post-content">{post.content}</p>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}
