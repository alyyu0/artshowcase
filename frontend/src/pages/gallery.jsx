import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from "./navbar";

function Gallery() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUserClick = (userId) => {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const currentUserId = localStorage.getItem('userId');
    
    if (!isLoggedIn || !currentUserId) {
      alert('Please login or signup to view user profiles');
      navigate('/login');
      return;
    }
    
    navigate(`/profile/${userId}`);
    setSearchQuery('');
    setSearchResults([]);
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
                fontFamily: "'JosefinSans', sans-serif",
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
      </main>
    </div>
  );
}

export default Gallery;