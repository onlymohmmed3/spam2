// 🚀 Discord Bot Manager - Enhanced AI Version
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 📦 Enhanced Dependency Management
class DependencyManager {
  static dependencies = [
    "discord.js-selfbot-v13",
    "dotenv",
    "express",
    "sphinx-run",
    "axios",
    "node-cron",
    "cookie-parser"
  ];

  static async ensureDependencies() {
    console.log("🔍 Checking dependencies...");

    for (const pkg of this.dependencies) {
      const name = pkg.split("@")[0];
      try {
        require.resolve(name);
        console.log(`✅ ${name} available`);
      } catch (e) {
        console.log(`📦 Installing: ${pkg}`);
        try {
          execSync(`npm install ${pkg}`, { 
            stdio: "inherit",
            timeout: 30000
          });
        } catch (installError) {
          console.error(`❌ Failed to install ${pkg}:`, installError.message);
          process.exit(1);
        }
      }
    }
  }
}

// 🧠 Natural Conversation Engine
class AIConversationEngine {
  constructor() {
    this.topics = [
      "popular stories", "memories", "cooking", "sports", "games",
      "movies", "books", "travel", "technology", "weather", "dreams",
      "hobbies", "art", "music", "history", "science", "nature"
    ];

    this.conversationOpeners = [
      "You know what I was thinking about...",
      "I had an interesting experience...",
      "Remember when we talked about...",
      "I recently discovered something...",
      "A friend told me about...",
      "I had the strangest dream...",
      "There's something I've been meaning to share..."
    ];

    this.responses = [
      "That's really interesting! 😊",
      "That reminds me of...",
      "I totally agree! I also...",
      "Wow, that's amazing! 👏",
      "Hahaha that's so funny! 😂",
      "Really? What happened next?",
      "No way! That's unbelievable 😱",
      "That makes me think of something else..."
    ];

    this.conversationHistory = [];
    this.lastSpeaker = null;
    this.conversationDepth = 0;
  }

  generateTopic() {
    return this.topics[Math.floor(Math.random() * this.topics.length)];
  }

  generateOpener() {
    const topic = this.generateTopic();
    const opener = this.conversationOpeners[Math.floor(Math.random() * this.conversationOpeners.length)];
    return `${opener} ${topic}...`;
  }

  generateResponse(lastMessage) {
    // More natural response generation
    let response;
    let responseType = 'simple';

    if (this.conversationDepth > 3) {
      const transitions = [
        "Anyway, let's talk about something else...",
        "But enough about that, what do you think about...",
        "Changing the subject a bit..."
      ];

      if (Math.random() < 0.3) {
        response = transitions[Math.floor(Math.random() * transitions.length)];
        this.conversationDepth = 0;
        responseType = 'transition';
        return { response: `${response} ${this.generateOpener()}`, type: responseType };
      }
    }

    // More varied responses
    const responseTypeRand = Math.random();
    if (responseTypeRand < 0.4) {
      // Follow-up question
      const questions = [
        "What do you think about that?",
        "Have you had similar experiences?",
        "How would you handle that situation?",
        "Does that remind you of anything?"
      ];
      response = questions[Math.floor(Math.random() * questions.length)];
      responseType = 'question';
    } else if (responseTypeRand < 0.7) {
      // Personal anecdote
      response = `That reminds me when I ${["saw", "heard", "experienced", "learned"][Math.floor(Math.random() * 4)]} something similar...`;
      responseType = 'anecdote';
    } else {
      // Simple response
      response = this.responses[Math.floor(Math.random() * this.responses.length)];
      responseType = 'simple';
    }

    return { response, type: responseType };
  }

  getNextMessage(speakerId) {
    if (this.lastSpeaker === speakerId) {
      return null; // Prevent same bot from speaking twice
    }

    let message;
    let responseType = 'opener';
    let topic = 'general';

    if (this.conversationHistory.length === 0 || Math.random() < 0.3) {
      // Start new conversation
      topic = this.generateTopic();
      message = this.generateOpener();
      this.conversationDepth = 0;
    } else {
      // Respond to last message
      const response = this.generateResponse(this.conversationHistory[this.conversationHistory.length - 1]);
      message = response.response;
      responseType = response.type;
      topic = this.generateTopic();
    }

    this.conversationHistory.push(message);
    this.lastSpeaker = speakerId;
    this.conversationDepth++;

    // Reset if conversation gets too long
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-10);
      this.conversationDepth = 0;
    }

    return { message, type: responseType, topic, length: this.conversationHistory.length };
  }

  resetConversation() {
    this.conversationHistory = [];
    this.lastSpeaker = null;
    this.conversationDepth = 0;
  }
}

// 🔧 Enhanced Configuration
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

# Dashboard Security Settings
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=admin123
DASHBOARD_EDIT_PASSWORD=edit456
DASHBOARD_SESSION_SECRET=hassan11

# Dashboard Features
DASHBOARD_THEME=dark
DASHBOARD_LANGUAGE=ar
DASHBOARD_AUTO_REFRESH=30
DASHBOARD_NOTIFICATIONS=true

# Advanced Statistics
ENABLE_DETAILED_STATS=true
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_ERROR_TRACKING=true
ENABLE_CONVERSATION_ANALYTICS=true

