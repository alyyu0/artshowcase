import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';

export default function PostModal({ show, onHide, artwork, onCommentAdded, onLikeToggled }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!artwork || !show) return;
    // fetch like/saved state and like count
    const fetchMeta = async () => {
      try {
        if (userId) {
          const checkLike = await fetch(`http://localhost:5000/api/likes/check/${userId}/${artwork.artwork_id}`);
          if (checkLike.ok) {
            const data = await checkLike.json();
            setLiked(!!data.isLiked);
          }
          const checkSave = await fetch(`http://localhost:5000/api/saves/check/${userId}/${artwork.artwork_id}`);
          if (checkSave.ok) {
            const data = await checkSave.json();
            setSaved(!!data.isSaved);
          }
        }
        const likesRes = await fetch(`http://localhost:5000/api/likes/artwork/${artwork.artwork_id}`);
        if (likesRes.ok) {
          const likesData = await likesRes.json();
          setLikeCount(likesData.count || 0);
        }
      } catch (err) {
        console.error('Error fetching meta', err);
      }
    };
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/comments/artwork/${artwork.artwork_id}`);
        if (res.ok) {
          const data = await res.json();
          setComments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching comments', err);
      }
    };
    fetchComments();
    fetchMeta();
  }, [artwork, show]);

  const handleAddComment = async () => {
    if (!userId) {
      alert('Please login to comment');
      return;
    }
    if (!newComment.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/comments/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, artwork_id: artwork.artwork_id, comment_text: newComment })
      });
      if (res.ok) {
        setNewComment('');
        // reload comments
        const reload = await fetch(`http://localhost:5000/api/comments/artwork/${artwork.artwork_id}`);
        if (reload.ok) {
          const data = await reload.json();
          setComments(Array.isArray(data) ? data : []);
        }
        // notify parent to update comment count if provided
        if (typeof onCommentAdded === 'function') onCommentAdded(artwork.artwork_id);
      } else {
        console.error('Failed to add comment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalLike = async () => {
    if (!userId) { alert('Please login to like artworks'); return; }
    try {
      const endpoint = liked ? '/api/likes/unlike' : '/api/likes/like';
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, artwork_id: artwork.artwork_id })
      });
      if (res.ok) {
        const nextLiked = !liked;
        setLiked(nextLiked);
        setLikeCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));
        if (typeof onLikeToggled === 'function') onLikeToggled(artwork.artwork_id, nextLiked);
      }
    } catch (err) { console.error(err); }
  };

  const handleModalSave = async () => {
    if (!userId) { alert('Please login to save artworks'); return; }
    try {
      const endpoint = saved ? '/api/saves/unsave' : '/api/saves/save';
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, artwork_id: artwork.artwork_id })
      });
      if (res.ok) {
        setSaved(!saved);
      }
    } catch (err) { console.error(err); }
  };

  if (!artwork) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="xl" className="post-modal" dialogClassName="post-modal-dialog">
      <Modal.Body className="p-0" style={{ background: 'transparent' }}>
        <div className="post-modal-inner">
          <div className="post-modal-left">
            <img src={artwork.image_url} alt={artwork.title} className="post-modal-image" />
          </div>
          <div className="post-modal-right">
            <button className="modal-close-btn" onClick={onHide} aria-label="Close">×</button>
            <div className="post-modal-header">
              <img src={artwork.profile_picture || 'https://via.placeholder.com/36?text=User'} alt={artwork.username} className="artwork-user-avatar" />
              <span
                className="artwork-username"
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={(e) => { e.stopPropagation(); onHide(); navigate(`/profile/${artwork.username}`); }}
              >@{artwork.username}</span>
            </div>

            <h3 className="artwork-title" style={{ marginTop: '0.8rem' }}>{artwork.title}</h3>
            <div className="artwork-tags" style={{ marginTop: '0.4rem' }}>
              <span className="tag">Digital Art</span>
            </div>
            {artwork.caption && <p className="artwork-caption" style={{ marginTop: '0.6rem' }}>{artwork.caption}</p>}

            <h5 style={{ marginTop: '1.1rem' }}>Comments ({comments.length})</h5>
            <div className="comments-list">
              {comments.length === 0 ? (
                <p style={{ color: '#888' }}>No comments yet. Be the first to comment!</p>
              ) : (
                comments.map(c => (
                  <div key={c.comment_id} className="comment-row">
                    <img
                      src={c.profile_picture || 'https://via.placeholder.com/28?text=U'}
                      alt={c.username}
                      className="comment-avatar"
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); onHide(); navigate(`/profile/${c.username}`); }}
                    />
                    <div>
                      <div className="comment-meta">
                        <strong style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onHide(); navigate(`/profile/${c.username}`); }}>@{c.username}</strong>
                        {' '}· <small style={{ color: '#888' }}>{new Date(c.created_at).toLocaleString()}</small>
                      </div>
                      <div className="comment-text">{c.comment_text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="post-modal-footer">
              <div className="stats-row">
                <button className={`artwork-action-btn like-btn ${liked ? 'liked' : ''}`} onClick={handleModalLike} aria-label="Like">
                  <Heart size={44} strokeWidth={2.5} stroke="currentColor" className="modal-icon" /> <span style={{ marginLeft: '10px', fontSize: '1.1rem' }}>{likeCount}</span>
                </button>
                <div className="stat"><MessageCircle size={32} strokeWidth={2} stroke="currentColor" className="modal-icon" /> <span style={{ marginLeft: '6px' }}>{comments.length}</span></div>
                <div className="spacer" />
                <button className={`artwork-action-btn ${saved ? 'saved' : ''}`} onClick={handleModalSave} aria-label="Save">
                  <Bookmark size={32} strokeWidth={2} stroke="currentColor" className="modal-icon" />
                </button>
              </div>

              <div className="comment-input-row">
                <Form.Control type="text" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <Button className="comment-btn" onClick={handleAddComment} style={{ marginLeft: '0.5rem' }}>Comment</Button>
              </div>
            </div>

          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
