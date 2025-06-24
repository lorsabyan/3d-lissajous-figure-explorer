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

```
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
