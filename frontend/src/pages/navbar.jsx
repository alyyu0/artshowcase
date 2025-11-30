import { Home, Image, Trophy, User, LogOut, Upload } from 'lucide-react';
import { Nav, Navbar, Container, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function NavigationBar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('loggedIn');
  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('userId');
  const profileImage = localStorage.getItem('profileImage') || 'https://via.placeholder.com/40';

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('profileImage');
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="pink-header sticky-top">
      <Container fluid className="d-flex justify-content-between align-items-center">
        {/* Left: Brand */}
        <Navbar.Brand href="/" className="artshowcase-title">
          Art Showcase
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
          {/* Center: Home, Gallery, Leaderboard */}
          <Nav className="mx-auto">
            <Nav.Link href="/" className="me-4">
              <Home size={20} /> Home
            </Nav.Link>
            <Nav.Link href="/gallery" className="me-4">
              <Image size={20} /> Gallery
            </Nav.Link>
            <Nav.Link href="/leaderboard" className="me-4">
              <Trophy size={20} /> Leaderboard
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>

        {/* Right: Upload & Profile */}
        <Nav className="ms-auto align-items-center gap-3">
          {isLoggedIn ? (
            <>
              {/* Upload Button */}
              <a
                href="/upload"
                className="btn btn-primary d-flex align-items-center gap-2"
                style={{ backgroundColor: '#4A90E2', border: 'none' }}
              >
                <Upload size={18} /> Upload
              </a>

              {/* Profile Dropdown */}
              <Dropdown align="end">
                <Dropdown.Toggle
                  as="button"
                  className="p-0 border-0 bg-transparent"
                  id="profile-dropdown"
                  style={{ cursor: 'pointer' }}
                  bsPrefix="custom"
                >
                  <img
                    src={profileImage}
                    alt={username}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid white'
                    }}
                  />
                </Dropdown.Toggle>

                <Dropdown.Menu className="mt-2">
                  <Dropdown.Item href={`/profile/${userId}`} className="d-flex align-items-center">
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
              <Nav.Link href="/login" className="me-3">
                Login
              </Nav.Link>
              <Nav.Link href="/signup">
                Sign Up
              </Nav.Link>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;