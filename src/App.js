import "./App.css";
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './AuthChecker/AuthContext';
import Login from './Page/Login'; // Login Page
import Signup from './Page/Signup'; // Signup Page
import Main from './Page/Main'; // Main Page 
import Profile from './Page/Profile'; // Profile Page 
import Settings from './Page/Settings'; // Settings Page
import Post from './Page/Post'; // Post Page
import UserRecommendation from './Page/UserRecommendation'; // User Recommendation Page
import FollowRequest from './Page/FollowRequest'; // Follow Request Page
import ProtectedRoute from "./AuthChecker/ProtectedRoute"; // To Protect Pages 
import PublicRoute from "./AuthChecker/PublicRoute"; // To Protect Pages 
import NotFoundPage from "./ErrorHandler/ErrrorDesign/ErrorPageDesign";

/* Scroll to top on every route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>

          {/* Public Routes */}
          <Route path='/login' element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path='/signup' element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path='/' element={
            <ProtectedRoute>
              <Main />
            </ProtectedRoute>
          } />

          <Route path='/people/recommendations' element={
            <ProtectedRoute>
              <UserRecommendation />
            </ProtectedRoute>
          } />

          <Route path='/people/follow-requests' element={
            <ProtectedRoute>
              <FollowRequest />
            </ProtectedRoute>
          } />

          <Route path='/:username' element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path='/:username/:tab' element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path='/account/settings' element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path='/:username/posts/:postId' element={
            <ProtectedRoute>
              <Post />
            </ProtectedRoute>
          } />


          {/* Catch-All */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
