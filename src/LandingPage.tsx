import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'signup';

const LandingPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

    if (!res.ok) {
        const errorData = await res.json();
        const msg =
            typeof errorData.message === 'string'
            ? errorData.message
            : errorData.message?.message || 'Auth failed';
        throw new Error(msg);
    }

    const { access_token, role, merchantId, employeeId } = await res.json();
        localStorage.setItem('token', access_token);
        localStorage.setItem('role', role);

        if (role === 'merchant') {
        localStorage.setItem('merchantId', merchantId);
        navigate(`/merchants/${merchantId}/tips/summary`);
        } else if (role === 'employee') {
        localStorage.setItem('employeeId', employeeId);
        navigate(`/employees/${employeeId}/tips`);
        }
    } catch (err) {
      console.error(err);
       alert((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {mode === 'login' ? 'Welcome To ECom Payments' : 'Create Your Account'}
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <input name="name" type="text" placeholder="Full Name" className="w-full border rounded px-3 py-2" />
          )}
          <input name="email" type="email" placeholder="Email" className="w-full border rounded px-3 py-2" />
          <input name="password" type="password" placeholder="Password" className="w-full border rounded px-3 py-2" />
          {mode === 'signup' && (
            <select name="role" className="w-full border rounded px-3 py-2">
              <option value="employee">Employee</option>
              <option value="merchant">Merchant</option>
            </select>
          )}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="text-sm text-center mt-2">
          {mode === 'login' ? (
            <>Don’t have an account? <button type="button" onClick={() => setMode('signup')} className="text-blue-600 underline">Sign up</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => setMode('login')} className="text-blue-600 underline">Login</button></>
          )}
        </p>
      </div>
    </div>
  );
};

export default LandingPage;