import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';

export default function PostModal({ 
  show, 
  onHide, 
  artwork, 
  onCommentAdded, 
  onLikeToggled,
  likedArtworks,
  savedArtworks
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Sync with parent component's likedArtworks state
  useEffect(() => {
    if (artwork && likedArtworks) {
      setLiked(likedArtworks.has(artwork.artwork_id));
    }
  }, [artwork, likedArtworks]);

  // Sync with parent component's savedArtworks state
  useEffect(() => {
    if (artwork && savedArtworks) {
      setSaved(savedArtworks.has(artwork.artwork_id));
    }
  }, [artwork, savedArtworks]);

  // Set initial like count from artwork
  useEffect(() => {
    if (artwork) {
      setLikeCount(artwork.like_count || 0);
    }
  }, [artwork]);

  useEffect(() => {
    if (!artwork || !show) return;
    
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
        const reload = await fetch(`http://localhost:5000/api/comments/artwork/${artwork.artwork_id}`);
        if (reload.ok) {
          const data = await reload.json();
          setComments(Array.isArray(data) ? data : []);
        }
        if (typeof onCommentAdded === 'function') onCommentAdded(artwork.artwork_id);
      } else {
        console.error('Failed to add comment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalLike = async (e) => {
    e.stopPropagation();
    if (!userId) { 
      alert('Please login to like artworks'); 
      return; 
    }
    
    try {
      const endpoint = liked ? '/api/likes/unlike' : '/api/likes/like';
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, artwork_id: artwork.artwork_id })
      });
      
      if (res.ok) {
        const nextLiked = !liked;
        setLiked(nextLiked);
        setLikeCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));
        
        if (typeof onLikeToggled === 'function') {
          onLikeToggled(artwork.artwork_id, nextLiked);
        }
      }
    } catch (err) { 
      console.error(err); 
    }
  };

  const handleModalSave = async (e) => {
    e.stopPropagation();
    if (!userId) { 
      alert('Please login to save artworks'); 
      return; 
    }
    
    try {
      const endpoint = saved ? '/api/saves/unsave' : '/api/saves/save';
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, artwork_id: artwork.artwork_id })
      });
      
      if (res.ok) {
        setSaved(!saved);
      }
    } catch (err) { 
      console.error(err); 
    }
  };

  if (!artwork) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="xl" className="post-modal" dialogClassName="post-modal-dialog">
      <Modal.Body className="p-0" style={{ background: 'transparent' }}>
        <div className="post-modal-inner">
          <div className="post-modal-left">
            <img 
              src={artwork.image_url} 
              alt={artwork.title} 
              className="post-modal-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x600?text=Image+Not+Found';
              }}
            />
          </div>
          <div className="post-modal-right">
            <button className="modal-close-btn" onClick={onHide} aria-label="Close">×</button>
            <div className="post-modal-header">
              <img 
                src={artwork.profile_picture || 'https://via.placeholder.com/36?text=User'} 
                alt={artwork.username} 
                className="artwork-user-avatar" 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/36?text=User';
                }}
              />
              <span
                className="artwork-username"
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={(e) => { e.stopPropagation(); onHide(); navigate(`/profile/${artwork.username}`); }}
              >{artwork.username}</span>
            </div>

            <h3 className="artwork-title" style={{ marginTop: '0.8rem' }}>{artwork.title}</h3>
            
            {/* ACTION BUTTONS SECTION - ADDED HERE */}
            <div className="modal-action-buttons" style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                className={`artwork-action-btn like-btn ${liked ? 'liked' : ''}`} 
                onClick={handleModalLike} 
                aria-label="Like"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  color: liked ? '#ff4757' : '#333',
                  fontSize: '1rem',
                  outline: 'none',
                  padding: 0
                }}
              >
                <Heart 
                  size={32} 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  fill={liked ? "currentColor" : "none"}
                  style={{ marginRight: '8px' }}
                /> 
                <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>{likeCount}</span>
              </button>
              
              <button 
                className="artwork-action-btn"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  color: '#333',
                  fontSize: '1rem',
                  outline: 'none',
                  padding: 0
                }}
                aria-label="Comments"
              >
                <MessageCircle 
                  size={32} 
                  strokeWidth={2} 
                  stroke="currentColor"
                  style={{ marginRight: '8px' }}
                /> 
                <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>{comments.length}</span>
              </button>
              
              <div style={{ flex: 1 }}></div>
              
              <button 
                className={`artwork-action-btn ${saved ? 'saved' : ''}`} 
                onClick={handleModalSave} 
                aria-label="Save"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  color: saved ? '#ffa502' : '#333',
                  fontSize: '1rem',
                  outline: 'none',
                  padding: 0
                }}
              >
                <Bookmark 
                  size={32} 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  fill={saved ? "currentColor" : "none"}
                />
              </button>
            </div>

            {artwork.tags && artwork.tags.trim() && (
              <div className="artwork-tags" style={{ marginTop: '0.8rem' }}>
                {artwork.tags.split(',').map((tag, index) => (
                  <span key={index} className="tag">#{tag.trim()}</span>
                ))}
              </div>
            )}
            
            {artwork.caption && <p className="artwork-caption" style={{ marginTop: '0.8rem' }}>{artwork.caption}</p>}

            <h5 style={{ marginTop: '1.5rem', marginBottom: '1rem', flexShrink: 0 }}>Comments ({comments.length})</h5>
            <div className="comments-list" style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
              {comments.length === 0 ? (
                <p style={{ color: '#888' }}>No comments yet. Be the first to comment!</p>
              ) : (
                comments.map(c => (
                  <div key={c.comment_id} className="comment-row" style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <img
                        src={c.profile_picture || 'https://via.placeholder.com/32?text=U'}
                        alt={c.username}
                        className="comment-avatar"
                        style={{ 
                          cursor: 'pointer', 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                        onClick={(e) => { e.stopPropagation(); onHide(); navigate(`/profile/${c.username}`); }}
                      />
                      <div style={{ flex: 1 }}>
                        <div className="comment-meta" style={{ marginBottom: '4px' }}>
                          <strong 
                            style={{ 
                              cursor: 'pointer',
                              fontWeight: '600'
                            }} 
                            onClick={(e) => { e.stopPropagation(); onHide(); navigate(`/profile/${c.username}`); }}
                          >
                            @{c.username}
                          </strong>
                          {' '}· <small style={{ color: '#888' }}>{new Date(c.created_at).toLocaleString()}</small>
                        </div>
                        <div className="comment-text" style={{ color: '#333', lineHeight: '1.4' }}>{c.comment_text}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="post-modal-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #eee', flexShrink: 0, background: '#FCFBE5' }}>
              <div className="comment-input-row" style={{ display: 'flex', gap: '0.5rem' }}>
                <Form.Control 
                  type="text" 
                  placeholder="Add a comment..." 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button 
                  className="comment-btn" 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim()}
                  style={{ 
                    background: '#4a6cf7',
                    border: 'none',
                    fontWeight: '600'
                  }}
                >
                  Comment
                </Button>
              </div>
            </div>

          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}