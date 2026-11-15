import React from 'react';
import { X } from 'lucide-react';

export interface ConfigDiffItem {
  label: string;
  before: string;
  after: string;
}

interface ApplyChangesModalProps {
  isOpen: boolean;
  diffs: ConfigDiffItem[];
  onClose: () => void;
  onSaveOnly: () => void;
  onSaveAndReboot: () => void;
}

export const ApplyChangesModal: React.FC<ApplyChangesModalProps> = ({
  isOpen,
  diffs,
  onClose,
  onSaveOnly,
  onSaveAndReboot,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
    >
      <div className="w-full max-w-2xl rounded-md border border-[#334155] bg-[#161d27] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#273242] px-5 py-3.5">
          <h2 id="apply-modal-title" className="text-base font-semibold text-slate-100">
            Save Configuration Changes
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded p-1 text-slate-400 hover:bg-[#222d3d] hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-[13px] text-slate-300">
            Review modified UEFI NVRAM variables before writing changes to SPI flash.
          </p>

          {diffs.length === 0 ? (
            <div className="mt-4 rounded border border-[#273242] bg-[#121820] p-4 text-sm text-slate-400">
              No pending modifications detected. You can still run the POST &amp; Boot Simulation
              using the currently saved firmware configuration.
            </div>
          ) : (
            <div className="mt-4 max-h-64 overflow-y-auto rounded border border-[#273242] bg-[#121820]">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-[#273242] bg-[#18202c] text-xs font-medium text-slate-400">
                  <tr>
                    <th className="px-3.5 py-2">Setting</th>
                    <th className="px-3.5 py-2">Previous</th>
                    <th className="px-3.5 py-2">New Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {diffs.map((item) => (
                    <tr key={item.label}>
                      <td className="px-3.5 py-2 font-medium text-slate-200">{item.label}</td>
                      <td className="px-3.5 py-2 font-mono text-slate-400">{item.before}</td>
                      <td className="px-3.5 py-2 font-mono text-sky-300">{item.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#273242] px-5 py-3.5 bg-[#121820]">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-[#334155] bg-[#1c2532] px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-400 whitespace-nowrap"
          >
            Cancel
          </button>
          {diffs.length > 0 && (
            <button
              type="button"
              onClick={onSaveOnly}
              className="rounded border border-[#007DB8] bg-[#007DB8]/20 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-[#007DB8]/30 whitespace-nowrap"
            >
              Apply &amp; Stay in Setup
            </button>
          )}
          <button
            type="button"
            onClick={onSaveAndReboot}
            className="rounded bg-[#007DB8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0284c7] whitespace-nowrap"
          >
            {diffs.length > 0 ? 'Save & Simulate Reboot (POST)' : 'Simulate Reboot (POST)'}
          </button>
        </div>
      </div>
    </div>
  );
};
