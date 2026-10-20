# Mudlet Map Browser Script

**English** | [한국어](README_ko.md)

A browser-based frontend for exploring [Mudlet](https://www.mudlet.org/) maps. Built on [`mudlet-map-renderer`](https://www.npmjs.com/package/mudlet-map-renderer), it provides area navigation, room search, pathfinding, image export, and multiple visual styles.

The live deployment is available at **https://delwing.github.io/arkadia-mapa/**.

## Features

- **Area and level navigation** — browse a name-sorted area list and switch between z-levels. Areas with more than ten levels use a dropdown.
- **Room details** — click a room to inspect its ID, name, environment, coordinates, hash, regular and special exits (including links to other areas), custom Mudlet data, and NPCs.
- **Search** — find rooms by one or more comma-separated room IDs or by NPC name with autocomplete. Results are centered and highlighted.
- **Pathfinding** — find shortest paths between rooms with Dijkstra's algorithm. Display multiple paths, change each path's color, or remove paths individually.
- **Image export** — download the current area as **PNG** or **SVG**, or copy a PNG to the clipboard.
- **Rendering modes** — switch among `normal`, `pencil`, `parchment`, `parchment-pencil`, `isometric` (with adjustable rotation), `isometric-parchment`, `blueprint`, `neon`, and `gradient`.
- **Custom settings** — configure background and line colors, room size and shape, line width, label rendering, area names, and area-exit labels. Settings are stored in `localStorage` and migrated across versions.
- **Minimap preview** — view the current area as a low-resolution overlay with a viewport that updates as you zoom and pan.
- **Keyboard shortcuts** — `F1` for help, `Ctrl+F` for search, `Ctrl+S` to save an image, `+`/`-` to zoom, and the numeric keypad (`1`–`9`, `*`, `/`) to follow exits from the selected room.
- **Multiple languages** — Korean, Polish, and English are bundled and can be switched in the UI. The selected language is remembered for the next visit.
- **Theme selector** — choose a [Bootswatch](https://bootswatch.com/) theme and dark mode; preferences are stored in `localStorage`.
- **Version selector** — load older map versions published as GitHub release tags and view release notes without leaving the page.
- **Deep links** — open the page with a specific room (`?loc=`), area (`?area=`), or map version (`?version=`).

## Usage

The script is published on npm as a bundled IIFE (`dist/index.min.js`) and stylesheet (`dist/index.min.css`). The simplest option is to load them from a CDN such as [jsDelivr](https://www.jsdelivr.com/package/npm/mudlet-map-browser-script):

```html
<!-- Latest version -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mudlet-map-browser-script/dist/index.min.css" />
<script src="https://cdn.jsdelivr.net/npm/mudlet-map-browser-script/dist/index.min.js"></script>

<!-- Pinned version -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mudlet-map-browser-script@0.9.0/dist/index.min.css" />
<script src="https://cdn.jsdelivr.net/npm/mudlet-map-browser-script@0.9.0/dist/index.min.js"></script>
```

You can also install the package with npm or Yarn:

```bash
npm install mudlet-map-browser-script
# or
yarn add mudlet-map-browser-script
```

### Map data sources

Configure the map source through `window.MAP_CONFIG`. The script checks these sources in order:

| Setting | Source |
| --- | --- |
| `mapUrl` | A Mudlet binary map (`.dat`), decoded in the browser with [`mudlet-map-binary-reader`][reader], or a JSON file containing `{ mapData, colors }` (format detected from the extension). |
| `mapDataUrl` + `colorsUrl` | Two JSON arrays containing renderer-exported data (the legacy `mapExport.js` / `colors.js` data in JSON form). |
| _Legacy globals_ | `mapData` / `colors` defined on `window` before the script runs. **Deprecated**; retained for compatibility. Prefer `mapUrl`. |

[reader]: https://github.com/Delwing/node-mudlet-map-binary-reader

Loading a `.dat` file directly is the simplest option: no separate export step is needed, and the binary file is smaller than generated JavaScript. `mudlet-map-binary-reader` 1.0.1 or newer is bundled in `dist/index.min.js`.

### Required page structure

The script is a standalone **React** application that renders the complete UI. The host page only needs a mount point (an existing `#root` is used, or one is created and appended to `<body>`) and a configured map source:

```html
<link rel="stylesheet" href="index.min.css" />
<div id="root"></div>
<script>
  window.MAP_CONFIG = { mapUrl: "data/map.dat" }; // A .dat map or .json export decoded in the browser
</script>
<script src="index.min.js"></script>
```

All styles (Bootstrap, app CSS, and the flag sprite) are included in `dist/index.min.css`; no other stylesheet is required. Korean, Polish, and English translations are bundled, so no separate `i18n` files are needed. Strings can be overridden and languages added through `MAP_CONFIG`. The only asset the host must provide is a favicon.

#### Host configuration

Configure the app through `window.MAP_CONFIG` before loading the script:

```html
<script>
  window.MAP_CONFIG = {
    // Map data: a .dat file or .json export decoded in the browser. See "Map data sources".
    mapUrl: "data/map.dat",
    // Or use two JSON arrays: mapDataUrl: "data/mapExport.json", colorsUrl: "data/colors.json",

    // Optional features; omitted options stay disabled.
    npcUrl: "...",           // Enables NPC search; without it, only room ID search is available.
    versionsTagsUrl: "...",  // Shows a version selector in the help modal.
    versionsFilesUrl: "...", // Fetches a selected map version; %tag% is replaced.

    // Branding; no defaults are bundled.
    title: { pl: "Mapa Arkadii", en: "Arkadia Map", ko: "아르카디아 지도" },
    logo: "images/logo.png", // Image URL/path; omit to hide the logo.
    credits: {               // Information at the bottom of the help modal; omit to hide it.
      author: "Dargoth",
      githubUrl: "https://github.com/Delwing/mudlet-map-reader",
      remark: { pl: "...", en: "...", ko: "..." }, // String or language map; inline HTML is supported.
    },

    // Override bundled translations or add languages.
    translations: { en: { search: "Find" }, de: { search: "Suchen", settings: "Einstellungen" } },
    languages: [{ code: "ko", flag: "kr" }, { code: "pl" }, { code: "en", flag: "gb" }, { code: "de" }],
  };
</script>
<script src="index.min.js"></script>
```

`title`, `logo`, and `credits` have **no defaults**. The bundle is not tied to a particular brand; omitting these options hides them (the header uses the bundled `title` string). Korean, Polish, and English strings are available without additional configuration. Use `translations` to override strings or add a language, and `languages` to configure the language picker. See `demo/index.html` for a complete example.

The app first uses a previously saved language choice. If none exists, it uses a supported language from the host page's `<html lang="...">`; otherwise it uses the first language in the configured list. The default list starts with Korean. If you provide `languages`, it replaces that list, so include `{ code: "ko", flag: "kr" }` if you want Korean available.

### URL parameters

| Parameter | Behavior |
| --- | --- |
| `?loc=ID` | Center and select room `ID`. |
| `?area=ID` | Open area `ID`. |
| `?version=TAG` | Load the map version published with release `TAG`. |

## Development

```bash
yarn install     # Install dependencies
yarn dev         # Run the demo (Vite development server)
yarn build       # Create dist/index.min.js and its source map
yarn typecheck   # Run the TypeScript compiler with --noEmit
```

`yarn dev` serves the demo from the `demo/` directory (the Vite root). `demo/index.html` is a minimal host page containing the `#root` mount point, a `MAP_CONFIG.mapUrl` pointing at a Mudlet `.dat` file, and the app. It decodes the real Arkadia `.dat` file in the browser and loads the favicon from the live deployment, so development uses production-like data without extra setup. The demo also shows how a host page loads the bundle; production uses `<script src="index.min.js">` instead of development modules.

This project is written in TypeScript and React and bundled as a single minified IIFE with [Vite](https://vite.dev/) (see `vite.config.ts`). React is included in the bundle, so the host page does not need to load it separately. Main source modules:

- `src/main.tsx` — bundle entry point; mounts the React app into `#root`.
- `src/MapApp.tsx` — top-level component; initializes the controller and lays out the UI.
- `src/map/MapController.ts` — framework-independent wrapper around `mudlet-map-renderer`; handles areas, rooms, paths, settings, rendering modes, image export, and state updates for React.
- `src/components/` — UI for the header, toolbar, modals, information boxes, minimap, paths, zoom, and toasts.
- `src/i18n/` — translation provider with bundled Korean, Polish, and English dictionaries, all of which can be overridden through configuration.
- `src/preview.ts` — minimap preview overlay controlled imperatively by the controller.
- `src/data/npc.ts` — NPC data loading; `src/versions.ts` — GitHub release tags and map version handling.

Bootstrap modals, dropdowns, and toasts use the `data-bs-*` data API (Bootstrap JS is imported in `src/main.tsx` for its side effects).

## Deployment

This repository's GitHub Pages deployment uses `demo/public/index.html` and loads
the Jura map from `demo/public/jura/jura2-map.json`. The map JSON is copied into
`dist/jura/` during the build. The local demo configuration is separate.

Pushing a `*.*.*` tag runs the [`Publish to npm`](.github/workflows/publish.yml) GitHub Action, which builds the bundle and runs `npm publish --provenance --access public`. The published package contains only the `dist/` folder.

## License

MIT
