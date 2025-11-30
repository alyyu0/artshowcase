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
      <Container fluid className="d-flex align-items-center">
        <div className="d-flex align-items-center">
          <Navbar.Brand href="/" className="artshowcase-title">
            Art Showcase
          </Navbar.Brand>
        </div>

        <div className="d-flex justify-content-center flex-grow-1">
          <Nav className="d-flex gap-4">
            <Nav.Link href="/" className="d-flex align-items-center gap-2">
              <Home size={20} /> Home
            </Nav.Link>
            <Nav.Link href="/gallery" className="d-flex align-items-center gap-2">
              <Image size={20} /> Gallery
            </Nav.Link>
            <Nav.Link href="/leaderboard" className="d-flex align-items-center gap-2">
              <Trophy size={20} /> Leaderboard
            </Nav.Link>
          </Nav>
        </div>

        <div className="d-flex align-items-center gap-3">
          <>
            <a href="/upload" className="navbar-blue-btn d-flex align-items-center gap-2">
              <Upload size={18} /> Upload
            </a>

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
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid white',
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
        </div>
      </Container>
    </Navbar>

  );
}

export default NavigationBar;
