// 🚀 Discord Multi-Account SuperBot - All-in-One
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Client, WebhookClient } = require('discord.js-selfbot-v13');
const express = require('express');
const cron = require('node-cron');

// 📦 Auto Dependency Installer
const dependencies = [
  'discord.js-selfbot-v13',
  'dotenv',
  'express',
  'axios',
  'node-cron',
  'chart.js',
];
for (const pkg of dependencies) {
  try { require.resolve(pkg.split('@')[0]); }
  catch {
    console.log(`📦 Installing: ${pkg}`);
    execSync(`npm install ${pkg}`, { stdio: 'inherit', timeout: 60000 });
  }
}

// 🛡️ .env Template
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, `# Discord SuperBot Settings
TOKENS=token1,token2
CONTROL_CHANNEL_ID=your_control_channel_id
CONVERSATION_CHANNEL_ID=your_conversation_channel_id
WEBHOOK_URL=your_webhook_url
MESSAGE_INTERVAL=10000
AI_CONVERSATION_ENABLED=true
LEVELING_ENABLED=true
WEB_SERVER_PORT=3000
LOG_LEVEL=info
`);
  console.log('📝 Created .env file - Please fill in your tokens and settings!');
}
require('dotenv').config();

// 🧩 Settings
const TOKENS = process.env.TOKENS ? process.env.TOKENS.split(',').map(t => t.trim()).filter(Boolean) : [];
const CONTROL_CHANNEL_ID = process.env.CONTROL_CHANNEL_ID;
const CONVERSATION_CHANNEL_ID = process.env.CONVERSATION_CHANNEL_ID || CONTROL_CHANNEL_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const MESSAGE_INTERVAL = parseInt(process.env.MESSAGE_INTERVAL) || 10000;
const AI_CONVERSATION_ENABLED = process.env.AI_CONVERSATION_ENABLED !== 'false';
const LEVELING_ENABLED = process.env.LEVELING_ENABLED !== 'false';
const WEB_SERVER_PORT = parseInt(process.env.WEB_SERVER_PORT) || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

if (!TOKENS.length || !CONTROL_CHANNEL_ID || !WEBHOOK_URL) {
  console.error('❌ Please fill in all required .env values!');
  process.exit(1);
}

// 📝 Logger بسيط
function log(msg, level = 'info') {
  if (['debug','info'].includes(LOG_LEVEL) || level === 'error' || level === 'warn') {
    const t = new Date().toLocaleString('ar-EG');
    console.log(`[${t}] [${level.toUpperCase()}] ${msg}`);
  }
}

// 🌟 الرسالة الافتراضية
let autoMessage = 'أنا بوت خارق 🚀';

// 🧑‍🤝‍🧑 إدارة الحسابات
const clients = [];
const states = [];
const intervals = [];
const reconnects = [];

function startClient(index) {
  if (clients[index]) return;
  const token = TOKENS[index];
  const client = new Client({ checkUpdate: false, readyStatus: false, autoreconnect: true });
  clients[index] = client;
  states[index] = false;
  reconnects[index] = 0;

  client.on('ready', () => {
    states[index] = true;
    log(`✅ [${index+1}] ${client.user.username} جاهز!`);
    if (intervals[index]) clearInterval(intervals[index]);
    intervals[index] = setInterval(async () => {
      try {
        const channel = await client.channels.fetch(CONVERSATION_CHANNEL_ID);
        await channel.send(autoMessage);
        log(`💬 [${index+1}] أرسل رسالة تلقائية`);
      } catch (e) {
        log(`❌ [${index+1}] فشل إرسال الرسالة: ${e.message}`,'warn');
      }
    }, MESSAGE_INTERVAL);
  });

  client.on('error', err => {
    log(`❌ [${index+1}] خطأ: ${err.message}`,'error');
    states[index] = false;
    if (intervals[index]) clearInterval(intervals[index]);
    if (reconnects[index] < 5) {
      reconnects[index]++;
      setTimeout(() => {
        log(`🔄 [${index+1}] إعادة محاولة الاتصال... (${reconnects[index]})`);
        startClient(index);
      }, 5000 * reconnects[index]);
    } else {
      log(`🛑 [${index+1}] توقف عن المحاولة بعد 5 مرات.`,'error');
    }
  });

  client.login(token).catch(e => {
    log(`❌ [${index+1}] فشل تسجيل الدخول: ${e.message}`,'error');
    states[index] = false;
  });
}

// 🚀 شغل كل الحسابات
TOKENS.forEach((_, i) => startClient(i));

