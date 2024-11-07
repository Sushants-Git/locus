# Locus
[![AUR](https://img.shields.io/badge/AUR-v0.1.1-lightblue.svg)](https://aur.archlinux.org/packages/locus)
[![GitHub Release](https://img.shields.io/github/release/Sushants-Git/locus.svg)](https://github.com/Sushants-Git/locus/releases)

Locus has 2 simple goals: *tracking your focused moments* and *unveiling where the rest of your time silently flows.*

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

### Key Features

- **Automatic Activity Tracking**: Recognizes tasks like web browsing, text editing, and media playback.
- **Elegant Visual Timeline**: Provides clean, user-friendly charts to visualize your focus patterns.
- **Customizable Thresholds**: Filters out brief distractions for a more accurate productivity picture.
- **Resource-Efficient**: Runs efficiently in the background without excessive resource usage.
- **Privacy-Focused**: Operates entirely offline, keeping your data secure on your local device.

## Screenshots
![No activity](https://github.com/user-attachments/assets/9feddb1e-859f-4e43-9881-12c87a8fadd7)
![Running Pomodoro](https://github.com/user-attachments/assets/534b5da4-aa75-458b-8182-e1c6092f60ee)
![Timeline View](https://github.com/user-attachments/assets/9ea1aa8f-8a4f-409f-a538-b41dd3d82f85)
![Activity Analysis](https://github.com/user-attachments/assets/d939cb98-0a5f-4a46-9d9b-c48c311a964d)
