import assert from 'assert';
import axios from 'axios';
import { Pool } from 'promise-pool-ext';

const pool = Pool({ concurrency: 10 });

export default async (urls_, content) => {
  const urls = urls_
    .filter((url) => (
      !url.startsWith('https://www.npmjs.com/package/')
      && !url.startsWith('https://en.wikipedia.org/wiki/')
      && !url.startsWith('https://img.shields.io/badge/')
      && !url.startsWith('https://stackoverflow.com/search?q=')
    ));
  const tasks = urls
    .map((url) => () => axios({
      method: 'GET',
      url,
      validateStatus: () => true
    }));
  const responses = await pool(tasks);
  for (let i = 0; i < responses.length; i += 1) {
    const r = responses[i];
    assert(r.status === 200, `${urls[i]}: ${r.status}`);
  }
};
