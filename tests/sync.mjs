import {chromium,webkit,devices,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
const config=JSON.parse(readFileSync(new URL('../firebase-config.json',import.meta.url)));
const url=process.env.APP_URL||'http://127.0.0.1:5179/';
const email=`clarity-test-${Date.now()}@example.test`,password=randomUUID()+'Aa1!';
const users=[],browsers=[];let taskId;
async function authAPI(method,data){const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${config.apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const j=await r.json();if(!r.ok)throw Error(`${method}: ${j.error?.message}`);return j}
async function login(page){await page.goto(url);await page.getByRole('button',{name:'Sign in to sync',exact:true}).click();await page.locator('[name=email]').fill(email);await page.locator('[name=password]').fill(password);await page.locator('#auth-form button[type=submit]').click();await expect(page.locator('dialog')).toHaveCount(0);await expect(page.locator('#sync-text')).toHaveText('All changes saved',{timeout:30000})}
try{
 const a=await authAPI('signUp',{email,password,returnSecureToken:true});users.push(a);
 const b=await authAPI('signUp',{email:`other-${email}`,password,returnSecureToken:true});users.push(b);
 const desktop=await chromium.launch({headless:true});browsers.push(desktop);const mobile=await webkit.launch({headless:true});browsers.push(mobile);
 const ca=await desktop.newContext(),cb=await mobile.newContext({...devices['iPhone 13']});const pa=await ca.newPage(),pb=await cb.newPage();await login(pa);await login(pb);
 await pa.getByRole('button',{name:'Add task',exact:true}).click();await pa.locator('[name=title]').fill('Cross-device verification');await pa.getByRole('button',{name:'Add task',exact:true}).last().click();await expect(pb.getByRole('button',{name:'Edit Cross-device verification',exact:true})).toBeVisible({timeout:30000});taskId=await pa.locator('.task').getAttribute('data-id');
 await cb.setOffline(true);await pb.getByRole('button',{name:'Edit Cross-device verification',exact:true}).click();await pb.locator('[name=title]').fill('Offline edit synced');await pb.getByRole('button',{name:'Save changes'}).click();await expect(pb.getByRole('button',{name:'Edit Offline edit synced',exact:true})).toBeVisible();await cb.setOffline(false);await expect(pa.getByRole('button',{name:'Edit Offline edit synced',exact:true})).toBeVisible({timeout:30000});
 const path=`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/users/${a.localId}/tasks/${taskId}`;
 for(const [label,token,status] of [['owner',a.idToken,200],['other account',b.idToken,403],['signed out',null,403]]){const r=await fetch(path,{headers:token?{Authorization:`Bearer ${token}`}:{}});if(r.status!==status)throw Error(`${label}: expected ${status}, received ${r.status}`);console.log(`${label} access check passed`)}
 console.log('Desktop ↔ iPhone cloud sync, offline reconciliation, and account isolation passed.');
}finally{
 for(const b of browsers)await b.close();
 if(taskId&&users[0])await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/users/${users[0].localId}/tasks/${taskId}`,{method:'DELETE',headers:{Authorization:`Bearer ${users[0].idToken}`}});
 for(const u of users)await authAPI('delete',{idToken:u.idToken});
}
