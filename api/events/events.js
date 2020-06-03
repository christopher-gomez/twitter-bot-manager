/**
 * @typedef {{tweet_create_events?: string,
   favorite_events?: string,
   follow_events?: string,
   unfollow_events?: string,
   block_events?: string,
   unblock_events?: string,
   mute_events?: string,
   unmute_events?: string,
   user_event?: string,
   direct_message_events?: string,
   direct_message_indicate_typing_events?: string,
   direct_message_mark_read_events?: string,
   tweet_delete_events?: string}} event
 */

const events = {
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

export default events