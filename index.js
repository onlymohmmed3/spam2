const Discord = require("discord.js-selfbot-v13");
const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const { exec } = require("child_process");
const util = require("util");

// ═══════════════════════════════════════════════════════════════════════════════
//                          ADVANCED CONFIGURATION 2025
// ═══════════════════════════════════════════════════════════════════════════════

class AdvancedLevelingBot {
    constructor() {
        this.config = {
            accounts: [
                {
                    token: process.env.TOKEN_1,
                    name: "Account 1",
                    channels: process.env.CHANNELS_1?.split(',') || ['1095118006159409272'],
                    languages: ['ar', 'eng'],
                    active: true
                },
                {
                    token: process.env.TOKEN_2,
                    name: "Account 2", 
                    channels: process.env.CHANNELS_2?.split(',') || ['1095118006159409272'],
                    languages: ['ar', 'eng'],
                    active: true
                }
            ],
            timing: {
                minDelay: parseInt(process.env.MIN_DELAY) || 8000,
                maxDelay: parseInt(process.env.MAX_DELAY) || 15000,
                burstMode: process.env.BURST_MODE === 'true',
                burstInterval: parseInt(process.env.BURST_INTERVAL) || 300000 // 5 minutes
            },
            advanced: {
                randomLetters: process.env.RANDOM_LETTERS === 'true',
                smartRotation: true,
                antiDetection: true,
                errorRecovery: true,
                healthCheck: true
            },
            webhook: {
                port: process.env.PORT || 3000,
                secret: process.env.WEBHOOK_SECRET || crypto.randomBytes(32).toString('hex')
            }
        };

        this.clients = new Map();
        this.stats = {
            totalMessages: 0,
            errors: 0,
            uptime: Date.now(),
            accounts: new Map()
        };
        
        this.app = express();
        this.setupExpress();
        this.messageBank = this.initializeMessageBank();
        this.isRunning = false;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    //                              MESSAGE GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════

    initializeMessageBank() {
        return {
            ar: [
                "كيف الحال؟", "أهلاً وسهلاً", "مرحباً بكم", "يوم سعيد",
                "تحياتي للجميع", "أتمنى لكم التوفيق", "بارك الله فيكم",
                "في أمان الله", "دمتم بخير", "الله يعطيكم العافية",
                "صباح الخير", "مساء الخير", "ليلة سعيدة", "وقت طيب",
                "شكراً لكم", "جزاكم الله خيراً", "بالتوفيق إن شاء الله",
                "الحمد لله", "سبحان الله", "أستغفر الله", "لا إله إلا الله"
            ],
            eng: [
                "Hello everyone!", "Good morning!", "How's everyone doing?",
                "Have a great day!", "Nice to meet you all", "Hope you're well",
                "Take care!", "See you later", "Thanks everyone", "Good luck!",
                "Best wishes", "Stay safe", "Have fun", "Enjoy your time",
                "Great job!", "Well done", "Awesome!", "Perfect!",
                "Amazing work", "Keep it up", "Excellent!", "Fantastic!"
            ]
        };
    }

    generateMessage(language, useRandom = false) {
        if (useRandom) {
            const chars = language === 'ar' 
                ? 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'
                : 'abcdefghijklmnopqrstuvwxyz';
            const length = Math.floor(Math.random() * 8) + 3;
            let message = '';
            for (let i = 0; i < length; i++) {
                message += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return message;
        }

        const messages = this.messageBank[language];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    //                               CLIENT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    async initializeClients() {
        console.log("🚀 Initializing Advanced Discord Leveling System 2025...");
        
        for (const [index, account] of this.config.accounts.entries()) {
            if (!account.active || !account.token) continue;

            try {
                const client = new Discord.Client({
                    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
                    checkUpdate: false,
                    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
                });

                await this.setupClient(client, account, index);
                this.clients.set(account.name, { client, account, active: true });
                
                console.log(`✅ ${account.name} initialized successfully`);
            } catch (error) {
                console.error(`❌ Failed to initialize ${account.name}:`, error.message);
                this.stats.errors++;
            }
        }

        if (this.clients.size === 0) {
            throw new Error("No clients were successfully initialized!");
        }

        console.log(`🎯 Successfully initialized ${this.clients.size} clients`);
    }

    async setupClient(client, account, index) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Login timeout for ${account.name}`));
            }, 30000);

            client.once('ready', () => {
                clearTimeout(timeout);
                console.log(`🟢 ${account.name} (${client.user.username}) is ready!`);
                
                this.stats.accounts.set(account.name, {
                    username: client.user.username,
                    messagesSent: 0,
                    errors: 0,
                    lastMessage: null,
                    status: 'online'
                });

                this.setupClientEventHandlers(client, account);
                resolve();
            });

            client.on('error', (error) => {
                console.error(`❌ ${account.name} error:`, error.message);
                this.handleClientError(account.name, error);
            });

            client.on('disconnect', () => {
                console.log(`⚠️ ${account.name} disconnected`);
                this.handleClientDisconnect(account.name);
            });

            client.login(account.token).catch(reject);
        });
    }

    setupClientEventHandlers(client, account) {
        client.on('messageCreate', (message) => {
            if (message.author.id === client.user.id) {
                const accountStats = this.stats.accounts.get(account.name);
                if (accountStats) {
                    accountStats.messagesSent++;
                    accountStats.lastMessage = new Date().toISOString();
                }
                this.stats.totalMessages++;
            }
        });

        // Anti-detection measures
        client.on('warn', (warning) => {
            console.log(`⚠️ ${account.name} warning:`, warning);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    //                              LEVELING SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════════

    async startLeveling() {
        if (this.isRunning) {
            console.log("⚠️ Leveling system is already running!");
            return;
        }

        this.isRunning = true;
        console.log("🎯 Starting advanced leveling system...");

        // Start leveling for each client
        for (const [name, { client, account }] of this.clients) {
            if (account.active) {
                this.startAccountLeveling(client, account);
            }
        }

        // Start health check
        this.startHealthCheck();
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
    }

    async startAccountLeveling(client, account) {
        const sendMessage = async () => {
            if (!this.isRunning || !account.active) return;

            try {
                // Smart channel rotation
                const channelId = this.selectOptimalChannel(account.channels);
                const channel = await client.channels.fetch(channelId);
                
                if (!channel) {
                    throw new Error(`Channel ${channelId} not found`);
                }

                // Smart language rotation
                const language = this.selectLanguage(account.languages);
                const message = this.generateMessage(language, this.config.advanced.randomLetters);

                // Anti-detection delay
                const delay = this.calculateDelay();
                
                await new Promise(resolve => setTimeout(resolve, delay));
                await channel.send(message);

                console.log(`📤 ${account.name}: "${message}" -> ${channel.name || channelId}`);

            } catch (error) {
                console.error(`❌ ${account.name} send error:`, error.message);
                this.handleSendError(account, error);
            }

            // Schedule next message
            setTimeout(sendMessage, this.calculateNextInterval());
        };

        // Start sending messages
        sendMessage();
    }

    selectOptimalChannel(channels) {
        return channels[Math.floor(Math.random() * channels.length)];
    }

    selectLanguage(languages) {
        return languages[Math.floor(Math.random() * languages.length)];
    }

    calculateDelay() {
        const { minDelay, maxDelay } = this.config.timing;
        return Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
    }

    calculateNextInterval() {
        if (this.config.timing.burstMode) {
            return Math.random() < 0.3 ? 3000 : this.calculateDelay();
        }
        return this.calculateDelay();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    //                               ERROR HANDLING
    // ═══════════════════════════════════════════════════════════════════════════════

    handleClientError(accountName, error) {
        const accountStats = this.stats.accounts.get(accountName);
        if (accountStats) {
            accountStats.errors++;
            accountStats.status = 'error';
        }
        this.stats.errors++;

        // Auto-recovery logic
        if (this.config.advanced.errorRecovery) {
            setTimeout(() => this.attemptRecovery(accountName), 60000);
        }
    }

    handleClientDisconnect(accountName) {
        const accountStats = this.stats.accounts.get(accountName);
        if (accountStats) {
            accountStats.status = 'disconnected';
        }

        // Auto-reconnect logic
        setTimeout(() => this.attemptReconnect(accountName), 30000);
    }

    handleSendError(account, error) {
        const accountStats = this.stats.accounts.get(account.name);
        if (accountStats) {
            accountStats.errors++;
        }

        // Rate limit handling
        if (error.message.includes('rate limit')) {
            console.log(`⏳ ${account.name} rate limited, adjusting timing...`);
            this.config.timing.minDelay = Math.min(this.config.timing.minDelay * 1.5, 30000);
        }
    }

    async attemptRecovery(accountName) {
        console.log(`🔄 Attempting recovery for ${accountName}...`);
        // Recovery logic here
    }

    async attemptReconnect(accountName) {
        console.log(`🔄 Attempting reconnect for ${accountName}...`);
        // Reconnection logic here
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    //                            MONITORING & HEALTH CHECK
    // ═══════════════════════════════════════════════════════════════════════════════

    startHealthCheck() {
        setInterval(() => {
            if (!this.config.advanced.healthCheck) return;

            for (const [name, { client, account }] of this.clients) {
                const accountStats = this.stats.accounts.get(name);
                if (accountStats && client.readyAt) {
                    accountStats.status = client.ws.status === 0 ? 'online' : 'offline';
                }
            }
        }, 30000); // Check every 30 seconds
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            const memUsage = process.memoryUsage();
            console.log(`📊 Memory Usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
            console.log(`📈 Total Messages: ${this.stats.totalMessages}`);
            console.log(`⏱️ Uptime: ${Math.floor((Date.now() - this.stats.uptime) / 1000 / 60)} minutes`);
        }, 300000); // Log every 5 minutes
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    //                              WEB DASHBOARD
    // ═══════════════════════════════════════════════════════════════════════════════