# Notification Settings
ENABLE_EMAIL_NOTIFICATIONS=false
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
`;
      fs.writeFileSync(envPath, envTemplate);
      console.log("📝 Created .env file - please fill in required values");
    }

    require("dotenv").config();

    const required = ['CONTROL_CHANNEL_ID', 'WEBHOOK_URL', 'TOKEN1', 'TOKEN2'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      console.error("❌ Missing required variables:", missing.join(', '));
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
      WEB_SERVER_PORT: parseInt(process.env.WEB_SERVER_PORT) || 3000,

      // Dashboard Security Settings
      DASHBOARD_USERNAME: process.env.DASHBOARD_USERNAME || 'admin',
      DASHBOARD_PASSWORD: process.env.DASHBOARD_PASSWORD || 'admin123',
      DASHBOARD_EDIT_PASSWORD: process.env.DASHBOARD_EDIT_PASSWORD || 'edit456',
      DASHBOARD_SESSION_SECRET: process.env.DASHBOARD_SESSION_SECRET || 'default_secret_key',

      // Dashboard Features
      DASHBOARD_THEME: process.env.DASHBOARD_THEME || 'dark',
      DASHBOARD_LANGUAGE: process.env.DASHBOARD_LANGUAGE || 'ar',
      DASHBOARD_AUTO_REFRESH: parseInt(process.env.DASHBOARD_AUTO_REFRESH) || 30,
      DASHBOARD_NOTIFICATIONS: process.env.DASHBOARD_NOTIFICATIONS !== 'false',

      // Advanced Statistics
      ENABLE_DETAILED_STATS: process.env.ENABLE_DETAILED_STATS !== 'false',
      ENABLE_PERFORMANCE_MONITORING: process.env.ENABLE_PERFORMANCE_MONITORING !== 'false',
      ENABLE_ERROR_TRACKING: process.env.ENABLE_ERROR_TRACKING !== 'false',
      ENABLE_CONVERSATION_ANALYTICS: process.env.ENABLE_CONVERSATION_ANALYTICS !== 'false',

      // Notification Settings
      ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
      EMAIL_SMTP_HOST: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
      EMAIL_SMTP_PORT: parseInt(process.env.EMAIL_SMTP_PORT) || 587,
      EMAIL_USERNAME: process.env.EMAIL_USERNAME || '',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || ''
    };
  }
}

// 📝 Enhanced Logging System
class Logger {
  static levels = { error: 0, warn: 1, info: 2, debug: 3 };
  static currentLevel = 2;

  static setLevel(level) {
    this.currentLevel = this.levels[level] || 2;
  }

  static format(level, message, extra = '') {
    const timestamp = new Date().toISOString();
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

// 🎯 Enhanced Webhook Management
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
    const now = new Date().toLocaleString();
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

// 📊 Advanced Statistics
class StatsManager {
  constructor() {
    this.stats = {
      startTime: Date.now(),
      messagesProcessed: 0,
      commandsExecuted: 0,
      aiConversations: 0,
      levelingMessages: 0,
      reconnections: 0,
      errors: 0,
      
      // Advanced Statistics
      hourlyStats: {},
      dailyStats: {},
      performanceMetrics: {
        cpuUsage: [],
        memoryUsage: [],
        responseTimes: []
      },
      conversationAnalytics: {
        topics: {},
        responseTypes: {},
        conversationLengths: []
      },
      errorLog: [],
      userActivity: {},
      levelingMessages: 0,
      botPerformance: {
        bot1: { messages: 0, errors: 0, uptime: 0 },
        bot2: { messages: 0, errors: 0, uptime: 0 }
      }
    };
    
    this.initializeHourlyStats();
  }

  initializeHourlyStats() {
    const now = new Date();
    const hourKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}`;
    this.stats.hourlyStats[hourKey] = {
      messages: 0,
      conversations: 0,
      commands: 0,
      errors: 0,
      leveling: 0
    };
  }

  updateHourlyStats(type) {
    const now = new Date();
    const hourKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}`;
    
    if (!this.stats.hourlyStats[hourKey]) {
      this.stats.hourlyStats[hourKey] = {
        messages: 0,
        conversations: 0,
        commands: 0,
        errors: 0,
        leveling: 0
      };
    }
    
    if (this.stats.hourlyStats[hourKey][type] !== undefined) {
      this.stats.hourlyStats[hourKey][type]++;
    }
  }

  logError(error, context = '') {
    this.stats.errorLog.push({
      timestamp: new Date().toISOString(),
      error: error.message || error,
      context: context,
      stack: error.stack
    });
    
    // Keep only last 100 errors
    if (this.stats.errorLog.length > 100) {
      this.stats.errorLog = this.stats.errorLog.slice(-100);
    }
  }

  updateBotPerformance(botIndex, type, value = 1) {
    const botKey = `bot${botIndex + 1}`;
    if (this.stats.botPerformance[botKey]) {
      this.stats.botPerformance[botKey][type] += value;
    }
  }

  updateConversationAnalytics(topic, responseType, length) {
    // Track topics
    this.stats.conversationAnalytics.topics[topic] = 
      (this.stats.conversationAnalytics.topics[topic] || 0) + 1;
    
    // Track response types
    this.stats.conversationAnalytics.responseTypes[responseType] = 
      (this.stats.conversationAnalytics.responseTypes[responseType] || 0) + 1;
    
    // Track conversation lengths
    this.stats.conversationAnalytics.conversationLengths.push(length);
    
    // Keep only last 1000 conversations
    if (this.stats.conversationAnalytics.conversationLengths.length > 1000) {
      this.stats.conversationAnalytics.conversationLengths = 
        this.stats.conversationAnalytics.conversationLengths.slice(-1000);
    }
  }

  increment(stat) {
    if (this.stats.hasOwnProperty(stat)) {
      this.stats[stat]++;
      
      // Update hourly stats
      if (['messagesProcessed', 'aiConversations', 'commandsExecuted', 'errors', 'levelingMessages'].includes(stat)) {
        const type = stat === 'messagesProcessed' ? 'messages' : 
                    stat === 'aiConversations' ? 'conversations' : 
                    stat === 'commandsExecuted' ? 'commands' : 
                    stat === 'levelingMessages' ? 'leveling' : 'errors';
        this.updateHourlyStats(type);
      }
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

// 🤖 Enhanced Bot Management
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

    // System signal handling
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

    // Check both bots are connected
    if (!this.states[0] || !this.states[1]) {
      Logger.debug(`AI Conversation skipped - Bot 1: ${this.states[0]}, Bot 2: ${this.states[1]}`);
      this.scheduleNextConversation();
      return;
    }

    // Probability to start conversation
    if (Math.random() > this.config.CONVERSATION_CHANCE) {
      this.scheduleNextConversation();
      return;
    }

    const speakerId = this.nextSpeaker;
    const conversationData = this.aiEngine.getNextMessage(speakerId);

    if (conversationData && conversationData.message && this.clients[speakerId]) {
      try {
        const channel = await this.clients[speakerId].channels.fetch(this.config.CONVERSATION_CHANNEL_ID);
        await channel.send(conversationData.message);

        this.statsManager.increment('aiConversations');
        this.statsManager.updateBotPerformance(speakerId, 'messages');
        this.statsManager.updateConversationAnalytics(
          conversationData.topic, 
          conversationData.type, 
          conversationData.length
        );
        
        this.nextSpeaker = speakerId === 0 ? 1 : 0;

        Logger.debug(`AI Conversation: Bot ${speakerId + 1} sent message (${conversationData.type})`);
      } catch (error) {
        Logger.error(`Failed to send AI conversation message from bot ${speakerId + 1}`, error);
        this.statsManager.increment('errors');
        this.statsManager.logError(error, `AI Conversation Bot ${speakerId + 1}`);
        this.statsManager.updateBotPerformance(speakerId, 'errors');
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
      Logger.info(`Initializing Client ${index + 1}...`);
      
      const { Client } = require("discord.js-selfbot-v13");
      const { userAccount } = require("sphinx-run");

      const client = new Client({ 
        checkUpdate: false,
        readyStatus: false,
        autoreconnect: true
      });

      this.clients[index] = client;
      this.reconnectAttempts[index] = 0;

      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        if (!this.states[index]) {
          Logger.error(`Client ${index + 1} connection timeout`);
          this.handleClientError(index, new Error('Connection timeout'));
        }
      }, 30000); // 30 second timeout

      // Set up event handlers before login
      client.on("ready", () => {
        Logger.info(`Client ${index + 1} (${client.user.username}) is ready`);
        this.states[index] = true;
        this.reconnectAttempts[index] = 0;
        this.statsManager.updateBotPerformance(index, 'uptime', Date.now());
        
        // Clear connection timeout
        clearTimeout(connectionTimeout);

                // Setup leveling system
        if (this.config.LEVELING_ENABLED) {
          try {
            setTimeout(() => {
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
                
              Logger.info(`Leveling system started for Client ${index + 1}`);
              this.statsManager.increment('levelingMessages');
            }, 3000); // Wait 3 seconds before starting leveling
          } catch (levelingError) {
            Logger.error(`Failed to setup leveling for Client ${index + 1}`, levelingError);
            this.statsManager.logError(levelingError, `Leveling Setup Client ${index + 1}`);
          }
        }

        // Start AI conversations if this is first bot connecting
        if (index === 0 && this.config.AI_CONVERSATION_ENABLED) {
          setTimeout(() => {
            this.scheduleNextConversation();
          }, 5000); // Wait 5 seconds before starting conversations
        }

        this.webhookManager.send(`✅ Account ${index + 1} **${client.user.username}** started successfully`);

        // Send periodic updates
        this.statusIntervals[index] = setInterval(() => {
          this.webhookManager.send(`📢 Account ${index + 1} **${client.user.username}** is still running`);
        }, this.config.STATUS_INTERVAL);
      });

      client.on("messageCreate", (msg) => {
        this.statsManager.increment('messagesProcessed');
        this.statsManager.updateBotPerformance(index, 'messages');

        // Handle commands (only for first client)
        if (index === 0) {
          this.handleCommand(msg);
        }
      });

      client.on("disconnect", () => {
        Logger.warn(`Client ${index + 1} disconnected`);
        this.states[index] = false;
        this.webhookManager.send(`⚠️ Account ${index + 1} disconnected`);
      });

      client.on("error", (error) => {
        Logger.error(`Client ${index + 1} error`, error);
        this.statsManager.increment('errors');
        this.statsManager.logError(error, `Client ${index + 1} Error`);
        this.handleClientError(index, error);
      });

      // Add timeout for login
      const loginPromise = client.login(this.tokens[index]);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout')), 25000);
      });

      await Promise.race([loginPromise, timeoutPromise]);
      Logger.info(`Client ${index + 1} login successful`);

    } catch (error) {
      Logger.error(`Failed to start client ${index + 1}`, error);
      this.statsManager.increment('errors');
      this.statsManager.logError(error, `Client ${index + 1} Startup Error`);
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

    // Log error and update statistics
    this.statsManager.logError(error, `Client ${index + 1} Error`);
    this.statsManager.updateBotPerformance(index, 'errors');

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
      this.webhookManager.send(`❌ Account ${index + 1} failed to connect after ${this.maxReconnectAttempts} attempts`);
      
      // Reset reconnect attempts after some time to allow manual restart
      setTimeout(() => {
        this.reconnectAttempts[index] = 0;
        Logger.info(`Reset reconnect attempts for client ${index + 1}`);
        this.webhookManager.send(`🔄 Reset reconnect attempts for client ${index + 1} - you can try manual restart now`);
      }, 30000); // Reset after 30 seconds
    }
  }

  stopClient(index, callback = null) {
    if (this.clients[index]) {
      try {
        this.clients[index].destroy();
        Logger.info(`Client ${index + 1} destroyed`);
      } catch (error) {
        Logger.error(`Error destroying client ${index + 1}`, error);
      }
      
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
      setTimeout(callback, 2000); // Increased delay for better cleanup
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
        const helpText = `🛠️ **Available Commands:**