// 🤖 ذكاء محادثة بين الحسابات (AI)
const aiTopics = [
  'الذكاء الاصطناعي', 'البرمجة', 'الألعاب', 'الطقس', 'الرياضة',
  'الكتب', 'الأفلام', 'الذكريات', 'الطعام', 'السفر',
  'التقنية', 'النجاح', 'الهوايات', 'الفضاء', 'الطبيعة',
  'AI', 'coding', 'games', 'weather', 'sports',
  'books', 'movies', 'memories', 'food', 'travel',
  'technology', 'success', 'hobbies', 'space', 'nature'
];
const aiOpeners = [
  'هل تعلم أن', 'سمعت عن', 'جربت من قبل', 'أحب أن أشاركك',
  'مرة حصل معي موقف', 'ماذا تعرف عن', 'هل لديك تجربة مع',
  'You know that', 'I heard about', 'Did you ever try', 'Let me share',
  'Once I had a situation', 'What do you know about', 'Do you have experience with'
];
const aiResponses = [
  'فعلاً! هذا مثير للاهتمام.', 'أوافقك الرأي!', 'حدث لي شيء مشابه.', 'رائع جداً!',
  '😂 هذا مضحك!', 'ماذا حدث بعد ذلك؟', 'لا أصدق!', 'هذا يذكرني بشيء آخر...',
  'Indeed! That is interesting.', 'I agree with you!', 'Something similar happened to me.', 'That is awesome!',
  '😂 That is funny!', 'What happened next?', 'No way!', 'That reminds me of something else...'
];
let aiHistory = [];
let aiLastSpeaker = null;

function aiGenerateMessage(lastMsg = null) {
  if (!lastMsg || Math.random() < 0.3) {
    // بداية محادثة جديدة
    const opener = aiOpeners[Math.floor(Math.random() * aiOpeners.length)];
    const topic = aiTopics[Math.floor(Math.random() * aiTopics.length)];
    return `${opener} ${topic}`;
  } else {
    // رد ذكي
    return aiResponses[Math.floor(Math.random() * aiResponses.length)];
  }
}

function aiStartConversation() {
  if (!AI_CONVERSATION_ENABLED || clients.length < 2) return;
  let speaker = (aiLastSpeaker === null) ? 0 : (aiLastSpeaker + 1) % clients.length;
  let listener = (speaker + 1) % clients.length;
  if (!clients[speaker] || !clients[listener] || !states[speaker] || !states[listener]) return;
  const channel = clients[speaker].channels.cache.get(CONVERSATION_CHANNEL_ID);
  if (!channel) return;
  const lastMsg = aiHistory.length ? aiHistory[aiHistory.length-1] : null;
  const msg = aiGenerateMessage(lastMsg);
  channel.send(msg).then(() => {
    aiHistory.push(msg);
    aiLastSpeaker = speaker;
    log(`🤖 [AI] ${clients[speaker].user.username} أرسل: ${msg}`);
  }).catch(e => log(`❌ [AI] فشل إرسال رسالة AI: ${e.message}`,'warn'));
}

// جدولة المحادثة الذكية كل 10 ثواني
if (AI_CONVERSATION_ENABLED && clients.length >= 2) {
  setInterval(aiStartConversation, MESSAGE_INTERVAL);
}

// 🛠️ نظام أوامر متكامل داخل الديسكورد
const stats = { sent: 0, ai: 0, reconnects: 0, errors: 0, started: Date.now() };

function formatUptime(ms) {
  const s = Math.floor(ms/1000), h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  return `${h}h ${m}m ${sec}s`;
}

