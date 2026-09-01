import type { Metadata } from 'next';
import { LearningProvider } from '@/components/learning-store';
import { PlanProvider } from '@/components/plan-store';
import { ResourceProvider } from '@/components/resource-store';
import { SiteHeader } from '@/components/site-header';
import { StudyReminderBanner } from '@/components/study-reminder-banner';
import { THEME_STORAGE_KEY } from '@/lib/theme';
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
export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var saved=localStorage.getItem('${THEME_STORAGE_KEY}');var theme=saved==='light'||saved==='dark'?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;document.documentElement.classList.toggle('dark',theme==='dark')}catch(e){document.documentElement.dataset.theme='light'}})()`,
          }}
        />
      </head>
      <body>
        <LearningProvider>
          <ResourceProvider>
            <PlanProvider>
              <SiteHeader />
              <StudyReminderBanner />
              {children}
              <footer className="site-footer">
                <p className="site-footer__statement">
                  理解一个概念，再独立解决一个问题。
                </p>
                <div className="site-footer__meta">
                  <span>how to learn AI</span>
                  <span>学习数据仅保存在当前浏览器</span>
                </div>
              </footer>
            </PlanProvider>
          </ResourceProvider>
        </LearningProvider>
      </body>
    </html>
  );
}
