import { Home, Image, Trophy, User, LogOut, Upload } from 'lucide-react';
import { Nav, Navbar, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function NavigationBar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('loggedIn');
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="pink-header sticky-top">
      <Container>
        <Navbar.Brand href="/" className="artshowcase-title">
          ArtShowcase
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/" className="me-3">
              <Home size={20} /> Home
            </Nav.Link>
            <Nav.Link href="/gallery" className="me-3">
              <Image size={20} /> Gallery
            </Nav.Link>
            <Nav.Link href="/leaderboard" className="me-3">
              <Trophy size={20} /> Leaderboard
            </Nav.Link>

            {isLoggedIn ? (
              <>
                <Nav.Link href="/upload" className="me-3">
                  <Upload size={20} /> Upload
                </Nav.Link>
                <Nav.Link href={`/profile/${localStorage.getItem('userId')}`} className="me-3">
                  <User size={20} /> {username}
                </Nav.Link>
                <Button
                  variant="outline-danger"
                  onClick={handleLogout}
                  className="d-flex align-items-center"
                >
                  <LogOut size={18} className="me-2" /> Logout
                </Button>
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
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;