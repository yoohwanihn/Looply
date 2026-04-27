import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage/LoginPage.jsx'
import TimelinePage from './pages/TimelinePage/TimelinePage.jsx'
import ProfilePage from './pages/ProfilePage/ProfilePage.jsx'
import ProfileEditPage from './pages/ProfileEditPage/ProfileEditPage.jsx'
import PostDetailPage from './pages/PostDetailPage/PostDetailPage.jsx'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><TimelinePage /></PrivateRoute>} />
        <Route path="/profile/edit" element={<PrivateRoute><ProfileEditPage /></PrivateRoute>} />
        <Route path="/profile/:id" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/posts/:id" element={<PrivateRoute><PostDetailPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
