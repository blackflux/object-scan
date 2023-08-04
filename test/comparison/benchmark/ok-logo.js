import path from 'path';
import fs from 'smart-fs';

const imageUri = path.join(fs.dirname(import.meta.url), 'ok-logo.png');
const data = fs.readFileSync(imageUri, 'base64');
export default `data:image/png;base64,${data}`;
