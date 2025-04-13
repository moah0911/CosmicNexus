import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { supabase } from '../lib/supabase'

const Profile = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [isExporting, setIsExporting] = useState(false)
  
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match')
    }
    
    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })
      
      if (error) throw error
      
      toast.success('Password updated successfully')
      setIsChangingPassword(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error(error.message || 'Failed to update password')
    }
  }
  
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleExportData = async () => {
    try {
      setIsExporting(true)
      
      // Fetch all user data
      const [nodesResult, connectionsResult, promptsResult] = await Promise.all([
        supabase.from('interest_nodes').select('*'),
        supabase.from('connections').select('*'),
        supabase.from('discovery_prompts').select('*')
      ])
      
      if (nodesResult.error) throw nodesResult.error
      if (connectionsResult.error) throw connectionsResult.error
      if (promptsResult.error) throw promptsResult.error
      
      // Prepare export data
      const exportData = {
        user: {
          email: user.email,
          id: user.id,
          exportDate: new Date().toISOString()
        },
        interests: nodesResult.data || [],
        connections: connectionsResult.data || [],
        discoveryPrompts: promptsResult.data || []
      }
      
      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `resonance-map-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Data exported successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }
  
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    )
    
    if (!confirmed) return
    
    try {
      // Delete user data first
      await Promise.all([
        supabase.from('interest_nodes').delete().eq('user_id', user.id),
        supabase.from('connections').delete().eq('user_id', user.id),
        supabase.from('discovery_prompts').delete().eq('user_id', user.id)
      ])
      
      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      
      if (error) throw error
      
      await signOut()
      navigate('/')
      toast.success('Your account has been deleted')
    } catch (error) {
      toast.error(error.message || 'Failed to delete account')
    }
  }
  
  return (
    <div className="relative">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute h-64 w-64 rounded-full border-2 border-purple-300/20 top-10 -left-20 animate-spin-slow"></div>
        <div className="absolute h-96 w-96 rounded-full border-2 border-indigo-300/20 bottom-10 -right-40 animate-spin-slow" style={{ animationDuration: '120s' }}></div>
        <div className="absolute h-40 w-40 rounded-full border-2 border-purple-300/20 bottom-40 left-1/4 animate-spin-slow" style={{ animationDuration: '80s' }}></div>
        <div className="absolute h-20 w-20 rounded-full bg-purple-400/5 animate-float" style={{ top: '10%', right: '5%', animationDelay: '0s' }}></div>
        <div className="absolute h-32 w-32 rounded-full bg-indigo-400/5 animate-float" style={{ top: '60%', left: '15%', animationDelay: '1s' }}></div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-sm font-medium mb-4 shadow-lg">
            Cosmic Identity
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700">
            Your Cosmic Profile
          </h1>
          <p className="text-lg text-neutral-700 max-w-3xl">
            Manage your cosmic identity and control your journey through the knowledge universe.
          </p>
        </div>
        
        {/* Account Information */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border-2 border-purple-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-bl-full -z-10"></div>
          
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg mr-4">
              <i className="bi bi-person-circle text-2xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700">
              Cosmic Identity
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                <i className="bi bi-envelope-fill mr-2 text-indigo-500"></i>
                Email Address
              </label>
              <div className="flex items-center">
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-100 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-purple-800 font-medium"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                <i className="bi bi-calendar-event mr-2 text-indigo-500"></i>
                Account Created
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={user?.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-100 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-purple-800 font-medium"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-purple-700 mb-2">
                <i className="bi bi-fingerprint mr-2 text-indigo-500"></i>
                Cosmic ID
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={user?.id || ''}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-100 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-purple-800 font-medium"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Security */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border-2 border-purple-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-br-full -z-10"></div>
          
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg mr-4">
              <i className="bi bi-shield-lock text-2xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
              Cosmic Security
            </h2>
          </div>
          
          {isChangingPassword ? (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-indigo-700 mb-2">
                  <i className="bi bi-key-fill mr-2 text-purple-500"></i>
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Enter your current password"
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-indigo-700 mb-2">
                  <i className="bi bi-unlock-fill mr-2 text-purple-500"></i>
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Create a new password"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-indigo-700 mb-2">
                  <i className="bi bi-check-circle-fill mr-2 text-purple-500"></i>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Confirm your new password"
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-6 py-3 rounded-xl border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 transition-all duration-300"
                >
                  <i className="bi bi-x-circle mr-2"></i> Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]"
                >
                  <i className="bi bi-check-circle mr-2"></i> Update Password
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-6 py-3 rounded-xl border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 transition-all duration-300 flex items-center"
            >
              <i className="bi bi-key mr-2 text-lg"></i>
              <span>Change Cosmic Password</span>
            </button>
          )}
        </div>
        
        {/* Data Management */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border-2 border-purple-100 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-400/10 to-indigo-400/10 rounded-tl-full -z-10"></div>
          
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg mr-4">
              <i className="bi bi-database text-2xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700">
              Cosmic Data Management
            </h2>
          </div>
          
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-100">
              <h3 className="text-xl font-bold text-purple-800 mb-3 flex items-center">
                <i className="bi bi-cloud-download text-indigo-600 mr-3"></i>
                Export Your Cosmic Data
              </h3>
              <p className="text-neutral-700 mb-4">
                Download a complete archive of your knowledge nodes, cosmic connections, and celestial discoveries.
              </p>
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] flex items-center"
              >
                {isExporting ? (
                  <i className="bi bi-arrow-repeat animate-spin mr-2 text-lg"></i>
                ) : (
                  <i className="bi bi-download mr-2 text-lg"></i>
                )}
                <span>{isExporting ? 'Preparing Cosmic Archive...' : 'Export Cosmic Data'}</span>
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-100">
              <h3 className="text-xl font-bold text-red-800 mb-3 flex items-center">
                <i className="bi bi-exclamation-triangle text-red-600 mr-3"></i>
                Cosmic Danger Zone
              </h3>
              <p className="text-neutral-700 mb-4">
                Permanently delete your cosmic identity and all associated data from the universe. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] flex items-center"
              >
                <i className="bi bi-trash mr-2 text-lg"></i>
                <span>Delete Cosmic Identity</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Privacy */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border-2 border-purple-100 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-400/10 to-purple-400/10 rounded-tr-full -z-10"></div>
          
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg mr-4">
              <i className="bi bi-shield-check text-2xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
              Cosmic Privacy
            </h2>
          </div>
          
          <p className="text-lg text-neutral-700 mb-8 border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50 rounded-r-lg">
            At Cosmic Nexus, we take your privacy seriously. Your data is stored securely in your own cosmic vault and is never shared with third parties.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-shield-lock text-3xl text-purple-600"></i>
              </div>
              <h3 className="font-bold text-center text-purple-800 mb-2">Private by Design</h3>
              <p className="text-neutral-700 text-center text-sm">
                Your knowledge nodes, connections, and AI-generated insights remain completely private in your cosmic vault.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-database-lock text-3xl text-indigo-600"></i>
              </div>
              <h3 className="font-bold text-center text-indigo-800 mb-2">Secure Data Storage</h3>
              <p className="text-neutral-700 text-center text-sm">
                Your cosmic data is stored securely with advanced encryption and protected by industry-standard security measures.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-eye-slash text-3xl text-purple-600"></i>
              </div>
              <h3 className="font-bold text-center text-purple-800 mb-2">No Tracking</h3>
              <p className="text-neutral-700 text-center text-sm">
                We don't track your cosmic activity for advertising or share your data with third-party entities across the universe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
