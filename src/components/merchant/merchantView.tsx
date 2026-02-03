import React, { useEffect, useState } from 'react';

interface SummaryEntry {
  count: number;
  totalAmountFils: number;
}

interface SummaryResponse {
  merchantId: string;
  summary: Record<string, SummaryEntry>;
}

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface Table {
  id: string;
  code: string;
}

interface LedgerEntry {
  id: string;
  type: string;
  amountFils: number;
  createdAt: string;
  tipIntentId: string;
  employeeName?: string;
  tableCode?: string;
}

export const MerchantView: React.FC<{ merchantId: string }> = ({ merchantId }) => {
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', password: '' });
  const [newTableCode, setNewTableCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const [tips, setTips] = useState<LedgerEntry[]>([]); 

  const token = localStorage.getItem('token');

  // Fetch summary, employees, tables
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [summaryRes, empRes, tableRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/merchants/${merchantId}/tips/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.REACT_APP_API_URL}/merchants/employees`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.REACT_APP_API_URL}/merchants/tables`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!summaryRes.ok || !empRes.ok || !tableRes.ok) {
          throw new Error('Backend error fetching merchant data');
        }

        setSummaryData(await summaryRes.json());
        setEmployees(await empRes.json());
        setTables(await tableRes.json());
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    if (merchantId && token) fetchData();
  }, [merchantId, token]);

  // Create employee
  async function handleCreateEmployee(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${process.env.REACT_APP_API_URL}/merchants/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newEmployee),
    });
    if (res.ok) {
      const { employee } = await res.json();
      setEmployees(prev => [...prev, employee]);
      setNewEmployee({ name: '', email: '', password: '' });
    } else {
      alert('Failed to create employee');
    }
  }

  // Create table
  async function handleCreateTable(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${process.env.REACT_APP_API_URL}/merchants/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code: newTableCode }),
    });
    if (res.ok) {
      const { table } = await res.json();
      setTables(prev => [...prev, table]);
      setNewTableCode('');
    } else {
      alert('Failed to create table');
    }
  }

  if (loading) return <p>Loading merchant data…</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!summaryData) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Merchant Dashboard</h1>

      {/* Tips Summary */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tips Summary</h2>
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Count</th>
              <th className="border px-4 py-2 text-left">Total Amount (fils)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summaryData.summary).map(([status, { count, totalAmountFils }]) => (
              <tr key={status}>
                <td className="border px-4 py-2">{status}</td>
                <td className="border px-4 py-2">{count}</td>
                <td className="border px-4 py-2">{totalAmountFils}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Employees Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Employees</h2>
        <form onSubmit={handleCreateEmployee} className="space-y-2 mb-4">
          <input
            type="text"
            placeholder="Name"
            value={newEmployee.name}
            onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmployee.email}
            onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
          <input
            type="password"
            placeholder="Password"
            value={newEmployee.password}
            onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Add Employee
          </button>
        </form>
        <ul>
          {employees.map(emp => (
            <li key={emp.id}>{emp.name} ({emp.email})</li>
          ))}
        </ul>
      </section>

      {/* Tables Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Tables</h2>
        <form onSubmit={handleCreateTable} className="space-y-2 mb-4">
          <input
            type="text"
            placeholder="Table Code"
            value={newTableCode}
            onChange={e => setNewTableCode(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Add Table
          </button>
        </form>
        <ul>
          {tables.map(t => (
            <li key={t.id}>{t.code}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};