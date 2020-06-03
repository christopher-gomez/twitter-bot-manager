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
import crypto from "crypto";
// eslint-disable-next-line no-unused-vars
import { TwitterBot as TwitterAccount } from "../../bot";

/**
 * @param {TwitterAccount} twitterAccount
 */
const createCrcResponseToken = (crcToken, twitterAccount) => {
   const hmac = crypto
      .createHmac("sha256", twitterAccount.oauth.consumer_secret)
      .update(crcToken)
      .digest("base64");

   return `sha256=${hmac}`;
};

/**
 * @param {TwitterAccount} twitterAccount
 */
const getHandler = (req, res, twitterAccount) => {
   console.log("Handling CRC GET Request...");
   if (req.query.crc_token) {
      res.status(200).send({
         response_token: createCrcResponseToken(
            req.query.crc_token,
            twitterAccount
         ),
      });
      console.log("Challenge Response Check Successful!\n");
   }
};

/**
 * @param {TwitterAccount} twitterAccount
 */
const postHandler = (req, twitterAccount) => {
   console.log("Handling POST Request...\n");
   twitterAccount.processEvent(req.body);
};

/**
 * @param {TwitterAccount} twitterAccount
 */
export default (req, res, twitterAccount) => {
   console.log("Incoming Webhook Event from Twitter for "+twitterAccount.name);
   try {
      switch (req.method) {
         case "GET":
            return getHandler(req, res, twitterAccount);
         case "POST":
            return postHandler(req, twitterAccount);
      }
   } catch (error) {
      console.error("ERROR IN WEBHOOK HANDLER: " + error);
   }
};
