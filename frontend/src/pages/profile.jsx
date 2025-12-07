import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Image, Heart, Bookmark, MessageCircle } from 'lucide-react';
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

  const loggedInId = localStorage.getItem('userId');
  const loggedInUsername = localStorage.getItem('username');

  const rawUsername = (urlUsername || loggedInUsername || '');
  const profileUsername = rawUsername.startsWith('@') ? rawUsername.slice(1) : rawUsername;

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

  // Like/save handlers
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
      }
    } catch (err) {
      console.error('Error liking artwork:', err);
    }
  };

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
          if (found) setSavedArtworks(prev => [found, ...prev]);
        }
      }
    } catch (err) {
      console.error('Error saving artwork:', err);
    }
  };

  const openPostModal = (artwork) => {
    setSelectedArtwork(artwork);
    setShowPostModal(true);
  };

  const handleEdit = () => navigate('/edit-profile');

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

  const avatar = user?.profile_picture || null;

  return (
    <div className="cream-background">
      <NavigationBar />
      <main style={{ padding: '2rem 0' }}>
        <section style={{ textAlign: 'center', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            {avatar ? (
              <img src={avatar} alt="profile" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#fff', border: '2px solid #eee' }} />
            )}
          </div>

          <h3>{user ? `@${user.username}` : 'User not found'}</h3>
          <p style={{ color: '#666' }}>{user?.bio || ''}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
            <div><strong>{artworks.length}</strong> artworks</div>
            <div><strong>{followersCount}</strong> followers</div>
            <div><strong>{followingCount}</strong> following</div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            {isOwnProfile ? (
              <button className="blue-btn" onClick={handleEdit} style={{ padding: '0.4rem 1rem', fontSize: '0.80rem', width: 'auto', maxWidth: '120px', margin: '0 auto', display: 'block' }}>Edit Profile</button>
            ) : (
              <button className="blue-btn" onClick={handleFollowToggle} style={{ padding: '0.4rem 1rem', fontSize: '0.80rem', width: 'auto', maxWidth: '120px', margin: '0 auto', display: 'block' }}>{isFollowing ? 'Following' : 'Follow'}</button>
            )}
          </div>

          {/* Tabs */}
          <div style={{ marginTop: '2rem', borderBottom: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem' }}>
              <button onClick={() => setActiveTab('artworks')} style={{ background: 'none', border: 'none', padding: '0.75rem 0', cursor: 'pointer', fontWeight: activeTab === 'artworks' ? 600 : 400, color: activeTab === 'artworks' ? '#E89B96' : '#555', borderBottom: activeTab === 'artworks' ? '3px solid #E89B96' : 'none', marginBottom: '-1px' }}>
                <Image size={18} style={{ marginRight: '0.5rem', display: 'inline' }} /> Artworks
              </button>
              {isOwnProfile && (
                <>
                  <button onClick={() => setActiveTab('likes')} style={{ background: 'none', border: 'none', padding: '0.75rem 0', cursor: 'pointer', fontWeight: activeTab === 'likes' ? 600 : 400, color: activeTab === 'likes' ? '#E89B96' : '#555', borderBottom: activeTab === 'likes' ? '3px solid #E89B96' : 'none', marginBottom: '-1px' }}>
                    <Heart size={18} style={{ marginRight: '0.5rem', display: 'inline' }} /> Likes ({likedList.length})
                  </button>
                  <button onClick={() => setActiveTab('saved')} style={{ background: 'none', border: 'none', padding: '0.75rem 0', cursor: 'pointer', fontWeight: activeTab === 'saved' ? 600 : 400, color: activeTab === 'saved' ? '#E89B96' : '#555', borderBottom: activeTab === 'saved' ? '3px solid #E89B96' : 'none', marginBottom: '-1px' }}>
                    <Bookmark size={18} style={{ marginRight: '0.5rem', display: 'inline' }} /> Saved ({savedArtworks.length})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ marginTop: '2rem', minHeight: '300px' }}>
            {activeTab === 'artworks' && (
              artworks.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999' }}>No artworks yet</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {artworks.map(art => (
                    <div key={art.artwork_id} className="artwork-card" onClick={() => openPostModal(art)} style={{ cursor: 'pointer' }}>
                      <div className="artwork-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem' }}>
                        <img src={art.profile_picture || 'https://via.placeholder.com/32'} alt={art.username} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                        <span>@{art.username}</span>
                      </div>
                      <img src={art.image_url} alt={art.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                      <div style={{ padding: '1rem' }}>
                        <h4>{art.title}</h4>
                        <p>{art.caption}</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                          <span onClick={(e) => { e.stopPropagation(); handleLike(art.artwork_id); }} style={{ cursor: 'pointer' }}>❤️ {art.like_count || 0}</span>
                          <span>💬 {art.comment_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {isOwnProfile && activeTab === 'likes' && (
              likedList.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999' }}>No likes yet</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {likedList.map(art => (
                    <div key={art.artwork_id} className="artwork-card" onClick={() => openPostModal(art)} style={{ cursor: 'pointer' }}>
                      <div className="artwork-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem' }}>
                        <img src={art.profile_picture || 'https://via.placeholder.com/32'} alt={art.username} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                        <span>@{art.username}</span>
                      </div>
                      <img src={art.image_url} alt={art.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                      <div style={{ padding: '1rem' }}>
                        <h4>{art.title}</h4>
                        <p>{art.caption}</p>
                        <span>❤️ {art.like_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {isOwnProfile && activeTab === 'saved' && (
              savedArtworks.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999' }}>No saved artworks yet</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {savedArtworks.map(art => (
                    <div key={art.artwork_id} className="artwork-card" onClick={() => openPostModal(art)} style={{ cursor: 'pointer' }}>
                      <div className="artwork-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem' }}>
                        <img src={art.profile_picture || 'https://via.placeholder.com/32'} alt={art.username} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                        <span>@{art.username}</span>
                      </div>
                      <img src={art.image_url} alt={art.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                      <div style={{ padding: '1rem' }}>
                        <h4>{art.title}</h4>
                        <p>{art.caption}</p>
                        <span>❤️ {art.like_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </section>

        <PostModal
          show={showPostModal}
          onHide={() => setShowPostModal(false)}
          artwork={selectedArtwork}
        />
      </main>
    </div>
  );
}

export default Profile;