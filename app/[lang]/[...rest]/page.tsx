import { notFound } from 'next/navigation';

// Sends unmatched paths under a locale (e.g. /vi/abc) to app/[lang]/not-found.tsx,
// which has the locale, instead of the root not-found page.
export default function CatchAllPage() {
    notFound();
}
