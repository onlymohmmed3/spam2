// =====================[ إعدادات عامة + هاندل أخطاء ]=====================

require("dotenv").config();
const fs = require("fs");

process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection] 🤬 | السبب:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[uncaughtException] 💥 | خطأ غير متوقع:", err);
});

// =====================[ Discord Selfbot ]=====================

const Discord = require("discord.js-selfbot-v13");

if (!process.env.TOKEN1 || !process.env.TOKEN2) {
  console.error("❌ لازم تحط TOKEN1 و TOKEN2 في ملف env!");
  process.exit(1);
}

const DEFAULT_CHANNEL_ID =
  process.env.DEFAULT_CHANNEL_ID || "1246427655855804477";
const MESSAGE_DELAY = 12000; // ثابت حسب طلبك

const ACCOUNTS = [
  { label: "ACCOUNT_1", token: process.env.TOKEN1, client: null },
  { label: "ACCOUNT_2", token: process.env.TOKEN2, client: null },
];

// =====================[ Settings (يحفظ في ملف) ]=====================

const SETTINGS_FILE = "./settings.json";

// رسائل بسيطة لعربي + إنجليزي (تقدر تعدلها)
const AR_MESSAGES = [
  "يا رب لفل جديد 🔥",
  "شغال لفلينق عربي 😎",
  "نظام لفلينق عربي!",
  "رفع لفل عربي ✅",
];

const EN_MESSAGES = [
  "Leveling up in English 🔥",
  "English leveling system 😎",
  "Farming XP ENG ✅",
  "Another XP tick in English!",
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// =====================[ إحصائيات الرسائل (عداد) ]=====================

const startTime = Date.now();

const stats = {
  ACCOUNT_1: { ar: 0, en: 0, total: 0 },
  ACCOUNT_2: { ar: 0, en: 0, total: 0 },
};

function incStat(label, type) {
  // type: "ar" أو "en"
  const s = stats[label];
  if (!s) return;
  if (type === "ar") s.ar++;
  if (type === "en") s.en++;
  s.total = s.ar + s.en;
}

function getGlobalStats() {
  const total =
    stats.ACCOUNT_1.total +
    stats.ACCOUNT_2.total;
  return {
    accounts: stats,
    globalTotal: total,
    startedAt: startTime,
    uptimeSeconds: Math.floor(process.uptime()),
  };
}

// =====================[ إعداد الإعدادات ]=====================

let settings = {
  accounts: {
    ACCOUNT_1: {
      enabled: true,
      channelId: DEFAULT_CHANNEL_ID,
      sendArabic: true,
      sendEnglish: true,
    },
    ACCOUNT_2: {
      enabled: true,
      channelId: DEFAULT_CHANNEL_ID,
      sendArabic: true,
      sendEnglish: true,
    },
  },
};

function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf8");
      const parsed = JSON.parse(raw);

      settings.accounts.ACCOUNT_1 = {
        ...settings.accounts.ACCOUNT_1,
        ...(parsed.accounts?.ACCOUNT_1 || {}),
      };
      settings.accounts.ACCOUNT_2 = {
        ...settings.accounts.ACCOUNT_2,
        ...(parsed.accounts?.ACCOUNT_2 || {}),
      };

      console.log("✅ تم تحميل الإعدادات من settings.json");
    } else {
      saveSettings();
    }
  } catch (e) {
    console.error(
      "⚠️ فشل قراءة settings.json, راح نستخدم الديفولت:",
      e.message
    );
  }
}

function saveSettings() {
  try {
    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify(settings, null, 2),
      "utf8"
    );
    console.log("💾 تم حفظ الإعدادات في settings.json");
  } catch (e) {
    console.error("⚠️ فشل حفظ الإعدادات:", e.message);
  }
}

loadSettings();

// =====================[ تشغيل الحسابات + اللوبات ]=====================

function startMessageLoop(account) {
  setInterval(async () => {
    const cfg = settings.accounts[account.label];
    const client = account.client;

    if (!client || !client.user) return;
    if (!cfg || !cfg.enabled) return;

    const channelId = cfg.channelId || DEFAULT_CHANNEL_ID;
    const channel = client.channels.cache.get(channelId);
    if (!channel) return;

    try {
      if (cfg.sendArabic) {
        await channel.send(getRandom(AR_MESSAGES));
        incStat(account.label, "ar");
      }
      if (cfg.sendEnglish) {
        await channel.send(getRandom(EN_MESSAGES));
        incStat(account.label, "en");
      }
    } catch (e) {
      console.error(`[${account.label}] خطأ أثناء الإرسال:`, e.message);
    }
  }, MESSAGE_DELAY);
}

