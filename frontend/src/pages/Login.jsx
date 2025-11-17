import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Palette } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    // Dummy authentication for now
    if (username && password) {
      localStorage.setItem('loggedIn', true); // simple flag
      navigate('/'); // redirect to home after login
    } else {
      alert('Enter username and password!');
    }
  };

  return (
    <div className="funky-gradient">
      <div className="login-container">
        <div className="palette-circle">
          <Palette size={50} color="white" />
        </div>
        <div className="form-text">
          <h2>Login</h2>
          <p className="welcome-text">Welcome to Art Showcase!</p>
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
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Button className="blue-btn" type="submit">
            Sign In
          </Button>
        </Form>

        <p className="form-text">
          Don't have an account? <span className="signup-link">Sign up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
