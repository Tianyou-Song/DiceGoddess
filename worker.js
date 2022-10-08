import { expose } from "threads/worker";

import { rollAll } from './roll.js';

expose({
    async roll(params) {
        return rollAll(params);
    }
});