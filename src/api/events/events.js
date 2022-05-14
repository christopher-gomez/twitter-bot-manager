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

import { TwitterBot } from '../../bot/bot';

/**
 * @typedef {object} User
 * @property {number} id
 * @property {string} id_str
 * @property {string} name
 * @property {string} screen_name
 * @property {null | any} location
 * @property {null | any} url
 * @property {string} description
 * @property {string} translator_type
 * @property {boolean} protected
 * @property {boolean} verified
 * @property {number} followers_count
 * @property {number} friends_count
 * @property {number} listed_count
 * @property {number} favourites_count
 * @property {number} statuses_count
 * @property {string} created_at
 * @property {null | any} utc_offset
 * @property {null | any} time_zone
 * @property {boolean} geo_enabled
 * @property {null | any} lang
 * @property {boolean} contributors_enabled
 * @property {boolean} is_translator
 * @property {string} profile_background_color
 * @property {string} profile_background_image_url
 * @property {string} profile_background_image_url_https
 * @property {boolean} profile_background_tile
 * @property {string} profile_link_color
 * @property {string} profile_sidebar_border_color
 * @property {string} profile_sidebar_fill_color
 * @property {string} profile_text_color
 * @property {boolean} profile_use_background_image
 * @property {string} profile_image_url
 * @property {string} profile_image_url_https
 * @property {boolean} default_profile
 * @property {boolean} default_profile_image
 * @property {null | boolean} following
 * @property {null | boolean} follow_request_sent
 * @property {null | boolean} notifications
 */

/**
 * @typedef {object} UserTruncated
 * @property {string} id
 * @property {string} created_timestamp
 * @property {string} name
 * @property {string} screen_name
 * @property {string} description
 * @property {boolean} protected
 * @property {boolean} verified
 * @property {number} followers_count
 * @property {number} friends_count
 * @property {number} statuses_count
 * @property {string} profile_image_url
 * @property {string} profile_image_url_https
 */

/**
 * @typedef {object} entities
 * @property {Array} hashtags
 * @property {Array} urls
 * @property {Array} user_mentions
 * @property {Array} symbols
 */

/**
 * @typedef {object} tweet_create_events_array_type
 * @property {string} created_at
 * @property {number} id
 * @property {string} id_str
 * @property {string} text
 * @property {string} source
 * @property {boolean} truncated
 * @property {null | number} in_reply_to_status_id
 * @property {null | string} in_reply_to_status_id_str
 * @property {null | number} in_reply_to_user_id
 * @property {null | string} in_reply_to_user_id_str
 * @property {null | number} in_reply_to_screen_name
 * @property {User} user 
 * @property {null | any} geo
 * @property {null | any} coordinates
 * @property {null | any} place
 * @property {null | any} contributors
 * @property {boolean} is_quote_status
 * @property {number} quote_count
 * @property {number} reply_count
 * @property {number} retweet_count
 * @property {number} favorite_count
 * @property {entities} entities
 * @property {boolean} favorited
 * @property {boolean} retweeted
 * @property {string} filter_level
 * @property {string} lang
 * @property {string} timestamp_ms
 */

/**
 * @typedef {object} tweet_create_events
 * @property {string} for_user_id
 * @property {tweet_create_events_array_type[]} tweet_create_events
 */

/**
 * @typedef {object} favorited_status
 * @property {string} created_at
 * @property {number} id
 * @property {string} id_str
 * @property {string} text
 * @property {string} source
 * @property {boolean} truncated
 * @property {null | number} in_reply_to_status_id
 * @property {null | string} in_reply_to_status_id_str
 * @property {null | number} in_reply_to_user_id
 * @property {null | string} in_reply_to_user_id_str
 * @property {null | number} in_reply_to_screen_name
 * @property {User} user 
 * @property {null | any} geo
 * @property {null | any} coordinates
 * @property {null | any} place
 * @property {null | any} contributors
 * @property {boolean} is_quote_status
 * @property {number} quote_count
 * @property {number} reply_count
 * @property {number} retweet_count
 * @property {number} favorite_count
 * @property {entities} entities
 * @property {boolean} favorited
 * @property {boolean} retweeted
 * @property {string} filter_level
 * @property {string} lang
 */