\`!help\` - Show this help
\`!status\` - Show bot status
\`!stop <1|2>\` - Stop specific bot
\`!start <1|2>\` - Start specific bot
\`!restart <1|2>\` - Restart specific bot
\`!force <1|2>\` - Force restart bot (reset attempts)
\`!conversation <on|off|reset>\` - Control AI conversations
\`!leveling <on|off>\` - Control leveling system
\`!uptime\` - Show uptime
\`!ping\` - Test response
\`!stats\` - Detailed statistics
\`!config\` - Show current settings
\`!logs\` - Show recent events`;
        this.webhookManager.send(helpText);
      },

      "!status": () => {
        const status1 = this.states[0] ? "✅ Running" : "❌ Stopped";
        const status2 = this.states[1] ? "✅ Running" : "❌ Stopped";
        const reconnect1 = this.reconnectAttempts[0] > 0 ? ` (${this.reconnectAttempts[0]} attempts)` : "";
        const reconnect2 = this.reconnectAttempts[1] > 0 ? ` (${this.reconnectAttempts[1]} attempts)` : "";
        const aiStatus = this.config.AI_CONVERSATION_ENABLED ? "✅ Enabled" : "❌ Disabled";
        const levelingStatus = this.config.LEVELING_ENABLED ? "✅ Enabled" : "❌ Disabled";

        const stats = this.statsManager.getStats();
        this.webhookManager.send(`📊 **Status:**
- Client 1: ${status1}${reconnect1}
- Client 2: ${status2}${reconnect2}
- AI Conversations: ${aiStatus}
- Leveling System: ${levelingStatus}
- Leveling Messages: ${stats.levelingMessages || 0}
- Total Messages: ${stats.messagesProcessed}`);
      },

      "!conversation": () => {
        if (arg === "on") {
          this.config.AI_CONVERSATION_ENABLED = true;
          this.scheduleNextConversation();
          this.webhookManager.send("🤖 AI conversations enabled");
        } else if (arg === "off") {
          this.config.AI_CONVERSATION_ENABLED = false;
          if (this.conversationTimeout) {
            clearTimeout(this.conversationTimeout);
          }
          this.webhookManager.send("🔇 AI conversations disabled");
        } else if (arg === "reset") {
          this.aiEngine.resetConversation();
          this.webhookManager.send("🔄 Conversation history reset");
        } else {
          this.webhookManager.send("❌ Usage: !conversation <on|off|reset>");
        }
      },

      "!leveling": () => {
        if (arg === "on") {
          this.config.LEVELING_ENABLED = true;
          this.webhookManager.send("📈 Leveling system enabled");
        } else if (arg === "off") {
          this.config.LEVELING_ENABLED = false;
          this.webhookManager.send("📉 Leveling system disabled");
        } else {
          this.webhookManager.send("❌ Usage: !leveling <on|off>");
        }
      },

      "!stop": () => {
        const clientIndex = parseInt(arg) - 1;
        if (clientIndex >= 0 && clientIndex < 2) {
          this.stopClient(clientIndex);
          this.webhookManager.send(`⛔ Stopped bot ${arg}`);
        } else {
          this.webhookManager.send(`❌ Invalid bot number. Use 1 or 2`);
        }
      },

      "!start": () => {
        const clientIndex = parseInt(arg) - 1;
        if (clientIndex >= 0 && clientIndex < 2) {
          this.startClient(clientIndex);
          this.webhookManager.send(`▶️ Starting bot ${arg}...`);
        } else {
          this.webhookManager.send(`❌ Invalid bot number. Use 1 or 2`);
        }
      },

      "!restart": () => {
        const clientIndex = parseInt(arg) - 1;
        if (clientIndex >= 0 && clientIndex < 2) {
          this.stopClient(clientIndex, () => {
            setTimeout(() => this.startClient(clientIndex), 3000);
          });
          this.webhookManager.send(`🔄 Restarting bot ${arg}...`);
        } else {
          this.webhookManager.send(`❌ Invalid bot number. Use 1 or 2`);
        }
      },

      "!force": () => {
        const clientIndex = parseInt(arg) - 1;
        if (clientIndex >= 0 && clientIndex < 2) {
          // Force restart by resetting reconnect attempts
          this.reconnectAttempts[clientIndex] = 0;
          this.stopClient(clientIndex, () => {
            setTimeout(() => this.startClient(clientIndex), 5000);
          });
          this.webhookManager.send(`🔧 Force restarting bot ${arg}...`);
        } else {
          this.webhookManager.send(`❌ Invalid bot number. Use 1 or 2`);
        }
      },

      "!uptime": () => {
        const stats = this.statsManager.getStats();
        this.webhookManager.send(`⏱️ Uptime: ${stats.uptimeFormatted}`);
      },

      "!ping": () => {
        const ping = Date.now() - msg.createdTimestamp;
        this.webhookManager.send(`🏓 Ping: ${ping}ms`);
      },

      "!stats": () => {
        const memUsage = process.memoryUsage();
        const stats = this.statsManager.getStats();

        const statsText = `📈 **System Stats:**
💾 **Memory:**
- RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB
- Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB
- External: ${Math.round(memUsage.external / 1024 / 1024)} MB

📊 **Performance:**
- Uptime: ${stats.uptimeFormatted}
- Messages Processed: ${stats.messagesProcessed}
- Commands Executed: ${stats.commandsExecuted}
- AI Conversations: ${stats.aiConversations}
- Leveling Messages: ${stats.levelingMessages || 0}
- Reconnections: ${stats.reconnections}
- Errors: ${stats.errors}

🔧 **System:**
- Node.js: ${process.version}
- Platform: ${process.platform}`;

        this.webhookManager.send(statsText);
      },

      "!config": () => {
        const config = `⚙️ **Current Settings:**
- Base Time: ${this.config.SPAM_BASE_TIME}ms
- Variation: ${this.config.SPAM_VARIATION}ms
- Status Interval: ${Math.floor(this.config.STATUS_INTERVAL / 60000)} minutes
- Log Level: ${this.config.LOG_LEVEL}
- Max Reconnect: ${this.maxReconnectAttempts}
- AI Conversations: ${this.config.AI_CONVERSATION_ENABLED ? 'Enabled' : 'Disabled'}
- Conversation Interval: ${this.config.CONVERSATION_INTERVAL_MIN}-${this.config.CONVERSATION_INTERVAL_MAX}ms
- Conversation Chance: ${(this.config.CONVERSATION_CHANCE * 100).toFixed(0)}%`;

        this.webhookManager.send(config);
      },

      "!logs": () => {
        // Show recent important events
        const logs = `📝 **Recent Events:**
- Last AI message: ${this.aiEngine.conversationHistory.slice(-1)[0] || 'None'}
- Conversation depth: ${this.aiEngine.conversationDepth}
- Next speaker: Bot ${this.nextSpeaker + 1}
- Conversation state: ${this.conversationTimeout ? 'Scheduled' : 'Stopped'}`;

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
        this.statsManager.logError(error, `Command: ${command}`);
        this.webhookManager.send(`❌ Command execution error: ${error.message}`);
      }
    } else {
      this.webhookManager.send(`❓ Unknown command. Use \`!help\` for available commands`);
    }
  }

  async gracefulShutdown() {
    Logger.info("🛑 Starting graceful shutdown...");

    // Stop AI conversations
    if (this.conversationTimeout) {
      clearTimeout(this.conversationTimeout);
    }

    // Stop all clients
    for (let i = 0; i < this.clients.length; i++) {
      if (this.clients[i]) {
        this.stopClient(i);
      }
    }

    // Send shutdown notification
    await this.webhookManager.send("🛑 Bot stopped safely");

    setTimeout(() => {
      Logger.info("✅ Shutdown completed successfully");
      process.exit(0);
    }, 2000);
  }

  async start() {
    Logger.info("🚀 Starting Bot Manager...");

    try {
      // Start first bot
      Logger.info("Starting Bot 1...");
      await this.startClient(0);
      
      // Wait for first bot to fully initialize
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Start second bot
      Logger.info("Starting Bot 2...");
      await this.startClient(1);
      
      // Wait for both bots to be ready
      await new Promise(resolve => setTimeout(resolve, 8000));

      Logger.info("✅ All clients started");

      // Send startup notification
      this.webhookManager.send(`🎉 System started successfully!
- Bot 1: ${this.states[0] ? '✅ Online' : '❌ Offline'}
- Bot 2: ${this.states[1] ? '✅ Online' : '❌ Offline'}
- AI Conversations: ${this.config.AI_CONVERSATION_ENABLED ? 'Enabled' : 'Disabled'}
- Leveling System: ${this.config.LEVELING_ENABLED ? 'Enabled' : 'Disabled'}
- Use \`!help\` for available commands`);

    } catch (error) {
      Logger.error("Failed to start bot manager", error);
      this.statsManager.increment('errors');
      this.statsManager.logError(error, 'Bot Manager Startup');
      this.webhookManager.send(`❌ Startup failed: ${error.message}`);
    }
  }
}

