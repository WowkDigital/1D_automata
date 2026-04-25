# Automata. 🧬

A premium, high-performance **1D Elementary Cellular Automata** simulator built with modern web technologies. Experience the beauty of mathematical chaos through a stunning, glassmorphism-inspired interface.

<div align="center">
  <a href="https://wowkdigital.github.io/1D_automata/">
    <img src="https://img.shields.io/badge/Wersja_Online-Zobacz_Projekt-14b8a6?style=for-the-badge&logo=internetexplorer&logoColor=white" alt="Live Demo">
  </a>
</div>

![Automata Preview](https://via.placeholder.com/1200x600/0a0a0a/14b8a6?text=Automata.+1D+Cellular+Evolution)

## 🚀 Features

- **Rule Explorer**: Explore all 256 elementary rules (Rule 30, 90, 110, etc.) with real-time logic visualization.
- **Glassmorphism UI**: A sleek, dark-themed interface with backdrop-blur effects and subtle animations.
- **Real-time Rendering**: High-performance Canvas-based rendering optimized for smooth evolution.
- **Customizable Aesthetics**: Change active/void colors on the fly.
- **Evolution Controls**: Pause, step, reset, and adjust simulation speed up to 60 FPS.
- **Dynamic Grid**: Adjustable cell sizes (resolution) to explore patterns at different scales.
- **Entropy vs. Order**: Choose between a centered single-pixel seed or a randomized (entropy) initial state.
- **Responsive Design**: Works seamlessly across different screen sizes.

## 🛠️ Technologies

- **HTML5 Canvas**: For high-performance grid rendering.
- **Tailwind CSS**: For the modern, responsive layout and glassmorphism styling.
- **Lucide Icons**: For a clean and intuitive iconography.
- **Vanilla JavaScript**: Pure logic without heavy framework overhead.
- **Google Fonts**: Featuring *Outfit* and *JetBrains Mono*.

## 📖 How it Works

Elementary cellular automata consist of a row of cells. Each cell has two possible states (0 or 1). The next generation is determined by a set of rules applied to each cell and its immediate neighbors (left and right).

1. **Rule Logic**: The 8 possible configurations of a cell and its neighbors are mapped to a result (0 or 1), creating a unique 8-bit number (the Rule Number).
2. **Evolution**: Each new generation is rendered below the previous one, creating intricate fractal patterns or chaotic structures over time.

## 📥 Getting Started

Since this is a standalone web application, there is no installation required.

1. Download the `index.html` file.
2. Open it in any modern web browser (Chrome, Firefox, Edge, Safari).
3. Start exploring the evolution of 1D patterns!

## 🎨 Customization

You can easily tweak the source code to add your own presets or change the default color palette. The styling is managed via Tailwind CSS configurations in the `<head>` section.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

Built with ❤️ for mathematical art enthusiasts.
