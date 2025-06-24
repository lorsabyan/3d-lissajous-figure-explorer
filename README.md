# 3D Lissajous Figure Explorer

Interactive WebGL-based visualization tool for exploring 3D Lissajous curves with real-time parameter adjustment and audio synchronization.

## Live Demo

🌐 **[View Live Demo on GitHub Pages](https://lorsabyan.github.io/3d-lissajous-figure-explorer/)**

## Features

- Interactive 3D visualization of Lissajous curves
- Real-time parameter adjustment
- Audio synchronization capabilities
- Modern responsive UI with Tailwind CSS
- WebGL-powered graphics with Three.js

## About Lissajous Figures

### Mathematical Foundation

Lissajous figures (also known as Bowditch curves) are the graph of a system of parametric equations which describe complex harmonic motion. Named after French physicist Jules Antoine Lissajous, these curves represent the composition of two perpendicular harmonic motions.

#### 2D Lissajous Curves

In two dimensions, Lissajous curves are defined by:

```text
x(t) = A·sin(a·t + δ)
y(t) = B·sin(b·t)
```

Where:

- `A`, `B` are the amplitudes
- `a`, `b` are the frequencies
- `δ` is the phase difference
- `t` is time

#### 3D Extension

This explorer extends the concept to three dimensions:

```text
x(t) = A·sin(a·t + δx)
y(t) = B·sin(b·t + δy)
z(t) = C·sin(c·t + δz)
```

### Key Parameters and Their Effects

- **Frequency Ratios**: The ratio between frequencies determines the curve's periodicity and complexity
  - Simple ratios (1:1, 2:1, 3:2) create closed, repeating patterns
  - Irrational ratios produce quasi-periodic, never-repeating curves

- **Phase Differences**: Control the orientation and shape of the curve
  - δ = 0: Creates linear patterns
  - δ = π/2: Produces circular/elliptical patterns
  - Other values create various intermediate shapes

- **Amplitudes**: Scale the curve along each axis, affecting the overall proportions

### Scientific Applications

Lissajous figures have practical applications in:

1. **Electronics**: Oscilloscope displays for analyzing AC signals and phase relationships
2. **Physics**: Studying harmonic oscillators and wave interference
3. **Astronomy**: Modeling orbital mechanics and celestial body trajectories
4. **Engineering**: Vibration analysis and mechanical system diagnostics
5. **Acoustics**: Visualizing audio waveforms and frequency relationships
6. **Art and Design**: Creating complex geometric patterns and animations

### Interactive Features

This explorer allows you to:

- Adjust frequency ratios in real-time to see pattern evolution
- Modify phase relationships to understand their geometric impact
- Control amplitudes to scale the visualization
- Synchronize with audio to explore the relationship between sound and motion
- Export patterns for further analysis or artistic use

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/lorsabyan/3d-lissajous-figure-explorer.git
   cd 3d-lissajous-figure-explorer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment

1. **Push to main branch**: Every push to the `main` branch automatically triggers a build and deployment
2. **Manual deployment**: You can also trigger deployment manually from the GitHub Actions tab

### Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
npm run deploy
```

This will build the project and push it to the `gh-pages` branch.

### Setting up GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select **"GitHub Actions"**
4. The site will be available at `https://lorsabyan.github.io/3d-lissajous-figure-explorer/`

## Technology Stack

- **Frontend Framework**: Vanilla JavaScript with modern ES6+ features
- **3D Graphics**: Three.js
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: GitHub Pages with GitHub Actions

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to GitHub Pages manually
- `npm run clean` - Clean the dist directory

## Project Structure

```text
├── src/
│   ├── css/           # Stylesheets
│   └── js/            # JavaScript modules
├── .github/
│   └── workflows/     # GitHub Actions workflows
├── dist/              # Built files (generated)
├── index.html         # Main HTML file
├── package.json       # Dependencies and scripts
├── vite.config.js     # Vite configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
