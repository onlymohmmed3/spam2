// 🚀 Discord Bot Manager - Enhanced Version with AI Conversations
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 📦 إدارة محسنة لتثبيت التبعيات
class DependencyManager {
  static dependencies = [
    "discord.js-selfbot-v13",
    "dotenv",
    "express",
    "sphinx-run",
    "axios",
    "node-cron"
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
            timeout: 30000
          });
        } catch (installError) {
          console.error(`❌ فشل تثبيت ${pkg}:`, installError.message);
          process.exit(1);
        }
      }
    }
  }
}

// 🧠 مولد المحادثات الذكية
class AIConversationEngine {
  constructor() {
    this.topics = [
      "القصص الشعبية", "الذكريات الجميلة", "الطبخ", "الرياضة", "الألعاب",
      "الأفلام", "الكتب", "السفر", "التكنولوجيا", "الطقس", "الأحلام",
      "الهوايات", "الفن", "الموسيقى", "التاريخ", "العلوم", "الطبيعة"
    ];
    
    this.storyTemplates = [
      "كان في واحد من الناس...",
      "حصلت معي قصة غريبة...",
      "أتذكر لما كنت صغير...",
      "في يوم من الأيام...",
      "حكالي صديقي قصة...",
      "شفت حلم عجيب البارحة...",
      "كان عندنا في الحي...",
      "سمعت قصة مضحكة..."
    ];

    this.responses = [
      "والله قصة حلوة! 😊",
      "هذا يذكرني بـ...",
      "صدقت! أنا كمان...",
      "ما شاء الله عليك 👏",
      "هههههه مضحك! 😂",
      "جد؟ وش صار بعدين؟",
      "لا والله! محد يصدق 😱",
      "أقولك على شي أحلى..."
    ];

    this.conversationHistory = [];
    this.lastSpeaker = null;
    this.conversationDepth = 0;
  }

  generateStory() {
    const template = this.topics[Math.floor(Math.random() * this.topics.length)];
    const starter = this.storyTemplates[Math.floor(Math.random() * this.storyTemplates.length)];
    
    const stories = {
      "القصص الشعبية": [
        "كان في واحد يحب يسافر كثير، ويوم من الأيام راح لبلد بعيد ولقى شيء ما توقعه أبداً...",
        "حكالي جدي قصة عن رجل عنده حكمة عجيبة، كل الناس تجي تستشيره...",
        "في قديم الزمان، كان في تاجر ذكي جداً، بس صار معه موقف غير حياته..."
      ],
      "الذكريات الجميلة": [
        "أتذكر أيام المدرسة، كنا نلعب في الفسحة ونضحك من أتفه الأشياء...",
        "كان عندنا معلم يحكيلنا قصص حلوة، كنا ننتظر حصته بفارغ الصبر...",
        "أحلى ذكرى عندي لما كنا نروح البر مع الأهل، كنا نسوي شوي ونقعد نتكلم..."
      ],
      "الطبخ": [
        "أمي تطبخ أحلى أكل في الدنيا، خاصة الكبسة، ريحتها تملأ البيت...",
        "جربت أطبخ مرة وحرقت الأكل، صارت قصة نضحك عليها لحد الآن...",
        "في مطعم صغير في حينا، الأكل فيه أحلى من المطاعم الفخمة..."
      ]
    };

    const topicStories = stories[template] || [
      `${starter} قصة حلوة عن ${template}، بس طويلة شوي 😊`
    ];

    return topicStories[Math.floor(Math.random() * topicStories.length)];
  }

  generateResponse(lastMessage) {
    const response = this.responses[Math.floor(Math.random() * this.responses.length)];
    
    // إضافة المزيد من التفاعل حسب المحادثة
    if (this.conversationDepth > 3) {
      const continuations = [
        "طيب خلاص، أقولك على موضوع ثاني...",
        "بس كفاية هالموضوع، نتكلم عن شي ثاني؟",
        "أوكي، وش رايك نغير الموضوع؟"
      ];
      
      if (Math.random() < 0.3) {
        return continuations[Math.floor(Math.random() * continuations.length)];
      }
    }

    // إضافة قصة جديدة أحياناً
    if (Math.random() < 0.4) {
      return `${response} ${this.generateStory()}`;
    }

    return response;
  }

