/* ===================================================
 * Main.js - সম্পূর্ণ ডি-অবফিউসকেটেড সংস্করণ
 * এটি একটি ফেসবুক চ্যাট বট ('cyber-fca' ভিত্তিক)
 * সমস্ত অ্যান্টি-ডিবাগিং এবং অ্যান্টি-টুল ফাঁদ সরানো হয়েছে।
 * ===================================================
 */

// === মডিউল ইম্পোর্ট ===
const moment = require("moment-timezone");
const {
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  unlinkSync,
  rm,
} = require("fs-extra");
const { join, resolve } = require("path");
const { execSync } = require("child_process");
const logger = require("./utils/log");
const login = require("cyber-fca"); // ফেসবুক লগইন লাইব্রেরি
const axios = require("axios");

// package.json থেকে সকল প্যাকেজের তালিকা লোড করা
const listPackage = JSON.parse(readFileSync("./package.json")).dependencies;
const listbuiltinModules = require("module").builtinModules;

// === বটের ASCII আর্ট ===
const BOT_ART =
  "█████╗░██╗░░░██╗██████╗░██████╗░\n██╔══██╗██║░░░██║██╔══██╗██╔══██╗\n███████║██║░░░██║██████╔╝██████╔╝\n██╔══██║██║░░░██║██╔══██╗██╔══██╗\n██║░░██║╚██████╔╝██║░░██║██████╔╝\n╚═╝░░╚═╝░╚═════╝░╚═╝░░╚═╝╚═════╝░\n\n 𝐒𝐇𝐀𝐇𝐀𝐃𝐀𝐓 𝐂𝐇𝐀𝐓 𝐁𝐎𝐓 \n𝐎𝐖𝐍𝐄𝐑 𝐒𝐇𝐀𝐇𝐀𝐃𝐀𝐓 𝐒𝐀𝐇𝐔\n";

// === গ্লোবাল ভেরিয়েবল সেটআপ ===
// এই অবজেক্টগুলো বট রান করার সময় বিভিন্ন তথ্য ধারণ করে

global.client = new Object({
  commands: new Map(),
  events: new Map(),
  cooldowns: new Map(),
  eventRegistered: new Array(),
  handleSchedule: new Array(),
  handleReaction: new Array(),
  handleReply: new Array(),
  mainPath: process.cwd(),
  configPath: new String(),

  /**
   * এশিয়া/ঢাকা টাইমজোন অনুযায়ী সময় ও তারিখ প্রদান করে
   * @param {string} type - 'seconds', 'minutes', 'hours', 'date', 'month', 'year', 'fullTime', 'fullDate', 'fullYear'
   */
  getTime: function (type) {
    switch (type) {
      case "seconds":
        return "" + moment.tz("Asia/Dhaka").format("ss");
      case "minutes":
        return "" + moment.tz("Asia/Dhaka").format("mm");
      case "hours":
        return "" + moment.tz("Asia/Dhaka").format("HH");
      case "date":
        return "" + moment.tz("Asia/Dhaka").format("DD");
      case "month":
        return "" + moment.tz("Asia/Dhaka").format("MM");
      case "year":
        return "" + moment.tz("Asia/Dhaka").format("YYYY");
      case "fullTime":
        return "" + moment.tz("Asia/Dhaka").format("HH:mm:ss");
      case "fullDate":
        return "" + moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
      case "fullYear":
        return "" + moment.tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");
    }
  },
});

global.data = new Object({
  threadInfo: new Map(),
  threadData: new Map(),
  userName: new Map(),
  userBanned: new Map(),
  threadBanned: new Map(),
  commandBanned: new Map(),
  threadAllowNSFW: new Array(),
  allUserID: new Array(),
  allCurrenciesID: new Array(),
  allThreadID: new Array(),
});

global.language = require("./languages/en.lang"); // ভাষা ফাইল লোড
global.config = new Object();
global.modules = new Object();
global.moduleData = new Object();
global.temp = new Array();
global.configModule = new Object();

