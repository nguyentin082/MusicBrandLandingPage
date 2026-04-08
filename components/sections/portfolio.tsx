import { getTranslations } from 'next-intl/server';
import { PortfolioShowcase } from '@/components/sections/portfolio-showcase';
import { PortfolioProject, PortfolioProjectWithCover } from '@/components/sections/portfolio.types';

export async function PortfolioSection() {
    const t = await getTranslations('portfolio');

    const projects = t.raw('projects') as PortfolioProject[];

    const projectImages = [
        '/image/cam-on-em-vi-da-khong-tu-bo.jpg',
        '/image/tet-la-nha-project.jpg',
        '/image/hinh-nhu-project.jpg',
    ];

    const projectsWithCover: PortfolioProjectWithCover[] = projects.map((project, idx) => ({
        ...project,
        coverImage: projectImages[idx] ?? projectImages[0],
    }));

    return (
        <section id="portfolio" className="py-32 px-6 bg-off-white dark:bg-dark-umber">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-extrabold text-dark-umber dark:text-off-white tracking-tighter mb-16 italic text-center">
                    {t('heading')}
                </h2>
                <PortfolioShowcase projects={projectsWithCover} />
            </div>
        </section>
    );
}