  getNextMessage(speakerId) {
    if (this.lastSpeaker === speakerId) {
      return null; // منع نفس البوت من الكلام مرتين متتاليتين
    }

    let message;
    
    if (this.conversationHistory.length === 0 || Math.random() < 0.3) {
      // بدء محادثة جديدة
      message = this.generateStory();
      this.conversationDepth = 0;
    } else {
      // الرد على آخر رسالة
      message = this.generateResponse(this.conversationHistory[this.conversationHistory.length - 1]);
    }

    this.conversationHistory.push(message);
    this.lastSpeaker = speakerId;
    this.conversationDepth++;

    // إعادة تعيين المحادثة إذا طالت كثير
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-10);
      this.conversationDepth = 0;
    }

    return message;
  }

  resetConversation() {
    this.conversationHistory = [];
    this.lastSpeaker = null;
    this.conversationDepth = 0;
  }
}

// 🔧 إعداد البيئة المحسن
class ConfigManager {
  static loadConfig() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      const envTemplate = `# Discord Bot Configuration
CONTROL_CHANNEL_ID=your_channel_id_here
CONVERSATION_CHANNEL_ID=your_conversation_channel_id_here
WEBHOOK_URL=your_webhook_url_here
TOKEN1=your_first_bot_token_here
TOKEN2=your_second_bot_token_here

# AI Conversation Settings
AI_CONVERSATION_ENABLED=true
CONVERSATION_INTERVAL_MIN=8000
CONVERSATION_INTERVAL_MAX=15000
CONVERSATION_CHANCE=0.7

# Leveling Settings
LEVELING_ENABLED=true
SPAM_BASE_TIME=4000
SPAM_VARIATION=1500

# System Settings
LOG_LEVEL=info
STATUS_INTERVAL=3600000
WEB_SERVER_PORT=3000
`;
      fs.writeFileSync(envPath, envTemplate);
      console.log("📝 تم إنشاء ملف .env - يرجى تعبئة البيانات المطلوبة");
    }

    require("dotenv").config();
    
    const required = ['CONTROL_CHANNEL_ID', 'WEBHOOK_URL', 'TOKEN1', 'TOKEN2'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error("❌ متغيرات مطلوبة غير موجودة:", missing.join(', '));
      process.exit(1);
    }

    return {
      CONTROL_CHANNEL_ID: process.env.CONTROL_CHANNEL_ID,
      CONVERSATION_CHANNEL_ID: process.env.CONVERSATION_CHANNEL_ID || process.env.CONTROL_CHANNEL_ID,
      WEBHOOK_URL: process.env.WEBHOOK_URL,
      TOKEN1: process.env.TOKEN1,
      TOKEN2: process.env.TOKEN2,
      
      // AI Conversation Settings
      AI_CONVERSATION_ENABLED: process.env.AI_CONVERSATION_ENABLED !== 'false',
      CONVERSATION_INTERVAL_MIN: parseInt(process.env.CONVERSATION_INTERVAL_MIN) || 8000,
      CONVERSATION_INTERVAL_MAX: parseInt(process.env.CONVERSATION_INTERVAL_MAX) || 15000,
      CONVERSATION_CHANCE: parseFloat(process.env.CONVERSATION_CHANCE) || 0.7,
      
      // Leveling Settings
      LEVELING_ENABLED: process.env.LEVELING_ENABLED !== 'false',
      SPAM_BASE_TIME: parseInt(process.env.SPAM_BASE_TIME) || 4000,
      SPAM_VARIATION: parseInt(process.env.SPAM_VARIATION) || 1500,
      
      // System Settings
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
      STATUS_INTERVAL: parseInt(process.env.STATUS_INTERVAL) || 3600000,
      WEB_SERVER_PORT: parseInt(process.env.WEB_SERVER_PORT) || 3000
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
    this.rateLimitDelay = 1000;
  }

  async send(content, options = {}) {
    const message = {
      content: this.formatMessage(content),
      username: options.username || "🤖 Bot Manager",
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
        if (error.status !== 404) {
          this.queue.unshift(message);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
    }
    
    this.processing = false;
  }
}

