import React, { useState } from 'react';

export const Login: React.FC<{ onLogin: (role: 'merchant' | 'employee', id: string) => void }> = ({ onLogin }) => {
  const [role, setRole] = useState<'merchant' | 'employee'>('merchant');
  const [id, setId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(role, id);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-xl mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <select value={role} onChange={e => setRole(e.target.value as 'merchant' | 'employee')}>
          <option value="merchant">Merchant</option>
          <option value="employee">Employee</option>
        </select>
        <input
          type="text"
          placeholder="Enter ID"
          value={id}
          onChange={e => setId(e.target.value)}
          className="border p-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">Login</button>
      </form>
    </div>
  );
};