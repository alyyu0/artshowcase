import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './navbar';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      // Not logged in
      return;
    }

    // Fetch user profile
    fetch(`http://localhost:5000/api/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => {
        console.error(err);
      });

    // Fetch followers
    fetch(`http://localhost:5000/api/follows/followers/${userId}`)
      .then((res) => res.ok ? res.json() : [])
      .then((rows) => setFollowersCount(Array.isArray(rows) ? rows.length : 0))
      .catch(() => setFollowersCount(0));

    // Fetch following
    fetch(`http://localhost:5000/api/follows/following/${userId}`)
      .then((res) => res.ok ? res.json() : [])
      .then((rows) => setFollowingCount(Array.isArray(rows) ? rows.length : 0))
      .catch(() => setFollowingCount(0));
  }, []);

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
        </section>
      </main>
    </div>
  );
}

export default Profile;
