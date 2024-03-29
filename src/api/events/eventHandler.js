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
import { TwitterBot } from "../../bot";


/**
 * @typedef {import('express').Request} Request
 */

/**
 * @typedef {import('express').Response} Response
 */

const validTwitterSignature = function (signature, body, bot) {
   const generatedSignature = "sha256=".concat(
      crypto
         .createHmac("sha256", bot.oauth.consumer_secret)
         .update(JSON.stringify(body), "utf8")
         .digest("base64")
   );

   // console.log(signature);
   // console.log(generatedSignature);
   return signature === generatedSignature;
};

/**
 * @param {TwitterBot} twitterAccount
 */
const createCrcResponseToken = (crcToken, twitterAccount) => {
   const hmac = crypto
      .createHmac("sha256", twitterAccount.oauth.consumer_secret)
      .update(crcToken)
      .digest("base64");

   return `sha256=${hmac}`;
};

/**
 * @param {TwitterBot} twitterAccount
 */
const getHandler = (req, res, twitterAccount, logsEnabled = true) => {
   if (logsEnabled)
      console.log("Handling CRC GET Request...");
   if (req.query.crc_token) {
      res.status(200).send({
         response_token: createCrcResponseToken(
            req.query.crc_token,
            twitterAccount
         ),
      });

      if (logsEnabled)
         console.log("Challenge Response Check Successful!\n");
   }
};

/**
 * 
 * @param {Request} req 
 * @param {TwitterBot} twitterAccount 
 * @param {booolean} validateRequest 
 * @param {boolean} logsEnabled 
 */
const postHandler = (req, twitterAccount, validateRequest = true, logsEnabled = true) => {
   if (logsEnabled)
      console.log("Handling POST Request...\n");

   const sig = req.headers["X-Twitter-Webhooks-Signature"] || req.headers["x-twitter-webhooks-signature"];
   if (!validateRequest || validTwitterSignature(sig, req.body, twitterAccount)) {
      twitterAccount.processEvent(req.body);
   } else {
      if (logsEnabled)
         console.log("POST Request from unknown origin, ignoring...");
   }
};

/**
 * @callback NetworkRequestHandler
 * @param {Request} req
 * @param {Response} res
 * @param {TwitterBot} twitterAccount
 * @param {boolean | undefined} validateRequest
 * @param {boolean | undefined} logsEnabled
 * @returns {void}
 */

/**
 * @param {Request} req
 * @param {Response} res
 * @param {TwitterBot} twitterAccount
 * @param {boolean | undefined} validateRequest
 * @param {boolean | undefined} logsEnabled
 * @function
 * @returns {void}
 */
export const eventHandler = (req, res, twitterAccount, validateRequest = true, logsEnabled = true) => {
   if (logsEnabled)
      console.log("Incoming Webhook Event from Twitter for " + twitterAccount.name);
   try {
      switch (req.method) {
         case "GET":
            return getHandler(req, res, twitterAccount, logsEnabled);
         case "POST":
            return postHandler(req, twitterAccount, validateRequest, logsEnabled);
      }
   } catch (error) {
      console.error("ERROR IN WEBHOOK HANDLER: " + error);
   }
};
