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
import TwitterBot from './bot';

/**
 * @typedef {import('./bot').default} TwitterBot
 */

export default class TwitterBotManager {

	/**
	 * 
	 * @param {{
	 * 			[accountName: string]: {
	 *              account_name: string,
	 * 				consumer_key: string, 
	 *				consumer_secret: string, 
	 *				access_token: string,
	 *				access_token_secret: string,
	 *              actions: (event, oauth) => any,
	 *			} | TwitterBot
			  }} accounts - An object with at least one account, where the key is whatever name you choose for the account and it's account info
	 */
	constructor(accounts) {
		if (accounts === undefined || accounts === null || Object.keys(accounts).length < 1) {
			throw new Error('You must pass an object with at least one account\'s info');
		}
		this.accounts = {};

		for(const account in accounts) {
			this.addAccount(account, accounts[account]);
		}
	}

	/**
	 * @param {string} accountName
	 * @param {{
	 *          account_name: string,
	 *          consumer_key: string, 
				consumer_secret: string, 
				access_token: string,
				access_token_secret: string
				} | TwitterBot} opts
	 */
	addAccount(accountName, opts) {
		if(opts instanceof TwitterBot) {
			this.accounts[accountName] = opts;
		} else {
			const info = { ...this._parseInfo(opts) };
			this.accounts[accountName] = new TwitterBot(info);
		}
	}

	/**
	 * @returns {{[accountName: string]: import('./bot').default}}
	 */
	getAccounts() {
		return this.accounts;
	}

	/**
	 * 
	 * @param {string} name 
	 * @param {{
	 *  account_name: string,
	 *  consumer_key: string, 
		consumer_secret: string, 
		access_token: string,
		access_token_secret: string,
		actions: (event, oauth) => any
		}} opts
	 */
	_parseInfo(opts) {
		return {
			account_name: opts.account_name,
			consumer_key: opts.consumer_key, // Application Consumer Key
			consumer_secret: opts.consumer_secret, // Application Consumer Secret
			access_token: opts.access_token, // Dev Account Access Token
			access_token_secret: opts.access_token_secret, // Dev Account Access Token Secret
			actions: opts.actions
		};
	}
}