/**
 * @typedef {object} favorite_events_array_type
 * @property {string} created_at
 * @property {string} id
 * @property {number} timestamp_ms
 * @property {favorited_status} favorited_status
 * @property {User} user 
 */

/**
 * @typedef {object} favorite_events
 * @property {string} for_user_id
 * @property {favorite_events_array_type[]} favorite_events
 */

/**
 * @typedef {object} follow_events_array_type
 * @property {"follow"} type
 * @property {string} created_timestamp
 * @property {User} target
 * @property {User} source
 */

/**
 * @typedef {object} follow_events
 * @property {string} for_user_id
 * @property {follow_events_array_type[]} follow_events
 */

/**
 * @typedef {object} unfollow_events_array_type
 * @property {"unfollow"} type
 * @property {string} created_timestamp
 * @property {User} target
 * @property {User} source
 */

/**
 * @typedef {object} unfollow_events
 * @property {string} for_user_id
 * @property {unfollow_events_array_type[]} follow_events
 */

/**
 * @typedef {object} block_events_array_type
 * @property {"block"} type
 * @property {string} created_timestamp
 * @property {User} target
 * @property {User} source
 */

/**
 * @typedef {object} block_events
 * @property {string} for_user_id
 * @property {block_events_array_type[]} block_events
 */

/**
 * @typedef {object} unblock_events_array_type
 * @property {"unblock"} type
 * @property {string} created_timestamp
 * @property {User} target
 * @property {User} source
 */

/**
 * @typedef {object} unblock_events
 * @property {string} for_user_id
 * @property {unblock_events_array_type[]} block_events
 */

/**
 * @typedef {object} mute_events_array_type
 * @property {"mute"} type
 * @property {string} created_timestamp
 * @property {User} target
 * @property {User} source
 */

/**
 * @typedef {object} mute_events
 * @property {string} for_user_id
 * @property {mute_events_array_type[]} mute_events
 */

/**
 * @typedef {object} unmute_events_array_type
 * @property {"unmute"} type
 * @property {string} created_timestamp
 * @property {User} target
 * @property {User} source
 */

/**
 * @typedef {object} unmute_events
 * @property {string} for_user_id
 * @property {unmute_events_array_type[]} mute_events
 */

/**
 * @typedef {object} user_event
 */

/**
 * @typedef {object} RecipientTarget
 * @property {string} recipient_id
 */

/**
 * @typedef {object} message_create_message_data
 * @property {string} text
 * @property {entities} entities
 */

/**
 * @typedef {object} message_create
 * @property {RecipientTarget} target
 * @property {string} sender_id 
 * @property {message_create_message_data} message_data
 * 
 */

/**
 * @typedef {object} direct_message_events_array_type
 * @property {"message_create"} type
 * @property {string} id
 * @property {string} created_timestamp
 * @property {message_create} message_create
 * @property {User} user 
 */

/**
 * @typedef {Object<string, UserTruncated>} UserTruncatedDictionary
 */

/**
 * @typedef {object} direct_message_events
 * @property {string} for_user_id
 * @property {direct_message_events_array_type[]} direct_message_events
 * @property {UserTruncatedDictionary} users
 */

/**
 * @typedef {object} message_create_message_data
 * @property {string} text
 * @property {entities} entities
 */

/**
 * @typedef {object} message_create
 * @property {RecipientTarget} target
 * @property {string} sender_id 
 * @property {message_create_message_data} message_data
 * 
 */

/**
 * @typedef {object} direct_message_indicate_typing_events_array_type
 * @property {string} created_timestamp
 * @property {string} sender_id
 * @property {RecipientTarget} target 
 */

/**
 * @typedef {object} direct_message_indicate_typing_events
 * @property {string} for_user_id
 * @property {direct_message_indicate_typing_events_array_type[]} direct_message_indicate_typing_events
 * @property {UserTruncatedDictionary} users
 */

/**
 * @typedef {object} direct_message_mark_read_events_array_type
 * @property {string} created_timestamp
 * @property {string} sender_id
 * @property {RecipientTarget} target 
 * @property {string} last_read_event_id
 */

