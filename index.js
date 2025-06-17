require("dotenv").config();
const { Client } = require("discord.js-selfbot-v13");
const { userAccount } = require("sphinx-run");
const express = require("express");

const CONTROL_CHANNEL_ID = process.env.CONTROL_CHANNEL_ID;

const tokens = [process.env.TOKEN1, process.env.TOKEN2];
const clients = [null, null];
const states = [false, false]; // حالة التشغيل لكل حساب
const levelings = [null, null];

function setupLeveling(clientIndex) {
  const client = clients[clientIndex];
  if (!client) return;

  const leveling = new userAccount(client, require("discord.js-selfbot-v13"));
  levelings[clientIndex] = leveling;

  leveling.leveling({
    channel: "1246427655855804477",
    time: 10000 + clientIndex * 2000,
    randomLetters: false,
    type: "ar",
  });

  leveling.leveling({
    channel: "1246427655855804477",
    time: 15000 + clientIndex * 2000,
    randomLetters: false,
    type: "eng",
  });

  console.log(`✅ Leveling started for client ${clientIndex + 1}`);
}

async function startClient(index) {
  if (clients[index]) return;
  const client = new Client();
  clients[index] = client;

  client.on("ready", () => {
    console.log(`🟢 Client ${index + 1} (${client.user.username}) ready`);
    setupLeveling(index);
    states[index] = true;
  });

  client.on("messageCreate", (msg) => {
    if (msg.channel.id !== CONTROL_CHANNEL_ID) return;
    if (!msg.content.startsWith("!")) return;

    const [command, arg] = msg.content.trim().split(" ");

    switch (command) {
      case "!status":
        msg.reply(
          `📊 الحالة:\n` +
          `- Client 1: ${states[0] ? "✅ شغال" : "❌ موقف"}\n` +
          `- Client 2: ${states[1] ? "✅ شغال" : "❌ موقف"}`
        );
        break;

      case "!stop":
        stopClient(parseInt(arg) - 1);
        msg.reply(`⛔ تم إيقاف الحساب ${arg}`);
        break;

      case "!start":
        startClient(parseInt(arg) - 1);
        msg.reply(`▶️ تم تشغيل الحساب ${arg}`);
        break;

      case "!restart":
        const idx = parseInt(arg) - 1;
        stopClient(idx, () => startClient(idx));
        msg.reply(`🔄 جاري إعادة تشغيل الحساب ${arg}`);
        break;

      default:
        msg.reply("❓ أمر غير معروف");
    }
  });

  try {
    await client.login(tokens[index]);
  } catch (err) {
    console.error(`❌ فشل تسجيل دخول Client ${index + 1}`, err.message);
    clients[index] = null;
    states[index] = false;
  }
}

function stopClient(index, callback) {
  if (clients[index]) {
    clients[index].destroy();
    clients[index] = null;
    states[index] = false;
    levelings[index] = null;
    console.log(`🛑 تم إيقاف الحساب ${index + 1}`);
  }
  if (callback) callback();
}

// بدء تشغيل جميع الحسابات تلقائياً
startClient(0);
startClient(1);

// Express لإبقاء المشروع نشطاً على الاستضافة
const app = express();
app.get("/", (req, res) => res.send("<h1>🤖 Bot is Running</h1>"));
app.listen(process.env.PORT || 3000, () => {
  console.log("🔁 Express server running");
});
