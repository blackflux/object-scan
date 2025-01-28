import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { MessageChannel } from 'node:worker_threads';

const { port1, port2 } = new MessageChannel();

process.env = new Proxy(process.env, {
  set(target, key, value) {
    // eslint-disable-next-line no-param-reassign
    target[key] = value;
    port2.postMessage(target);
    return target[key];
  },
  deleteProperty(target, key) {
    if (!(key in target)) {
      return true;
    }
    // eslint-disable-next-line no-param-reassign
    delete target[key];
    port2.postMessage(target);
    return true;
  }
});

register('./test/hot.js', {
  parentURL: pathToFileURL('./'),
  data: { port: port1 },
  transferList: [port1]
});
