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

- Adaptive, pressure-sensitive strokes using [Perfect Freehand](https://github.com/steveruizok/perfect-freehand)
- Pressure-sensitive brush rendering
- High-frequency coalesced input for smooth lines
- A zoomable world-space camera system (Mouse Pointer/Screen Center)
- Pan across the world-space (Space-key + Drag)
- Undo/redo state management
- High-DPI rendering optimizations

This project focuses on recreating the natural fluidity of professional drawing tools — from scratch.

---

# Core Features

### 🖌 Smooth Stroke Rendering
- Uses Perfect Freehand for natural, fluid strokes
- Handles pressure and velocity internally for consistent brush shapes
- Optimized for high-frequency pointer input
- Fully compatible with high-DPI / retina displays
- Works seamlessly with live drawing, undo/redo, and zoom

### 🎚 Pressure-Sensitive Drawing
- Dynamic brush thickness based on pointer pressure
- Smoothed pressure blending between points
- Zoom-aware brush scaling

### 🔄 Undo / Redo System
- Stack-based operation history (stores individual strokes)
- Efficient, memory-optimized — no repeated snapshots
- Keyboard shortcuts (Ctrl+Z / Ctrl+Y)
- Works seamlessly with live drawing and zoom

### 🔍 Zoomable Camera System
- World-space coordinate rendering
- Transform-based camera scaling
- Smooth zoom toward cursor
- Stroke rendering preserved across zoom levels
- Pan for PC (Space + Drag) and zoom for touch devices

### ⚡ Performance Optimizations
- High-DPI support using devicePixelRatio
- Pointer Events API
- getCoalescedEvents() for smoother input tracking
- Canvas context optimization (willReadFrequently)

---

# Tech Stack

- **HTML5 Canvas API** – rendering & drawing
- **Vanilla JavaScript** – logic for strokes, [Perfect Freehand](https://github.com/steveruizok/perfect-freehand) integration, zoom, and undo/redo
- **CSS** – full-screen canvas setup & simple styling
- Pointer Event API with coalesced events for smooth input
- Efficient, operation-based undo/redo stack

No frameworks.  
Just raw rendering logic and math.

---

# How It Works

### 1️⃣ Pointer Event Handling
Uses the Pointer Events API to capture input from mouse, touch, and stylus devices. Coalesced events are used for high-frequency input tracking.

### 2️⃣ Stroke Generation
Perfect Freehand generates smooth polygon outlines from pointer input.
- Handles pressure, velocity, and thinning automatically
- Produces natural fluid strokes without manual curve interpolation
- Preserves responsiveness while eliminating jitter

### 3️⃣ Camera Transform System
A custom zoomable camera transforms screen coordinates into world coordinates, allowing infinite canvas-style scaling without distorting strokes.

Supports panning on PC and zooming on touch devices.

---

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
5. Use mouse wheel to zoom or pinch on touch devices.

---

# Personal Milestone

This project started small.

I didn’t plan for camera transforms.  
I didn’t plan for pressure-sensitive rendering — Perfect Freehand handled it.  
I was just curious.

But somewhere between debugging jitter and integrating Perfect Freehand, I realized something:

This was the first time I made code respond to my hand — not just logically, but physically.

This is where math, rendering, and creativity met.


**_Future me: remember this. This is where your coding and creativity met._**

---

# Author
### MATRUNI (**_Himanshu Yadav_**)
