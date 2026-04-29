import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/Sidebar/AppLayout.jsx'
import LoginPage from './pages/LoginPage/LoginPage.jsx'
import TimelinePage from './pages/TimelinePage/TimelinePage.jsx'
import ProfilePage from './pages/ProfilePage/ProfilePage.jsx'
import ProfileEditPage from './pages/ProfileEditPage/ProfileEditPage.jsx'
import PostDetailPage from './pages/PostDetailPage/PostDetailPage.jsx'
import PlaceholderPage from './pages/PlaceholderPage/PlaceholderPage.jsx'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken')
  return token ? children : <Navigate to="/login" replace />
}

function AuthLayout({ children }) {
  return (
    <PrivateRoute>
      <AppLayout>{children}</AppLayout>
    </PrivateRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AuthLayout><TimelinePage /></AuthLayout>} />
        <Route path="/search" element={<AuthLayout><PlaceholderPage title="검색" /></AuthLayout>} />
        <Route path="/following" element={<AuthLayout><PlaceholderPage title="팔로잉" /></AuthLayout>} />
        <Route path="/notifications" element={<AuthLayout><PlaceholderPage title="알림" /></AuthLayout>} />
        <Route path="/settings" element={<AuthLayout><PlaceholderPage title="설정" /></AuthLayout>} />
        <Route path="/profile/edit" element={<AuthLayout><ProfileEditPage /></AuthLayout>} />
        <Route path="/profile/:id" element={<AuthLayout><ProfilePage /></AuthLayout>} />
        <Route path="/posts/:id" element={<AuthLayout><PostDetailPage /></AuthLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
