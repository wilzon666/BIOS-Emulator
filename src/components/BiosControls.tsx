import React from 'react';
import { Lock } from 'lucide-react';

interface BiosSettingRowProps {
  settingKey: string;
  title: string;
  subtitle?: string;
  isSelected: boolean;
  isModified?: boolean;
  isChangedFromFactory?: boolean;
  factoryDefaultValue?: string;
  isLocked?: boolean;
  onSelect: (key: string) => void;
  children: React.ReactNode;
}

export const BiosSettingCard: React.FC<BiosSettingRowProps> = ({
  settingKey,
  title,
  subtitle,
  isSelected,
  isModified = false,
  isChangedFromFactory = false,
  factoryDefaultValue,
  isLocked = false,
  onSelect,
  children,
}) => {
  return (
    <div
      onClick={() => onSelect(settingKey)}
      onFocus={() => onSelect(settingKey)}
      className={`rounded-md border p-4 transition-colors duration-150 cursor-pointer ${
        isSelected
          ? 'bg-[#1c2532] border-[#007DB8]'
          : isChangedFromFactory
          ? 'bg-[#18202c] border-[#855b1a] hover:border-amber-400/70'
          : 'bg-[#161d27] border-[#273242] hover:border-[#3a4a60]'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h3 className="text-[15px] font-semibold text-slate-100 leading-snug">{title}</h3>
            {isChangedFromFactory && (
              <span className="text-xs font-mono font-medium text-amber-300">
                Changed from Factory{factoryDefaultValue ? ` (Original: ${factoryDefaultValue})` : ''}
              </span>
            )}
            {isModified && (
              <span className="text-xs font-mono font-medium text-sky-400">
                Unsaved
              </span>
            )}
            {isLocked && (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-400">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                Admin Locked
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className="shrink-0 pt-0.5">{children}</div>
      </div>
    </div>
  );
};

interface BiosToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export const BiosToggle: React.FC<BiosToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      className={`inline-flex items-center gap-2.5 rounded border px-3 py-1.5 text-xs font-mono font-semibold tracking-wide transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9] whitespace-nowrap shrink-0 ${
        disabled
          ? 'opacity-50 cursor-not-allowed bg-[#121820] border-[#273242] text-slate-500'
          : checked
          ? 'bg-[#007DB8]/20 border-[#007DB8] text-sky-300 hover:bg-[#007DB8]/30'
          : 'bg-[#121820] border-[#334155] text-slate-400 hover:text-slate-200 hover:border-slate-500'
      }`}
    >
      <span
        className={`inline-flex h-4 w-7 items-center rounded-sm p-0.5 transition-colors ${
          checked ? 'bg-[#007DB8]' : 'bg-slate-700'
        }`}
      >
        <span
          className={`h-3 w-3 rounded-[1px] bg-white transition-transform duration-150 ${
            checked ? 'translate-x-3' : 'translate-x-0'
          }`}
        />
      </span>
      <span className="w-7 text-left">{checked ? 'ON' : 'OFF'}</span>
    </button>
  );
};

interface BiosRadioGroupProps<T extends string> {
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (val: T) => void;
  disabled?: boolean;
}

export function BiosRadioGroup<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
}: BiosRadioGroupProps<T>) {
  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onChange(opt.value);
            }}
            className={`flex items-start gap-2.5 rounded border px-3 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9] ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${
              active
                ? 'bg-[#007DB8]/20 border-[#007DB8] text-slate-100'
                : 'bg-[#121820] border-[#273242] text-slate-300 hover:border-[#3b4b63]'
            }`}
          >
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                active ? 'border-[#0EA5E9] bg-[#007DB8]' : 'border-slate-500 bg-transparent'
              }`}
            >
              {active && <span className="h-1.5 w-1.5 bg-white" />}
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-medium leading-tight">{opt.label}</span>
              {opt.hint && (
                <span className="mt-1 block text-[11px] text-slate-400 leading-snug">
                  {opt.hint}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface BiosSelectProps<T extends string> {
  value: T;
  options: T[];
  onChange: (val: T) => void;
  disabled?: boolean;
  ariaLabel: string;
}

export function BiosSelect<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  ariaLabel,
}: BiosSelectProps<T>) {
  return (
    <select
      aria-label={ariaLabel}
      disabled={disabled}
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded border border-[#334155] bg-[#121820] px-3 py-1.5 text-[13px] font-medium text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9] disabled:opacity-50"
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-[#121820] text-slate-100">
          {opt}
        </option>
      ))}
    </select>
  );
}
