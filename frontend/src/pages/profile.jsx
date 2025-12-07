import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Image, Heart, Bookmark, MessageCircle } from 'lucide-react';
import NavigationBar from './navbar';
import PostModal from '../components/PostModal';

function Profile() {
  const navigate = useNavigate();
  const { username: urlUsername } = useParams();
  const [user, setUser] = useState(null);
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

  const loggedInId = localStorage.getItem('userId');
  const loggedInUsername = localStorage.getItem('username');
  // normalize username: prefer URL param, fallback to logged-in username; strip leading '@' if present
  const rawUsername = (urlUsername || loggedInUsername || '');
  const profileUsername = rawUsername.startsWith('@') ? rawUsername.slice(1) : rawUsername;
  const [profileUserId, setProfileUserId] = useState(null);
  // Determine if this is the logged-in user's profile. Prefer username match, but fall back to user_id match
  const isOwnProfile = Boolean(
    (loggedInUsername && profileUsername && loggedInUsername === profileUsername) ||
    (loggedInId && profileUserId && String(loggedInId) === String(profileUserId))
  );
  console.debug('profile: isOwnProfile=', isOwnProfile, 'loggedInId=', loggedInId, 'profileUserId=', profileUserId, 'loggedInUsername=', loggedInUsername, 'profileUsername=', profileUsername);

  // Fetch user by username (URL) and resolve its user_id for subsequent calls
  useEffect(() => {
    if (!profileUsername) return;
    const fetchByUsername = async () => {
      try {
        console.debug('profile: fetching user by username=', profileUsername);
        const res = await fetch(`http://localhost:5000/api/users/by-username/${profileUsername}`);
        if (res.ok) {
          const data = await res.json();
          console.debug('profile: fetched user', data);
          setUser(data);
          setProfileUserId(data.user_id);
        } else if (res.status === 404) {
          console.warn('profile: user not found for', profileUsername);
          setUser(null);
          setProfileUserId(null);
        } else {
          console.error('profile: unexpected response', res.status);
          setUser(null);
          setProfileUserId(null);
        }
      } catch (err) {
        console.error('Error fetching user by username', err);
        setUser(null);
        setProfileUserId(null);
      }
    };
    fetchByUsername();
  }, [profileUsername]);

  // When we have the profile user id, fetch followers/following and listen for follow events
  useEffect(() => {
    if (!profileUserId) return;

    const fetchFollowers = () => {
      fetch(`http://localhost:5000/api/follows/followers/${profileUserId}`)
        .then((res) => res.ok ? res.json() : [])
        .then((rows) => setFollowersCount(Array.isArray(rows) ? rows.length : 0))
        .catch(() => setFollowersCount(0));
    };

    const fetchFollowing = () => {
      fetch(`http://localhost:5000/api/follows/following/${profileUserId}`)
        .then((res) => res.ok ? res.json() : [])
        .then((rows) => setFollowingCount(Array.isArray(rows) ? rows.length : 0))
        .catch(() => setFollowingCount(0));
    };

    fetchFollowers();
    fetchFollowing();

    if (loggedInId && profileUserId && loggedInId !== profileUserId) {
      fetch(`http://localhost:5000/api/follows/check/${loggedInId}/${profileUserId}`)
        .then(res => res.ok ? res.json() : { isFollowing: false })
        .then(data => setIsFollowing(!!data.isFollowing))
        .catch(() => setIsFollowing(false));
    } else {
      setIsFollowing(false);
    }

    const handler = (e) => {
      const detail = e && e.detail ? e.detail : {};
      const { followerId, followingId, isFollowing: newState } = detail;
      if (followingId && String(followingId) === String(profileUserId)) {
        if (typeof newState === 'boolean') {
          setFollowersCount(prev => newState ? prev + 1 : Math.max(0, prev - 1));
        } else {
          fetchFollowers();
        }
        if (String(followerId) === String(loggedInId)) {
          setIsFollowing(!!newState);
        }
      }

      if (String(followerId) === String(loggedInId) && String(profileUserId) === String(loggedInId)) {
        if (typeof newState === 'boolean') {
          setFollowingCount(prev => newState ? prev + 1 : Math.max(0, prev - 1));
        } else {
          fetchFollowing();
        }
      }
    };

    window.addEventListener('follow-status-changed', handler);
    return () => window.removeEventListener('follow-status-changed', handler);
  }, [profileUserId, loggedInId]);

  // Fetch artworks for the profile user (visible on artworks tab)
  useEffect(() => {
    if (!profileUserId) return;
    const fetchArtworks = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/artwork/user/${profileUserId}`);
        if (res.ok) {
          const data = await res.json();
          setArtworks(Array.isArray(data) ? data : []);
        } else {
          setArtworks([]);
        }
      } catch (err) {
        console.error('Error fetching artworks', err);
        setArtworks([]);
      }
    };

    fetchArtworks();
  }, [profileUserId]);

  // Fetch likes of the logged-in user so like button states are accurate
  useEffect(() => {
    if (!loggedInId) return;
    fetch(`http://localhost:5000/api/likes/user/${loggedInId}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setLikedArtworks(new Set((data || []).map(a => a.artwork_id))))
      .catch(() => {});
  }, [loggedInId]);

  useEffect(() => {
    // When saved tab is active, fetch saved artworks for this profile (only for own profile)
    if (!isOwnProfile) return;
    if (activeTab !== 'saved') return;
    if (!profileUserId) return;

    const fetchSaved = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/saves/saved/${profileUserId}`);
        if (res.ok) {
          const data = await res.json();
          setSavedArtworks(Array.isArray(data) ? data : []);
        } else {
          setSavedArtworks([]);
        }

        // also fetch likes for logged-in user to show liked state if viewing own profile
        const userId = localStorage.getItem('userId');
        if (userId) {
          const likesRes = await fetch(`http://localhost:5000/api/likes/user/${userId}`);
          if (likesRes.ok) {
            const likesData = await likesRes.json();
            setLikedArtworks(new Set((likesData || []).map(a => a.artwork_id)));
          }
        }
      } catch (err) {
        console.error('Error fetching saved artworks', err);
      }
    };

    fetchSaved();
  }, [activeTab, profileUserId]);

  // When likes tab is active for own profile, fetch artworks the user liked
  useEffect(() => {
    if (!isOwnProfile) return;
    if (activeTab !== 'likes') return;
    if (!profileUserId) return;

    const fetchLiked = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/likes/user/${profileUserId}`);
        if (res.ok) {
          const data = await res.json();
          setLikedList(Array.isArray(data) ? data : []);
          // ensure likedArtworks Set reflects currently liked ids
          setLikedArtworks(new Set((data || []).map(a => a.artwork_id)));
        } else {
          setLikedList([]);
        }
      } catch (err) {
        console.error('Error fetching liked artworks', err);
        setLikedList([]);
      }
    };

    fetchLiked();
  }, [activeTab, profileUserId, isOwnProfile]);

  // Ensure that when viewing someone else's profile, tabs like 'likes' and 'saved' are not active
  useEffect(() => {
    if (!isOwnProfile && (activeTab === 'likes' || activeTab === 'saved')) {
      setActiveTab('artworks');
    }
  }, [isOwnProfile, activeTab]);

  const openPostModal = (artwork) => {
    setSelectedArtwork(artwork);
    setShowPostModal(true);
  };

  const handleLike = async (artworkId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) { alert('Please login to like artworks'); return; }

    try {
      const isLiked = likedArtworks.has(artworkId);
      const endpoint = isLiked ? '/api/likes/unlike' : '/api/likes/like';
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, artwork_id: artworkId })
      });
      if (res.ok) {
        const next = new Set(likedArtworks);
        if (isLiked) next.delete(artworkId); else next.add(artworkId);
        setLikedArtworks(next);
        // update local counts in artworks and savedArtworks
        setArtworks(prev => prev.map(a => {
          if (a.artwork_id === artworkId) {
            const current = Number(a.like_count || 0);
            return { ...a, like_count: isLiked ? Math.max(0, current - 1) : current + 1 };
          }
          return a;
        }));
        setSavedArtworks(prev => prev.map(a => {
          if (a.artwork_id === artworkId) {
            const current = Number(a.like_count || 0);
            return { ...a, like_count: isLiked ? Math.max(0, current - 1) : current + 1 };
          }
          return a;
        }));
        // Update liked list: if we are viewing Likes tab, remove on unlike, add/update on like
        setLikedList(prev => {
          if (isLiked) {
            // removed like -> remove from likes list
            return prev.filter(a => a.artwork_id !== artworkId);
          } else {
            // added like -> try to find artwork in artworks or savedArtworks to insert
            const found = artworks.find(a => a.artwork_id === artworkId) || savedArtworks.find(a => a.artwork_id === artworkId);
            if (found) {
              const current = Number(found.like_count || 0);
              // ensure we add a copy with updated like_count
              const entry = { ...found, like_count: current + 1 };
              // avoid duplicates
              const exists = prev.some(a => a.artwork_id === artworkId);
              return exists ? prev.map(a => a.artwork_id === artworkId ? entry : a) : [entry, ...prev];
            }
            // if not found locally, keep existing list (could fetch single artwork if needed)
            return prev;
          }
        });
      }
    } catch (err) { console.error(err); }
  };

  const handleSave = async (artworkId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) { alert('Please login to save artworks'); return; }

    try {
      // When viewing saved list, saving/un-saving should update the list
      const isSaved = savedArtworks.some(a => a.artwork_id === artworkId);
      const endpoint = isSaved ? '/api/saves/unsave' : '/api/saves/save';
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, artwork_id: artworkId })
      });
      if (res.ok) {
        if (isSaved) {
          setSavedArtworks(prev => prev.filter(a => a.artwork_id !== artworkId));
        } else {
          // optionally refetch single artwork details; for now optimistically remove nothing
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleEdit = () => {
    // placeholder - navigate to edit profile if implemented
    navigate('/edit-profile');
  };

  const handleFollowToggle = async () => {
    const loggedInIdLocal = localStorage.getItem('userId');
    const targetUserId = profileUserId || localStorage.getItem('userId');
    if (!loggedInIdLocal) {
      alert('Please login to follow users');
      navigate('/login');
      return;
    }
    if (!targetUserId) { alert('User not found'); return; }
    if (loggedInIdLocal === targetUserId) return; // don't follow yourself

    try {
      const endpoint = isFollowing ? '/api/follows/unfollow' : '/api/follows/follow';
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ follower_id: loggedInIdLocal, following_id: targetUserId })
      });
      if (res.ok) {
        const newState = !isFollowing;
        setIsFollowing(newState);
        setFollowersCount(prev => newState ? prev + 1 : Math.max(0, prev - 1));

        // If we just followed, fetch that user's artworks and include them in the event so Home can optimistically insert them
        if (newState) {
          try {
            const artsRes = await fetch(`http://localhost:5000/api/artwork/user/${targetUserId}`);
            let artworks = [];
            if (artsRes.ok) {
              const data = await artsRes.json();
              artworks = Array.isArray(data) ? data : [];
            }
            window.dispatchEvent(new CustomEvent('follow-status-changed', { detail: { followerId: loggedInIdLocal, followingId: targetUserId, isFollowing: newState, artworks } }));
          } catch (e) {
            // dispatch without artworks on error
            window.dispatchEvent(new CustomEvent('follow-status-changed', { detail: { followerId: loggedInIdLocal, followingId: targetUserId, isFollowing: newState } }));
          }
        } else {
          // unfollow: notify Home to remove that user's posts
          window.dispatchEvent(new CustomEvent('follow-status-changed', { detail: { followerId: loggedInIdLocal, followingId: targetUserId, isFollowing: newState } }));
        }
      }
    } catch (err) {
      console.error('Follow toggle error', err);
    }
  };

  const avatar = user && user.profile_picture ? user.profile_picture : null;

  return (
    <div className="cream-background">
      <NavigationBar />

      <main style={{ padding: '2rem 0' }}>
        <section style={{ textAlign: 'center', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {avatar ? (
              <img
                src={avatar}
                alt="profile"
                style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 0 rgba(0,0,0,0.1)' }}
              />
            ) : (
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#fff', border: '2px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
            )}
          </div>

          <h3 style={{ marginTop: '0.75rem' }}>
            {user ? `@${user.username}` : (profileUsername && !profileUserId ? 'User not found' : '@user')}
          </h3>
          <p style={{ color: '#666' }}>{user && user.bio ? user.bio : (profileUsername && !profileUserId ? 'This user does not exist.' : '')}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.75rem' }}>
            <div>{/* artworks count would require another endpoint - omitted */}0 artworks</div>
            <div>{followersCount ?? 0} followers</div>
            <div>{followingCount ?? 0} following</div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            {!isOwnProfile ? (
              <button className="blue-btn" style={{ width: '120px' }} onClick={handleFollowToggle}>{isFollowing ? 'Following' : 'Follow'}</button>
            ) : (
              <button className="blue-btn" style={{ width: '120px' }} onClick={handleEdit}>Edit Profile</button>
            )}
          </div>

          {/* Tabs Section */}
          <div style={{ marginTop: '2rem', borderBottom: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
              <button
                onClick={() => setActiveTab('artworks')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.75rem 0',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: activeTab === 'artworks' ? '600' : '400',
                  color: activeTab === 'artworks' ? '#E89B96' : '#555',
                  borderBottom: activeTab === 'artworks' ? '3px solid #E89B96' : 'none',
                  marginBottom: '-1px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Image size={18} /> Artworks
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => setActiveTab('likes')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.75rem 0',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: activeTab === 'likes' ? '600' : '400',
                  color: activeTab === 'likes' ? '#E89B96' : '#555',
                  borderBottom: activeTab === 'likes' ? '3px solid #E89B96' : 'none',
                  marginBottom: '-1px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                >
                  <Heart size={18} /> Likes
                </button>
              )}
              {isOwnProfile && (
                <button
                  onClick={() => setActiveTab('saved')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.75rem 0',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: activeTab === 'saved' ? '600' : '400',
                  color: activeTab === 'saved' ? '#E89B96' : '#555',
                  borderBottom: activeTab === 'saved' ? '3px solid #E89B96' : 'none',
                  marginBottom: '-1px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                >
                  <Bookmark size={18} /> Saved
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ marginTop: '2rem', minHeight: '300px' }}>
            {activeTab === 'artworks' && (
              <div>
                {artworks.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#999' }}>
                    <p>No artworks yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                    {artworks.map((artwork) => (
                      <div key={artwork.artwork_id} className="artwork-card" style={{ cursor: 'pointer' }} onClick={() => openPostModal(artwork)}>
                        <div className="artwork-header">
                          <img src={artwork.profile_picture || 'https://via.placeholder.com/32?text=User'} alt={artwork.username} className="artwork-user-avatar" onError={(e) => { e.target.src = 'https://via.placeholder.com/32?text=User'; }} onClick={(e) => { e.stopPropagation(); /* stay on profile */ }} style={{ cursor: 'default' }} />
                          <span className="artwork-username">@{artwork.username}</span>
                        </div>

                        <div className="artwork-image-container">
                          <img src={artwork.image_url} alt={artwork.title} className="artwork-image" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found'; }} />
                          <div className="artwork-overlay">
                            <button className={`artwork-action-btn ${likedArtworks.has(artwork.artwork_id) ? 'liked' : ''}`} onClick={(e) => { e.stopPropagation(); handleLike(artwork.artwork_id); }} aria-label="Like" style={{ marginRight: '0.2rem' }}>
                              <Heart size={24} strokeWidth={2} stroke="currentColor" className="overlay-icon" />
                            </button>
                            <button className="artwork-action-btn" style={{ marginRight: '0.2rem' }} onClick={(e) => { e.stopPropagation(); openPostModal(artwork); }} aria-label="Comments">
                              <MessageCircle size={24} strokeWidth={2} stroke="currentColor" className="overlay-icon" />
                            </button>
                            <button className={`artwork-action-btn ${savedArtworks.some(a => a.artwork_id === artwork.artwork_id) ? 'saved' : ''}`} onClick={(e) => { e.stopPropagation(); handleSave(artwork.artwork_id); }} aria-label="Save">
                              <Bookmark size={24} strokeWidth={2} stroke="currentColor" className="overlay-icon" />
                            </button>
                          </div>
                        </div>

                        <div className="artwork-info">
                          <h3 className="artwork-title">{artwork.title}</h3>
                          <div className="artwork-tags"><span className="tag">Digital Art</span></div>
                          {artwork.caption && <p className="artwork-caption single-line-caption">{artwork.caption}</p>}
                          <div className="artwork-stats">
                            <div className={`stat clickable`} onClick={(e) => { e.stopPropagation(); handleLike(artwork.artwork_id); }}>
                              <Heart size={24} strokeWidth={2} stroke="currentColor" className={`card-icon ${likedArtworks.has(artwork.artwork_id) ? 'liked' : ''}`} /> <span className="count">{artwork.like_count ?? 0}</span>
                            </div>
                            <div className="stat">
                              <MessageCircle size={24} strokeWidth={2} stroke="currentColor" className="card-icon" /> <span className="count">{artwork.comment_count ?? 0}</span>
                            </div>
                            <div className="spacer" />
                            <div className={`stat clickable`} onClick={(e) => { e.stopPropagation(); handleSave(artwork.artwork_id); }}>
                              <Bookmark size={24} strokeWidth={2} stroke="currentColor" className={`card-icon ${savedArtworks.some(a => a.artwork_id === artwork.artwork_id) ? 'saved' : ''}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {isOwnProfile && activeTab === 'likes' && (
              <div>
                {likedList.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#999' }}>
                    <p>No likes yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                    {likedList.map((artwork) => (
                      <div key={artwork.artwork_id} className="artwork-card" style={{ cursor: 'pointer' }} onClick={() => openPostModal(artwork)}>
                        <div className="artwork-header">
                          <img src={artwork.profile_picture || 'https://via.placeholder.com/32?text=User'} alt={artwork.username} className="artwork-user-avatar" onError={(e) => { e.target.src = 'https://via.placeholder.com/32?text=User'; }} onClick={(e) => { e.stopPropagation(); }} style={{ cursor: 'default' }} />
                          <span className="artwork-username">@{artwork.username}</span>
                        </div>

                        <div className="artwork-image-container">
                          <img src={artwork.image_url} alt={artwork.title} className="artwork-image" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found'; }} />
                          <div className="artwork-overlay">
                            <button className={`artwork-action-btn ${likedArtworks.has(artwork.artwork_id) ? 'liked' : ''}`} onClick={(e) => { e.stopPropagation(); handleLike(artwork.artwork_id); }} aria-label="Like" style={{ marginRight: '0.2rem' }}>
                              <Heart size={24} strokeWidth={2} stroke="currentColor" className="overlay-icon" />
                            </button>
                            <button className="artwork-action-btn" style={{ marginRight: '0.2rem' }} onClick={(e) => { e.stopPropagation(); openPostModal(artwork); }} aria-label="Comments">
                              <MessageCircle size={24} strokeWidth={2} stroke="currentColor" className="overlay-icon" />
                            </button>
                            <button className={`artwork-action-btn ${savedArtworks.some(a => a.artwork_id === artwork.artwork_id) ? 'saved' : ''}`} onClick={(e) => { e.stopPropagation(); handleSave(artwork.artwork_id); }} aria-label="Save">
                              <Bookmark size={24} strokeWidth={2} stroke="currentColor" className="overlay-icon" />
                            </button>
                          </div>
                        </div>

                        <div className="artwork-info">
                          <h3 className="artwork-title">{artwork.title}</h3>
                          <div className="artwork-tags"><span className="tag">Digital Art</span></div>
                          {artwork.caption && <p className="artwork-caption single-line-caption">{artwork.caption}</p>}
                          <div className="artwork-stats">
                            <div className={`stat clickable`} onClick={(e) => { e.stopPropagation(); handleLike(artwork.artwork_id); }}>
                              <Heart size={24} strokeWidth={2} stroke="currentColor" className={`card-icon ${likedArtworks.has(artwork.artwork_id) ? 'liked' : ''}`} /> <span className="count">{artwork.like_count ?? 0}</span>
                            </div>
                            <div className="stat">
                              <MessageCircle size={24} strokeWidth={2} stroke="currentColor" className="card-icon" /> <span className="count">{artwork.comment_count ?? 0}</span>
                            </div>
                            <div className="spacer" />
                            <div className={`stat clickable`} onClick={(e) => { e.stopPropagation(); handleSave(artwork.artwork_id); }}>
                              <Bookmark size={24} strokeWidth={2} stroke="currentColor" className={`card-icon ${savedArtworks.some(a => a.artwork_id === artwork.artwork_id) ? 'saved' : ''}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {isOwnProfile && activeTab === 'saved' && (
              <div>
                {savedArtworks.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#999' }}>
                    <p>No saved artworks yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {savedArtworks.map((artwork) => (
                      <div key={artwork.artwork_id} className="artwork-card" style={{ cursor: 'pointer' }} onClick={() => openPostModal(artwork)}>
                        <div className="artwork-header">
                          <img src={artwork.profile_picture || 'https://via.placeholder.com/32?text=User'} alt={artwork.username} className="artwork-user-avatar" />
                          <span className="artwork-username">@{artwork.username}</span>
                        </div>

                        <div className="artwork-image-container">
                          <img src={artwork.image_url} alt={artwork.title} className="artwork-image" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found'; }} />
                          <div className="artwork-overlay">
                            <button className={`artwork-action-btn ${likedArtworks.has(artwork.artwork_id) ? 'liked' : ''}`} onClick={(e) => { e.stopPropagation(); handleLike(artwork.artwork_id); }} aria-label="Like" style={{ marginRight: '0.2rem' }}>
                              <Heart size={24} strokeWidth={2} stroke="currentColor" className="overlay-icon" />
                            </button>
                            <button className="artwork-action-btn" style={{ marginRight: '0.2rem' }} onClick={(e) => { e.stopPropagation(); openPostModal(artwork); }} aria-label="Comments">
                              <MessageCircle size={24} strokeWidth={2} stroke="currentColor" className="overlay-icon" />
                            </button>
                            <button className={`artwork-action-btn ${savedArtworks.some(a => a.artwork_id === artwork.artwork_id) ? 'saved' : ''}`} onClick={(e) => { e.stopPropagation(); handleSave(artwork.artwork_id); }} aria-label="Save">
                              <Bookmark size={24} strokeWidth={2} stroke="currentColor" className="overlay-icon" />
                            </button>
                          </div>
                        </div>

                        <div className="artwork-info">
                          <h3 className="artwork-title">{artwork.title}</h3>
                          <div className="artwork-tags"><span className="tag">Digital Art</span></div>
                          {artwork.caption && <p className="artwork-caption single-line-caption">{artwork.caption}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      <PostModal
        show={showPostModal}
        onHide={() => { setShowPostModal(false); }}
        artwork={selectedArtwork}
        onCommentAdded={(artworkId) => {
          setArtworks(prev => prev.map(a => a.artwork_id === artworkId ? { ...a, comment_count: (Number(a.comment_count)||0) + 1 } : a));
          setSavedArtworks(prev => prev.map(a => a.artwork_id === artworkId ? { ...a, comment_count: (Number(a.comment_count)||0) + 1 } : a));
        }}
        onLikeToggled={(artworkId, liked) => {
          setLikedArtworks(prev => {
            const next = new Set(prev);
            if (liked) next.add(artworkId); else next.delete(artworkId);
            return next;
          });
          setArtworks(prev => prev.map(a => a.artwork_id === artworkId ? { ...a, like_count: (Number(a.like_count)||0) + (liked ? 1 : -1) } : a));
          setSavedArtworks(prev => prev.map(a => a.artwork_id === artworkId ? { ...a, like_count: (Number(a.like_count)||0) + (liked ? 1 : -1) } : a));
        }}
      />
      </main>
    </div>
  );
}

export default Profile;
