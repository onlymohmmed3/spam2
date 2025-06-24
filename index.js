// 🚀 Discord SuperBot Pro - Professional Edition
// Complete rewrite with modern architecture and sleek design

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// 📦 Smart Dependency Manager
class DependencyManager {
  static async install() {
    const packages = [
      'discord.js-selfbot-v13@3.0.1',
      'express@4.18.2',
      'bcryptjs@2.4.3',
      'jsonwebtoken@9.0.0',
      'cors@2.8.5',
      'helmet@6.1.5',
      'ws@8.13.0',
      'node-cron@3.0.2',
      'chalk@4.1.2',
      'lowdb@6.0.1',
      'dotenv@16.3.1'
    ];
    
    console.log('🔧 Installing dependencies...');
    for (const pkg of packages) {
      try {
        require.resolve(pkg.split('@')[0]);
      } catch {
        console.log(`📦 Installing: ${pkg}`);
        execSync(`npm install ${pkg}`, { stdio: 'inherit' });
      }
    }
    console.log('✅ All dependencies installed!');
  }
}

// Initialize dependencies
DependencyManager.install();

const { Client } = require('discord.js-selfbot-v13');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const WebSocket = require('ws');
const cron = require('node-cron');
const chalk = require('chalk');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
require('dotenv').config();

// 🛡️ Security & Config Manager
class ConfigManager {
  constructor() {
    this.initConfig();
  }

  initConfig() {
    // Load from environment variables
    this.config = {
      tokens: process.env.DISCORD_TOKENS ? process.env.DISCORD_TOKENS.split(',') : [],
      channels: {
        control: process.env.CONTROL_CHANNEL_ID || "",
        conversation: process.env.CONVERSATION_CHANNEL_ID || ""
      },
      security: {
        adminPassword: process.env.ADMIN_PASSWORD || "",
        jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5
      },
      bot: {
        messageInterval: parseInt(process.env.MESSAGE_INTERVAL) || 10000,
        aiEnabled: process.env.AI_ENABLED === 'true',
        autoReconnect: process.env.AUTO_RECONNECT !== 'false',
        language: process.env.BOT_LANGUAGE || "ar"
      },
      server: {
        port: parseInt(process.env.SERVER_PORT) || 3000,
        host: process.env.SERVER_HOST || "localhost"
      },
      features: {
        webDashboard: process.env.WEB_DASHBOARD !== 'false',
        statistics: process.env.STATISTICS !== 'false',
        logging: process.env.LOGGING !== 'false',
        notifications: process.env.NOTIFICATIONS !== 'false'
      }
    };

    // Validate required configuration
    if (!this.config.tokens || this.config.tokens.length === 0) {
      console.log(chalk.yellow('⚠️  No Discord tokens found in .env file'));
      console.log(chalk.cyan('📝 Please add your Discord tokens to .env file:'));
      console.log(chalk.cyan('DISCORD_TOKENS=token1,token2,token3'));
      process.exit(0);
    }

    if (!this.config.channels.control || !this.config.channels.conversation) {
      console.log(chalk.yellow('⚠️  Channel IDs not configured'));
      console.log(chalk.cyan('📝 Please add channel IDs to .env file:'));
      console.log(chalk.cyan('CONTROL_CHANNEL_ID=your_control_channel_id'));
      console.log(chalk.cyan('CONVERSATION_CHANNEL_ID=your_conversation_channel_id'));
      process.exit(0);
    }

    if (!this.config.security.adminPassword) {
      console.log(chalk.yellow('⚠️  Admin password not set'));
      console.log(chalk.cyan('📝 Please add admin password to .env file:'));
      console.log(chalk.cyan('ADMIN_PASSWORD=your_secure_password'));
      process.exit(0);
    }
  }

  get(key) {
    return key.split('.').reduce((obj, k) => obj?.[k], this.config);
  }

  set(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, k) => obj[k] = obj[k] || {}, this.config);
    target[lastKey] = value;
  }
}

