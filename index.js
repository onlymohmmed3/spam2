// 🚀 Discord Bot Manager - Enhanced Version
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 📦 إدارة محسنة لتثبيت التبعيات
class DependencyManager {
  static dependencies = [
    "discord.js-selfbot-v13",
    "dotenv",
    "express",
    "sphinx-run"
  ];

  static async ensureDependencies() {
    console.log("🔍 فحص التبعيات...");
    
    for (const pkg of this.dependencies) {
      const name = pkg.split("@")[0];
      try {
        require.resolve(name);
        console.log(`✅ ${name} متوفر`);
      } catch (e) {
        console.log(`📦 تثبيت: ${pkg}`);
        try {
          execSync(`npm install ${pkg}`, { 
            stdio: "inherit",
            timeout: 30000 // timeout 30 seconds
          });
        } catch (installError) {
          console.error(`❌ فشل تثبيت ${pkg}:`, installError.message);
          process.exit(1);
        }
      }
    }
  }
}

// 🔧 إعداد البيئة المحسن
class ConfigManager {
  static loadConfig() {
    // إنشاء ملف .env إذا لم يكن موجوداً
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      const envTemplate = `# Discord Bot Configuration
CONTROL_CHANNEL_ID=your_channel_id_here
WEBHOOK_URL=your_webhook_url_here
TOKEN1=your_first_bot_token_here
TOKEN2=your_second_bot_token_here

# Optional Settings
LOG_LEVEL=info
SPAM_BASE_TIME=4000
SPAM_VARIATION=1500
STATUS_INTERVAL=3600000
`;
      fs.writeFileSync(envPath, envTemplate);
      console.log("📝 تم إنشاء ملف .env - يرجى تعبئة البيانات المطلوبة");
    }

    require("dotenv").config();
    
    // التحقق من المتغيرات المطلوبة
    const required = ['CONTROL_CHANNEL_ID', 'WEBHOOK_URL', 'TOKEN1', 'TOKEN2'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error("❌ متغيرات مطلوبة غير موجودة:", missing.join(', '));
      process.exit(1);
    }

    return {
      CONTROL_CHANNEL_ID: process.env.CONTROL_CHANNEL_ID,
      WEBHOOK_URL: process.env.WEBHOOK_URL,
      TOKEN1: process.env.TOKEN1,
      TOKEN2: process.env.TOKEN2,
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
      SPAM_BASE_TIME: parseInt(process.env.SPAM_BASE_TIME) || 4000,
      SPAM_VARIATION: parseInt(process.env.SPAM_VARIATION) || 1500,
      STATUS_INTERVAL: parseInt(process.env.STATUS_INTERVAL) || 3600000
    };
  }
}

// 📝 نظام لوغينغ محسن
class Logger {
  static levels = { error: 0, warn: 1, info: 2, debug: 3 };
  static currentLevel = 2;

  static setLevel(level) {
    this.currentLevel = this.levels[level] || 2;
  }