// 📊 إحصائيات متقدمة
class StatsManager {
  constructor() {
    this.stats = {
      startTime: Date.now(),
      messagesProcessed: 0,
      commandsExecuted: 0,
      aiConversations: 0,
      levelingMessages: 0,
      reconnections: 0,
      errors: 0
    };
  }

  increment(stat) {
    if (this.stats.hasOwnProperty(stat)) {
      this.stats[stat]++;
    }
  }

  getStats() {
    const uptime = Date.now() - this.stats.startTime;
    return {
      ...this.stats,
      uptime: uptime,
      uptimeFormatted: this.formatUptime(uptime)
    };
  }

  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
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
    this.aiEngine = new AIConversationEngine();
    this.statsManager = new StatsManager();
    this.conversationTimeout = null;
    this.nextSpeaker = 0;
    this.statusIntervals = [null, null];
    this.reconnectAttempts = [0, 0];
    this.maxReconnectAttempts = 5;
    
    Logger.setLevel(config.LOG_LEVEL);
    
    // معالجة إشارات النظام
    process.on('SIGINT', () => this.gracefulShutdown());
    process.on('SIGTERM', () => this.gracefulShutdown());
    process.on('unhandledRejection', (reason, promise) => {
      Logger.error('Unhandled Promise Rejection', reason);
      this.statsManager.increment('errors');
    });
    process.on('uncaughtException', (error) => {
      Logger.error('Uncaught Exception', error);
      this.statsManager.increment('errors');
      this.gracefulShutdown();
    });
  }

  getRandomTime(base = null, variation = null) {
    const baseTime = base || this.config.SPAM_BASE_TIME;
    const varTime = variation || this.config.SPAM_VARIATION;
    
    const randomFactor = 0.8 + Math.random() * 0.4;
    const finalTime = baseTime * randomFactor + Math.floor(Math.random() * varTime) - varTime / 2;
    
    return Math.max(1000, Math.floor(finalTime));
  }

  getConversationInterval() {
    const min = this.config.CONVERSATION_INTERVAL_MIN;
    const max = this.config.CONVERSATION_INTERVAL_MAX;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async startAIConversation() {
    if (!this.config.AI_CONVERSATION_ENABLED) return;
    
    // التحقق من أن كلا البوتين متصلين
    if (!this.states[0] || !this.states[1]) {
      this.scheduleNextConversation();
      return;
    }

    // احتمالية بدء المحادثة
    if (Math.random() > this.config.CONVERSATION_CHANCE) {
      this.scheduleNextConversation();
      return;
    }

    const speakerId = this.nextSpeaker;
    const message = this.aiEngine.getNextMessage(speakerId);
    
    if (message && this.clients[speakerId]) {
      try {
        const channel = await this.clients[speakerId].channels.fetch(this.config.CONVERSATION_CHANNEL_ID);
        await channel.send(message);
        
        this.statsManager.increment('aiConversations');
        this.nextSpeaker = speakerId === 0 ? 1 : 0;
        
        Logger.debug(`AI Conversation: Bot ${speakerId + 1} sent message`);
      } catch (error) {
        Logger.error(`Failed to send AI conversation message from bot ${speakerId + 1}`, error);
        this.statsManager.increment('errors');
      }
    }

    this.scheduleNextConversation();
  }

  scheduleNextConversation() {
    if (this.conversationTimeout) {
      clearTimeout(this.conversationTimeout);
    }

    const interval = this.getConversationInterval();
    this.conversationTimeout = setTimeout(() => {
      this.startAIConversation();
    }, interval);
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

      client.on("ready", () => {
        Logger.info(`Client ${index + 1} (${client.user.username}) is ready`);
        this.states[index] = true;
        this.reconnectAttempts[index] = 0;
        
        // إعداد نظام الـ leveling
        if (this.config.LEVELING_ENABLED) {
          const leveling = new userAccount(client, require("discord.js-selfbot-v13"));
          this.levelings[index] = leveling;

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
        }

        // بدء المحادثات الذكية إذا كان هذا أول بوت يتصل
        if (index === 0 && this.config.AI_CONVERSATION_ENABLED) {
          this.scheduleNextConversation();
        }

        this.webhookManager.send(`✅ الحساب ${index + 1} **${client.user.username}** اشتغل بنجاح`);

        // إرسال تحديثات دورية
        this.statusIntervals[index] = setInterval(() => {
          this.webhookManager.send(`📢 الحساب ${index + 1} **${client.user.username}** لا يزال يعمل بنجاح`);
        }, this.config.STATUS_INTERVAL);
      });

      client.on("messageCreate", (msg) => {
        this.statsManager.increment('messagesProcessed');
        
        // معالجة الأوامر (فقط للعميل الأول)
        if (index === 0) {
          this.handleCommand(msg);
        }
      });

      client.on("disconnect", () => {
        Logger.warn(`Client ${index + 1} disconnected`);
        this.states[index] = false;
      });

      client.on("error", (error) => {
        Logger.error(`Client ${index + 1} error`, error);
        this.statsManager.increment('errors');
        this.handleClientError(index, error);
      });

      await client.login(this.tokens[index]);
      
    } catch (error) {
      Logger.error(`Failed to start client ${index + 1}`, error);
      this.statsManager.increment('errors');
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

    if (this.reconnectAttempts[index] < this.maxReconnectAttempts) {
      this.reconnectAttempts[index]++;
      this.statsManager.increment('reconnections');
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts[index]), 30000);
      
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
      setTimeout(callback, 1000);
    }
  }

  handleCommand(msg) {
    if (msg.channel.id !== this.config.CONTROL_CHANNEL_ID || !msg.content.startsWith("!")) {
      return;
    }

    const args = msg.content.trim().split(" ");
    const command = args[0].toLowerCase();
    const arg = args[1];

    this.statsManager.increment('commandsExecuted');
    Logger.debug(`Received command: ${command} ${arg || ''}`);

    const commands = {
      "!help": () => {
        const helpText = `🛠️ **الأوامر المتاحة:**
\`!help\` - عرض قائمة الأوامر
\`!status\` - حالة الحسابات
\`!stop <1|2>\` - إيقاف حساب معين
\`!start <1|2>\` - تشغيل حساب معين
\`!restart <1|2>\` - إعادة تشغيل حساب معين
\`!conversation <on|off|reset>\` - التحكم بالمحادثات الذكية
\`!leveling <on|off>\` - التحكم بنظام الـ leveling
\`!uptime\` - مدة التشغيل
\`!ping\` - اختبار الاستجابة
\`!stats\` - إحصائيات مفصلة
\`!config\` - عرض الإعدادات الحالية
\`!logs\` - عرض آخر الأحداث`;
        this.webhookManager.send(helpText);
      },

      "!status": () => {
        const status1 = this.states[0] ? "✅ شغال" : "❌ موقف";
        const status2 = this.states[1] ? "✅ شغال" : "❌ موقف";
        const reconnect1 = this.reconnectAttempts[0] > 0 ? ` (${this.reconnectAttempts[0]} محاولات)` : "";
        const reconnect2 = this.reconnectAttempts[1] > 0 ? ` (${this.reconnectAttempts[1]} محاولات)` : "";
        const aiStatus = this.config.AI_CONVERSATION_ENABLED ? "✅ مفعل" : "❌ معطل";
        const levelingStatus = this.config.LEVELING_ENABLED ? "✅ مفعل" : "❌ معطل";
        
        this.webhookManager.send(`📊 **الحالة:**
- Client 1: ${status1}${reconnect1}
- Client 2: ${status2}${reconnect2}
- المحادثات الذكية: ${aiStatus}
- نظام Leveling: ${levelingStatus}`);
      },

      "!conversation": () => {
        if (arg === "on") {
          this.config.AI_CONVERSATION_ENABLED = true;
          this.scheduleNextConversation();
          this.webhookManager.send("🤖 تم تفعيل المحادثات الذكية");
        } else if (arg === "off") {
          this.config.AI_CONVERSATION_ENABLED = false;
          if (this.conversationTimeout) {
            clearTimeout(this.conversationTimeout);
          }
          this.webhookManager.send("🔇 تم إيقاف المحادثات الذكية");
        } else if (arg === "reset") {
          this.aiEngine.resetConversation();
          this.webhookManager.send("🔄 تم إعادة تعيين المحادثات");
        } else {
          this.webhookManager.send("❌ استخدم: !conversation <on|off|reset>");
        }
      },

      "!leveling": () => {
        if (arg === "on") {
          this.config.LEVELING_ENABLED = true;
          this.webhookManager.send("📈 تم تفعيل نظام الـ leveling");
        } else if (arg === "off") {
          this.config.LEVELING_ENABLED = false;
          this.webhookManager.send("📉 تم إيقاف نظام الـ leveling");
        } else {
          this.webhookManager.send("❌ استخدم: !leveling <on|off>");
        }
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
        const stats = this.statsManager.getStats();
        this.webhookManager.send(`⏱️ مدة التشغيل: ${stats.uptimeFormatted}`);
      },

      "!ping": () => {
        const ping = Date.now() - msg.createdTimestamp;
        this.webhookManager.send(`🏓 Ping: ${ping}ms`);
      },

      "!stats": () => {
        const memUsage = process.memoryUsage();
        const stats = this.statsManager.getStats();
        
        const statsText = `📈 **إحصائيات النظام:**
💾 **الذاكرة:**
- RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB
- Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB
- External: ${Math.round(memUsage.external / 1024 / 1024)} MB

📊 **الأداء:**
- مدة التشغيل: ${stats.uptimeFormatted}
- الرسائل المعالجة: ${stats.messagesProcessed}
- الأوامر المنفذة: ${stats.commandsExecuted}
- المحادثات الذكية: ${stats.aiConversations}
- إعادة الاتصال: ${stats.reconnections}
- الأخطاء: ${stats.errors}

🔧 **النظام:**
- Node.js: ${process.version}
- Platform: ${process.platform}`;

        this.webhookManager.send(statsText);
      },

      "!config": () => {
        const config = `⚙️ **الإعدادات الحالية:**
- Base Time: ${this.config.SPAM_BASE_TIME}ms
- Variation: ${this.config.SPAM_VARIATION}ms
- Status Interval: ${Math.floor(this.config.STATUS_INTERVAL / 60000)} دقيقة
- Log Level: ${this.config.LOG_LEVEL}
- Max Reconnect: ${this.maxReconnectAttempts}
- AI Conversations: ${this.config.AI_CONVERSATION_ENABLED ? 'مفعل' : 'معطل'}
- Conversation Interval: ${this.config.CONVERSATION_INTERVAL_MIN}-${this.config.CONVERSATION_INTERVAL_MAX}ms
- Conversation Chance: ${(this.config.CONVERSATION_CHANCE * 100).toFixed(0)}%`;

        this.webhookManager.send(config);
      },

      "!logs": () => {
        // عرض آخر الأحداث المهمة
        const logs = `📝 **آخر الأحداث:**
- آخر رسالة ذكية: ${this.aiEngine.conversationHistory.slice(-1)[0] || 'لا توجد'}
- عمق المحادثة: ${this.aiEngine.conversationDepth}
- المتحدث التالي: Bot ${this.nextSpeaker + 1}
- حالة المحادثة: ${this.conversationTimeout ? 'مجدولة' : 'متوقفة'}`;

        this.webhookManager.send(logs);
      }
    };

    const commandFunction = commands[command];
    if (commandFunction) {
      try {
        commandFunction();
      } catch (error) {
        Logger.error(`Error executing command ${command}`, error);
        this.statsManager.increment('errors');
        this.webhookManager.send(`❌ خطأ في تنفيذ الأمر: ${error.message}`);
      }
    } else {
      this.webhookManager.send(`❓ أمر غير معروف. استخدم \`!help\` لعرض الأوامر المتاحة`);
    }
  }

  async gracefulShutdown() {
    Logger.info("🛑 بدء الإغلاق الآمن...");
    
    // إيقاف المحادثات الذكية
    if (this.conversationTimeout) {
      clearTimeout(this.conversationTimeout);
    }
    
    // إيقاف جميع العملاء
    for (let i = 0; i < this.clients.length; i++) {
      if (this.clients[i]) {
        this.stopClient(i);
      }
    }
    
    // إرسال إشعار الإغلاق
    await this.webhookManager.send("🛑 تم إيقاف البوت بأمان");
    
    setTimeout(() => {
      Logger.info("✅ تم الإغلاق بنجاح");
      process.exit(0);
    }, 2000);
  }

  async start() {
    Logger.info("🚀 بدء تشغيل Bot Manager...");
    
    try {
      await this.startClient(0);
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.startClient(1);
      
      Logger.info("✅ تم تشغيل جميع العملاء");
      
      // إرسال إشعار بدء التشغيل
      this.webhookManager.send(`🎉 تم تشغيل النظام بنجاح!
- المحادثات الذكية: ${this.config.AI_CONVERSATION_ENABLED ? 'مفعل' : 'معطل'}
- نظام Leveling: ${this.config.LEVELING_ENABLED ? 'مفعل' : 'معطل'}
- استخدم \`!help\` لعرض الأوامر المتاحة`);
      
    } catch (error) {
      Logger.error("Failed to start bot manager", error);
      this.statsManager.increment('errors');
      this.webhookManager.send(`❌ فشل في بدء التشغيل: ${error.message}`);
    }
  }
}

