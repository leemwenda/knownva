import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api<{items: any[]}>('/users?pageSize=50').then(res => setUsers(res.items)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (id: number, newRole: string) => {
    if (!confirm(`Change role to ${newRole}?`)) return;
    try { await api(`/users/${id}`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) }); load(); } 
    catch (err) { alert('Failed to update role'); }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Set account to ${newStatus}?`)) return;
    try { await api(`/users/${id}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) }); load(); } 
    catch (err) { alert('Failed to update status'); }
  };

  if (loading) return <div className="p-10 text-slate-500 dark:text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700">
            <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{u.name}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{u.email}</td>
                <td className="px-6 py-4">
                  <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} className="bg-slate-100 text-slate-700 text-xs font-bold uppercase rounded-md px-2 py-1 outline-none cursor-pointer dark:bg-slate-800 dark:text-slate-200">
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleStatus(u.id, u.status)} className="text-xs font-semibold text-brand-600 hover:text-brand-800">
                    {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
