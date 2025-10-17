module.exports.config = {
 name: "pair",
 version: "1.0.1",
 hasPermssion: 0,
 credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
 description: "Pair two users with a fun compatibility score",
 commandCategory: "Picture",
 cooldowns: 5,
 dependencies: {
 "axios": "",
 "fs-extra": "",
 "jimp": ""
 }
};

module.exports.onLoad = async () => {
 const { resolve } = global.nodemodule["path"];
 const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
 const { downloadFile } = global.utils;
 const dirMaterial = resolve(__dirname, 'cache', 'canvas');
 const path = resolve(dirMaterial, 'pairing.png');
 
 if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
 if (!existsSync(path)) {
 await downloadFile("https://i.postimg.cc/X7R3CLmb/267378493-3075346446127866-4722502659615516429-n.png", path);
 }
};

async function makeImage({ one, two }) {
 const fs = global.nodemodule["fs-extra"];
 const path = global.nodemodule["path"];
 const axios = global.nodemodule["axios"];
 const jimp = global.nodemodule["jimp"];
 const __root = path.resolve(__dirname, "cache", "canvas");
 
 const pairing_img = await jimp.read(__root + "/pairing.png");
 const pathImg = __root + `/pairing_${one}_${two}.png`;
 const avatarOne = __root + `/avt_${one}.png`;
 const avatarTwo = __root + `/avt_${two}.png`;
 
 const getAvatar = async (uid, pathSave) => {
 const res = await axios.get(
 `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
 { responseType: 'arraybuffer' }
 );
 fs.writeFileSync(pathSave, Buffer.from(res.data, 'utf-8'));
 };
 
 await getAvatar(one, avatarOne);
 await getAvatar(two, avatarTwo);
 
 const circleOne = await jimp.read(await circle(avatarOne));
 const circleTwo = await jimp.read(await circle(avatarTwo));
 
 pairing_img
 .composite(circleOne.resize(150, 150), 980, 200)
 .composite(circleTwo.resize(150, 150), 140, 200);
 
 const raw = await pairing_img.getBufferAsync("image/png");
 fs.writeFileSync(pathImg, raw);
 fs.unlinkSync(avatarOne);
 fs.unlinkSync(avatarTwo);
 
 return pathImg;
}

async function circle(image) {
 const jimp = require("jimp");
 image = await jimp.read(image);
 image.circle();
 return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ api, event }) {
 const axios = require("axios");
 const fs = require("fs-extra");
 const { threadID, messageID, senderID } = event;
 
 try {
 const percentages = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', '0%', '48%'];
 const matchRate = percentages[Math.floor(Math.random() * percentages.length)];
 
 const senderInfo = await api.getUserInfo(senderID);
 const senderName = senderInfo[senderID].name;
 
 const threadInfo = await api.getThreadInfo(threadID);
 const participants = threadInfo.participantIDs.filter(id => id !== senderID);
 
 if (participants.length === 0) {
 return api.sendMessage("❌ There's no one else in the chat to pair with!", threadID, messageID);
 }
 
 const partnerID = participants[Math.floor(Math.random() * participants.length)];
 const partnerInfo = await api.getUserInfo(partnerID);
 const partnerName = partnerInfo[partnerID].name;
 
 const mentions = [
 { id: senderID, tag: senderName },
 { id: partnerID, tag: partnerName }
 ];
 
 const path = await makeImage({ one: senderID, two: partnerID });
 
 return api.sendMessage({
 body: `🥰 Successful Pairing!\n💌 Wishing you two a lifetime of unexpected happiness – even with a ${matchRate} match!\n💕 Compatibility Score: ${matchRate}\nUnlikely but Unstoppable: [${senderName} + ${partnerName}] 💑`,
 mentions,
 attachment: fs.createReadStream(path)
 }, threadID, () => fs.unlinkSync(path), messageID);
 
 } catch (err) {
 console.error(err);
 return api.sendMessage("❌ Failed to pair users. Please try again later.", threadID, messageID);
 }
};