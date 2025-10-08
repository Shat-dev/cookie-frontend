# $GUMBALL - ERC-404 Lottery Frontend

A revolutionary ERC-404 lottery game with video game aesthetics built with Next.js and TypeScript.

## 🎮 Features

- **Video Game Aesthetics**: Retro gaming style with glowing effects, scanlines, and matrix animations
- **Real-time Countdown Timer**: Dynamic countdown for lottery draws
- **Responsive Design**: Optimized for desktop and mobile devices
- **Gaming UI Components**: Custom retro-styled buttons and interactive elements
- **Web3 Ready**: Prepared for blockchain integration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom gaming styles
- **Fonts**: Orbitron & Press Start 2P (Google Fonts)
- **Components**: Custom gaming-style components

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles with gaming theme
│   │   ├── layout.tsx           # Root layout component
│   │   └── page.tsx             # Main page component
│   └── components/
│       ├── GamingButton.tsx     # Reusable gaming-style button
│       └── CountdownTimer.tsx   # Countdown timer component
├── public/
│   └── Gumball.png             # Main gumball machine image
└── package.json
```

## 🎨 Design System

### Colors

- **Primary**: Green (#00ff00) - Main accent color
- **Secondary**: Blue (#0066ff) - Secondary actions
- **Accent**: Pink (#ff0066) - Highlights and warnings
- **Background**: Black (#0a0a0a) - Dark theme
- **Success**: Light Green (#00ff88)
- **Error**: Red (#ff0044)

### Typography

- **Primary Font**: Orbitron - Modern gaming font
- **Terminal Font**: Press Start 2P - Retro terminal style

### Effects

- **Glow Effects**: Text and box shadows with green glow
- **Scanline Animation**: Moving scanline across the screen
- **Matrix Particles**: Animated background elements
- **Hover Effects**: Interactive button animations

## 🎯 Components

### GamingButton

A customizable button component with retro gaming aesthetics.

```tsx
<GamingButton
  onClick={handleClick}
  variant="primary"
  size="lg"
  disabled={false}
>
  PLAY
</GamingButton>
```

### CountdownTimer

A countdown timer with gaming-style display and animations.

```tsx
<CountdownTimer
  initialTime={{ hours: 0, minutes: 38, seconds: 30 }}
  onComplete={handleComplete}
/>
```

## 🔧 Customization

### Adding New Gaming Effects

1. Add CSS animations in `globals.css`:

```css
@keyframes yourAnimation {
  0% {
    /* start state */
  }
  100% {
    /* end state */
  }
}
```

2. Apply to components:

```css
.your-class {
  animation: yourAnimation 2s infinite;
}
```

### Modifying Colors

Update CSS custom properties in `globals.css`:

```css
:root {
  --foreground: #your-color;
  --accent: #your-accent-color;
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

Build the project:

```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎮 Game Integration

This frontend is designed to integrate with ERC-404 smart contracts. Key integration points:

- **Wallet Connection**: Connect to Web3 wallets
- **Smart Contract Calls**: Interact with lottery contracts
- **Transaction Handling**: Manage lottery participation
- **Real-time Updates**: Live draw results and timer sync

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Smart Contracts**: [See contracts folder]
- **Documentation**: [Coming Soon]

---

Built with ❤️ for the Web3 gaming community
# cookie-frontend
# cookie-frontend
# cookie-frontend
