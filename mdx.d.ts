declare module '*.mdx' {
  import type { ComponentType } from 'react';
  import type { MDXComponents } from 'mdx/types';
  const Article: ComponentType<{ components?: MDXComponents }>;
  export default Article;
}
