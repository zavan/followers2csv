# Followers to CSV

This is a simple script that uses the Twitter API to fetch data about a user's followers and save it to a CSV file.

## How to use

1. You will need credentials for the Twitter API, once you have them, copy the `.env.example` file to `.env` and fill it with you credentials. Fill `SCREEN_NAME` with the username and `OUTPUT_PATH` with an absolute path where to save the CSV file.
2. Install the dependencies with `npm install` or `yarn install`.
3. Run `node index.js` and... wait.

Note: If the user has a lot of followers, it's possible that the script will run into an API rate limit and have to wait for around 15 minutes before continuing. Don't worry, it does this automatically and will tell you about it.

## CSV file fields

ID: Internal Twitter user ID.
NAME: User display name.
USER: Twitter username (handle, @).
FOLLOWED: True if the user owner of the API keys follows this user.
FOLLOWERS: How many accounts follow the user.
FOLLOWING: How many accounts the user follows.
LISTED: How many lists the user is listed on.
FAVOURITES: How many tweets the user has favorited.
STATUSES: How many times the user has tweeted.
CREATED_AT: Date and time of creation of the user account.
PROFILE_IMAGE: URL of the user's profile image.
