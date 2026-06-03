import "dotenv/config";

import { google } from "googleapis";
import readline from "readline";

const prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/calendar"],
});

console.log("Visit this URL to authorize the app:");
console.log(authUrl);

prompt.question("Paste the code query parameter from the redirect URL: ", (code) => {
  prompt.close();

  oauth2Client.getToken(code, (error, tokens) => {
    if (error) {
      console.error("Error retrieving access token:", error);
      return;
    }

    console.log("Tokens received.");
    console.log("Access Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token);

    if (!tokens.refresh_token) {
      console.warn("No refresh token received. Remove previous app permissions and try again.");
    }

    console.log("Add this value to your local .env file:");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token ?? ""}`);
  });
});
