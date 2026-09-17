import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, FileText, Info } from 'lucide-react';

export const BS7858Guidance: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-panel to-panel shadow-sm overflow-hidden transition-all">
      {/* Header / Summary Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-panel-2/50 transition-colors"
      >
        <div className="flex items-start gap-3 sm:gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#AF7C28]/15 border border-[#AF7C28]/30 flex items-center justify-center shrink-0 mt-0.5">
            <Shield className="w-5 h-5 text-[#AF7C28]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-primary tracking-tight">
                BS 7858 Security Vetting Standard — 5-Year Activity Guidance
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#AF7C28]/15 text-[#AF7C28] border border-[#AF7C28]/30">
                UK Mandatory
              </span>
            </div>
            <p className="text-xs text-secondary mt-0.5">
              Read how your 5-year history must be structured to avoid vetting delays.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className="text-xs font-semibold text-[#AF7C28] hidden sm:inline">
            {isOpen ? 'Hide Guidance' : 'View Guidance Manual'}
          </span>
          <div className="w-7 h-7 rounded-lg border border-line bg-panel-2 flex items-center justify-center text-secondary">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expandable Manual Content */}
      {isOpen && (
        <div className="px-4 sm:px-6 pb-5 pt-1 space-y-4 border-t border-line/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
            {/* Rule 1: 5 Consecutive Years */}
            <div className="p-3.5 rounded-xl bg-panel border border-line space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>1. Full 5-Year Timeline</span>
              </div>
              <p className="text-[11px] text-secondary leading-relaxed">
                You must account for <strong>60 consecutive months</strong> leading up to today with no unexplained breaks. Every period must be documented.
              </p>
            </div>

            {/* Rule 2: 1-Month Gap Rule */}
            <div className="p-3.5 rounded-xl bg-panel border border-amber-500/20 bg-amber-500/[0.02] space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>2. 1-Month Gap Allowance</span>
              </div>
              <p className="text-[11px] text-secondary leading-relaxed">
                Breaks of <strong>up to 1 month (31 days)</strong> between activities are automatically permitted. <em>No documentary evidence is required</em> for gaps under 31 days.
              </p>
            </div>

            {/* Rule 3: Gaps Over 1 Month */}
            <div className="p-3.5 rounded-xl bg-panel border border-line space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>3. Gaps Over 31 Days</span>
              </div>
              <p className="text-[11px] text-secondary leading-relaxed">
                Career breaks, job seeking, or travel over 31 days must be declared with a brief reason and supporting evidence or referee.
              </p>
            </div>
          </div>

          {/* Acceptable Evidence Breakdown */}
          <div className="p-4 rounded-xl bg-panel-2 border border-line space-y-2.5">
            <h4 className="text-xs font-bold text-primary flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#AF7C28]" />
              Acceptable Supporting Evidence Documents:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-secondary">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#AF7C28] mt-1.5 shrink-0" />
                <span><strong>Employment:</strong> P45, P60, official wage slips, signed contract of employment, or reference confirmation letter.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#AF7C28] mt-1.5 shrink-0" />
                <span><strong>Education & Training:</strong> Degree/diploma certificates, NVQ/SIA course certificates, or university transcript.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#AF7C28] mt-1.5 shrink-0" />
                <span><strong>Gaps & Career Breaks (&gt; 31 days):</strong> DWP/Universal Credit confirmation, bank statements, travel stamps/tickets, or written self-declaration.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#AF7C28] mt-1.5 shrink-0" />
                <span><strong>Referee Contact:</strong> Always provide active corporate emails and mobile numbers so references can be confirmed swiftly.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
