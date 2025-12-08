import { Home, Image, Trophy, User, LogOut, Upload } from 'lucide-react';
import { Nav, Navbar, Container, Dropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UploadModal from './upload';
import '../App.css';

function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUpload, setShowUpload] = useState(false);
  const isLoggedIn = localStorage.getItem('loggedIn');
  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('userId');
  const placeholderImg = 'https://via.placeholder.com/40';
  const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage') || placeholderImg);

  useEffect(() => {
    const stored = localStorage.getItem('profileImage');
    if (stored) setProfileImage(stored);
    const loadProfileImage = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          const img = data?.profile_picture || placeholderImg;
          setProfileImage(img);
          localStorage.setItem('profileImage', img);
        }
      } catch (err) {
        console.error('Failed to load profile image', err);
      }
    };
    loadProfileImage();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('profileImage');
    navigate('/login');
  };

  const handleViewProfile = () => {
    const uname = localStorage.getItem('username');
    if (uname) {
      navigate(`/profile/${encodeURIComponent(uname)}`, { replace: false });
    } else {
      navigate('/login', { replace: false });
    }
  };

  return (
    <>
      <Navbar expand="lg" className="pink-header sticky-top">
        <Container fluid className="d-flex align-items-center">
          <div className="d-flex align-items-center">
            <Navbar.Brand 
              onClick={() => navigate('/', { replace: false })} 
              className="artshowcase-title"
              style={{ cursor: 'pointer' }}
            >
              Art Showcase
            </Navbar.Brand>
          </div>

          <div className="d-flex justify-content-center flex-grow-1">
            <Nav className="d-flex gap-4">
              <Nav.Link 
                onClick={() => navigate('/', { replace: false })}
                className="d-flex align-items-center gap-2"
                style={{
                  position: 'relative',
                  paddingBottom: '12px',
                  borderRadius: '8px',
                  backgroundColor: location.pathname === '/' ? '#d9e385' : 'transparent',
                  padding: location.pathname === '/' ? '8px 16px' : '8px 16px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <Home size={20} /> Home
              </Nav.Link>
              <Nav.Link 
                onClick={() => navigate('/gallery', { replace: false })}
                className="d-flex align-items-center gap-2"
                style={{
                  position: 'relative',
                  paddingBottom: '12px',
                  borderRadius: '8px',
                  backgroundColor: location.pathname === '/gallery' ? '#d9e385' : 'transparent',
                  padding: location.pathname === '/gallery' ? '8px 16px' : '8px 16px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <Image size={20} /> Gallery
              </Nav.Link>
              <Nav.Link 
                onClick={() => navigate('/leaderboard', { replace: false })}
                className="d-flex align-items-center gap-2"
                style={{
                  position: 'relative',
                  paddingBottom: '12px',
                  borderRadius: '8px',
                  backgroundColor: location.pathname === '/leaderboard' ? '#d9e385' : 'transparent',
                  padding: location.pathname === '/leaderboard' ? '8px 16px' : '8px 16px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <Trophy size={20} /> Leaderboard
              </Nav.Link>
            </Nav>
          </div>

          <div className="d-flex align-items-center gap-3">
            {isLoggedIn ? (
              <>
                <button 
                  onClick={() => setShowUpload(true)}
                  className="navbar-blue-btn d-flex align-items-center gap-2"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  <Upload size={18} /> Upload
                </button>

                <Dropdown align="end">
                  <Dropdown.Toggle
                    as="button"
                    className="p-0 border-0 bg-transparent"
                    bsPrefix="custom"
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={profileImage}
                      alt={username}
                      onError={(e) => { e.target.src = placeholderImg; setProfileImage(placeholderImg); }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid white',
                        display: 'block',
                        flex: '0 0 40px',
                      }}
                    />
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="mt-2">
                    <Dropdown.Item
                      onClick={handleViewProfile}
                      className="d-flex align-items-center"
                      role="button"
                    >
                      <User size={16} className="me-2" /> View Profile
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center text-danger">
                      <LogOut size={16} className="me-2" /> Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="navbar-blue-btn"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  <LogOut size={18} /> Login
                </button>
              </>
            )}
          </div>
        </Container>
      </Navbar>

      <UploadModal show={showUpload} onHide={() => setShowUpload(false)} />
    </>
  );
}

export default NavigationBar;