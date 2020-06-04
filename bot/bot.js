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
import request from "request-promise";
import config from "../util/config";
import cron from "node-cron";
import { v4 as uuid } from "uuid";
import { DateTime } from "luxon";
import { TWITTER_EVENTS } from "../api";

/**
 * @typedef {import('node-cron').ScheduledTask} CronJob
 * @typedef {{ default?: import('../api/events/events').eventHandler,
               tweet_create_events?: import('../api/events/events').tweetCreateEventHandler,
               favorite_events?: import('../api/events/events').favoriteEventHandler,
               follow_events?: import('../api/events/events').followEventHandler,
               unfollow_events?: import('../api/events/events').unfollowEventHandler,
               block_events?: import('../api/events/events').blockEventHandler,
               unblock_events?: import('../api/events/events').unblockEventHandler,
               mute_events?: import('../api/events/events').muteEventHandler,
               unmute_events?: import('../api/events/events').unmuteEventHandler,
               user_event?: import('../api/events/events').userEventHandler,
               direct_message_events?: import('../api/events/events').directMessageEventHandler,
               direct_message_indicate_typing_events?: import('../api/events/events').directMessageIndicateTypingEventHandler,
               direct_message_mark_read_events?: import('../api/events/events').directMessageMarkReadEventHandler,
               tweet_delete_events?: import('../api/events/events').tweetDeleteEventHandler
            }} eventActions
 * @typedef {import('../api/events/events').eventHandler | {actions: eventActions, alwaysRunDefault: boolean}} eventActionsParam
 * @typedef {Array<{ interval: string; jobAction: (self: TwitterBot) => any; timezone?: string }>} jobsParam
 * @typedef {{ name: string, 
	            consumer_key: string,
				   consumer_secret: string, 
				   token: string,
				   token_secret: string,
				   eventActions?: eventActionsParam,
               jobs?: jobsParam,
               timezone?: string
            }} params
 * @typedef {{ id: string,
 *             interval: string,
 *             jobAction: (self: TwitterBot) => any,
 *             job: CronJob,
 *             inProgress: boolean,
 *             timezone: string,
 *             lastJob: {
 *                id: string,
 *                startedAt: string,
 *                finishedAt: string,
 *                error: boolean,
 *             }
 *          }} Job
 * @typedef {{ name: string,
 *             consumer_key: string,
 *             consumer_secret: string,
 *             token: string,
 *             token_secret: boolean,
 *          }} Account
 * @typedef {{ consumer_key: string,
 *             consumer_secret: string,
 *             token: string,
 *             token_secret: boolean,
 *          }} oauth
 */

export default class TwitterBot {
   /**
    *
    * @param {params} opts
    * @param opts.eventActions - A function that defines the bot's behavior based on the event passed to it. This function will also be passed a reference to the bot, useful for using
    * the bot's oauth for requests to the Twitter API and any other bot functions you may need in your response actions.
    */
   constructor(opts) {
      this._validateParams(opts);

      this.name = opts.name;
      this.oauth = {
         consumer_key: opts.consumer_key,
         consumer_secret: opts.consumer_secret,
         token: opts.token,
         token_secret: opts.token_secret,
      };
      this._headers = null;

      if (opts.timezone !== undefined) {
         this.timezone = opts.timezone;
      } else {
         (async () => {
            const d = DateTime.local();
            this.timezone = d.zoneName;
         })();
      }

      /**
       * @type {{ [id: string]: Job }}
       */
      this._jobs = {};

      if (opts.jobs !== undefined) {
         for (let i = 0; i < opts.jobs.length; i++) {
            this.registerJob(opts.jobs[i], false);
         }
      }

      this.responding = false;

      /**
       * @type {eventActions}
       */
      this._eventActions = {};

      if (typeof opts.eventActions === "object" && opts.eventActions !== null) {
         if (opts.eventActions.alwaysRunDefault !== undefined)
            this._alwaysRunDefaultAction = opts.eventActions.alwaysRunDefault;
      } else this._alwaysRunDefaultAction = false;

      if (opts.eventActions !== undefined)
         this.registerEventActions(opts.eventActions);
   }

