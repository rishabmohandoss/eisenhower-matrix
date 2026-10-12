import {chromium} from '@playwright/test';
import {readFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true});
for(const [name,size] of [['icon-192',192],['icon-512',512],['apple-touch-icon',180]]){const page=await browser.newPage({viewport:{width:size,height:size},deviceScaleFactor:1});await page.setContent(`<style>html,body{margin:0;width:100%;height:100%;overflow:hidden}svg{width:100%;height:100%}</style>${readFileSync('public/icon.svg','utf8')}`);await page.screenshot({path:`public/${name}.png`});await page.close()}
await browser.close();
