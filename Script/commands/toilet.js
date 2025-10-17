module.exports.config = {
 'name': "toilet",
 'version': "1.0.0",
 'permission': 0,
 'credits': "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
 'description': " ",
 'prefix': true,
 'category': "user",
 'commandCategory': "user",
 'usages': '@',
 'cooldowns': 5,
 'dependencies': {
 'fs-extra': '',
 'axios': '',
 'canvas': '',
 'jimp': '',
 'node-superfetch': ''
 }
};

module.exports.onLoad = async () => {
 const { resolve } = global.nodemodule.path;
 const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
 const { downloadFile } = global.utils;
 
 const cacheDir = __dirname + "/cache/";
 const toiletImagePath = resolve(__dirname, "cache", "toilet.png");
 
 if (!existsSync(cacheDir)) {
 mkdirSync(cacheDir, { 'recursive': true });
 }
 
 if (!existsSync(toiletImagePath)) {
 await downloadFile("https://drive.google.com/uc?id=13ZqFryD-YY-JTs34lcy6b_w36UCCk0EI&export=download", toiletImagePath);
 }
};

async function makeImage({ one: senderID, two: mentionedID }) {
 const fs = global.nodemodule["fs-extra"];
 const path = global.nodemodule.path;
 const axios = global.nodemodule.axios;
 const jimp = global.nodemodule.jimp;
 
 const cachePath = path.resolve(__dirname, "cache");
 let toiletImage = await jimp.read(cachePath + "/toilet.png");
 
 let outputPath = cachePath + `/toilet_${senderID}_${mentionedID}.png`;
 let senderAvatarPath = cachePath + `/avt_${senderID}.png`;
 let mentionedAvatarPath = cachePath + `/avt_${mentionedID}.png`;
 
 // Get sender's avatar
 let senderAvatar = (await axios.get(
 `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
 { 'responseType': "arraybuffer" }
 )).data;
 fs.writeFileSync(senderAvatarPath, Buffer.from(senderAvatar, "utf-8"));
 
 // Get mentioned user's avatar
 let mentionedAvatar = (await axios.get(
 `https://graph.facebook.com/${mentionedID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
 { 'responseType': "arraybuffer" }
 )).data;
 fs.writeFileSync(mentionedAvatarPath, Buffer.from(mentionedAvatar, "utf-8"));
 
 // Process avatars and composite onto toilet image
 let senderCircular = await jimp.read(await circle(senderAvatarPath));
 let mentionedCircular = await jimp.read(await circle(mentionedAvatarPath));
 
 toiletImage.resize(292, 345)
 .composite(senderCircular.resize(70, 70), 100, 200)
 .composite(mentionedCircular.resize(70, 70), 100, 200);
 
 let finalImage = await toiletImage.getBufferAsync("image/png");
 fs.writeFileSync(outputPath, finalImage);
 
 // Clean up temporary files
 fs.unlinkSync(senderAvatarPath);
 fs.unlinkSync(mentionedAvatarPath);
 
 return outputPath;
}

async function circle(imagePath) {
 const jimp = require("jimp");
 imagePath = await jimp.read(imagePath);
 imagePath.circle();
 return await imagePath.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api, args, Currencies }) {
 const fs = global.nodemodule["fs-extra"];
 const randomPercent = Math.floor(Math.random() * 101);
 const randomAmount = Math.floor(Math.random() * 100000) + 100000;
 
 const { threadID, messageID, senderID } = event;
 const mentionedIDs = Object.keys(event.mentions);
 var mentionedID = mentionedIDs[0];
 
 // Give random money to sender
 await Currencies.increaseMoney(event.senderID, parseInt(randomPercent * randomAmount));
 
 if (!mentionedID) {
 return api.sendMessage("Please tag 1 person", threadID, messageID);
 } else {
 return makeImage({
 'one': senderID,
 'two': mentionedID
 }).then(outputPath => api.sendMessage({
 'body': "বেশি বাল পাকলামির জন্য তোরে টয়লেটে ফেলে দিলাম🤣🤮",
 'attachment': fs.createReadStream(outputPath)
 }, threadID, () => fs.unlinkSync(outputPath), messageID));
 }
};