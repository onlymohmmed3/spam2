process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

const schedule = require('node-schedule');
const Discord = require("discord.js-selfbot-v13");
const { userAccount } = require("sphinx-run");

// إعادة تشغيل كل 5 دقائق
const restartJob = schedule.scheduleJob('*/5 * * * *', function() {
  console.log('Restarting the project...');
  // إضافة الكود الخاص بإعادة تشغيل البرنامج هنا إن لزم
});

// معلومات الحسابات
const tokens = [
  process.env.TOKEN1,
  process.env.TOKEN2
];

// دالة تشغيل بوت لكل توكن
function startBot(token, type = "ar") {
  const client = new Discord.Client({
    checkUpdate: false,
    intents: [Discord.Intents.FLAGS.GUILDS],
  });

  client.on("ready", async () => {
    console.log(`${client.user.username} is ready!`);
  });

  const account = new userAccount(client, Discord);
  account.leveling({
    channel: "1246427655855804477",
    randomLetters: false,
    time: 10000,
    type,
  });

  client.login(token);
}

// تشغيل الحساب الأول بالعربية والثاني بالإنجليزية
startBot(tokens[0], "ar");
startBot(tokens[1], "eng");

// السيرفر الصغير لتشغيل البوت دائماً على المنصات المجانية
const express = require("express");
const app = express();
var listener = app.listen(process.env.PORT || 2000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
app.get("/", (req, res) => {
  res.send(`
  <body>
  <center><h1>Bot 24H ON!</h1></center>
  </body>`);
});
