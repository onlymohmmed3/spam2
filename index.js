// Load environment variables from .env file
require('dotenv').config();

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
            'dotenv@16.0.3' // Add dotenv to dependencies
        ];

        console.log('🔧 Installing dependencies...');
        for (const pkg of packages) {
            try {
                // Check if the package is already installed
                require.resolve(pkg.split('@')[0]);
                console.log(`✅ ${pkg.split('@')[0]} is already installed.`);
            } catch (e) {
                // If not installed, install it
                console.log(`📦 Installing: ${pkg}`);
                execSync(`npm install ${pkg}`, { stdio: 'inherit' });
            }
        }
        console.log('✅ All dependencies installed!');
    }
}

// Immediately invoke dependency installation and then proceed with app setup
(async () => {
    await DependencyManager.install();

    // Now that dependencies are confirmed, require them
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

    // 🛡️ Configuration Loader (from .env)
    class Config {
        constructor() {
            // Discord Bot Configuration
            this.tokens = process.env.DISCORD_TOKENS ? process.env.DISCORD_TOKENS.split(',') : [];
            this.channels = {
                control: process.env.CONTROL_CHANNEL_ID || "",
                conversation: process.env.CONVERSATION_CHANNEL_ID || ""
            };

            // Security Configuration
            this.security = {
                adminPassword: process.env.ADMIN_PASSWORD || "",
                jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
                maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5
            };

            // Bot Features Configuration
            this.bot = {
                messageInterval: parseInt(process.env.MESSAGE_INTERVAL) || 10000,
                aiEnabled: process.env.AI_ENABLED === 'true',
                autoReconnect: process.env.AUTO_RECONNECT === 'true',
                language: process.env.BOT_LANGUAGE || "ar"
            };

            // Web Dashboard Server Configuration
            this.server = {
                port: parseInt(process.env.SERVER_PORT) || 3000,
                host: process.env.SERVER_HOST || "localhost"
            };

            // Additional Features
            this.features = {
                webDashboard: process.env.WEB_DASHBOARD_ENABLED === 'true',
                statistics: process.env.STATISTICS_ENABLED === 'true',
                logging: process.env.LOGGING_ENABLED === 'true',
                notifications: process.env.NOTIFICATIONS_ENABLED === 'true'
            };

            this.validateAndHashAdminPassword();
            this.validateJwtSecret();
        }

        // Validate and hash admin password if it's not already hashed
        async validateAndHashAdminPassword() {
            const adminPassword = this.security.adminPassword;
            if (adminPassword && !adminPassword.startsWith('$2a$')) { // Check if it looks like a bcrypt hash
                try {
                    const hashedPassword = await bcrypt.hash(adminPassword, 10);
                    this.security.adminPassword = hashedPassword;
                    Logger.warn('Admin password has been hashed and updated in memory. Please update your .env file with the hashed password for persistence.');
                    Logger.warn(`New Hashed Password (for .env): ${hashedPassword}`);
                } catch (error) {
                    Logger.error('Failed to hash admin password:', error.message);
                }
            }
        }

        // Ensure JWT secret is set
        validateJwtSecret() {
            if (!this.security.jwtSecret) {
                this.security.jwtSecret = crypto.randomBytes(32).toString('hex');
                Logger.warn(`JWT_SECRET was not set in .env. A new one has been generated in memory. Please update your .env file with: JWT_SECRET="${this.security.jwtSecret}" for persistence.`);
            }
        }

        get(key) {
            // Helper to get nested configuration values
            return key.split('.').reduce((obj, k) => obj?.[k], this);
        }
    }

    // Initialize global configuration instance
    const config = new Config();


    // 📊 Advanced Database Manager
    class DatabaseManager {
        constructor() {
            // Path to the lowdb data file
            const dbFilePath = path.join(__dirname, 'data.json');
            const adapter = new JSONFile(dbFilePath);
            this.db = new Low(adapter);
            this.init();
        }

        async init() {
            // Read the database file
            await this.db.read();
            // Set default data if the file is empty
            this.db.data ||= {
                stats: {
                    totalMessages: 0,
                    aiMessages: 0,
                    errors: 0,
                    reconnects: 0,
                    startTime: Date.now(),
                    dailyStats: {} // Daily statistics will be stored here
                },
                accounts: {}, // Account specific data (if needed later)
                logs: [], // Application logs
                sessions: {} // User sessions for web dashboard
            };
            // Write the initial data back to the file
            await this.db.write();
        }

        async updateStats(type, increment = 1) {
            if (!config.get('features.statistics')) return; // Check if statistics are enabled

            const today = new Date().toISOString().split('T')[0]; // Get today's date inYYYY-MM-DD format
            this.db.data.stats[type] += increment; // Increment the main statistic
            this.db.data.stats.dailyStats[today] = this.db.data.stats.dailyStats[today] || {};
            this.db.data.stats.dailyStats[today][type] = (this.db.data.stats.dailyStats[today][type] || 0) + increment;
            await this.db.write(); // Persist changes to disk
        }

        async addLog(level, message, data = {}) {
            if (!config.get('features.logging')) return; // Check if logging is enabled

            this.db.data.logs.push({
                timestamp: Date.now(),
                level,
                message,
                data
            });

            // Keep only the last 1000 logs to prevent the file from growing too large
            if (this.db.data.logs.length > 1000) {
                this.db.data.logs = this.db.data.logs.slice(-1000);
            }

            await this.db.write(); // Persist changes to disk
        }
    }

    // 🎨 Advanced Logger
    class Logger {
        static info(message, data = {}) {
            console.log(chalk.cyan(`[INFO] ${new Date().toLocaleString()} - ${message}`));
            // Add log to database if it's initialized and logging is enabled
            if (global.db && config.get('features.logging')) global.db.addLog('info', message, data);
        }

        static warn(message, data = {}) {
            console.log(chalk.yellow(`[WARN] ${new Date().toLocaleString()} - ${message}`));
            if (global.db && config.get('features.logging')) global.db.addLog('warn', message, data);
        }

        static error(message, data = {}) {
            console.log(chalk.red(`[ERROR] ${new Date().toLocaleString()} - ${message}`));
            if (global.db && config.get('features.logging')) global.db.addLog('error', message, data);
        }

        static success(message, data = {}) {
            console.log(chalk.green(`[SUCCESS] ${new Date().toLocaleString()} - ${message}`));
            if (global.db && config.get('features.logging')) global.db.addLog('success', message, data);
        }
    }

    // 🤖 Intelligent Message Generator
    class AIMessageGenerator {
        constructor() {
            // Message templates for different languages and types
            this.templates = {
                ar: {
                    casual: [
                        "مرحبا جميعاً! كيف الحال اليوم؟ �",
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

            this.lastMessages = []; // To avoid sending the same message repeatedly
            this.conversationContext = []; // For more advanced AI interactions (not fully implemented in this version)
        }

        // Generates a message based on type and language
        generateMessage(type = 'casual', language = 'ar') {
            const templates = this.templates[language]?.[type] || this.templates.ar[type];
            let message;

            // Ensure the generated message is not one of the last 10 messages sent
            do {
                message = templates[Math.floor(Math.random() * templates.length)];
            } while (this.lastMessages.includes(message) && templates.length > 1);

            this.lastMessages.push(message);
            // Keep only the last 10 messages
            if (this.lastMessages.length > 10) {
                this.lastMessages.shift();
            }

            return message;
        }

        // Generates a contextual response based on the last message (basic implementation)
        generateContextualResponse(lastMessage) {
            // Determine language based on message content
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
            this.config = config; // Configuration instance
            this.db = db; // Database instance
            this.clients = new Map(); // Stores Discord Client objects
            this.status = new Map(); // Stores the status of each account (online, offline, connecting, error, failed)
            this.reconnectAttempts = new Map(); // Tracks reconnection attempts for each account
            this.messageIntervals = new Map(); // Stores setInterval IDs for message loops
            this.aiGenerator = new AIMessageGenerator(); // AI message generator instance
        }

        async startAccount(token, index) {
            // Prevent starting an already running account
            if (this.clients.has(index)) {
                Logger.warn(`Account ${index + 1} is already running`);
                return false;
            }

            try {
                // Initialize Discord client
                const client = new Client({
                    checkUpdate: false, // Disable update checks
                    readyStatus: false, // Do not set custom ready status
                    autoreconnect: this.config.get('bot.autoReconnect') // Use config for auto-reconnect
                });

                this.clients.set(index, client);
                this.status.set(index, 'connecting'); // Set initial status to connecting
                this.reconnectAttempts.set(index, 0); // Reset reconnect attempts

                // Event listener for client ready
                client.on('ready', () => {
                    this.status.set(index, 'online'); // Set status to online
                    Logger.success(`Account ${index + 1} (${client.user.username}) is ready!`);
                    this.startMessageLoop(index); // Start sending messages
                });

                // Event listener for client errors
                client.on('error', (error) => {
                    Logger.error(`Account ${index + 1} error: ${error.message}`);
                    this.handleAccountError(index, error); // Handle the error and attempt reconnection
                });

                // Event listener for client disconnect
                client.on('disconnect', () => {
                    this.status.set(index, 'offline'); // Set status to offline
                    this.stopMessageLoop(index); // Stop message loop
                    Logger.warn(`Account ${index + 1} disconnected`);
                });

                // Log in to Discord
                await client.login(token);
                return true;
            } catch (error) {
                Logger.error(`Failed to start account ${index + 1}: ${error.message}`);
                this.status.set(index, 'error'); // Set status to error
                return false;
            }
        }

        async stopAccount(index) {
            const client = this.clients.get(index);
            if (client) {
                this.stopMessageLoop(index); // Stop message loop
                client.destroy(); // Destroy the Discord client
                this.clients.delete(index); // Remove client from map
                this.status.set(index, 'offline'); // Set status to offline
                Logger.info(`Account ${index + 1} stopped`);
                return true;
            }
            return false;
        }

        startMessageLoop(index) {
            // Stop any existing loop to prevent duplicates
            this.stopMessageLoop(index);

            // Start a new interval for sending messages
            const interval = setInterval(async () => {
                await this.sendAutoMessage(index);
            }, this.config.get('bot.messageInterval'));

            this.messageIntervals.set(index, interval);
            Logger.info(`Started message loop for account ${index + 1} with interval ${this.config.get('bot.messageInterval')}ms`);
        }

        stopMessageLoop(index) {
            const interval = this.messageIntervals.get(index);
            if (interval) {
                clearInterval(interval); // Clear the interval
                this.messageIntervals.delete(index); // Remove interval ID from map
                Logger.info(`Stopped message loop for account ${index + 1}`);
            }
        }

        async sendAutoMessage(index) {
            const client = this.clients.get(index);
            const channelId = this.config.get('channels.conversation');

            // Only proceed if client is available and conversation channel is set and AI is enabled
            if (!client || !channelId || !this.config.get('bot.aiEnabled')) {
                // Logger.warn(`Skipping auto message for account ${index + 1}. Client: ${!!client}, Channel ID: ${!!channelId}, AI Enabled: ${this.config.get('bot.aiEnabled')}`);
                return;
            }

            try {
                const channel = await client.channels.fetch(channelId);
                if (!channel) {
                    Logger.error(`Conversation channel with ID ${channelId} not found for account ${index + 1}.`);
                    return;
                }
                const message = this.aiGenerator.generateMessage('casual', this.config.get('bot.language'));

                await channel.send(message);
                await this.db.updateStats('totalMessages');
                await this.db.updateStats('aiMessages'); // Increment AI messages stat

                Logger.info(`Account ${index + 1} sent auto message to channel ${channel.name} (${channelId})`);
            } catch (error) {
                Logger.error(`Failed to send auto message for account ${index + 1}: ${error.message}`);
                await this.db.updateStats('errors');
            }
        }

        async handleAccountError(index, error) {
            await this.db.updateStats('errors'); // Increment error statistics
            const attempts = this.reconnectAttempts.get(index) || 0;
            this.stopMessageLoop(index); // Stop message loop immediately on error

            // Attempt to reconnect up to 5 times with exponential backoff
            if (attempts < 5) {
                this.reconnectAttempts.set(index, attempts + 1);
                const delay = Math.min(5000 * Math.pow(2, attempts), 60000); // Max delay 60 seconds

                setTimeout(() => {
                    Logger.info(`Attempting to reconnect account ${index + 1} (attempt ${attempts + 1})`);
                    const token = this.config.get('tokens')[index];
                    if (token) {
                        this.startAccount(token, index);
                    } else {
                        Logger.error(`No token found for account ${index + 1} to reconnect.`);
                    }
                }, delay);
                await this.db.updateStats('reconnects');
            } else {
                Logger.error(`Account ${index + 1} failed after ${this.config.get('security.maxLoginAttempts')} reconnection attempts. Please check token or network.`);
                this.status.set(index, 'failed'); // Mark as failed after max attempts
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
            if (tokens.length === 0) {
                Logger.warn('No Discord tokens found in .env. Please add DISCORD_TOKENS.');
                return;
            }
            Logger.info(`Starting ${tokens.length} Discord accounts...`);
            const promises = tokens.map((token, index) => this.startAccount(token, index));
            await Promise.allSettled(promises); // Wait for all accounts to attempt starting
            Logger.info('All account start attempts completed.');
        }
    }

    // 🌐 Web Dashboard Server
    class WebDashboardServer {
        constructor(config, db, botManager) {
            this.config = config; // Configuration instance
            this.db = db; // Database instance
            this.botManager = botManager; // BotAccountManager instance
            this.app = express(); // Express application
            this.server = null; // HTTP server instance
            this.wss = null; // WebSocket server instance
            this.setupMiddleware();
            this.setupRoutes();
            this.setupWebSocket();
        }

        setupMiddleware() {
            // Apply security headers
            this.app.use(helmet({
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                        imgSrc: ["'self'", "data:", "https:"],
                        // Ensure connectSrc allows both ws and wss for the configured host and port
                        connectSrc: ["'self'", "ws://" + this.config.get('server.host') + ":" + this.config.get('server.port'), "wss://" + this.config.get('server.host') + ":" + this.config.get('server.port')]
                    },
                },
            }));
            this.app.use(cors()); // Enable CORS for all routes
            this.app.use(express.json()); // Parse JSON request bodies
            // Serve static files from 'public' directory (if any)
            this.app.use(express.static(path.join(__dirname, 'public')));
        }

        setupRoutes() {
            // Authentication endpoint
            this.app.post('/api/login', async (req, res) => {
                try {
                    const { password } = req.body;
                    const adminPasswordHash = this.config.get('security.adminPassword');

                    if (!adminPasswordHash) {
                        return res.status(400).json({ error: 'Admin password not set in .env. Please set ADMIN_PASSWORD.' });
                    }

                    // Compare provided password with stored hash
                    const isValid = await bcrypt.compare(password, adminPasswordHash);
                    if (!isValid) {
                        // Implement login attempt tracking here if needed
                        return res.status(401).json({ error: 'Invalid password' });
                    }

                    // Generate JWT token
                    const token = jwt.sign(
                        { admin: true },
                        this.config.get('security.jwtSecret'),
                        { expiresIn: '24h' } // Token expires in 24 hours
                    );

                    res.json({ token });
                } catch (error) {
                    Logger.error('Login error:', error.message);
                    res.status(500).json({ error: 'Internal server error during login' });
                }
            });

            // Dashboard data endpoint (requires authentication)
            this.app.get('/api/dashboard', this.authenticate.bind(this), async (req, res) => {
                try {
                    // Ensure db.data is read and available
                    await this.db.db.read(); // Read the latest data from the database
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
                    Logger.error('Dashboard data fetch error:', error.message);
                    res.status(500).json({ error: 'Failed to fetch dashboard data' });
                }
            });

            // Account control endpoints (start/stop, requires authentication)
            this.app.post('/api/accounts/:index/start', this.authenticate.bind(this), async (req, res) => {
                try {
                    const index = parseInt(req.params.index);
                    const tokens = this.config.get('tokens');
                    if (index < 0 || index >= tokens.length) {
                        return res.status(400).json({ error: 'Invalid account index.' });
                    }
                    const success = await this.botManager.startAccount(tokens[index], index);
                    res.json({ success });
                } catch (error) {
                    Logger.error(`Error starting account ${req.params.index}:`, error.message);
                    res.status(500).json({ error: `Failed to start account: ${error.message}` });
                }
            });

            this.app.post('/api/accounts/:index/stop', this.authenticate.bind(this), async (req, res) => {
                try {
                    const index = parseInt(req.params.index);
                    const tokens = this.config.get('tokens');
                    if (index < 0 || index >= tokens.length) {
                        return res.status(400).json({ error: 'Invalid account index.' });
                    }
                    const success = await this.botManager.stopAccount(index);
                    res.json({ success });
                } catch (error) {
                    Logger.error(`Error stopping account ${req.params.index}:`, error.message);
                    res.status(500).json({ error: `Failed to stop account: ${error.message}` });
                }
            });

            // Serve the main dashboard HTML page
            this.app.get('/', (req, res) => {
                res.send(this.getDashboardHTML());
            });
        }

        setupWebSocket() {
            // Create a WebSocket server attached to the HTTP server
            this.wss = new WebSocket.Server({ noServer: true });

            this.wss.on('connection', (ws) => {
                Logger.info('WebSocket client connected');

                // Send initial dashboard data to the new client
                this.sendDashboardUpdate(ws);

                // Set up an interval to send dashboard updates every 5 seconds
                const interval = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        this.sendDashboardUpdate(ws);
                    }
                }, 5000);

                ws.on('close', () => {
                    clearInterval(interval); // Clear interval when client disconnects
                    Logger.info('WebSocket client disconnected');
                });

                ws.on('error', (error) => {
                    Logger.error('WebSocket error:', error.message);
                });
            });
        }

        async sendDashboardUpdate(ws) {
            try {
                await this.db.db.read(); // Read the latest data from the database
                const stats = this.db.db.data.stats;
                const accounts = this.botManager.getAccountsStatus();

                // Send dashboard data as a JSON string
                ws.send(JSON.stringify({
                    type: 'dashboard_update',
                    data: {
                        stats: {
                            ...stats,
                            uptime: Date.now() - stats.startTime,
                            activeAccounts: accounts.filter(a => a.status === 'online').length,
                            totalAccounts: accounts.length // Include total accounts for active/total display
                        },
                        accounts
                    }
                }));
            } catch (error) {
                Logger.error('Failed to send WebSocket update:', error.message);
            }
        }

        // Middleware to authenticate requests using JWT
        authenticate(req, res, next) {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }

            try {
                jwt.verify(token, this.config.get('security.jwtSecret')); // Verify token
                next(); // Proceed to the next middleware/route handler
            } catch (error) {
                Logger.warn('Invalid token attempt:', error.message);
                res.status(401).json({ error: 'Invalid or expired token' });
            }
        }

        // Returns the HTML for the web dashboard
        getDashboardHTML() {
            // This is a single-page application structure that loads data dynamically via API and WebSockets.
            // Tailwind CSS is not used here as the original code uses inline styles and a single CSS block.
            // If Tailwind was requested, a different structure would be needed.
            return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Discord SuperBot Pro - Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        /* General Reset and Box Sizing */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        /* Body Styling */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* Gradient background */
            min-height: 100vh; /* Full viewport height */
            color: #333; /* Default text color */
        }

        /* Container for dashboard content */
        .container {
            max-width: 1200px;
            margin: 0 auto; /* Center the container */
            padding: 20px;
        }

        /* Header Section Styling */
        .header {
            background: rgba(255, 255, 255, 0.1); /* Semi-transparent white background */
            backdrop-filter: blur(10px); /* Frosted glass effect */
            border-radius: 20px; /* Rounded corners */
            padding: 30px;
            margin-bottom: 30px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2); /* Subtle border */
        }

        .header h1 {
            color: white;
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3); /* Text shadow for depth */
        }

        .header p {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.1em;
        }

        /* Statistics Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive grid columns */
            gap: 20px; /* Gap between grid items */
            margin-bottom: 30px;
        }

        /* Individual Stat Card */
        .stat-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease; /* Smooth hover effects */
        }

        .stat-card:hover {
            transform: translateY(-5px); /* Lift effect on hover */
            box-shadow: 0 10px 25px rgba(0,0,0,0.2); /* Larger shadow on hover */
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

        /* Accounts Section */
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

        /* Individual Account Card */
        .account-card {
            background: rgba(255, 255, 255, 0.05); /* Very subtle background */
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between; /* Space out content and buttons */
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

        /* Status Badges */
        .account-status {
            padding: 5px 12px;
            border-radius: 20px; /* Pill shape */
            font-size: 0.9em;
            font-weight: bold;
        }

        .status-online {
            background: #27ae60; /* Green */
            color: white;
        }

        .status-offline {
            background: #e74c3c; /* Red */
            color: white;
        }

        .status-connecting {
            background: #f39c12; /* Orange */
            color: white;
        }

        .status-error, .status-failed {
            background: #c0392b; /* Darker red for errors/failed */
            color: white;
        }

        /* Buttons */
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease; /* Smooth transitions for hover */
            margin: 0 5px;
        }

        .btn-primary {
            background: #3498db; /* Blue */
            color: white;
        }

        .btn-danger {
            background: #e74c3c; /* Red */
            color: white;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        /* Login Form Styling */
        .login-form {
            max-width: 400px;
            margin: 100px auto; /* Center vertically and horizontally */
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

        /* Loading Spinner */
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite; /* Spinning animation */
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Utility Class for Hiding Elements */
        .hidden {
            display: none;
        }

        /* Alert Messages */
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
    <!-- Login Form Section -->
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

    <!-- Dashboard Section (initially hidden) -->
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
                <div class="stat-value"�
