import assert from 'assert';
import axios from 'axios';
import { Pool } from 'promise-pool-ext';

const pool = Pool({ concurrency: 10 });

export default async (urls, content) => {
  const tasks = urls.map((url) => () => axios({ method: 'HEAD', url }));
  const responses = await pool(tasks);
  for (let i = 0; i < responses.length; i += 1) {
    const r = responses[i];
    assert(r.status === 200, `${urls[i]}: ${r.status}`);
  }
};
