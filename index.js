process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

const schedule = require('node-schedule');
const Discord = require("discord.js-selfbot-v13");
const { userAccount } = require("sphinx-run");

// إعادة التشغيل التلقائي كل 5 دقائق
schedule.scheduleJob('*/5 * * * *', function () {
  console.log('Restarting the project...');
  // يمكن إضافة منطق إعادة تشغيل فعلي لو مطلوب
});

// توكنات الحسابات (من .env)
const tokens = [
  process.env.TOKEN1,
  process.env.TOKEN2
];

// دالة لتشغيل الحساب الواحد (عربي + إنجليزي)
function startBot(token) {
  const client = new Discord.Client({
    checkUpdate: false,
  });

  client.on("ready", () => {
    console.log(`${client.user.username} is ready!`);
  });

  const account = new userAccount(client, Discord);

  // اللغة العربية
  account.leveling({
    channel: "1246427655855804477",
    randomLetters: false,
    time: 10000, // كل 10 ثواني
    type: "ar",
  });

  // اللغة الإنجليزية
  account.leveling({
    channel: "1246427655855804477",
    randomLetters: false,
    time: 10000,
    type: "eng",
  });

  client.login(token);
}

// تشغيل الحسابات
tokens.forEach((token) => {
  if (token && token !== "") {
    startBot(token);
  } else {
    console.error("❌ توكن مفقود أو فارغ، تأكد من .env");
  }
});

// سيرفر Express لتثبيت التشغيل
const express = require("express");
const app = express();
const listener = app.listen(process.env.PORT || 2000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
app.get("/", (req, res) => {
  res.send(`
    <body style="font-family: sans-serif;">
      <center>
        <h1>🤖 All Bots Running Successfully</h1>
        <p>Both accounts: Arabic + English Active</p>
      </center>
    </body>`);
});