// === কনফিগারেশন ফাইল লোড করা ===
var configValue;
try {
  global.client.configPath = join(global.client.mainPath, "config.json");
  configValue = require(global.client.configPath);
  logger.log("Config Loaded: Found config.json!");
} catch {
  // যদি config.json না পাওয়া যায়, config.example.json থেকে লোড করার চেষ্টা
  if (
    existsSync(
      global.client.configPath.replace(/\.json/g, "") + ".example.json"
    )
  ) {
    configValue = readFileSync(
      global.client.configPath.replace(/\.json/g, "") + ".example.json"
    );
    configValue = JSON.parse(configValue);
    logger.log("Config Loaded: Found config.example.json");
  } else {
    return logger.log("Config not found: config.json not found!", "ERROR");
  }
}

try {
  // কনফিগারেশনের সব ভ্যালু global.config অবজেক্টে কপি করা
  for (const key in configValue) global.config[key] = configValue[key];
  logger.log("Config Loaded: Config saved to global.");
} catch {
  return logger.log("Config Error: Can't load config file config!", "ERROR");
}

// === ডাটাবেস সেটআপ (Sequelize) ===
const { Sequelize, sequelize } = require("./includes/database");

// config.json ফাইলটি আপডেট করা (যদি .example.json থেকে লোড হয়)
writeFileSync(
  global.client.configPath + ".temp",
  JSON.stringify(global.config, null, 4),
  "utf-8"
);

// === ভাষা ফাইল লোড করা ===
const langFile = readFileSync(
  __dirname + "/languages/" + (global.config.language || "en") + ".lang",
  { encoding: "utf-8" }
).split(/\r?\n|\r/);
const langData = langFile.filter(
  (line) => line.indexOf("#") != 0 && line != ""
);

for (const item of langData) {
  const getSeparator = item.indexOf("=");
  const itemKey = item.slice(0, getSeparator);
  const itemValue = item.slice(getSeparator + 1, item.length);
  const head = itemKey.slice(0, itemKey.indexOf("."));
  const key = itemKey.replace(head + ".", "");
  const value = itemValue.replace(/\\n/gi, "\n");
  if (typeof global.language[head] == "undefined")
    global.language[head] = new Object();
  global.language[head][key] = value;
}

/**
 * ভাষা ফাইল থেকে টেক্সট পাওয়ার ফাংশন
 * @param {string} head - ক্যাটেগরি
 * @param {string} key - টেক্সট-এর কী (key)
 * @param  {...any} args - টেক্সট-এর ভেতরের ভেরিয়েবল (যেমন %1, %2)
 */
global.getText = function (...args) {
  const lang = global.language;
  if (!lang.hasOwnProperty(args[0]))
    throw `${__filename} - Not found key language: ${args[0]}`;

  var text = lang[args[0]][args[1]];

  for (var i = args.length - 1; i > 0; i--) {
    const regEx = new RegExp("%" + i, "g");
    text = text.replace(regEx, args[i + 1]);
  }
  return text;
};

// === ফেসবুক অ্যাপস্টেট (appstate.json) লোড করা ===
try {
  var appStateFile = resolve(
    join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json")
  );
  var appState = require(appStateFile);
  logger.log(global.getText("loader", "foundPathAppstate"));
} catch {
  return logger.log(global.getText("loader", "notFoundPathAppstate"), "ERROR");
}

/**
 * বট চালু করার মূল ফাংশন
 * @param {object} { models } - ডাটাবেস মডেল
 */
