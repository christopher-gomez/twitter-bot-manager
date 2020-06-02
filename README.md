<!-- ABOUT THE PROJECT -->

## About The Project

This Node package is a small but powerful tool to bypass the lengthy Twitter bot setup stage and get straight to defining your bot actions. While some initial setup is still required, this package handles the network and bot lifecycle management.

### Built With

- [Twitter](https://developer.twitter.com/en)
- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [ngrok](https://ngrok.com/)

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

- Node.js
- npm

```sh
npm install npm@latest -g
```

- Twitter Developer Account

### Installation

Add it to any project or build a new project around it with NPM

1. Install from NPM

```sh
npm i twitter-bot-manager
```

Or download it directly from here and add it to any project, just don't forget to install it's dependencies first.

1. Clone the repo

```sh
git clone https://github.com/christophgomez/twitter-bot-manager.git
```

2. Change directories

```sh
cd twitter-bot-manager
```

3. Install NPM packages

```sh
npm i
```

<!-- USAGE EXAMPLES -->

## Usage

There's more than one way to skin a cat, and there are many ways to use this package.

Here's a small step-by-step to get a simple bot up and running.

#### Step 1: Twitter

1. Ensure you have a [Twitter Developer Account](https://developer.twitter.com/en/), if you don't, make one, cause this package is useless without it.

2. Once you're registered as a developer, [create a new app](https://developer.twitter.com/en/apps/create), you'll need the app keys and tokens later.
   If you want your bot to respond to DMs, ensure your app has Read, Write, and Direct Messages permissions.

3. Create a [Dev Environment](https://developer.twitter.com/en/account/environments) for the app you just created using the Account Activity API/Sandbox option at the bottom of that page. **Ensure the environment is labeled 'dev'.**

#### Step 2: Node

1. Create and initiate a new Node project, follow the npm prompts.

```sh
mkdir my-really-cool-bot-project
cd my-really-cool-bot-project
npm init
```

2. Install the bot-manager package

```sh
npm i twitter-bot-manager
```

3. Setup the bot server in your project's entry file

```node
import TwitterBotServer from "twitter-bot-manager";

TwitterBotServer({
  port: 3000,
  account: {
    account_name: "My Bot",
    consumer_key: "YOUR_TWITTER_APP_CONSUMER_KEY",
    consumer_secret: "YOUR_TWITTER_APP_CONSUMER_SECRET",
    access_token: "YOUR_TWITTER_APP_ACCESS_TOKEN",
    access_token_secret: "YOUR_TWITTER_APP_ACCESS_TOKEN_SECRET",
  },
});
```

4. Run your file, if your entry file is index.js, for example:

```sh
node index.js
```

The package should handle registering your bot with the Twitter servers, and if all went well, you should see a final output of:

```
Waiting to receive and process [bot account_name]'s account events...
```

#### Bot eventActions

This is where the magic happens. To make your bot actually do things, you must define that behavior in the eventActions function parameter. Whenever your bot's account receives an event, it will go through this function, and your bot will act accordingly.

Let's break it down a little. You can define the function wherever you'd like; in the object itself, at the top of the file, or if the function start's to get very large, maybe in it's own file for better maintainability. For now, lets define it within the object itself:

```node
TwitterBotServer({
  port: 3000,
  account: {
    account_name: "My Bot",
    consumer_key: "YOUR_TWITTER_APP_CONSUMER_KEY",
    consumer_secret: "YOUR_TWITTER_APP_CONSUMER_SECRET",
    access_token: "YOUR_TWITTER_APP_ACCESS_TOKEN",
    access_token_secret: "YOUR_TWITTER_APP_ACCESS_TOKEN_SECRET",
    eventActions: (event, oauth) => {
      console.log("Incoming event for My Bot");
      console.log(event);
    },
  },
});
```

Whenever that account receives an event, the server will simply log the event. I'm currently in the process of documenting all possible events and creating an easy access object for those, so for now, logging the event to see what kind it is, and what it contains, may be useful. Let's expand on this:

```node
(event, oauth) => {
  console.log("Incoming event for My Bot");
  console.log(event);
  switch (true) {
    case "tweet_create_events" in event:
      break;
    case "favorite_events" in event:
      break;
    case "follow_events" in event:
      break;
    case "unfollow_events" in event:
      break;
    case "block_events" in event:
      break;
    case "unblock_events" in event:
      break;
    case "mute_events" in event:
      break;
    case "unmute_events" in event:
      break;
    case "user_event" in event:
      break;
    case "direct_message_events" in event:
      break;
    case "direct_message_indicate_typing_events" in event:
      break;
    case "direct_message_mark_read_events" in event:
      break;
    case "tweet_delete_events" in event:
      break;
  }
};
```

Now, depending on the type of event your bot receives, you can do something accordingly.

##### What's that second parameter, `oauth`, for?

If you want to make your bot do something Twitter-y, use that parameter to make a call to the [Twitter API](https://developer.twitter.com/en/docs/api-reference-index).

You can use the inluded API object, it's still a work in progress, and requires more function definitions for all the API endpoints, so any contributions to that are welcome.

Here's an example of getting all user tweets from someone who favorited one of your bot's tweets _(Tip: You can mark the event handler async)_

```node
import { TwitterAPI } from "twitter-bot-manager";

async (event, oauth) => {
  console.log("Incoming event for My Bot");
  console.log(event);

  const api = new TwitterAPI(oauth);

  switch (true) {
    case "favorite_events" in event:
      event = event.favorite_events[0];
      console.log("Getting user " + event.user.id + "'s tweets...");
      const tweets = api.getAllUserTweets(event.user.id);
      console.log("Number of tweets imported: " + tweets.length);
      console.log(tweets);
      break;
  }
};
```

All in all, your entry file could end up looking something like this:

```node
import TwitterBotServer, { TwitterAPI } from "twitter-bot-manager";

TwitterBotServer({
  port: 3000,
  account: {
    account_name: "My Bot",
    consumer_key: "YOUR_TWITTER_APP_CONSUMER_KEY",
    consumer_secret: "YOUR_TWITTER_APP_CONSUMER_SECRET",
    access_token: "YOUR_TWITTER_APP_ACCESS_TOKEN",
    access_token_secret: "YOUR_TWITTER_APP_ACCESS_TOKEN_SECRET",
    eventActions: async (event, oauth) => {
      console.log("Incoming event for My Bot");
      console.log(event);

      const api = new TwitterAPI(oauth);

      switch (true) {
        case "direct_message_events" in event:
          event = event.favorite_events[0];
          console.log("Getting user " + event.user.id + "'s tweets...");
          const tweets = await api.getAllUserTweets(event.user.id, oauth);
          console.log("Number of tweets imported: " + tweets.length);
          console.log(tweets);
          break;
      }
    },
  },
});
```

But this will definitely become unmaintanable, so I suggest writing your action function in a different file and importing it.

#### Bot Jobs

You can also specify any number of jobs when creating your bot, these jobs will run at the provided interval. **The interval _must_ be valid cron syntax.**

```node
TwitterBotServer({
  port: 3000,
  account: {
    account_name: "My Bot",
    consumer_key: "YOUR_TWITTER_APP_CONSUMER_KEY",
    consumer_secret: "YOUR_TWITTER_APP_CONSUMER_SECRET",
    access_token: "YOUR_TWITTER_APP_ACCESS_TOKEN",
    access_token_secret: "YOUR_TWITTER_APP_ACCESS_TOKEN_SECRET",
    jobs: [
      {
        interval: "* * * * *",
        jobAction: (oauth) => {
          // A job that will run every minute
        },
      },
      {
        interval: "*/2 * * * * ",
        jobAction: (oauth) => {
          // A job that will run every minute
        },
      },
    ],
  },
});
```

Again, you have access to the bot's `oauth` token in this function, so you can make requests to Twitter API if you please.

#### Manage Multiple Bots

This package's true power comes from the fact that it allows you to spin up and manage multiple bots at once. Here's how to do that.

```node
import TwitterBotServer, { TwitterBotManager } from "twitter-bot-manager";

const accounts = {
  firstBot: {
    account_name: "My First Bot",
    consumer_key: "FIRST_BOT_APP_CONSUMER_KEY",
    consumer_secret: "FIRST_BOT_APP_CONSUMER_SECRET",
    access_token: "FIRST_BOT_APP_ACCESS_TOKEN",
    access_token_secret: "FIRST_BOT_APP_ACCESS_TOKEN_SECRET",
    eventActions: (event, oauth) => {
      // A function to handle incoming Twitter events
    },
    jobs: [
      {
        interval: "* * * * *",
        jobAction: (oauth) => {
          // A job that will run every minute
        },
      },
    ],
  },
  secondBot: {
    account_name: "My Second Bot",
    consumer_key: "SECOND_BOT_APP_CONSUMER_KEY",
    consumer_secret: "SECOND_BOT_APP_CONSUMER_SECRET",
    access_token: "SECOND_BOT_APP_ACCESS_TOKEN",
    access_token_secret: "SECOND_BOT_ACCESS_TOKEN_SECRET",
    eventActions: (event, oauth) => {
      // A function to handle incoming Twitter events
    },
    jobs: [
      {
        interval: "* * * * *",
        jobAction: (oauth) => {
          // A job that will run every minute
        },
      },
    ],
  },
};

TwitterBotServer({
  port: 3000,
  botManager: new TwitterBotManager(accounts),
});
```

If you want to keep references to the bots and manager you can do that too:

```node
import TwitterBotServer, {
  TwitterBotManager,
  TwitterBot,
} from "twitter-bot-manager";

const firstBot = new TwitterBot({
  account_name: "My First Bot",
  consumer_key: "FIRST_BOT_APP_CONSUMER_KEY",
  consumer_secret: "FIRST_BOT_APP_CONSUMER_SECRET",
  access_token: "FIRST_BOT_APP_ACCESS_TOKEN",
  access_token_secret: "FIRST_BOT_APP_ACCESS_TOKEN_SECRET",
  eventActions: (event, oauth) => {
    // A function to handle incoming Twitter events
  },
  jobs: [
    {
      interval: "* * * * *",
      jobAction: (oauth) => {
        // A job that will run every minute
      },
    },
  ],
});

const secondBot = new TwitterBot({
  account_name: "My Second Bot",
  consumer_key: "SECOND_BOT_APP_CONSUMER_KEY",
  consumer_secret: "SECOND_BOT_APP_CONSUMER_SECRET",
  access_token: "SECOND_BOT_APP_ACCESS_TOKEN",
  access_token_secret: "SECOND_BOT_ACCESS_TOKEN_SECRET",
  eventActions: (event, oauth) => {
    // A function to handle incoming Twitter events
  },
  jobs: [
    {
      interval: "* * * * *",
      jobAction: (oauth) => {
        // A job that will run every minute
      },
    },
  ],
});

const bots = { firstBot, secondBot };
const manager = new TwitterBotManager(bots);

TwitterBotServer({
  port: 3000,
  botManager: manager,
});
```

#### Protect your keys

Seriously, protect your keys!! All the examples have been written with the keys directly pasted into the code, but you shouldn't do that, unless you want your keys stolen and your bot hacked, especially if your project is going to be committed to GitHub or deployed to the web.

Instead, you should create some sort of .env or a keys file that will be added to your .gitignore!

Obviously, the key's file will never be committed, so you'd only use that locally, and in a production environment, you'd be forced to use environment vars.

For example:

```node
import TwitterBotServer, { TwitterBot } from "twitter-bot-manager";

const accountName = "MyFirstBot";
const eventActions = (event, oauth) => {
  console.log("Incoming event for " + accountName);
  console.log(event);
};
let account;

if (process.env.NODE_ENV === "production") {
  account = new TwitterBot({
    account_name: accountName,
    consumer_key: process.env[accountName + "_consumer_key"],
    consumer_secret: process.env[accountName + "_consumer_secret"],
    access_token: process.env[accountName + "_access_token"],
    access_token_secret: process.env[accountName + "_access_token_secret"],
    eventActions: eventActions,
  });
} else {
  const keys = require("./keys").default;

  account = new TwitterBot({
    account_name: accountName,
    consumer_key: keys[accountName]["consumer_key"],
    consumer_secret: keys[accountName]["consumer_secret"],
    access_token: keys[accountName]["access_token"],
    access_token_secret: keys[accountName]["access_token_secret"],
    eventActions: eventActions,
  });
}

TwitterBotServer({
  port: 3000,
  account,
});
```

Where keys.js is:

```node
const keys = {
  MyFirstBot: {
    consumer_key: "",
    consumer_secret: "",
    access_token: "",
    access_token_secret: "",
  },
};

export default keys;
```

<!-- _For more examples, please refer to the [Documentation](https://example.com)_ -->

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/christophgomez/twitter-bot-manager/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.
