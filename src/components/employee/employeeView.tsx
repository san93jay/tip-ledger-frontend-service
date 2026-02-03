import React, { useEffect, useState } from 'react';

interface LedgerEntry {
  id: string;
  type: string;
  amountFils: number;
  createdAt: string;
  tipIntentId: string;
  tableCode?: string;
  name?: string; // employee name, may be null
}

interface EmployeeTipsResponse {
  employeeId: string;
  merchantId: string;
  total: number;
  entries: LedgerEntry[];
}

export const EmployeeTipsView: React.FC<{ employeeId: string }> = ({ employeeId }) => {
  const [data, setData] = useState<{ total: number; entries: LedgerEntry[] }>({ total: 0, entries: [] });
  const token = localStorage.getItem('token');
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchTips = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/employees/${employeeId}/tips`, {
        headers: {
          'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg =
          typeof errorData.message === 'string'
            ? errorData.message
            : errorData.message?.message || 'Failed to fetch tips';
        throw new Error(msg);
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching tips:', err);
      setError((err as Error).message);
      setData({ total: 0, entries: [] });
    }
  };

  fetchTips();
}, [employeeId, token]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Employee Tips</h2>
      <p className="mb-6 text-lg">
        <strong>Total:</strong> {data.total} fils
      </p>

      {data.entries.length === 0 ? (
        <p className="text-gray-500">No tips recorded yet.</p>
      ) : (
        <ul className="space-y-4">
        {data.entries.map(entry => (
              <li key={entry.id} className="border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Name: {entry.name ?? 'N/A'}</span>
                </div>
                <div>
                   <span className="text-sm text-gray-500"> Date: 
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-lg font-medium">Amount: {entry.amountFils} fils</div>
                <div className="text-sm">Type: {entry.type}</div>
                {/* <div className="text-sm">TipIntent ID: {entry.tipIntentId}</div> */}
                <div className="text-sm text-gray-600">Table: {entry.tableCode ?? 'N/A'}</div>
              </li>
         ))}
        </ul>
      )}
    </div>
  );
};