   /**
    *
    * @param {params} opts
    */
   _validateParams(opts) {
      if (opts.name === undefined) {
         throw new Error("Undefined bot name");
      }

      if (opts.consumer_key === undefined) {
         throw new Error("Undefined consumer_key");
      }

      if (opts.consumer_secret === undefined) {
         throw new Error("Undefined consumer_secret");
      }

      if (opts.token === undefined) {
         throw new Error("Undefined token");
      }

      if (opts.token_secret === undefined) {
         throw new Error("Undefined token_secret");
      }

      if (opts.jobs !== undefined) {
         let index = 0;
         for (const job of opts.jobs) {
            if (
               job.interval === undefined ||
               job.interval === "" ||
               job.jobAction === undefined
            ) {
               throw new Error("Invalid job " + index);
            }
            index++;
         }
      }

      if (opts.eventActions !== undefined) {
         if (
            typeof opts.eventActions === "object" &&
            opts.eventActions !== null
         ) {
            if (opts.eventActions.actions === undefined) {
               throw new Error("You must define a dictionary of actions");
            }

            if (Object.keys(opts.eventActions.actions).length === 0) {
               throw new Error("You must define a default action");
            }

            for (const _event in opts.eventActions.actions) {
               if (_event !== "default" && !(_event in TWITTER_EVENTS)) {
                  throw new Error("Invalid eventAction " + _event);
               }
            }
         }
      }
   }

   /**
    * @returns {Account}
    */
   getInfo() {
      return { name: this.name, ...this.oauth };
   }

   /**
    * Get the authorization headers to allow the application to make authenticated requests
    * on behalf of a user. If no username/password is defined, get the bearer token
    * for the application's dev account.
    * @param {string} username
    * @param {string} password
    * @param {(token) => any} cb
    */
   async getBearerToken(username = null, password = null, cb = null) {
      try {
         const response = await request.post({
            uri:
               "https://api.twitter.com/oauth2/token?grant_type=client_credentials",
            auth: {
               user: username ? username : this.oauth.consumer_key,
               pass: password ? password : this.oauth.consumer_secret,
            },
            json: true,
         });
         if (cb) cb(response.access_token);
         return response.access_token;
      } catch (err) {
         if (cb) cb(err);
         console.error(err);
      }
   }

   /**
    *
    * @param {string} appURL
    * @param {string} webhookEndpoint
    */
   async initWebhook(appURL, webhookEndpoint) {
      console.log("Checking Twitter webhook registration status...");
      const hooks = await this.getWebhooks();
      if (hooks.length === 0) {
         console.log("No registered webhook found!");
         console.log("Registering webhook...");
         await this.createWebhook(appURL + webhookEndpoint); // Twitter will register the webhook to the URL, in a dev env they can't ping localhost, so go through ngrok but this changes
         console.log("Webhook registration successful!");
      } else {
         console.log("Found a registered webhook!");
         if (process.env.NODE_ENV === "production" && !hooks[0].valid) {
            console.log("Revalidating webhook...");
            await this.validateWebhook(hooks[0].id);
            console.log("Validation successful!");
         } else {
            console.log(
               "Running in a dev environment...Deleting and registering new webhook..."
            );
            await this.deleteWebhook(hooks[0].id); // If restarting the server in a dev env, just re-init the entire process since URL has changed
            console.log("Webhook deletion successful!");
            console.log("Registering new webhook...");
            await this.createWebhook(appURL + webhookEndpoint);
            console.log("Webhook registration successful!");
         }
      }
      console.log("Succesfully initiated application Twitter webhook!");
   }

