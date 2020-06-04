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

/**
 * @typedef {{ id: number,
 *             id_str: string,
 *             name: string,
 *             screen_name: string,
 *             location: null | any,
 *             url: null | any,
 *             description: string,
 *             translator_type: string,
 *             protected: boolean,
 *             verified: boolean,
 *             followers_count: number,
 *             friends_count: number,
 *             listed_count: number,
 *             favourites_count: number,
 *             statuses_count: number,
 *             created_at: string,
 *             utc_offset: null | any,
 *             time_zone: null | any,
 *             geo_enabled: boolean,
 *             lang: null | any,
 *             contributors_enabled: boolean,
 *             is_translator: boolean,
 *             profile_background_color: string,
 *             profile_background_image_url: string,
 *             profile_background_image_url_https: string,
 *             profile_background_tile: boolean,
 *             profile_link_color: string,
 *             profile_sidebar_border_color: string,
 *             profile_sidebar_fill_color: string,
 *             profile_text_color: string,
 *             profile_use_background_image: boolean,
 *             profile_image_url: string,
 *             profile_image_url_https: string,
 *             default_profile: boolean,
 *             default_profile_image: boolean,
 *             following: null | boolean,
 *             follow_request_sent: null | boolean,
 *             notifications: null | boolean
           }} User

* @typedef {{  id: string,
               created_timestamp: string,
               name: string,
               screen_name: string,
               description: string,
               protected: boolean,
               verified: boolean,
               followers_count: number,
               friends_count: number,
               statuses_count: number,
               profile_image_url: string,
               profile_image_url_https: string
            }} UserTruncated
           

 * @typedef {{ hashtags: Array<any>, urls: Array<any>, user_mentions: Array<any>, symbols: Array<any> }} entities

 * @typedef {{ for_user_id: string, 
               tweet_create_events: [{
                  created_at: string,
                  id: number,
                  id_str: string,
                  text: string,
                  source: string,
                  truncated: boolean,
                  in_reply_to_status_id: null | number,
                  in_reply_to_status_id_str: null | string,
                  in_reply_to_user_id: null | number,
                  in_reply_to_user_id_str: null | string,
                  in_reply_to_screen_name: null | number,
                  user: User,
                  geo: null | any,
                  coordinates: null | any,
                  place: null | any,
                  contributors: null | any,
                  is_quote_status: boolean,
                  quote_count: number,
                  reply_count: number,
                  retweet_count: number,
                  favorite_count: number,
                  entities: entities,
                  favorited: boolean,
                  retweeted: boolean,
                  filter_level: string,
                  lang: string,
                  timestamp_ms: string
               }]
            }} tweet_create_events

 * @typedef {{ for_user_id: string, 
               favorite_events: [{
                  id: string, 
                  created_at: string, 
                  timestamp_ms: number, 
                  favorited_status: {
                     created_at: string,
                     id: number,
                     id_str: string,
                     text: string,
                     source: string,    
                     truncated: boolean,
                     in_reply_to_status_id: null | number,
                     in_reply_to_status_id_str: null | string,
                     in_reply_to_user_id: null | number,
                     in_reply_to_user_id_str: null | string,
                     in_reply_to_screen_name: null | string,
                     user: User,
                     geo: null | any,
                     coordinates: null | any,
                     place: null | any,
                     contributors: null | any,
                     is_quote_status: boolean,
                     quote_count: number,
                     reply_count: number,
                     retweet_count: number,
                     favorite_count: number,
                     entities: entities,
                     favorited: boolean,
                     retweeted: boolean,
                     filter_level: string,
                     lang: string
                  }, 
                  user: User
               }]
            }} favorite_events

 *@typedef {{ for_user_id: string,
               follow_events: [{
                  type: 'follow',
                  created_timestamp: string,
                  target: User,
                  source: User
               }]
            }} follow_events

 * @typedef {{ for_user_id: string,
               follow_events: [{
                  type: 'unfollow',
                  created_timestamp: string,
                  target: User,
                  source: User
               }]
            }} unfollow_events

 * @typedef {{ for_user_id: string,
               block_events: [{
                  type: 'block',
                  created_timestamp: string,
                  source: User,
                  target: User
               }]
            }} block_events

 * @typedef {{ for_user_id: string,
               block_events: [{
                  type: 'unblock',
                  created_timestamp: string,
                  source: User,
                  target: User
               }]
            }} unblock_events
 
 * @typedef {{ for_user_id: string,
               mute_events: [{
                  type: 'mute',
                  created_timestamp: string,
                  source: User,
                  target: User
               }]
            }} mute_events

 * @typedef {{ for_user_id: string,
               mute_events: [{
                  type: 'unmute',
                  created_timestamp: string,
                  source: User,
                  target: User
               }]
            }} unmute_events

 * @typedef {{}} user_event

 * @typedef {{ for_user_id: string,
               direct_message_events: [{
                  type: 'message_create',
                  id: string,
                  created_timestamp: string,
                  message_create: {
                     target: { recipient_id: string },
                     sender_id: string,
                     message_data: {
                        text: string,
                        entities: { hashtags: [], symbols: [], user_mentions: [], urls: [] }
                     }
                  }
               }],
               users: {
                  [id: string]: UserTruncated, 
               }
            }} direct_message_events

 * @typedef {{ for_user_id: string,
               direct_message_indicate_typing_events: [{
                  created_timestamp: string,
                  sender_id: string,
                  target: { recipient_id: string }
               }],
               users: {
                  [id: string]: UserTruncated, 
               }
            }} direct_message_indicate_typing_events

 * @typedef {{ for_user_id: string,
               direct_message_mark_read_events: [{
                  created_timestamp: string,
                  sender_id: string,
                  target: { recipient_id: string },
                  last_read_event_id: string
               }],
               users: {
                  [id: string]: UserTruncated, 
               }
            }} direct_message_mark_read_events

 * @typedef {{ for_user_id: string, 
               tweet_delete_events: [{
                  timestamp_ms: string,
                  status: { id: string, user_id: string }
               }]
            }} tweet_delete_events
 */

