'use client';

import { Check, Copy, FileCode2 } from 'lucide-react';
import { Fragment, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const tokenPattern=/(#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:and|as|assert|class|def|elif|else|False|for|from|if|import|in|is|lambda|None|not|or|print|raise|return|True|try|while|with|yield)\b|\b\d+(?:\.\d+)?\b)/g;
function highlight(line:string){return line.split(tokenPattern).filter(Boolean).map((token,index)=>{let className='';if(token.startsWith('#'))className='syntax-comment';else if(token.startsWith('"')||token.startsWith("'"))className='syntax-string';else if(/^\d/.test(token))className='syntax-number';else if(/^[A-Za-z]/.test(token)&&tokenPattern.test(token))className='syntax-keyword';tokenPattern.lastIndex=0;return <span className={className} key={`${index}-${token}`}>{token}</span>})}

export function CodeBlock({language,source,title='完整代码',filename,purpose}:{language:string;source:string;title?:string;filename?:string;purpose?:string}){
  const [copied,setCopied]=useState(false);const lines=useMemo(()=>source.replace(/\s+$/,'').split('\n'),[source]);
  const codeRef=useRef<HTMLPreElement>(null);
  const label=`${title}，共 ${lines.length} 行`;
  async function copy(){try{await navigator.clipboard.writeText(source);setCopied(true);setTimeout(()=>setCopied(false),1800)}catch{setCopied(false)}}
  return <figure className="code-figure">
    <figcaption className="code-caption"><div className="min-w-0"><div className="flex items-center gap-2"><FileCode2 size={15} className="shrink-0 text-primary"/><strong className="truncate text-sm font-medium text-foreground">{title}</strong></div><div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span>{language}</span>{filename&&<><span aria-hidden="true">·</span><code>{filename}</code></>}</div></div><Button variant="ghost" size="sm" onClick={copy} aria-label={`复制 ${title}`} className="shrink-0 text-muted-foreground">{copied?<Check/>:<Copy/>}{copied?'已复制':'复制'}</Button></figcaption>
    {purpose&&<p className="code-purpose"><strong>用途：</strong>{purpose}</p>}
    <div className="code-scroll">
      {/* Keyboard users reach the scrollable code through this real button and
          can then use the arrow keys, instead of a non-interactive tab stop. */}
      <button
        type="button"
        className="sr-only"
        onClick={()=>codeRef.current?.focus()}
      >
        聚焦代码块以用方向键滚动：{label}
      </button>
      <pre
        ref={codeRef}
        className="code-lines"
        tabIndex={-1}
        aria-label={`${label}，可滚动查看`}
      ><code>{lines.map((line,index)=><Fragment key={index}><span className="code-line-number" aria-hidden="true">{index+1}</span><span className="code-line-content">{highlight(line)||' '}</span>{index<lines.length-1&&'\n'}</Fragment>)}</code></pre>
    </div>
    <output className="sr-only" aria-live="polite">{copied?'代码已复制到剪贴板':''}</output>
  </figure>
}
