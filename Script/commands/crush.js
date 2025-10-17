module.exports.config = {
  name: "crush",
  version: "7.3.1",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Get Pair From Mention",
  commandCategory: "love",
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
  const path = resolve(__dirname, 'cache/canvas', 'crush.png');
  if (!existsSync(dirMaterial + "canvas")) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(path)) await downloadFile("https://i.imgur.com/PlVBaM1.jpg", path);
};

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  let batgiam_img = await jimp.read(__root + "/crush.png");
  let pathImg = __root + `/batman${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));
  batgiam_img.composite(circleOne.resize(191, 191), 93, 111).composite(circleTwo.resize(190, 190), 434, 107);

  let raw = await batgiam_img.getBufferAsync("image/png");

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

const crushCaptions = [
  "প্রেমে যদি অপূর্ণতাই সুন্দর হয়, তবে পূর্ণতার সৌন্দর্য কোথায়?❤️",
  "যদি বৃষ্টি হতাম… তোমার দৃষ্টি ছুঁয়ে দিতাম! চোখে জমা বিষাদটুকু এক নিমেষে ধুয়ে দিতাম🤗",
  "তোমার ভালোবাসার প্রতিচ্ছবি দেখেছি বারে বার💖",
  "তোমার সাথে একটি দিন হতে পারে ভালো, কিন্তু তোমার সাথে সবগুলি দিন হতে পারে ভালোবাসা🌸",
  "এক বছর নয়, কয়েক জন্ম শুধু তোমার প্রেমে পরতে পরতে ই চলে যাবে😍",
  "কেমন করে এই মনটা দেব তোমাকে… বেসেছি যাকে ভালো আমি, মন দিয়েছি তাকে🫶",
  "পিছু পিছু ঘুরলে কি আর প্রেম হয়ে যায়… কাছে এসে বাসলে ভালো, মন পাওয়া যায়❤️‍🩹",
  "তুমি থাকলে নিজেকে এমন সুখী মনে হয়, যেনো আমার জীবনে কোনো দুঃখই নেই😊",
  "তোমার হাতটা ধরতে পারলে মনে হয় পুরো পৃথিবীটা ধরে আছি🥰",
  "তোমার প্রতি ভালো লাগা যেনো প্রতিনিয়ত বেড়েই চলছে😘"
];

module.exports.run = async function ({ event, api, args }) {
  const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions);
  if (!mention[0]) return api.sendMessage("একজনকে মেনশন করো!", threadID, messageID);
  else {
    const one = senderID, two = mention[0];
    const caption = crushCaptions[Math.floor(Math.random() * crushCaptions.length)];
    return makeImage({ one, two }).then(path =>
      api.sendMessage({ body: `✧•❁𝐂𝐫𝐮𝐬𝐡❁•✧\n\n${caption}`, attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path), messageID)
    );
  }
};
