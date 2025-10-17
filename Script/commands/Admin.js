const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports.config = {
 name: "admin",
 version: "1.0.0",
 hasPermssion: 0,
 credits: "𝐒𝐡𝐚𝐡𝐚𝐝𝐚𝐭 𝐈𝐬𝐥𝐚𝐦",
 description: "Show Owner Info",
 commandCategory: "info",
 usages: "admin",
 cooldowns: 2
};

module.exports.run = async function({ api, event }) {
 const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm:ss A");

 const callback = () =>
   api.sendMessage(
     {
       body: `

┌───────────────⭓
│𝗢𝗪𝗡𝗘𝗥 𝗗𝗘𝗧𝗔𝗜𝗟𝗦
├───────────────
│ 👤 𝐍𝐚𝐦𝐞 : 𝐒𝐡𝐚𝐦𝐢𝐦 𝐕𝐚𝐢𝐲𝐚
│ 🚹 𝐆𝐞𝐧𝐝𝐞𝐫 : 𝐌𝐚𝐥𝐞
│ ❤️ 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧 : 𝐒𝐢𝐧𝐠𝐥𝐞
│ 🎂 𝐀𝐠𝐞 : 𝟏𝟖+
│ 🕌 𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧 : 𝐈𝐬𝐥𝐚𝐦
│ 🎓 𝐄𝐝𝐮𝐜𝐚𝐭𝐢𝐨𝐧 : 𝐂𝐲𝐛𝐞𝐫 𝐒𝐞𝐜𝐮𝐫𝐢𝐭𝐲 𝐄𝐱𝐩𝐞𝐫𝐭𝐬
│ 🏡 𝐀𝐝𝐝𝐫𝐞𝐬𝐬 : 𝐀𝐧𝐨𝐧𝐲𝐦𝐨𝐮𝐬
└───────────────⭓

┌───────────────⭓
│ 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 𝗟𝗜𝗡𝗞𝗦
├───────────────
│ 📘 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸:
│ [https://www.facebook.com/AnonymousCyberTeamOfficial]
│ 💬 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽:
│ [https://wa.me/01540580575]
│ 📝 𝗕𝗶𝗼:
│ [https://bio.link/shamim_vaiya]
└───────────────⭓

┌───────────────⭓
│ 🕒 𝗨𝗽𝗱𝗮𝘁𝗲𝗱 𝗧𝗶𝗺𝗲
├───────────────
│ ${time}
└───────────────⭓
 `,
       attachment: fs.createReadStream(__dirname + "/cache/owner.jpg"),
     },
     event.threadID,
     () => fs.unlinkSync(__dirname + "/cache/owner.jpg")
   );

 return request("https://i.imgur.com/kj2ANmV.png")
   .pipe(fs.createWriteStream(__dirname + "/cache/owner.jpg"))
   .on("close", () => callback());
};
