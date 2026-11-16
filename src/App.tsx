import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Lock,
  Unlock,
  Search,
  RotateCcw,
  Play,
  Save,
  X,
  ArrowRight,
} from 'lucide-react';
import {
  BIOS_CATEGORIES,
  BiosConfig,
  BiosLogEntry,
  CategoryId,
  computeFactoryDiffs,
  FACTORY_BIOS_CONFIG,
  FIRMWARE_METADATA,
  IMPORTED_QBM1250_CONFIG,
  INITIAL_LOGS,
  LectureScenario,
  SETTING_HELP_MAP,
} from './data/biosData';
import { CategorySettingsPane } from './components/CategorySettingsPane';
import { HelpInspectorPanel } from './components/HelpInspectorPanel';
import { ApplyChangesModal, ConfigDiffItem } from './components/ApplyChangesModal';
import { PasswordModal } from './components/PasswordModal';
import { PostSimulatorModal } from './components/PostSimulatorModal';
import { WolGuideModal } from './components/WolGuideModal';

function cloneConfig(cfg: BiosConfig): BiosConfig {
  return {
    ...cfg,
    bootSequence: cfg.bootSequence.map((item) => ({ ...item })),
  };
}

function formatDiffValue(val: unknown): string {
  if (typeof val === 'boolean') return val ? 'ON' : 'OFF';
  if (typeof val === 'string') return val === '' ? 'Not Set' : val;
  return String(val);
}

const DIFF_LABELS: Partial<Record<keyof BiosConfig, string>> = {
  secureBoot: 'Enable Secure Boot',
  secureBootMode: 'Secure Boot Mode',
  microsoftUefiCa: 'Microsoft UEFI CA',
  uefiBootPathSecurity: 'UEFI Boot Path Security',
  httpsBoot: 'HTTPS Boot',
  bootSequence: 'Boot Sequence Order / Targets',
  sataNvmeOperation: 'SATA / NVMe Operation',
  m2Slot0Enabled: 'M.2 PCIe SSD-0',
  m2Slot1Enabled: 'M.2 PCIe SSD-1',
  smartReporting: 'SMART Reporting',
  externalUsbBoot: 'External USB Drive Boot',
  integratedNic: 'Integrated NIC',
  macAddressPassThrough: 'MAC Address Pass-Through',
  wirelessLan: 'Wireless LAN',
  bluetoothDevice: 'Bluetooth Device',
  thunderboltEnabled: 'Thunderbolt / USB4',
  thunderboltSecurity: 'Thunderbolt Security Level',
  integratedAudio: 'Integrated Audio',
  internalMicrophone: 'Internal Microphone',
  integratedCamera: 'Integrated Camera',
  usbPowerShare: 'USB PowerShare',
  fnLockMode: 'Fn Lock Mode',
  tpmEnabled: 'TPM 2.0 Security',
  tpmPpiBypassEnable: 'TPM PPI Bypass Enable',
  tpmPpiBypassClear: 'TPM PPI Bypass Clear',
  smmSecurityMitigation: 'SMM Security Mitigation',
  uefiCapsuleUpdates: 'UEFI Capsule Updates',
  absolutePersistence: 'Absolute Persistence Module',
  dataWipeNextBoot: 'Wipe on Next Boot',
  adminPassword: 'Admin Password',
  systemPassword: 'System Password',
  nvmePassword: 'NVMe Storage Password',
  strongPassword: 'Strong Password Policy',
  passwordBypass: 'Password Bypass',
  intelVtx: 'Intel VT-x Virtualization',
  intelVtd: 'VT for Direct I/O (VT-d)',
  intelTxt: 'Trusted Execution Technology',
  kernelDmaProtection: 'Kernel DMA Protection',
  fastboot: 'Fastboot',
  extendPostTime: 'Extend BIOS POST Time',
  adapterWarnings: 'Adapter Warnings',
  numLockAtBoot: 'Enable NumLock at Boot',
  warningsAndErrors: 'Warnings and Errors',
  thermalManagement: 'Thermal Management',
  wakeOnAc: 'Wake on AC',
  blockSleep: 'Block Sleep',
  deepSleepControl: 'Deep Sleep Control',
  usbWakeSupport: 'USB Wake Support',
  intelSpeedShift: 'Intel Speed Shift',
  wakeOnLan: 'Wake on LAN / WLAN',
  acRecovery: 'AC Recovery',
  autoOnTime: 'Auto On Time',
  serrMessages: 'SERR Messages',
  supportAssistRecovery: 'SupportAssist OS Recovery',
  biosConnect: 'BIOSConnect',
  rollbackProtection: 'BIOS Rollback Protection',
};

