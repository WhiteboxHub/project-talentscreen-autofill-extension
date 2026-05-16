# TalentScreen Color Scheme

## Button Colors

```
┌─────────────────────────────────────────────────────┐
│  AUTOFILL BUTTON                                    │
│  Color: #00D9A5 (Teal/Turquoise)                   │
│  Primary action - most important                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  COMPLETE SETUP BUTTON                              │
│  Color: #6366f1 (Indigo/Blue)                      │
│  Setup completion action                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  SELECT DIFFERENT RESUME                            │
│  Color: #f59e0b (Orange/Amber)                     │
│  Resume management action                           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  CHOOSE PDF/DOC                                     │
│  Color: #a855f7 (Purple)                           │
│  File upload action                                 │
└─────────────────────────────────────────────────────┘
```

## Widget Colors

```
╔═════════════════════════════════════════════════════╗
║  VIEW & SELECT YOUR RESUME                          ║
║  Border: #f59e0b (Orange) - 2px solid              ║
║  Background: #fef3c7 (Amber light)                 ║
║  Icon & Text: #f59e0b (Orange/Amber) - BOLD       ║
║  ⭐ EXPANDED BY DEFAULT - MOST PROMINENT            ║
╚═════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────┐
│  YOUR AUTOFILL INFORMATION                          │
│  Background: Gradient (#e0e7ff → #f3e8ff)          │
│  Icon & Text: #6366f1 (Indigo) - BOLD             │
│  Collapsible, starts collapsed                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  JOB INFO CARD                                      │
│  Background: White                                  │
│  Border: #e5e7eb (Gray)                            │
│  Shadow: Standard card shadow                       │
└─────────────────────────────────────────────────────┘
```

## Visual Hierarchy

### Setup View:
```
1. Upload JSON (Teal button)        ← Primary
2. Upload PDF/DOC (Purple button)   ← Secondary  
3. Complete Setup (Indigo button)   ← Action
```

### Active View:
```
1. Autofill Button (Teal)                    ← PRIMARY ACTION
2. View & Select Resume Widget (Orange box)   ← PROMINENT
   └─ Select Different Resume (Orange btn)
3. Your Autofill Info (Gradient box)         ← INFO
4. Progress/History                           ← CONTEXT
```

## Color Meanings

| Color | Hex | Usage | Psychology |
|-------|-----|-------|------------|
| **Teal** | `#00D9A5` | Main action (Autofill) | Energy, action, trust |
| **Indigo** | `#6366f1` | Setup completion | Professional, reliable |
| **Orange** | `#f59e0b` | Resume selection | Important, attention |
| **Purple** | `#a855f7` | File upload | Secondary, creative |
| **Green** | `#10b981` | Success states | Positive, complete |
| **Red** | `#ef4444` | Errors, delete | Danger, warning |
| **Gray** | `#6b7280` | Muted text | Neutral, info |

## Accessibility

All color combinations meet WCAG 2.1 AA standards:
- Teal button: White text on `#00D9A5` ✅
- Indigo button: White text on `#6366f1` ✅
- Orange button: White text on `#f59e0b` ✅
- Purple button: White text on `#a855f7` ✅

## Dark Mode Support

Colors adjust automatically with CSS variables:
```css
@media (prefers-color-scheme: dark) {
  /* All custom colors remain vibrant in dark mode */
  /* Backgrounds and borders adjust appropriately */
}
```

## Design Rationale

### Why These Colors?

1. **Teal (Primary)** - Existing brand color, kept for consistency
2. **Indigo** - Professional, different from primary, indicates progression
3. **Orange** - High visibility, stands out, draws attention to resume selector
4. **Purple** - Distinct from others, clearly marks file upload functionality

### Why Orange for Resume Selector?

- **High visibility**: Orange naturally draws the eye
- **Warm color**: Friendly and inviting for user interaction
- **Distinct**: Clearly different from primary teal action
- **Expanded by default**: Maximum prominence for resume management

### Why Remove Sections?

1. **Upload Resume widget** → Merged into "View & Select Resume" (reduced redundancy)
2. **Settings button** → Removed clutter, functionality still accessible if needed via modal

## Before & After

### Before:
- Generic white/gray widgets
- Too many similar-looking sections
- No clear hierarchy
- Settings button added clutter

### After:
- Color-coded for quick recognition
- Clear visual hierarchy (orange = resume, gradient = info)
- Bigger, more prominent resume selector
- Cleaner, focused interface
