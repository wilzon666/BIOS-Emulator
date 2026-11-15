import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowRight, Play } from 'lucide-react';
import { BiosConfig, CategoryId, FIRMWARE_METADATA } from '../data/biosData';

interface WolGuideModalProps {
  isOpen: boolean;
  config: BiosConfig;
  adminLocked: boolean;
  onClose: () => void;
  onJumpToSetting: (category: CategoryId, settingKey: string) => void;
  onApplyRecommendedWol: () => void;
  onLaunchWolTest: () => void;
}

type GuideLang = 'en' | 'de';

interface GuideSection {
  step: string;
  title: string;
  subtitle: string;
  items: { label: string; detail: string; target?: { cat: CategoryId; key: string } }[];
}

const GUIDE_CONTENT: Record<
  GuideLang,
  {
    title: string;
    subtitle: string;
    readinessTitle: string;
    applyRecommended: string;
    testWolBtn: string;
    closeBtn: string;
    jumpBtn: string;
    statusReady: string;
    statusActionNeeded: string;
    sections: GuideSection[];
    noteTitle: string;
    noteBody: string;
  }
> = {
  en: {
    title: 'How to Enable Wake-on-LAN (Dell Pro Micro QBM1250)',
    subtitle: `Complete BIOS (${FIRMWARE_METADATA.biosVersion} / ${FIRMWARE_METADATA.driverId}) and Windows OS configuration guide`,
    readinessTitle: 'Live Emulator BIOS Readiness Check',
    applyRecommended: 'Apply Recommended QBM1250 WoL Settings',
    testWolBtn: 'Test S5 Wake-on-LAN',
    closeBtn: 'Close Guide',
    jumpBtn: 'Open Setting',
    statusReady: 'Configured',
    statusActionNeeded: 'Needs Change',
    sections: [
      {
        step: 'Step 1',
        title: 'Dell UEFI BIOS Setup (F2 at Startup)',
        subtitle: 'Ensure auxiliary 3.3V standby power reaches the onboard Ethernet controller in S4/S5.',
        items: [
          {
            label: 'System Management → Wake on LAN / WLAN',
            detail:
              'Set to "LAN Only" (or "LAN with PXE Boot" if the system should boot directly over network PXE after waking).',
            target: { cat: 'systemmanagement', key: 'wakeOnLan' },
          },
          {
            label: 'Power → Deep Sleep Control',
            detail:
              'Set to "Disabled". When enabled in S4 or S5 (ErP Lot 6), the motherboard completely cuts 3.3V standby power to the NIC, causing Magic Packets to be ignored.',
            target: { cat: 'power', key: 'deepSleepControl' },
          },
          {
            label: 'System Configuration → Integrated NIC',
            detail:
              'Set to "Enabled" or "Enabled w/ PXE" (required when using LAN with PXE Boot).',
            target: { cat: 'system', key: 'integratedNic' },
          },
          {
            label: 'System Management → AC Recovery (Recommended)',
            detail:
              'Set to "Last Power State" or "Power On" so a power outage does not leave the NIC uninitialized.',
            target: { cat: 'systemmanagement', key: 'acRecovery' },
          },
        ],
      },
      {
        step: 'Step 2',
        title: 'Disable Windows Fast Startup (Hybrid Shutdown)',
        subtitle: 'Windows Fast Startup puts the kernel into an S4-like hibernation state that often drops NIC wake flags.',
        items: [
          {
            label: 'Control Panel → Power Options → Choose what the power buttons do',
            detail:
              'Click "Change settings that are currently unavailable", uncheck "Turn on fast startup (recommended)", and save changes.',
          },
        ],
      },
      {
        step: 'Step 3',
        title: 'Configure NIC Driver in Windows Device Manager',
        subtitle: 'Realtek and Intel high-speed Ethernet drivers on QBM1250 platforms require explicit wake permissions.',
        items: [
          {
            label: 'Device Manager → Network adapters → Ethernet Controller → Properties → Power Management',
            detail:
              'Enable "Allow this device to wake the computer" and "Only allow a magic packet to wake the computer".',
          },
          {
            label: 'Advanced Tab → Wake on Magic Packet & Shutdown Wake-On-Lan',
            detail:
              'Set "Wake on Magic Packet" to "Enabled". For Realtek PCIe controllers, verify "Shutdown Wake-On-Lan" is also "Enabled" for S5 cold shutdown wake.',
          },
          {
            label: 'Advanced Tab → Energy Efficient Ethernet (EEE) / Green Ethernet',
            detail:
              'Set to "Disabled" if the link drops after shutdown, as aggressive link power saving can prevent Magic Packet detection.',
          },
        ],
      },
      {
        step: 'Step 4',
        title: 'Send & Verify Magic Packet',
        subtitle: 'Confirm network reachability and test S5 wake behavior.',
        items: [
          {
            label: 'Magic Packet Format & Network Port',
            detail:
              'Send a standard WoL Magic Packet (6 bytes of 0xFF followed by 16 repetitions of the NIC MAC address) over UDP Port 9 or Port 7 on the local subnet.',
          },
          {
            label: 'Switch Link LED Verification',
            detail:
              'When powered off (S5) with Deep Sleep Disabled, the RJ45 Ethernet link LED stays lit (amber/green), confirming the NIC is listening.',
          },
        ],
      },
    ],
    noteTitle: 'Important Emulator Note',
    noteBody:
      'After changing BIOS settings in this emulator, click "Apply Changes" in the bottom bar before clicking "Test S5 Wake-on-LAN" so the simulated NVRAM reflects your edits.',
  },
  de: {
    title: 'Anleitung: Wake-on-LAN aktivieren (Dell Pro Micro QBM1250)',
    subtitle: `Vollständige Schritt-für-Schritt-Anleitung für BIOS (${FIRMWARE_METADATA.biosVersion} / ${FIRMWARE_METADATA.driverId}) und Windows`,
    readinessTitle: 'Aktueller BIOS-Status im Emulator',
    applyRecommended: 'Empfohlene QBM1250 WoL-Werte setzen',
    testWolBtn: 'S5 Wake-on-LAN testen',
    closeBtn: 'Schließen',
    jumpBtn: 'Zur Einstellung',
    statusReady: 'Korrekt gesetzt',
    statusActionNeeded: 'Anpassung nötig',
    sections: [
      {
        step: 'Schritt 1',
        title: 'Dell UEFI BIOS einrichten (F2 beim Systemstart)',
        subtitle: 'Sicherstellen, dass die Netzwerkkarte im S4/S5-Zustand weiterhin 3,3V-Standby-Strom erhält.',
        items: [
          {
            label: 'System Management → Wake on LAN / WLAN',
            detail:
              'Auf „LAN Only“ stellen (oder „LAN with PXE Boot“, falls der Rechner nach dem Aufwecken direkt per PXE über das Netzwerk booten soll).',
            target: { cat: 'systemmanagement', key: 'wakeOnLan' },
          },
          {
            label: 'Power → Deep Sleep Control',
            detail:
              'Unbedingt auf „Disabled“ stellen! Ist Deep Sleep (ErP Lot 6) in S4 oder S5 aktiv, trennt das Mainboard die 3,3V-Standby-Versorgung der Netzwerkkarte – Magic Packets werden dann ignoriert.',
            target: { cat: 'power', key: 'deepSleepControl' },
          },
          {
            label: 'System Configuration → Integrated NIC',
            detail:
              'Auf „Enabled“ oder „Enabled w/ PXE“ belassen (bei „LAN with PXE Boot“ ist „Enabled w/ PXE“ zwingend erforderlich).',
            target: { cat: 'system', key: 'integratedNic' },
          },
          {
            label: 'System Management → AC Recovery (Empfohlen)',
            detail:
              'Auf „Last Power State“ oder „Power On“ setzen, damit die Netzwerkkarte nach einem Stromausfall wieder initialisiert wird.',
            target: { cat: 'systemmanagement', key: 'acRecovery' },
          },
        ],
      },
      {
        step: 'Schritt 2',
        title: 'Windows-Schnellstart deaktivieren (Fast Startup)',
        subtitle: 'Der Windows-Schnellstart versetzt das System in einen S4-ähnlichen Ruhezustand und verhindert oft das Aufwecken per LAN.',
        items: [
          {
            label: 'Systemsteuerung → Energieoptionen → Auswählen, was beim Drücken von Netzschaltern geschehen soll',
            detail:
              'Auf „Einige Einstellungen sind momentan nicht verfügbar“ klicken, den Haken bei „Schnellstart aktivieren (empfohlen)“ entfernen und Änderungen speichern.',
          },
        ],
      },
      {
        step: 'Schritt 3',
        title: 'Netzwerkkarte im Windows Geräte-Manager konfigurieren',
        subtitle: 'Realtek- und Intel-Ethernet-Treiber der QBM1250-Plattform benötigen explizite Energie- und Treiberfreigaben.',
        items: [
          {
            label: 'Geräte-Manager → Netzwerkadapter → Ethernet-Controller → Eigenschaften → Energieverwaltung',
            detail:
              '„Gerät kann den Computer aus dem Ruhezustand aktivieren“ und „Nur Magic Packet kann Computer aus dem Ruhezustand aktivieren“ aktivieren.',
          },
          {
            label: 'Reiter „Erweitert“ → Wake on Magic Packet & Shutdown Wake-On-Lan',
            detail:
              '„Wake on Magic Packet“ auf „Aktiviert“ (Enabled) setzen. Bei Realtek-Controllern zusätzlich „Shutdown Wake-On-Lan“ auf „Aktiviert“ stellen, damit das Einschalten aus S5 funktioniert.',
          },
          {
            label: 'Reiter „Erweitert“ → Energy Efficient Ethernet (EEE) / Green Ethernet',
            detail:
              'Auf „Deaktiviert“ (Disabled) setzen, falls die Link-LED nach dem Herunterfahren erlischt.',
          },
        ],
      },
      {
        step: 'Schritt 4',
        title: 'Magic Packet senden & Funktion prüfen',
        subtitle: 'Netzwerk-Erreichbarkeit und S5-Aufwachverhalten verifizieren.',
        items: [
          {
            label: 'Magic-Packet-Aufbau & Port',
            detail:
              'Ein Standard-Magic-Packet (6× 0xFF gefolgt von 16× der Ziel-MAC-Adresse) per UDP-Broadcast an Port 9 (oder Port 7) im Subnetz senden.',
          },
          {
            label: 'Link-LED am RJ45-Port kontrollieren',
            detail:
              'Wenn der PC heruntergefahren ist (S5) und Deep Sleep deaktiviert wurde, leuchtet die Link-LED am LAN-Anschluss weiterhin als Zeichen aktiver Standby-Bereitschaft.',
          },
        ],
      },
    ],
    noteTitle: 'Hinweis zum Emulator',
    noteBody:
      'Nach Änderungen im BIOS-Emulator bitte unten auf „Apply Changes“ klicken, damit der Test „Test S5 Wake-on-LAN“ die gespeicherten NVRAM-Werte verwendet.',
  },
};

