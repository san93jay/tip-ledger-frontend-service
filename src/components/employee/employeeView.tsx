import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LedgerEntry {
  id: string;
  type: string;
  amountFils: number;
  createdAt: string;
  tipIntentId: string;
  tableCode?: string;
  name?: string;
}

interface EmployeeTipsResponse {
  employeeId: string;
  merchantId: string;
  total: number;
  entries: LedgerEntry[];
}

export const EmployeeTipsView: React.FC<{ employeeId: string }> = ({ employeeId }) => {
  const [data, setData] = useState<EmployeeTipsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // automatically goes to localhost:3001/login
  };

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/employees/${employeeId}/tips`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const msg =
            typeof errorData.message === "string"
              ? errorData.message
              : errorData.message?.message || "Failed to fetch tips";
          throw new Error(msg);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching tips:", err);
        setError((err as Error).message);
        setData(null);
      }
    };

    if (employeeId && token) fetchTips();
  }, [employeeId, token]);

  return (
    <div className="employee-page">
       <header className="header">
        <h1 className="page-title">Employee Dashboard</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {error && <p className="error">Error: {error}</p>}

      {data ? (
        <>
          {/* Summary */}
          <section className="section">
            <h2 className="section-title">Tips Summary</h2>
            <p className="summary-total">
              <strong>Total:</strong> {data.total} fils
            </p>
          </section>

          {/* Entries */}
          <section className="section">
            <h2 className="section-title">Tip Entries</h2>
            {data.entries.length === 0 ? (
              <p className="empty">No tips recorded yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount (fils)</th>
                    <th>Type</th>
                    <th>Table</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{new Date(entry.createdAt).toLocaleString()}</td>
                      <td>{entry.amountFils}</td>
                      <td>{entry.type}</td>
                      <td>{entry.tableCode ?? "N/A"}</td>
                      <td>{entry.name ?? "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      ) : (
        <p className="empty">Loading tips...</p>
      )}
    </div>
  );
};