import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Palette } from 'lucide-react';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      alert('Please fill in all fields!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate('/login');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
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
        <Form onSubmit={handleSignup}>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

export default Signup;