   /**
    *
    * @param {(event: import("../api/events/events/events/events").eventType, self: TwitterBot) => any} eventProcessor
    */
   async initSubscription(eventProcessor = null) {
      console.log("Checking Twitter subscription status...");
      const subscribed = await this.getSubscription();
      if (!subscribed) {
         console.log("No subscriptions found!");
         console.log("Subscribing to dev account events...");
         if (await this.createSubscription())
            console.log("Subscription successful!");
         else {
            console.log("Subscription failed!");
            return;
         }
      } else {
         console.log("Found a subscription!");
      }
      console.log("Succesfully initiated Twitter account subscription!");
      if (eventProcessor !== null) {
         this.registerEventActions(eventProcessor);
      }
      console.log(
         "Waiting to receive and process " +
            this.name +
            "'s account events...\n"
      );
   }

   /******WEBHOOK******/
   // A Webhook is the process in which Twitter will communicate with the app.
   // It differs from a traditional REST-based APIs in that the app does not
   // need to be constantly polling Twitter for data. Twitter will send an event
   // to the app when new data becomes available. You must register an
   // endpoint with Twitter before anything else. This is usually done at the beginning
   // of the server's lifecycle. Once it is registered you can then subscribe to
   // account activities and twitter will send all activities through POST requests at that
   // endpoint.

   /**
    * Get an array of webhooks registered to the application.
    *
    * @param {Function | null} cb - An optional cb that's called on success and passed the results
    * or called on failure and passed the error.
    * @returns {[]} A list of objects representing the webhooks registered to the application
    */
   async getWebhooks(cb = null) {
      if (this._headers === null) {
         const token = await this.getBearerToken();
         this._headers = { Authorization: `Bearer ${token}` };
      }
      const res = await request.get({
         url: `${config.TWITTER_API_URL}/account_activity/all/${config.TWITTER_ENV}/webhooks.json`,
         headers: this._headers,
         json: true,
      });
      if (cb) cb(res);
      return res;
   }

   /**
    * Register a webhook to this application.
    *
    * @param {String} webhookURL - The endpoint to register for this webhook, events will be POST'd here
    * @param {Function | null} cb - An optional cb that's called on success and passed the results
    * or called on failure and passed the error.
    * @returns {String} The webhookID
    */
   async createWebhook(webhookURL, cb = null) {
      const res = await request.post({
         uri: `${config.TWITTER_API_URL}/account_activity/all/${config.TWITTER_ENV}/webhooks.json`,
         oauth: this.oauth,
         qs: {
            url: webhookURL,
         },
         json: true,
      });
      if (cb) cb(res);
      return res;
   }

   /**
    * Manually trigger a CRC request to re-validate a webhook
    *
    * @param {String} webhookID -
    * @param {Function | null} cb
    * @returns {boolean} Returns true on success, false on failure
    */
   async validateWebhook(webhookID, cb = null) {
      await request.put({
         url: `${config.TWITTER_API_URL}/account_activity/all/${config.TWITTER_ENV}/webhooks/${webhookID}.json`,
         oauth: this.oauth,
         json: true,
      });
      if (cb) cb(true);
      return true;
   }

   /**
    * Delete a webhook registered to this application
    *
    * @param {string} webhookID
    * @param {Function | null} cb
    * @returns {boolean} Returns true on success, false on failure
    */
   async deleteWebhook(webhookID, cb = null) {
      await request.delete({
         uri: `${config.TWITTER_API_URL}/account_activity/all/${config.TWITTER_ENV}/webhooks/${webhookID}.json`,
         oauth: this.oauth,
         json: true,
      });
      if (cb) cb(true);
      return true;
   }

   /******SUBSCRIPTION******/
   // Once a webhook has been successfully registered with Twitter, you can create a subscription.
   // A Subscription is a essentially a "stream" to a Twitter account's events/data. You subscribe to
   // this account and Twitter will hit your webhook endpoint whenever there is a new event. In order
   // to perform eventActions on behalf of a User, you must first be granted permission to obtain an access
   // token for that account.

