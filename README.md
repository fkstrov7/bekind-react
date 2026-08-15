# BeKind Streetwear — React + Framer Motion

React rebuild of the static site, using [Vite](https://vitejs.dev) as the build
tool and [Framer Motion](https://www.framer.com/motion/) for animation:
scroll-reveal on sections, a staggered hero entrance, and animated transitions
between the `/` and `/drops` routes.

## Project structure

```
bekind-react/
├── index.html              ← Vite entry point
├── package.json
├── vite.config.js
├── public/                 ← static assets served as-is (add logo, favicon, etc)
└── src/
    ├── main.jsx             ← React root + router setup
    ├── App.jsx               ← route table + AnimatePresence page transitions
    ├── index.css              ← all global styles (ported from the static site)
    ├── data/
    │   └── drops.js            ← product data — edit this, both the Home
    │                              teaser and the /drops page read from it
    └── components/
        ├── Header.jsx, Footer.jsx
        ├── Home.jsx               ← hero + manifesto + sonidos + movement
        ├── DropsPreview.jsx       ← 2-item teaser grid on Home
        ├── DropsPage.jsx          ← full grid at /drops
        ├── DropCard.jsx           ← shared animated product card
        ├── ConnectSection.jsx     ← subscribe form
        ├── Reveal.jsx             ← scroll-in-view wrapper (replaces old JS)
        ├── GrainOverlay.jsx, RoughEdgeFilter.jsx  ← texture effects
        └── DropIcons.jsx          ← inline SVG product icons
```

## 1. Install and run

You'll need [Node.js](https://nodejs.org) (LTS version) installed. Then, in
the project folder:

```bash
npm install
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`) — open it in
your browser. Every file save hot-reloads instantly, including CSS.

## 2. Where the Framer Motion pieces live

- **Page transitions** — `App.jsx`. `AnimatePresence` + `motion.div` variants
  fade/slide the outgoing page out and the incoming page in whenever the
  route changes (try clicking "Ver los drops" from the homepage).
- **Scroll reveals** — `components/Reveal.jsx`. Wrap any section content in
  `<Reveal>...</Reveal>` and it fades/slides in the first time it scrolls
  into view. This replaced the old `IntersectionObserver` vanilla JS.
- **Hero entrance** — `Home.jsx`. Uses a staggered parent/child variant so
  the eyebrow, wordmark, tagline, and buttons animate in one after another.
- **Drop cards** — `DropCard.jsx`. Each card animates in on scroll and
  straightens out (`whileHover`) when you hover it.
- **Form feedback** — `ConnectSection.jsx`. The subscribe button's label
  swaps with a small `AnimatePresence` transition when submitted.

To go further with Framer Motion: `layoutId` gives you shared-element
transitions (e.g. a product image that "flies" from a grid into a detail
view), and `useScroll` / `useTransform` let you tie animations to scroll
position for parallax-style effects.

## 3. Build for production

```bash
npm run build
```

Outputs static files to `dist/`. Deploy that folder exactly like the static
site (Netlify drag-and-drop, Vercel, GitHub Pages, etc.) — see the previous
`bekind-site` project's README for the deployment and domain walkthrough.
One difference: since this is a client-side router (React Router), your host
needs a rewrite rule sending all paths to `index.html` so `/drops` doesn't
404 on a hard refresh. Netlify and Vercel do this automatically for Vite
projects; GitHub Pages needs a small workaround (a `404.html` that redirects
to `index.html`) if you go that route.

## 4. Move off the hotlinked logo

Same note as before — the logo in `Header.jsx` currently points at your
WordPress.com media URL. Download it into `public/`, then change the
`src="..."` to `/logo.png`.