function createSelfbot(account) {
  const client = new Discord.Client({
    checkUpdate: false,
  });

  account.client = client;

  client.on("ready", () => {
    console.log("========================================");
    console.log(`✅ [${account.label}] Logged in as: ${client.user.username}`);
    console.log(`🆔 ID: ${client.user.id}`);
    console.log(`📡 Default Channel: ${DEFAULT_CHANNEL_ID}`);
    console.log("🌐 Selfbot Leveling (AR + ENG) شغال");
    console.log("❗ بدون أي Status متغير (مافي setActivity)");
    console.log("========================================");

    startMessageLoop(account);
  });

  client
    .login(account.token)
    .then(() => console.log(`🔐 [${account.label}] Login OK`))
    .catch((err) => {
      console.error(
        `❌ [${account.label}] فشل تسجيل الدخول:`,
        err.message || err
      );
      process.exit(1);
    });
}

ACCOUNTS.forEach(createSelfbot);

// =====================[ Express Dashboard ]=====================

const express = require("express");
const app = express();
const PORT = process.env.PORT || 2000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`🌍 [HTTP] ${req.method} ${req.url}`);
  next();
});

// API: رجع الإعدادات الحالية + الإحصائيات
app.get("/api/settings", (req, res) => {
  const global = getGlobalStats();

  res.json({
    ok: true,
    messageDelay: MESSAGE_DELAY,
    defaultChannelId: DEFAULT_CHANNEL_ID,
    stats: global,
    accounts: {
      ACCOUNT_1: {
        ...settings.accounts.ACCOUNT_1,
        username: ACCOUNTS[0].client?.user?.username || null,
      },
      ACCOUNT_2: {
        ...settings.accounts.ACCOUNT_2,
        username: ACCOUNTS[1].client?.user?.username || null,
      },
    },
  });
});

// API: تحديث الإعدادات من الواجهة
app.post("/api/settings", (req, res) => {
  const body = req.body;

  if (!body || typeof body !== "object") {
    return res.status(400).json({ ok: false, error: "Invalid body" });
  }

  if (body.accounts) {
    if (body.accounts.ACCOUNT_1) {
      settings.accounts.ACCOUNT_1 = {
        ...settings.accounts.ACCOUNT_1,
        ...body.accounts.ACCOUNT_1,
      };
    }
    if (body.accounts.ACCOUNT_2) {
      settings.accounts.ACCOUNT_2 = {
        ...settings.accounts.ACCOUNT_2,
        ...body.accounts.ACCOUNT_2,
      };
    }
  }

  saveSettings();
  res.json({ ok: true, settings });
});

// Dashboard HTML
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ar">
<head>
<meta charset="UTF-8" />
<title>Selfbot Leveling Dashboard</title>
<style>
  body {
    margin: 0;
    background: #020617;
    color: #e5e7eb;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    direction: rtl;
  }
  .container {
    max-width: 950px;
    margin: 40px auto;
    padding: 0 16px;
  }
  .card {
    background: #0f172a;
    border-radius: 18px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 10px 25px rgba(15,23,42,0.8);
  }
  h1, h2, h3 {
    margin: 0 0 10px 0;
  }
  label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.9rem;
  }
  input[type="text"] {
    width: 100%;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid #1f2937;
    background: #020617;
    color: #e5e7eb;
    box-sizing: border-box;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
  }
  .col {
    flex: 1;
    min-width: 220px;
  }
  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    font-size: 0.9rem;
  }
  button {
    margin-top: 12px;
    padding: 10px 16px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    background: #22c55e;
    color: #022c22;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .pill {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    background: #111827;
    color: #9ca3af;
  }
  .pill.on {
    background: #16a34a33;
    color: #4ade80;
  }
  .pill.off {
    background: #b91c1c33;
    color: #fca5a5;
  }
  .statbox {
    background:#020617;
    border-radius:14px;
    padding:10px 12px;
    margin-top:8px;
    font-size:0.85rem;
  }
</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>🤖 Selfbot Leveling Dashboard</h1>
      <p>تحكم كامل من الموقع – حسابين، كل واحد يرسل <b>عربي</b> و <b>إنجليزي</b> كل <code>12000ms</code>.</p>
      <p style="font-size:0.85rem;color:#9ca3af">لا يتم تغيير الـ Status نهائياً (مافي أي setActivity في الكود).</p>
    </div>

    <div class="card" id="globalCard">
      <h2>📊 الإحصائيات العامة</h2>
      <div class="row">
        <div class="col">
          <div class="statbox">
            إجمالي الرسائل (كل الحسابات): <b id="globalTotal">-</b>
          </div>
        </div>
        <div class="col">
          <div class="statbox">
            Uptime: <span id="uptime">-</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card" id="infoCard">
      <h2>⚙️ إعدادات عامة</h2>
      <p>Message Delay: <code id="delay">-</code> ms</p>
      <p>Default Channel ID: <code id="defaultChannelId">-</code></p>
    </div>

    <div class="card">
      <h2>👥 الحسابات</h2>

      <div id="accountsArea">
        <div>جاري التحميل...</div>
      </div>

      <button id="saveBtn">💾 حفظ الإعدادات</button>
      <span id="statusMsg" style="margin-right:10px;font-size:0.85rem;"></span>
    </div>
  </div>

