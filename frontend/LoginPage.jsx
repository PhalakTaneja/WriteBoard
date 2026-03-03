import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage({ onLoginSuccess }) {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                onLoginSuccess(data);
            }else {
                setErrorMsg(data.message || 'Login failed');
            }} catch (error) {
                setErrorMsg('Server error. Please try again later.');
            }
    };
    const handleRegister = async () => {
        setErrorMsg('');
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                setErrorMsg('Registration successful! Please log in.');
            }
            else {
                setErrorMsg(data.message || 'Registration failed');
            }
        } catch (error) {
            setErrorMsg('Server error. Please try again later.');
        }};
    return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#F5F3FF]">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E6E6FA]/20 rounded-full blur-3xl"></div>

      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
          
          <div className="hidden md:flex flex-col items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1650783756081-f235c2c76b6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBjb2xsYWJvcmF0aW5nJTIwZHJhd2luZyUyMGNyZWF0aXZlJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc3MjM2ODI3Mnww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="People collaborating and drawing"
              className="w-full max-w-md rounded-2xl shadow-lg"
            />
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-semibold text-[#5B4E8B] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Create Together, Grow Together
              </h2>
              <p className="text-[#6B7280] max-w-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Join thousands of artists collaborating in real-time on creative doodles
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div 
                className="bg-white rounded-2xl shadow-xl p-8 border border-[#E5E7EB]"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-[#C8B6E2] rounded-xl mb-4">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-semibold text-[#5B4E8B] mb-2">Let's Doodle!</h1>
                  <p className="text-[#9CA3AF]">Sign in to continue your creative journey</p>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-[#6B7280] mb-2">Username</label>
                    <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8B6E2] focus:border-transparent transition-all placeholder:text-[#D1D5DB]" required />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[#6B7280] mb-2">Password</label>
                    <div className="relative">
                      <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 pr-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8B6E2] focus:border-transparent transition-all placeholder:text-[#D1D5DB]" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 py-3 px-4 bg-[#C8B6E2] text-white font-semibold rounded-xl hover:bg-[#B8A6D2] shadow-sm hover:shadow-md transition-all duration-200">
                      Login
                    </button>
                    <button type="button" onClick={handleRegister} className="flex-1 py-3 px-4 bg-white border-2 border-[#C8B6E2] text-[#8B7BA8] font-semibold rounded-xl hover:bg-[#F5F3FF] transition-all duration-200">
                      Register
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}