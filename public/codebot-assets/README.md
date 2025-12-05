# Code Bot Assets

Complete asset package for the Code Bot JavaScript learning application.

## Directory Structure

```
codebot-assets/
├── logos/                  # Brand logos and identity
│   ├── logo-main.svg      # Main circular logo (200x200)
│   ├── logo-icon.svg      # Compact icon version (48x48)
│   └── logo-horizontal.svg # Horizontal logo with text (300x80)
│
├── icons/                  # UI and functional icons
│   ├── robot-default.svg  # Default robot character state
│   ├── robot-success.svg  # Success/happy robot state
│   ├── robot-error.svg    # Error/sad robot state
│   ├── github.svg         # GitHub OAuth icon (48x48)
│   ├── play.svg           # Run code button (32x32)
│   ├── step.svg           # Step through code button (32x32)
│   ├── reset.svg          # Reset button (32x32)
│   ├── hint.svg           # Hint/lightbulb icon (32x32)
│   ├── stars-5.svg        # 5-star rating display (160x32)
│   ├── badge.svg          # Achievement badge (80x100)
│   ├── trophy.svg         # Trophy/completion icon (64x64)
│   ├── lock.svg           # Locked level icon (48x48)
│   ├── arrows.svg         # Navigation arrows (128x32)
│   ├── checkmark.svg      # Success checkmark (48x48)
│   └── error-x.svg        # Error X mark (48x48)
│
├── maze-elements/          # Game maze tile assets
│   ├── wall.svg           # Maze wall tile (64x64)
│   ├── path.svg           # Empty path tile (64x64)
│   ├── start.svg          # Starting position tile (64x64)
│   └── goal.svg           # Goal/target tile (64x64)
│
├── images/                 # Large graphics and backgrounds
│   └── hero-background.svg # Hero section gradient background (1200x600)
│
└── ui-components/          # Reusable UI components
    ├── spinner.svg        # Loading spinner animation (64x64)
    └── progress-bar.svg   # Progress bar component (200x24)
```

## Asset Usage Guide

### Logos

**logo-main.svg**
- Use for: Favicon, app icon, social media profile
- Size: 200x200px
- Format: SVG with circular blue background and robot

**logo-icon.svg**
- Use for: Navigation bar, compact spaces
- Size: 48x48px
- Format: Simplified version for small displays

**logo-horizontal.svg**
- Use for: Headers, marketing materials, email signatures
- Size: 300x80px
- Format: Logo + "Code Bot" text + tagline

### Robot Characters

Three emotional states for game feedback:

1. **robot-default.svg** - Blue, neutral expression (READY state)
2. **robot-success.svg** - Green, happy expression (SUCCESS state)
3. **robot-error.svg** - Red, sad expression (ERROR state)

Usage in game:
```jsx
// Example React usage
const robotState = success ? 'success' : error ? 'error' : 'default';
<img src={`/assets/icons/robot-${robotState}.svg`} alt="Robot" />
```

### Maze Elements

**Tile Dimensions:** All maze tiles are 64x64px for consistency

- **wall.svg** - Dark gray brick pattern for obstacles
- **path.svg** - Light blue/white open path
- **start.svg** - Green tile with "S" marker and corner accents
- **goal.svg** - Gold/orange tile with flag icon and sparkles

### UI Icons

**Control Icons:**
- play.svg - Green circular button for "Run Code"
- step.svg - Blue circular button for "Step Through"
- reset.svg - Gray circular button for "Reset"
- hint.svg - Yellow circular button for "Get Hint"

**Status Icons:**
- checkmark.svg - Green success indicator
- error-x.svg - Red error indicator
- lock.svg - Indicates locked/unavailable levels
- badge.svg - Achievement/completion badge
- trophy.svg - Level completion trophy

**Navigation:**
- arrows.svg - Contains left, right, and up arrows for navigation

### Color Palette

The assets use a consistent color scheme:

**Primary Colors:**
- Blue: #2563eb (Primary brand color)
- Green: #10b981 (Success/start)
- Orange: #f59e0b (Goal/warning)
- Red: #ef4444 (Error)
- Yellow: #fbbf24 (Hints/achievements)

**Neutral Colors:**
- Dark: #1e293b (Walls, text)
- Gray: #64748b (Disabled states)
- Light: #f8fafc (Backgrounds)

### GitHub OAuth

**github.svg** - Official GitHub icon for OAuth button
- Size: 48x48px
- Color: GitHub's official #24292f
- Use for: "Sign in with GitHub" button

### Background Images

**hero-background.svg**
- Size: 1200x600px
- Gradient: Purple to pink with grid overlay
- Floating code snippets for atmosphere
- Use for: Landing page hero section

### Animations

**spinner.svg**
- Rotating loading indicator
- CSS animation included
- Use for: Loading states during code execution

**progress-bar.svg**
- Green gradient fill showing 60% completion
- Customizable via CSS or JS
- Use for: Level progress, user progress tracking

## Implementation Examples

### Next.js/React

```jsx
// In your component
import Image from 'next/image';

// Logo in navigation
<Image 
  src="/assets/logos/logo-icon.svg" 
  alt="Code Bot" 
  width={48} 
  height={48} 
/>

// Maze tile
<div className="maze-cell">
  <Image 
    src="/assets/maze-elements/wall.svg" 
    alt="Wall" 
    width={64} 
    height={64} 
  />
</div>

// Robot character
<Image 
  src={`/assets/icons/robot-${state}.svg`}
  alt="Robot"
  width={100}
  height={120}
/>
```

### CSS Background

```css
.hero-section {
  background-image: url('/assets/images/hero-background.svg');
  background-size: cover;
  background-position: center;
}
```

### Favicon

```html
<!-- In your HTML <head> -->
<link rel="icon" type="image/svg+xml" href="/assets/logos/logo-icon.svg">
```

## File Formats

All assets are provided in **SVG format** for:
- Scalability (works at any size)
- Small file sizes
- Easy customization via CSS
- Crisp display on all screens

## Customization

SVG files can be easily customized:
- Colors: Change `fill` and `stroke` attributes
- Sizes: Scale viewBox or use CSS
- Animations: Add CSS keyframes
- Interactive: Add hover states with CSS

## License

These assets are created for the Code Bot application. 
All rights reserved for the Code Bot project.

## Asset Credits

- Robot illustrations: Custom designed
- Icons: Custom designed with consistent style
- Maze elements: Custom game assets
- GitHub logo: Official GitHub branding guidelines

## Support

For questions about asset usage or to request additional assets:
- Email: support@codebot.com
- GitHub: [Your repo URL]

---

**Version:** 1.0.0
**Last Updated:** December 2024
**Total Assets:** 27 files
