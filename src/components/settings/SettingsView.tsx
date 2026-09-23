import React, { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Settings as SettingsIcon, ShieldCheck, Building } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, saveSettings, isAuditor } = useRecruitment();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [siaAcsApproved, setSiaAcsApproved] = useState(settings.siaAcsApproved);
  const [companyNumber, setCompanyNumber] = useState(settings.companyNumber);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuditor) return;
    saveSettings({ companyName, companyNumber, siaAcsApproved });
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-primary flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-secondary" />
          <span>System & Vetting Configuration</span>
          {isAuditor && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0F172A] text-amber-400 border border-slate-700 ml-2 shadow-sm">
              READ-ONLY AUDIT
            </span>
          )}
        </h2>
        <p className="text-xs text-secondary">
          {isAuditor
            ? 'Auditor view: inspect organization compliance parameters and mandatory vetting rules.'
            : 'UK security recruitment compliance rules, company accreditation, and verification checklist options'}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Company Info */}
        <div className="linear-card p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-primary text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-[#AF7C28]" />
            <span>UK Security Firm Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-secondary mb-1">Company Registered Name</label>
              <input
                type="text"
                disabled={isAuditor}
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full linear-input rounded-xl p-3 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-secondary mb-1">Companies House Reg No.</label>
              <input
                type="text"
                disabled={isAuditor}
                value={companyNumber}
                onChange={e => setCompanyNumber(e.target.value)}
                className="w-full linear-input rounded-xl p-3 font-mono disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-panel border border-line">
            <div>
              <div className="font-semibold text-primary">SIA Approved Contractor Scheme (ACS)</div>
              <div className="text-[11px] text-tertiary">Show SIA ACS accreditation badge on recruitment emails</div>
            </div>
            <button
              type="button"
              disabled={isAuditor}
              onClick={() => setSiaAcsApproved(!siaAcsApproved)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${siaAcsApproved ? 'bg-emerald-500' : 'bg-panel-2'} ${isAuditor ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className={`w-4 h-4 rounded-full bg-page transition-transform ${siaAcsApproved ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Manual Vetting Rules Config */}
        <div className="linear-card p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-primary text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Vetting Checklist Mandatory Rules</span>
          </h3>
          <p className="text-secondary">
            Define which verification checks are strictly required before an applicant automatically transitions to "Ready for Contract".
          </p>

          <div className="space-y-3">
            {[
              { id: 'rightToWork', label: 'Right to Work (UK Passport / GOV Share Code)', desc: 'Mandatory by Home Office regulations', req: true },
              { id: 'siaLicence', label: 'SIA Public Licence Verification', desc: 'Mandatory by Security Industry Authority', req: true },
              { id: 'references', label: '5-Year Employment & Character References', desc: 'BS7858 Standard compliance', req: true },
              { id: 'creditCheck', label: 'Credit Check (Experian / Equifax)', desc: 'Optional for standard guarding roles', req: false },
              { id: 'companiesHouse', label: 'Companies House Search', desc: 'Optional for self-employed contractors', req: false },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-3.5 rounded-xl bg-panel border border-line">
                <div>
                  <div className="font-medium text-primary">{item.label}</div>
                  <div className="text-[11px] text-tertiary">{item.desc}</div>
                </div>

                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold ${
                  item.req ? 'bg-[#AF7C28]/10 text-[#AF7C28] border border-[#AF7C28]/30' : 'bg-panel-2 text-secondary'
                }`}>
                  {item.req ? 'REQUIRED' : 'OPTIONAL'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          {isAuditor ? (
            <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold py-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Compliance settings cannot be modified by audit accounts.</span>
            </div>
          ) : (
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#AF7C28] hover:bg-[#c99a3e] text-white font-bold transition-all shadow-lg shadow-amber-500/25"
            >
              Save Settings
            </button>
          )}
        </div>

      </form>
    </div>
  );
};