// 📊 Advanced Database Manager
class DatabaseManager {
  constructor() {
    const adapter = new JSONFile(path.join(__dirname, 'data.json'));
    this.db = new Low(adapter);
    this.init();
  }

  async init() {
    await this.db.read();
    this.db.data ||= {
      stats: {
        totalMessages: 0,
        aiMessages: 0,
        errors: 0,
        reconnects: 0,
        startTime: Date.now(),
        dailyStats: {}
      },
      accounts: {},
      logs: [],
      sessions: {}
    };
    await this.db.write();
  }

  async updateStats(type, increment = 1) {
    const today = new Date().toISOString().split('T')[0];
    this.db.data.stats[type] += increment;
    this.db.data.stats.dailyStats[today] = this.db.data.stats.dailyStats[today] || {};
    this.db.data.stats.dailyStats[today][type] = (this.db.data.stats.dailyStats[today][type] || 0) + increment;
    await this.db.write();
  }

  async addLog(level, message, data = {}) {
    this.db.data.logs.push({
      timestamp: Date.now(),
      level,
      message,
      data
    });
    
    // Keep only last 1000 logs
    if (this.db.data.logs.length > 1000) {
      this.db.data.logs = this.db.data.logs.slice(-1000);
    }
    
    await this.db.write();
  }
}

// 🎨 Advanced Logger
class Logger {
  static info(message, data = {}) {
    console.log(chalk.cyan(`[INFO] ${new Date().toLocaleString()} - ${message}`));
    if (global.db) global.db.addLog('info', message, data);
  }

  static warn(message, data = {}) {
    console.log(chalk.yellow(`[WARN] ${new Date().toLocaleString()} - ${message}`));
    if (global.db) global.db.addLog('warn', message, data);
  }

  static error(message, data = {}) {
    console.log(chalk.red(`[ERROR] ${new Date().toLocaleString()} - ${message}`));
    if (global.db) global.db.addLog('error', message, data);
  }

  static success(message, data = {}) {
    console.log(chalk.green(`[SUCCESS] ${new Date().toLocaleString()} - ${message}`));
    if (global.db) global.db.addLog('success', message, data);
  }
}

// 🤖 Intelligent Message Generator
class AIMessageGenerator {
  constructor() {
    this.templates = {
      ar: {
        casual: [
          "مرحبا جميعاً! كيف الحال اليوم؟ 😊",
          "هل جرب أحدكم اللعبة الجديدة؟ 🎮",
          "الطقس جميل اليوم، أليس كذلك؟ ☀️",
          "أحتاج نصيحة بخصوص شيء... 🤔",
          "شاهدت فيلم رائع البارحة! 🎬",
          "من يريد مناقشة موضوع التقنية؟ 💻",
          "أحب هذا المجتمع كثيراً! ❤️",
          "هل تعلمون معلومة جديدة اليوم؟ 📚"
        ],
        questions: [
          "ما رأيكم في الذكاء الاصطناعي؟",
          "أي لغة برمجة تفضلون؟",
          "ما هو هدفكم لهذا الأسبوع؟",
          "من يحب القراءة هنا؟",
          "أي نوع موسيقى تسمعون؟",
          "ما أفضل وقت للعمل عندكم؟"
        ],
        reactions: [
          "هذا رائع جداً! 🔥",
          "أوافقك الرأي تماماً ✅",
          "لم أفكر في هذا من قبل 🤯",
          "شكراً لك على المشاركة 🙏",
          "هذا مفيد كثيراً! 💡",
          "أحسنت! 👏"
        ]
      },
      en: {
        casual: [
          "Hey everyone! How's your day going? 😊",
          "Anyone tried the new game yet? 🎮",
          "Beautiful weather today, isn't it? ☀️",
          "Need some advice on something... 🤔",
          "Watched an amazing movie yesterday! 🎬",
          "Anyone want to discuss tech? 💻",
          "Love this community so much! ❤️",
          "Learn anything new today? 📚"
        ],
        questions: [
          "What do you think about AI?",
          "Which programming language do you prefer?",
          "What's your goal for this week?",
          "Who loves reading here?",
          "What type of music do you listen to?",
          "What's your best time to work?"
        ],
        reactions: [
          "That's absolutely amazing! 🔥",
          "I totally agree with you ✅",
          "Never thought about it that way 🤯",
          "Thanks for sharing! 🙏",
          "This is so helpful! 💡",
          "Well done! 👏"
        ]
      }
    };
    
    this.lastMessages = [];
    this.conversationContext = [];
  }

