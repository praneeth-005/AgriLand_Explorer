import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGIN_BG_IMAGE } from '../constants/utils';
import { supabase } from '../supabaseClient.js';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        
        if (data?.session) {
          // Supabase auto-login is enabled. 
          // App.js's onAuthStateChange listener will automatically detect the session and redirect the user.
        } else {
          // Supabase is waiting for email confirmation.
          setErrorMsg('Sign up successful! Please check your email to confirm your account.');
          setIsSignUp(false); // Switch to the login view so they can log in after confirming
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      
      {/* Left Side: Premium Image Cover */}
      <div className="hidden lg:block lg:w-5/12 relative h-screen overflow-hidden">
        <img 
          src={LOGIN_BG_IMAGE} 
          alt="Secure login background" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
        <div className="absolute bottom-16 left-16 max-w-md z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 shadow-lg">
             <span className="material-symbols-outlined text-white text-2xl">compost</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4 drop-shadow-md">Secure Enterprise Access</h2>
          <p className="text-gray-300 leading-relaxed font-medium drop-shadow-sm">
            Access your agricultural dashboard, manage field teams, and review high-resolution satellite data with industry-leading security.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-7/12 flex flex-col lg:justify-center p-8 sm:p-16 lg:p-24 relative min-h-screen lg:min-h-0">
         {/* Back button */}
         <button 
           onClick={() => navigate('/welcome')}
           className="lg:absolute lg:top-12 lg:left-12 flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors mb-12 lg:mb-0 self-start"
         >
           <span className="material-symbols-outlined text-[20px]">arrow_back</span>
           Back to Home
         </button>

         <div className="w-full max-w-md mx-auto lg:mx-0 flex-grow lg:flex-grow-0 flex flex-col justify-center">
            <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="text-gray-500 mb-10 font-medium">Please enter your credentials to continue.</p>

            {errorMsg && (
              <div className={`mb-6 p-4 rounded-lg font-bold text-sm ${errorMsg.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
               {isSignUp && (
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                   <div className="relative">
                     <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <span className="material-symbols-outlined text-gray-400">person</span>
                     </span>
                     <input 
                       type="text" 
                       value={fullName}
                       onChange={(e) => setFullName(e.target.value)}
                       className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006e2f] focus:ring-4 focus:ring-green-50 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                       placeholder="John Doe"
                       required={isSignUp}
                     />
                   </div>
                 </div>
               )}
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                 <div className="relative">
                   <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <span className="material-symbols-outlined text-gray-400">mail</span>
                   </span>
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006e2f] focus:ring-4 focus:ring-green-50 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                     placeholder="your@email.com"
                     required
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                 <div className="relative">
                   <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <span className="material-symbols-outlined text-gray-400">lock</span>
                   </span>
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#006e2f] focus:ring-4 focus:ring-green-50 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                     placeholder="••••••••"
                     required
                   />
                 </div>
               </div>

               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full flex items-center justify-center gap-2 bg-[#006e2f] hover:bg-[#005321] text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-green-900/20 disabled:opacity-70"
               >
                 {loading ? (
                   <span className="material-symbols-outlined animate-spin">refresh</span>
                 ) : (
                   <span className="material-symbols-outlined">{isSignUp ? 'person_add' : 'login'}</span>
                 )}
                 {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Secure Login')}
               </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
                className="text-[#006e2f] font-bold hover:underline"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
         </div>
      </div>
    </div>
  );
}
