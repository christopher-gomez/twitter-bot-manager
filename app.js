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
import { eventHandler } from "./api";
// eslint-disable-next-line no-unused-vars
import { TwitterBotManager, TwitterBot } from "./bot";

/**
 * @typedef {import('./bot/bot').default} TwitterBot
 * @typedef {import('express').Express} Express
 */

/**
 *
 * @param {{
 * 			port: number,
 * 			url: string,
 * 			accountInfo: {account_name: string, consumer_key: string, consumer_secret: string, access_token: string, access_token_secret: string, eventActions?: (event, oauth) => any, jobs?: Array<{ interval: string, jobAction: (oauth) => any }> } | TwitterBot,
 * 			botManager?: TwitterBotManager,
 * 			server?: Express
 * 			}} opts
 */
const App = (opts) => {
   let app;
   let appURL;
   let port;
   let manager = undefined;

   if (opts.port === undefined || opts.port === null) {
      throw new Error(
         "You must pass the port your server will be listening on"
      );
   } else {
      port = opts.port;
   }

   if (opts.url === undefined || opts.url === null || opts.url === "") {
      throw new Error(
         "You must pass a valid URL you own for your bot to function"
      );
   } else {
      appURL = opts.url;
   }

   if (opts.server === undefined || opts.server === null) {
      app = new Express();
   } else if (
      opts.server === undefined &&
      opts.server === null &&
      !(opts.server instanceof Express)
   ) {
      throw new Error("The server must be an Express instance");
   } else {
      app = opts.server;
   }

   if (opts.botManager !== undefined && opts.botManager !== null) {
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
      if (opts.accountInfo instanceof TwitterBot) {
         name = opts.accountInfo.name;
         account = opts.accountInfo;
      } else {
         if (
            opts.accountInfo.actions === undefined ||
            opts.accountInfo.eventActions === null
         ) {
            throw new Error("You must pass a bot eventActions function");
         }
         (name = opts.accountInfo.account_name),
            (account = new TwitterBot({
               account_name: opts.accountInfo.account_name,
               consumer_key: opts.accountInfo.consumer_key,
               consumer_secret: opts.accountInfo.consumer_secret,
               access_token: opts.accountInfo.access_token,
               access_token_secret: opts.accountInfo.access_token_secret,
               eventActions: opts.accountInfo.eventActions,
               jobs: opts.accountInfo.jobs,
            }));
      }
      manager = new TwitterBotManager({ [`${name}`]: account });
   }

   app.use(cors());
   app.use(json());
   app.use(urlencoded({ extended: true }));

   const twitters = manager.getAccounts();

   for (const twit in twitters) {
      app.use("/twitter/webhooks/" + twit, (req, res) => {
         eventHandler(req, res, twitters[twit]);
      });
   }

   app.listen(port, async () => {
      console.log("Server listening at: " + appURL + "\n");
      try {
         for (const twit in twitters) {
            await twitters[twit].initWebhook(
               appURL,
               "/twitter/webhooks/" + twit
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
 * @param {{
 * 			port: number,
 * 			account: { account_name: string, consumer_key: string, consumer_secret: string, access_token: string, access_token_secret: string, eventActions?: (event, oauth) => any, jobs?: Array<{ interval: string, jobAction: (oauth) => any }> } | TwitterBot,
 * 			botManager?: TwitterBotManager,
 * 			url?: string,
 * 			server?: Express
 * 			}} opts
 * @param opts.port - The port your server will be running on
 * @param opts.account - (Ignored if a botManager is passed in) The Twitter developer account app keys, and a function that defines the bot's behavior based on the event passed to it. This function will also be passed the bot account's oauth key for
 * use in any desired Twitter API calls
 * @param opts.botManager Optional - A manager holding one or more Twitter accounts
 * @param opts.url Optional (Required for a production/deployed server) - A valid URL for your bots to receive events at
 * @param opts.server Optional - A pre-configured Express server
 */
export default (opts) => {
   let _opts = {};

   if (opts === undefined || opts === null) {
      throw new Error("You must pass an object of required parameters");
   }

   if (opts.port === undefined || opts.port === null) {
      throw new Error(
         "You must pass the port your server will be listening on"
      );
   } else {
      _opts["port"] = opts.port;
   }

   if (
      opts.server !== undefined &&
      opts.server !== null &&
      !(opts.server instanceof Express)
   ) {
      throw new Error("The server must be an Express instance");
   } else if (opts.server !== undefined || opts.server !== null) {
      _opts["server"] = opts.server;
   }

   if (
      (opts.botManager === undefined || opts.botManager === null) &&
      (opts.account === undefined || opts.account === null)
   ) {
      return new Error(
         "You must pass your Developer Account app keys or a TwitterBot"
      );
   } else {
      _opts["accountInfo"] = opts.account;
   }
   _opts["botManager"] = opts.botManager;

   if (process.env.NODE_ENV === "production") {
      if (opts.url === undefined || opts.url === null || opts.url === "") {
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
