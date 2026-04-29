import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/Sidebar/AppLayout.jsx'
import LoginPage from './pages/LoginPage/LoginPage.jsx'
import TimelinePage from './pages/TimelinePage/TimelinePage.jsx'
import ProfilePage from './pages/ProfilePage/ProfilePage.jsx'
import ProfileEditPage from './pages/ProfileEditPage/ProfileEditPage.jsx'
import PostDetailPage from './pages/PostDetailPage/PostDetailPage.jsx'
import SearchPage from './pages/SearchPage/SearchPage.jsx'
import FollowingPage from './pages/FollowingPage/FollowingPage.jsx'
import NotificationsPage from './pages/NotificationsPage/NotificationsPage.jsx'
import SettingsPage from './pages/SettingsPage/SettingsPage.jsx'
import FollowManagePage from './pages/FollowManagePage/FollowManagePage.jsx'

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
        <Route path="/search" element={<AuthLayout><SearchPage /></AuthLayout>} />
        <Route path="/following" element={<AuthLayout><FollowingPage /></AuthLayout>} />
        <Route path="/notifications" element={<AuthLayout><NotificationsPage /></AuthLayout>} />
        <Route path="/settings" element={<AuthLayout><SettingsPage /></AuthLayout>} />
        <Route path="/follow-manage" element={<AuthLayout><FollowManagePage /></AuthLayout>} />
        <Route path="/profile/edit" element={<AuthLayout><ProfileEditPage /></AuthLayout>} />
        <Route path="/profile/:id" element={<AuthLayout><ProfilePage /></AuthLayout>} />
        <Route path="/posts/:id" element={<AuthLayout><PostDetailPage /></AuthLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
