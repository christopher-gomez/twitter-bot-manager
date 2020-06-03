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

// Twitter API functions
export default class API {
   /**
	 * 
	 * @param {{consumer_key: string, 
			consumer_secret: string,
			token: string,
			token_secret: string}} opts 
	 * @param opts - The account keys
	 */
   constructor(opts) {
      if (
         opts.consumer_key === undefined ||
         opts.consumer_secret === undefined ||
         opts.token === undefined ||
         opts.token_secret === undefined
      ) {
         throw new Error("Undefined params");
      }

      this.oauth = opts;
   }

   async getAllUserTweets(userID, oauth = undefined) {
      oauth = oauth !== undefined ? oauth : this.oauth;
      let data = [];
      const get = async (lastId = null) => {
         const args = {
            user_id: userID,
            count: 200,
            include_rts: true,
            trim_user: true,
            exclude_replies: false,
         };
         if (lastId) args["max_id"] = lastId;

         try {
            const chunk = await request.get({
               uri: "https://api.twitter.com/1.1/statuses/user_timeline.json",
               oauth: oauth,
               qs: args,
               json: true,
            });
            if (data.length) chunk.shift(); // Get rid of the first element of each iteration (not the first time)
            data = data.concat(chunk);
            if (chunk.length) await get(parseInt(data[data.length - 1].id_str));
         } catch (err) {
            console.error(err);
         }
      };
      await get();
      return data;
   }

   async getMediaAttachment(uri, oauth = undefined) {
      oauth = oauth !== undefined ? oauth : this.oauth;
      const img = await request.get({
         uri: uri,
         oauth: oauth,
         encoding: null,
      });
      return img;
   }
}
