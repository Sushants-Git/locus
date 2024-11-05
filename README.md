# Locus
[![AUR](https://img.shields.io/badge/AUR-v0.1.0-lightblue.svg)](https://aur.archlinux.org/packages/locus)
[![GitHub Release](https://img.shields.io/github/release/Sushants-Git/locus.svg)](https://github.com/Sushants-Git/locus/releases)


An intelligent activity tracker that helps you understand and improve your focus habits.

![image](https://github.com/user-attachments/assets/19061081-996d-4e91-a168-677e8d7f3c47)

## Compatibility
Locus currently supports Linux distributions running X11 only. To check your display server, run `echo $XDG_SESSION_TYPE`. If the output is `x11`, Locus should work on your system. If it shows `wayland` or another type, we are working on support. Please open an issue to help us prioritize your server type.

## Installation

> [!IMPORTANT]  
> Make sure to check the Compatibility section before proceeding.

### Arch Linux
Locus is available on the Arch User Repository (AUR). You can install it using your preferred AUR helper, such as `yay`:

```bash
yay -S locus
```

### Debian-based Distributions
Locus provides pre-built binary packages for Debian-based distributions, including Ubuntu. Download the latest `.deb` package for your system architecture from the [GitHub Releases page](https://github.com/Sushants-Git/locus/releases/) and install it using `dpkg`:

```bash
sudo dpkg -i locus_0.1.0_amd64.deb
```

## What Makes Locus Different?
Locus automatically tracks your active windows to create detailed focus analytics - all while respecting your privacy. No internet connection required!

### Key Features
- **Smart Activity Tracking**: Automatically detects your current activity through window titles:
  - Browser tabs and video titles
  - Terminal commands and processes
  - Video player content (VLC, MPV, etc.)
  - Document names in text editors
  - Application names and states
- **Private by Design**: Works completely offline - no external data transmission
- **Visual Timeline**: Generate beautiful activity charts to understand your focus patterns
- **Customizable Thresholds**: Set minimum focus durations to filter out brief distractions
- **Resource Efficient**: Uses minimal system resources by only reading window title information

## Screenshots
![No activity](https://github.com/user-attachments/assets/9feddb1e-859f-4e43-9881-12c87a8fadd7)
![Running Pomodoro](https://github.com/user-attachments/assets/534b5da4-aa75-458b-8182-e1c6092f60ee)
![Timeline View](https://github.com/user-attachments/assets/9ea1aa8f-8a4f-409f-a538-b41dd3d82f85)
![Activity Analysis](https://github.com/user-attachments/assets/d939cb98-0a5f-4a46-9d9b-c48c311a964d)
