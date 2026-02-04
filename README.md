# Canvas-sketchpad
## Live link: [Canvas-sketchpad](https://matruni.github.io/Canvas-sketchpad/)


## Table of Content
- [Overview](#-project-overview)
- [Features & Achivement](#-features--achievements)
    - [Jitter](#jitter-reduction)
    - [Handling Edge Cases](#handling-edge-cases)
    - [Brush Styling](#brush-styling)
    - [Zooming (Future)](#zooming--coordinate-transformation-future-objectives)
- [Tech Stack](#-tech-stack)
- [How it Works](#-how-it-works)
    - [Mouse Event Capturing](#mouse-event-capture)
    - [Smoothing](#smoothing-algorithm)
    - [Zoom & Pan](#zoom--pan-support-future)
- [Personal notes](#personal-notes)
- [Future Improvement](#-future-improvements)
- [Usage](#usage)
- [Inspiration](#inspiration)

## Ultra-Smooth Canvas Drawing App 🎨

### “The first time I made a digital brush feel **as smooth as my hand wanted it to be.” – Me**

## 🚀 Project Overview

### This project is a full-screen drawing canvas built in plain JavaScript, designed to replicate the smoothness of professional drawing apps.

It supports:

- **Smooth freehand strokes** using cubic Bezier curves

- **Real-time drawing** with the mouse

- **Moving average point smoothing** to reduce jitter

- **Dynamic brush size, color, and line styling**

- **Zooming and panning** (planned/future)

Every line drawn is an exercise in making pixels obey the hand.

## 🎯 Features & Achievements

1. Jitter Reduction
    - 
    - **Uses a moving average filter** to smooth fast mouse movements
    - **Prevents jagged** edges and shaky lines
2. Handling Edge Cases
    -
    - **Ensures last points** don’t disappear when releasing the mouse
    - **Smoothly finishes strokes using quadratic and linear fallbacks**
3. Brush Styling
    -
    - **Round line caps and joins** for smooth corners
    - **Adjustable line** width and color
4. Zooming & Coordinate Transformation (**Future Objectives**)
    -
    - Scaling the canvas without breaking brush alignment 
    - Transforms mouse coordinates to match zoom level

## 🛠 Tech Stack

- **HTML5 Canvas API** – rendering & drawing
- **Vanilla JavaScript** – logic for strokes, smoothing, zoom
- **CSS** – full-screen canvas setup & simple styling

No frameworks, no shortcuts — just **_pure JS magic_**

## 📖 How It Works

1. Mouse Event Capture
    -
    - **Tracks mousedown, mousemove, mouseup**
    - Stores every point in a **buffer array**
2. Smoothing Algorithm
    -
    - Optional moving average for **extra smoothness**
    - Draws each segment in **real-time**

3. Zoom & Pan Support (**Future**)
    -
    - Scales canvas without distorting strokes
    - Mouse coordinates transformed according to zoom/offset

# Personal notes

### This project isn’t just a canvas
- It’s where I first turned **math + mouse** input into art
- It’s the first time I implemented a **smoothing algorithm that actually worked**
- Every **Bezier curve is a small victory**, every smooth stroke a milestone

**_Future me: remember this. This is where your coding and creativity met._**

## 📌 Future Improvements

### (**_IDK_**)

## Usage
1. Open `index.html` in browser
2. Start Drawing with your mouse
3. Adjust brush/colour in the `ctx` (in js file)
4. Zooming and panning (future feature)

## Inspiration
- Smooth drawing apps like `Excalidraw, Figma, Photoshop`
- Understanding Bezier curves and point interpolation
- The joy of making code respond to your hand movement

### Author: MATRUNI (**_Himanshu Yadav_**)