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
import request from 'request-promise';
import config from '../util/config';

export default class TwitterBot {

	/**
	 * 
	 * @param {{account_name: string, 
	 *          consumer_key: string,
				consumer_secret: string, 
				access_token: string,
				access_token_secret: string,
				actions: (event, oauth) => any
				}} opts
	 * @param opts.actions - A function that defines the bot's behavior based on the event passed to it. This function will also be passed the bot account's oauth key for
	 * use in any desired Twitter API calls.
	 */
	constructor(opts) {
		if (opts.account_name === undefined || opts.consumer_key === undefined || opts.consumer_secret === undefined || opts.access_token === undefined || opts.access_token_secret === undefined || opts.actions === undefined) {
			throw new Error('Undefined params');
		}

		this.name = opts.account_name;
		this.oauth = {
			consumer_key: opts.consumer_key,
			consumer_secret: opts.consumer_secret,
			token: opts.access_token,
			token_secret: opts.access_token_secret
		};

		this.headers = null;

		this.registerEventProcessor(opts.actions);
	}

	/**
 	* Get the authorization headers to allow the application to make authenticated requests 
 	* on behalf of a user. If no username/password is defined, get the bearer token
 	* for the application's dev account.
 	* @param {*} username 
 	* @param {*} password 
 	* @param {*} cb 
 	*/
	async getBearerToken(username = null, password = null, cb = null) {
		try {
			const response = await request.post({
				uri: 'https://api.twitter.com/oauth2/token?grant_type=client_credentials',
				auth: {
					user: username ? username : this.oauth.consumer_key,
					pass: password ? password : this.oauth.consumer_secret
				},
				json: true
			});
			if (cb) cb(response.access_token);
			return response.access_token;
		} catch (err) {
			if (cb) cb(err);
			console.error(err);
		}
	}

	async initWebhook(appURL, webhookEndpoint) {
		console.log('Checking Twitter webhook registration status...');
		const hooks = await this.getWebhooks();
		if (hooks.length === 0) {
			console.log('No registered webhook found!');
			console.log('Registering webhook...');
			await this.createWebhook(appURL + webhookEndpoint); // Twitter will register the webhook to the URL, in a dev env they can't ping localhost, so go through ngrok but this changes
			console.log('Webhook registration successful!');
		} else {
			console.log('Found a registered webhook!');
			if (process.env.NODE_ENV === 'production' && !hooks[0].valid) {
				console.log('Revalidating webhook...');
				await this.validateWebhook(hooks[0].id);
				console.log('Validation successful!');
			} else {
				console.log('Running in a dev environment...Deleting and registering new webhook...');
				await this.deleteWebhook(hooks[0].id); // If restarting the server in a dev env, just re-init the entire process since URL has changed
				console.log('Webhook deletion successful!');
				console.log('Registering new webhook...');
				await this.createWebhook(appURL + webhookEndpoint);
				console.log('Webhook registration successful!');
			}
		}
		console.log('Succesfully initiated application Twitter webhook!');
		
	}

	/**
	 * 
	 * @param {(event, oauth) => any} eventProcessor 
	 */
	async initSubscription(eventProcessor=null) {
		console.log('Checking Twitter subscription status...');
		const subscribed = await this.getSubscription();
		if (!subscribed) {
			console.log('No subscriptions found!');
			console.log('Subscribing to dev account events...');
			if (await this.createSubscription())
				console.log('Subscription successful!');
			else
				console.log('Subscription failed!');
		} else {
			console.log('Found a subscription!');
		}
		console.log('Succesfully initiated Twitter account subscription!');
		if(eventProcessor !== null) {
			this.registerEventProcessor(eventProcessor);
		}
		console.log('Waiting to receive and process '+this.name+'\'s account events...\n');
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
		if (this.headers === null) {
			const token = await this.getBearerToken();
			this.headers = { Authorization: `Bearer ${token}` };
		}
		const res = await request.get({
			url: `${config.TWITTER_API_URL}/account_activity/all/${config.TWITTER_ENV}/webhooks.json`,
			headers: this.headers,
			json: true
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
				url: webhookURL
			},
			json: true
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
			json: true
		});
		if (cb) cb(true);
		return true;
	}
	// CAMILLA

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
			json: true
		});
		if (cb) cb(true);
		return true;
	}

	/******SUBSCRIPTION******/
	// Once a webhook has been successfully registered with Twitter, you can create a subscription.
	// A Subscription is a essentially a "stream" to a Twitter account's events/data. You subscribe to
	// this account and Twitter will hit your webhook endpoint whenever there is a new event. In order
	// to perform actions on behalf of a User, you must first be granted permission to obtain an access
	// token for that account.

	/**
	 * Check if the application is subscribed to the provided user's event's
	 * @param {Function | null} cb
	 * @returns {boolean} Returns true on success, false on failure 
	 */
	async getSubscription(access_token = null, access_token_secret = null, cb = null) {
		let oauth;
		if (access_token && access_token_secret) {
			oauth = { ...this.oauth, token: access_token, token_secret: access_token_secret };
		} else {
			oauth = this.oauth;
		}
		try {
			await request.get({
				uri: `${config.TWITTER_API_URL}/account_activity/all/${config.TWITTER_ENV}/subscriptions.json`,
				oauth,
				json: true
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
		if (this.headers === null) {
			const token = await this.getBearerToken();
			this.headers = { Authorization: `Bearer ${token}` };
		}
		const res = request.get({
			uri: `${config.TWITTER_API_URL}/account_activity/all/${config.TWITTER_ENV}/subscriptions/list.json`,
			headers: this.headers,
			json: true
		});
		if (cb) cb(res);
		return res;
	}

	/**
 	* @param {String | null} access_token 
 	* @param {String | null} access_token_secret 
 	* @param {Function | null} cb 
 	* @returns {boolean} Returns true on success, false on failure 
 	*/
	async createSubscription(access_token = null, access_token_secret = null, cb = null) {
		let oauth;
		if (access_token && access_token_secret) {
			oauth = { ...this.oauth, token: access_token, token_secret: access_token_secret };
		} else {
			oauth = this.oauth;
		}
		await request.post({
			uri: `${config.TWITTER_API_URL}/account_activity/all/${config.TWITTER_ENV}/subscriptions.json`,
			oauth,
			json: true
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
		if (this.headers === null) {
			const token = await this.getBearerToken();
			this.headers = { Authorization: `Bearer ${token}` };
		}
		await request.delete({
			uri: `${config.TWITTER_API_URL}/account_activity/all/${config.TWITTER_ENV}/subscriptions/${userId}.json`,
			headers: this.headers,
			json: true
		});
		if (cb) cb(true);
		return true;
	}

	/**
	 * 
	 * @param {(event, oauth) => any} cb 
	 */
	registerEventProcessor(cb) {
		this.eventProcessor = cb;
	}

	processEvent(event) {
		if (this.eventProcessor) {
			this.eventProcessor(event, this.oauth);
		}
	}	
}