function onBot({ models }) {
  // === ফেসবুক লগইন ===
  const loginOptions = {};
  loginOptions.appState = appState;

  login(loginOptions, async (err, api) => {
    if (err) return logger(JSON.stringify(err), "ERROR");

    // API অপশন সেট করা
    api.setOptions(global.config.FCAOption);

    // অ্যাপস্টেট সেভ করা
    writeFileSync(appStateFile, JSON.stringify(api.getAppState(), null, "\t"));

    global.client.api = api; // API-কে গ্লোবাল করা
    global.config.version = "1.2.14"; // বট সংস্করণ
    global.client.timeStart = new Date().getTime(); // বট চালু হওয়ার সময়

    // === কমান্ড লোডার ===
    (function () {
      const commandFiles = readdirSync(
        join(global.client.mainPath, "/Script/commands")
      ).filter(
        (file) =>
          file.endsWith(".js") &&
          !file.includes(".temp") &&
          !global.config.commandDisabled.includes(file)
      );

      for (const file of commandFiles) {
        try {
          var command = require(join(
            global.client.mainPath,
            "/Script/commands",
            file
          ));

          // কমান্ডের কনফিগারেশন চেক
          if (
            !command.config ||
            !command.run ||
            !command.config.commandCategory
          )
            throw new Error(global.getText("loader", "errorFormat"));

          if (global.client.commands.has(command.config.name || ""))
            throw new Error(global.getText("loader", "nameExist"));

          if (
            !command.languages ||
            typeof command.languages != "object" ||
            Object.keys(command.languages).length == 0
          )
            logger.log(
              global.getText("loader", "notFoundLanguage", command.config.name),
              "warningSource"
            );

          // কমান্ডের প্যাকেজ ইন্সটলেশন (যদি প্রয়োজন হয়)
          if (
            command.config.dependencies &&
            typeof command.config.dependencies == "object"
          ) {
            for (const packageName in command.config.dependencies) {
              const modulePath = join(__dirname, "node_modules", packageName);
              try {
                if (!global.modules.hasOwnProperty(packageName)) {
                  if (
                    listPackage.hasOwnProperty(packageName) ||
                    listbuiltinModules.includes(packageName)
                  )
                    global.modules[packageName] = require(packageName);
                  else global.modules[packageName] = require(modulePath);
                }
              } catch {
                var check = false,
                  checkError;
                logger.log(
                  global.getText(
                    "loader",
                    "notFoundPackage",
                    packageName,
                    command.config.name
                  ),
                  "warningSource"
                );
                execSync(
                  `npm ---package-lock false --save install ${packageName}${
                    command.config.dependencies[packageName] == "*" ||
                    command.config.dependencies[packageName] == ""
                      ? ""
                      : "@" + command.config.dependencies[packageName]
                  }`,
                  {
                    stdio: "inherit",
                    env: process.env,
                    shell: true,
                    cwd: join(__dirname, "node_modules"),
                  }
                );

                for (let i = 1; i <= 3; i++) {
                  try {
                    require.cache = {};
                    if (
                      listPackage.hasOwnProperty(packageName) ||
                      listbuiltinModules.includes(packageName)
                    )
                      global.modules[packageName] = require(packageName);
                    else global.modules[packageName] = require(modulePath);
                    check = true;
                    break;
                  } catch (e) {
                    checkError = e;
                  }
                  if (check || !checkError) break;
                }
                if (!check)
                  throw global.getText(
                    "loader",
                    "cantInstallPackage",
                    packageName,
                    command.config.name,
                    checkError
                  );
              }
            }
            logger.log(
              global.getText("loader", "loadedPackage", command.config.name)
            );
          }

          // কমান্ডের এনভায়রনমেন্ট কনফিগারেশন লোড
          if (command.config.envConfig) {
            try {
              if (
                typeof global.configModule[command.config.name] == "undefined"
              )
                global.configModule[command.config.name] = {};
              if (typeof global.config[command.config.name] == "undefined")
                global.config[command.config.name] = {};

              for (const key in command.config.envConfig) {
                if (
                  typeof global.config[command.config.name][key] != "undefined"
                )
                  global.configModule[command.config.name][key] =
                    global.config[command.config.name][key];
                else
                  global.configModule[command.config.name][key] =
                    command.config.envConfig[key] || "";

                if (
                  typeof global.config[command.config.name][key] == "undefined"
                )
                  global.config[command.config.name][key] =
                    command.config.envConfig[key] || "";
              }
              logger.log(
                global.getText("loader", "loadedConfig", command.config.name)
              );
            } catch (e) {
              throw new Error(
                global.getText(
                  "loader",
                  "errorLoadedConfig",
                  command.config.name,
                  JSON.stringify(e)
                )
              );
            }
          }

          // onLoad ফাংশন (যদি থাকে) রান করা
          if (command.onLoad) {
            try {
              const onLoadData = {};
              onLoadData.api = api;
              onLoadData.models = models;
              command.onLoad(onLoadData);
            } catch (e) {
              throw new Error(
                global.getText(
                  "loader",
                  "errorOnLoad",
                  command.config.name,
                  JSON.stringify(e)
                ),
                "ERROR"
              );
            }
          }

          // handleEvent ফাংশন (যদি থাকে) রেজিস্টার করা
          if (command.handleEvent)
            global.client.eventRegistered.push(command.config.name);

          global.client.commands.set(command.config.name, command);
          logger.log(
            global.getText("loader", "successLoadModule", command.config.name)
          );
        } catch (e) {
          logger.log(
            global.getText("loader", "failLoadModule", command.config.name, e),
            "ERROR"
          );
        }
      }
    })();

    // === ইভেন্ট লোডার ===
    (function () {
      const eventFiles = readdirSync(
        join(global.client.mainPath, "/Script/events")
      ).filter(
        (file) =>
          file.endsWith(".js") && !global.config.eventDisabled.includes(file)
      );

      for (const file of eventFiles) {
        try {
          var event = require(join(
            global.client.mainPath,
            "/Script/events",
            file
          ));

          if (!event.config || !event.run)
            throw new Error(global.getText("loader", "errorFormat"));

          if (global.client.events.has(event.config.name) || "")
            throw new Error(global.getText("loader", "nameExist"));

          // প্যাকেজ ইন্সটলেশন (কমান্ডের মতোই)
          if (
            event.config.dependencies &&
            typeof event.config.dependencies == "object"
          ) {
            for (const packageName in event.config.dependencies) {
              const modulePath = join(__dirname, "node_modules", packageName);
              try {
                if (!global.modules.hasOwnProperty(packageName)) {
                  if (
                    listPackage.hasOwnProperty(packageName) ||
                    listbuiltinModules.includes(packageName)
                  )
                    global.modules[packageName] = require(packageName);
                  else global.modules[packageName] = require(modulePath);
                }
              } catch {
                logger.log(
                  global.getText(
                    "loader",
                    "notFoundPackage",
                    packageName,
                    event.config.name
                  ),
                  "warningSource"
                );
                execSync(
                  `npm --package-lock false --save install ${packageName}${
                    event.config.dependencies[packageName] == "*" ||
                    event.config.dependencies[packageName] == ""
                      ? ""
                      : "@" + event.config.dependencies[packageName]
                  }`,
                  {
                    stdio: "inherit",
                    env: process.env,
                    shell: true,
                    cwd: join(__dirname, "node_modules"),
                  }
                );

                for (let i = 1; i <= 3; i++) {
                  try {
                    require.cache = {};
                    if (
                      listPackage.hasOwnProperty(packageName) ||
                      listbuiltinModules.includes(packageName)
                    )
                      global.modules[packageName] = require(packageName);
                    else global.modules[packageName] = require(modulePath);
                    break;
                  } catch (e) {}
                }
                throw global.getText(
                  "loader",
                  "cantInstallPackage",
                  packageName,
                  event.config.name
                );
              }
            }
            logger.log(
              global.getText("loader", "loadedPackage", event.config.name)
            );
          }

          // এনভায়রনমেন্ট কনফিগারেশন লোড (কমান্ডের মতোই)
          if (event.config.envConfig) {
            try {
              if (typeof global.configModule[event.config.name] == "undefined")
                global.configModule[event.config.name] = {};
              if (typeof global.config[event.config.name] == "undefined")
                global.config[event.config.name] = {};

              for (const key in event.config.envConfig) {
                if (typeof global.config[event.config.name][key] != "undefined")
                  global.configModule[event.config.name][key] =
                    global.config[event.config.name][key];
                else
                  global.configModule[event.config.name][key] =
                    event.config.envConfig[key] || "";

                if (typeof global.config[event.config.name][key] == "undefined")
                  global.config[event.config.name][key] =
                    event.config.envConfig[key] || "";
              }
              logger.log(
                global.getText("loader", "loadedConfig", event.config.name)
              );
            } catch (e) {
              throw new Error(
                global.getText(
                  "loader",
                  "errorLoadedConfig",
                  event.config.name,
                  JSON.stringify(e)
                )
              );
            }
          }

          // onLoad ফাংশন (যদি থাকে) রান করা
          if (event.onLoad) {
            try {
              const onLoadData = {};
              onLoadData.api = api;
              onLoadData.models = models;
              event.onLoad(onLoadData);
            } catch (e) {
              throw new Error(
                global.getText(
                  "loader",
                  "errorOnLoad",
                  event.config.name,
                  JSON.stringify(e)
                ),
                "ERROR"
              );
            }
          }

          global.client.events.set(event.config.name, event);
          logger.log(
            global.getText("loader", "successLoadModule", event.config.name)
          );
        } catch (e) {
          logger.log(
            global.getText("loader", "failLoadModule", event.config.name, e),
            "ERROR"
          );
        }
      }
    })();

    // === লোডিং সম্পন্ন ===
    console.log(BOT_ART); // ASCII আর্ট প্রিন্ট করা
    logger.log(
      global.getText(
        "loader",
        "finishLoad",
        global.client.commands.size,
        global.client.events.size
      )
    );
    logger.log(
      "Startup Time: " + (Date.now() - global.client.timeStart) / 1000 + "s"
    );
    logger.log(
      "===== [ COMMANDS ] ===== " +
        (Date.now() - global.client.timeStart) +
        "ms"
    );

    // কনফিগারেশন ফাইল আপডেট করা এবং .temp ফাইল মুছে ফেলা
    writeFileSync(
      global.client.configPath,
      JSON.stringify(global.config, null, 4),
      "utf8"
    );
    unlinkSync(global.client.configPath + ".temp");

    // === লিসেনার (Listener) চালু করা ===
    const listenerData = {};
    listenerData.api = api;
    listenerData.models = models;
    const listener = require("./includes/listen")(listenerData);

    /**
     * মূল মেসেজ লিসেনার ফাংশন
     */
    function handleListen(err, event) {
      if (err)
        return logger(
          global.getText("loader", "listenError", JSON.stringify(err)),
          "ERROR"
        );

      // নির্দিষ্ট কিছু ইভেন্ট টাইপ ইগনোর করা
      if (
        ["presence", "typ", "read_receipt"].some((type) => type == event.type)
      )
        return;

      // ডিবাগিং এর জন্য লগ করা (যদি চালু থাকে)
      if (global.config.DeveloperMode == true) console.log(event);

      return listener(event);
    }

    // গ্লোবাল ব্যানিং চেক (ডাটাবেস থেকে)
    global.handleListen = api.listenMqtt(handleListen);
    try {
      await checkBan(api);
    } catch (e) {
      return;
    }

    if (!global.checkBan)
      logger(global.getText("loader", "warningSourceCode"), "warn");
  });
}

// === বট চালু করা (IIFE) ===
(async () => {
  try {
    // ডাটাবেস অথেন্টিকেশন
    await sequelize.authenticate();

    const modelsData = {};
    modelsData.Sequelize = Sequelize;
    modelsData.sequelize = sequelize;

    // মডেলগুলো লোড করা
    const models = require("./includes/database/models")(modelsData);
    logger.log(
      global.getText("database", "successConnectDatabase"),
      "[ DATABASE ]"
    );

    const botData = {};
    botData.models = models;
    onBot(botData); // বট চালু করা
  } catch (e) {
    logger.log(
      global.getText("database", "successConnectDatabase", JSON.stringify(e)),
      "[ DATABASE ]"
    );
  }
})();

// আনহ্যান্ডেলড প্রসেস এরর হ্যান্ডলিং
process.on("unhandledRejection", (err, p) => {});

