## Fives Inspection Report (Electron)

Desktop application (Electron + React + TypeScript) for creating and exporting industrial part inspection reports so teams can document checks, flag non-conformities, and verify compliance.

[![Watch the demo](https://vumbnail.com/1142115124.jpg)](https://vimeo.com/1142115124?fl=ip&fe=ec)

### Highlights
- Electron shell ships the React UI as a packaged desktop app.
- Built for industrial inspections: capture findings, mark conformity, and export reports.
- PDF and spreadsheet generation via `pdfkit` and `xlsx`.

### Quick start
```bash
npm install
npm start            # React dev server
npm run electron:dev # open Electron pointing at the dev server
```

### Production build
```bash
npm run electron     # build React, compile Electron, then launch
```

### Scripts reference
- `npm start` – run the React app in dev mode (localhost:3000).
- `npm run electron:dev` – build Electron sources then open the shell against the dev server.
- `npm run electron` – produce the production bundle and launch Electron loading `build/index.html`.
- `npm run electron:build` – compile only the Electron TypeScript files.

