import React from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { UserCheck, AlertTriangle, MapPin, Search } from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const { employees, searchQuery, setSearchQuery, fireEmployee, isAuditor } = useRecruitment();

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.siaLicenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-400" />
            <span>Hired Security Staff Roster ({employees.length})</span>
            {isAuditor && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0F172A] text-amber-400 border border-slate-700 ml-2 shadow-sm">
                READ-ONLY
              </span>
            )}
          </h2>
          <p className="text-xs text-secondary">
            {isAuditor 
              ? 'Auditor roster view: inspect employee IDs, SIA license validities, and deployed sites.'
              : 'Active security guards, site assignments, and SIA licence expiry monitoring'}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee, ID, SIA #..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full linear-input pl-9 pr-4 py-2 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Employees Table */}
      <div className="linear-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-panel text-secondary border-b border-line uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="p-4 font-semibold">Employee ID</th>
                <th className="p-4 font-semibold">Guard Name</th>
                <th className="p-4 font-semibold">Role Title</th>
                <th className="p-4 font-semibold">SIA Licence No & Expiry</th>
                <th className="p-4 font-semibold">Assigned Site</th>
                <th className="p-4 font-semibold">Pay Rate</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-primary">
              {filteredEmployees.map(emp => {
                // Calculate expiry alert (e.g. within 60 days)
                const expiryDate = new Date(emp.siaLicenceExpiry);
                const daysRemaining = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                const isExpiringSoon = daysRemaining < 90;

                return (
                  <tr key={emp.id} className="hover:bg-panel-dim transition-colors">
                    <td className="p-4 font-mono font-bold text-[#AF7C28]">
                      {emp.employeeId}
                    </td>

                    <td className="p-4 font-semibold text-primary">
                      <div>{emp.fullName}</div>
                      <div className="text-[11px] text-tertiary font-normal">{emp.email}</div>
                    </td>

                    <td className="p-4 text-primary">
                      {emp.roleTitle}
                    </td>

                    <td className="p-4 font-mono">
                      <div className="text-amber-400">{emp.siaLicenceNo}</div>
                      <div className="text-[11px] flex items-center gap-1.5 mt-0.5">
                        <span className="text-tertiary">Exp: {emp.siaLicenceExpiry}</span>
                        {isExpiringSoon && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-sans font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{daysRemaining} days left!</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-primary">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-tertiary shrink-0" />
                        <span>{emp.assignedSite}</span>
                      </div>
                    </td>

                    <td className="p-4 font-mono font-bold text-[#AF7C28]">
                      £{emp.hourlyRate.toFixed(2)}/hr
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize border ${
                        emp.status === 'active' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                      }`}>
                        {emp.status.replace('_', ' ')}
                      </span>
                    </td>

                    {emp.applicantId && !isAuditor && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => fireEmployee(emp.applicantId)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[11px] font-semibold transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