  static format(level, message, extra = '') {
    const timestamp = new Date().toLocaleString("ar-EG", {
      timeZone: "Asia/Riyadh",
      hour12: false,
    });
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${extra}`;
  }

  static error(message, error = null) {
    if (this.currentLevel >= 0) {
      console.error(this.format('error', message, error ? error.message : ''));
    }
  }

  static warn(message) {
    if (this.currentLevel >= 1) {
      console.warn(this.format('warn', message));
    }
  }

  static info(message) {
    if (this.currentLevel >= 2) {
      console.log(this.format('info', message));
    }
  }

  static debug(message) {
    if (this.currentLevel >= 3) {
      console.log(this.format('debug', message));
    }
  }
}

// 🎯 إدارة محسنة للويب هوك
class WebhookManager {
  constructor(webhookUrl) {
    const { WebhookClient } = require("discord.js-selfbot-v13");
    this.webhook = new WebhookClient({ url: webhookUrl });
    this.queue = [];
    this.processing = false;
    this.rateLimitDelay = 1000; // 1 second between messages
  }

  async send(content, options = {}) {
    const message = {
      content: this.formatMessage(content),
      username: options.username || "📡 Bot Manager",
      avatarURL: options.avatarURL || "https://i.imgur.com/AfFp7pu.png",
      ...options
    };

    this.queue.push(message);
    this.processQueue();
  }

  formatMessage(content) {
    const now = new Date().toLocaleString("ar-EG", {
      timeZone: "Asia/Riyadh",
      hour12: false,
    });
    return `🕓 **${now}**\n${content}`;
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const message = this.queue.shift();
      try {
        await this.webhook.send(message);
        Logger.debug("Webhook message sent successfully");
      } catch (error) {
        Logger.error("Failed to send webhook message", error);
        // إعادة إضافة الرسالة للطابور في حالة فشل الإرسال
        if (error.status !== 404) { // لا نعيد إرسال إذا كان الويب هوك غير موجود
          this.queue.unshift(message);
        }
      }
      
      // انتظار لتجنب rate limiting
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
    }
    
    this.processing = false;
  }
}

// 🤖 إدارة محسنة للبوت
class BotManager {
  constructor(config) {
    this.config = config;
    this.clients = [null, null];
    this.levelings = [null, null];
    this.tokens = [config.TOKEN1, config.TOKEN2];
    this.states = [false, false];
    this.webhookManager = new WebhookManager(config.WEBHOOK_URL);
    this.startTime = Date.now();
    this.statusIntervals = [null, null];
    this.reconnectAttempts = [0, 0];
    this.maxReconnectAttempts = 5;
    
    Logger.setLevel(config.LOG_LEVEL);
    
    // معالجة إشارات النظام للإغلاق الآمن
    process.on('SIGINT', () => this.gracefulShutdown());
    process.on('SIGTERM', () => this.gracefulShutdown());
    process.on('unhandledRejection', (reason, promise) => {
      Logger.error('Unhandled Promise Rejection', reason);
    });
    process.on('uncaughtException', (error) => {
      Logger.error('Uncaught Exception', error);
      this.gracefulShutdown();
    });
  }

  // ⏱️ توليد وقت عشوائي محسن
  getRandomTime(base = null, variation = null) {
    const baseTime = base || this.config.SPAM_BASE_TIME;
    const varTime = variation || this.config.SPAM_VARIATION;
    
    // إضافة تنويع أكثر طبيعية
    const randomFactor = 0.8 + Math.random() * 0.4; // between 0.8 and 1.2
    const finalTime = baseTime * randomFactor + Math.floor(Math.random() * varTime) - varTime / 2;
    
    return Math.max(1000, Math.floor(finalTime)); // minimum 1 second
  }

  async startClient(index) {
    if (this.clients[index]) {
      Logger.warn(`Client ${index + 1} is already running`);
      return;
    }

    try {
      const { Client } = require("discord.js-selfbot-v13");
      const { userAccount } = require("sphinx-run");
      
      const client = new Client({ 
        checkUpdate: false,
        readyStatus: false,
        autoreconnect: true
      });
      
      this.clients[index] = client;
      this.reconnectAttempts[index] = 0;

      // معالجة الأحداث
      client.on("ready", () => {
        Logger.info(`Client ${index + 1} (${client.user.username}) is ready`);
        this.states[index] = true;
        this.reconnectAttempts[index] = 0;
        
        // إعداد نظام الـ leveling
        const leveling = new userAccount(client, require("discord.js-selfbot-v13"));
        this.levelings[index] = leveling;

        // تشغيل الـ leveling بلغات متعددة
        leveling.leveling({
          channel: this.config.CONTROL_CHANNEL_ID,
          time: this.getRandomTime(),
          randomLetters: false,
          type: "ar",
        });

        leveling.leveling({
          channel: this.config.CONTROL_CHANNEL_ID,
          time: this.getRandomTime(),
          randomLetters: false,
          type: "eng",
        });

        // إرسال إشعار النجاح
        this.webhookManager.send(`✅ الحساب ${index + 1} **${client.user.username}** اشتغل بنجاح`);

        // إرسال تحديثات دورية
        this.statusIntervals[index] = setInterval(() => {
          this.webhookManager.send(`📢 الحساب ${index + 1} **${client.user.username}** لا يزال يعمل بنجاح`);
        }, this.config.STATUS_INTERVAL);
      });

      client.on("disconnect", () => {
        Logger.warn(`Client ${index + 1} disconnected`);
        this.states[index] = false;
      });

      client.on("error", (error) => {
        Logger.error(`Client ${index + 1} error`, error);
        this.handleClientError(index, error);
      });

      // معالجة الأوامر (فقط للعميل الأول)
      if (index === 0) {
        client.on("messageCreate", (msg) => this.handleCommand(msg));
      }

      await client.login(this.tokens[index]);
      
    } catch (error) {
      Logger.error(`Failed to start client ${index + 1}`, error);
      this.handleClientError(index, error);
    }
  }

  handleClientError(index, error) {
    this.clients[index] = null;
    this.states[index] = false;
    
    if (this.statusIntervals[index]) {
      clearInterval(this.statusIntervals[index]);
      this.statusIntervals[index] = null;
    }

    // إعادة المحاولة التلقائية
    if (this.reconnectAttempts[index] < this.maxReconnectAttempts) {
      this.reconnectAttempts[index]++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts[index]), 30000); // exponential backoff, max 30s
      
      Logger.info(`Attempting to reconnect client ${index + 1} in ${delay}ms (attempt ${this.reconnectAttempts[index]})`);
      
      setTimeout(() => {
        this.startClient(index);
      }, delay);
    } else {
      Logger.error(`Max reconnection attempts reached for client ${index + 1}`);
      this.webhookManager.send(`❌ الحساب ${index + 1} فشل في الاتصال بعد ${this.maxReconnectAttempts} محاولات`);
    }
  }

  stopClient(index, callback = null) {
    if (this.clients[index]) {
      this.clients[index].destroy();
      this.clients[index] = null;
      this.states[index] = false;
      this.reconnectAttempts[index] = 0;
      
      if (this.statusIntervals[index]) {
        clearInterval(this.statusIntervals[index]);
        this.statusIntervals[index] = null;
      }
      
      Logger.info(`Client ${index + 1} stopped`);
    }
    
    if (callback) {
      setTimeout(callback, 1000); // انتظار ثانية قبل تنفيذ الCallback
    }
  }

  handleCommand(msg) {
    if (msg.channel.id !== this.config.CONTROL_CHANNEL_ID || !msg.content.startsWith("!")) {
      return;
    }

    const args = msg.content.trim().split(" ");
    const command = args[0].toLowerCase();
    const arg = args[1];

    Logger.debug(`Received command: ${command} ${arg || ''}`);

    const commands = {
      "!help": () => {
        const helpText = `🛠️ **الأوامر المتاحة:**
\`!help\` - عرض قائمة الأوامر
\`!status\` - حالة الحسابات
\`!stop <1|2>\` - إيقاف حساب معين
\`!start <1|2>\` - تشغيل حساب معين
\`!restart <1|2>\` - إعادة تشغيل حساب معين
\`!uptime\` - مدة التشغيل
\`!ping\` - اختبار الاستجابة
\`!stats\` - إحصائيات مفصلة
\`!config\` - عرض الإعدادات الحالية`;
        this.webhookManager.send(helpText);
      },