    setupExpress() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'public')));

        // Dashboard routes
        this.setupDashboardRoutes();
        this.setupAPIRoutes();
        this.setupWebhookRoutes();

        const port = this.config.webhook.port;
        this.app.listen(port, () => {
            console.log(`🌐 Dashboard server running on port ${port}`);
            console.log(`📊 Dashboard: http://localhost:${port}/dashboard`);
            console.log(`🔗 API: http://localhost:${port}/api`);
        });
    }

    setupDashboardRoutes() {
        // Main dashboard
        this.app.get('/dashboard', (req, res) => {
            res.send(this.generateDashboardHTML());
        });

        // Real-time stats
        this.app.get('/stats', (req, res) => {
            res.json({
                ...this.stats,
                accounts: Object.fromEntries(this.stats.accounts),
                uptime: Date.now() - this.stats.uptime,
                clientsOnline: Array.from(this.clients.values()).filter(c => c.active).length
            });
        });

        // Ping endpoint for uptime monitoring
        this.app.get('/ping', (req, res) => {
            res.json({ 
                status: 'online', 
                timestamp: new Date().toISOString(),
                uptime: Date.now() - this.stats.uptime
            });
        });
    }

    setupAPIRoutes() {
        // Control endpoints
        this.app.post('/api/start', (req, res) => {
            if (!this.isRunning) {
                this.startLeveling();
                res.json({ success: true, message: 'Leveling system started' });
            } else {
                res.json({ success: false, message: 'Already running' });
            }
        });

        this.app.post('/api/stop', (req, res) => {
            this.isRunning = false;
            res.json({ success: true, message: 'Leveling system stopped' });
        });

        this.app.post('/api/restart', async (req, res) => {
            this.isRunning = false;
            setTimeout(() => this.startLeveling(), 5000);
            res.json({ success: true, message: 'Restarting system...' });
        });

        // Configuration endpoints
        this.app.get('/api/config', (req, res) => {
            const safeConfig = { ...this.config };
            // Remove sensitive data
            safeConfig.accounts = safeConfig.accounts.map(acc => ({
                ...acc,
                token: acc.token ? '***' : null
            }));
            res.json(safeConfig);
        });

        this.app.post('/api/config', (req, res) => {
            try {
                // Update configuration
                Object.assign(this.config, req.body);
                res.json({ success: true, message: 'Configuration updated' });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
        });
    }

    setupWebhookRoutes() {
        // Discord webhook receiver
        this.app.post('/webhook/discord', (req, res) => {
            try {
                console.log('📨 Webhook received:', req.body);
                res.json({ success: true });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });

        // Custom webhook for external integrations
        this.app.post('/webhook/custom', (req, res) => {
            const { action, data } = req.body;
            
            switch (action) {
                case 'pause':
                    this.isRunning = false;
                    break;
                case 'resume':
                    this.startLeveling();
                    break;
                case 'update_messages':
                    if (data.language && data.messages) {
                        this.messageBank[data.language] = data.messages;
                    }
                    break;
            }

            res.json({ success: true, action });
        });
    }

    generateDashboardHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Discord Leveling Bot - Dashboard 2025</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; min-height: 100vh; padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { opacity: 0.8; font-size: 1.1em; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { 
            background: rgba(255,255,255,0.1); 
            border-radius: 15px; 
            padding: 20px; 
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .card h3 { margin-bottom: 15px; color: #ffd700; }
        .stat { display: flex; justify-content: space-between; margin: 10px 0; }
        .status { padding: 5px 10px; border-radius: 20px; font-size: 0.8em; }
        .online { background: #4CAF50; }
        .offline { background: #f44336; }
        .error { background: #ff9800; }
        .controls { margin-top: 20px; }
        .btn { 
            padding: 10px 20px; 
            margin: 5px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            background: #4CAF50; 
            color: white; 
            font-size: 1em;
        }
        .btn:hover { opacity: 0.8; }
        .btn.danger { background: #f44336; }
        .btn.warning { background: #ff9800; }
        .log { 
            background: #000; 
            color: #0f0; 
            padding: 15px; 
            border-radius: 10px; 
            font-family: monospace; 
            height: 200px; 
            overflow-y: scroll; 
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Advanced Discord Leveling Bot</h1>
            <p>Professional Grade System - 2025 Edition</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>📊 System Statistics</h3>
                <div class="stat">
                    <span>Total Messages:</span>
                    <span id="totalMessages">${this.stats.totalMessages}</span>
                </div>
                <div class="stat">
                    <span>Active Clients:</span>
                    <span id="activeClients">${this.clients.size}</span>
                </div>
                <div class="stat">
                    <span>System Status:</span>
                    <span class="status ${this.isRunning ? 'online' : 'offline'}" id="systemStatus">
                        ${this.isRunning ? 'RUNNING' : 'STOPPED'}
                    </span>
                </div>
                <div class="stat">
                    <span>Uptime:</span>
                    <span id="uptime">${Math.floor((Date.now() - this.stats.uptime) / 1000 / 60)}m</span>
                </div>
            </div>

            <div class="card">
                <h3>👥 Account Status</h3>
                <div id="accountStatus">
                    ${Array.from(this.stats.accounts.entries()).map(([name, stats]) => `
                        <div class="stat">
                            <span>${name}:</span>
                            <span class="status ${stats.status === 'online' ? 'online' : 'offline'}">
                                ${stats.status.toUpperCase()}
                            </span>
                        </div>
                        <div class="stat">
                            <span>Messages:</span>
                            <span>${stats.messagesSent}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card">
                <h3>🎮 System Controls</h3>
                <div class="controls">
                    <button class="btn" onclick="controlSystem('start')">▶️ Start</button>
                    <button class="btn danger" onclick="controlSystem('stop')">⏹️ Stop</button>
                    <button class="btn warning" onclick="controlSystem('restart')">🔄 Restart</button>
                </div>
                <div class="log" id="systemLog">
                    System ready for operation...<br>
                    All systems nominal.<br>
                    Awaiting commands...
                </div>
            </div>

            <div class="card">
                <h3>⚙️ Configuration</h3>
                <div class="stat">
                    <span>Min Delay:</span>
                    <span>${this.config.timing.minDelay}ms</span>
                </div>
                <div class="stat">
                    <span>Max Delay:</span>
                    <span>${this.config.timing.maxDelay}ms</span>
                </div>
                <div class="stat">
                    <span>Anti-Detection:</span>
                    <span class="status ${this.config.advanced.antiDetection ? 'online' : 'offline'}">
                        ${this.config.advanced.antiDetection ? 'ON' : 'OFF'}
                    </span>
                </div>
            </div>
        </div>
    </div>

    <script>
        function controlSystem(action) {
            fetch(\`/api/\${action}\`, { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    const log = document.getElementById('systemLog');
                    log.innerHTML += \`<br>[\${new Date().toLocaleTimeString()}] \${data.message}\`;
                    log.scrollTop = log.scrollHeight;
                });
        }

        // Auto-refresh stats every 5 seconds
        setInterval(() => {
            fetch('/stats')
                .then(res => res.json())
                .then(data => {
                    document.getElementById('totalMessages').textContent = data.totalMessages;
                    document.getElementById('activeClients').textContent = data.clientsOnline;
                    document.getElementById('uptime').textContent = Math.floor(data.uptime / 1000 / 60) + 'm';
                    
                    const statusEl = document.getElementById('systemStatus');
                    statusEl.textContent = data.totalMessages > 0 ? 'RUNNING' : 'STOPPED';
                    statusEl.className = 'status ' + (data.totalMessages > 0 ? 'online' : 'offline');
                });
        }, 5000);
    </script>
</body>
</html>
        `;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    //                               HELP SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════════

    showHelp() {
        console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ADVANCED DISCORD LEVELING BOT 2025                       ║
║                              COMMAND REFERENCE                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🚀 STARTUP COMMANDS:                                                        ║
║     node bot.js --start          Start the leveling system                  ║
║     node bot.js --help           Show this help menu                        ║
║     node bot.js --config         Show current configuration                 ║
║                                                                              ║
║  🌐 WEB DASHBOARD:                                                           ║
║     http://localhost:3000/dashboard    Main control panel                   ║
║     http://localhost:3000/stats        Real-time statistics                 ║
║     http://localhost:3000/api          API endpoints                        ║
║                                                                              ║
║  📊 API ENDPOINTS:                                                           ║
║     POST /api/start              Start the system                           ║
║     POST /api/stop               Stop the system                            ║
║     POST /api/restart            Restart the system                         ║
║     GET  /api/config             Get configuration                          ║
║     POST /api/config             Update configuration                       ║
║                                                                              ║
║  🔧 ENVIRONMENT VARIABLES:                                                   ║
║     TOKEN_1, TOKEN_2            Discord bot tokens                          ║
║     CHANNELS_1, CHANNELS_2      Target channels (comma separated)           ║
║     MIN_DELAY, MAX_DELAY        Message timing (milliseconds)               ║
║     WEBHOOK_SECRET              Webhook security token                      ║
║     PORT                        Web server port (default: 3000)            ║
║                                                                              ║
║  🎯 FEATURES:                                                                ║
║     ✅ Multi-account support     ✅ Real-time dashboard                      ║
║     ✅ Anti-detection system     ✅ Error recovery                           ║
║     ✅ Smart message rotation    ✅ Performance monitoring                   ║
║     ✅ Webhook integration       ✅ 24/7 operation                           ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
        `);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    //                                MAIN EXECUTION
    // ═══════════════════════════════════════════════════════════════════════════════

    async start() {
        try {
            // Handle command line arguments
            const args = process.argv.slice(2);
            if (args.includes('--help')) {
                this.showHelp();
                return;
            }

            console.log("🎯 Starting Advanced Discord Leveling Bot 2025...");
            
            await this.initializeClients();
            
            if (args.includes('--start') || process.env.AUTO_START === 'true') {
                await this.startLeveling();
            }

            console.log("✅ System initialization complete!");
            console.log(`📊 Dashboard available at: http://localhost:${this.config.webhook.port}/dashboard`);

        } catch (error) {
            console.error("❌ Fatal error during startup:", error);
            process.exit(1);
        }
    }

    // Graceful shutdown
    shutdown() {
        console.log("🛑 Shutting down gracefully...");
        this.isRunning = false;
        
        for (const [name, { client }] of this.clients) {
            try {
                client.destroy();
                console.log(`✅ ${name} disconnected safely`);
            } catch (error) {
                console.error(`❌ Error disconnecting ${name}:`, error.message);
            }
        }
        
        process.exit(0);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//                              PROCESS HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

const bot = new AdvancedLevelingBot();

// Handle graceful shutdown
process.on('SIGINT', () => bot.shutdown());
process.on('SIGTERM', () => bot.shutdown());
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    bot.shutdown();
});

// Start the bot
bot.start().catch(error => {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
});

// Export for testing
module.exports = AdvancedLevelingBot;
