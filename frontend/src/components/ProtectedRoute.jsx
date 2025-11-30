import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Ensure the value is explicitly "true"
  const isLoggedIn = localStorage.getItem('loggedIn') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
