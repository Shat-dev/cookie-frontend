# Translation System Documentation

## Overview

This application includes a comprehensive translation system supporting English and Chinese languages.

## Architecture

### 1. Translation Store (`src/i18n/translations.ts`)

- Contains all text content organized by page/component
- Supports English (`en`) and Chinese (`zh`) languages
- Strongly typed with TypeScript interfaces

### 2. Language Context (`src/context/LanguageContext.tsx`)

- Global state management for current language
- Persists language preference in localStorage
- Provides `useLanguage()` hook for components

### 3. Language Provider (`app/layout.tsx`)

- Wraps the entire application
- Ensures language context is available everywhere
- Handles hydration properly to prevent SSR mismatches

### 4. Language Toggle (`components/Header.tsx`)

- Toggle button in both desktop and mobile navigation
- Shows "EN" when Chinese is active, "中文" when English is active
- Accessible with proper ARIA labels

## Usage

### In Components

```tsx
import { useLanguage } from "@/context/LanguageContext";

function MyComponent() {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <div>
      <h1>{t.common.title}</h1>
      <button onClick={toggleLanguage}>
        {language === "en" ? t.language.chinese : t.language.english}
      </button>
    </div>
  );
}
```

### Adding New Translations

1. Add the new text keys to the `Translations` interface in `translations.ts`
2. Add the English and Chinese translations to both language objects
3. Use the new translation keys in your components with `t.section.key`

## Features

- **Persistence**: Language preference is saved in localStorage
- **SSR Safe**: Prevents hydration mismatches
- **Type Safe**: Full TypeScript support with autocomplete
- **Responsive**: Works on both desktop and mobile
- **Accessible**: Proper ARIA labels and semantic HTML
- **Font Support**: Includes Noto Sans SC for better Chinese character rendering

## Supported Pages

Currently translated pages:

- Home page (`/`)
- FAQ page (`/faq`)
- How It Works page (`/how-it-works`) - partially
- Current Pool page (`/current-pool`)
- Header navigation
- Footer content

## Language Codes

- `en`: English
- `zh`: Chinese (Simplified)

## Font Support

The system includes Google Fonts integration:

- **Fira Code**: Primary monospace font for English
- **Noto Sans SC**: Fallback font for Chinese characters

Both fonts are loaded via CSS imports in `globals.css`.
