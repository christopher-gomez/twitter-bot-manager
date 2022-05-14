/**
 * MIT License
 *
 * Copyright (c) 2020 Christopher Gomez
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @type {{TWITTER_API_URL: "https://api.twitter.com/1.1", TWITTER_ENV: "dev", TWITTER_WEBHOOK_ENDPOINT: '/twitter/webhooks'}}
 */
export const Config = {
   TWITTER_API_URL: "https://api.twitter.com/1.1",
   TWITTER_ENV: "dev",
   TWITTER_WEBHOOK_ENDPOINT: '/twitter/webhooks',
   /**
    * @param {Array} path - An array of strings that indicate the
    * path of the property in the object to be set. ['property', 'nestedProperty', 'deeplyNested']
    * @param {any} value - The value to be set
    * @param {boolean} setrecursively - If true, creates the property if it does not exist
    */
   setProperty: (path, value, setrecursively=true) => {
      let level = 0;
      path.reduce((a, b) => {
         level++;

         if (
            setrecursively &&
            typeof a[b] === "undefined" &&
            level !== path.length
         ) {
            a[b] = {};
            return a[b];
         }

         if (level === path.length) {
            a[b] = value;
            return value;
         } else {
            return a[b];
         }
      }, Config);
   },
};