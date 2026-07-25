# Space Explorer

An interactive, responsive NASA Astronomy Picture of the Day explorer. Choose a date range, retrieve live APOD data, open full image details, and explore video entries.

## Features

- Live date-range requests to NASA's APOD API
- Responsive image gallery with hover zoom
- Accessible image/video detail modal with Escape-to-close
- Loading, error, empty, and success states
- APOD video support
- Random “Did You Know?” fact on each visit
- Optional personal NASA API key saved only in the visitor's browser
- NASA-inspired colors and typography
- Static export and GitHub Pages deployment workflow

## Run locally

1. Install Node.js 22 and pnpm.
2. Run `pnpm install`.
3. Run `pnpm dev`.
4. Open `http://localhost:3000`.

The app starts with NASA's rate-limited `DEMO_KEY`. Open **API Access** in the date panel to enter a free personal key from [api.nasa.gov](https://api.nasa.gov/).

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload all project files and folders, including `.github`.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Push to the `main` branch or run the workflow manually from the **Actions** tab.

GitHub will build and publish the site at:

`https://YOUR-USERNAME.github.io/YOUR-REPOSITORY-NAME/`

## Project structure

- `app/page.tsx` — API request, gallery, modal, video support, and interface logic
- `app/globals.css` — NASA-inspired responsive styling
- `app/layout.tsx` — page metadata and social preview
- `public/og.png` — social sharing preview image
- `.github/workflows/deploy-pages.yml` — automatic GitHub Pages deployment
- `SUBMISSION.md` — prepared reflection and LinkedIn answers

## API note

The browser sends the selected dates directly to NASA's public APOD endpoint. A personal API key is stored in that browser's local storage and is never sent anywhere except `api.nasa.gov`.

This is an educational project and not an official NASA website.