function getTimestampNow(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export default function App() {
  const [savedConfig, setSavedConfig] = useState<BiosConfig>(() =>
    cloneConfig(IMPORTED_QBM1250_CONFIG)
  );
  const [draftConfig, setDraftConfig] = useState<BiosConfig>(() =>
    cloneConfig(IMPORTED_QBM1250_CONFIG)
  );
  const [activeCategory, setActiveCategory] = useState<CategoryId>('overview');
  const [selectedSettingKey, setSelectedSettingKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>('imported-qbm1250');

  // Admin lock state: if saved or draft adminPassword exists & unlockedThisSession is false
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [logs, setLogs] = useState<BiosLogEntry[]>(INITIAL_LOGS);

  // Modals
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postModalMode, setPostModalMode] = useState<'post' | 'f12' | 'wol'>('post');
  const [wolGuideOpen, setWolGuideOpen] = useState(false);
  const [passwordModalState, setPasswordModalState] = useState<{
    open: boolean;
    mode: 'set' | 'unlock';
    target: 'adminPassword' | 'systemPassword' | 'nvmePassword';
  }>({ open: false, mode: 'set', target: 'adminPassword' });

  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const adminLocked = Boolean(savedConfig.adminPassword) && !isUnlocked;

  const appendLog = (
    message: string,
    category: BiosLogEntry['category'] = 'BIOS Events',
    severity: BiosLogEntry['severity'] = 'INFO'
  ) => {
    setLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: getTimestampNow(),
        category,
        severity,
        message,
      },
      ...prev,
    ]);
  };

  // Compute pending diffs
  const diffs: ConfigDiffItem[] = useMemo(() => {
    const list: ConfigDiffItem[] = [];
    (Object.keys(DIFF_LABELS) as (keyof BiosConfig)[]).forEach((key) => {
      if (key === 'bootSequence') {
        const beforeOrder = savedConfig.bootSequence
          .filter((b) => b.enabled)
          .map((b) => b.label.split(':')[0])
          .join(' > ');
        const afterOrder = draftConfig.bootSequence
          .filter((b) => b.enabled)
          .map((b) => b.label.split(':')[0])
          .join(' > ');
        if (JSON.stringify(savedConfig.bootSequence) !== JSON.stringify(draftConfig.bootSequence)) {
          list.push({
            label: DIFF_LABELS[key] ?? key,
            before: beforeOrder || 'None',
            after: afterOrder || 'None',
          });
        }
        return;
      }

      if (savedConfig[key] !== draftConfig[key]) {
        const isPass =
          key === 'adminPassword' || key === 'systemPassword' || key === 'nvmePassword';
        list.push({
          label: DIFF_LABELS[key] ?? key,
          before: isPass
            ? savedConfig[key]
              ? 'Set (••••••)'
              : 'Not Set'
            : formatDiffValue(savedConfig[key]),
          after: isPass
            ? draftConfig[key]
              ? 'Set (••••••)'
              : 'Cleared'
            : formatDiffValue(draftConfig[key]),
        });
      }
    });
    return list;
  }, [savedConfig, draftConfig]);

  // Compute diffs vs Dell Factory Original shipping state
  const factoryDiffs = useMemo(() => computeFactoryDiffs(draftConfig), [draftConfig]);

  // Count modified settings (unsaved) and Factory Original diffs per category for left sidebar
  const modifiedCountByCategory = useMemo(() => {
    const counts: Partial<Record<CategoryId, number>> = {};
    Object.values(SETTING_HELP_MAP).forEach((meta) => {
      const k = meta.key as keyof BiosConfig;
      if (k in draftConfig && JSON.stringify(savedConfig[k]) !== JSON.stringify(draftConfig[k])) {
        counts[meta.category] = (counts[meta.category] ?? 0) + 1;
      }
    });
    return counts;
  }, [savedConfig, draftConfig]);

  const factoryDiffCountByCategory = useMemo(() => {
    const counts: Partial<Record<CategoryId, number>> = {};
    factoryDiffs.forEach((d) => {
      counts[d.category] = (counts[d.category] ?? 0) + 1;
    });
    return counts;
  }, [factoryDiffs]);

  // Search index across all settings
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return Object.values(SETTING_HELP_MAP).filter(
      (meta) =>
        meta.title.toLowerCase().includes(q) ||
        meta.summary.toLowerCase().includes(q) ||
        meta.lectureNote.toLowerCase().includes(q) ||
        meta.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Keyboard shortcuts: Ctrl+F focuses BIOS search, ArrowUp/Down cycles categories when search isn't focused
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        if (searchQuery) setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [searchQuery]);

  const handleUpdateConfig = <K extends keyof BiosConfig>(key: K, value: BiosConfig[K]) => {
    if (adminLocked) return;
    setActiveScenarioId(null);
    setDraftConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyScenario = (scenario: LectureScenario) => {
    if (adminLocked) return;
    const base = cloneConfig(FACTORY_BIOS_CONFIG);
    const merged: BiosConfig = {
      ...base,
      ...scenario.patch,
      bootSequence: scenario.patch.bootSequence
        ? scenario.patch.bootSequence.map((b) => ({ ...b }))
        : base.bootSequence,
    };
    setDraftConfig(merged);
    setActiveScenarioId(scenario.id);
    setStatusBanner(`Loaded preset "${scenario.title}". Review changes or click Apply Changes.`);
    if (scenario.id === 'wol-qbm1250') {
      setActiveCategory('systemmanagement');
      setSelectedSettingKey('wakeOnLan');
    } else if (scenario.id === 'linux-dualboot') {
      setActiveCategory('storage');
      setSelectedSettingKey('sataNvmeOperation');
    } else if (scenario.id === 'hypervisor-lab') {
      setActiveCategory('virtualization');
      setSelectedSettingKey('intelVtd');
    } else if (scenario.id === 'zero-trust') {
      setActiveCategory('security');
      setSelectedSettingKey('smmSecurityMitigation');
    } else {
      setActiveCategory('overview');
      setSelectedSettingKey(null);
    }
  };

  const commitChanges = (thenReboot: boolean) => {
    const nextSaved = cloneConfig(draftConfig);
    setSavedConfig(nextSaved);
    if (nextSaved.adminPassword && !savedConfig.adminPassword) {
      // Keep unlocked until user locks or simulates reboot
    }
    if (diffs.length > 0) {
      appendLog(
        `Applied ${diffs.length} NVRAM setting change(s): ${diffs
          .map((d) => `${d.label}=${d.after}`)
          .join(', ')}.`,
        'BIOS Events',
        'INFO'
      );
      setStatusBanner(`Saved ${diffs.length} setting change(s) to UEFI NVRAM.`);
    }
    setApplyModalOpen(false);
    if (thenReboot) {
      if (nextSaved.adminPassword) {
        setIsUnlocked(false);
      }
      setPostModalMode('post');
      setPostModalOpen(true);
    }
  };

  const handleUndoChanges = () => {
    setDraftConfig(cloneConfig(savedConfig));
    setActiveScenarioId(null);
    setStatusBanner('Reverted all unsaved modifications back to saved NVRAM state.');
  };

  const handleLoadDefaults = () => {
    if (adminLocked) return;
    setDraftConfig(cloneConfig(FACTORY_BIOS_CONFIG));
    setActiveScenarioId('default');
    setStatusBanner(
      'Loaded Dell QBM1250 Factory Original baseline (0 changes vs shipping state). Click Apply Changes to commit.'
    );
  };

  const handleJumpToSetting = (cat: CategoryId, key: string) => {
    setSearchQuery('');
    setActiveCategory(cat);
    setSelectedSettingKey(key);
  };

  const activeCategoryObj = BIOS_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#0e131a] text-slate-100">
      {/* Top Bar (Dell UEFI BIOS Setup Header) */}
      <header className="border-b border-[#232d3b] bg-[#121820] px-4 lg:px-6 py-3">
        <div className="mx-auto max-w-[1600px] flex flex-wrap items-center justify-between gap-4">
          {/* Zone 1: Brand & Firmware Metadata */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
            <span className="text-lg font-bold tracking-tight text-sky-400 whitespace-nowrap shrink-0">
              DELL BIOS Setup
            </span>
            <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
              {FIRMWARE_METADATA.model}
            </span>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="text-xs font-mono text-slate-300 tabular-nums whitespace-nowrap">
              Version {FIRMWARE_METADATA.biosVersion} ({FIRMWARE_METADATA.driverId}) ·{' '}
              {FIRMWARE_METADATA.releaseDate}
            </span>
          </div>

          {/* Zone 2 & 3: Search & Admin Lock Control */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search BIOS settings (Ctrl+F)..."
                aria-label="Search BIOS settings"
                className="w-full rounded border border-[#2c384a] bg-[#0c1016] pl-9 pr-8 py-1.5 text-[13px] text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {savedConfig.adminPassword && (
              <button
                type="button"
                onClick={() => {
                  if (isUnlocked) {
                    setIsUnlocked(false);
                    setStatusBanner('BIOS Setup locked by Admin Password.');
                  } else {
                    setPasswordModalState({
                      open: true,
                      mode: 'unlock',
                      target: 'adminPassword',
                    });
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  adminLocked
                    ? 'border-amber-500/60 bg-amber-950/30 text-amber-300 hover:bg-amber-950/50'
                    : 'border-emerald-500/50 bg-emerald-950/25 text-emerald-300 hover:bg-emerald-950/40'
                }`}
              >
                {adminLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                    Unlock Setup
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
                    Lock Setup
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main 3-Column Dell UEFI Workspace */}
      <div className="flex-1 mx-auto w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-[245px_minmax(0,1fr)_340px]">
        {/* Left Category Navigation Rail */}
        <nav
          aria-label="BIOS Categories"
          className="border-b lg:border-b-0 lg:border-r border-[#232d3b] bg-[#121820] p-3 overflow-x-auto lg:overflow-y-auto"
        >
          <div className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
            {BIOS_CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id && !searchQuery;
              const modCount = modifiedCountByCategory[cat.id] ?? 0;
              const factoryCount = factoryDiffCountByCategory[cat.id] ?? 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory(cat.id);
                    setSelectedSettingKey(null);
                  }}
                  className={`flex items-center justify-between gap-2 rounded px-3 py-2 text-left text-[13px] font-medium transition-colors duration-150 whitespace-nowrap ${
                    active
                      ? 'bg-[#007DB8] text-white'
                      : 'text-slate-300 hover:bg-[#1a2330] hover:text-white'
                  }`}
                >
                  <span>{cat.label}</span>
                  {(factoryCount > 0 || modCount > 0) && (
                    <span className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
                      {factoryCount > 0 && (
                        <span className={active ? 'text-amber-200 font-semibold' : 'text-amber-300 font-semibold'}>
                          {factoryCount}Δ
                        </span>
                      )}
                      {modCount > 0 && (
                        <span className={active ? 'text-sky-100' : 'text-sky-400'}>
                          +{modCount}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="hidden lg:block mt-4 border-t border-[#232d3b] pt-3 px-2 text-[11px] font-mono text-slate-400 space-y-1">
            <div>
              <span className="text-amber-300 font-semibold">Δ</span> Changed vs Factory
            </div>
            <div>
              <span className="text-sky-400">+</span> Unsaved edit
            </div>
          </div>
        </nav>

        {/* Center Main Settings Area */}
        <main className="p-4 lg:p-6 overflow-y-auto bg-[#0e131a]">
          {statusBanner && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded border border-[#2f4560] bg-[#142030] px-4 py-2.5 text-xs text-sky-200">
              <span>{statusBanner}</span>
              <button
                type="button"
                onClick={() => setStatusBanner(null)}
                aria-label="Dismiss message"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {adminLocked && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded border border-amber-500/45 bg-amber-950/25 px-4 py-3 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <span>
                  Admin Password is active. Settings are read-only until unlocked.
                  {savedConfig.adminPassword === 'dell123' && (
                    <span className="ml-1.5 font-mono text-amber-300">(Demo password: dell123)</span>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPasswordModalState({
                    open: true,
                    mode: 'unlock',
                    target: 'adminPassword',
                  })
                }
                className="rounded border border-amber-400/50 bg-amber-500/15 px-3 py-1 font-semibold text-amber-200 hover:bg-amber-500/25 whitespace-nowrap"
              >
                Unlock BIOS
              </button>
            </div>
          )}

          {searchQuery.trim() ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#232d3b] pb-3">
                <div>
                  <h1 className="text-lg font-semibold text-slate-100">
                    Search Results for &ldquo;{searchQuery}&rdquo;
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                    {searchResults.length} matching firmware setting(s)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-medium text-sky-400 hover:underline"
                >
                  Return to {activeCategoryObj?.label}
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="rounded border border-[#273242] bg-[#161d27] p-6 text-sm text-slate-400">
                  No BIOS settings matched your query. Try terms like &ldquo;Secure Boot&rdquo;,
                  &ldquo;AHCI&rdquo;, &ldquo;TPM&rdquo;, &ldquo;VT-d&rdquo;, or &ldquo;Fastboot&rdquo;.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {searchResults.map((item) => {
                    const catLabel =
                      BIOS_CATEGORIES.find((c) => c.id === item.category)?.label ?? item.category;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setActiveCategory(item.category);
                          setSelectedSettingKey(item.key);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between gap-4 rounded-md border border-[#273242] bg-[#161d27] p-4 text-left hover:border-[#007DB8] transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-mono text-sky-400">{catLabel}</div>
                          <div className="text-sm font-semibold text-slate-100 mt-0.5">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {item.summary}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#232d3b] pb-3 mb-4">
                <div>
                  <h1 className="text-xl font-semibold text-slate-100">
                    {activeCategoryObj?.label}
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeCategoryObj?.group} · System BIOS {FIRMWARE_METADATA.biosVersion} (
                    {FIRMWARE_METADATA.driverId})
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums">
                  {factoryDiffs.length > 0 && activeCategory !== 'overview' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory('overview');
                        setSelectedSettingKey(null);
                      }}
                      className="text-amber-300 hover:underline"
                    >
                      {factoryDiffs.length} vs. Factory Original
                    </button>
                  )}
                  <span className="text-slate-400">
                    Service Tag: {FIRMWARE_METADATA.serviceTag}
                  </span>
                </div>
              </div>

              <CategorySettingsPane
                activeCategory={activeCategory}
                config={draftConfig}
                savedConfig={savedConfig}
                factoryDiffs={factoryDiffs}
                selectedSettingKey={selectedSettingKey}
                adminLocked={adminLocked}
                logs={logs}
                onSelectSetting={(k) => setSelectedSettingKey(k)}
                onUpdateConfig={handleUpdateConfig}
                onJumpToCategory={(cat) => {
                  setActiveCategory(cat);
                  setSelectedSettingKey(null);
                }}
                onJumpToSetting={handleJumpToSetting}
                onOpenPasswordModal={(target) =>
                  setPasswordModalState({ open: true, mode: 'set', target })
                }
                onClearTpm={() => {
                  appendLog(
                    'TPM 2.0 Clear command queued (Endorsement & Owner keys reset).',
                    'BIOS Events',
                    'SECURITY'
                  );
                }}
                onClearLogs={() => setLogs([])}
                onOpenWolGuide={() => setWolGuideOpen(true)}
              />
            </div>
          )}
        </main>

        {/* Right Technical Help & Lecture Inspector */}
        <HelpInspectorPanel
          selectedSettingKey={selectedSettingKey}
          diffs={diffs}
          factoryDiffs={factoryDiffs}
          activeScenarioId={activeScenarioId}
          onApplyScenario={handleApplyScenario}
          onJumpToSetting={handleJumpToSetting}
          adminLocked={adminLocked}
        />
      </div>

      {/* Bottom Action Footer (Dell UEFI BIOS Control Strip) */}
      <footer className="border-t border-[#232d3b] bg-[#121820] px-4 lg:px-6 py-3">
        <div className="mx-auto max-w-[1600px] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={adminLocked}
              onClick={handleLoadDefaults}
              className="rounded border border-[#334155] bg-[#19212c] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-slate-400 disabled:opacity-40 whitespace-nowrap"
            >
              Load Factory Defaults
            </button>
            <button
              type="button"
              disabled={diffs.length === 0}
              onClick={handleUndoChanges}
              className="inline-flex items-center gap-1.5 rounded border border-[#334155] bg-[#19212c] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-slate-400 disabled:opacity-40 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Undo Changes
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setPostModalMode('f12');
                setPostModalOpen(true);
              }}
              className="rounded border border-[#334155] bg-[#19212c] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-[#007DB8] whitespace-nowrap"
            >
              F12 One-Time Boot Menu
            </button>

            <button
              type="button"
              onClick={() => setWolGuideOpen(true)}
              className="rounded border border-[#334155] bg-[#19212c] px-3.5 py-2 text-xs font-medium text-sky-300 hover:border-[#007DB8] whitespace-nowrap"
            >
              WoL Guide (EN / DE)
            </button>

            <button
              type="button"
              onClick={() => {
                setPostModalMode('wol');
                setPostModalOpen(true);
              }}
              className="rounded border border-[#334155] bg-[#19212c] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-[#007DB8] whitespace-nowrap"
            >
              Test S5 Wake-on-LAN
            </button>

            <button
              type="button"
              onClick={() => {
                setPostModalMode('post');
                setPostModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded border border-[#007DB8] bg-[#007DB8]/15 px-3.5 py-2 text-xs font-semibold text-sky-200 hover:bg-[#007DB8]/25 whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              Simulate Reboot (POST)
            </button>

            <button
              type="button"
              onClick={() => setApplyModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded bg-[#007DB8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0284c7] whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5" aria-hidden="true" />
              Apply Changes {diffs.length > 0 ? `(${diffs.length})` : ''}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ApplyChangesModal
        isOpen={applyModalOpen}
        diffs={diffs}
        onClose={() => setApplyModalOpen(false)}
        onSaveOnly={() => commitChanges(false)}
        onSaveAndReboot={() => commitChanges(true)}
      />

      {passwordModalState.open && (
        <PasswordModal
          mode={passwordModalState.mode}
          targetLabel={
            passwordModalState.target === 'adminPassword'
              ? 'Admin Password'
              : passwordModalState.target === 'systemPassword'
              ? 'System Password'
              : 'Internal M.2 SSD-0 Password'
          }
          currentPassword={
            passwordModalState.mode === 'unlock'
              ? savedConfig.adminPassword
              : draftConfig[passwordModalState.target]
          }
          strongPasswordRequired={draftConfig.strongPassword}
          onClose={() => setPasswordModalState((s) => ({ ...s, open: false }))}
          onSubmitSet={(nextPass) => {
            handleUpdateConfig(passwordModalState.target, nextPass);
            setPasswordModalState((s) => ({ ...s, open: false }));
            setStatusBanner(
              nextPass
                ? `${passwordModalState.target === 'adminPassword' ? 'Admin' : passwordModalState.target === 'systemPassword' ? 'System' : 'NVMe'} Password updated. Click Apply Changes to commit.`
                : 'Password cleared. Click Apply Changes to commit.'
            );
          }}
          onSuccessUnlock={() => {
            setIsUnlocked(true);
            setPasswordModalState((s) => ({ ...s, open: false }));
            setStatusBanner('BIOS Setup unlocked for this lecture session.');
            appendLog('Admin Password authenticated successfully.', 'BIOS Events', 'SECURITY');
          }}
        />
      )}

      <PostSimulatorModal
        isOpen={postModalOpen}
        config={savedConfig}
        initialMode={postModalMode}
        onReturnToBios={(logMessage) => {
          setPostModalOpen(false);
          if (logMessage) {
            appendLog(
              logMessage,
              'BIOS Events',
              logMessage.includes('secure-boot-violation') ||
                logMessage.includes('bsod') ||
                logMessage.includes('no-boot') ||
                logMessage.includes('wol-blocked')
                ? 'WARN'
                : 'INFO'
            );
          }
        }}
      />

      <WolGuideModal
        isOpen={wolGuideOpen}
        config={draftConfig}
        adminLocked={adminLocked}
        onClose={() => setWolGuideOpen(false)}
        onJumpToSetting={(cat, key) => {
          setSearchQuery('');
          setActiveCategory(cat);
          setSelectedSettingKey(key);
        }}
        onApplyRecommendedWol={() => {
          if (adminLocked) return;
          setDraftConfig((prev) => ({
            ...prev,
            wakeOnLan: 'LAN Only',
            deepSleepControl: 'Disabled',
            integratedNic: prev.integratedNic === 'Disabled' ? 'Enabled w/ PXE' : prev.integratedNic,
            acRecovery: 'Last Power State',
          }));
          setActiveScenarioId('wol-qbm1250');
          setStatusBanner(
            'Applied recommended QBM1250 Wake-on-LAN settings. Click Apply Changes to save to NVRAM.'
          );
        }}
        onLaunchWolTest={() => {
          setPostModalMode('wol');
          setPostModalOpen(true);
        }}
      />
    </div>
  );
}
