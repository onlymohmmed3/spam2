const { Client } = require("discord.js-selfbot-v13");
const { userAccount } = require("sphinx-run");

// بيانات التوكنات
const TOKEN1 = process.env.TOKEN1;
const TOKEN2 = process.env.TOKEN2;

// إنشاء كلاينت لكل حساب
const client1 = new Client();
const client2 = new Client();

// عند تسجيل الدخول الأول
client1.on("ready", async () => {
  console.log(`${client1.user.username} ✅ (Client 1) جاهز`);

  const leveling1 = new userAccount(client1, require("discord.js-selfbot-v13"));

  leveling1.leveling({
    channel: "1246427655855804477",
    time: 10000,
    randomLetters: false,
    type: "ar",
  });

  leveling1.leveling({
    channel: "1246427655855804477",
    time: 15000,
    randomLetters: false,
    type: "eng",
  });
});

// عند تسجيل الدخول الثاني
client2.on("ready", async () => {
  console.log(`${client2.user.username} ✅ (Client 2) جاهز`);

  const leveling2 = new userAccount(client2, require("discord.js-selfbot-v13"));

  leveling2.leveling({
    channel: "1246427655855804477",
    time: 12000,
    randomLetters: false,
    type: "ar",
  });

  leveling2.leveling({
    channel: "1246427655855804477",
    time: 17000,
    randomLetters: false,
    type: "eng",
  });
});

// تسجيل الدخول
client1.login(TOKEN1);
client2.login(TOKEN2);

// Express (عشان ما يتوقف في الاستضافة)
const express = require("express");
const app = express();
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>🎥 Bot Status + Music</title>
      </head>
      <body style="background-color: #111; color: white; font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h1>🎶 Music & Bot Running 24/7</h1>
        <p>Enjoy the vibes while the bot levels up 🚀</p>
        
        <iframe width="800" height="450"
                src="https://www.youtube.com/embed/9DOSpJ7Vvso?autoplay=1&controls=1"
                frameborder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowfullscreen>
        </iframe>
      </body>
    </html>
  `);
});

