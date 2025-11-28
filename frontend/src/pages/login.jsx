import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Palette } from 'lucide-react';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert('Enter username and password!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('loggedIn', true);
        localStorage.setItem('userId', data.userId);
        alert(data.message);
        navigate('/');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
    }
  };

  return (
    <div className="funky-gradient">
      <div className="cream-container">
        <div className="palette-circle">
          <Palette size={50} color="white" />
        </div>
        <div className="form-text">
          <h2>Login</h2>
          <p className="welcome-text">Welcome to the Art Showcase Website!</p>
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
            Sign In
          </Button>
        </Form>

        <p className="form-text">
          Don't have an account? <Link to="/signup" className="custom-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;