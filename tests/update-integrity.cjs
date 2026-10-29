// Rebuild the local release manifest after changing runtime files: node tests/update-integrity.cjs
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.join(__dirname,'..'),names=['index.html','diagnostics.js','upper.png','lower.png','bunk-detail.jpg','passenger-detail.jpg','shuttle-detail.jpg','wreck-detail.jpg','serenity.png'];
const files=names.map(name=>{let b=fs.readFileSync(path.join(root,name));return {path:name,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')}});
fs.writeFileSync(path.join(root,'integrity.json'),JSON.stringify({version:1,algorithm:'SHA-256',files},null,2)+'\n');
console.log('Updated integrity.json for '+files.length+' runtime files.');
