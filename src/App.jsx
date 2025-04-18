import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home_new_fixed'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import CosmicExplorer from './pages/CosmicExplorer'
import CosmicInsights from './pages/CosmicInsights'
import CreateNode from './pages/CreateNode'
import CreateConnection from './pages/CreateConnection'
import GenerateInsights from './pages/GenerateInsights'
import PromptTemplates from './pages/PromptTemplates'
import CosmicHub from './pages/CosmicHub'
import CosmicConnections from './pages/CosmicConnections'
import CosmicDiscoveries from './pages/CosmicDiscoveries'
import NodeDetails from './pages/NodeDetails'
import EditNode from './pages/EditNode'
import CreateCosmic from './pages/CreateCosmic'
import AuthRedirectHandler from './components/AuthRedirectHandler'
import AuthCallback from './pages/AuthCallback'
import RegistrationSuccess from './pages/RegistrationSuccess'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import SimpleMouseTrail from './components/SimpleMouseTrail'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        {/* Sparkle effects */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse" style={{ top: '10%', left: '20%', animationDelay: '0.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
          <div className="absolute h-1 w-1 rounded-full bg-indigo-400 animate-pulse" style={{ top: '30%', left: '80%', animationDelay: '1.2s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
          <div className="absolute h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ top: '70%', left: '15%', animationDelay: '0.7s', boxShadow: '0 0 8px 2px rgba(96, 165, 250, 0.8)' }}></div>
          <div className="absolute h-1 w-1 rounded-full bg-purple-400 animate-pulse" style={{ top: '40%', left: '60%', animationDelay: '1.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-800 to-indigo-800 flex items-center justify-center text-white relative overflow-hidden mb-6"
            style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)' }}>
            <i className="bi bi-stars text-3xl relative z-10"></i>
            <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
              style={{
                animationDuration: '3s',
                boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
              }}>
            </div>
          </div>
          <h2 className="text-2xl font-medium text-purple-200 mb-2">Cosmic Knowledge Nexus</h2>
          <p className="text-purple-400">Aligning celestial connections...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Add the AuthRedirectHandler to handle authentication redirects */}
      <AuthRedirectHandler />

      {/* Add mouse trail effect globally */}
      <SimpleMouseTrail />

      <Routes>
        {/* Auth callback route - outside of Layout to handle redirects */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="registration-success" element={!user ? <RegistrationSuccess /> : <Navigate to="/dashboard" />} />

          {/* Protected Routes */}
          <Route path="dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="map" element={user ? <CosmicExplorer /> : <Navigate to="/login" />} />
          <Route path="insights" element={<Navigate to="/cosmic-insights" />} />
          <Route path="cosmic-insights" element={user ? <CosmicInsights /> : <Navigate to="/login" />} />
          <Route path="profile" element={user ? <Profile /> : <Navigate to="/login" />} />

          {/* New Cosmic Pages */}
          <Route path="cosmic-hub" element={user ? <CosmicHub /> : <Navigate to="/login" />} />
          <Route path="cosmic-connections" element={user ? <CosmicConnections /> : <Navigate to="/login" />} />
          <Route path="cosmic-discoveries" element={user ? <CosmicDiscoveries /> : <Navigate to="/login" />} />

          {/* New dedicated creation pages */}
          <Route path="create-node" element={user ? <CreateNode /> : <Navigate to="/login" />} />
          <Route path="create-connection" element={user ? <CreateConnection /> : <Navigate to="/login" />} />
          <Route path="generate-insights" element={user ? <GenerateInsights /> : <Navigate to="/login" />} />
          <Route path="prompt-templates" element={user ? <PromptTemplates /> : <Navigate to="/login" />} />
          <Route path="create-cosmic" element={user ? <CreateCosmic /> : <Navigate to="/login" />} />

          {/* Node details and editing */}
          <Route path="node/:nodeId" element={user ? <NodeDetails /> : <Navigate to="/login" />} />
          <Route path="edit-node/:nodeId" element={user ? <EditNode /> : <Navigate to="/login" />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
