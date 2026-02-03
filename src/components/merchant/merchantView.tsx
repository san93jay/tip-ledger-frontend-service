import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface Table {
  id: string;
  code: string;
}

interface SummaryItem {
  count: number;
  totalAmountFils: number;
}

interface SummaryData {
  summary: Record<string, SummaryItem>;
}

export const MerchantDashboard: React.FC<{ merchantId: string }> = ({ merchantId }) => {
  const [summaryData, setSummaryData] = useState<SummaryData>({ summary: {} });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", password: "" });
  const [newTableCode, setNewTableCode] = useState("");
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchData = async () => {
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
        throw new Error("Backend error fetching merchant data");
      }

      const summaryJson = await summaryRes.json();
      const employeesJson = await empRes.json();
      const tablesJson = await tableRes.json();

      setSummaryData(summaryJson);
      setEmployees(employeesJson);
      setTables(tablesJson);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (merchantId && token) {
      fetchData();
    }
  }, [merchantId, token]);

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Create employee
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/merchants/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEmployee),
      });

      if (!res.ok) {
        const err = await res.json();
        const msg = err.message?.message || err.message || "Failed to create employee";
        setError(msg);
        setSuccess(null);
        return;
      }

      setNewEmployee({ name: "", email: "", password: "" });
      setError(null);
      setSuccess("Employee created successfully!");
      await fetchData();
    } catch (err) {
      setError((err as Error).message);
      setSuccess(null);
    }
  };

  // Create table
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
      if (!newTableCode.trim()) {
      setError("Table code is required");
      setSuccess(null);
      return;
    }
    if (newTableCode.length < 2) {
      setError("Table code must be at least 2 characters long");
      setSuccess(null);
      return;
    }
    if (!/^[A-Za-z0-9_-]+$/.test(newTableCode)) {
      setError("Table code can only contain letters, numbers, dashes, or underscores");
      setSuccess(null);
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/merchants/tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: newTableCode }),
      });

      if (!res.ok) {
        const err = await res.json();
        const msg = err.message?.message || err.message || "Failed to create table";
        setError(msg);
        setSuccess(null);
        return;
      }

      const created = await res.json();
      setTables(prev => [...prev, created.table ?? created]);
      setNewTableCode("");
      setError(null);
      setSuccess("Table created successfully!");
      await fetchData();
    } catch (err) {
      setError((err as Error).message);
      setSuccess(null);
    }
  };

  if (!summaryData) return null;

  return (
    <div className="merchant-page">
      <header className="header">
        <h1 className="page-title">Merchant Dashboard</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Exception and success messages */}
      <div>{error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
          {success}
        </div>
      )}
     </div>
      {/* Tips Summary */}
      <section className="section">
        <h2 className="section-title">Tips Summary</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>Total Amount (fils)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summaryData.summary).map(([status, { count, totalAmountFils }]) => (
              <tr key={status}>
                <td>{status}</td>
                <td>{count}</td>
                <td>{totalAmountFils}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Employees Section */}
      <section className="section">
        <h2 className="section-title">Employees</h2>
        <form onSubmit={handleCreateEmployee} className="form">
          <input
            type="text"
            placeholder="Name"
            value={newEmployee.name}
            onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
            className="input"
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmployee.email}
            onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
            className="input"
          />
          <input
            type="password"
            placeholder="Password"
            value={newEmployee.password}
            onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })}
            className="input"
          />
          <button type="submit" className="button button-blue">Add Employee</button>
        </form>
        <ul className="list">
          {employees.map(emp => (
            <li key={emp.id}>{emp.name} ({emp.email})</li>
          ))}
        </ul>
      </section>

      {/* Tables Section */}
      <section className="section">
        <h2 className="section-title">Tables</h2>
        <form onSubmit={handleCreateTable} className="form">
          <input
            type="text"
            placeholder="Table Code"
            value={newTableCode}
            onChange={e => setNewTableCode(e.target.value)}
            className="input"
          />
          <button type="submit" className="button button-blue">Add Table</button>
        </form>
        <ul className="list">
          {tables.map(t => (
            <li key={t.id}>{t.code}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};