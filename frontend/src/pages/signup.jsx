import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Palette } from 'lucide-react';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

function signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    if (username && password) {
      localStorage.setItem('loggedIn', true);
      navigate('/');
    } else {
      alert('Enter username and password!');
    }
  };

  return (
    <div className="funky-gradient">
      <div className="white-container">
        <div className="palette-circle">
          <Palette size={50} color="white"/> 
        </div>
        <div className="form-text">
          <h2>Sign Up</h2>
          <p className="welcome-text">Create your account to start sharing and discovering art</p>
        </div>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="email"
              />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <div style={{ position: 'relative' }}>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </span>
            </div>
          </Form.Group>

          <Button className="blue-btn" type="submit">
              Create Account
          </Button>
        </Form>

        <p className="form-text">
          Already have an account? <Link to="/login" className="custom-link">Log In</Link>
        </p>

      </div>
    </div>
  );
}

export default signup;