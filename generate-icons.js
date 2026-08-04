const fs = require('fs');

async function download() {
  console.log('Fetching 192x192 icon...');
  const res192 = await fetch('http://localhost:3000/api/icon/192');
  if (!res192.ok) throw new Error('Failed to fetch 192 icon');
  const buffer192 = await res192.arrayBuffer();
  fs.writeFileSync('public/icon-192.png', Buffer.from(buffer192));
  console.log('Saved public/icon-192.png');
  
  console.log('Fetching 512x512 icon...');
  const res512 = await fetch('http://localhost:3000/api/icon/512');
  if (!res512.ok) throw new Error('Failed to fetch 512 icon');
  const buffer512 = await res512.arrayBuffer();
  fs.writeFileSync('public/icon-512.png', Buffer.from(buffer512));
  console.log('Saved public/icon-512.png');
}

download().catch(console.error);
