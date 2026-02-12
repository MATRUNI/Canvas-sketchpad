# Canvas-sketchpad
## A High-Performance Drawing Engine Built with Vanilla JavaScript
## 🔗 Live Demo: [Canvas-sketchpad](https://matruni.github.io/Canvas-sketchpad/)


## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Future Improvements](#future-improvements)
- [Usage](#usage)
- [Personal Milestone](#personal-milestone)
- [Author](#author)

---


# Project Overview

Canvas Sketchpad is a browser-based drawing engine built entirely with **HTML5 Canvas and vanilla JavaScript**.

What started as a curiosity project — “How smooth can I make a digital brush feel?” — evolved into implementing:
-
- Adaptive stroke smoothing using the One Euro Filter

- Pressure-sensitive brush rendering
- Quadratic curve interpolation
    
- A zoomable world-space camera system
    
- Undo/redo state management
- High-DPI rendering optimizations

This project focuses on recreating the natural fluidity of professional drawing tools — from scratch.


# Core Features

### 🖌 Smooth Stroke Rendering
- One Euro Filter for adaptive jitter reduction
- Quadratic curve interpolation for natural stroke transitions
- Micro-movement filtering to remove noise

### 🎚 Pressure-Sensitive Drawing
- Dynamic brush thickness based on pointer pressure
- Smoothed pressure blending between points
- Zoom-aware brush scaling

### 🔄 Undo / Redo System
- Stack-based state history
- Deep-cloned stroke snapshots
- Keyboard shortcuts (Ctrl+Z / Ctrl+Y)

### 🔍 Zoomable Camera System
- World-space coordinate rendering
- Transform-based camera scaling
- Center-focused zoom logic
- Stroke rendering preserved across zoom levels

### ⚡ Performance Optimizations
- High-DPI support using devicePixelRatio
- Pointer Events API
- getCoalescedEvents() for smoother input tracking
- Canvas context optimization (willReadFrequently)
---

# Tech Stack

- **HTML5 Canvas API** – rendering & drawing
- **Vanilla JavaScript** – logic for strokes, smoothing, zoom
- **CSS** – full-screen canvas setup & simple styling
- Pointer Event API
- Mathematical interpolation & single filtering

No external libraries.

No frameworks.

Just raw rendering logic and math.

# How It Works

### 1️⃣ Pointer Event Handling
Uses the Pointer Events API to capture input from mouse, touch, and stylus devices. Coalesced events are used for high-frequency input tracking.

### 2️⃣ Stroke Smoothing
The One Euro Filter dynamically adjusts smoothing based on stroke speed:
- Low speed → more smoothing
- High speed → less smoothing

This preserves responsiveness while eliminating jitter.

### 3️⃣ Curve Rendering
Instead of connecting points with straight lines, quadratic Bézier interpolation is used to create fluid stroke segments.

### 4️⃣ Camera Transform System
A custom zoomable camera transforms screen coordinates into world coordinates, allowing infinite canvas-style scaling without distorting strokes.

# Future Improvements
- Stroke selection & editing
- Export drawing as image
- Layer system
- Touch gesture panning
- Performance profiling for large stroke counts
---

# Usage

1. Open the live link or run `index.html` locally.
2. Draw using mouse, stylus, or touch input.
3. Adjust brush size and color using the UI controls.
4. Use Ctrl+Z / Ctrl+Y for undo/redo.
5. Use mouse wheel to zoom.
---

# Personal MileStone


This project started small.

I didn’t plan for signal filtering.
I didn’t plan for camera transforms.
I didn’t plan for pressure-sensitive math.

I was just curious.

But somewhere between debugging jitter and tuning smoothing constants, I realized something:

This was the first time I made code respond to my hand — not just logically, but physically.

This is where math, rendering, and creativity met.

Future me —
Remember this project.
This is where your brush stopped being pixels and started feeling real.

**_Future me: remember this. This is where your coding and creativity met._**



# Author
###  MATRUNI (**_Himanshu Yadav_**)