  generateMessage(type = 'casual', language = 'ar') {
    const templates = this.templates[language]?.[type] || this.templates.ar[type];
    let message;
    
    do {
      message = templates[Math.floor(Math.random() * templates.length)];
    } while (this.lastMessages.includes(message) && templates.length > 1);
    
    this.lastMessages.push(message);
    if (this.lastMessages.length > 10) {
      this.lastMessages.shift();
    }
    
    return message;
  }

  generateContextualResponse(lastMessage) {
    const language = /[\u0600-\u06FF]/.test(lastMessage) ? 'ar' : 'en';
    
    if (lastMessage.includes('?') || lastMessage.includes('؟')) {
      return this.generateMessage('reactions', language);
    }
    
    return this.generateMessage('casual', language);
  }
}

// 🔧 Bot Account Manager
class BotAccountManager {
  constructor(config, db) {
    this.config = config;
    this.db = db;
    this.clients = new Map();
    this.status = new Map();
    this.reconnectAttempts = new Map();
    this.messageIntervals = new Map();
    this.aiGenerator = new AIMessageGenerator();
  }

  async startAccount(token, index) {
    if (this.clients.has(index)) {
      Logger.warn(`Account ${index + 1} is already running`);
      return false;
    }

    try {
      const client = new Client({
        checkUpdate: false,
        readyStatus: false,
        autoreconnect: this.config.get('bot.autoReconnect')
      });

      this.clients.set(index, client);
      this.status.set(index, 'connecting');
      this.reconnectAttempts.set(index, 0);

      client.on('ready', () => {
        this.status.set(index, 'online');
        Logger.success(`Account ${index + 1} (${client.user.username}) is ready!`);
        this.startMessageLoop(index);
      });

      client.on('error', (error) => {
        Logger.error(`Account ${index + 1} error: ${error.message}`);
        this.handleAccountError(index, error);
      });

      client.on('disconnect', () => {
        this.status.set(index, 'offline');
        this.stopMessageLoop(index);
        Logger.warn(`Account ${index + 1} disconnected`);
      });

      await client.login(token);
      return true;
    } catch (error) {
      Logger.error(`Failed to start account ${index + 1}: ${error.message}`);
      this.status.set(index, 'error');
      return false;
    }
  }

  async stopAccount(index) {
    const client = this.clients.get(index);
    if (client) {
      this.stopMessageLoop(index);
      client.destroy();
      this.clients.delete(index);
      this.status.set(index, 'offline');
      Logger.info(`Account ${index + 1} stopped`);
      return true;
    }
    return false;
  }

  startMessageLoop(index) {
    const interval = setInterval(async () => {
      await this.sendAutoMessage(index);
    }, this.config.get('bot.messageInterval'));
    
    this.messageIntervals.set(index, interval);
  }

  stopMessageLoop(index) {
    const interval = this.messageIntervals.get(index);
    if (interval) {
      clearInterval(interval);
      this.messageIntervals.delete(index);
    }
  }

  async sendAutoMessage(index) {
    const client = this.clients.get(index);
    const channelId = this.config.get('channels.conversation');
    
    if (!client || !channelId) return;

    try {
      const channel = await client.channels.fetch(channelId);
      const message = this.aiGenerator.generateMessage('casual', this.config.get('bot.language'));
      
      await channel.send(message);
      await this.db.updateStats('totalMessages');
      
      Logger.info(`Account ${index + 1} sent auto message`);
    } catch (error) {
      Logger.error(`Failed to send auto message for account ${index + 1}: ${error.message}`);
    }
  }

