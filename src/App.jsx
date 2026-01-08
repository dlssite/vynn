import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import LoginCallback from './pages/LoginCallback'
import Profile from './pages/Profile'
import Onboarding from './pages/Onboarding'
import ProtectedRoute from './components/ProtectedRoute'

// Dashboard Modules
import DashboardLayout from './pages/dashboard/Layout'
import Account from './pages/dashboard/Account'
import Analytics from './pages/dashboard/account/Analytics'
import Badges from './pages/dashboard/account/Badges'
import Settings from './pages/dashboard/account/Settings'
import Links from './pages/dashboard/Links'
import Design from './pages/dashboard/Design'
import Premium from './pages/dashboard/Premium'
import Templates from './pages/dashboard/Templates'
import Store from './pages/dashboard/Store'
import ForgeGallery from './pages/dashboard/ForgeGallery'
import Referrals from './pages/dashboard/Referrals'
import ReferralRedirect from './pages/ReferralRedirect'

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/callback" element={<LoginCallback />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route path="/r/:code" element={<ReferralRedirect />} />
            <Route path="/onboarding" element={
                <ProtectedRoute>
                    <Onboarding />
                </ProtectedRoute>
            } />

            {/* Dashboard Routes (Command Center) */}
            <Route path="/dashboard" element={<Navigate to="/account" replace />} />

            {/* Account Namespace */}
            <Route path="/account" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <Account />
                    </DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/account/analytics" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <Analytics />
                    </DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/account/badges" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <Badges />
                    </DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/account/settings" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <Settings />
                    </DashboardLayout>
                </ProtectedRoute>
            } />

            <Route path="/links" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <Links />
                    </DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/design" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <Design />
                    </DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/templates" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <Templates />
                    </DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/premium" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <Premium />
                    </DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/store" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <Store />
                    </DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/referrals" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <Referrals />
                    </DashboardLayout>
                </ProtectedRoute>
            } />
            <Route path="/forge" element={
                <ProtectedRoute>
                    <DashboardLayout>
                        <ForgeGallery />
                    </DashboardLayout>
                </ProtectedRoute>
            } />

            {/* Public profile - must be last */}
            <Route path="/:username" element={<Profile />} />
        </Routes>
    )
}

export default App
