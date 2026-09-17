import type { Metadata } from 'next';
import { LearningProvider } from '@/components/learning-store';
import { PlanProvider } from '@/components/plan-store';
import {
  PersistenceBanner,
  PersistenceProvider,
} from '@/components/persistence-store';
import { ResourceProvider } from '@/components/resource-store';
import { SiteHeader } from '@/components/site-header';
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

const title = 'how to learn AI · 个人学习知识库';
const description =
  '从直觉、原理、代码到练习，系统学习人工智能、机器学习、深度学习与强化学习。';

/**
 * Share metadata is resolved per request: `SITE_ORIGIN` wins when it is set at
 * build time, otherwise the origin the request arrived on is used. That way a
 * deployment to a new Workers domain never advertises the previous host.
 */
export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = await resolveMetadataBase();
  return {
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
          alt: 'how to learn AI 个人学习知识库',
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
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeBootScript(THEME_STORAGE_KEY) }}
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
                <footer className="site-footer">
                  <p className="site-footer__statement">
                    理解一个概念，再独立解决一个问题。
                  </p>
                  <div className="site-footer__meta">
                    <span>how to learn AI</span>
                    <span>学习数据仅保存在当前浏览器</span>
                  </div>
                </footer>
                <PersistenceBanner />
              </PlanProvider>
            </ResourceProvider>
          </LearningProvider>
        </PersistenceProvider>
      </body>
    </html>
  );
}