export const WolGuideModal: React.FC<WolGuideModalProps> = ({
  isOpen,
  config,
  adminLocked,
  onClose,
  onJumpToSetting,
  onApplyRecommendedWol,
  onLaunchWolTest,
}) => {
  const [lang, setLang] = useState<GuideLang>('en');

  if (!isOpen) return null;

  const t = GUIDE_CONTENT[lang];
  const wolOk = config.wakeOnLan !== 'Disabled';
  const deepSleepOk = config.deepSleepControl === 'Disabled';
  const nicOk =
    config.wakeOnLan === 'LAN with PXE Boot'
      ? config.integratedNic === 'Enabled w/ PXE'
      : config.wakeOnLan === 'WLAN Only' || config.integratedNic !== 'Disabled';
  const allBiosReady = wolOk && deepSleepOk && nicOk;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wol-guide-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-md border border-[#334155] bg-[#141a23] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#273242] bg-[#10161e] px-5 py-3.5">
          <div>
            <h2 id="wol-guide-title" className="text-base font-semibold text-slate-100">
              {t.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Segmented Control */}
            <div
              role="group"
              aria-label="Guide Language"
              className="inline-flex items-center rounded border border-[#2c384a] bg-[#0b1016] p-0.5"
            >
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`rounded-sm px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                  lang === 'en'
                    ? 'bg-[#007DB8] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('de')}
                className={`rounded-sm px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                  lang === 'de'
                    ? 'bg-[#007DB8] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Deutsch
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeBtn}
              className="rounded p-1 text-slate-400 hover:bg-[#222d3d] hover:text-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Live BIOS Readiness Bar */}
          <section className="rounded-md border border-[#273242] bg-[#18202c] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                {allBiosReady ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <h3 className="text-sm font-semibold text-slate-100">{t.readinessTitle}</h3>
              </div>

              {!allBiosReady && (
                <button
                  type="button"
                  disabled={adminLocked}
                  onClick={onApplyRecommendedWol}
                  className="rounded border border-[#007DB8] bg-[#007DB8]/20 px-3 py-1.5 text-xs font-semibold text-sky-200 hover:bg-[#007DB8]/30 disabled:opacity-40 whitespace-nowrap"
                >
                  {t.applyRecommended}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded border border-[#273242] bg-[#121820] p-3">
                <div className="text-slate-400">Wake on LAN / WLAN</div>
                <div
                  className={`mt-1 font-mono font-semibold ${
                    wolOk ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {config.wakeOnLan}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {wolOk ? t.statusReady : t.statusActionNeeded}
                </div>
              </div>

              <div className="rounded border border-[#273242] bg-[#121820] p-3">
                <div className="text-slate-400">Deep Sleep Control</div>
                <div
                  className={`mt-1 font-mono font-semibold ${
                    deepSleepOk ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {config.deepSleepControl}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {deepSleepOk ? t.statusReady : t.statusActionNeeded}
                </div>
              </div>

              <div className="rounded border border-[#273242] bg-[#121820] p-3">
                <div className="text-slate-400">Integrated NIC</div>
                <div
                  className={`mt-1 font-mono font-semibold ${
                    nicOk ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {config.integratedNic}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {nicOk ? t.statusReady : t.statusActionNeeded}
                </div>
              </div>
            </div>
          </section>

          {/* 4-Step Guide */}
          <div className="space-y-4">
            {t.sections.map((section) => (
              <section
                key={section.step}
                className="rounded-md border border-[#273242] bg-[#161d27] p-4"
              >
                <div className="border-b border-[#273242] pb-2.5 mb-3">
                  <div className="text-xs font-mono font-semibold text-sky-400">
                    {section.step}
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-100 mt-0.5">
                    {section.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{section.subtitle}</p>
                </div>

                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 rounded border border-[#232d3b] bg-[#121820] p-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-slate-100">
                          {item.label}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-300">
                          {item.detail}
                        </p>
                      </div>
                      {item.target && (
                        <button
                          type="button"
                          onClick={() => {
                            onJumpToSetting(item.target!.cat, item.target!.key);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 rounded border border-[#334155] bg-[#19222f] px-2.5 py-1.5 text-xs font-medium text-sky-300 hover:border-[#007DB8] whitespace-nowrap shrink-0 self-start"
                        >
                          {t.jumpBtn}
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="rounded border border-[#273242] bg-[#121820] p-3.5 text-xs text-slate-300">
            <span className="font-semibold text-slate-100">{t.noteTitle}: </span>
            {t.noteBody}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#273242] bg-[#10161e] px-5 py-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLaunchWolTest();
            }}
            className="inline-flex items-center gap-1.5 rounded border border-[#007DB8] bg-[#007DB8]/20 px-3.5 py-2 text-xs font-semibold text-sky-200 hover:bg-[#007DB8]/30 whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            {t.testWolBtn}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded bg-[#007DB8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0284c7] whitespace-nowrap"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
