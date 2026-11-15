import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { BootEntry } from '../data/biosData';

interface BootSequenceControlProps {
  entries: BootEntry[];
  externalUsbBoot: boolean;
  integratedNic: string;
  disabled?: boolean;
  onChange: (next: BootEntry[]) => void;
  onSelect: () => void;
  isSelected: boolean;
  isModified: boolean;
}

export const BootSequenceControl: React.FC<BootSequenceControlProps> = ({
  entries,
  externalUsbBoot,
  integratedNic,
  disabled = false,
  onChange,
  onSelect,
  isSelected,
  isModified,
}) => {
  const moveEntry = (index: number, direction: -1 | 1) => {
    if (disabled) return;
    const target = index + direction;
    if (target < 0 || target >= entries.length) return;
    const copy = entries.map((e) => ({ ...e }));
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    onChange(copy);
  };

  const toggleEntry = (index: number) => {
    if (disabled) return;
    const copy = entries.map((e, i) => (i === index ? { ...e, enabled: !e.enabled } : e));
    onChange(copy);
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-md border p-4 transition-colors duration-150 ${
        isSelected
          ? 'bg-[#1c2532] border-[#007DB8]'
          : 'bg-[#161d27] border-[#273242] hover:border-[#3a4a60]'
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-[15px] font-semibold text-slate-100">Boot Sequence</h3>
            {isModified && (
              <span className="text-xs font-mono font-medium text-amber-400">Modified</span>
            )}
          </div>
          <p className="mt-1 text-[13px] text-slate-400">
            Order and toggle active UEFI boot options checked by the firmware Boot Manager.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {entries.map((entry, idx) => {
          const blockedByHardware =
            (entry.type === 'usb' && !externalUsbBoot) ||
            (entry.type === 'pxe' && integratedNic !== 'Enabled w/ PXE');

          return (
            <div
              key={entry.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border px-3 py-2.5 ${
                entry.enabled && !blockedByHardware
                  ? 'border-[#2f3d52] bg-[#121820]'
                  : 'border-[#222c3a] bg-[#10151c] opacity-75'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="mt-0.5 font-mono text-xs text-slate-400 w-5 shrink-0 tabular-nums">
                  {idx + 1}.
                </span>
                <input
                  type="checkbox"
                  checked={entry.enabled}
                  disabled={disabled}
                  onChange={() => toggleEntry(idx)}
                  aria-label={`Enable ${entry.label}`}
                  className="mt-1 h-4 w-4 rounded-sm border-slate-500 bg-[#0e131a] accent-[#007DB8] cursor-pointer"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                    <span className="text-[13px] font-semibold text-slate-100">
                      {entry.label}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {entry.signed ? 'EFI Signed' : 'Unsigned EFI'}
                    </span>
                    {blockedByHardware && (
                      <span className="text-xs font-mono text-amber-400">
                        Blocked by Hardware Policy
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] font-mono text-slate-500 truncate">
                    {entry.devicePath}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  disabled={disabled || idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveEntry(idx, -1);
                  }}
                  aria-label={`Move ${entry.label} up`}
                  className="inline-flex items-center gap-1 rounded border border-[#2f3d52] bg-[#18212d] px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-[#007DB8] disabled:opacity-35 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                  Up
                </button>
                <button
                  type="button"
                  disabled={disabled || idx === entries.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveEntry(idx, 1);
                  }}
                  aria-label={`Move ${entry.label} down`}
                  className="inline-flex items-center gap-1 rounded border border-[#2f3d52] bg-[#18212d] px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-[#007DB8] disabled:opacity-35 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                  Down
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