  async handleAccountError(index, error) {
    await this.db.updateStats('errors');
    const attempts = this.reconnectAttempts.get(index) || 0;
    
    if (attempts < 5) {
      this.reconnectAttempts.set(index, attempts + 1);
      const delay = Math.min(5000 * Math.pow(2, attempts), 30000);
      
      setTimeout(() => {
        Logger.info(`Attempting to reconnect account ${index + 1} (attempt ${attempts + 1})`);
        const token = this.config.get('tokens')[index];
        this.startAccount(token, index);
      }, delay);
    } else {
      Logger.error(`Account ${index + 1} failed after 5 reconnection attempts`);
      this.status.set(index, 'failed');
    }
  }

  getAccountsStatus() {
    const accounts = [];
    const tokens = this.config.get('tokens');
    
    tokens.forEach((token, index) => {
      const client = this.clients.get(index);
      accounts.push({
        index,
        username: client?.user?.username || 'Unknown',
        status: this.status.get(index) || 'offline',
        reconnectAttempts: this.reconnectAttempts.get(index) || 0
      });
    });
    
    return accounts;
  }

  async startAllAccounts() {
    const tokens = this.config.get('tokens');
    const promises = tokens.map((token, index) => this.startAccount(token, index));
    await Promise.allSettled(promises);
  }
}

