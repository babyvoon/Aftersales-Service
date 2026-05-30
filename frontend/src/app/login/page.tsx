'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = username.trim().toLowerCase();
    
    // Simulate authentication and map to role
    if (user === 'admin') {
      sessionStorage.setItem('simulated_role', 'ADMIN');
      sessionStorage.setItem('simulated_username', 'Administrator');
      router.push('/');
    } else if (user === 'advisor' || user === 'service_advisor') {
      sessionStorage.setItem('simulated_role', 'SERVICE_ADVISOR');
      sessionStorage.setItem('simulated_username', 'Service Advisor');
      router.push('/');
    } else if (user === 'mechanic') {
      sessionStorage.setItem('simulated_role', 'MECHANIC');
      sessionStorage.setItem('simulated_username', 'John Doe (Mechanic)');
      router.push('/');
    } else {
      setError('Invalid credentials! Try: "admin", "advisor", or "mechanic"');
    }
  };

  const handleQuickLogin = (role: 'admin' | 'advisor' | 'mechanic') => {
    setError(null);
    if (role === 'admin') {
      sessionStorage.setItem('simulated_role', 'ADMIN');
      sessionStorage.setItem('simulated_username', 'Administrator');
    } else if (role === 'advisor') {
      sessionStorage.setItem('simulated_role', 'SERVICE_ADVISOR');
      sessionStorage.setItem('simulated_username', 'Service Advisor');
    } else if (role === 'mechanic') {
      sessionStorage.setItem('simulated_role', 'MECHANIC');
      sessionStorage.setItem('simulated_username', 'John Doe (Mechanic)');
    }
    router.push('/');
  };

  return (
    <div className="login-page-container">
      {/*ring div starts here*/}
      <div className="login-ring">
        <i style={{ '--clr': '#00ff0a' } as React.CSSProperties}></i>
        <i style={{ '--clr': '#ff0057' } as React.CSSProperties}></i>
        <i style={{ '--clr': '#fffd44' } as React.CSSProperties}></i>
        
        <form onSubmit={handleSubmit} className="login">
          <h2>Login</h2>
          
          <div className="inputBx">
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="inputBx">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="error-msg">{error}</div>}
          
          <div className="inputBx">
            <input type="submit" value="Sign in" />
          </div>
          
          <div className="links">
            <a href="#" onClick={(e) => e.preventDefault()}>Forget Password</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Signup</a>
          </div>

          <div className="quick-roles-container">
            <p>Quick Simulator Login</p>
            <div className="quick-roles">
              <button type="button" onClick={() => handleQuickLogin('advisor')} style={{ '--role-clr': '#00ff0a' } as React.CSSProperties}>Advisor</button>
              <button type="button" onClick={() => handleQuickLogin('admin')} style={{ '--role-clr': '#ff0057' } as React.CSSProperties}>Admin</button>
              <button type="button" onClick={() => handleQuickLogin('mechanic')} style={{ '--role-clr': '#fffd44' } as React.CSSProperties}>Mechanic</button>
            </div>
          </div>
        </form>
      </div>
      {/*ring div ends here*/}

      {/* Guide details for mock roles */}
      <div className="help-guide">
        <p className="font-semibold text-slate-500 uppercase tracking-widest text-[10px] mb-1">Simulated User Credentials</p>
        <p className="text-[11px] text-slate-600">Username: <strong>admin</strong> | <strong>advisor</strong> | <strong>mechanic</strong></p>
        <p className="text-[10px] text-slate-700 italic mt-0.5">(Any password is accepted)</p>
      </div>
    </div>
  );
}