/**
 * @typedef {{ tweet_create_events?: tweet_create_events,
   				favorite_events?: favorite_events,
   				follow_events?: follow_events,
   				unfollow_events?: unfollow_events,
   				block_events?: block_events,
   				unblock_events?: unblock_events,
   				mute_events?: mute_events,
   				unmute_events?: unmute_events,
   				user_event?: user_event,
   				direct_message_events?: direct_message_events,
   				direct_message_indicate_typing_events?: direct_message_indicate_typing_events,
   				direct_message_mark_read_events?: direct_message_mark_read_events,
					tweet_delete_events?: tweet_delete_events 
				}} eventType
 */

/**
 * @typedef {(event: eventType, self: import('../../bot').TwitterBot) => any} eventHandler
 * @typedef {(event: tweet_create_events, self: import('../../bot').TwitterBot) => any} tweetCreateEventHandler
 * @typedef {(event: favorite_events, self: import('../../bot').TwitterBot) => any} favoriteEventHandler
 * @typedef {(event: follow_events, self: import('../../bot').TwitterBot) => any} followEventHandler
 * @typedef {(event: unfollow_events, self: import('../../bot').TwitterBot) => any} unfollowEventHandler
 * @typedef {(event: block_events, self: import('../../bot').TwitterBot) => any} blockEventHandler
 * @typedef {(event: unblock_events, self: import('../../bot').TwitterBot) => any} unblockEventHandler
 * @typedef {(event: mute_events, self: import('../../bot').TwitterBot) => any} muteEventHandler
 * @typedef {(event: unmute_events, self: import('../../bot').TwitterBot) => any} unmuteEventHandler
 * @typedef {(event: user_event, self: import('../../bot').TwitterBot) => any} userEventHandler
 * @typedef {(event: direct_message_events, self: import('../../bot').TwitterBot) => any} directMessageEventHandler
 * @typedef {(event: direct_message_indicate_typing_events, self: import('../../bot').TwitterBot) => any} directMessageIndicateTypingEventHandler
 * @typedef {(event: direct_message_mark_read_events, self: import('../../bot').TwitterBot) => any} directMessageMarkReadEventHandler
 * @typedef {(event: tweet_delete_events, self: import('../../bot').TwitterBot) => any} tweetDeleteEventHandler
 */

export const events = {
   tweet_create_events: "tweet_create_events",
   favorite_events: "favorite_events",
   follow_events: "follow_events",
   unfollow_events: "unfollow_events",
   block_events: "block_events",
   unblock_events: "unblock_events",
   mute_events: "mute_events",
   unmute_events: "unmute_events",
   user_event: "user_event",
   direct_message_events: "direct_message_events",
   direct_message_indicate_typing_events:
      "direct_message_indicate_typing_events",
   direct_message_mark_read_events: "direct_message_mark_read_events",
   tweet_delete_events: "tweet_delete_events",
};
