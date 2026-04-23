import "./App.css";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './Page/Login'; // Login Page
import Signup from './Page/Signup'; // Signup Page
import Main from './Page/Main'; // Main Page 
import Profile from './Page/Profile'; // Profile Page 
import Settings from './Page/Settings'; // Settings Page
import ProtectedRoute from "./AuthChecker/ProtectedRoute"; // To Protect Pages 
import PublicRoute from "./AuthChecker/PublicRoute"; // To Protect Pages 
import NotFoundPage from "./ErrorHandler/ErrrorDesign/ErrorPageDesign";

function App() {
  return (
    <BrowserRouter>
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


        {/* BEST PRACTICE: Catch-All */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
