process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

const schedule = require('node-schedule');
const Discord = require("discord.js-selfbot-v13");
const { userAccount } = require("sphinx-run");

// إعادة التشغيل التلقائي كل 5 دقائق
schedule.scheduleJob('*/5 * * * *', function () {
  console.log('Restarting the project...');
  // يمكنك هنا وضع كود إعادة التشغيل إذا أردت
});

// تعريف بيانات الحسابات
const tokens = [
  process.env.TOKEN1,
  process.env.TOKEN2
];

// دالة تشغيل الحساب وتشغيل العربي والإنجليزي
function startBot(token) {
  const client = new Discord.Client({
    checkUpdate: false,
    intents: [Discord.Intents.FLAGS.GUILDS],
  });

  client.on("ready", async () => {
    console.log(`${client.user.username} is ready!`);
  });

  const account = new userAccount(client, Discord);

  // تشغيل اللغة العربية
  account.leveling({
    channel: "1246427655855804477",
    randomLetters: false,
    time: 10000, // كل 10 ثواني
    type: "ar",
  });

  // تشغيل اللغة الإنجليزية
  account.leveling({
    channel: "1246427655855804477",
    randomLetters: false,
    time: 10000, // كل 10 ثواني
    type: "eng",
  });

  client.login(token);
}

// تشغيل كل الحسابات
tokens.forEach(startBot);

// سيرفر صغير للحفاظ على التشغيل (مفيد لـ Replit)
const express = require("express");
const app = express();
var listener = app.listen(process.env.PORT || 2000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
app.get("/", (req, res) => {
  res.send(`
  <body>
  <center><h1>All Bots Running (AR + ENG)</h1></center>
  </body>`);
});