   /**
    * Check if the application is subscribed to the provided user's event's
    * @param {Function | null} cb
    * @returns {boolean} Returns true on success, false on failure
    */
   async getSubscription(token = null, token_secret = null, cb = null) {
      let oauth;
      if (token && token_secret) {
         oauth = {
            ...this.oauth,
            token: token,
            token_secret: token_secret,
         };
      } else {
         oauth = this.oauth;
      }
      try {
         await request.get({
            uri: `${config.TWITTER_API_URL}/account_activity/all/${config.TWITTER_ENV}/subscriptions.json`,
            oauth,
            json: true,
         });
         if (cb) cb(true);
         return true;
      } catch (err) {
         if (cb) cb(false);
         return false;
      }
   }

   /**
    * @param {Function | null} cb
    * @returns {[]} Returns a list of objects representing the accounts this application is subscribed to
    */
   async getSubscriptions(cb = null) {
      if (this._headers === null) {
         const token = await this.getBearerToken();
         this._headers = { Authorization: `Bearer ${token}` };
      }
      const res = request.get({
         uri: `${config.TWITTER_API_URL}/account_activity/all/${config.TWITTER_ENV}/subscriptions/list.json`,
         headers: this._headers,
         json: true,
      });
      if (cb) cb(res);
      return res;
   }

   /**
    * @param {String | null} token
    * @param {String | null} token_secret
    * @param {Function | null} cb
    * @returns {boolean} Returns true on success, false on failure
    */
   async createSubscription(token = null, token_secret = null, cb = null) {
      let oauth;
      if (token && token_secret) {
         oauth = {
            ...this.oauth,
            token: token,
            token_secret: token_secret,
         };
      } else {
         oauth = this.oauth;
      }
      await request.post({
         uri: `${config.TWITTER_API_URL}/account_activity/all/${config.TWITTER_ENV}/subscriptions.json`,
         oauth,
         json: true,
      });
      if (cb) cb(true);
      return true;
   }

   /**
    *
    * @param {String} userId
    * @param {Function | null} cb
    * @returns {boolean} Returns true on success, false on failure
    */
   async deleteSubscription(userId, cb = null) {
      if (this._headers === null) {
         const token = await this.getBearerToken();
         this._headers = { Authorization: `Bearer ${token}` };
      }
      await request.delete({
         uri: `${config.TWITTER_API_URL}/account_activity/all/${config.TWITTER_ENV}/subscriptions/${userId}.json`,
         headers: this._headers,
         json: true,
      });
      if (cb) cb(true);
      return true;
   }

   /******ACTIVITY******/
   // A bot needs to do things.
   // Functions to schedule and manage tasks and event handlers.

   /**
    *
    * @param {eventActionsParam} eventActions
    */
   registerEventActions(eventActions) {
      if (typeof eventActions === "object" && eventActions !== null) {
         this._alwaysRunDefaultAction = eventActions.alwaysRunDefault;
         this._eventActions.default = eventActions.actions.default;
         for (const eventType in eventActions.actions)
            this._eventActions[eventType] = eventActions.actions[eventType];
      } else if (eventActions !== null) {
         this._eventActions.default = eventActions;
      }
   }

   /**
    *
    * @param {import("../api/events/events").eventType} event
    */
   async processEvent(event) {
      // if (this.responding) {
      //    // place in queue
      // }
      // allow conditions for moving on the next event if one is queued, how often events can be triggered, etc. implement queue management with an internally managed job?
      // check condtions

      // process queue

      if (
         this._eventActions.default !== undefined &&
         this._eventActions.default !== null
      ) {
         try {
            this.responding = true;

            /**
             * @type {Array<import("../api/events/events").eventHandler>}
             */
            const processes = [];

            for (const _event in TWITTER_EVENTS) {
               if (_event in TWITTER_EVENTS) {
                  if (_event in this._eventActions)
                     processes.push(this._eventActions[_event]);
               }
            }

            if (
               this._eventActions.default !== undefined &&
               this._eventActions.default !== null
            )
               processes.push(this._eventActions.default);

            if (processes.length > 1 && !this._alwaysRunDefaultAction)
               processes.pop();

            await Promise.all(processes.map((cb) => cb(event, this)));
         } catch (err) {
            console.log(
               "\x1b[31m",
               "\nUnhandled exception in",
               "\x1b[36m",
               this.name + "'s",
               "\x1b[31m",
               "event action caught!",
               "\x1b[0m"
            );
            console.error(err);
            console.log("\n");
         } finally {
            this.responding = false;
         }
      }
   }