// 🌐 Enhanced Web Server
class WebServer {
  constructor(botManager, port = 3000) {
    this.botManager = botManager;
    this.port = port;
    this.app = require("express")();
    this.sessions = new Map();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // Body parser
    this.app.use(require("express").json());
    this.app.use(require("express").urlencoded({ extended: true }));
    
    // Cookie parser
    const cookieParser = require("cookie-parser");
    this.app.use(cookieParser());
    
    // Session management
    this.app.use((req, res, next) => {
      const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
      if (sessionId && this.sessions.has(sessionId)) {
        req.session = this.sessions.get(sessionId);
      } else {
        req.session = null;
      }
      next();
    });
  }

  generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  createSession(userData) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      user: userData,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    this.sessions.set(sessionId, session);
    
    // Clean old sessions (older than 24 hours)
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActivity > 24 * 60 * 60 * 1000) {
        this.sessions.delete(id);
      }
    }
    
    return sessionId;
  }

  requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    req.session.lastActivity = Date.now();
    next();
  }

  requireEditAuth(req, res, next) {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.session.user.role !== 'editor') {
      return res.status(403).json({ error: 'Edit permission required' });
    }
    req.session.lastActivity = Date.now();
    next();
  }

  setupRoutes() {
    // Login page
    this.app.get("/", (req, res) => {
      if (req.session && req.session.user) {
        return res.redirect('/dashboard');
      }
      
      res.send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>🔐 تسجيل الدخول - لوحة تحكم البوت</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .login-container { 
              background: rgba(255,255,255,0.1);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.3);
              width: 100%;
              max-width: 400px;
              text-align: center;
            }
            .logo {
              font-size: 3em;
              margin-bottom: 20px;
            }
            h1 { 
              margin-bottom: 30px; 
              font-size: 1.8em;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .form-group {
              margin-bottom: 20px;
              text-align: right;
            }
            label {
              display: block;
              margin-bottom: 8px;
              font-weight: bold;
            }
            input {
              width: 100%;
              padding: 12px;
              border: none;
              border-radius: 10px;
              background: rgba(255,255,255,0.2);
              color: white;
              font-size: 16px;
            }
            input::placeholder {
              color: rgba(255,255,255,0.7);
            }
            button {
              width: 100%;
              padding: 15px;
              border: none;
              border-radius: 10px;
              background: linear-gradient(45deg, #27ae60, #2ecc71);
              color: white;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
              transition: transform 0.2s;
            }
            button:hover {
              transform: translateY(-2px);
            }
            .error {
              background: rgba(231, 76, 60, 0.8);
              padding: 10px;
              border-radius: 8px;
              margin-bottom: 20px;
              display: none;
            }
            .success {
              background: rgba(46, 204, 113, 0.8);
              padding: 10px;
              border-radius: 8px;
              margin-bottom: 20px;
              display: none;
            }
          </style>
        </head>
        <body>
          <div class="login-container">
            <div class="logo">🤖</div>
            <h1>لوحة تحكم البوت</h1>
            <p style="margin-bottom: 30px; opacity: 0.8;">سجل دخولك للوصول إلى لوحة التحكم</p>
            
            <div id="error" class="error"></div>
            <div id="success" class="success"></div>
            
            <form id="loginForm">
              <div class="form-group">
                <label for="username">اسم المستخدم:</label>
                <input type="text" id="username" name="username" placeholder="أدخل اسم المستخدم" required>
              </div>
              
              <div class="form-group">
                <label for="password">كلمة المرور:</label>
                <input type="password" id="password" name="password" placeholder="أدخل كلمة المرور" required>
              </div>
              
              <button type="submit">تسجيل الدخول</button>
            </form>
          </div>

          <script>
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const formData = new FormData(e.target);
              const data = {
                username: formData.get('username'),
                password: formData.get('password')
              };
              
              try {
                const response = await fetch('/api/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                  document.getElementById('success').textContent = 'تم تسجيل الدخول بنجاح! جاري التوجيه...';
                  document.getElementById('success').style.display = 'block';
                  document.getElementById('error').style.display = 'none';
                  
                  setTimeout(() => {
                    window.location.href = '/dashboard';
                  }, 1000);
                } else {
                  document.getElementById('error').textContent = result.error || 'خطأ في تسجيل الدخول';
                  document.getElementById('error').style.display = 'block';
                  document.getElementById('success').style.display = 'none';
                }
              } catch (error) {
                document.getElementById('error').textContent = 'خطأ في الاتصال';
                document.getElementById('error').style.display = 'block';
                document.getElementById('success').style.display = 'none';
              }
            });
          </script>
        </body>
        </html>
      `);
    });

    // Dashboard page
    this.app.get("/dashboard", this.requireAuth.bind(this), (req, res) => {
      const stats = this.botManager.statsManager.getStats();
      const config = this.botManager.config;
      
      res.send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>📊 لوحة التحكم - البوت المدير</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); 
              color: white; 
              min-height: 100vh;
            }
            .header {
              background: rgba(255,255,255,0.1);
              backdrop-filter: blur(10px);
              padding: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid rgba(255,255,255,0.2);
            }
            .header h1 {
              font-size: 1.8em;
              color: #00d4ff;
            }
            .user-info {
              display: flex;
              align-items: center;
              gap: 15px;
            }
            .logout-btn {
              background: linear-gradient(45deg, #e74c3c, #c0392b);
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: bold;
            }
            .container {
              max-width: 1400px;
              margin: 0 auto;
              padding: 20px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            .stat-card {
              background: rgba(255,255,255,0.1);
              backdrop-filter: blur(10px);
              padding: 25px;
              border-radius: 15px;
              border: 1px solid rgba(255,255,255,0.2);
              text-align: center;
              transition: transform 0.3s;
            }
            .stat-card:hover {
              transform: translateY(-5px);
            }
            .stat-number {
              font-size: 2.5em;
              font-weight: bold;
              color: #00d4ff;
              margin-bottom: 10px;
            }
            .stat-label {
              font-size: 1.1em;
              opacity: 0.8;
            }
            .status-indicator {
              display: inline-block;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              margin-left: 8px;
            }
            .status-online { background: #27ae60; }
            .status-offline { background: #e74c3c; }
            
            .main-content {
              display: grid;
              grid-template-columns: 2fr 1fr;
              gap: 30px;
            }
            
            .chart-section {
              background: rgba(255,255,255,0.1);
              backdrop-filter: blur(10px);
              border-radius: 15px;
              padding: 25px;
              margin-bottom: 20px;
            }
            
            .chart-container {
              height: 300px;
              background: rgba(0,0,0,0.2);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-top: 15px;
            }
            
            .controls-section {
              background: rgba(255,255,255,0.1);
              backdrop-filter: blur(10px);
              border-radius: 15px;
              padding: 25px;
            }
            
            .control-group {
              margin-bottom: 20px;
            }
            
            .control-group label {
              display: block;
              margin-bottom: 8px;
              font-weight: bold;
            }
            
            .control-btn {
              background: linear-gradient(45deg, #3498db, #2980b9);
              color: white;
              border: none;
              padding: 12px 20px;
              border-radius: 8px;
              cursor: pointer;
              margin: 5px;
              font-weight: bold;
              transition: transform 0.2s;
            }
            
            .control-btn:hover {
              transform: translateY(-2px);
            }
            
            .control-btn.danger {
              background: linear-gradient(45deg, #e74c3c, #c0392b);
            }
            
            .control-btn.success {
              background: linear-gradient(45deg, #27ae60, #2ecc71);
            }
            
            .notification {
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 15px 20px;
              border-radius: 10px;
              color: white;
              font-weight: bold;
              z-index: 1000;
              transform: translateX(400px);
              transition: transform 0.3s;
            }
            
            .notification.show {
              transform: translateX(0);
            }
            
            .notification.success {
              background: linear-gradient(45deg, #27ae60, #2ecc71);
            }
            
            .notification.error {
              background: linear-gradient(45deg, #e74c3c, #c0392b);
            }
            
            .notification.info {
              background: linear-gradient(45deg, #3498db, #2980b9);
            }
            
            .edit-btn {
              background: linear-gradient(45deg, #f39c12, #e67e22);
              color: white;
              border: none;
              padding: 8px 15px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.9em;
              margin-top: 10px;
            }
            
            @media (max-width: 768px) {
              .main-content {
                grid-template-columns: 1fr;
              }
              .stats-grid {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🤖 لوحة تحكم البوت المدير</h1>
            <div class="user-info">
              <span>مرحباً، ${req.session.user.username}</span>
              <button class="logout-btn" onclick="logout()">تسجيل خروج</button>
            </div>
          </div>

          <div class="container">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">${stats.uptimeFormatted}</div>
                <div class="stat-label">وقت التشغيل</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.messagesProcessed}</div>
                <div class="stat-label">الرسائل المعالجة</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.aiConversations}</div>
                <div class="stat-label">المحادثات الذكية</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.commandsExecuted}</div>
                <div class="stat-label">الأوامر المنفذة</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.levelingMessages || 0}</div>
                <div class="stat-label">رسائل التطوير</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</div>
                <div class="stat-label">استخدام الذاكرة</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.errors}</div>
                <div class="stat-label">الأخطاء</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.reconnections}</div>
                <div class="stat-label">إعادة الاتصال</div>
              </div>
            </div>

            <div class="main-content">
              <div>
                <div class="chart-section">
                  <h3>📊 حالة البوتات</h3>
                  <div class="chart-container">
                    <div style="text-align: center;">
                      <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                        <div style="font-size: 1.2em; margin-bottom: 10px;">🤖 البوت الأول</div>
                        <span class="status-indicator ${this.botManager.states[0] ? 'status-online' : 'status-offline'}"></span>
                        <span style="font-weight: bold;">${this.botManager.states[0] ? 'متصل' : 'غير متصل'}</span>
                        <div style="font-size: 0.9em; margin-top: 5px; opacity: 0.8;">
                          محاولات إعادة الاتصال: ${this.botManager.reconnectAttempts[0]}
                        </div>
                      </div>
                      <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                        <div style="font-size: 1.2em; margin-bottom: 10px;">🤖 البوت الثاني</div>
                        <span class="status-indicator ${this.botManager.states[1] ? 'status-online' : 'status-offline'}"></span>
                        <span style="font-weight: bold;">${this.botManager.states[1] ? 'متصل' : 'غير متصل'}</span>
                        <div style="font-size: 0.9em; margin-top: 5px; opacity: 0.8;">
                          محاولات إعادة الاتصال: ${this.botManager.reconnectAttempts[1]}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="chart-section">
                  <h3>📈 الإحصائيات التفصيلية</h3>
                  <div class="chart-container">
                    <div style="text-align: center;">
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                          <div style="font-size: 1.1em; margin-bottom: 5px;">🔄 إعادة الاتصال</div>
                          <div style="font-size: 1.5em; font-weight: bold; color: #f39c12;">${stats.reconnections}</div>
                        </div>
                        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                          <div style="font-size: 1.1em; margin-bottom: 5px;">📈 رسائل التطوير</div>
                          <div style="font-size: 1.5em; font-weight: bold; color: #27ae60;">${stats.levelingMessages || 0}</div>
                        </div>
                        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                          <div style="font-size: 1.1em; margin-bottom: 5px;">❌ معدل الأخطاء</div>
                          <div style="font-size: 1.5em; font-weight: bold; color: #e74c3c;">${stats.messagesProcessed > 0 ? ((stats.errors / stats.messagesProcessed) * 100).toFixed(2) : 0}%</div>
                        </div>
                        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                          <div style="font-size: 1.1em; margin-bottom: 5px;">🔄 إعادة الاتصال</div>
                          <div style="font-size: 1.5em; font-weight: bold; color: #f39c12;">${stats.reconnections}</div>
                        </div>
                        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                          <div style="font-size: 1.1em; margin-bottom: 5px;">💾 استخدام الذاكرة</div>
                          <div style="font-size: 1.5em; font-weight: bold; color: #3498db;">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</div>
                        </div>
                        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                          <div style="font-size: 1.1em; margin-bottom: 5px;">📊 إجمالي الرسائل</div>
                          <div style="font-size: 1.5em; font-weight: bold; color: #9b59b6;">${stats.messagesProcessed}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="chart-section">
                  <h3>🤖 تحليل المحادثات الذكية</h3>
                  <div class="chart-container">
                    <div style="text-align: center;">
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                          <div style="font-size: 1.1em; margin-bottom: 5px;">💬 المحادثات</div>
                          <div style="font-size: 1.5em; font-weight: bold; color: #9b59b6;">${stats.aiConversations}</div>
                        </div>
                        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                          <div style="font-size: 1.1em; margin-bottom: 5px;">📊 عمق المحادثة</div>
                          <div style="font-size: 1.5em; font-weight: bold; color: #e67e22;">${this.botManager.aiEngine.conversationDepth}</div>
                        </div>
                        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                          <div style="font-size: 1.1em; margin-bottom: 5px;">🎯 المتحدث التالي</div>
                          <div style="font-size: 1.5em; font-weight: bold; color: #1abc9c;">البوت ${this.botManager.nextSpeaker + 1}</div>
                        </div>
                        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                          <div style="font-size: 1.1em; margin-bottom: 5px;">⏰ حالة المحادثة</div>
                          <div style="font-size: 1.5em; font-weight: bold; color: #34495e;">${this.botManager.conversationTimeout ? 'مجدولة' : 'متوقفة'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="chart-section">
                  <h3>📋 سجل الأخطاء الأخيرة</h3>
                  <div class="chart-container" style="max-height: 200px; overflow-y: auto;">
                    <div style="text-align: right; padding: 10px;" id="errorLog">
                      <div style="text-align: center; opacity: 0.6;">جاري تحميل سجل الأخطاء...</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="controls-section">
                <h3>🎛️ التحكم</h3>
                
                <div class="control-group">
                  <label>البوت الأول:</label>
                  <button class="control-btn ${this.botManager.states[0] ? 'danger' : 'success'}" onclick="toggleBot(1)">
                    ${this.botManager.states[0] ? 'إيقاف' : 'تشغيل'}
                  </button>
                  <button class="control-btn" onclick="restartBot(1)">إعادة تشغيل</button>
                </div>

                <div class="control-group">
                  <label>البوت الثاني:</label>
                  <button class="control-btn ${this.botManager.states[1] ? 'danger' : 'success'}" onclick="toggleBot(2)">
                    ${this.botManager.states[1] ? 'إيقاف' : 'تشغيل'}
                  </button>
                  <button class="control-btn" onclick="restartBot(2)">إعادة تشغيل</button>
                  <button class="control-btn" onclick="forceRestartBot(2)" style="background: linear-gradient(45deg, #e67e22, #d35400);">إعادة تشغيل قوية</button>
                </div>

                <div class="control-group">
                  <label>المحادثات الذكية:</label>
                  <button class="control-btn ${config.AI_CONVERSATION_ENABLED ? 'danger' : 'success'}" onclick="toggleConversation()">
                    ${config.AI_CONVERSATION_ENABLED ? 'إيقاف' : 'تشغيل'}
                  </button>
                  <button class="control-btn" onclick="resetConversation()">إعادة تعيين</button>
                </div>

                <div class="control-group">
                  <label>نظام التطوير:</label>
                  <button class="control-btn ${config.LEVELING_ENABLED ? 'danger' : 'success'}" onclick="toggleLeveling()">
                    ${config.LEVELING_ENABLED ? 'إيقاف' : 'تشغيل'}
                  </button>
                </div>

                <div class="control-group">
                  <label>إعادة تشغيل النظام:</label>
                  <button class="control-btn" onclick="restartSystem()" style="background: linear-gradient(45deg, #f39c12, #e67e22);">إعادة تشغيل كاملة</button>
                </div>

                <div class="control-group">
                  <label>تنظيف النظام:</label>
                  <button class="control-btn" onclick="cleanSystem()" style="background: linear-gradient(45deg, #9b59b6, #8e44ad);">تنظيف الذاكرة</button>
                </div>

                <div class="control-group">
                  <label>التحديث التلقائي:</label>
                  <button class="control-btn" onclick="toggleAutoRefresh()" id="autoRefreshBtn" style="background: linear-gradient(45deg, #1abc9c, #16a085);">إيقاف التحديث</button>
                </div>

                ${req.session.user.role === 'editor' ? `
                <div class="control-group">
                  <label>الإعدادات المتقدمة:</label>
                  <button class="edit-btn" onclick="showEditModal()">تعديل الإعدادات</button>
                  <button class="edit-btn" onclick="showAdvancedModal()" style="background: linear-gradient(45deg, #34495e, #2c3e50);">الإعدادات المتقدمة</button>
                </div>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="chart-section" style="margin-top: 30px;">
            <h3>🔧 معلومات النظام</h3>
            <div class="chart-container" style="height: auto; min-height: 100px;">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; text-align: center;">
                <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                  <div style="font-size: 1.1em; margin-bottom: 5px;">🔧 النظام</div>
                  <div style="font-size: 1.2em; font-weight: bold; color: #3498db;">Node.js ${process.version}</div>
                </div>
                <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                  <div style="font-size: 1.1em; margin-bottom: 5px;">💾 الذاكرة</div>
                  <div style="font-size: 1.2em; font-weight: bold; color: #27ae60;">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</div>
                </div>
                <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                  <div style="font-size: 1.1em; margin-bottom: 5px;">🖥️ المنصة</div>
                  <div style="font-size: 1.2em; font-weight: bold; color: #f39c12;">${process.platform}</div>
                </div>
                <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                  <div style="font-size: 1.1em; margin-bottom: 5px;">📅 التاريخ</div>
                  <div style="font-size: 1.2em; font-weight: bold; color: #9b59b6;">${new Date().toLocaleDateString('ar-SA')}</div>
                </div>
              </div>
            </div>
          </div>

          <div id="notification" class="notification"></div>

          <script>
            let autoRefreshInterval;
            
            function showNotification(message, type = 'info') {
              const notification = document.getElementById('notification');
              notification.textContent = message;
              notification.className = \`notification \${type}\`;
              notification.classList.add('show');
              
              // Log to console for debugging
              console.log(\`Notification [\${type}]: \${message}\`);
              
              setTimeout(() => {
                notification.classList.remove('show');
              }, 3000);
            }
            
            async function toggleBot(botNumber) {
              try {
                const response = await fetch(\`/api/bot/\${botNumber}/toggle\`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include'
                });
                
                const result = await response.json();
                
                if (result.success) {
                  showNotification(result.message, 'success');
                  setTimeout(() => location.reload(), 1000);
                } else {
                  showNotification(result.error, 'error');
                }
              } catch (error) {
                console.error('Toggle bot error:', error);
                showNotification('خطأ في الاتصال: ' + error.message, 'error');
              }
            }
            
            async function restartBot(botNumber) {
              try {
                const response = await fetch(\`/api/bot/\${botNumber}/restart\`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include'
                });
                
                const result = await response.json();
                
                if (result.success) {
                  showNotification(result.message, 'success');
                  setTimeout(() => location.reload(), 2000);
                } else {
                  showNotification(result.error, 'error');
                }
              } catch (error) {
                console.error('Restart bot error:', error);
                showNotification('خطأ في الاتصال: ' + error.message, 'error');
              }
            }
            
            async function forceRestartBot(botNumber) {
              if (confirm(\`هل أنت متأكد من إعادة تشغيل البوت \${botNumber} بقوة؟\`)) {
                try {
                  const response = await fetch(\`/api/bot/\${botNumber}/force\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                  });
                  
                  const result = await response.json();
                  
                  if (result.success) {
                    showNotification(result.message, 'success');
                    setTimeout(() => location.reload(), 3000);
                  } else {
                    showNotification(result.error, 'error');
                  }
                } catch (error) {
                  console.error('Force restart error:', error);
                  showNotification('خطأ في الاتصال: ' + error.message, 'error');
                }
              }
            }
            
            async function toggleConversation() {
              try {
                const response = await fetch('/api/conversation/toggle', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include'
                });
                
                const result = await response.json();
                
                if (result.success) {
                  showNotification(result.message, 'success');
                  setTimeout(() => location.reload(), 1000);
                } else {
                  showNotification(result.error, 'error');
                }
              } catch (error) {
                console.error('Toggle conversation error:', error);
                showNotification('خطأ في الاتصال: ' + error.message, 'error');
              }
            }
            
            async function resetConversation() {
              try {
                const response = await fetch('/api/conversation/reset', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
                
                const result = await response.json();
                
                if (result.success) {
                  showNotification(result.message, 'success');
                } else {
                  showNotification(result.error, 'error');
                }
              } catch (error) {
                showNotification('خطأ في الاتصال', 'error');
              }
            }
            
            async function toggleLeveling() {
              try {
                const response = await fetch('/api/leveling/toggle', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
                
                const result = await response.json();
                
                if (result.success) {
                  showNotification(result.message, 'success');
                  setTimeout(() => location.reload(), 1000);
                } else {
                  showNotification(result.error, 'error');
                }
              } catch (error) {
                showNotification('خطأ في الاتصال', 'error');
              }
            }
            
            function logout() {
              fetch('/api/logout', { method: 'POST' })
                .then(() => {
                  window.location.href = '/';
                });
            }
            
            function showEditModal() {
              const password = prompt('أدخل كلمة مرور التعديل:');
              if (password) {
                // Here you would implement the edit modal
                showNotification('ميزة التعديل قيد التطوير', 'info');
              }
            }

            function showAdvancedModal() {
              const modal = \`
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                  <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 30px; border-radius: 20px; max-width: 500px; width: 90%; color: white;">
                    <h3 style="text-align: center; margin-bottom: 20px;">⚙️ الإعدادات المتقدمة</h3>
                    <div style="margin-bottom: 15px;">
                      <label>فترة تحديث البيانات (ثانية):</label>
                      <input type="number" id="refreshInterval" value="30" min="5" max="300" style="width: 100%; padding: 8px; margin-top: 5px; border-radius: 5px; border: none; background: rgba(255,255,255,0.2); color: white;" />
                    </div>
                    <div style="margin-bottom: 15px;">
                      <label>مستوى التفاصيل:</label>
                      <select id="detailLevel" style="width: 100%; padding: 8px; margin-top: 5px; border-radius: 5px; border: none; background: rgba(255,255,255,0.2); color: white;">
                        <option value="basic">أساسي</option>
                        <option value="detailed">مفصل</option>
                        <option value="expert">خبير</option>
                      </select>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                      <button onclick="saveAdvancedSettings()" style="padding: 10px 20px; border: none; border-radius: 8px; background: linear-gradient(45deg, #27ae60, #2ecc71); color: white; cursor: pointer;">حفظ</button>
                      <button onclick="closeModal()" style="padding: 10px 20px; border: none; border-radius: 8px; background: linear-gradient(45deg, #e74c3c, #c0392b); color: white; cursor: pointer;">إلغاء</button>
                    </div>
                  </div>
                </div>
              \`;
              document.body.insertAdjacentHTML('beforeend', modal);
            }

            function saveAdvancedSettings() {
              const refreshInterval = document.getElementById('refreshInterval').value;
              const detailLevel = document.getElementById('detailLevel').value;
              
              // Save settings to localStorage
              localStorage.setItem('refreshInterval', refreshInterval);
              localStorage.setItem('detailLevel', detailLevel);
              
              showNotification('تم حفظ الإعدادات بنجاح', 'success');
              closeModal();
              
              // Update auto refresh interval
              if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
                autoRefreshInterval = setInterval(() => {
                  location.reload();
                }, refreshInterval * 1000);
              }
            }

            function closeModal() {
              const modal = document.querySelector('div[style*="z-index: 10000"]');
              if (modal) {
                modal.remove();
              }
            }

            async function restartSystem() {
              if (confirm('هل أنت متأكد من إعادة تشغيل النظام؟')) {
                try {
                  const response = await fetch('/api/system/restart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  
                  const result = await response.json();
                  
                  if (result.success) {
                    showNotification(result.message, 'success');
                    setTimeout(() => location.reload(), 3000);
                  } else {
                    showNotification(result.error, 'error');
                  }
                } catch (error) {
                  showNotification('خطأ في الاتصال', 'error');
                }
              }
            }

            async function cleanSystem() {
              try {
                const response = await fetch('/api/system/clean', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
                
                const result = await response.json();
                
                if (result.success) {
                  showNotification(result.message, 'success');
                  setTimeout(() => location.reload(), 1000);
                } else {
                  showNotification(result.error, 'error');
                }
              } catch (error) {
                showNotification('خطأ في الاتصال', 'error');
              }
            }

            function toggleAutoRefresh() {
              const btn = document.getElementById('autoRefreshBtn');
              
              if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
                autoRefreshInterval = null;
                btn.textContent = 'تشغيل التحديث';
                btn.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
                showNotification('تم إيقاف التحديث التلقائي', 'info');
              } else {
                const interval = localStorage.getItem('refreshInterval') || 30;
                autoRefreshInterval = setInterval(() => {
                  location.reload();
                }, interval * 1000);
                btn.textContent = 'إيقاف التحديث';
                btn.style.background = 'linear-gradient(45deg, #1abc9c, #16a085)';
                showNotification('تم تشغيل التحديث التلقائي', 'success');
              }
            }
            
            // Auto refresh every 30 seconds
            let autoRefreshInterval = setInterval(() => {
              location.reload();
            }, 30000);
            
            // Load error log
            async function loadErrorLog() {
              try {
                const response = await fetch('/api/stats/advanced', {
                  credentials: 'include'
                });
                const data = await response.json();
                const errorLog = document.getElementById('errorLog');
                
                if (data.errorLog && data.errorLog.length > 0) {
                  const errorHtml = data.errorLog.slice(-5).map(error => \`
                    <div style="margin-bottom: 10px; padding: 10px; background: rgba(231, 76, 60, 0.2); border-radius: 8px; border-right: 4px solid #e74c3c;">
                      <div style="font-size: 0.9em; color: #e74c3c; margin-bottom: 5px;">
                        \${new Date(error.timestamp).toLocaleString('ar-SA')}
                      </div>
                      <div style="font-size: 0.8em; opacity: 0.8;">
                        \${error.error.substring(0, 100)}\${error.error.length > 100 ? '...' : ''}
                      </div>
                    </div>
                  \`).join('');
                  errorLog.innerHTML = errorHtml;
                } else {
                  errorLog.innerHTML = '<div style="text-align: center; opacity: 0.6;">لا توجد أخطاء حديثة</div>';
                }
              } catch (error) {
                console.error('Failed to load error log:', error);
                errorLog.innerHTML = '<div style="text-align: center; opacity: 0.6; color: #e74c3c;">خطأ في تحميل سجل الأخطاء</div>';
              }
            }

            // Load error log on page load
            loadErrorLog();
            
            // Stop auto refresh when page is not visible
            document.addEventListener('visibilitychange', () => {
              if (document.hidden) {
                if (autoRefreshInterval) {
                  clearInterval(autoRefreshInterval);
                  autoRefreshInterval = null;
                }
              } else {
                if (!autoRefreshInterval) {
                  const interval = localStorage.getItem('refreshInterval') || 30;
                  autoRefreshInterval = setInterval(() => {
                    location.reload();
                  }, interval * 1000);
                }
              }
            });
          </script>
        </body>
        </html>
      `);
    });

    // Login API
    this.app.post("/api/login", (req, res) => {
      const { username, password } = req.body;
      
      if (username === this.botManager.config.DASHBOARD_USERNAME && 
          password === this.botManager.config.DASHBOARD_PASSWORD) {
        
        const sessionId = this.createSession({
          username: username,
          role: 'viewer'
        });
        
        res.cookie('sessionId', sessionId, { 
          httpOnly: true, 
          maxAge: 24 * 60 * 60 * 1000 
        });
        
        res.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
      } else {
        res.status(401).json({ success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
      }
    });

    // Edit login API
    this.app.post("/api/login/edit", (req, res) => {
      const { password } = req.body;
      
      if (password === this.botManager.config.DASHBOARD_EDIT_PASSWORD) {
        if (req.session) {
          req.session.user.role = 'editor';
          res.json({ success: true, message: 'تم منح صلاحيات التعديل' });
        } else {
          res.status(401).json({ success: false, error: 'يجب تسجيل الدخول أولاً' });
        }
      } else {
        res.status(401).json({ success: false, error: 'كلمة مرور التعديل غير صحيحة' });
      }
    });

    // Logout API
    this.app.post("/api/logout", (req, res) => {
      if (req.session) {
        this.sessions.delete(req.session.id);
      }
      res.clearCookie('sessionId');
      res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
    });

    // Bot control APIs
    this.app.post("/api/bot/:id/toggle", this.requireAuth.bind(this), (req, res) => {
      const botId = parseInt(req.params.id) - 1;
      
      if (botId < 0 || botId > 1) {
        return res.status(400).json({ success: false, error: 'رقم البوت غير صحيح' });
      }
      
      if (this.botManager.states[botId]) {
        this.botManager.stopClient(botId);
        res.json({ success: true, message: `تم إيقاف البوت ${req.params.id}` });
      } else {
        this.botManager.startClient(botId);
        res.json({ success: true, message: `تم تشغيل البوت ${req.params.id}` });
      }
    });

    this.app.post("/api/bot/:id/restart", this.requireAuth.bind(this), (req, res) => {
      const botId = parseInt(req.params.id) - 1;
      
      if (botId < 0 || botId > 1) {
        return res.status(400).json({ success: false, error: 'رقم البوت غير صحيح' });
      }
      
      this.botManager.stopClient(botId, () => {
        setTimeout(() => this.botManager.startClient(botId), 2000);
      });
      
      res.json({ success: true, message: `جاري إعادة تشغيل البوت ${req.params.id}` });
    });

    this.app.post("/api/bot/:id/force", this.requireAuth.bind(this), (req, res) => {
      const botId = parseInt(req.params.id) - 1;
      
      if (botId < 0 || botId > 1) {
        return res.status(400).json({ success: false, error: 'رقم البوت غير صحيح' });
      }
      
      // Reset reconnect attempts and force restart
      this.botManager.reconnectAttempts[botId] = 0;
      this.botManager.stopClient(botId, () => {
        setTimeout(() => this.botManager.startClient(botId), 5000);
      });
      
      res.json({ success: true, message: `جاري إعادة تشغيل البوت ${req.params.id} بقوة` });
    });

    // Conversation control APIs
    this.app.post("/api/conversation/toggle", this.requireAuth.bind(this), (req, res) => {
      this.botManager.config.AI_CONVERSATION_ENABLED = !this.botManager.config.AI_CONVERSATION_ENABLED;
      
      if (this.botManager.config.AI_CONVERSATION_ENABLED) {
        this.botManager.scheduleNextConversation();
        res.json({ success: true, message: 'تم تفعيل المحادثات الذكية' });
      } else {
        if (this.botManager.conversationTimeout) {
          clearTimeout(this.botManager.conversationTimeout);
        }
        res.json({ success: true, message: 'تم إيقاف المحادثات الذكية' });
      }
    });

    this.app.post("/api/conversation/reset", this.requireAuth.bind(this), (req, res) => {
      this.botManager.aiEngine.resetConversation();
      res.json({ success: true, message: 'تم إعادة تعيين المحادثات' });
    });

    // Leveling control API
    this.app.post("/api/leveling/toggle", this.requireAuth.bind(this), (req, res) => {
      this.botManager.config.LEVELING_ENABLED = !this.botManager.config.LEVELING_ENABLED;
      
      if (this.botManager.config.LEVELING_ENABLED) {
        res.json({ success: true, message: 'تم تفعيل نظام التطوير' });
      } else {
        res.json({ success: true, message: 'تم إيقاف نظام التطوير' });
      }
    });

    // Status info (JSON API)
    this.app.get("/api/status", this.requireAuth.bind(this), (req, res) => {
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

    // Statistics JSON
    this.app.get("/api/stats", this.requireAuth.bind(this), (req, res) => {
      res.json(this.botManager.statsManager.getStats());
    });

    // Advanced Statistics
    this.app.get("/api/stats/advanced", this.requireAuth.bind(this), (req, res) => {
      const stats = this.botManager.statsManager.getStats();
      const hourlyStats = Object.entries(stats.hourlyStats || {})
        .slice(-24) // Last 24 hours
        .map(([hour, data]) => ({
          hour: hour,
          ...data
        }));
      
      res.json({
        hourlyStats: hourlyStats,
        conversationAnalytics: stats.conversationAnalytics,
        botPerformance: stats.botPerformance,
        errorLog: stats.errorLog.slice(-20), // Last 20 errors
        performanceMetrics: {
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          uptime: process.uptime()
        }
      });
    });

    // Recent conversations
    this.app.get("/api/conversations", this.requireAuth.bind(this), (req, res) => {
      res.json({
        history: this.botManager.aiEngine.conversationHistory.slice(-10),
        depth: this.botManager.aiEngine.conversationDepth,
        nextSpeaker: this.botManager.nextSpeaker,
        enabled: this.botManager.config.AI_CONVERSATION_ENABLED,
        topics: this.botManager.aiEngine.topics,
        lastSpeaker: this.botManager.aiEngine.lastSpeaker
      });
    });

    // Configuration API
    this.app.get("/api/config", this.requireAuth.bind(this), (req, res) => {
      const config = this.botManager.config;
      res.json({
        aiConversation: {
          enabled: config.AI_CONVERSATION_ENABLED,
          intervalMin: config.CONVERSATION_INTERVAL_MIN,
          intervalMax: config.CONVERSATION_INTERVAL_MAX,
          chance: config.CONVERSATION_CHANCE
        },
        leveling: {
          enabled: config.LEVELING_ENABLED,
          baseTime: config.SPAM_BASE_TIME,
          variation: config.SPAM_VARIATION
        },
        system: {
          logLevel: config.LOG_LEVEL,
          statusInterval: config.STATUS_INTERVAL,
          webServerPort: config.WEB_SERVER_PORT
        },
        dashboard: {
          theme: config.DASHBOARD_THEME,
          language: config.DASHBOARD_LANGUAGE,
          autoRefresh: config.DASHBOARD_AUTO_REFRESH,
          notifications: config.DASHBOARD_NOTIFICATIONS
        }
      });
    });

    // Update configuration API (requires edit permission)
    this.app.post("/api/config/update", this.requireEditAuth.bind(this), (req, res) => {
      const updates = req.body;
      
      try {
        // Update AI conversation settings
        if (updates.aiConversation) {
          Object.assign(this.botManager.config, updates.aiConversation);
        }
        
        // Update leveling settings
        if (updates.leveling) {
          Object.assign(this.botManager.config, updates.leveling);
        }
        
        // Update system settings
        if (updates.system) {
          Object.assign(this.botManager.config, updates.system);
        }
        
        // Update dashboard settings
        if (updates.dashboard) {
          Object.assign(this.botManager.config, updates.dashboard);
        }
        
        res.json({ success: true, message: 'تم تحديث الإعدادات بنجاح' });
      } catch (error) {
        res.status(500).json({ success: false, error: 'خطأ في تحديث الإعدادات' });
      }
    });

    // System restart API
    this.app.post("/api/system/restart", this.requireEditAuth.bind(this), (req, res) => {
      try {
        res.json({ success: true, message: 'جاري إعادة تشغيل النظام...' });
        
        // Restart after response is sent
        setTimeout(() => {
          process.exit(0);
        }, 1000);
      } catch (error) {
        res.status(500).json({ success: false, error: 'خطأ في إعادة تشغيل النظام' });
      }
    });

    // System clean API
    this.app.post("/api/system/clean", this.requireAuth.bind(this), (req, res) => {
      try {
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
        
        // Clear some memory
        this.botManager.aiEngine.conversationHistory = this.botManager.aiEngine.conversationHistory.slice(-10);
        
        res.json({ success: true, message: 'تم تنظيف النظام بنجاح' });
      } catch (error) {
        res.status(500).json({ success: false, error: 'خطأ في تنظيف النظام' });
      }
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
      Logger.info(`🔐 Login required to access dashboard`);
    });
  }
}

// 📅 Scheduled Tasks
class ScheduledTasks {
  constructor(botManager) {
    this.botManager = botManager;
    this.cron = require("node-cron");
  }

  start() {
    // Memory cleanup every hour
    this.cron.schedule('0 * * * *', () => {
      if (global.gc) {
        global.gc();
        Logger.debug("Memory cleanup performed");
      }
    });

    // Daily report
    this.cron.schedule('0 0 * * *', () => {
      const stats = this.botManager.statsManager.getStats();
      this.botManager.webhookManager.send(`📊 **Daily Report:**
- Messages Processed: ${stats.messagesProcessed}
- AI Conversations: ${stats.aiConversations}
- Leveling Messages: ${stats.levelingMessages || 0}
- Commands Executed: ${stats.commandsExecuted}
- Reconnections: ${stats.reconnections}
- Errors: ${stats.errors}
- Uptime: ${stats.uptimeFormatted}`);
    });

    // Reset conversations every 6 hours
    this.cron.schedule('0 */6 * * *', () => {
      this.botManager.aiEngine.resetConversation();
      Logger.info("AI conversation reset scheduled");
    });

    Logger.info("📅 Scheduled tasks started");
  }
}

// 🎯 Main Application
async function main() {
  try {
    console.log("🚀 Starting Discord Bot Manager - Enhanced AI Version");

    // Install dependencies
    await DependencyManager.ensureDependencies();

    // Load configuration
    const config = ConfigManager.loadConfig();

    // Create bot manager
    const botManager = new BotManager(config);

    // Start web server
    const webServer = new WebServer(botManager, config.WEB_SERVER_PORT);
    webServer.start();

    // Start scheduled tasks
    const scheduledTasks = new ScheduledTasks(botManager);
    scheduledTasks.start();

    // Start bot
    await botManager.start();

    Logger.info("🎉 System started successfully!");
    Logger.info("🤖 Enabled Features:");
    Logger.info(`   - AI Conversations: ${config.AI_CONVERSATION_ENABLED ? '✅' : '❌'}`);
    Logger.info(`   - Leveling System: ${config.LEVELING_ENABLED ? '✅' : '❌'}`);
    Logger.info(`   - Web Interface: ✅ (Port: ${config.WEB_SERVER_PORT})`);
    Logger.info(`   - Scheduled Tasks: ✅`);

  } catch (error) {
    Logger.error("Fatal error during startup", error);
    process.exit(1);
  }
}

// Run application
if (require.main === module) {
  main().catch(error => {
    console.error("❌ Startup error:", error);
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
