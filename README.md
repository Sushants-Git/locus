# Locus
An intelligent Pomodoro timer that helps you understand and improve your focus habits.
---

![image](https://github.com/user-attachments/assets/19061081-996d-4e91-a168-677e8d7f3c47)

## What Makes Locus Different?
Unlike traditional Pomodoro timers, Locus automatically tracks your active windows to create detailed focus analytics - all while respecting your privacy. No internet connection required!

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

### Timeline Data
![image 38(1)](https://github.com/user-attachments/assets/9ea1aa8f-8a4f-409f-a538-b41dd3d82f85)
![image](https://github.com/user-attachments/assets/d939cb98-0a5f-4a46-9d9b-c48c311a964d)

### Privacy & Transparency
- Zero external data transmission
- Works offline
- Open source - audit the code yourself
- Only reads window title information, nothing more

## Screenshots
![Timeline View](https://github.com/user-attachments/assets/9ea1aa8f-8a4f-409f-a538-b41dd3d82f85)
![Activity Analysis](https://github.com/user-attachments/assets/d939cb98-0a5f-4a46-9d9b-c48c311a964d)

## System Requirements
Currently available for Linux distributions running X11.

To check if your system is compatible, run:
```bash
echo $XDG_SESSION_TYPE
```
The output should be `x11`. If you see `wayland` or something else, Locus won't work on your system yet.

## Why Locus?
- **Understand Your Habits**: Visualize where your time actually goes
- **Stay Motivated**: Generate better focus charts with fewer gaps
- **Improve Productivity**: Identify and eliminate common distractions
- **Own Your Data**: All tracking stays on your machine

## Installation
[Coming Soon]

## Contributing
[Coming Soon]

## License
[Coming Soon]
