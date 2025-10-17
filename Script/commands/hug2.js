const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports.config = {
 name: "hug2",
 version: "3.1.2",
 hasPermssion: 0,
 credits: "𝐒𝐡𝐚𝐡𝐚𝐝𝐚𝐭 𝐒𝐀𝐇𝐔",
 description: "hug frame generat",
 commandCategory: "img",
 usages: "[@mention]",
 cooldowns: 5
};

module.exports.onLoad = async () => {
 const dir = path.join(__dirname, "cache", "canvas");
 const filePath = path.join(dir, "hugv2.png");
 if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
 if (!fs.existsSync(filePath)) {
 const imgURL = "https://i.ibb.co/zRdZJzG/1626342271-28-kartinkin-com-p-anime-obnimashki-v-posteli-anime-krasivo-30.jpg";
 const imgData = (await axios.get(imgURL, { responseType: "arraybuffer" })).data;
 fs.writeFileSync(filePath, Buffer.from(imgData));
 }
};

async function circle(imagePath) {
 const img = await jimp.read(imagePath);
 img.circle();
 return await img.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
 const dir = path.join(__dirname, "cache", "canvas");
 const bg = await jimp.read(path.join(dir, "hugv2.png"));
 const pathImg = path.join(dir, `hug2_${one}_${two}.png`);
 const avatarOnePath = path.join(dir, `avt_${one}.png`);
 const avatarTwoPath = path.join(dir, `avt_${two}.png`);

 const getAvatar = async (uid, filePath) => {
 const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
 const avatarData = (await axios.get(url, { responseType: 'arraybuffer' })).data;
 fs.writeFileSync(filePath, Buffer.from(avatarData));
 };

 await getAvatar(one, avatarOnePath);
 await getAvatar(two, avatarTwoPath);

 const circleOne = await jimp.read(await circle(avatarOnePath));
 const circleTwo = await jimp.read(await circle(avatarTwoPath));

 bg.composite(circleOne.resize(100, 100), 370, 40)
 .composite(circleTwo.resize(100, 100), 330, 150);

 const finalBuffer = await bg.getBufferAsync("image/png");
 fs.writeFileSync(pathImg, finalBuffer);
 fs.unlinkSync(avatarOnePath);
 fs.unlinkSync(avatarTwoPath);

 return pathImg;
}

module.exports.run = async function ({ event, api }) {
 const { threadID, messageID, senderID, mentions } = event;
 const mention = Object.keys(mentions);
 if (!mention[0]) {
 return api.sendMessage("please mention 1 paeson!", threadID, messageID);
 }

 const one = senderID, two = mention[0];

 const captions = [
 "ভালোবাসা যদি কোনো অনুভূতি হয়, তাহলে তোমার প্রতি আমার অনুভূতি পৃথিবীর সেরা অনুভূতি!🌺",
 "তুমি আমার জীবনের সেরা অধ্যায়, যেই অধ্যায় বারবার পড়তে ইচ্ছে করে!😘",
 "তোমার ভালোবাসার মূল্য আমি কিভাবে দেবো, তা আমার জানা নেই, শুধু জানি প্রথম থেকে যে ভাবে ভালোবেসেছিলাম💜 সেভাবেই ভালোবেসে যাবো!🫶",
 "আমি প্রেমে পড়ার আগে তোমার মায়ায় জড়িয়ে গেছি, যে মায়া নেশার মতো, আমি চাইলে তোমার নেশা কাটিয়ে উঠতে পারি না!💞",
 "তোমাকে চেয়েছিলাম, আর তোমাকেই চাই, তুমি আমার ভালোবাসা🖤 তুমি আমার বেঁচে থাকার কারণ!🥰",
 "আমার কাছে তোমাকে ভালোবাসার কোনো সংজ্ঞা নেই, তোমাকে ভালোবেসে যাওয়া হচ্ছে আমার নিশ্চুপ অনুভূতি!😍",
 "তুমি আমার জীবনের সেই গল্প, যা পড়তে গিয়ে প্রতিবারই নতুন কিছু আবিষ্কার করি!🌻",
 "আমার মনের গহীনে বাস করা রাজকন্যা তোমাকে অনেক ভালোবাসি।❤️‍🩹",
 "I feel complete in my life, যখন ভাবি তোমার মতো একটা লক্ষ্মী মানুষ আমার জীবন সঙ্গী!🌺",
 "যে তোমার ভাবনার সাথে মিলে যায়, তাকে কখনো ছেড়ে দিও না 🤗 এমন মানুষ সবার জীবনে আসে না!😘",
 "তোমার একটুকরো ভালোবাসায় আমি পুরোটা জীবন কেটে দিতে পারি!💜",
 "তোমার হাসিতে যেন আমার পৃথিবী থেমে যায়!😊",
 "তুমি শুধু একজন মানুষ নও, তুমি আমার অনুভব, আমার মন!🖤",
 "তুমি আমার সবকিছু, আমার আজ, আমার আগামী!❤️‍🔥",
 "তোমার চোখে চোখ রাখলেই সব ব্যথা ভুলে যাই!😘"
 ];

 const caption = captions[Math.floor(Math.random() * captions.length)];

 try {
 const imagePath = await makeImage({ one, two });
 return api.sendMessage({
 body: caption,
 attachment: fs.createReadStream(imagePath)
 }, threadID, () => fs.unlinkSync(imagePath), messageID);
 } catch (e) {
 console.error(e);
 return api.sendMessage("❌ ছবিটি তৈরি করতে সমস্যা হয়েছে!", threadID, messageID);
 }
};