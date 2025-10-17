module.exports.config = {
 name: "hug",
 version: "7.3.1",
 hasPermssion: 0,
 credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
 description: "hug frame create",
 commandCategory: "img",
 usages: "[@mention]",
 cooldowns: 5,
 dependencies: {
 "axios": "",
 "fs-extra": "",
 "path": "",
 "jimp": ""
 }
};

module.exports.onLoad = async () => {
 const { resolve } = global.nodemodule["path"];
 const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
 const { downloadFile } = global.utils;
 const dirMaterial = __dirname + `/cache/canvas/`;
 const path = resolve(__dirname, 'cache/canvas', 'hugv3.png');
 if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
 if (!existsSync(path)) await downloadFile("https://i.imgur.com/7lPqHjw.jpg", path);
};

async function circle(image) {
 const jimp = require("jimp");
 image = await jimp.read(image);
 image.circle();
 return await image.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
 const fs = global.nodemodule["fs-extra"];
 const path = global.nodemodule["path"];
 const axios = global.nodemodule["axios"];
 const jimp = global.nodemodule["jimp"];
 const __root = path.resolve(__dirname, "cache", "canvas");
 const bgPath = __root + "/hugv3.png";
 const pathImg = __root + `/hug_${one}_${two}.png`;
 const avatarOne = __root + `/avt_${one}.png`;
 const avatarTwo = __root + `/avt_${two}.png`;

 const getAvatar = async (id, path) => {
 const response = await axios.get(
 `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
 { responseType: 'arraybuffer' }
 );
 fs.writeFileSync(path, Buffer.from(response.data, 'utf-8'));
 };

 await getAvatar(one, avatarOne);
 await getAvatar(two, avatarTwo);

 const baseImg = await jimp.read(bgPath);
 const circleOne = await jimp.read(await circle(avatarOne));
 const circleTwo = await jimp.read(await circle(avatarTwo));

 baseImg.composite(circleOne.resize(220, 220), 200, 50);
 baseImg.composite(circleTwo.resize(220, 220), 490, 200);

 const raw = await baseImg.getBufferAsync("image/png");
 fs.writeFileSync(pathImg, raw);
 fs.unlinkSync(avatarOne);
 fs.unlinkSync(avatarTwo);
 return pathImg;
}

module.exports.run = async function ({ event, api, args }) {
 const fs = global.nodemodule["fs-extra"];
 const { threadID, messageID, senderID } = event;
 const mention = Object.keys(event.mentions);

 if (mention.length !== 1)
 return api.sendMessage("আরে বলদ একজনকে মেনশন করে🤧🤣", threadID, messageID);

 const captions = [
 "❝ যদি কখনো অনুভূতি হয়, তাহলে তোমার প্রতি আমার অনুভূতি পৃথিবীর সেরা অনুভূতি!🌻",
 "❝ তুমি আমার জীবনের সেরা অধ্যায়, যেই অধ্যায় বারবার পড়তে ইচ্ছে করে!💝",
 "❝ তোমার ভালোবাসার মূল্য আমি কিভাবে দেবো, তা আমার জানা নেই, শুধু জানি প্রথম থেকে যে ভাবে ভালোবেসেছিলাম💜 সেভাবেই ভালোবেসে যাবো!🥰",
 "❝ আমি প্রেমে পড়ার আগে তোমার মায়ায় জড়িয়ে গেছি, যে মায়া নেশার মতো, আমি চাইলে তোমার নেশা কাটিয়ে উঠতে পারি না!💝",
 "❝ তোমাকে চেয়েছিলাম, আর তোমাকেই চাই, তুমি আমার ভালোবাসা🖤 তুমি আমার বেঁচে থাকার কারণ!💞",
 "❝ আমার কাছে তোমাকে ভালোবাসার কোনো সংজ্ঞা নেই, তোমাকে ভালোবেসে যাওয়া হচ্ছে আমার নিশ্চুপ অনুভূতি!❤️",
 "❝ তুমি আমার জীবনের সেই গল্প, যা পড়তে গিয়ে প্রতিবারই নতুন কিছু আবিষ্কার করি!💚",
 "❝ আমার মনের গহীনে বাস করা রাজকন্যা তোমাকে অনেক ভালোবাসি।❤️‍🩹",
 "❝ I feel complete in my life, যখন ভাবি তোমার মতো একটা লক্ষ্মী মানুষ আমার জীবন সঙ্গী!🌺"
 ];

 try {
 const path = await makeImage({ one: senderID, two: mention[0] });
 const caption = captions[Math.floor(Math.random() * captions.length)];
 return api.sendMessage(
 {
 body: caption,
 attachment: fs.createReadStream(path)
 },
 threadID,
 () => fs.unlinkSync(path),
 messageID
 );
 } catch (e) {
 console.error(e);
 return api.sendMessage("❌ Failed to generate hug image.", threadID, messageID);
 }
};