// 🌐 سيرفر ويب محسن
class WebServer {
  constructor(botManager, port = 3000) {
    this.botManager = botManager;
    this.port = port;
    this.app = require("express")();
    this.setupRoutes();
  }

  setupRoutes() {
    // الصفحة الرئيسية
    this.app.get("/", (req, res) => {
      const stats = this.botManager.statsManager.getStats();
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      
      res.send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>🤖 Discord Bot Manager - AI Enhanced</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              text-align: center; 
              padding: 20px; 
              margin: 0;
              min-height: 100vh;
            }
            .container { 
              max-width: 800px; 
              margin: 0 auto; 
              background: rgba(255,255,255,0.1);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              padding: 30px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            }
            .status { 
              background: linear-gradient(45deg, #27ae60, #2ecc71); 
              padding: 15px; 
              border-radius: 10px; 
              margin: 15px 0; 
              box-shadow: 0 4px 15px rgba(39,174,96,0.3);
            }
            .info { 
              background: linear-gradient(45deg, #3498db, #2980b9); 
              padding: 15px; 
              border-radius: 10px; 
              margin: 15px 0; 
              box-shadow: 0 4px 15px rgba(52,152,219,0.3);
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin: 20px 0;
            }
            .stat-card {
              background: rgba(255,255,255,0.1);
              padding: 20px;
              border-radius: 15px;
              border: 1px solid rgba(255,255,255,0.2);
            }
            .stat-number {
              font-size: 2em;
              font-weight: bold;
              color: #f39c12;
            }
            h1 { 
              margin-bottom: 30px; 
              font-size: 2.2em;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .feature {
              display: inline-block;
              background: rgba(255,255,255,0.2);
              padding: 8px 16px;
              border-radius: 20px;
              margin: 5px;
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🤖 Discord Bot Manager</h1>
            <p style="font-size: 1.2em; margin-bottom: 30px;">نظام إدارة البوتات المطور مع الذكاء الاصطناعي</p>
            
            <div class="status">
              ✅ النظام يعمل بنجاح
            </div>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">${stats.uptimeFormatted}</div>
                <div>مدة التشغيل</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.messagesProcessed}</div>
                <div>الرسائل المعالجة</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.aiConversations}</div>
                <div>المحادثات الذكية</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.commandsExecuted}</div>
                <div>الأوامر المنفذة</div>
              </div>
            </div>
            
            <div class="info">
              🔧 Node.js ${process.version} | 💾 ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB
            </div>
            
            <div style="margin-top: 30px;">
              <h3>🌟 الميزات المتاحة:</h3>
              <div class="feature">🤖 محادثات ذكية</div>
              <div class="feature">📈 نظام Leveling</div>
              <div class="feature">🔄 إعادة الاتصال التلقائي</div>
              <div class="feature">📊 إحصائيات مفصلة</div>
              <div class="feature">🌐 واجهة ويب</div>
              <div class="feature">🎛️ أوامر متقدمة</div>
            </div>
            
            <p style="margin-top: 30px; opacity: 0.8;">
              استخدم الأوامر في قناة Discord للتحكم بالبوت<br>
              اكتب <code>!help</code> لعرض جميع الأوامر المتاحة
            </p>
          </div>
        </body>
        </html>
      `);
    });

    // معلومات الحالة (JSON API)
    this.app.get("/api/status", (req, res) => {
      const stats = this.botManager.statsManager.getStats();
      res.json({
        status: "running",
        bots: {
          bot1: this.botManager.states[0],
          bot2: this.botManager.states[1]
        },
        features: {
          aiConversation: this.botManager.config.AI_CONVERSATION_ENABLED,
          leveling: this.botManager.config.LEVELING_ENABLED
        },
        stats: stats,
        memory: process.memoryUsage(),
        version: process.version,
        timestamp: new Date().toISOString()
      });
    });

    // إحصائيات JSON
    this.app.get("/api/stats", (req, res) => {
      res.json(this.botManager.statsManager.getStats());
    });

    // آخر المحادثات
    this.app.get("/api/conversations", (req, res) => {
      res.json({
        history: this.botManager.aiEngine.conversationHistory.slice(-10),
        depth: this.botManager.aiEngine.conversationDepth,
        nextSpeaker: this.botManager.nextSpeaker,
        enabled: this.botManager.config.AI_CONVERSATION_ENABLED
      });
    });

    // Health check
    this.app.get("/health", (req, res) => {
      res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Ping endpoint
    this.app.get("/ping", (req, res) => {
      res.json({ 
        pong: true, 
        timestamp: new Date().toISOString() 
      });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      Logger.info(`🌐 Web server running on port ${this.port}`);
      Logger.info(`📊 Dashboard: http://localhost:${this.port}`);
      Logger.info(`🔌 API: http://localhost:${this.port}/api/status`);
    });
  }
}