/**
 * @typedef {object} direct_message_mark_read_events
 * @property {string} for_user_id
 * @property {direct_message_mark_read_events_array_type[]} direct_message_indicate_typing_events
 * @property {UserTruncatedDictionary} users
 */

/**
 * @typedef {object} tweet_delete_status
 * @property {string} id
 * @property {string} user_id
 */

/**
 * @typedef {object} tweet_delete_events_array_type
 * @property {string} timestamp_ms
 * @property {tweet_delete_status} status 
 */

/**
 * @typedef {object} tweet_delete_events
 * @property {string} for_user_id
 * @property {tweet_delete_events_array_type[]} direct_message_indicate_typing_events
 */

/**
 * @typedef {"tweet_create_events" | 
 *           "favorite_events" | 
 *           "follow_events" | 
 *           "unfollow_events" | 
 *           "block_events" | 
 *           "unblock_events" | 
 *           "mute_events" | 
 *           "unmute_events" | 
 *           "user_event" | 
 *           "direct_message_events" |
 *           "direct_message_indicate_typing_events" | 
 *           "direct_message_mark_read_events" | 
 *           "tweet_delete_events"} TwitterEventType
 */

/**
 * @callback TwitterEventHandler
 * @param {TwitterEventType} event
 * @param {TwitterBot} self
 * @returns {void}
 */

/**
 * @callback TweetCreateEventHandler
 * @param {"tweet_create_events"} event
 * @param {TwitterBot} self
 * @returns {void}
 */

/**
 * @callback FavoriteEventHandler
 * @param {"favorite_events"} event
 * @param {TwitterBot} self
 * @returns {void}
 */

/**
 * @callback FollowEventHandler
 * @param {"follow_events"} event
 * @param {TwitterBot} self
 * @returns {void}
 */

/**
 * @callback UnfollowEventHandler
 * @param {"unfollow_events"} event
 * @param {TwitterBot} self
 * @returns {void}
 */

/**
 * @callback BlockEventHandler
 * @param {"block_events"} event
 * @param {TwitterBot} self
 * @returns {void}
 */

/**
 * @callback UnblockEventHandler
 * @param {"unblock_events"} event
 * @param {TwitterBot} self
 * @returns {void}
 */

/**
 * @callback MuteEventHandler
 * @param {"mute_events"} event
 * @param {TwitterBot} self
 * @returns {void}
 */

/**
 * @callback UnmuteEventHandler
 * @param {"unmute_events"} event
 * @param {TwitterBot} self
 * @returns {void}
 */

/**
 * @callback UserEventHandler
 * @param {"user_event"} event
 * @param {TwitterBot} self
 * @returns {void}
 */

/**
 * @callback DirectMessageEventHandler
 * @param {"direct_message_events"} event
 * @param {TwitterBot} self
 * @returns {void}
 */

/**
 * @callback DirectMessageIndicateTypingEventHandler
 * @param {"direct_message_indicate_typing_events"} event
 * @param {TwitterBot} self
 * @returns {void}
 */

/**
 * @callback DirectMessageMarkReadEventHandler
 * @param {"direct_message_mark_read_events"} event
 * @param {TwitterBot} self
 * @returns {void}
 */

/**
 * @callback TweetDeleteEventHandler
 * @param {"direct_message_mark_read_events"} event
 * @param {TwitterBot} self
 * @returns {void}
 */

/**
 * @type {object}
 * @property {"tweet_create_events"} tweet_create_events
 * @property {"favorite_events"} favorite_events
 * @property {"follow_events"} follow_events
 * @property {"unfollow_events"} unfollow_events
 * @property {"block_events"} block_events
 * @property {"unblock_events"} unblock_events
 * @property {"mute_events"} mute_events
 * @property {"unmute_events"} unmute_events
 * @property {"user_event"} user_event
 * @property {"direct_message_events"} direct_message_events
 * @property {"direct_message_indicate_typing_events"} direct_message_indicate_typing_events
 * @property {"direct_message_mark_read_events"} direct_message_mark_read_events
 * @property {"tweet_delete_events"} tweet_delete_events
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
