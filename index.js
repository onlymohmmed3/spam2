// 📦 تثبيت تلقائي للبكجات المطلوبة عند التشغيل
const { execSync } = require("child_process");
const fs = require("fs");

const dependencies = [
  "discord.js-selfbot-v13",
  "dotenv",
  "express",
  "sphinx-run"
];

function ensureDependencies() {
  for (const pkg of dependencies) {
    const name = pkg.split("@")[0];
    try {
      require.resolve(name);
    } catch (e) {
      console.log(`📦 Installing missing package: ${pkg}`);
      execSync(`npm install ${pkg}`, { stdio: "inherit" });
    }
  }
}
ensureDependencies();

// ✅ تحميل المتغيرات من .env
require("dotenv").config();

const { Client, WebhookClient } = require("discord.js-selfbot-v13");
const { userAccount } = require("sphinx-run");
const express = require("express");

const CONTROL_CHANNEL_ID = process.env.CONTROL_CHANNEL_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const { TOKEN1, TOKEN2 } = process.env;

const clients = [null, null];
const levelings = [null, null];
const tokens = [TOKEN1, TOKEN2];
const states = [false, false];
const webhook = new WebhookClient({ url: WEBHOOK_URL });
const startTime = Date.now();

// 📤 إرسال رسالة للويب هوك مع الوقت
function sendWebhook(content) {
  const now = new Date().toLocaleString("ar-EG", {
    timeZone: "Asia/Riyadh",
    hour12: false,
  });
  webhook.send({
    content: `🕓 **${now}**\n${content}`,
    username: "📡 Bot Logger",
    avatarURL: "https://i.imgur.com/AfFp7pu.png",
  }).catch(console.error);
}

// ⏱️ توليد وقت عشوائي طبيعي للسبام
function getRandomTime(base = 4000, variation = 1500) {
  return base + Math.floor(Math.random() * variation) - variation / 2;
}

async function startClient(index) {
  if (clients[index]) return;

  const client = new Client({ checkUpdate: false });
  clients[index] = client;

  client.on("ready", () => {
    console.log(`✅ Client ${index + 1} (${client.user.username}) is ready`);
    states[index] = true;
    const leveling = new userAccount(client, require("discord.js-selfbot-v13"));
    levelings[index] = leveling;

    leveling.leveling({
      channel: CONTROL_CHANNEL_ID,
      time: getRandomTime(),
      randomLetters: false,
      type: "ar",
    });

    leveling.leveling({
      channel: CONTROL_CHANNEL_ID,
      time: getRandomTime(),
      randomLetters: false,
      type: "eng",
    });

    // 🚀 إرسال إشعار أن الحساب اشتغل
    sendWebhook(`✅ الحساب ${index + 1} **${client.user.username}** اشتغل بنجاح`);

    // إرسال كل ساعة
    setInterval(() => {
      sendWebhook(`📢 الحساب ${index + 1} **${client.user.username}** لا يزال يعمل بنجاح`);
    }, 3600000);
  });

  client.on("messageCreate", (msg) => {
    if (index !== 0) return;
    if (msg.channel.id !== CONTROL_CHANNEL_ID || !msg.content.startsWith("!")) return;

    const [command, arg] = msg.content.trim().split(" ");
    if (!command) return;

    switch (command.toLowerCase()) {
      case "!help":
        sendWebhook(`🛠️ **الأوامر المتاحة:**\n\`!help\` - عرض قائمة الأوامر\n\`!status\` - حالة الحسابات\n\`!stop 1\` - إيقاف الحساب 1\n\`!start 2\` - تشغيل الحساب 2\n\`!restart 1\` - إعادة تشغيل الحساب 1\n\`!uptime\` - مدة التشغيل\n\`!ping\` - اختبار الاستجابة`);
        break;

      case "!status":
        sendWebhook(`📊 **الحالة:**\n- Client 1: ${states[0] ? "✅ شغال" : "❌ موقف"}\n- Client 2: ${states[1] ? "✅ شغال" : "❌ موقف"}`);
        break;

      case "!stop":
        stopClient(parseInt(arg) - 1);
        sendWebhook(`⛔ تم إيقاف الحساب ${arg}`);
        break;

      case "!start":
        startClient(parseInt(arg) - 1);
        sendWebhook(`▶️ تم تشغيل الحساب ${arg}`);
        break;

      case "!restart":
        const idx = parseInt(arg) - 1;
        stopClient(idx, () => startClient(idx));
        sendWebhook(`🔄 تم إعادة تشغيل الحساب ${arg}`);
        break;

      case "!uptime":
        const sec = Math.floor((Date.now() - startTime) / 1000);
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        sendWebhook(`⏱️ مدة التشغيل: ${h} ساعة و ${m} دقيقة و ${s} ثانية`);
        break;

      case "!ping":
        const ping = Date.now() - msg.createdTimestamp;
        sendWebhook(`🏓 Ping: ${ping}ms`);
        break;

      default:
        sendWebhook(`❓ أمر غير معروف. استخدم \`!help\``);
    }
  });

  try {
    await client.login(tokens[index]);
  } catch (err) {
    console.error(`❌ فشل تسجيل الدخول Client ${index + 1}:`, err.message);
    clients[index] = null;
    states[index] = false;
  }
}

function stopClient(index, callback) {
  if (clients[index]) {
    clients[index].destroy();
    clients[index] = null;
    states[index] = false;
    console.log(`🛑 تم إيقاف Client ${index + 1}`);
  }
  if (callback) callback();
}

// بدء التشغيل
startClient(0);
startClient(1);

// سيرفر Express للحفاظ على النشاط
const app = express();
app.get("/", (req, res) => res.send("<h1>🤖 Bot Running</h1>"));
app.listen(3000, () => console.log("🚀 Web server on port 3000"));
