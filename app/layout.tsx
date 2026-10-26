import type { Metadata } from 'next';
import { LearningProvider } from '@/components/learning-store';
import { PlanProvider } from '@/components/plan-store';
import {
  PersistenceBanner,
  PersistenceProvider,
} from '@/components/persistence-store';
import { ResourceProvider } from '@/components/resource-store';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { StudyReminderBanner } from '@/components/study-reminder-banner';
import { themeBootScript, THEME_STORAGE_KEY } from '@/lib/theme';
import { resolveMetadataBase } from '@/lib/site-metadata';
import './globals.css';
import './hallmark-design.css';
import './learning-features.css';
import './deeplearning-features.css';
import './ai-features.css';
import './ai-category.css';
import './rl-features.css';
import './rl-matrix.css';
import './plan-features.css';
import './resource-features.css';
import './light-theme.css';
import './mindmap.css';
import './ux-controls.css';
import './layerwise-content.css';
import './layerwise-shell.css';
import './layerwise-home.css';
import './layerwise-category.css';
import './layerwise-workspace.css';

const title = 'Layerwise — Learn AI, one layer at a time';
const description =
  'Understand artificial intelligence, machine learning, deep learning and reinforcement learning through ideas, code and practice.';

/**
 * Share metadata is resolved per request: `SITE_ORIGIN` wins when it is set at
 * build time, otherwise the origin the request arrived on is used. That way a
 * deployment to a new Workers domain never advertises the previous host.
 */
export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = await resolveMetadataBase();
  return {
    icons: { icon: '/favicon.svg' },
    ...(metadataBase ? { metadataBase } : {}),
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: '/og.png',
          width: 1200,
          height: 630,
          alt: 'Layerwise — Learn AI, one layer at a time',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og.png'],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeBootScript(THEME_STORAGE_KEY),
          }}
        />
      </head>
      <body>
        <PersistenceProvider>
          <LearningProvider>
            <ResourceProvider>
              <PlanProvider>
                <SiteHeader />
                {children}
                <StudyReminderBanner />
                <SiteFooter />
                <PersistenceBanner />
              </PlanProvider>
            </ResourceProvider>
          </LearningProvider>
        </PersistenceProvider>
      </body>
    </html>
  );
}
