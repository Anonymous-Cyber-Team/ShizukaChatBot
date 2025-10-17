module.exports.config = {
    name: "married2",
    version: "3.1.1",
    hasPermssion: 0,
    credits: "—͟͟͞͞𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    description: "married",
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
    const path = resolve(__dirname, 'cache/canvas', 'marriedv3.png');
    if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(path)) await downloadFile("https://i.ibb.co/5TwSHpP/Guardian-Place-full-1484178.jpg", path);
};

async function makeImage({ one, two }) {
    const fs = global.nodemodule["fs-extra"];
    const path = global.nodemodule["path"];
    const axios = global.nodemodule["axios"];
    const jimp = global.nodemodule["jimp"];
    const __root = path.resolve(__dirname, "cache", "canvas");

    let married_img = await jimp.read(__root + "/marriedv3.png");
    let pathImg = __root + `/married_${one}_${two}.png`;
    let avatarOne = __root + `/avt_${one}.png`;
    let avatarTwo = __root + `/avt_${two}.png`;

    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));
    married_img.composite(circleOne.resize(90, 90), 250, 1).composite(circleTwo.resize(90, 90), 350, 70);

    let raw = await married_img.getBufferAsync("image/png");

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

module.exports.run = async function ({ event, api, args }) {
    const fs = global.nodemodule["fs-extra"];
    const { threadID, messageID, senderID } = event;
    const mention = Object.keys(event.mentions || {});

    const captions = [
        "💟ღــ💘তোমার ভালোবাসা, আমার জীবনের সবথেকে বড় উপহার।💘ღــ💟",
        "তোমার চোখে তাকালেই আমার যে একটা পৃথিবীর আছে সেটা আমি সবকিছু ভুলে যাই!💚❤️‍🩹💞",
        "তুমি আমার জীবনের সেই গল্প, যেই গল্প আমি কোন দিন শেষ করতে চাই না!🥰😘🌻",
        "I am so lucky person! তোমার মতো একজন ভালোবাসায়ী মানুষ আমার জীবন সঙ্গী হিসাবে পেয়ে!❤️‍🩹💞🌺",
        "I feel complete in my life, যখন ভাবি তোমার মতো একটা লক্ষ্মী মানুষ আমার জীবন সঙ্গী!💝",
        "তোমাতে শুরু তোমাতেই শেষ, তুমি না থাকলে আমাদের গল্প এখানেই শেষ!🌺",
        "আমি ছিলাম, আমি আছি আমি থাকবো, শুধু তোমারই জন্য!💞",
        "❥💙══ღ══❥তোমাকে জড়িয়ে ধরার সুখ এই পৃথিবীর কোনো কিছু দিয়ে কেনা যায় না প্রিয়তমা।══ღ══❥💙❥",
        "🌻•━এতো ভালোবাসি এতো যারে চাই…মনে হয় নাতো সে যে কাছে নাই!🌻•━",
        "🌼══ღ══❥চলার পথে আমার হাতে তোমার হাতটা গুঁজে দিও, হাঁটতে গিয়ে হোঁচট খেলে আমায় তুমি সামলে নিও।🌼══ღ══❥",
        "💠✦💟✦💠আমার মনে হয় আমার মনের মধ্যে একটা নরম জমিটায়, শুধু তোমার বসবাস।💠✦💟✦💠",
        "আমার জীবনে সুখ-শান্তি লাগবে না, আমি শুধু তোমাকে চাই!🌼"
    ];

    if (!mention[0]) return api.sendMessage("Please mention 1 person.", threadID, messageID);

    const one = senderID, two = mention[0];
    const caption = captions[Math.floor(Math.random() * captions.length)];

    try {
        const path = await makeImage({ one, two });
        return api.sendMessage({
            body: caption,
            attachment: fs.createReadStream(path)
        }, threadID, () => fs.unlinkSync(path), messageID);
    } catch (err) {
        return api.sendMessage("ছবি তৈরি করতে সমস্যা হয়েছে।", threadID, messageID);
    }
};