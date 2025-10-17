module.exports.config = {
 name: "autoreact",
 version: "1.1.1",
 hasPermission: 0,
 credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
 description: "Bot React",
 commandCategory: "No Prefix",
 cooldowns: 0,
};

module.exports.handleEvent = async ({ api, event }) => {
 const threadData = global.data.threadData.get(event.threadID) || {};
 if (threadData["🥰"] === false) return; // Auto-react off

 const emojis = ["🥰", "😗", "🍂", "💜", "☺️", "🖤", "🤗", "😇", "🌺", "🥹", "😻", "😘", "🫣", "😽", "😺", "👀", "❤️", "🧡", "💛", "💚", "💙", "💜", "🤎", "🤍", "💫", "💦", "🫶", "🫦", "👄", "🗣️", "💏", "👨‍👩‍👦‍👦", "👨‍👨‍👦", "😵", "🥵", "🥶", "🤨", "🤐", "🫡", "🤔"];
 const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

 console.log(`Reacting with ${randomEmoji} to message ${event.messageID}`); // Debug log

 api.setMessageReaction(randomEmoji, event.messageID, (err) => {
 if (err) console.error("Error sending reaction:", err);
 }, true);
};

module.exports.run = async ({ api, event, Threads, getText }) => {
 const { threadID, messageID } = event;
 const threadData = await Threads.getData(threadID);
 
 if (typeof threadData.data["🥰"] === "undefined") {
 threadData.data["🥰"] = true; // Default to "on"
 } else {
 threadData.data["🥰"] = !threadData.data["🥰"]; // Toggle
 }

 await Threads.setData(threadID, { data: threadData.data });
 global.data.threadData.set(threadID, threadData.data);

 api.sendMessage(
 `Auto-react is now ${threadData.data["🥰"] ? "ON 🟢" : "OFF 🔴"}`,
 threadID,
 messageID
 );
};