import {pathToFileURL} from 'node:url';
import {homedir} from 'node:os';
const {chromium}=await import(pathToFileURL(homedir()+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{await page.goto((process.argv[2]??'http://localhost:8793')+'/concept/numerical-standardization',{waitUntil:'networkidle',timeout:90000});await page.screenshot({path:'outputs/mdx-migration/sample-'+(process.argv[2]?'production':'dev')+'.png'});console.log(await page.evaluate(()=>({h1:document.querySelector('h1')?.textContent,math:document.querySelectorAll('.katex').length,code:document.querySelectorAll('.code-example-stack').length,sections:document.querySelectorAll('.important-section').length,text:document.body.innerText.slice(-600)})));console.log({errors});}finally{await browser.close()}