      "!status": () => {
        const status1 = this.states[0] ? "✅ شغال" : "❌ موقف";
        const status2 = this.states[1] ? "✅ شغال" : "❌ موقف";
        const reconnect1 = this.reconnectAttempts[0] > 0 ? ` (${this.reconnectAttempts[0]} محاولات)` : "";
        const reconnect2 = this.reconnectAttempts[1] > 0 ? ` (${this.reconnectAttempts[1]} محاولات)` : "";
        
        this.webhookManager.send(`📊 **الحالة:**
- Client 1: ${status1}${reconnect1}
- Client 2: ${status2}${reconnect2}`);
      },

      "!stop": () => {
        const clientIndex = parseInt(arg) - 1;
        if (clientIndex >= 0 && clientIndex < 2) {
          this.stopClient(clientIndex);
          this.webhookManager.send(`⛔ تم إيقاف الحساب ${arg}`);
        } else {
          this.webhookManager.send(`❌ رقم حساب غير صحيح. استخدم 1 أو 2`);
        }
      },

      "!start": () => {
        const clientIndex = parseInt(arg) - 1;
        if (clientIndex >= 0 && clientIndex < 2) {
          this.startClient(clientIndex);
          this.webhookManager.send(`▶️ جاري تشغيل الحساب ${arg}...`);
        } else {
          this.webhookManager.send(`❌ رقم حساب غير صحيح. استخدم 1 أو 2`);
        }
      },

      "!restart": () => {
        const clientIndex = parseInt(arg) - 1;
        if (clientIndex >= 0 && clientIndex < 2) {
          this.stopClient(clientIndex, () => {
            setTimeout(() => this.startClient(clientIndex), 2000);
          });
          this.webhookManager.send(`🔄 جاري إعادة تشغيل الحساب ${arg}...`);
        } else {
          this.webhookManager.send(`❌ رقم حساب غير صحيح. استخدم 1 أو 2`);
        }
      },

