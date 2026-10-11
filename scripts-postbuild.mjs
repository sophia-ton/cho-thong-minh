// Đưa <title> lên đầu tệp (Artifact chỉ quét 8KB đầu để lấy tiêu đề)
import fs from 'fs';
const f = 'dist/index.html';
let s = fs.readFileSync(f, 'utf8');
const m = s.match(/<title>.*?<\/title>/);
if (m) { s = s.replace(m[0], ''); s = m[0] + '\n' + s; }
fs.writeFileSync(f, s);
