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
import Express from "express";
import { json, urlencoded } from "body-parser";
import cors from "cors";
import { _eventHandler } from "./api";
// eslint-disable-next-line no-unused-vars
import { TwitterBotManager, TwitterBot } from "./bot";
import Config from './util/config';

/**
 * @typedef {import('./bot/bot').default} TwitterBot
 * @typedef {import('express').Express} Express
 */

/**
 *
 * @param {{
 * 			port: number,
 * 			url: string,
 * 			accountInfo?: {name: string, consumer_key: string, consumer_secret: string, token: string, token_secret: string, eventActions?: import('./bot/bot').eventActionsParam, jobs?: import('./bot/bot').jobsParam } | TwitterBot,
 * 			bot?: TwitterBot
 *          botManager?: TwitterBotManager,
 * 			server?: Express.Application
 * 			}} opts
 */
const App = (opts) => {
   let app;
   let appURL;
   let port;
   let manager = undefined;

   if (opts.botManager !== undefined) {
      manager = opts.botManager;
   } else {
      if (opts.accountInfo === undefined) {
         console.log(opts);
         throw new Error(
            "You must pass either a manager or your default Twitter dev account info"
         );
      }

      let account;
      let name;

      if (opts.accountInfo !== undefined && opts.accountInfo instanceof TwitterBot) {
         name = opts.accountInfo.name;
         account = opts.accountInfo;
      } else if (opts.bot !== undefined) {
         name = opts.bot.name;
         account = opts.bot;
      } else {
         name = opts.accountInfo.name;
         account = new TwitterBot({
            name: opts.accountInfo.name,
            consumer_key: opts.accountInfo.consumer_key,
            consumer_secret: opts.accountInfo.consumer_secret,
            token: opts.accountInfo.token,
            token_secret: opts.accountInfo.token_secret,
            eventActions: opts.accountInfo.eventActions,
            jobs: opts.accountInfo.jobs,
         });
      }

      manager = new TwitterBotManager({ [`${name}`]: account });
   }

   if (opts.server === undefined) {
      app = new Express();
   } else {
      app = opts.server;
   }

   if (opts.port === undefined) {
      throw new Error(
         "You must pass the port your server will be listening on"
      );
   } else {
      port = opts.port;
   }

   if (opts.url === undefined || opts.url === "") {
      throw new Error(
         "You must pass a valid URL you own for your bot to function"
      );
   } else {
      appURL = opts.url;
   }

   app.use(cors());
   app.use(json());
   app.use(urlencoded({ extended: true }));

   const twitters = manager.getBots();

   for (const twit in twitters) {
      app.use(Config.TWITTER_WEBHOOK_ENDPOINT + "/" + twit, (req, res) => {
         _eventHandler(req, res, twitters[twit]);
      });
   }

   app.listen(port, async () => {
      console.log("Server listening at: " + appURL + "\n");

      try {
         for (const twit in twitters) {
            await twitters[twit].initWebhook(
               appURL,
               Config.TWITTER_WEBHOOK_ENDPOINT + "/" + twit
            );
            await twitters[twit].initSubscription();
            twitters[twit].startAllJobs();
         }
      } catch (err) {
         console.log(err);
         process.exit(1);
      }
   });
};

/**
 *
 * @param {{account?: {name: string, consumer_key: string, consumer_secret: string, token: string, token_secret: string, eventActions?: import('./bot/bot').eventActionsParam, jobs?: import('./bot/bot').jobsParam } | TwitterBot,
 * 			bot?: TwitterBot,
 *          botManager?: TwitterBotManager,
 *          port?: number,
 * 			url?: string,
 * 			server?: Express
 * 			}} opts
 * @param opts.port Optional - The port your server will be running on, defaults to 3000 in dev environments and the environment variable 'PORT' if in a production environment
 * @param opts.account - (Ignored if a botManager is passed in) The Twitter developer account app keys, and a function that defines the bot's behavior based on the event passed to it. This function will also be passed the bot account's oauth key for
 * use in any desired Twitter API calls
 * @param opts.botManager Optional - A manager holding one or more Twitter accounts
 * @param opts.url Optional (Required for a production/deployed server) - A valid URL for your bots to receive events at
 * @param opts.server Optional - A pre-configured Express server
 * @returns {void | Error}
 */
export default (opts) => {
   let _opts = {};

   if (opts === undefined) {
      throw new Error("You must pass an object of required parameters");
   }

   if (opts.port === undefined) {
      if (process.env.NODE_ENV === "production") {
         if (process.env.PORT === undefined) {
            throw new Error(
               "You must pass the port your server will be listening on"
            );
         }
      } else {
         _opts["port"] = 3000;
      }
   } else {
      _opts["port"] = opts.port;
   }

   if (opts.botManager === undefined && opts.account === undefined && opts.bot === undefined) {
      return new Error(
         "You must pass your Twitter app keys or a TwitterBot"
      );
   } else {
      _opts["accountInfo"] = opts.account;
      _opts["bot"] = opts.bot;
   }
   _opts["botManager"] = opts.botManager;

   if (process.env.NODE_ENV === "production") {
      if (opts.url === undefined || opts.url === "") {
         throw new Error(
            "You must pass a valid URL you own for your bot to function"
         );
      } else {
         _opts["url"] = opts.url;
      }

      App(_opts);
   } else {
      const ngrok = require("ngrok");

      (async () => {
         console.log("Dev environment detected. Starting ngrok...");
         const url = await ngrok.connect(_opts["port"]);
         _opts["url"] = url;
         App(_opts);
      })();
   }
};
