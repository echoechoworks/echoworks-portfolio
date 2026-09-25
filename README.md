# Valdemar Løv — local portfolio mockup

Run with Node.js 24 or newer:

```sh
node src/server.ts
```

Open http://localhost:3000. The project gallery is at /projects.
With npm installed, `npm run dev` starts the server in watch mode.

The server and browser interactions are written in TypeScript. Node strips the types when serving the browser script; no package installation is required.

The supplied HTML designs are preserved in public. Styling uses the draft's Tailwind CDN, Google Fonts, and remote images, so an internet connection is required. Original draft folders are unchanged.

The carousel, gallery filters, grid/list view, navigation, and project preview dialogs work. Showreel and detailed case content are placeholders. About and contact copy is draft content to confirm before publishing.
