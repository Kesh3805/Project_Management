import React from 'react';

const Login = () => {
  const handleGitHubLogin = () => {
    // Redirect to backend GitHub OAuth
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/github`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-floating"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-floating" style={{animationDelay: '2s'}}></div>
      <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-floating" style={{animationDelay: '4s'}}></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Login Card */}
        <div className="glass-dark backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center scale-in border border-white/20">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="relative mx-auto mb-6 w-24 h-24">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50"></div>
              {/* Icon container */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-5xl">📋</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 gradient-text">
              ProjectHub
            </h1>
            <p className="text-white/80 text-lg">
              Next-Gen Project Management
            </p>
          </div>

          {/* Features */}
          <div className="mb-8 text-left space-y-4">
            <div className="flex items-center space-x-4 glass p-3 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white font-medium">Track tasks and projects</span>
            </div>
            <div className="flex items-center space-x-4 glass p-3 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white font-medium">GitHub repository integration</span>
            </div>
            <div className="flex items-center space-x-4 glass p-3 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white font-medium">Auto-sync with commits</span>
            </div>
            <div className="flex items-center space-x-4 glass p-3 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white font-medium">Real-time collaboration</span>
            </div>
          </div>

          {/* GitHub Login Button */}
          <button
            onClick={handleGitHubLogin}
            className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-3 shadow-xl border border-white/20"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="text-lg">Login with GitHub</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Info */}
          <div className="mt-6 flex items-center justify-center space-x-2">
            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm text-white/60">
              Secure authentication via GitHub OAuth
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center space-y-3">
          <div className="glass backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <p className="text-white/90 font-medium">© 2025 ProjectHub</p>
            <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-white/70">
              <span className="badge badge-primary">MongoDB</span>
              <span className="badge badge-success">Express</span>
              <span className="badge badge-info">React</span>
              <span className="badge badge-warning">Node.js</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