      "!uptime": () => {
        const uptimeMs = Date.now() - this.startTime;
        const seconds = Math.floor(uptimeMs / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        this.webhookManager.send(`⏱️ مدة التشغيل: ${hours} ساعة و ${minutes} دقيقة و ${secs} ثانية`);
      },

      "!ping": () => {
        const ping = Date.now() - msg.createdTimestamp;
        this.webhookManager.send(`🏓 Ping: ${ping}ms`);
      },

      "!stats": () => {
        const memUsage = process.memoryUsage();
        const uptime = process.uptime();
        
        const stats = `📈 **إحصائيات النظام:**
💾 **الذاكرة:**
- RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB
- Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB
- External: ${Math.round(memUsage.external / 1024 / 1024)} MB

⏱️ **الأداء:**
- Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m
- Node.js: ${process.version}
- Platform: ${process.platform}`;

        this.webhookManager.send(stats);
      },

      "!config": () => {
        const config = `⚙️ **الإعدادات الحالية:**
- Base Time: ${this.config.SPAM_BASE_TIME}ms
- Variation: ${this.config.SPAM_VARIATION}ms
- Status Interval: ${Math.floor(this.config.STATUS_INTERVAL / 60000)} دقيقة
- Log Level: ${this.config.LOG_LEVEL}
- Max Reconnect Attempts: ${this.maxReconnectAttempts}`;

        this.webhookManager.send(config);
      }
    };

    const commandFunction = commands[command];
    if (commandFunction) {
      try {
        commandFunction();
      } catch (error) {
        Logger.error(`Error executing command ${command}`, error);
        this.webhookManager.send(`❌ خطأ في تنفيذ الأمر: ${error.message}`);
      }
    } else {
      this.webhookManager.send(`❓ أمر غير معروف. استخدم \`!help\` لعرض الأوامر المتاحة`);
    }
  }

  async gracefulShutdown() {
    Logger.info("🛑 بدء الإغلاق الآمن...");
    
    // إيقاف جميع العملاء
    for (let i = 0; i < this.clients.length; i++) {
      if (this.clients[i]) {
        this.stopClient(i);
      }
    }
    
    // إرسال إشعار الإغلاق
    await this.webhookManager.send("🛑 تم إيقاف البوت بأمان");
    
    // انتظار لإنهاء العمليات
    setTimeout(() => {
      Logger.info("✅ تم الإغلاق بنجاح");
      process.exit(0);
    }, 2000);
  }

  async start() {
    Logger.info("🚀 بدء تشغيل Bot Manager...");
    
    try {
      await this.startClient(0);
      await new Promise(resolve => setTimeout(resolve, 2000)); // انتظار بين العملاء
      await this.startClient(1);
      
      Logger.info("✅ تم تشغيل جميع العملاء");
    } catch (error) {
      Logger.error("Failed to start bot manager", error);
      this.webhookManager.send(`❌ فشل في بدء التشغيل: ${error.message}`);
    }
  }
}

// 🌐 سيرفر ويب محسن
class WebServer {
  constructor(port = 3000) {
    this.port = port;
    this.app = require("express")();
    this.setupRoutes();
  }

  setupRoutes() {
    // الصفحة الرئيسية
    this.app.get("/", (req, res) => {
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      
      res.send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>🤖 Discord Bot Manager</title>
          <style>
            body { font-family: Arial, sans-serif; background: #2c3e50; color: white; text-align: center; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .status { background: #27ae60; padding: 10px; border-radius: 5px; margin: 10px 0; }
            .info { background: #3498db; padding: 10px; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🤖 Discord Bot Manager</h1>
            <div class="status">
              ✅ البوت يعمل بنجاح
            </div>
            <div class="info">
              ⏱️ مدة التشغيل: ${hours} ساعة و ${minutes} دقيقة
            </div>
            <div class="info">
              🔧 Node.js ${process.version}
            </div>
            <p>استخدم الأوامر في قناة Discord للتحكم بالبوت</p>
          </div>
        </body>
        </html>
      `);
    });

    // معلومات الحالة (JSON API)
    this.app.get("/status", (req, res) => {
      res.json({
        status: "running",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        timestamp: new Date().toISOString()
      });
    });

    // Health check
    this.app.get("/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      Logger.info(`🌐 Web server running on port ${this.port}`);
    });
  }
}

// 🎯 تشغيل التطبيق الرئيسي
async function main() {
  try {
    // تثبيت التبعيات
    await DependencyManager.ensureDependencies();
    
    // تحميل الإعدادات
    const config = ConfigManager.loadConfig();
    
    // إنشاء مدير البوت
    const botManager = new BotManager(config);
    
    // تشغيل السيرفر
    const webServer = new WebServer();
    webServer.start();
    
    // تشغيل البوت
    await botManager.start();
    
    Logger.info("🎉 تم تشغيل النظام بنجاح!");
    
  } catch (error) {
    Logger.error("Fatal error during startup", error);
    process.exit(1);
  }
}

// تشغيل التطبيق
if (require.main === module) {
  main().catch(error => {
    console.error("❌ خطأ في التشغيل:", error);
    process.exit(1);
  });
}

module.exports = { BotManager, WebServer, ConfigManager, Logger };
