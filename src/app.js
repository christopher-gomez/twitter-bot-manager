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
import { NetworkRequestHandler } from "./api";
import { TwitterBotManager, TwitterBot } from "./bot";
import {Config} from "./util/config";

/**
 * @typedef {import('express').Express} Express
 */

/**
 * 
 * @typedef {object} AccountInfo 
 * @property {string} name
 * @property {string} consumer_key
 * @property {string} consumer_secret
 * @property {string} token
 * @property {string} token_secret
 * @property {import('./bot/bot').EventActionsParam | undefined} eventActions
 * @property {import('./bot/bot').JobsParam | undefined} jobs
 */

/**
 * @callback onServerReady
 * 
 */

/**
 * @param {object} opts
 * @param {number} opts.port
 * @param {string} opts.url
 * @param {AccountInfo | TwitterBot | undefined} opts.accountInfo
 * @param {TwitterBot | undefined} opts.bot
 * @param {TwitterBotManager | undefined} opts.botManager
 * @param {Express.Application | undefined} opts.server
 * @param {boolean | undefined} opts.validateRequests
 * @param {boolean | undefined} opts.loggingEnabled
 * @param {onServerReady | undefined} onReady
 * @function
 * @returns {void}
 */
const App = (opts, onReady = undefined) =>{
   /***
    * @type {Express.Application}
    */
   let app;
   /***
    * @type {string}
    */
   let appURL;
   /***
    * @type {number}
    */
   let port;
   /***
    * @type {import('./bot/index').TwitterBotManager}
    */
   let manager = undefined;

   let validateRequests = opts.validateRequests ?? true;
   let loggingEnabled = opts.loggingEnabled ?? true;

   if (opts.botManager !== undefined) {
      manager = opts.botManager;
   } else {
      if (opts.accountInfo === undefined && opts.bot == undefined) {
         throw new Error(
            "You must pass either a manager or your default Twitter dev account info"
         );
      }

      let account;
      let name;

      if (
         opts.accountInfo !== undefined &&
         opts.accountInfo instanceof TwitterBot
      ) {
         name = opts.accountInfo.name.split(" ").join("_");;
         account = opts.accountInfo;
      } else if (opts.bot !== undefined) {
         name = opts.bot.name.split(" ").join("_");;
         account = opts.bot;
      } else {
         name = opts.accountInfo.name.split(" ").join("_");;
         account = new TwitterBot({
            name: name,
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

   manager._setURL(appURL);

   app.use(Config.TWITTER_WEBHOOK_ENDPOINT + "/:botname", (req, res) => {
      if (req.params.botname in manager.bots) {
         NetworkRequestHandler(req, res, manager.bots[req.params.botname], validateRequests, manager.bots[req.params.botname].loggingEnabled);
      }
   });

   app.listen(port, async () => {
      if(loggingEnabled) console.log("Server listening at: " + appURL + "\n");

      try {
         for (const bot in manager.bots) {
            await manager.bots[bot].initWebhook(
               appURL + Config.TWITTER_WEBHOOK_ENDPOINT + "/" + bot
            );
            await manager.bots[bot].initSubscription();
            manager.bots[bot].startAllJobs();
         }
         if (onReady !== undefined) onReady();
      } catch (err) {
         console.log(err);
         process.exit(1);
      }
   });
};

/**
 * @param {object} opts
 * @param {number | undefined} opts.port Optional - The port your server will be running on, defaults to 3000 in dev environments and the environment variable 'PORT' if in a production environment
 * @param {string} opts.url Optional (Required for a production/deployed server) - A valid URL for your bots to receive events at
 * @param {AccountInfo | TwitterBot | undefined} opts.account - (Ignored if a botManager is passed in) The Twitter developer account app keys, and a function that defines the bot's behavior based on the event passed to it. This function will also be passed the bot account's oauth key for
 * use in any desired Twitter API calls
 * @param {TwitterBot | undefined} opts.bot
 * @param {TwitterBotManager | undefined} opts.botManager Optional - A manager holding one or more Twitter accounts
 * @param {Express.Application | undefined} opts.server  Optional - A pre-configured Express server
 * @param {boolean | undefined} opts.validateRequests
 * @param {boolean | undefined} opts.loggingEnabled Optional - Console logging for network requests and initialization
 * @param {onServerReady | undefined} onReady Optional - Callback called once the server and bots are ready and listening
 * @function
 * @returns {void | Error}
 */
export const Server = (opts, onReady = undefined) => {
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

   if (
      opts.botManager === undefined &&
      opts.account === undefined &&
      opts.bot === undefined
   ) {
      return new Error("You must pass your Twitter app keys or a TwitterBot");
   } else {
      _opts["accountInfo"] = opts.account;
      _opts["bot"] = opts.bot;
   }
   _opts["botManager"] = opts.botManager;
   _opts["server"] = opts.server;

   if (process.env.NODE_ENV === "production") {
      if (opts.url === undefined || opts.url === "") {
         throw new Error(
            "You must pass a valid URL you own for your bot to function"
         );
      } else {
         _opts["url"] = opts.url;
      }

      App(_opts, onReady);
   } else {
      const ngrok = require("ngrok");

      (async () => {
         // console.log("Dev environment detected. Starting ngrok...");
         const url = await ngrok.connect(_opts["port"]);
         _opts["url"] = url;
         App(_opts, onReady);
      })();
   }
};
