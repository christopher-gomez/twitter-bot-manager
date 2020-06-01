<!-- ABOUT THE PROJECT -->
## About The Project

This Node package is a small but powerful tool to bypass the lengthy Twitter bot setup stage and get straight to defining your bot actions. While some initial setup is still required, this package handles the network and bot lifecycle management. 

### Built With

* [Twitter](https://developer.twitter.com/en)
* [Node.js](https://nodejs.org/en/)
* [Express](https://expressjs.com/)
* [ngrok](https://ngrok.com/)


<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

* Node.js
* npm
```sh
npm install npm@latest -g
```
* Twitter Developer Account


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

### Twitter

1. Ensure you have a [Twitter Developer Account](https://developer.twitter.com/en/), if you don't, make one, cause this package is useless without it. 

2. Once you're registered as a developer, [create a new app](https://developer.twitter.com/en/apps/create), you'll need the app keys and tokens later. 
If you want your bot to respond to DMs, ensure your app has Read, Write, and Direct Messages permissions. 

3. Create a [Dev Environment](https://developer.twitter.com/en/account/environments) for the app you just created using the Account Activity API/Sandbox option at the bottom of that page. Ensure the environment is labeled 'dev'. 

### Node

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
import BotServer from 'twitter-bot-manager';

BotServer({
	port: 3000, 
	account: {
		account_name: 'My Bot',
		consumer_key: 'YOUR_TWITTER_APP_CONSUMER_KEY',
		consumer_secret: 'YOUR_TWITTER_APP_CONSUMER_SECRET',
		access_token: 'YOUR_TWITTER_APP_ACCESS_TOKEN',
		access_token_secret: 'YOUR_TWITTER_APP_ACCESS_TOKEN_SECRET',
		actions: (event, oauth) => {
			// A function to handle incoming Twitter events
		},
	}
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