<script>
let settings = null;

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h + 'h ' + m + 'm ' + s + 's';
}

async function loadSettings() {
  const res = await fetch('/api/settings');
  const data = await res.json();
  if (!data.ok) return;

  settings = data;
  document.getElementById('delay').textContent = data.messageDelay;
  document.getElementById('defaultChannelId').textContent = data.defaultChannelId;

  // الإحصائيات العامة
  const stats = data.stats;
  document.getElementById('globalTotal').textContent = stats.globalTotal;
  document.getElementById('uptime').textContent = formatUptime(stats.uptimeSeconds);

  const area = document.getElementById('accountsArea');
  area.innerHTML = '';

  const accountNames = ['ACCOUNT_1', 'ACCOUNT_2'];

  accountNames.forEach((name) => {
    const acc = data.accounts[name];
    const st = stats.accounts[name];

    const wrapper = document.createElement('div');
    wrapper.className = 'card';
    wrapper.style.background = '#020617';
    wrapper.style.marginBottom = '12px';

    wrapper.innerHTML = \`
      <h3>\${name} 
        <span class="pill \${acc.enabled ? 'on' : 'off'}" id="\${name}_pill">
          \${acc.enabled ? 'شغال' : 'موقوف'}
        </span>
      </h3>
      <p style="font-size:0.85rem;color:#9ca3af">
        Username: <b>\${acc.username || '...'} </b>
      </p>

      <div class="row">
        <div class="col">
          <label>Channel ID</label>
          <input type="text" id="\${name}_channel" value="\${acc.channelId || ''}" />
          <div class="statbox" style="margin-top:10px;">
            <div>رسائل عربي: <b>\${st.ar}</b></div>
            <div>رسائل إنجليزي: <b>\${st.en}</b></div>
            <div>إجمالي هذا الحساب: <b>\${st.total}</b></div>
          </div>
        </div>
        <div class="col">
          <label>التحكم</label>
          <div class="checkbox-group">
            <input type="checkbox" id="\${name}_enabled" \${acc.enabled ? 'checked' : ''} />
            <span>تشغيل الحساب</span>
          </div>
          <div class="checkbox-group">
            <input type="checkbox" id="\${name}_ar" \${acc.sendArabic ? 'checked' : ''} />
            <span>إرسال عربي</span>
          </div>
          <div class="checkbox-group">
            <input type="checkbox" id="\${name}_eng" \${acc.sendEnglish ? 'checked' : ''} />
            <span>إرسال إنجليزي</span>
          </div>
        </div>
      </div>
    \`;

    area.appendChild(wrapper);

    const enabledCheckbox = wrapper.querySelector('#' + name + '_enabled');
    const pill = wrapper.querySelector('#' + name + '_pill');
    enabledCheckbox.addEventListener('change', () => {
      if (enabledCheckbox.checked) {
        pill.classList.remove('off');
        pill.classList.add('on');
        pill.textContent = 'شغال';
      } else {
        pill.classList.remove('on');
        pill.classList.add('off');
        pill.textContent = 'موقوف';
      }
    });
  });
}

async function saveSettings() {
  if (!settings) return;

  const body = {
    accounts: {
      ACCOUNT_1: {},
      ACCOUNT_2: {},
    },
  };

  ['ACCOUNT_1', 'ACCOUNT_2'].forEach((name) => {
    const channel = document.getElementById(name + '_channel').value.trim();
    const enabled = document.getElementById(name + '_enabled').checked;
    const ar = document.getElementById(name + '_ar').checked;
    const eng = document.getElementById(name + '_eng').checked;

    body.accounts[name] = {
      channelId: channel || null,
      enabled,
      sendArabic: ar,
      sendEnglish: eng,
    };
  });

  const btn = document.getElementById('saveBtn');
  const msg = document.getElementById('statusMsg');
  btn.disabled = true;
  msg.textContent = 'جاري الحفظ...';

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.ok) {
      msg.textContent = 'تم الحفظ ✅';
      setTimeout(() => (msg.textContent = ''), 2000);
    } else {
      msg.textContent = 'خطأ في الحفظ ❌';
    }
  } catch (e) {
    msg.textContent = 'خطأ في الاتصال بالسيرفر ❌';
  }

  btn.disabled = false;
}

document.getElementById('saveBtn').addEventListener('click', saveSettings);

loadSettings();
setInterval(loadSettings, 7000); // تحديث كل 7 ثواني
</script>
</body>
</html>
  `);
});

app.get("/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`🌐 Dashboard شغال على البورت ${PORT}`);
});