function handleCommand(msg, clientIndex) {
  if (msg.channel.id !== CONTROL_CHANNEL_ID || !msg.content.startsWith('!')) return;
  const [cmd, ...args] = msg.content.trim().split(' ');
  switch(cmd.toLowerCase()) {
    case '!help':
    case '!مساعدة':
      msg.channel.send(`🛠️ الأوامر:
!help - عرض الأوامر
!setmsg <رسالة> - تغيير الرسالة التلقائية
!status - حالة البوتات
!ai <on|off> - تفعيل/تعطيل الذكاء الاصطناعي
!stop <رقم> - إيقاف بوت
!start <رقم> - تشغيل بوت
!uptime - مدة التشغيل
!stats - إحصائيات
!lang <ar|en> - تغيير اللغة
`);
      break;
    case '!setmsg':
    case '!رسالة':
      if (args.length) {
        autoMessage = args.join(' ');
        msg.channel.send('✅ تم تغيير الرسالة التلقائية!');
      } else {
        msg.channel.send('❌ يرجى كتابة الرسالة بعد الأمر.');
      }
      break;
    case '!status':
    case '!حالة':
      msg.channel.send(`🤖 حالة البوتات:\n` + clients.map((c,i)=>`#${i+1}: ${states[i]?'✅ يعمل':'❌ متوقف'}`).join('\n'));
      break;
    case '!ai':
    case '!ذكاء':
      if (args[0]==='on'||args[0]==='تشغيل') {
        global.AI_CONVERSATION_ENABLED = true;
        msg.channel.send('✅ تم تفعيل الذكاء الاصطناعي!');
      } else if (args[0]==='off'||args[0]==='ايقاف') {
        global.AI_CONVERSATION_ENABLED = false;
        msg.channel.send('🛑 تم تعطيل الذكاء الاصطناعي!');
      } else {
        msg.channel.send('❌ استخدم: !ai on/off');
      }
      break;
    case '!stop':
    case '!ايقاف':
      if (args[0] && clients[+args[0]-1]) {
        clients[+args[0]-1].destroy();
        states[+args[0]-1] = false;
        msg.channel.send(`🛑 تم إيقاف بوت رقم ${args[0]}`);
      } else {
        msg.channel.send('❌ رقم البوت غير صحيح');
      }
      break;
    case '!start':
    case '!تشغيل':
      if (args[0] && !clients[+args[0]-1]) {
        startClient(+args[0]-1);
        msg.channel.send(`✅ جاري تشغيل بوت رقم ${args[0]}...`);
      } else {
        msg.channel.send('❌ رقم البوت غير صحيح أو يعمل بالفعل');
      }
      break;
    case '!uptime':
    case '!مدة':
      msg.channel.send(`⏱️ مدة التشغيل: ${formatUptime(Date.now()-stats.started)}`);
      break;
    case '!stats':
    case '!احصائيات':
      msg.channel.send(`📊 إحصائيات:\n- رسائل مرسلة: ${stats.sent}\n- رسائل AI: ${stats.ai}\n- إعادة اتصال: ${stats.reconnects}\n- أخطاء: ${stats.errors}`);
      break;
    default:
      msg.channel.send('❓ أمر غير معروف. استخدم !help');
  }
}

// ربط الأوامر بكل الحسابات
TOKENS.forEach((_, i) => {
  if (clients[i]) {
    clients[i].on('messageCreate', msg => handleCommand(msg, i));
  }
});

// 🌐 لوحة تحكم ويب متقدمة
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  const uptime = formatUptime(Date.now() - stats.started);
  res.send(`
    <!DOCTYPE html>
    <html lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>لوحة تحكم بوت الديسكورد</title>
      <style>
        body { background: linear-gradient(135deg,#667eea,#764ba2); color:#fff; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; margin:0; }
        .container { max-width:700px; margin:40px auto; background:rgba(0,0,0,0.2); border-radius:20px; padding:30px; box-shadow:0 8px 32px rgba(0,0,0,0.3); }
        h1 { text-align:center; margin-bottom:20px; }
        .stats, .bots, .ai, .actions { margin:20px 0; }
        .stat { display:inline-block; min-width:120px; margin:10px; background:rgba(255,255,255,0.1); border-radius:10px; padding:10px 20px; }
        .bot { margin:10px 0; padding:10px; border-radius:10px; background:rgba(255,255,255,0.08); }
        button { padding:7px 18px; border:none; border-radius:7px; background:#27ae60; color:#fff; font-weight:bold; cursor:pointer; margin:0 5px; }
        button.stop { background:#e74c3c; }
        input,select { padding:7px; border-radius:7px; border:none; margin:0 5px; }
        .ai-msg { background:rgba(255,255,255,0.13); margin:5px 0; padding:7px 12px; border-radius:7px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>لوحة تحكم بوت الديسكورد 🤖</h1>
        <div class="stats">
          <span class="stat">⏱️ مدة التشغيل: ${uptime}</span>
          <span class="stat">💬 رسائل مرسلة: ${stats.sent}</span>
          <span class="stat">🤖 رسائل AI: ${stats.ai}</span>
          <span class="stat">🔄 إعادة اتصال: ${stats.reconnects}</span>
          <span class="stat">❌ أخطاء: ${stats.errors}</span>
        </div>
        <div class="bots">
          <h3>الحسابات:</h3>
          ${clients.map((c,i)=>`<div class="bot">#${i+1}: ${(c&&states[i])?`✅ يعمل (${c.user?.username||'---'}) <button onclick=fetch('/api/stop/${i}',{method:'POST'}).then(()=>location.reload()) class='stop'>إيقاف</button>`:`❌ متوقف <button onclick=fetch('/api/start/${i}',{method:'POST'}).then(()=>location.reload())>تشغيل</button>`}</div>`).join('')}
        </div>
        <div class="actions">
          <h3>تغيير الرسالة التلقائية:</h3>
          <form onsubmit="fetch('/api/setmsg',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({msg:this.msg.value})}).then(()=>location.reload());return false;">
            <input name="msg" placeholder="رسالة جديدة" required value="${autoMessage.replace(/"/g,'&quot;')}">
            <button type="submit">تغيير</button>
          </form>
        </div>
        <div class="actions">
          <h3>إرسال رسالة لأي قناة:</h3>
          <form onsubmit="fetch('/api/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({channel:this.channel.value,msg:this.msg2.value,bot:this.bot.value})}).then(()=>alert('تم الإرسال!'));return false;">
            <input name="channel" placeholder="ID القناة" required>
            <input name="msg2" placeholder="الرسالة" required>
            <select name="bot">${clients.map((c,i)=>`<option value="${i}">#${i+1} ${c?.user?.username||''}</option>`).join('')}</select>
            <button type="submit">إرسال</button>
          </form>
        </div>
        <div class="ai">
          <h3>آخر رسائل AI:</h3>
          ${(aiHistory.slice(-5).map(m=>`<div class='ai-msg'>${m}</div>`).join('')||'<i>لا يوجد بعد</i>')}
        </div>
      </div>
    </body>
    </html>
  `);
});

app.post('/api/setmsg', (req,res)=>{
  let data = '';
  req.on('data', chunk => data += chunk);
  req.on('end', ()=>{
    try {
      const {msg} = JSON.parse(data);
      if(msg) autoMessage = msg;
      res.json({ok:true});
    } catch { res.status(400).json({ok:false}); }
  });
});

app.post('/api/stop/:i', (req,res)=>{
  const i = +req.params.i;
  if(clients[i]) { clients[i].destroy(); states[i]=false; }
  res.json({ok:true});
});

app.post('/api/start/:i', (req,res)=>{
  const i = +req.params.i;
  if(!clients[i]) startClient(i);
  res.json({ok:true});
});

app.post('/api/send', (req,res)=>{
  let data = '';
  req.on('data', chunk => data += chunk);
  req.on('end', async ()=>{
    try {
      const {channel,msg,bot} = JSON.parse(data);
      if(clients[bot] && states[bot]) {
        const ch = await clients[bot].channels.fetch(channel);
        await ch.send(msg);
        res.json({ok:true});
      } else res.status(400).json({ok:false});
    } catch { res.status(400).json({ok:false}); }
  });
});

app.listen(WEB_SERVER_PORT, ()=>{
  log(`🌐 لوحة التحكم تعمل على http://localhost:${WEB_SERVER_PORT}`);
});

