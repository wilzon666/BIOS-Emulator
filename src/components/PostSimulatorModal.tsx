import React, { useEffect, useMemo, useState } from 'react';
import { RotateCcw, ShieldAlert, Terminal, CheckCircle2, Lock } from 'lucide-react';
import { BiosConfig, BootEntry, FIRMWARE_METADATA } from '../data/biosData';

interface PostSimulatorModalProps {
  isOpen: boolean;
  config: BiosConfig;
  initialMode?: 'post' | 'f12' | 'wol';
  onReturnToBios: (logMessage?: string) => void;
}

type SimStage =
  | 'splash'
  | 'password'
  | 'f12-menu'
  | 'wipe-confirm'
  | 'boot-result';

interface BootEvaluation {
  status:
    | 'success'
    | 'secure-boot-violation'
    | 'no-boot-device'
    | 'bsod-storage'
    | 'wiped'
    | 'wol-blocked';
  headline: string;
  detail: string;
  target?: BootEntry;
  traceLines: string[];
}

export const PostSimulatorModal: React.FC<PostSimulatorModalProps> = ({
  isOpen,
  config,
  initialMode = 'post',
  onReturnToBios,
}) => {
  const [stage, setStage] = useState<SimStage>('splash');
  const [progress, setProgress] = useState(0);
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [selectedOverrideId, setSelectedOverrideId] = useState<string | null>(null);
  const [wipeExecuted, setWipeExecuted] = useState(false);

  const activeCandidates = useMemo(() => {
    return config.bootSequence.filter((entry) => {
      if (!entry.enabled) return false;
      if (entry.type === 'usb' && !config.externalUsbBoot) return false;
      if (entry.type === 'pxe' && config.integratedNic !== 'Enabled w/ PXE') return false;
      if (entry.type === 'uri' && (!config.httpsBoot || config.integratedNic === 'Disabled')) return false;
      if (entry.id === 'hdd.1' && !config.m2Slot0Enabled) return false;
      if (entry.id === 'hdd.2' && !config.m2Slot1Enabled) return false;
      return true;
    });
  }, [config]);

  const postDurationMs = useMemo(() => {
    let base = config.fastboot === 'Thorough' ? 2200 : 1200;
    if (config.extendPostTime === '5 Seconds') base += 1800;
    if (config.extendPostTime === '10 Seconds') base += 2800;
    return base;
  }, [config.fastboot, config.extendPostTime]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedOverrideId(null);
    setPassInput('');
    setPassError('');
    setWipeExecuted(false);

    if (initialMode === 'f12') {
      if (config.adminPassword && config.uefiBootPathSecurity === 'Always') {
        setStage('password');
      } else {
        setStage('f12-menu');
      }
      return;
    }

    if (initialMode === 'wol') {
      const wolAllowed =
        config.wakeOnLan !== 'Disabled' &&
        config.deepSleepControl === 'Disabled' &&
        (config.wakeOnLan === 'WLAN Only' ||
          (config.wakeOnLan === 'LAN with PXE Boot'
            ? config.integratedNic === 'Enabled w/ PXE'
            : config.integratedNic !== 'Disabled'));

      if (!wolAllowed) {
        setStage('boot-result');
        return;
      }
    }

    setStage('splash');
    setProgress(0);
    const start = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / postDurationMs) * 100));
      setProgress(pct);
      if (pct >= 100) {
        window.clearInterval(timer);
        if (config.systemPassword) {
          setStage('password');
        } else if (config.dataWipeNextBoot) {
          setStage('wipe-confirm');
        } else {
          setStage('boot-result');
        }
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [isOpen, initialMode, postDurationMs, config.systemPassword, config.adminPassword, config.uefiBootPathSecurity, config.dataWipeNextBoot, config.wakeOnLan, config.deepSleepControl, config.integratedNic]);

  const evaluation: BootEvaluation = useMemo(() => {
    const traces: string[] = [
      `[POST] Dell System BIOS ${FIRMWARE_METADATA.biosVersion} (${FIRMWARE_METADATA.driverId}) · SysId ${FIRMWARE_METADATA.sysId} · SvcTag ${FIRMWARE_METADATA.serviceTag}`,
      `[POST] Fastboot=${config.fastboot} · Extended POST=${config.extendPostTime} · NumLock=${config.numLockAtBoot ? 'ON' : 'OFF'}`,
      `[CPU] Intel Core Ultra · VT-x=${config.intelVtx ? 'ENABLED' : 'DISABLED'} · VT-d/IOMMU=${config.intelVtd ? 'ENABLED' : 'DISABLED'} · Kernel DMA=${config.kernelDmaProtection ? 'PROTECTED' : 'OFF'}`,
      `[SEC] TPM 2.0=${config.tpmEnabled ? 'ACTIVE (PCR 0-7 Measured)' : 'DISABLED'} · SMM Mitigation=${config.smmSecurityMitigation ? 'ON' : 'OFF'}`,
      `[DISK] Controller=${config.sataNvmeOperation} · SSD-0 (hdd.1)=${config.m2Slot0Enabled ? 'ONLINE' : 'DISABLED'} · SSD-1 (hdd.2)=${config.m2Slot1Enabled ? 'ONLINE' : 'DISABLED'}`,
    ];

    if (initialMode === 'wol') {
      traces.unshift('[S5-WOL] Sending UDP Magic Packet (FF:FF:FF:FF:FF:FF + 16x MAC 5C:80:B6:42:9A:10)...');
      if (config.wakeOnLan === 'Disabled') {
        return {
          status: 'wol-blocked',
          headline: 'Magic Packet Ignored: Wake on LAN is Disabled',
          detail:
            'System Management -> Wake on LAN / WLAN is set to Disabled. Set it to "LAN Only" or "LAN with PXE Boot" on the QBM1250.',
          traceLines: [
            '[S5-WOL] Sending UDP Magic Packet to 5C:80:B6:42:9A:10 (Port 9)...',
            '[NIC] Firmware ACPI S5 wake bit GPE0_EN is cleared (Wake on LAN = Disabled).',
            '[RESULT] System remains in S5 Soft Off.',
          ],
        };
      }
      if (config.deepSleepControl !== 'Disabled') {
        return {
          status: 'wol-blocked',
          headline: `Magic Packet Dropped: Deep Sleep Control (${config.deepSleepControl})`,
          detail:
            'ErP Lot 6 Deep Sleep powered off the 3.3V auxiliary standby rail to the onboard NIC in S4/S5. Set Power -> Deep Sleep Control to "Disabled" so the NIC can listen for Magic Packets.',
          traceLines: [
            '[S5-WOL] Sending UDP Magic Packet to 5C:80:B6:42:9A:10 (Port 9)...',
            `[PWR] Deep Sleep Control = ${config.deepSleepControl} -> 3.3Vaux NIC standby rail is OFF (0 mA).`,
            '[NIC] Ethernet link LED off; PHY cannot inspect incoming frames.',
            '[RESULT] System remains in S5 Soft Off.',
          ],
        };
      }
      if (config.wakeOnLan !== 'WLAN Only' && config.integratedNic === 'Disabled') {
        return {
          status: 'wol-blocked',
          headline: 'Magic Packet Dropped: Integrated NIC is Disabled',
          detail:
            'System Configuration -> Integrated NIC is Disabled, so the onboard Ethernet controller is powered down.',
          traceLines: [
            '[S5-WOL] Sending UDP Magic Packet to 5C:80:B6:42:9A:10...',
            '[NIC] Onboard Ethernet controller disabled in BIOS System Configuration.',
            '[RESULT] System remains in S5 Soft Off.',
          ],
        };
      }
      if (config.wakeOnLan === 'LAN with PXE Boot' && config.integratedNic !== 'Enabled w/ PXE') {
        return {
          status: 'wol-blocked',
          headline: 'Wake Triggered, PXE Blocked: Integrated NIC lacks PXE Stack',
          detail:
            'Wake on LAN is set to "LAN with PXE Boot", but System Configuration -> Integrated NIC is set to "Enabled" instead of "Enabled w/ PXE".',
          traceLines: [
            '[S5-WOL] Magic Packet accepted by onboard NIC -> System transitioning S5 -> S0.',
            '[PXE] Error: Integrated NIC PXE Option ROM disabled in System Configuration.',
          ],
        };
      }
      traces.splice(
        1,
        0,
        `[S5-WOL] Deep Sleep=Disabled · NIC 3.3Vaux Standby=ACTIVE · Wake on LAN=${config.wakeOnLan} -> PME# Asserted! Transitioning S5 -> S0.`
      );
      if (config.wakeOnLan === 'LAN with PXE Boot') {
        const pxeTarget = config.bootSequence.find((b) => b.type === 'pxe');
        if (pxeTarget) {
          return {
            status: 'success',
            headline: 'S5 Wake-on-LAN Succeeded -> Booting via PXE Network',
            detail:
              'Magic Packet powered on the QBM1250 from S5 and handed off directly to the PXE IPv4 network boot stack.',
            target: pxeTarget,
            traceLines: [
              ...traces,
              `[UEFI] Overriding boot priority due to "LAN with PXE Boot" -> ${pxeTarget.label}`,
              '[PXE] DHCP Offer received -> Downloading NBP (wdsmgfw.efi / ipxe.efi).',
            ],
          };
        }
      }
    }

    if (wipeExecuted) {
      return {
        status: 'wiped',
        headline: 'Dell Data Wipe Completed (NIST SP 800-88 Sanitize)',
        detail:
          'Cryptographic Erase & NVMe Sanitize executed across internal M.2 slots. No OS partition remains.',
        traceLines: [
          ...traces,
          '[WIPE] Internal NVMe M.2 PCIe SSD-0 sanitized cleanly.',
          '[BOOT] Halting system after sanitization.',
        ],
      };
    }

    const chosenTarget = selectedOverrideId
      ? config.bootSequence.find((b) => b.id === selectedOverrideId)
      : activeCandidates[0];

    if (!chosenTarget) {
      return {
        status: 'no-boot-device',
        headline: 'No Bootable Devices Found',
        detail:
          'All UEFI boot targets are either disabled, blocked by hardware policy (External USB / M.2 Slot-0 / PXE), or missing.',
        traceLines: [
          ...traces,
          '[BOOT] Enumerated 0 valid EFI System Partitions.',
          '[HALT] SupportAssist Pre-Boot System Assessment ready.',
        ],
      };
    }

    if (chosenTarget.type === 'nvme' && config.sataNvmeOperation === 'Disabled') {
      return {
        status: 'no-boot-device',
        headline: 'No Bootable Devices Found (Storage Controller Disabled)',
        detail:
          'SATA/NVMe Operation is set to Disabled in BIOS Storage settings, so the internal NVMe drive is invisible.',
        target: chosenTarget,
        traceLines: [
          ...traces,
          `[BOOT] Attempted ${chosenTarget.label}`,
          '[ERR] PCIe Storage Controller disabled in firmware.',
        ],
      };
    }

    // Secure boot check
    if (config.secureBoot && !chosenTarget.signed) {
      if (config.secureBootMode === 'Deployed Mode') {
        return {
          status: 'secure-boot-violation',
          headline: 'Secure Boot Violation',
          detail:
            'Invalid signature detected. Check Secure Boot Policy in Setup. The selected EFI binary is not signed by a key in db or Microsoft UEFI CA.',
          target: chosenTarget,
          traceLines: [
            ...traces,
            `[UEFI] Loading ${chosenTarget.label}...`,
            `[SEC] Secure Boot Mode = Deployed Mode · Microsoft UEFI CA = ${config.microsoftUefiCa ? 'Enabled' : 'Disabled'}`,
            '[FAIL] Image verification failed against NVRAM db/KEK/PK certificates. Execution blocked!',
          ],
        };
      }
      traces.push(
        `[AUDIT] Unsigned image (${chosenTarget.label}) logged to TPM PCR7, allowed by Audit Mode.`
      );
    }

    if (
      chosenTarget.id === 'hdd.1' &&
      config.sataNvmeOperation === 'AHCI/NVMe'
    ) {
      return {
        status: 'bsod-storage',
        headline: 'Windows Stop Code: INACCESSIBLE_BOOT_DEVICE (0x0000007B)',
        detail:
          'Windows was originally installed under "RAID On" (Intel VMD). Switching to "AHCI/NVMe" without enabling the inbox storahci/stornvme driver in Safe Mode prevents Windows from mounting the boot volume.',
        target: chosenTarget,
        traceLines: [
          ...traces,
          `[UEFI] Handed off to \\EFI\\Microsoft\\Boot\\bootmgfw.efi`,
          `[KERN] Ntfs!MountVolume failed: expected iaStorVD.sys (Intel VMD), controller reports standard NVMe/AHCI.`,
        ],
      };
    }

    return {
      status: 'success',
      headline: `Booting: ${chosenTarget.osLabel}`,
      detail: `UEFI handoff succeeded via ${chosenTarget.label}.`,
      target: chosenTarget,
      traceLines: [
        ...traces,
        `[UEFI] Verified & launched ${chosenTarget.label}`,
        `[UEFI] ExitBootServices() complete -> OS Kernel initialized.`,
      ],
    };
  }, [config, activeCandidates, selectedOverrideId, wipeExecuted]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected =
      initialMode === 'f12' && config.adminPassword
        ? config.adminPassword
        : config.systemPassword || config.adminPassword;

    if (passInput === expected) {
      setPassError('');
      if (initialMode === 'f12') {
        setStage('f12-menu');
      } else if (config.dataWipeNextBoot) {
        setStage('wipe-confirm');
      } else {
        setStage('boot-result');
      }
    } else {
      setPassError('Invalid Password. System halted until valid credentials are provided.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Dell POST and Boot Simulator"
    >
      <div className="w-full max-w-3xl rounded-md border border-[#2c384a] bg-[#090d12] shadow-2xl overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-[#1e2736] bg-[#10161f] px-5 py-3">
          <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
            <span className="font-semibold text-sky-400">POST &amp; Boot Chain Simulation</span>
            <span aria-hidden="true">·</span>
            <span>BIOS {FIRMWARE_METADATA.biosVersion} ({FIRMWARE_METADATA.driverId})</span>
          </div>
          <div className="flex items-center gap-2">
            {stage === 'splash' && (
              <>
                <button
                  type="button"
                  onClick={() => onReturnToBios('Entered BIOS Setup via F2 during POST.')}
                  className="rounded border border-[#334155] bg-[#18212d] px-2.5 py-1 text-xs font-mono text-slate-200 hover:border-sky-400"
                >
                  F2 Setup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (config.adminPassword && config.uefiBootPathSecurity === 'Always') {
                      setStage('password');
                    } else {
                      setStage('f12-menu');
                    }
                  }}
                  className="rounded border border-[#334155] bg-[#18212d] px-2.5 py-1 text-xs font-mono text-slate-200 hover:border-sky-400"
                >
                  F12 Boot Menu
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onReturnToBios()}
              className="rounded bg-[#007DB8] px-3 py-1 text-xs font-semibold text-white hover:bg-[#0284c7]"
            >
              Return to BIOS Setup
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 min-h-[410px] flex flex-col justify-between">
          {stage === 'splash' && (
            <div className="my-auto flex flex-col items-center text-center py-8">
              <div className="text-3xl font-bold tracking-[0.2em] text-sky-400 select-none">
                DELL
              </div>
              <div className="mt-2 text-xs font-mono text-slate-400">
                {FIRMWARE_METADATA.model} · BIOS Revision {FIRMWARE_METADATA.biosVersion}
              </div>

              <div className="mt-8 w-full max-w-md">
                <div className="h-1.5 w-full overflow-hidden rounded-sm bg-[#1b2431]">
                  <div
                    className="h-full bg-[#007DB8] transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 tabular-nums">
                  <span>Fastboot: {config.fastboot}</span>
                  <span>{progress}%</span>
                </div>
              </div>

              <p className="mt-8 text-xs font-mono text-slate-400">
                Press <span className="text-slate-100">F2 Setup</span> or{' '}
                <span className="text-slate-100">F12 Boot Menu</span> above, or wait for UEFI
                Boot Manager handoff...
              </p>
            </div>
          )}

          {stage === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="my-auto mx-auto w-full max-w-md">
              <div className="rounded border border-[#2c384a] bg-[#111720] p-6">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <Lock className="w-5 h-5" />
                  <h3 className="text-base font-semibold text-slate-100">
                    {initialMode === 'f12'
                      ? 'Admin Password Required (UEFI Boot Path Security)'
                      : 'System Power-On Password Required'}
                  </h3>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Service Tag: {FIRMWARE_METADATA.serviceTag} · Enter firmware password to continue
                  boot sequence.
                </p>
                <input
                  type="password"
                  autoFocus
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  placeholder="Enter password..."
                  className="mt-4 w-full rounded border border-[#334155] bg-[#090d12] px-3 py-2 text-sm font-mono text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
                />
                {passError && (
                  <p className="mt-2 text-xs text-rose-400">{passError}</p>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onReturnToBios()}
                    className="rounded border border-[#334155] px-3 py-1.5 text-xs text-slate-300"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-[#007DB8] px-4 py-1.5 text-xs font-semibold text-white"
                  >
                    Unlock
                  </button>
                </div>
              </div>
            </form>
          )}

          {stage === 'f12-menu' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  One-Time Boot Settings (F12)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select a UEFI device to boot once without permanently changing the NVRAM Boot
                  Sequence.
                </p>
              </div>
              <div className="space-y-2">
                {config.bootSequence.map((entry) => {
                  const blocked =
                    (entry.type === 'usb' && !config.externalUsbBoot) ||
                    (entry.type === 'pxe' && config.integratedNic !== 'Enabled w/ PXE') ||
                    (entry.type === 'uri' && (!config.httpsBoot || config.integratedNic === 'Disabled')) ||
                    (entry.id === 'hdd.1' && !config.m2Slot0Enabled) ||
                    (entry.id === 'hdd.2' && !config.m2Slot1Enabled);
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      disabled={blocked}
                      onClick={() => {
                        setSelectedOverrideId(entry.id);
                        setStage('boot-result');
                      }}
                      className="w-full flex items-center justify-between rounded border border-[#273242] bg-[#111720] px-4 py-3 text-left hover:border-[#007DB8] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-100">{entry.label}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {entry.osLabel}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-sky-400">
                        {blocked ? 'Blocked by Policy' : 'Boot Now'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {stage === 'wipe-confirm' && (
            <div className="my-auto mx-auto max-w-lg rounded border border-rose-500/40 bg-rose-950/20 p-6">
              <div className="flex items-center gap-2.5 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-semibold text-slate-100">
                  Dell Data Wipe Armed for Next Boot
                </h3>
              </div>
              <p className="mt-2 text-[13px] text-slate-300 leading-relaxed">
                "Wipe on Next Boot" was enabled in Security settings. Confirm to execute NIST SP
                800-88 NVMe Sanitize across internal storage (simulated).
              </p>
              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setStage('boot-result')}
                  className="rounded border border-[#334155] bg-[#161d27] px-3.5 py-2 text-xs text-slate-200"
                >
                  Skip Wipe &amp; Boot OS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWipeExecuted(true);
                    setStage('boot-result');
                  }}
                  className="rounded bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-500"
                >
                  Execute Simulated Sanitize
                </button>
              </div>
            </div>
          )}

          {stage === 'boot-result' && (
            <div className="space-y-4">
              <div
                className={`rounded border p-4 ${
                  evaluation.status === 'success'
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-rose-500/50 bg-rose-950/25'
                }`}
              >
                <div className="flex items-start gap-3">
                  {evaluation.status === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">
                      {evaluation.headline}
                    </h3>
                    <p className="mt-1 text-[13px] text-slate-300 leading-relaxed">
                      {evaluation.detail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Firmware Boot Chain Trace */}
              <div className="rounded border border-[#273242] bg-[#06090d] p-4">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2.5">
                  <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>UEFI Firmware Execution Trace</span>
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {evaluation.traceLines.join('\n')}
                </pre>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStage('f12-menu')}
                  className="inline-flex items-center gap-1.5 rounded border border-[#334155] bg-[#161d27] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-[#007DB8]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Test Another Target (F12 Menu)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onReturnToBios(
                      `Simulated POST (${evaluation.status}): ${evaluation.headline}`
                    )
                  }
                  className="rounded bg-[#007DB8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0284c7]"
                >
                  Exit Simulation &amp; Return to BIOS Setup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
