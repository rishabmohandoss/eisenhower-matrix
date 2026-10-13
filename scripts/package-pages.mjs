import {cpSync,mkdirSync,rmSync} from 'node:fs';
rmSync('docs',{recursive:true,force:true});
mkdirSync('docs',{recursive:true});
cpSync('dist','docs',{recursive:true});
cpSync('handoff.md','docs/handoff.md');
