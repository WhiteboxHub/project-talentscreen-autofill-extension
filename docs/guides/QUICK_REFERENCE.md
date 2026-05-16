# Quick Reference - Widget Components

## Widget Hierarchy (Active View)

```
┌─────────────────────────────────────────┐
│ HEADER                                  │
│ - Logo + "TalentScreen"                 │
│ - "Autofill Assistant" subtitle         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ JOB INFO CARD                           │
│ [Logo] Company Name          [73%]      │
│        Job Title                        │
│        Ready to autofill                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         AUTOFILL BUTTON                 │
│            (Mint Green)                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ⓘ Unlimited autofills available         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [👤] Your Autofill Information      [>] │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [📄] Upload Resume                  [v] │
│ ┌───────────────────────────────────┐   │
│ │ [📄] resume.pdf          125 KB   │   │
│ │ [Update Resume Button]            │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [✨] Generate Custom Resume             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Completion                         85%  │
│ ████████████████░░░░                    │
│ 8 out of 10 required fields filled      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ PROGRESS SECTION (during autofill)      │
│ - Progress bar                          │
│ - Stats (filled/skipped/failed)         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      [⚙️] Settings & Information        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [+] Autofill for Another Job            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Recent Applications            [Clear]  │
│ - Company 1 | Role | 2h ago             │
│ - Company 2 | Role | 1d ago             │
└─────────────────────────────────────────┘
```

## Color Palette

```
Primary:       #00D9A5  (Mint Green)
Primary Hover: #00C494  (Darker Mint)
Primary Light: #E0FFF8  (Light Mint Background)
Success:       #10b981  (Green)
Error:         #ef4444  (Red)
Warning:       #f59e0b  (Orange)
Background:    #ffffff  (White)
Secondary BG:  #f9fafb  (Light Gray)
Text:          #111827  (Dark Gray)
Text Muted:    #6b7280  (Medium Gray)
Border:        #e5e7eb  (Light Gray)
```

## Button Styles

### Primary (Autofill)
- Background: `var(--primary)` (#00D9A5)
- Color: White
- Padding: 18px
- Border Radius: 12px
- Hover: Glow effect + darker mint

### Secondary
- Background: White
- Border: 2px solid border color
- Padding: 14px
- Border Radius: 12px
- Hover: Light mint background

### Link Button
- Background: Transparent
- Color: Text muted
- Hover: Mint green color + light background

## Card Components

### Job Info Card
```html
<div class="job-info-card">
  <div class="company-logo"></div>
  <div class="job-info-details">
    <div class="company-name">COMPANY</div>
    <div class="job-title">JOB TITLE</div>
    <div class="job-meta">STATUS</div>
  </div>
  <div class="match-score">73%</div>
</div>
```

### Collapsible Widget
```html
<div class="widget-card collapsible-widget">
  <div class="widget-header">
    <svg>Icon</svg>
    <span>Title</span>
    <svg class="chevron">Down Arrow</svg>
  </div>
  <div class="widget-content">
    Content here
  </div>
</div>
```

### Completion Widget
```html
<div class="widget-card completion-widget">
  <div class="completion-header">
    <span>Completion</span>
    <span>85%</span>
  </div>
  <div class="completion-bar-container">
    <div class="completion-bar" style="width: 85%"></div>
  </div>
  <div class="completion-details">
    <span>8 out of 10 required fields filled</span>
  </div>
</div>
```

## JavaScript API

### Initialize Widgets
```javascript
initCollapsibleWidgets()
```

### Update Job Info
```javascript
updateJobInfoCard()
// Extracts: hostname, page title
// Updates: company name, job title, status
```

### Update Resume Display
```javascript
updateResumeFileDisplay()
// Shows: filename, file size
```

### Update Completion
```javascript
updateCompletionWidget(filled, total, percentage)
// Updates: percentage, progress bar, text
```

## Event Handlers

### Resume Info Click
Opens dashboard modal to "Edit Information" tab

### Upload Resume Click
Toggles expand/collapse of resume file info

### Change Resume Click
Opens dashboard modal to "Update JSON" tab

### Autofill Button Click
Triggers form autofill on current page

## Responsive Breakpoints

- Sidepanel fixed width: 400px
- Cards: Full width with 20px container padding
- Grid layouts: Single column
- Typography: Scales from 0.7rem to 1.3rem

## Icon Library

Using inline SVG with 16-24px sizes:
- User icon (person)
- Document icon (file)
- Settings icon (gear)
- Upload icon (arrow up)
- Plus icon (circle)
- Check icon (checkmark)
- Alert icon (triangle)
- Info icon (i in circle)
- Chevron icon (arrow down)
- Layers icon (stacked)

## States

### Widget States
- `.hidden` - Display none
- `.expanded` - Show content, rotate chevron
- `.disabled` - Gray out, no pointer

### Progress States
- Idle: Hidden completion widget
- Active: Show progress bar, update stats
- Complete: Show 100%, success message
- Failed: Show errors, retry option

## Accessibility

- All interactive elements focusable
- Keyboard navigation (Tab, Enter, Space)
- ARIA labels on icon-only buttons
- Color contrast 4.5:1 minimum
- Focus visible on all controls

## Browser Support

- Chrome 90+
- Edge 90+
- Manifest V3 compatible
- No polyfills required
