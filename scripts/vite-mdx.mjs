import { compileArticle } from './mdx-pipeline.mjs';
import { generateContent } from './generate-content.mjs';
/** Official MDX -> ESM before vinext's RSC/React transforms; no Next MDX plugin. */
export function layerwiseMdx() {
 let queue=Promise.resolve();
 return {
  // vinext beta.10 recognizes `mdx` as a user compiler and then disables its
  // automatic @mdx-js/rollup delegate. Otherwise the ESM gets compiled twice.
  name:'mdx',enforce:'pre',
  async transform(source,id) {if(id.endsWith('.mdx'))return {code:String(await compileArticle(source,id)),map:null};},
  configureServer(server) {
   server.watcher.add('content');
   const update=file=>{
    if(!file.replaceAll('\\','/').includes('/content/')||!file.endsWith('.mdx'))return;
    queue=queue.catch(()=>{}).then(()=>generateContent()).then(()=>server.ws.send({type:'full-reload'})).catch(error=>server.ws.send({type:'error',err:{message:error.message,stack:error.stack}}));
   };
   for(const event of ['add','change','unlink'])server.watcher.on(event,update);
  },
 };
}
