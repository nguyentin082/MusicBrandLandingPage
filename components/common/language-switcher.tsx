'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function LanguageSwitcher() {
  const pathname = usePathname();

  const getLocalizedPath = (locale: string) => {
    const segments = pathname.split('/');
    if (segments[1] === 'en' || segments[1] === 'vi') {
      segments[1] = locale;
    } else {
      segments.splice(1, 0, locale);
    }
    return segments.join('/');
  };

  const currentLang = pathname.split('/')[1] === 'vi' ? 'vi' : 'en';

  return (
    <div className="flex gap-3">
      <Link
        href={getLocalizedPath('en')}
        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
          currentLang === 'en'
            ? 'bg-brick-red text-off-white'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        EN
      </Link>
      <Link
        href={getLocalizedPath('vi')}
        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
          currentLang === 'vi'
            ? 'bg-brick-red text-off-white'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        VI
      </Link>
    </div>
  );
}