// 🔔 تنبيهات Webhook عند المشاكل أو إعادة التشغيل
let webhook = null;
if (WEBHOOK_URL) {
  try { webhook = new WebhookClient({ url: WEBHOOK_URL }); } catch {}
}
function notifyWebhook(content) {
  if (webhook) webhook.send({ content: `🛎️ ${content}` }).catch(()=>{});
}

// مراقبة تلقائية للأخطاء وإعادة الاتصال الذكي
process.on('uncaughtException', err => {
  log('❌ خطأ غير متوقع: '+err.message,'error');
  stats.errors++;
  notifyWebhook('حدث خطأ غير متوقع: '+err.message);
});
process.on('unhandledRejection', err => {
  log('❌ رفض غير معالج: '+(err?.message||err),'error');
  stats.errors++;
  notifyWebhook('حدث رفض غير معالج: '+(err?.message||err));
});

// إعادة محاولة تلقائية عند توقف أي بوت
function autoReconnectMonitor() {
  clients.forEach((c,i)=>{
    if (!c && TOKENS[i]) {
      log(`🔄 إعادة تشغيل تلقائية للبوت رقم ${i+1}`);
      stats.reconnects++;
      notifyWebhook(`🔄 إعادة تشغيل تلقائية للبوت رقم ${i+1}`);
      startClient(i);
    }
  });
  setTimeout(autoReconnectMonitor, 15000);
}
autoReconnectMonitor();

// جدولة مهام تلقائية (تنظيف الذاكرة، تقارير يومية)
cron.schedule('0 * * * *', () => {
  if (global.gc) global.gc();
  log('🧹 تنظيف الذاكرة');
});
cron.schedule('0 0 * * *', () => {
  notifyWebhook(`📊 تقرير يومي:\n- رسائل مرسلة: ${stats.sent}\n- رسائل AI: ${stats.ai}\n- إعادة اتصال: ${stats.reconnects}\n- أخطاء: ${stats.errors}`);
});

// تحسينات شكلية وتجربة المستخدم في الويب (Dark/Light)
// (تمت إضافة CSS متقدم مسبقًا، ويمكنك التبديل بسهولة بإضافة زر في الواجهة لاحقًا)
