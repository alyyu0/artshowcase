import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import NavigationBar from "./navbar";
import PostModal from '../components/PostModal';


function Home() {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [likedArtworks, setLikedArtworks] = useState(new Set());
  const [savedArtworks, setSavedArtworks] = useState(new Set());
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [artworkHashtags, setArtworkHashtags] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  // Fetch hashtags for artworks
  const fetchHashtagsForArtworks = async (artworkList) => {
    try {
      const hashtagPromises = artworkList.map(async (artwork) => {
        const response = await fetch(`http://localhost:5000/api/hashtags/artwork/${artwork.artwork_id}`);
        if (response.ok) {
          const data = await response.json();
          return { artworkId: artwork.artwork_id, hashtags: Array.isArray(data) ? data : [] };
        }
        return { artworkId: artwork.artwork_id, hashtags: [] };
      });
      const results = await Promise.all(hashtagPromises);
      const hashtagMap = {};
      results.forEach(({ artworkId, hashtags }) => {
        hashtagMap[artworkId] = hashtags;
      });
      setArtworkHashtags(hashtagMap);
    } catch (err) {
      console.error('Error fetching hashtags:', err);
    }
  };

  // Fetch followed artworks (exposed so other components can trigger a refresh)
  const fetchFollowedArtworks = async () => {
    if (!userId) {
      console.warn('fetchFollowedArtworks: no userId in localStorage');
      setArtworks([]);
      setIsLoading(false);
      return;
    }
    try {
      console.log('fetchFollowedArtworks: requesting feed for userId=', userId);
      const response = await fetch(`http://localhost:5000/api/artwork/followed/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const arr = Array.isArray(data) ? data : [];
        console.log('fetchFollowedArtworks: received', arr.length, 'items');
        // if API returned items, use them
        if (arr.length > 0) {
          // client-side fallback sort by created_at (newest first)
          arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setArtworks(arr);
          fetchHashtagsForArtworks(arr);
        } else {
          // Server returned no feed items — fallback to fetching artworks of users this user follows
          try {
            const followingRes = await fetch(`http://localhost:5000/api/follows/following/${userId}`);
            if (followingRes.ok) {
              const followingList = await followingRes.json();
              // followingList is array of user objects with user_id; map to IDs
              const followIds = (Array.isArray(followingList) ? followingList.map(u => u.user_id || u.userId || u.id) : []).filter(Boolean);
              if (followIds.length > 0) {
                // fetch artworks for all followed users in parallel
                const artworkPromises = followIds.map(id => fetch(`http://localhost:5000/api/artwork/user/${id}`).then(r => r.ok ? r.json() : []));
                const artsArrays = await Promise.all(artworkPromises);
                const merged = [].concat(...artsArrays).filter(Boolean);
                // normalize and dedupe by artwork_id
                const map = new Map();
                merged.forEach(a => { if (a && a.artwork_id) map.set(a.artwork_id, a); });
                const deduped = Array.from(map.values());
                deduped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setArtworks(deduped);
                fetchHashtagsForArtworks(deduped);
              } else {
                // still no followed users
                setArtworks([]);
              }
            } else {
              setArtworks([]);
            }
          } catch (err) {
            console.error('Error fetching artworks from followed users fallback:', err);
            setArtworks([]);
          }
        }
      }
      // fetch likes/saves
      const likesRes = await fetch(`http://localhost:5000/api/likes/user/${userId}`);
      if (likesRes.ok) {
        const likesData = await likesRes.json();
        setLikedArtworks(new Set((likesData || []).map(a => a.artwork_id)));
      }
      const savesRes = await fetch(`http://localhost:5000/api/saves/saved/${userId}`);
      if (savesRes.ok) {
        const savesData = await savesRes.json();
        setSavedArtworks(new Set((savesData || []).map(a => a.artwork_id)));
      }
    } catch (err) {
      console.error('Error fetching followed artworks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowedArtworks();

    // Listen for follow status changes to refresh or optimistically update the feed
    const handler = (e) => {
      try {
        const detail = e && e.detail ? e.detail : {};
        const { followerId, followingId, isFollowing, artworks } = detail;

        // If artworks were provided (optimistic), merge them into the feed
        if (Array.isArray(artworks) && artworks.length > 0) {
          setArtworks(prev => {
            const map = new Map();
            // add existing
            (prev || []).forEach(a => map.set(a.artwork_id, a));
            // add new ones
            artworks.forEach(a => map.set(a.artwork_id, a));
            const merged = Array.from(map.values());
            // sort by created_at desc
            merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return merged;
          });
          return;
        }

        // If unfollow happened, remove that user's artworks from feed
        if (followingId && isFollowing === false) {
          setArtworks(prev => (prev || []).filter(a => String(a.user_id) !== String(followingId)));
          return;
        }

        // Otherwise fallback to refetching feed
        fetchFollowedArtworks();
      } catch (err) {
        console.error('follow-status-changed handler error:', err);
        fetchFollowedArtworks();
      }
    };
    window.addEventListener('follow-status-changed', handler);
    return () => window.removeEventListener('follow-status-changed', handler);
  }, [userId]);

  const openPostModal = (artwork) => {
    setSelectedArtwork(artwork);
    setShowPostModal(true);
  };

  const handleUserClick = (username) => {
    if (!localStorage.getItem('loggedIn')) {
      alert('Please login or signup to view user profiles');
      navigate('/login');
      return;
    }
    navigate(`/profile/${username}`);
  };

  const handleLike = async (artworkId) => {
    if (!userId) {
      alert('Please login to like artworks');
      navigate('/login');
      return;
    }
    try {
      const isLiked = likedArtworks.has(artworkId);
      const endpoint = isLiked ? '/api/likes/unlike' : '/api/likes/like';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, artwork_id: artworkId })
      });
      if (response.ok) {
        setLikedArtworks(prev => {
          const next = new Set(prev);
          if (isLiked) next.delete(artworkId); else next.add(artworkId);
          return next;
        });
        setArtworks(prev => prev.map(a => a.artwork_id === artworkId ? { ...a, like_count: (Number(a.like_count)||0) + (isLiked ? -1 : 1) } : a));
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleSave = async (artworkId) => {
    if (!userId) {
      alert('Please login to save artworks');
      navigate('/login');
      return;
    }
    try {
      const isSaved = savedArtworks.has(artworkId);
      const endpoint = isSaved ? '/api/saves/unsave' : '/api/saves/save';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, artwork_id: artworkId })
      });
      if (response.ok) {
        setSavedArtworks(prev => {
          const next = new Set(prev);
          if (isSaved) next.delete(artworkId); else next.add(artworkId);
          return next;
        });
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  return (
    <div className="cream-background">
      <NavigationBar />
      <main className="gallery-main">
        <section className="gallery-header">
          <h2 className="gallery-title" style={{ color: '#9cabd6' }}>Discover Art</h2>
          <p className="gallery-subtitle">Explore amazing artworks from talented artists</p>
        </section>
        
        <section className="gallery-grid">
          {isLoading ? (
            // Loading skeleton cards
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="artwork-card loading">
                <div className="artwork-header">
                  <div className="artwork-user-avatar" style={{ backgroundColor: '#f0f0f0' }}></div>
                  <span className="artwork-username" style={{ backgroundColor: '#f0f0f0', width: '100px', height: '20px', display: 'block', borderRadius: '4px' }}></span>
                </div>
                <div className="artwork-image-container" style={{ backgroundColor: '#f5f5f5' }}></div>
                <div className="artwork-info">
                  <h3 className="artwork-title" style={{ backgroundColor: '#f0f0f0', width: '60%', height: '24px', borderRadius: '4px' }}></h3>
                  <div className="artwork-tags">
                    <span className="tag" style={{ backgroundColor: '#f0f0f0', width: '80px', height: '20px', display: 'block', borderRadius: '10px' }}></span>
                  </div>
                  <div className="artwork-stats">
                    <div className="stat" style={{ backgroundColor: '#f0f0f0', width: '40px', height: '24px', borderRadius: '4px' }}></div>
                    <div className="stat" style={{ backgroundColor: '#f0f0f0', width: '40px', height: '24px', borderRadius: '4px' }}></div>
                    <div className="spacer"></div>
                    <div className="stat" style={{ backgroundColor: '#f0f0f0', width: '24px', height: '24px', borderRadius: '4px' }}></div>
                  </div>
                </div>
              </div>
            ))
          ) : artworks.length > 0 ? (
            artworks.map((artwork) => (
              <div key={artwork.artwork_id} className="artwork-card" onClick={() => openPostModal(artwork)}>
                <div className="artwork-header">
                  <img
                    src={artwork.profile_picture || 'https://via.placeholder.com/32?text=User'}
                    alt={artwork.username}
                    className="artwork-user-avatar"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/32?text=User'; }}
                    onClick={(e) => { e.stopPropagation(); handleUserClick(artwork.username); }}
                    style={{ cursor: 'pointer' }}
                  />
                  <span
                    className="artwork-username"
                    onClick={(e) => { e.stopPropagation(); handleUserClick(artwork.username); }}
                    style={{ cursor: 'pointer' }}
                  >@{artwork.username}</span>
                </div>
                <div className="artwork-image-container">
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="artwork-image"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found'; }}
                  />
                  <div className="artwork-overlay">
                    <button
                      className={`artwork-action-btn ${likedArtworks.has(artwork.artwork_id) ? 'liked' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleLike(artwork.artwork_id); }}
                      aria-label="Like"
                      style={{ marginRight: '0.2rem' }}
                    >
                      <Heart size={24} strokeWidth={2} stroke="currentColor" className="overlay-icon" />
                    </button>
                    <button className="artwork-action-btn" style={{ marginRight: '0.2rem' }} onClick={(e) => { e.stopPropagation(); openPostModal(artwork); }} aria-label="Comments">
                      <MessageCircle size={24} strokeWidth={2} stroke="currentColor" className="overlay-icon" />
                    </button>
                    <button
                      className={`artwork-action-btn ${savedArtworks.has(artwork.artwork_id) ? 'saved' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleSave(artwork.artwork_id); }}
                      aria-label="Save"
                    >
                      <Bookmark size={24} strokeWidth={2} stroke="currentColor" className="overlay-icon" />
                    </button>
                  </div>
                </div>
                <div className="artwork-info">
                  <h3 className="artwork-title">{artwork.title}</h3>
                  <div className="artwork-tags">
                    {artworkHashtags[artwork.artwork_id] && artworkHashtags[artwork.artwork_id].length > 0 ? (
                      artworkHashtags[artwork.artwork_id].map((hashtag) => (
                        <span key={hashtag.hashtag_id} className="tag">#{hashtag.tag}</span>
                      ))
                    ) : (
                      <span className="tag" style={{ opacity: 0.5 }}>No tags</span>
                    )}
                  </div>
                  {artwork.caption && (
                    <p className="artwork-caption single-line-caption">{artwork.caption}</p>
                  )}
                  <div className="artwork-stats">
                    <div className={`stat clickable`} onClick={(e) => { e.stopPropagation(); handleLike(artwork.artwork_id); }}>
                      <Heart size={24} strokeWidth={2} stroke="currentColor" className={`card-icon ${likedArtworks.has(artwork.artwork_id) ? 'liked' : ''}`} /> <span className="count">{artwork.like_count ?? 0}</span>
                    </div>
                    <div className="stat">
                      <MessageCircle size={24} strokeWidth={2} stroke="currentColor" className="card-icon" /> <span className="count">{artwork.comment_count ?? 0}</span>
                    </div>
                    <div className="spacer" />
                    <div className={`stat clickable`} onClick={(e) => { e.stopPropagation(); handleSave(artwork.artwork_id); }}>
                      <Bookmark size={24} strokeWidth={2} stroke="currentColor" className={`card-icon ${savedArtworks.has(artwork.artwork_id) ? 'saved' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-gallery-state">
              <div className="empty-gallery-icon">🎨</div>
              <h3>Your creative feed is waiting</h3>
              <p>Follow artists to see their amazing artworks here</p>
              <button 
                className="blue-btn"
                onClick={() => navigate('/explore')}
                style={{ maxWidth: '200px', margin: '0 auto' }}
              >
                Discover Artists
              </button>
            </div>
          )}
        </section>
        <PostModal
          show={showPostModal}
          onHide={() => { setShowPostModal(false); }}
          artwork={selectedArtwork}
          onCommentAdded={(artworkId) => {
            setArtworks(prev => prev.map(a => a.artwork_id === artworkId ? { ...a, comment_count: (Number(a.comment_count)||0) + 1 } : a));
          }}
          onLikeToggled={(artworkId, liked) => {
            setLikedArtworks(prev => {
              const next = new Set(prev);
              if (liked) next.add(artworkId); else next.delete(artworkId);
              return next;
            });
            setArtworks(prev => prev.map(a => a.artwork_id === artworkId ? { ...a, like_count: (Number(a.like_count)||0) + (liked ? 1 : -1) } : a));
          }}
        />
      </main>
    </div>
  );
}

export default Home;