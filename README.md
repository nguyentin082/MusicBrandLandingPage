# WAV Vietnam

WAV Vietnam is a modern landing page for a music studio, built with Next.js and designed to showcase services, portfolio work, pricing, and contact information.

## Key Features

- Modern landing page experience optimized for both desktop and mobile.
- Bilingual support for `en` and `vi` using `next-intl`.
- Automatic locale detection based on language and visitor country.
- Light/dark theme switching and language selection in the header.
- Dedicated sections for studio overview, services, projects, equipment, team, pricing, and FAQ.

## Tech Stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- next-intl
- Radix UI
- Framer Motion

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Start the production server

```bash
npm run start
```

## Project Structure

- `app/`: routing, layouts, and locale-based pages.
- `components/`: shared components and landing page sections.
- `messages/`: localized content.
- `i18n/`: `next-intl` configuration.
- `public/`: static assets.

## Notes

- The root route automatically redirects to `/en` or `/vi` based on the detected locale.
- Most visible content is managed in `messages/en.json` and `messages/vi.json`.
