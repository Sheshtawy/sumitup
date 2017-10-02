# sumitup
A webtask to summarize your team git activity.

**Sumitup** helps team leaders (and members) to keep track of their organization progress during the day. It collects updates about repositories, issues and pull requests and compile a little summary about the progress of the team.

![](https://i.imgur.com/UoJiMQR.gifv)

## Setup
1. Clone the repo and run `npm install` to download the dependencies.

2. Add the following values to your secrets using the secret file or the web editor:
    - `api_token`: github api token that you can [generate here](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/).
    - `api_endpoint`: api.github.com
    - `api_header`: `application/vnd.github.v3+json`

3. Build the webtask file to be compiled the ES6 code to an older version.
    ```
    $ npm run build
    ```

4. Create a webtask using the cli tool or the web app. [Check this link for help](https://webtask.io/docs/101).
    ```
    $ wt create --secrets-file=PATH/TO/SECRET-FILE --name=sumitup ./build/webtask.js --dependency=lodash@4.17.4 --dependency=github@11.0.0
    ```
5. Try it out!
    ```
    $ curl https://<your-profile-url>.run.webtask.io/sumitup?orgName=google | json_pp
    ```

## Slack Setup
In order to install sumitup as a Slack slash command you need to do the following:
1. Follow [this guide](https://api.slack.com/slash-commands) to add a slash command to your slack workspace.
2. Use the webtask url as your 'Request URL'.
3. Add the Slack verification token to your secrets.
4. Enjoy!
