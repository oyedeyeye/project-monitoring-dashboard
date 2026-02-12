import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        console.log('Login: Attempting login for', email);

        try {
            const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                console.error('Login: Auth error:', authError.message);
                throw authError;
            }

            console.log('Login: Auth successful, session established.');

            if (session?.user) {
                // Fetch profile to know where to redirect
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profileError) {
                    console.error('Login: Error fetching profile:', profileError);
                } else {
                    console.log('Login: Profile fetched:', profileData);
                }

                // Explicitly cast or handle the type if inference fails
                const userRole = profileData?.role;
                console.log('Login: Redirecting based on role:', userRole);

                if (userRole === 'super_user') {
                    navigate('/admin');
                } else if (userRole === 'approver') {
                    navigate('/approvals');
                } else {
                    navigate('/dashboard'); // Default for 'user' or null
                }
            }
        } catch (err: any) {
            console.error('Login: Caught error during login process:', err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen relative overflow-hidden font-sans text-dark p-4">

            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-[rgba(255,165,0,0.2)] to-[rgba(255,107,0,0.8)] rounded-bl-full -z-10 top-curve"></div>

            <div className="w-full max-w-[420px] p-5 text-center flex flex-col items-center">

                {/* Top Logo */}
                <img
                    src="/ONDO STATE Logo.png"
                    alt="Ondo State Logo"
                    className="max-w-[180px] h-auto mb-5 object-contain"
                />

                <h1 className="font-serif text-[1.8rem] mb-2 text-[#2c1e16]">Governor's Dashboard</h1>
                <p className="text-[#5d4037] text-[0.95rem] mb-[30px]">Sign in to manage and update project reports</p>

                {/* Login Card */}
                <div className="bg-white/90 backdrop-blur-md border border-black/5 rounded-[20px] p-[30px] w-full shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="relative mb-[15px] input-group">
                            <i className="fa-solid fa-envelope absolute left-[15px] top-1/2 -translate-y-1/2 text-[#a67c52]"></i>
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                className="w-full py-[14px] pr-[14px] pl-[45px] border border-[#e0e0e0] bg-[#f5f5f5] rounded-[12px] text-[1rem] text-[#2c1e16] outline-none transition-colors duration-300 focus:border-[#ff6b00] focus:bg-white placeholder:text-[#999]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="relative mb-[15px] input-group">
                            <i className="fa-solid fa-lock absolute left-[15px] top-1/2 -translate-y-1/2 text-[#a67c52]"></i>
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                className="w-full py-[14px] pr-[14px] pl-[45px] border border-[#e0e0e0] bg-[#f5f5f5] rounded-[12px] text-[1rem] text-[#2c1e16] outline-none transition-colors duration-300 focus:border-[#ff6b00] focus:bg-white placeholder:text-[#999]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <a href="#" className="block text-right text-[#bf6020] text-[0.85rem] no-underline mt-[-5px] mb-[25px] hover:underline">
                            Forgot password?
                        </a>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full p-[14px] bg-gradient-to-b from-[#ff8c33] to-[#e65100] text-white border-none rounded-[30px] text-[1.1rem] font-semibold cursor-pointer shadow-[0_4px_15px_rgba(230,81,0,0.3)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(230,81,0,0.4)] mb-5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>

                        <div className="flex items-center justify-center gap-2 text-[#5d4037] text-[0.85rem]">
                            <i className="fa-solid fa-lock text-[#a67c52]"></i>
                            <span>Secure Ondo State PPIMU System</span>
                        </div>
                    </form>
                </div>

                {/* Bottom Logo */}
                <img
                    src="/PPIMU Logo.png"
                    alt="PPIMU Logo"
                    className="mt-5 max-w-[120px] h-auto object-contain"
                />
            </div>
        </div>
    );
};

export default Login;
