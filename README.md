# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Backend Health Indicator

A backend health indicator has been added to the sidebar header (above the block search). It polls the endpoint `/api/health` every 20 seconds and displays:

- A colored dot (green = up, yellow = degraded/slow, red = down/unreachable)
- Text label (Healthy / Slow / Unreachable)
- Latest latency in milliseconds

Hovering over (or focusing) the indicator shows a tooltip with the last checked time and any error message. Clicking the indicator forces an immediate refresh.

### Configuration

Set `VITE_API_BASE` in your environment (e.g. `.env`) if the backend is hosted on a different origin:

```
VITE_API_BASE=https://your-backend.example.com
```

If `VITE_API_BASE` is not provided, the frontend will use a relative path (same origin) for `/api/health`.

### Status Logic

- `up`: HTTP 200 and latency <= 1500ms
- `degraded`: HTTP 200 but latency > 1500ms
- `down`: Non-OK response, network error, timeout (after 5s), or aborted fetch

A timeout is enforced at 5000ms to prevent hanging requests.

### Extending

You can adjust polling interval in `use-health-status.ts` by passing a custom interval to `useHealthStatus(intervalMs)` or editing `DEFAULT_INTERVAL`.

### Accessibility

The indicator uses `aria-live="polite"` so screen readers will be notified of status changes without interruption.
