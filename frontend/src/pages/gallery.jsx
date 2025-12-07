import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import NavigationBar from "./navbar";
// consolidated styles moved into ../App.css

function Gallery() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allArtworks, setAllArtworks] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [likedArtworks, setLikedArtworks] = useState(new Set());
  const [savedArtworks, setSavedArtworks] = useState(new Set());

  const userId = localStorage.getItem('userId');

  // Fetch all artworks on mount
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/artwork/all');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched artworks:', data);
          setAllArtworks(Array.isArray(data) ? data : []);
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
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(`http://localhost:5000/api/search/users/${encodeURIComponent(searchQuery)}`);
        
        if (response.ok) {
          const data = await response.json();
          setSearchResults(Array.isArray(data) ? data : []);
        } else {
          setSearchResults([]);
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

  const handleUserClick = (userId) => {
    if (!localStorage.getItem('loggedIn')) {
      alert('Please login or signup to view user profiles');
      navigate('/login');
      return;
    }
    
    navigate(`/profile/${userId}`);
    setSearchQuery('');
    setSearchResults([]);
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
                fontSize: '0.85rem',
                border: '2px solid rgba(138,146,203,0.3)',
                borderRadius: '12px',
                background: '#FFFFFF',
                color: '#333',
                
              }}
            />
            
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
                {searchResults.map((user) => (
                  <div
                    key={user.user_id}
                    onClick={() => handleUserClick(user.user_id)}
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
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Artworks Grid */}
        <section className="gallery-grid">
          {allArtworks.length > 0 ? (
            allArtworks.map((artwork) => (
              <div key={artwork.artwork_id} className="artwork-card">
                {/* Top header section (avatar + username) */}
                <div className="artwork-header">
                  <img
                    src={artwork.profile_picture || 'https://via.placeholder.com/32?text=User'}
                    alt={artwork.username}
                    className="artwork-user-avatar"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/32?text=User';
                    }}
                  />
                  <span className="artwork-username">@{artwork.username}</span>
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
                      className="artwork-action-btn"
                      onClick={() => handleLike(artwork.artwork_id)}
                      style={{ color: likedArtworks.has(artwork.artwork_id) ? '#e74c3c' : '#fff' }}
                    >
                      <Heart size={20} fill={likedArtworks.has(artwork.artwork_id) ? '#e74c3c' : 'none'} />
                    </button>
                    <button className="artwork-action-btn">
                      <MessageCircle size={20} />
                    </button>
                    <button 
                      className="artwork-action-btn"
                      onClick={() => handleSave(artwork.artwork_id)}
                      style={{ color: savedArtworks.has(artwork.artwork_id) ? '#f39c12' : '#fff' }}
                    >
                      <Bookmark size={20} fill={savedArtworks.has(artwork.artwork_id) ? '#f39c12' : 'none'} />
                    </button>
                  </div>
                </div>

                <div className="artwork-info">
                  <h3 className="artwork-title">{artwork.title}</h3>
                  {artwork.caption && (
                    <p className="artwork-caption">{artwork.caption}</p>
                  )}

                  <div className="artwork-tags">
                    <span className="tag">Digital Art</span>
                  </div>

                  <div className="artwork-stats">
                    <div className="stat">
                      <Heart size={16} /> <span>0</span>
                    </div>
                    <div className="stat">
                      <MessageCircle size={16} /> <span>0</span>
                    </div>
                    <div className="spacer" />
                    <div className="stat">
                      <Bookmark size={16} />
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
      </main>
    </div>
  );
}

export default Gallery;