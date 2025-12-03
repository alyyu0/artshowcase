import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Image, Heart, Bookmark } from 'lucide-react';
import NavigationBar from './navbar';

function Profile() {
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams();
  const [user, setUser] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState('artworks');

  useEffect(() => {
    // Use userId from URL if provided, otherwise use logged-in user's userId
    const profileUserId = urlUserId || localStorage.getItem('userId');
    
    if (!profileUserId) {
      // Not logged in and no userId in URL
      return;
    }

    // Fetch user profile
    fetch(`http://localhost:5000/api/users/${profileUserId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => {
        console.error(err);
      });

    // Fetch followers
    fetch(`http://localhost:5000/api/follows/followers/${profileUserId}`)
      .then((res) => res.ok ? res.json() : [])
      .then((rows) => setFollowersCount(Array.isArray(rows) ? rows.length : 0))
      .catch(() => setFollowersCount(0));

    // Fetch following
    fetch(`http://localhost:5000/api/follows/following/${profileUserId}`)
      .then((res) => res.ok ? res.json() : [])
      .then((rows) => setFollowingCount(Array.isArray(rows) ? rows.length : 0))
      .catch(() => setFollowingCount(0));
  }, [urlUserId]);

  const handleEdit = () => {
    // placeholder - navigate to edit profile if implemented
    navigate('/edit-profile');
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

          <h3 style={{ marginTop: '0.75rem' }}>{user ? `@${user.username}` : '@user'}</h3>
          <p style={{ color: '#666' }}>{user && user.bio ? user.bio : ''}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.75rem' }}>
            <div>{/* artworks count would require another endpoint - omitted */}0 artworks</div>
            <div>{followersCount ?? 0} followers</div>
            <div>{followingCount ?? 0} following</div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button className="blue-btn" style={{ width: '120px' }} onClick={handleEdit}>Edit Profile</button>
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
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ marginTop: '2rem', minHeight: '300px' }}>
            {activeTab === 'artworks' && (
              <div style={{ textAlign: 'center', color: '#999' }}>
                <p>No artworks yet</p>
              </div>
            )}
            {activeTab === 'likes' && (
              <div style={{ textAlign: 'center', color: '#999' }}>
                <p>No likes yet</p>
              </div>
            )}
            {activeTab === 'saved' && (
              <div style={{ textAlign: 'center', color: '#999' }}>
                <p>No saved artworks yet</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Profile;