   /**
    *
    * @param {jobsParam} job
    * @returns {string} The job's ID
    */
   registerJob(job, immediate = true) {
      if (this.validateJobInterval(job.interval)) {
         const id = uuid();

         this._jobs[id] = {
            id: id,
            interval: job.interval,
            jobAction: job.jobAction,
            inProgress: false,
            timezone: job.timezone !== undefined ? job.timezone : this.timezone,
            lastJob: {
               id: "",
               startedAt: "",
               finishedAt: "",
               error: false,
            },
            job: cron.schedule(
               job.interval,
               async () => {
                  this._jobs[id].inProgress = true;
                  this._jobs[
                     id
                  ].lastJob.startedAt = DateTime.local().toLocaleString(
                     DateTime.DATETIME_FULL
                  );
                  this._jobs[id].lastJob.finishedAt = "";
                  this._jobs[id].lastJob.id = id;
                  try {
                     await this._jobs[id].jobAction(this);
                     this._jobs[id].lastJob.error = false;
                  } catch (err) {
                     console.log(
                        "\x1b[31m",
                        "\nUnhandled exception in",
                        "\x1b[36m",
                        this.name + "'s",
                        "\x1b[31m",
                        "job " + id + " caught!",
                        "\x1b[0m"
                     );
                     console.error(err);
                     console.log("\n");
                     this._jobs[id].lastJob.error = true;
                  } finally {
                     this._jobs[id].inProgress = false;
                     this._jobs[
                        id
                     ].lastJob.finishedAt = DateTime.local().toLocaleString(
                        DateTime.DATETIME_FULL
                     );
                  }
               },
               {
                  scheduled: immediate,
                  timezone:
                     job.timezone !== undefined ? job.timezone : this.timezone,
               }
            ),
         };

         return id;
      } else {
         throw new Error("Not a valid interval expression");
      }
   }

   /**
    *
    * @param {string} interval
    */
   validateJobInterval(interval) {
      if (cron.validate(interval)) {
         return true;
      } else {
         return false;
      }
   }

   /**
    *
    * @param {string} id
    */
   removeJob(id) {
      this._jobs[id].job.destroy();
      delete this._jobs(id);
   }

   /**
    *
    * @param {string} id
    */
   stopJob(id) {
      this._jobs[id].job.stop();
   }

   stopAllJobs() {
      for (const i in this._jobs) {
         this._jobs[i].job.stop();
      }
   }

   /**
    *
    * @param {string} id
    */
   startJob(id) {
      this._jobs[id].job.start();
   }

   startAllJobs() {
      for (const i in this._jobs) {
         this._jobs[i].job.start();
      }
   }

   /**
    *
    * @param {string} id
    * @param {string} interval
    */
   updateJobInterval(id, interval) {
      if (this.validateJobInterval(interval)) {
         this.stopJob(id);
         this._jobs[id].interval = interval;
         this._jobs[id].job = cron.schedule(interval, () => {
            this._jobs[id].jobAction(this.oauth);
         });
      } else {
         throw new Error("Not a valid interval expression");
      }
   }

   /**
    * @returns { { [id: string]: { id: string, interval: string, jobAction: (oauth) => any, inProgress: boolean, timezone?: string } } } A dictionary of jobs belonging to this bot
    */
   getJobs() {
      let jobs = {};
      for (const id in this._jobs) {
         jobs[id] = {
            id: id,
            interval: this._jobs[id].interval,
            jobAction: this._jobs[id].jobAction,
            inProgress: this._jobs[id].inProgress,
            timezone: this._jobs[id].timezone,
            lastJob: this._jobs[id].lastJob,
         };
      }
      return jobs;
   }

   /**
    * @returns {number}
    */
   getNumJobs() {
      return Object.keys(this._jobs).length;
   }
}