// 📅 مهام مجدولة
class ScheduledTasks {
  constructor(botManager) {
    this.botManager = botManager;
    this.cron = require("node-cron");
  }

  start() {
    // تنظيف الذاكرة كل ساعة
    this.cron.schedule('0 * * * *', () => {
      if (global.gc) {
        global.gc();
        Logger.debug("Memory cleanup performed");
      }
    });

    // إرسال تقرير يومي
    this.cron.schedule('0 0 * * *', () => {
      const stats = this.botManager.statsManager.getStats();
      this.botManager.webhookManager.send(`📊 **التقرير اليومي:**
- الرسائل المعالجة: ${stats.messagesProcessed}
- المحادثات الذكية: ${stats.aiConversations}
- الأوامر المنفذة: ${stats.commandsExecuted}
- مدة التشغيل: ${stats.uptimeFormatted}`);
    });

    // إعادة تعيين المحادثات كل 6 ساعات
    this.cron.schedule('0 */6 * * *', () => {
      this.botManager.aiEngine.resetConversation();
      Logger.info("AI conversation reset scheduled");
    });

    Logger.info("📅 Scheduled tasks started");
  }
}

// 🎯 تشغيل التطبيق الرئيسي
async function main() {
  try {
    console.log("🚀 بدء تشغيل Discord Bot Manager - Enhanced AI Version");
    
    // تثبيت التبعيات
    await DependencyManager.ensureDependencies();
    
    // تحميل الإعدادات
    const config = ConfigManager.loadConfig();
    
    // إنشاء مدير البوت
    const botManager = new BotManager(config);
    
    // تشغيل السيرفر
    const webServer = new WebServer(botManager, config.WEB_SERVER_PORT);
    webServer.start();
    
    // تشغيل المهام المجدولة
    const scheduledTasks = new ScheduledTasks(botManager);
    scheduledTasks.start();
    
    // تشغيل البوت
    await botManager.start();
    
    Logger.info("🎉 تم تشغيل النظام بنجاح!");
    Logger.info("🤖 الميزات المفعلة:");
    Logger.info(`   - المحادثات الذكية: ${config.AI_CONVERSATION_ENABLED ? '✅' : '❌'}`);
    Logger.info(`   - نظام Leveling: ${config.LEVELING_ENABLED ? '✅' : '❌'}`);
    Logger.info(`   - واجهة الويب: ✅ (Port: ${config.WEB_SERVER_PORT})`);
    Logger.info(`   - المهام المجدولة: ✅`);
    
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

module.exports = { 
  BotManager, 
  WebServer, 
  ConfigManager, 
  Logger, 
  AIConversationEngine,
  StatsManager,
  ScheduledTasks
};
