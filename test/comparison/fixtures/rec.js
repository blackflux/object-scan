import cloneDeep from 'lodash.clonedeep';
import nested from './nested.js';

const r = cloneDeep(nested);
// add recursive reference
r.a.b.c = r;
export default r;
