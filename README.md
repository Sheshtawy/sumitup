# sumitup
a web task to summarize your team git activity.

## Setup
1. Clone the repo and run `npm install` to download the dependencies

2. Add the following values to your secrets using the secret file or the web editor:
    - `api_token`: github api token that you can [generate here](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/).
    - `api_endpoint`: api.github.com
    - `api_header`: `application/vnd.github.v3+json`

3. Build the webtask file to be compile the ES6 code to an older version
    ```
    $ npm run build
    ```

4. Create a webtask the the cli tool or the web app. [Check this for help](https://webtask.io/docs/101)
    ```
    $ wt create --secrets-file=PATH/TO/SECRET-FILE --name=sumitup ./build/webtask.js --dependency=lodash@4.17.4 --dependency=github@11.0.0
    ```
5. Sync the webtask you created with the **compiled** file
6. Try it on!
    ```
    $ curl https://wt-087be8e65ecf52ef9e58757476803c59-0.run.webtask.io/sumitup?orgName=google | json_pp
    ```

## Slack Setup
In order to install sumitup as a slack slash command you need to do the following:
1. Follow [this guide](https://api.slack.com/slash-commands) to add a slash command to your slack workspace
2. use the webtask url as your 'Request URL`
3. Add slack verification token to your secrets
4. Enjoy!
