module.exports.config = {
  name: "pending",
  version: "1.0.6",
  credits: "𝐒𝐡𝐚𝐡𝐚𝐝𝐚𝐭 𝐈𝐬𝐥𝐚𝐦",
  hasPermssion: 2,
  description: "Manage bot's pending group requests",
  commandCategory: "system",
  cooldowns: 5,
};

module.exports.languages = {
  en: {
    invaildNumber: "❌ %1 is not a valid number",
    cancelSuccess: "✅ Successfully rejected %1 group(s)!",
    notiBox1:
      "চ্ঁলে্ঁ এ্ঁসে্ঁছি্ঁ 𝐒𝐡𝐚𝐡𝐚𝐝𝐚𝐭 𝐂𝐡𝐚𝐭 𝐁𝐨𝐭 এঁখঁনঁ তোঁমাঁদেঁরঁ সাঁথেঁ আঁড্ডাঁ দিঁবঁ..!😘",
    notiBox2: `╭•┄┅═══❁🌺❁═══┅┄•╮
     আ্ঁস্ঁসা্ঁলা্ঁমু্ঁ💚আ্ঁলা্ঁই্ঁকু্ঁম্ঁ
╰•┄┅═══❁🌺❁═══┅┄•╯

𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐬𝐨 𝐦𝐮𝐜𝐡 𝐟𝐨𝐫 𝐚𝐝𝐝𝐢𝐧𝐠 𝐦𝐞 𝐭𝐨 𝐲𝐨𝐮𝐫 𝐠𝐫𝐨𝐮𝐩! 🖤🤗
𝐈 𝐰𝐢𝐥𝐥 𝐚𝐥𝐰𝐚𝐲𝐬 𝐬𝐞𝐫𝐯𝐞 𝐲𝐨𝐮 𝐢𝐧𝐬𝐡𝐚𝐀𝐥𝐥𝐚𝐡 🌺❤️

𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐋𝐢𝐬𝐭:
${global.config.PREFIX}help
${global.config.PREFIX}info
${global.config.PREFIX}admin

★ For any help or complaints, please contact admin ★
➤ 𝐌𝐞𝐬𝐬𝐞𝐧𝐠𝐞𝐫: https://m.me/100051925606707
➤ 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩: https://wa.me/8801882333052

❖⋆═══════════════════════⋆❖
      𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫 ➢ 𝐒𝐇𝐀𝐇𝐀𝐃𝐀𝐓`,
    approveSuccess: "✅ Successfully approved %1 group(s)!",
    cantGetPendingList: "❌ Failed to retrieve pending list!",
    returnListPending:
      "📝 𝗣𝗘𝗡𝗗𝗜𝗡𝗚 𝗟𝗜𝗦𝗧\n\nTotal groups awaiting approval: %1\n\n%2\n\nReply with the number(s) to approve or 'c' followed by number(s) to reject (e.g., 1 2 3 or c1 c2)",
    returnListClean: "✅ There are no pending groups at the moment.",
  },
};

module.exports.handleReply = async function ({
  api,
  event,
  handleReply,
  getText,
}) {
  if (String(event.senderID) !== String(handleReply.author)) return;

  const { body, threadID, messageID } = event;
  let count = 0;

  if (
    (isNaN(body) && body.toLowerCase().startsWith("c")) ||
    body.toLowerCase().startsWith("cancel")
  ) {
    const indexes = body.match(/\d+/g) || [];

    for (const num of indexes) {
      const index = parseInt(num);
      if (isNaN(index) || index <= 0 || index > handleReply.pending.length) {
        return api.sendMessage(
          getText("invaildNumber", num),
          threadID,
          messageID
        );
      }

      try {
        await api.removeUserFromGroup(
          api.getCurrentUserID(),
          handleReply.pending[index - 1].threadID
        );
        count++;
      } catch (e) {
        console.error("Error rejecting group:", e);
      }
    }
    return api.sendMessage(
      getText("cancelSuccess", count),
      threadID,
      messageID
    );
  } else {
    const indexes = body.match(/\d+/g) || [];

    for (const num of indexes) {
      const index = parseInt(num);
      if (isNaN(index) || index <= 0 || index > handleReply.pending.length) {
        return api.sendMessage(
          getText("invaildNumber", num),
          threadID,
          messageID
        );
      }

      try {
        const groupID = handleReply.pending[index - 1].threadID;
        await api.sendMessage(getText("notiBox1"), groupID);
        await api.sendMessage(getText("notiBox2"), groupID);
        count++;
      } catch (e) {
        console.error("Error approving group:", e);
      }
    }
    return api.sendMessage(
      getText("approveSuccess", count),
      threadID,
      messageID
    );
  }
};

module.exports.run = async function ({ api, event, getText }) {
  const { threadID, messageID } = event;

  try {
    const [spam, pending] = await Promise.all([
      api.getThreadList(100, null, ["OTHER"]),
      api.getThreadList(100, null, ["PENDING"]),
    ]);

    const list = [...(spam || []), ...(pending || [])].filter(
      (group) => group.isSubscribed && group.isGroup
    );

    if (list.length === 0) {
      return api.sendMessage(getText("returnListClean"), threadID, messageID);
    }

    const msg = list
      .map(
        (group, index) =>
          `${index + 1}. ${group.name || "Unnamed Group"} (ID: ${
            group.threadID
          })`
      )
      .join("\n");

    return api.sendMessage(
      getText("returnListPending", list.length, msg),
      threadID,
      (error, info) => {
        if (!error) {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            pending: list,
          });
        }
      },
      messageID
    );
  } catch (e) {
    console.error(e);
    return api.sendMessage(getText("cantGetPendingList"), threadID, messageID);
  }
};