// 🌐 Web Dashboard Server
class WebDashboardServer {
  constructor(config, db, botManager) {
    this.config = config;
    this.db = db;
    this.botManager = botManager;
    this.app = express();
    this.server = null;
    this.wss = null;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupMiddleware() {
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  setupRoutes() {
    // Authentication
    this.app.post('/api/login', async (req, res) => {
      try {
        const { password } = req.body;
        const adminPassword = this.config.get('security.adminPassword');
        
        if (!adminPassword) {
          return res.status(400).json({ error: 'Admin password not set' });
        }
        
        const isValid = await bcrypt.compare(password, adminPassword);
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid password' });
        }
        
        const token = jwt.sign(
          { admin: true },
          this.config.get('security.jwtSecret'),
          { expiresIn: '24h' }
        );
        
        res.json({ token });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Dashboard data
    this.app.get('/api/dashboard', this.authenticate.bind(this), async (req, res) => {
      try {
        const stats = this.db.db.data.stats;
        const accounts = this.botManager.getAccountsStatus();
        const uptime = Date.now() - stats.startTime;
        
        res.json({
          stats: {
            ...stats,
            uptime,
            activeAccounts: accounts.filter(a => a.status === 'online').length,
            totalAccounts: accounts.length
          },
          accounts
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Account control
    this.app.post('/api/accounts/:index/start', this.authenticate.bind(this), async (req, res) => {
      try {
        const index = parseInt(req.params.index);
        const success = await this.botManager.startAccount(this.config.get('tokens')[index], index);
        res.json({ success });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/accounts/:index/stop', this.authenticate.bind(this), async (req, res) => {
      try {
        const index = parseInt(req.params.index);
        const success = await this.botManager.stopAccount(index);
        res.json({ success });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Main dashboard page
    this.app.get('/', (req, res) => {
      res.send(this.getDashboardHTML());
    });
  }

  setupWebSocket() {
    this.wss = new WebSocket.Server({ noServer: true });
    
    this.wss.on('connection', (ws) => {
      Logger.info('WebSocket client connected');
      
      // Send initial data
      this.sendDashboardUpdate(ws);
      
      // Send updates every 5 seconds
      const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          this.sendDashboardUpdate(ws);
        }
      }, 5000);
      
      ws.on('close', () => {
        clearInterval(interval);
        Logger.info('WebSocket client disconnected');
      });
    });
  }

  async sendDashboardUpdate(ws) {
    try {
      const stats = this.db.db.data.stats;
      const accounts = this.botManager.getAccountsStatus();
      
      ws.send(JSON.stringify({
        type: 'dashboard_update',
        data: {
          stats: {
            ...stats,
            uptime: Date.now() - stats.startTime,
            activeAccounts: accounts.filter(a => a.status === 'online').length
          },
          accounts
        }
      }));
    } catch (error) {
      Logger.error('Failed to send WebSocket update', error);
    }
  }

  authenticate(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      jwt.verify(token, this.config.get('security.jwtSecret'));
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  getDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Discord SuperBot Pro - Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header h1 {
            color: white;
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.1em;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
        }

        .stat-label {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.1em;
        }

        .accounts-section {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .section-title {
            color: white;
            font-size: 1.8em;
            margin-bottom: 20px;
            text-align: center;
        }

        .account-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .account-info {
            color: white;
        }

        .account-name {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .account-status {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }

        .status-online {
            background: #27ae60;
            color: white;
        }

        .status-offline {
            background: #e74c3c;
            color: white;
        }

        .status-connecting {
            background: #f39c12;
            color: white;
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            margin: 0 5px;
        }

        .btn-primary {
            background: #3498db;
            color: white;
        }

        .btn-danger {
            background: #e74c3c;
            color: white;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .login-form {
            max-width: 400px;
            margin: 100px auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-control {
            width: 100%;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 1.1em;
        }

        .form-control::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }

        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .hidden {
            display: none;
        }

        .alert {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
            font-weight: bold;
        }

        .alert-error {
            background: rgba(231, 76, 60, 0.2);
            color: #e74c3c;
            border: 1px solid #e74c3c;
        }

        .alert-success {
            background: rgba(39, 174, 96, 0.2);
            color: #27ae60;
            border: 1px solid #27ae60;
        }
    </style>
</head>
<body>
    <div id="loginForm" class="login-form">
        <h2 style="color: white; text-align: center; margin-bottom: 30px;">🚀 Discord SuperBot Pro</h2>
        <div id="loginError" class="alert alert-error hidden"></div>
        <form onsubmit="login(event)">
            <div class="form-group">
                <input type="password" id="password" class="form-control" placeholder="كلمة المرور" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">
                <span id="loginBtn">تسجيل الدخول</span>
                <span id="loginLoading" class="loading hidden"></span>
            </button>
        </form>
    </div>

    <div id="dashboard" class="container hidden">
        <div class="header">
            <h1>🤖 Discord SuperBot Pro</h1>
            <p>Professional Multi-Account Discord Bot Management System</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value" id="totalMessages">0</div>
                <div class="stat-label">📨 إجمالي الرسائل</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="activeAccounts">0</div>
                <div class="stat-label">✅ الحسابات النشطة</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="uptime">0</div>
                <div class="stat-label">⏰ مدة التشغيل</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="aiMessages">0</div>
                <div class="stat-label">🧠 رسائل الذكاء الاصطناعي</div>
            </div>
        </div>

        <div class="accounts-section">
            <h2 class="section-title">إدارة الحسابات</h2>
            <div id="accountsList"></div>
        </div>
    </div>

    <script>
        let token = localStorage.getItem('token');
        let ws = null;

        if (token) {
            showDashboard();
        }

        async function login(event) {
            event.preventDefault();
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');
            const loginLoading = document.getElementById('loginLoading');
            const loginError = document.getElementById('loginError');

            loginBtn.classList.add('hidden');
            loginLoading.classList.remove('hidden');
            loginError.classList.add('hidden');

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ password })
                });

                const data = await response.json();

                if (response.ok) {
                    token = data.token;
                    localStorage.setItem('token', token);
                    showDashboard();
                } else {
                    loginError.textContent = data.error || 'خطأ في تسجيل الدخول';
                    loginError.classList.remove('hidden');
                }
            } catch (error) {
                loginError.textContent = 'خطأ في الاتصال بالخادم';
                loginError.classList.remove('hidden');
            }

            loginBtn.classList.remove('hidden');
            loginLoading.classList.add('hidden');
        }

        function showDashboard() {
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            connectWebSocket();
            loadDashboardData();
        }

        function connectWebSocket() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            ws = new WebSocket(\`\${protocol}//\${window.location.host}\`);

            ws.onmessage = function(event) {
                const message = JSON.parse(event.data);
                if (message.type === 'dashboard_update') {
                    updateDashboard(message.data);
                }
            };

            ws.onclose = function() {
                setTimeout(connectWebSocket, 5000);
            };
        }

        async function loadDashboardData() {
            try {
                const response = await fetch('/api/dashboard', {
                    headers: {
                        'Authorization': \`Bearer \${token}\`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    updateDashboard(data);
                } else if (response.status === 401) {
                    localStorage.removeItem('token');
                    location.reload();
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        }

        function updateDashboard(data) {
            const { stats, accounts } = data;

            // Update stats
            document.getElementById('totalMessages').textContent = stats.totalMessages.toLocaleString();
            document.getElementById('activeAccounts').textContent = \`\${stats.activeAccounts}/\${stats.totalAccounts}\`;
            document.getElementById('uptime').textContent = formatUptime(stats.uptime);
            document.getElementById('aiMessages').textContent = stats.aiMessages.toLocaleString();

            // Update accounts list
            const accountsList = document.getElementById('accountsList');
            accountsList.innerHTML = accounts.map(account => \`
                <div class="account-card">
                    <div class="account-info">
                        <div class="account-name">#\${account.index + 1} - \${account.username}</div>
                        <span class="account-status status-\${account.status}">\${getStatusText(account.status)}</span>
                    </div>
                    <div>
                        \${account.status === 'online' ? \`
                            <button class="btn btn-danger" onclick="controlAccount(\${account.index}, 'stop')">
                                إيقاف
                            </button>
                        \` : \`
                            <button class="btn btn-primary" onclick="controlAccount(\${account.index}, 'start')">
                                تشغيل
                            </button>
                        \`}
                    </div>
                </div>
            \`).join('');
        }

        function getStatusText(status) {
            const statusMap = {
                online: 'متصل',
                offline: 'غير متصل',
                connecting: 'يتصل...',
                error: 'خطأ',
                failed: 'فشل'
            };
            return statusMap[status] || status;
        }

        function formatUptime(ms) {
            const seconds = Math.floor(ms / 1000);
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;
            
            if (hours > 0) {
                return \`\${hours}h \${minutes}m \${remainingSeconds}s\`;
            } else if (minutes > 0) {
                return \`\${minutes}m \${remainingSeconds}s\`;
            } else {
                return \`\${remainingSeconds}s\`;
            }
        }

        async function controlAccount(index, action) {
            try {
                const response = await fetch(\`/api/accounts/\${index}/\${action}\`, {
                    method: 'POST',
                    headers: {
                        'Authorization': \`Bearer \${token}\`
                    }
                });

                if (!response.ok) {
                    throw new Error('فشل في تنفيذ العملية');
                }

                // Refresh data immediately
                loadDashboardData();
            } catch (error) {
                alert('خطأ: ' + error.message);
            }
        }
    </script>
</body>
</html>
    `;
  }

  start() {
    this.server = this.app.listen(this.config.get('server.port'), () => {
      Logger.success(`🌐 Dashboard server running on http://localhost:${this.config.get('server.port')}`);
    });

    this.server.on('upgrade', (request, socket, head) => {
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request);
      });
    });
  }
}

// 🎯 Main Application Class
class DiscordSuperBotPro {
  constructor() {
    this.config = new ConfigManager();
    this.db = new DatabaseManager();
    this.botManager = new BotAccountManager(this.config, this.db);
    this.webServer = new WebDashboardServer(this.config, this.db, this.botManager);
    
    global.db = this.db;
    this.setupEventHandlers();
    this.setupScheduledTasks();
  }

  setupEventHandlers() {
    process.on('uncaughtException', (error) => {
      Logger.error('Uncaught Exception:', error);
      this.db.updateStats('errors');
    });

    process.on('unhandledRejection', (reason, promise) => {
      Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.db.updateStats('errors');
    });

    process.on('SIGINT', () => {
      Logger.info('Shutting down gracefully...');
      this.shutdown();
    });

    process.on('SIGTERM', () => {
      Logger.info('Received SIGTERM, shutting down...');
      this.shutdown();
    });
  }

  setupScheduledTasks() {
    // Memory cleanup every hour
    cron.schedule('0 * * * *', () => {
      if (global.gc) {
        global.gc();
        Logger.info('Memory cleanup performed');
      }
    });

    // Daily statistics report
    cron.schedule('0 0 * * *', async () => {
      const stats = this.db.db.data.stats;
      Logger.info(`📊 Daily Report - Messages: ${stats.totalMessages}, AI: ${stats.aiMessages}, Errors: ${stats.errors}`);
    });

    // Account health check every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.performHealthCheck();
    });
  }

  async performHealthCheck() {
    const accounts = this.botManager.getAccountsStatus();
    const offlineAccounts = accounts.filter(a => a.status === 'offline' || a.status === 'error');
    
    if (offlineAccounts.length > 0) {
      Logger.warn(`Health check: ${offlineAccounts.length} accounts are offline`);
      
      // Attempt to restart failed accounts
      for (const account of offlineAccounts) {
        if (account.reconnectAttempts < 3) {
          Logger.info(`Attempting to restart account ${account.index + 1}`);
          const token = this.config.get('tokens')[account.index];
          await this.botManager.startAccount(token, account.index);
        }
      }
    }
  }

  async initialize() {
    try {
      Logger.info('🚀 Initializing Discord SuperBot Pro...');
      
      // Validate configuration
      if (!this.validateConfig()) {
        Logger.error('❌ Configuration validation failed');
        return false;
      }

      // Initialize database
      await this.db.init();
      Logger.success('✅ Database initialized');

      // Start bot accounts
      await this.botManager.startAllAccounts();
      Logger.success('✅ Bot accounts started');

      // Start web server
      this.webServer.start();
      Logger.success('✅ Web dashboard started');

      Logger.success('🎉 Discord SuperBot Pro is ready!');
      return true;
    } catch (error) {
      Logger.error('❌ Initialization failed:', error);
      return false;
    }
  }

  validateConfig() {
    const tokens = this.config.get('tokens');
    const controlChannel = this.config.get('channels.control');
    const conversationChannel = this.config.get('channels.conversation');

    if (!tokens || tokens.length === 0) {
      Logger.error('No tokens configured');
      return false;
    }

    if (!controlChannel || !conversationChannel) {
      Logger.error('Channel IDs not configured');
      return false;
    }

    return true;
  }

  shutdown() {
    Logger.info('Shutting down Discord SuperBot Pro...');
    
    // Stop all bot accounts
    this.config.get('tokens').forEach((_, index) => {
      this.botManager.stopAccount(index);
    });

    // Close web server
    if (this.webServer.server) {
      this.webServer.server.close();
    }

    // Close WebSocket server
    if (this.webServer.wss) {
      this.webServer.wss.close();
    }

    Logger.info('✅ Shutdown complete');
    process.exit(0);
  }
}

// 🚀 Application Entry Point
async function main() {
  console.log(chalk.cyan(`
  ██████╗ ██╗███████╗ ██████╗ ██████╗ ██████╗ ██████╗     ██████╗ ██████╗  ██████╗ 
  ██╔══██╗██║██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔═══██╗
  ██║  ██║██║███████╗██║     ██║   ██║██████╔╝██║  ██║    ██████╔╝██████╔╝██║   ██║
  ██║  ██║██║╚════██║██║     ██║   ██║██╔══██╗██║  ██║    ██╔═══╝ ██╔══██╗██║   ██║
  ██████╔╝██║███████║╚██████╗╚██████╔╝██║  ██║██████╔╝    ██║     ██║  ██║╚██████╔╝
  ╚═════╝ ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝ 
  
  🚀 Discord SuperBot Pro - Professional Edition
  💎 Advanced Multi-Account Management System
  ⚡ Built with Modern Architecture & Security
  `));

  const app = new DiscordSuperBotPro();
  const success = await app.initialize();
  
  if (!success) {
    Logger.error('❌ Failed to start application');
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  Logger.error('❌ Application crashed:', error);
  process.exit(1);
});

module.exports = {
  DiscordSuperBotPro,
  ConfigManager,
  DatabaseManager,
  BotAccountManager,
  WebDashboardServer,
  Logger
}; 
