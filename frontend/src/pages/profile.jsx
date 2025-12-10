import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Image, Heart, Bookmark, MessageCircle } from 'lucide-react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import NavigationBar from './navbar';
import PostModal from '../components/PostModal';

const API_BASE = 'http://localhost:5000/api';

function Profile() {
  const navigate = useNavigate();
  const { username: urlUsername } = useParams();

  const [user, setUser] = useState(null);
  const [profileUserId, setProfileUserId] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('artworks');
  const [savedArtworks, setSavedArtworks] = useState([]);
  const [likedArtworks, setLikedArtworks] = useState(new Set());
  const [likedList, setLikedList] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editAvatarFile, setEditAvatarFile] = useState(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const loggedInId = localStorage.getItem('userId');
  const loggedInUsername = localStorage.getItem('username');

  // If no URL username provided and user is logged in, show their own profile
  const rawUsername = (urlUsername || loggedInUsername || '');
  const profileUsername = rawUsername.startsWith('@') ? rawUsername.slice(1) : rawUsername;
  
  console.log('Profile Debug:', { urlUsername, loggedInUsername, profileUsername, loggedInId });

  const isOwnProfile = Boolean(
    (loggedInUsername && profileUsername && loggedInUsername === profileUsername) ||
    (loggedInId && profileUserId && String(loggedInId) === String(profileUserId))
  );

  // Fetch user by username
  useEffect(() => {
    if (!profileUsername) return;

    const fetchUser = async () => {
      try {
        console.log('Fetching user:', profileUsername);
        const res = await fetch(`${API_BASE}/users/by-username/${encodeURIComponent(profileUsername)}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setProfileUserId(data.user_id || data.id);
          console.log('User loaded:', data);
        } else {
          setUser(null);
          setProfileUserId(null);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setUser(null);
        setProfileUserId(null);
      }
    };

    fetchUser();
  }, [profileUsername]);

  // Fetch artworks for profile user
  useEffect(() => {
    if (!profileUserId) return;

    const fetchArtworks = async () => {
      try {
        console.log('Fetching artworks for user:', profileUserId);
        const res = await fetch(`${API_BASE}/artwork/user/${profileUserId}`);
        if (res.ok) {
          const data = await res.json();
          setArtworks(Array.isArray(data) ? data : []);
          console.log('Artworks loaded:', data);
        } else {
          setArtworks([]);
        }
      } catch (err) {
        console.error('Error fetching artworks:', err);
        setArtworks([]);
      }
    };

    fetchArtworks();
  }, [profileUserId]);

  // Fetch followers/following
  useEffect(() => {
    if (!profileUserId) return;

    (async () => {
      try {
        const followersRes = await fetch(`${API_BASE}/follows/followers/${profileUserId}`);
        const followersData = followersRes.ok ? await followersRes.json() : [];
        setFollowersCount(Array.isArray(followersData) ? followersData.length : 0);

        const followingRes = await fetch(`${API_BASE}/follows/following/${profileUserId}`);
        const followingData = followingRes.ok ? await followingRes.json() : [];
        setFollowingCount(Array.isArray(followingData) ? followingData.length : 0);

        if (loggedInId && profileUserId && loggedInId !== profileUserId) {
          const checkRes = await fetch(`${API_BASE}/follows/check/${loggedInId}/${profileUserId}`);
          const checkData = checkRes.ok ? await checkRes.json() : { isFollowing: false };
          setIsFollowing(!!checkData.isFollowing);
        }
      } catch (err) {
        console.error('Error fetching followers:', err);
      }
    })();
  }, [profileUserId, loggedInId]);

  // Fetch saved artworks (only if own profile)
  useEffect(() => {
    if (!isOwnProfile || !profileUserId) {
      setSavedArtworks([]);
      return;
    }

    const fetchSaved = async () => {
      try {
        console.log('Fetching saved artworks for user:', profileUserId);
        const res = await fetch(`${API_BASE}/saves/saved/${profileUserId}`);
        if (res.ok) {
          const data = await res.json();
          setSavedArtworks(Array.isArray(data) ? data : []);
          console.log('Saved artworks:', data);
        } else {
          setSavedArtworks([]);
        }
      } catch (err) {
        console.error('Error fetching saved artworks:', err);
        setSavedArtworks([]);
      }
    };

    fetchSaved();
  }, [isOwnProfile, profileUserId]);

  // Fetch liked artworks (only if own profile)
  useEffect(() => {
    if (!isOwnProfile || !profileUserId) {
      setLikedList([]);
      setLikedArtworks(new Set());
      return;
    }

    const fetchLiked = async () => {
      try {
        console.log('Fetching liked artworks for user:', profileUserId);
        const res = await fetch(`${API_BASE}/likes/user/${profileUserId}`);
        if (res.ok) {
          const data = await res.json();
          const liked = Array.isArray(data) ? data : [];
          setLikedList(liked);
          setLikedArtworks(new Set(liked.map(a => a.artwork_id)));
          console.log('Liked artworks:', liked);
        } else {
          setLikedList([]);
        }
      } catch (err) {
        console.error('Error fetching liked artworks:', err);
        setLikedList([]);
      }
    };

    fetchLiked();
  }, [isOwnProfile, profileUserId]);

  // Like handler
  const handleLike = async (artworkId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please login to like artworks');
      navigate('/login');
      return;
    }

    try {
      const isLiked = likedArtworks.has(artworkId);
      const endpoint = isLiked ? '/likes/unlike' : '/likes/like';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, artwork_id: artworkId })
      });

      if (res.ok) {
        const next = new Set(likedArtworks);
        if (isLiked) next.delete(artworkId);
        else next.add(artworkId);
        setLikedArtworks(next);
        
        // Update like counts
        if (activeTab === 'artworks') {
          setArtworks(prev => prev.map(a => 
            a.artwork_id === artworkId ? { 
              ...a, 
              like_count: (Number(a.like_count) || 0) + (isLiked ? -1 : 1) 
            } : a
          ));
        } else if (activeTab === 'likes' && isLiked) {
          // Remove from liked list if unliking
          setLikedList(prev => prev.filter(a => a.artwork_id !== artworkId));
        } else if (activeTab === 'saved') {
          setSavedArtworks(prev => prev.map(a => 
            a.artwork_id === artworkId ? { 
              ...a, 
              like_count: (Number(a.like_count) || 0) + (isLiked ? -1 : 1) 
            } : a
          ));
        }
      }
    } catch (err) {
      console.error('Error liking artwork:', err);
    }
  };

  // Save handler
  const handleSave = async (artworkId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please login to save artworks');
      navigate('/login');
      return;
    }

    try {
      const isSaved = savedArtworks.some(a => a.artwork_id === artworkId);
      const endpoint = isSaved ? '/saves/unsave' : '/saves/save';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, artwork_id: artworkId })
      });

      if (res.ok) {
        if (isSaved) {
          setSavedArtworks(prev => prev.filter(a => a.artwork_id !== artworkId));
        } else {
          const found = artworks.find(a => a.artwork_id === artworkId);
          if (found) {
            setSavedArtworks(prev => [found, ...prev]);
          } else {
            // Also check likedList for the artwork
            const likedFound = likedList.find(a => a.artwork_id === artworkId);
            if (likedFound) setSavedArtworks(prev => [likedFound, ...prev]);
          }
        }
      }
    } catch (err) {
      console.error('Error saving artwork:', err);
    }
  };

  // Get current artworks based on active tab
  const getCurrentArtworks = () => {
    switch (activeTab) {
      case 'artworks': return artworks;
      case 'likes': return likedList;
      case 'saved': return savedArtworks;
      default: return artworks;
    }
  };

  const openPostModal = (artwork) => {
    setSelectedArtwork(artwork);
    setShowPostModal(true);
  };

  const handleEdit = () => {
    if (!isOwnProfile || !user) return;
    setEditBio(user.bio || '');
    setEditAvatarPreview(user.profile_picture || '');
    setEditAvatarFile(null);
    setShowEditModal(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditAvatarPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileUserId) return;
    try {
      setSavingEdit(true);
      
      const formData = new FormData();
      formData.append('bio', editBio);
      if (editAvatarFile) {
        formData.append('profile_picture', editAvatarFile);
      }

      const res = await fetch(`${API_BASE}/users/${profileUserId}`, {
        method: 'PUT',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ 
          ...prev, 
          bio: data.user.bio, 
          profile_picture: data.user.profile_picture 
        }));
        
        // Update localStorage if it's the logged-in user
        if (String(loggedInId) === String(profileUserId)) {
          localStorage.setItem('profileImage', data.user.profile_picture);
        }
        
        setShowEditModal(false);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleFollowToggle = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }
    if (!profileUserId || userId === profileUserId) return;

    try {
      const endpoint = isFollowing ? '/follows/unfollow' : '/follows/follow';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ follower_id: userId, following_id: profileUserId })
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
        setFollowersCount(prev => isFollowing ? Math.max(0, prev - 1) : prev + 1);
      }
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleUserClick = (username) => {
    if (!localStorage.getItem('loggedIn')) {
      alert('Please login or signup to view user profiles');
      navigate('/login');
      return;
    }
    navigate(`/profile/${username}`);
  };

  const avatar = user?.profile_picture || null;

  return (
    <div className="cream-background">
      <NavigationBar />
      <main className="gallery-main" style={{ paddingTop: '2rem' }}>
        {/* Profile Header */}
        <section style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            {avatar ? (
              <img 
                src={avatar} 
                alt="profile" 
                style={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: '3px solid #fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }} 
              />
            ) : (
              <div style={{ 
                width: 120, 
                height: 120, 
                borderRadius: '50%', 
                background: '#fff', 
                border: '3px solid #eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '2rem',
                color: '#E89B96'
              }}>
                {user?.username?.charAt(0)?.toUpperCase() || profileUsername?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <h3 style={{ margin: '0.5rem 0', fontSize: '1.5rem', fontWeight: 600 }}>
            {user?.username ? `@${user.username}` : (profileUsername ? `@${profileUsername}` : 'User not found')}
          </h3>
          <p style={{ color: '#666', maxWidth: '500px', margin: '0 auto' }}>
            {user?.bio || 'No bio yet'}
          </p>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '2rem', 
            marginTop: '1rem',
            fontSize: '0.95rem'
          }}>
            <div><strong>{artworks.length}</strong> artworks</div>
            <div><strong>{followersCount}</strong> followers</div>
            <div><strong>{followingCount}</strong> following</div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            {isOwnProfile ? (
              <button 
                className="blue-btn" 
                onClick={handleEdit} 
                style={{ 
                  padding: '0.5rem 1.5rem', 
                  fontSize: '0.85rem', 
                  width: 'auto',
                  borderRadius: '20px'
                }}
              >
                Edit Profile
              </button>
            ) : (
              <button 
                className={`blue-btn ${isFollowing ? 'following' : ''}`}
                onClick={handleFollowToggle} 
                style={{ 
                  padding: '0.5rem 1.5rem', 
                  fontSize: '0.85rem', 
                  width: 'auto',
                  borderRadius: '20px',
                  backgroundColor: isFollowing ? '#6c757d' : '#8a92cb'
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Tabs */}
          <div style={{ 
            marginTop: '2rem', 
            borderBottom: '1px solid #e0e0e0',
            maxWidth: '600px',
            margin: '2rem auto 0'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '3rem'
            }}>
              <button 
                onClick={() => setActiveTab('artworks')} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: '0.75rem 0', 
                  cursor: 'pointer', 
                  fontWeight: activeTab === 'artworks' ? 600 : 400, 
                  color: activeTab === 'artworks' ? '#E89B96' : '#555', 
                  borderBottom: activeTab === 'artworks' ? '3px solid #E89B96' : 'none', 
                  marginBottom: '-1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Image size={18} /> Artworks
              </button>
              {isOwnProfile && (
                <>
                  <button 
                    onClick={() => setActiveTab('likes')} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: '0.75rem 0', 
                      cursor: 'pointer', 
                      fontWeight: activeTab === 'likes' ? 600 : 400, 
                      color: activeTab === 'likes' ? '#E89B96' : '#555', 
                      borderBottom: activeTab === 'likes' ? '3px solid #E89B96' : 'none', 
                      marginBottom: '-1px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Heart size={18} /> Likes ({likedList.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('saved')} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: '0.75rem 0', 
                      cursor: 'pointer', 
                      fontWeight: activeTab === 'saved' ? 600 : 400, 
                      color: activeTab === 'saved' ? '#E89B96' : '#555', 
                      borderBottom: activeTab === 'saved' ? '3px solid #E89B96' : 'none', 
                      marginBottom: '-1px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Bookmark size={18} /> Saved ({savedArtworks.length})
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Artworks Grid (Same as Gallery) */}
        <section className="gallery-grid" style={{ padding: '2rem 1rem' }}>
          {getCurrentArtworks().length > 0 ? (
            getCurrentArtworks().map((artwork) => (
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
                  >
                    @{artwork.username}
                  </span>
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
                    <button 
                      className="artwork-action-btn" 
                      style={{ marginRight: '0.2rem' }} 
                      onClick={(e) => { e.stopPropagation(); openPostModal(artwork); }} 
                      aria-label="Comments"
                    >
                      <MessageCircle size={24} strokeWidth={2} stroke="currentColor" className="overlay-icon" />
                    </button>
                    {isOwnProfile && (
                      <button
                        className={`artwork-action-btn ${savedArtworks.some(a => a.artwork_id === artwork.artwork_id) ? 'saved' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleSave(artwork.artwork_id); }}
                        aria-label="Save"
                      >
                        <Bookmark size={24} strokeWidth={2} stroke="currentColor" className="overlay-icon" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="artwork-info">
                  <h3 className="artwork-title">{artwork.title}</h3>
                  <div className="artwork-tags">
                    {artwork.tags && artwork.tags.split(',').slice(0, 2).map((tag, index) => (
                      <span key={index} className="tag">#{tag.trim()}</span>
                    ))}
                    {(!artwork.tags || artwork.tags.trim() === '') && (
                      <span className="tag">Artwork</span>
                    )}
                  </div>
                  {artwork.caption && (
                    <p className="artwork-caption single-line-caption">{artwork.caption}</p>
                  )}
                  <div className="artwork-stats">
                    <div className={`stat clickable`} onClick={(e) => { e.stopPropagation(); handleLike(artwork.artwork_id); }}>
                      <Heart size={24} strokeWidth={2} stroke="currentColor" className={`card-icon ${likedArtworks.has(artwork.artwork_id) ? 'liked' : ''}`} /> 
                      <span className="count">{artwork.like_count ?? 0}</span>
                    </div>
                    <div className="stat" onClick={(e) => { e.stopPropagation(); openPostModal(artwork); }}>
                      <MessageCircle size={24} strokeWidth={2} stroke="currentColor" className="card-icon" /> 
                      <span className="count">{artwork.comment_count ?? 0}</span>
                    </div>
                    <div className="spacer" />
                    {isOwnProfile && (
                      <div className={`stat clickable`} onClick={(e) => { e.stopPropagation(); handleSave(artwork.artwork_id); }}>
                        <Bookmark size={24} strokeWidth={2} stroke="currentColor" className={`card-icon ${savedArtworks.some(a => a.artwork_id === artwork.artwork_id) ? 'saved' : ''}`} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              gridColumn: '1/-1', 
              padding: '3rem', 
              color: '#999' 
            }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1rem',
                color: '#e0e0e0'
              }}>
                {activeTab === 'artworks' && '🎨'}
                {activeTab === 'likes' && '❤️'}
                {activeTab === 'saved' && '📌'}
              </div>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                {activeTab === 'artworks' && 'No artworks yet'}
                {activeTab === 'likes' && 'No likes yet'}
                {activeTab === 'saved' && 'No saved artworks yet'}
              </p>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                {activeTab === 'artworks' && 'Start creating and sharing your artwork!'}
                {activeTab === 'likes' && 'Like some artworks to see them here'}
                {activeTab === 'saved' && 'Save artworks to view them later'}
              </p>
            </div>
          )}
        </section>

        <PostModal
          show={showPostModal}
          onHide={() => setShowPostModal(false)}
          artwork={selectedArtwork}
          onCommentAdded={(artworkId) => {
            // Update comment counts
            if (activeTab === 'artworks') {
              setArtworks(prev => prev.map(a => 
                a.artwork_id === artworkId ? { ...a, comment_count: (Number(a.comment_count)||0) + 1 } : a
              ));
            } else if (activeTab === 'likes') {
              setLikedList(prev => prev.map(a => 
                a.artwork_id === artworkId ? { ...a, comment_count: (Number(a.comment_count)||0) + 1 } : a
              ));
            } else if (activeTab === 'saved') {
              setSavedArtworks(prev => prev.map(a => 
                a.artwork_id === artworkId ? { ...a, comment_count: (Number(a.comment_count)||0) + 1 } : a
              ));
            }
          }}
          onLikeToggled={(artworkId, liked) => {
            // Update liked set
            setLikedArtworks(prev => {
              const next = new Set(prev);
              if (liked) next.add(artworkId); else next.delete(artworkId);
              return next;
            });
            
            // Update counts in all tabs
            if (activeTab === 'artworks') {
              setArtworks(prev => prev.map(a => 
                a.artwork_id === artworkId ? { ...a, like_count: (Number(a.like_count)||0) + (liked ? 1 : -1) } : a
              ));
            } else if (activeTab === 'likes') {
              setLikedList(prev => prev.map(a => 
                a.artwork_id === artworkId ? { ...a, like_count: (Number(a.like_count)||0) + (liked ? 1 : -1) } : a
              ));
            } else if (activeTab === 'saved') {
              setSavedArtworks(prev => prev.map(a => 
                a.artwork_id === artworkId ? { ...a, like_count: (Number(a.like_count)||0) + (liked ? 1 : -1) } : a
              ));
            }
          }}
        />

        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Profile Picture</Form.Label>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  {editAvatarPreview && (
                    <img 
                      src={editAvatarPreview} 
                      alt="Preview" 
                      style={{ 
                        width: 100, 
                        height: 100, 
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        marginBottom: '0.5rem'
                      }} 
                    />
                  )}
                </div>
                <Form.Control
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleAvatarChange}
                />
                <Form.Text className="text-muted">
                  Upload a PNG or JPG file
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell the community about you"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveProfile} disabled={savingEdit}>
              {savingEdit ? <Spinner size="sm" animation="border" /> : 'Save'}
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
}

export default Profile;