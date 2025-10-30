# 🎬 SlideTube

**SlideTube** is a lightweight JavaScript tool for creating responsive YouTube video slideshows with navigation arrows, dots, and autoplay handling.

---

## 🧠 How It Works

When added to a webpage, **SlideTube** automatically:

1. Converts a set of YouTube video containers into a slideshow.
2. Adds navigation controls:

   * `Prev` and `Next` buttons to move between slides.
   * Clickable dots to jump directly to any slide.
3. Handles autoplay:

   * Automatically moves to the next slide if the current video ends.
   * Pauses automatic sliding while a video is playing.

Multiple independent slideshows can coexist on the same page, and the layout adjusts responsively for desktop and mobile screens.

---

## ⚙️ Requirements

* **Modern web browser** with JavaScript enabled
* YouTube IFrame API (loaded automatically by SlideTube)
* Optional: Internet connection to load YouTube videos

---

## 🚀 Usage

1. Include the CSS and JS in your HTML:

```html
<link rel="stylesheet" href="style.css">
<script src="script.js"></script>
