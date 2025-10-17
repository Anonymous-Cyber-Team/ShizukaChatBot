const fs = require("fs");
const request = require("request");

let lastPlayed = -1;

module.exports.config = {
 name: "gan",
 version: "1.0.0",
 hasPermission: 0,
 credits: "Shahadat Islam",
 description: "Play random song with prefix command",
 commandCategory: "music",
 usages: "[prefix]gan",
 cooldowns: 5
};

const songLinks = [
 "https://drive.google.com/uc?export=download&id=1X_J00k_go_u3MKqKwvZOcypQ-dL6DMAm",
 "https://drive.google.com/uc?export=download&id=1nLq8wKxcxK6nb-8SmJ1nPxNHx9Fzabr8",
 "https://drive.google.com/uc?export=download&id=1w972wKW72haSYHhcIZ_CIpRRv0UAf5TS",
 "https://drive.google.com/uc?export=download&id=1KLAtG03-O7GObVSo7YhkUd84tSTXQOL7",
 "https://drive.google.com/uc?export=download&id=1a3qcxjTi6W6wL4vItVY-SZ7aRpJISpLC",
 "https://drive.google.com/uc?export=download&id=1R2thfTrK3Xk842axn1mPrJ8AdPh8xpLf",
 "https://drive.google.com/uc?export=download&id=1nde8BkUjfD7F5fAM6WvAj6usHGjra4Ln",
 "https://drive.google.com/uc?export=download&id=1JVrIeRhhLUg-qOkRzvZCtI-CGrdfrHvq",
 "https://drive.google.com/uc?export=download&id=1uObNiYcCBbpTNZejRYavBKZGlclD2k3v",
 "https://drive.google.com/uc?export=download&id=1FN1kr3jma9i8opILdeMpH67lHjeJ3NIT",
 "https://drive.google.com/uc?export=download&id=1V2wYr_sGIBckvVrwGmpQXoZ_bj1jR6DY",
 "https://drive.google.com/uc?export=download&id=1FsQbt14Jw7gpvaabkBSgJDCefMLU8Pxq",
 "https://drive.google.com/uc?export=download&id=1ylJsOdaJ53GDITZ6_X-ET5PdnFAW93g1",
 "https://drive.google.com/uc?export=download&id=1Gj7ls2QwDmM-3nN7AXUxPPcGV8hdm59w"
];

module.exports.run = async function ({ api, event, args }) {
 const { threadID, messageID } = event;

 if (songLinks.length === 0) {
 return api.sendMessage("❌ No songs available in the list!", threadID, messageID);
 }

 // Set reaction to indicate processing
 api.setMessageReaction("⌛", messageID, () => {}, true);

 // Select a random song (different from last played)
 let index;
 do {
 index = Math.floor(Math.random() * songLinks.length);
 } while (index === lastPlayed && songLinks.length > 1);

 lastPlayed = index;
 const url = songLinks[index];
 const filePath = `${__dirname}/cache/mysong_${index}.mp3`;

 // Download and send the song
 request(encodeURI(url))
 .pipe(fs.createWriteStream(filePath))
 .on("close", () => {
 api.sendMessage({
 body: "🎶 Here's your requested song:",
 attachment: fs.createReadStream(filePath)
 }, threadID, () => {
 // Delete the file after sending
 try {
 fs.unlinkSync(filePath);
 } catch (err) {
 console.error("Error deleting file:", err);
 }
 }, messageID);
 })
 .on("error", (err) => {
 console.error("Download error:", err);
 api.sendMessage("❌ Failed to download the song. Please try again later.", threadID, messageID);
 });
};