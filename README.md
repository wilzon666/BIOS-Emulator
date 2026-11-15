# Dell System BIOS 1.20.0 (T2C2C) — UEFI Setup & QBM1250 Emulator

An interactive **Dell UEFI BIOS Setup Utility** and **POST / Wake-on-LAN Simulator** built for technical lectures and live classroom demonstrations (modeled on **Dell Pro Micro Plus QBM1250**, System BIOS `1.20.0`, Driver ID `T2C2C`, Released `03 Nov 2026`).

## Features
- **3-Pane Dell UEFI Setup Interface**: Interactive toggles, radio selectors, dropdowns, UEFI Boot Sequence reordering, and global search (`Ctrl+F`).
- **Live QBM1250 Wake-on-LAN (WoL) Workflow**:
  - `System Management` (`Wake on LAN / WLAN`, `AC Recovery`, `Auto On Time`, `SERR Messages`)
  - `Power` (`Deep Sleep Control`, `Block Sleep`, `USB Wake Support`) with live dependency warnings
  - `System Configuration` (`Integrated NIC`, `Thunderbolt Security`, hardware kill switches)
  - Built-in **How to Enable Wake-on-LAN Guide (English & Deutsch)** covering BIOS, Windows Fast Startup, NIC Power Management / Advanced Driver properties, and Magic Packet testing
  - **Test S5 Wake-on-LAN** simulator demonstrating Magic Packet drops vs. successful S5 wake
- **POST & Boot-Chain Simulator**: Demonstrates `F2 Setup`, `F12 One-Time Boot Menu`, Admin/System Password gates, `Secure Boot Violation` on unsigned EFI binaries, and `INACCESSIBLE_BOOT_DEVICE` when switching `RAID On` to `AHCI/NVMe`.
- **Lecture Scenario Presets**: One-click configurations for Factory Default, Wake-on-LAN Lab, Linux Dual-Boot & AHCI, Hypervisor/VT-d, and Zero-Trust Lockdown.

---

## Deploying as a Docker Stack (Portainer / Docker Compose)

### 1. Push this repository to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Dell QBM1250 BIOS 1.20.0 emulator"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Deploy in Portainer (Stack from Git Repository)
1. In Portainer, open **Stacks** → **+ Add stack**.
2. Choose **Repository** as the Build method.
3. Enter your GitHub repository URL (`https://github.com/<your-username>/<your-repo>`), branch `refs/heads/main`, and leave **Compose path** as `docker-compose.yml`.
4. Click **Deploy the stack**.
5. Open the emulator at `http://<your-server-ip>:8080`.

> **Note:** If you previously got `open /data/compose/.../docker-compose.yml: no such file or directory`, make sure `docker-compose.yml` is committed and pushed to your GitHub branch, then click **Pull and redeploy** (or recreate the stack) in Portainer.

### 3. Deploy via CLI on Any Linux Server
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
docker compose up -d --build
```

### 4. Optional: Pre-built Image via GitHub Container Registry (GHCR)
Pushing to `main` automatically runs `.github/workflows/docker-publish.yml` to publish `ghcr.io/<your-username>/<your-repo>:latest` if GitHub Actions is enabled on your repo. You can then use that image directly in a Portainer Web Editor stack:
```yaml
services:
  bios-emulator:
    image: ghcr.io/<your-username>/<your-repo>:latest
    ports:
      - "8080:80"
    restart: unless-stopped
```

### 5. Local Development (Node.js 20+)
```bash
npm install
npm run dev
```
