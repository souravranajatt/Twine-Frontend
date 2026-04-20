import "./App.css";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './Page/Login'; // Login Page
import Signup from './Page/Signup'; // Signup Page
import Main from './Page/Main'; // Main Page 
import Profile from './Page/Profile'; // Profile Page 
import ProtectedRoute from "./Components/ProtectedRoute"; // To Protect Pages 
import PublicRoute from "./Components/PublicRoute"; // To Protect Pages 
import NotFoundPage from "./ErrorHandler/ErrrorDesign/ErrorPageDesign";
import MyAccount from "./Page/MyAccount";

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

        <Route path='/settings/my-account' element={
          <ProtectedRoute>
            <MyAccount />
          </ProtectedRoute>
        } />


        {/* BEST PRACTICE: Catch-All */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
