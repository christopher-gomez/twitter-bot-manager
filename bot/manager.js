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
import TwitterBot from "./bot";

/**
 * @typedef {import('./bot').default} TwitterBot
 */

//TODO: Siblings (Botnets)

export default class TwitterBotManager {
   /**
    *
    * @param {{[name: string]: import("./bot").params | TwitterBot }} bots - An object literal with at least one account, where the key is whatever name you choose for the account and the value is it's account info or a TwitterBot
    */
   constructor(bots) {
      if (bots === undefined || bots === null || Object.keys(bots).length < 1) {
         throw new Error(
            "You must pass an object with at least one account's info"
         );
      }
      /**
       * @type {{[name: string]: import('./bot').default}}
       */
      this.bots = {};

      for (const account in bots) {
         this.addBot(bots[account]);
      }
   }

   /**
    * @param { import("./bot").params | TwitterBot} opts
    */
   addBot(opts) {
      if (opts instanceof TwitterBot) {
         this.bots[opts.name] = opts;
      } else {
         this.bots[opts.name] = new TwitterBot(opts);
      }
   }

   /**
    * @returns {{[accountName: string]: import('./bot').default}}
    */
   getBots() {
      return this.bots;
   }

   /**
    *
    * @param {string} name
    * @returns {import('./bot').default} The bot with that name or null
    */
   getBot(name) {
      if (name in this.bots) {
         return this.bots[name];
      } else {
         throw new Error(
            "The bot with that name does not exist in this manager"
         );
      }
   }
}
