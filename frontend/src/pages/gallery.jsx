import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, Search } from 'lucide-react';
import NavigationBar from "./navbar";
import PostModal from '../components/PostModal';
// consolidated styles moved into ../App.css

function Gallery() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isHashtagSearch, setIsHashtagSearch] = useState(false);
  const [hashtagMode, setHashtagMode] = useState('tags'); // 'tags' | 'artworks'
  const [allArtworks, setAllArtworks] = useState([]);
  const [originalArtworks, setOriginalArtworks] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [likedArtworks, setLikedArtworks] = useState(new Set());
  const [savedArtworks, setSavedArtworks] = useState(new Set());
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const userId = localStorage.getItem('userId');

  // Fetch all artworks on mount
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/artwork/all');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched artworks:', data);
          const list = Array.isArray(data) ? data : [];
          setAllArtworks(list);
          setOriginalArtworks(list);
          // fetch user likes/saves
          if (userId) {
            try {
              const likesRes = await fetch(`http://localhost:5000/api/likes/user/${userId}`);
              if (likesRes.ok) {
                const likesData = await likesRes.json();
                const likedSet = new Set((likesData || []).map(a => a.artwork_id));
                setLikedArtworks(likedSet);
              }

              const savesRes = await fetch(`http://localhost:5000/api/saves/saved/${userId}`);
              if (savesRes.ok) {
                const savesData = await savesRes.json();
                const savedSet = new Set((savesData || []).map(a => a.artwork_id));
                setSavedArtworks(savedSet);
              }
            } catch (err) {
              console.error('Error fetching likes/saves', err);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching artworks:', err);
      }
    };
    
    fetchArtworks();
  }, []);

  // Debounced search handler
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      // restore original artworks when search cleared
      setAllArtworks(Array.isArray(originalArtworks) ? originalArtworks : []);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const q = searchQuery.trim();
        // If search starts with '#', treat as hashtag search and fetch matching tags
        if (q.startsWith('#')) {
          setIsHashtagSearch(true);
          setHashtagMode('tags');
          const tagQuery = q.slice(1);
          const response = await fetch(`http://localhost:5000/api/search/hashtags/search/${encodeURIComponent(tagQuery)}`);
          if (response.ok) {
            const data = await response.json();
            // backend returns hashtag rows: { hashtag_id, tag }
            setSearchResults(Array.isArray(data) ? data : []);
          } else {
            setSearchResults([]);
          }
        } else {
          setIsHashtagSearch(false);
          const response = await fetch(`http://localhost:5000/api/search/users/${encodeURIComponent(q)}`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(Array.isArray(data) ? data : []);
          } else {
            setSearchResults([]);
          }
        }
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // When a hashtag is selected from suggestions, fetch artworks for that tag
  const handleTagClick = async (tag) => {
    try {
      setIsSearching(true);
      const response = await fetch(`http://localhost:5000/api/search/hashtags/${encodeURIComponent(tag)}`);
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        setHashtagMode('artworks');
        setSearchResults([]);
        setSearchQuery('#' + tag);
        // show artworks in main grid
        setAllArtworks(list);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error fetching artworks for tag', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserClick = (username) => {
    if (!localStorage.getItem('loggedIn')) {
      alert('Please login or signup to view user profiles');
      navigate('/login');
      return;
    }

    navigate(`/profile/${username}`);
    setSearchQuery('');
    setSearchResults([]);
  };

  const openPostModal = (artwork) => {
    setSelectedArtwork(artwork);
    setShowPostModal(true);
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
        const newLiked = new Set(likedArtworks);
        if (isLiked) {
          newLiked.delete(artworkId);
        } else {
          newLiked.add(artworkId);
        }
        setLikedArtworks(newLiked);
        // update like count locally for immediate feedback
        setAllArtworks(prev => prev.map(a => {
          if (a.artwork_id === artworkId) {
            const current = Number(a.like_count || 0);
            return { ...a, like_count: isLiked ? Math.max(0, current - 1) : current + 1 };
          }
          return a;
        }));
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
        const newSaved = new Set(savedArtworks);
        if (isSaved) {
          newSaved.delete(artworkId);
        } else {
          newSaved.add(artworkId);
        }
        setSavedArtworks(newSaved);
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
          <h2 className="gallery-title">Art Gallery</h2>
          <p className="gallery-subtitle">Search by hashtags or usernames</p>

            <div className="gallery-search" style={{ position: 'relative', width: '100%' }}>
            <input
              className="form-control"
              type="text"
              aria-label="Search artworks by hashtag or username"
              placeholder="Search by hashtag or username (e.g., #digitalart or @artist)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                paddingLeft: '2.6rem',
                fontSize: '0.85rem',
                border: '2px solid rgba(138,146,203,0.3)',
                borderRadius: '12px',
                background: '#FFFFFF',
                color: '#333',
                
              }}
            />
            {/* magnifying glass icon */}
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-45%)', pointerEvents: 'none', color: '#9aa0a6', display: 'flex', alignItems: 'center' }}>
              <Search size={16} />
            </div>
            
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderTop: 'none',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                marginTop: '0.25rem',
                borderRadius: '0 0 12px 12px'
              }}>
                {isHashtagSearch ? (
                  // If searchResults are hashtag rows, render tag suggestions; otherwise render artworks
                  searchResults.length > 0 && searchResults[0].tag ? (
                    searchResults.map((h) => (
                      <div
                        key={h.hashtag_id}
                        onClick={() => { setSearchQuery('#' + h.tag); handleTagClick(h.tag); }}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                          #{h.tag.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>#{h.tag}</span>
                          <small style={{ color: '#666' }}>Hashtag</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Render artworks matching the hashtag
                    searchResults.map((art) => (
                      <div
                        key={art.artwork_id}
                        onClick={() => openPostModal(art)}
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <img
                          src={art.image_url}
                          alt={art.title}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=Img'; }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>{art.title || 'Untitled'}</span>
                          <small style={{ color: '#666' }}>@{art.username}</small>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  // Render user search results
                  searchResults.map((user) => (
                    <div
                      key={user.user_id}
                      onClick={() => handleUserClick(user.username)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt={user.username}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/32?text=User';
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: '#666'
                        }}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                        <span style={{ fontWeight: '500', color: '#333' }}>@{user.username}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        {/* Artworks Grid */}
        <section className="gallery-grid">
          {allArtworks.length > 0 ? (
            allArtworks.map((artwork) => (
              <div key={artwork.artwork_id} className="artwork-card" onClick={() => openPostModal(artwork)}>
                {/* Top header section (avatar + username) */}
                <div className="artwork-header">
                  <img
                    src={artwork.profile_picture || 'https://via.placeholder.com/32?text=User'}
                    alt={artwork.username}
                    className="artwork-user-avatar"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/32?text=User';
                    }}
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
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                    }}
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
                    <span className="tag">Digital Art</span>
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
            <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '2rem', color: '#999' }}>
              <p>No artworks found. Try uploading some art!</p>
            </div>
          )}
        </section>
      <PostModal
        show={showPostModal}
        onHide={() => { setShowPostModal(false); }}
        artwork={selectedArtwork}
        onCommentAdded={(artworkId) => {
          setAllArtworks(prev => prev.map(a => a.artwork_id === artworkId ? { ...a, comment_count: (Number(a.comment_count)||0) + 1 } : a));
        }}
        onLikeToggled={(artworkId, liked) => {
          // update liked set
          setLikedArtworks(prev => {
            const next = new Set(prev);
            if (liked) next.add(artworkId); else next.delete(artworkId);
            return next;
          });
          // update counts
          setAllArtworks(prev => prev.map(a => a.artwork_id === artworkId ? { ...a, like_count: (Number(a.like_count)||0) + (liked ? 1 : -1) } : a));
        }}
      />
      </main>
    </div>
  );
}

export default Gallery;