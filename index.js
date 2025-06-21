// 🚀 Discord Bot Manager - Ultimate AI Version (LLM Integrated)
// This script provides an extremely robust, scalable, and highly professional management system for Discord self-bots,
// featuring simplified token loading (from .env using TOKEN1, TOKEN2), real-time web monitoring,
// advanced error handling, and sophisticated AI conversation powered by an LLM.

// IMPORTANT DISCLAIMER:
// This code utilizes libraries (discord.js-selfbot-v13, sphinx-run) designed for Discord self-bots.
// Using self-bots is a violation of Discord's Terms of Service and may lead to account termination.
// Proceed at your own risk. It is strongly recommended to use official Discord bot tokens instead.

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const WebSocket = require('ws'); // For real-time updates to the web dashboard

// 📦 Enhanced Dependency Management
// Manages the installation of required Node.js packages to ensure the application runs smoothly.
class DependencyManager {
  static dependencies = [
    "discord.js-selfbot-v13", // Core library for Discord self-bot interactions
    "dotenv",                 // For loading environment variables from .env file
    "express",                // Lightweight web framework for the monitoring interface
    "sphinx-run",             // Used for automated leveling/messaging features
    "axios",                  // HTTP client for making requests (e.g., webhooks)
    "node-cron",              // For scheduling tasks (not directly used here, but common for such apps)
    "ws"                      // WebSocket library for real-time dashboard updates
  ];

  /**
   * Ensures all required NPM dependencies are installed.
   * If a dependency is missing, it attempts to install it.
   */
  static async ensureDependencies() {
    console.log("🔍 Checking dependencies...");
    
    for (const pkg of this.dependencies) {
      const name = pkg.split("@")[0]; // Get package name without version
      try {
        require.resolve(name); // Check if package is resolvable
        console.log(`✅ ${name} available`);
      } catch (e) {
        console.log(`📦 Installing: ${pkg}`);
        try {
          // Execute npm install command for the missing package
          execSync(`npm install ${pkg}`, { 
            stdio: "inherit", // Pipe output to parent process
            timeout: 60000    // Increased timeout for installation (1 minute)
          });
          console.log(`✨ ${name} installed successfully.`);
        } catch (installError) {
          console.error(`❌ Failed to install ${pkg}:`, installError.message);
          process.exit(1); // Exit if critical dependency cannot be installed
        }
      }
    }
    console.log("All dependencies checked.");
  }
}

// 🧠 Natural Conversation Engine (Now with LLM Integration)
// Generates natural-sounding messages for AI-driven conversations between bots.
class AIConversationEngine {
  constructor() {
    // Predefined lists for generating diverse conversation topics and responses
    this.topics = [
      "popular stories", "memories", "cooking", "sports", "games",
      "movies", "books", "travel", "technology", "weather", "dreams",
      "hobbies", "art", "music", "history", "science", "nature",
      "future", "current events", "education", "fashion", "food",
      "health", "animals", "space", "nature", "philosophy"
    ];
    
    this.conversationOpeners = [
      "You know what I was thinking about...",
      "I had an interesting experience...",
      "Remember when we talked about...",
      "I recently discovered something...",
      "A friend told me about...",
      "I had the strangest dream...",
      "There's something I've been meaning to share...",
      "Have you ever considered...",
      "What's your take on..."
    ];

    this.responses = [
      "That's really interesting! 😊",
      "That reminds me of...",
      "I totally agree! I also...",
      "Wow, that's amazing! 👏",
      "Hahaha that's so funny! 😂",
      "Really? What happened next?",
      "No way! That's unbelievable 😱",
      "That makes me think of something else...",
      "I never thought of it that way!",
      "Tell me more about that."
    ];

    this.conversationHistory = []; // Stores recent conversation messages
    this.lastSpeaker = null;       // Tracks who sent the last message
    this.conversationDepth = 0;    // Tracks the length of the current conversation thread
    this.useLLM = false;           // Flag to determine if LLM should be used
  }

  /**
   * Sets whether the LLM should be used for conversation generation.
   * @param {boolean} useLLM - True to use LLM, false to use predefined responses.
   */
  setUseLLM(useLLM) {
    this.useLLM = useLLM;
    Logger.info(`AI Conversation Engine: LLM usage set to ${useLLM ? 'enabled' : 'disabled'}.`);
  }

  /**
   * Selects a random topic from the predefined list.
   * @returns {string} A random topic.
   */
  generateTopic() {
    return this.topics[Math.floor(Math.random() * this.topics.length)];
  }

  /**
   * Generates a conversational opener phrase combined with a random topic.
   * Used as a fallback or for starting new threads.
   * @returns {string} A new conversation starter.
   */
  generateOpenerFallback() {
    const topic = this.generateTopic();
    const opener = this.conversationOpeners[Math.floor(Math.random() * this.conversationOpeners.length)];
    return `${opener} ${topic}...`;
  }

  /**
   * Generates a natural-sounding response based on predefined lists.
   * Used as a fallback when LLM is not enabled or fails.
   * Introduces topic transitions for more dynamic conversations.
   * @returns {string} A generated response.
   */
  generateResponseFallback() {
    let response;
    
    // Introduce topic transitions after a certain conversation depth
    if (this.conversationDepth > 3) {
      const transitions = [
        "Anyway, let's talk about something else...",
        "But enough about that, what do you think about...",
        "Changing the subject a bit...",
        "On a different note...",
        "That reminds me of a completely different topic..."
      ];
      
      if (Math.random() < 0.3) { // 30% chance to transition
        response = transitions[Math.floor(Math.random() * transitions.length)];
        this.conversationDepth = 0; // Reset depth after transition
        return `${response} ${this.generateOpenerFallback()}`;
      }
    }

    // Generate varied responses (questions, anecdotes, simple reactions)
    const responseType = Math.random();
    if (responseType < 0.4) {
      // Follow-up question
      const questions = [
        "What do you think about that?",
        "Have you had similar experiences?",
        "How would you handle that situation?",
        "Does that remind you of anything?",
        "What's your opinion?",
        "How did that make you feel?"
      ];
      response = questions[Math.floor(Math.random() * questions.length)];
    } else if (responseType < 0.7) {
      // Personal anecdote (simplified for AI)
      response = `That reminds me when I ${["saw", "heard", "experienced", "learned", "read about"][Math.floor(Math.random() * 5)]} something similar...`;
    } else {
      // Simple reaction/agreement
      response = this.responses[Math.floor(Math.random() * this.responses.length)];
    }

    return response;
  }

  /**
   * Generates a conversation response using the Gemini 2.0 Flash LLM.
   * @returns {Promise<string>} A promise that resolves to the generated text from the LLM.
   */
  async generateLLMResponse() {
    // Take recent conversation history to provide context to the LLM
    // Map history to the format expected by Gemini API (role: user/model)
    // Assume alternating roles for simplicity in history mapping
    const chatHistoryForLLM = this.conversationHistory.slice(-6).map((msg, idx) => ({
        role: idx % 2 === 0 ? "user" : "model", 
        parts: [{ text: msg }]
    }));

    // Add a specific instruction for the LLM's turn
    chatHistoryForLLM.push({
        role: "user",
        parts: [{ text: "You are a friendly and helpful Discord bot. Based on the conversation, generate a concise, natural, and engaging reply to continue the dialogue. Avoid being repetitive. Do not introduce yourself or mention you are an AI. Keep the response under 100 characters and include relevant emojis if appropriate to enhance friendliness." }]
    });

    try {
        const payload = {
            contents: chatHistoryForLLM,
            generationConfig: {
                maxOutputTokens: 100, // Limit response length
                temperature: 0.9,     // Higher temperature for more creative/random replies
                topP: 1,
                topK: 40
            }
        };
        const apiKey = ""; // Canvas environment provides this API key at runtime
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            Logger.debug(`LLM Generated: ${text}`);
            return text;
        } else {
            Logger.warn("LLM response structure unexpected or empty. Falling back to predefined responses.", result);
            return this.generateResponseFallback(); // Fallback if LLM provides no content
        }
    } catch (llmError) {
        Logger.error("Error calling Gemini API for conversation. Falling back to predefined responses:", llmError);
        return this.generateResponseFallback(); // Fallback on API call error
    }
  }

  /**
   * Main method to get the next message for conversation, decides between LLM or fallback.
   * @param {number} speakerId - The ID of the bot intending to speak (index from accounts array).
   * @returns {Promise<string|null>} The message to send, or null if the same bot spoke last.
   */
  async getNextMessage(speakerId) {
    if (this.lastSpeaker === speakerId) {
      return null; // Prevent same bot from speaking consecutively
    }

    let message;
    
    if (this.conversationHistory.length === 0 || Math.random() < 0.3) { // 30% chance to start new conversation
      message = this.generateOpenerFallback();
      this.conversationDepth = 0;
    } else {
      // If LLM is enabled, try to use it for responses
      if (this.useLLM) {
          message = await this.generateLLMResponse();
      } else {
          message = this.generateResponseFallback();
      }
    }

    this.conversationHistory.push(message); // Add message to history
    this.lastSpeaker = speakerId;
    this.conversationDepth++;

    // Keep conversation history from growing too large
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-10); // Keep last 10 messages
      this.conversationDepth = 0; // Reset depth
    }

    return message;
  }

  /**
   * Resets the conversation history and state.
   */
  resetConversation() {
    this.conversationHistory = [];
    this.lastSpeaker = null;
    this.conversationDepth = 0;
    Logger.info("AI conversation history reset.");
  }
}

// 🔧 Enhanced Configuration
// Manages loading and validating application configurations from the .env file.
class ConfigManager {
  static config = {};
  static accounts = []; // Will store bot token and ID, derived from .env

  /**
   * Loads configurations from .env.
   * Creates a template .env file if it doesn't exist.
   * Loads bot tokens from TOKEN1, TOKEN2 in .env.
   */
  static loadConfig() {
    // Load .env configuration
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      const envTemplate = `# Discord Bot Configuration
CONTROL_CHANNEL_ID=your_channel_id_here                  # Channel ID for bot commands
CONVERSATION_CHANNEL_ID=your_conversation_channel_id_here # Channel ID for AI conversations (defaults to CONTROL_CHANNEL_ID if not set)
WEBHOOK_URL=your_webhook_url_here                       # Discord Webhook URL for logs and notifications

# Bot Tokens
TOKEN1=your_first_discord_bot_token_here
TOKEN2=your_second_discord_bot_token_here
# If you only need one bot, you can leave TOKEN2 empty or commented out.

# AI Conversation Settings
AI_CONVERSATION_ENABLED=true      # Enable/disable AI conversations (true/false)
USE_LLM_FOR_CONVERSATION=false    # Set to true to use Google's Gemini LLM for dynamic responses. (true/false)
CONVERSATION_INTERVAL_MIN=8000    # Minimum delay between AI messages (ms)
CONVERSATION_INTERVAL_MAX=15000   # Maximum delay between AI messages (ms)
CONVERSATION_CHANCE=0.7           # Probability (0.0-1.0) of an AI conversation starting

# Leveling Settings
LEVELING_ENABLED=true             # Enable/disable the leveling/spam system (true/false)
SPAM_BASE_TIME=10000              # Base time for messages (ms). User requested "every 10 seconds".
SPAM_VARIATION=1500               # Random variation added to SPAM_BASE_TIME (ms). (e.g., 10000 +/- 1500)

# System Settings
LOG_LEVEL=info                    # Logging level (error, warn, info, debug)
STATUS_INTERVAL=3600000           # Interval for status updates via webhook (ms, 1 hour default)
WEB_SERVER_PORT=3000              # Port for the web monitoring interface
`;
      fs.writeFileSync(envPath, envTemplate);
      console.log("\n📝 Created .env file - please fill in required values and restart.");
      process.exit(0);
    }
    require("dotenv").config();

    // Load accounts from TOKEN1, TOKEN2 in .env
    let loadedAccounts = [];
    if (process.env.TOKEN1) {
      loadedAccounts.push({ token: process.env.TOKEN1, id: "Bot1" });
      if (process.env.TOKEN2) {
        loadedAccounts.push({ token: process.env.TOKEN2, id: "Bot2" });
      } else {
        Logger.warn("TOKEN2 not found in .env. Running with only Bot1.");
      }
    } else {
      console.error("\n❌ Error: TOKEN1 is missing in .env. At least one bot token is required.");
      process.exit(1);
    }
    this.accounts = loadedAccounts;

    // Validate essential .env configuration
    const required = ['CONTROL_CHANNEL_ID', 'WEBHOOK_URL'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error(`\n❌ Error: Missing required environment variables: ${missing.join(', ')} in .env`);
      console.error("Please fill them in the .env file and restart.");
      process.exit(1);
    }

    // Populate config object with parsed values
    this.config = {
      CONTROL_CHANNEL_ID: process.env.CONTROL_CHANNEL_ID,
      CONVERSATION_CHANNEL_ID: process.env.CONVERSATION_CHANNEL_ID || process.env.CONTROL_CHANNEL_ID,
      WEBHOOK_URL: process.env.WEBHOOK_URL,
      
      AI_CONVERSATION_ENABLED: process.env.AI_CONVERSATION_ENABLED !== 'false',
      USE_LLM_FOR_CONVERSATION: process.env.USE_LLM_FOR_CONVERSATION === 'true', // New LLM flag
      CONVERSATION_INTERVAL_MIN: parseInt(process.env.CONVERSATION_INTERVAL_MIN) || 8000,
      CONVERSATION_INTERVAL_MAX: parseInt(process.env.CONVERSATION_INTERVAL_MAX) || 15000,
      CONVERSATION_CHANCE: parseFloat(process.env.CONVERSATION_CHANCE) || 0.7,
      
      LEVELING_ENABLED: process.env.LEVELING_ENABLED !== 'false',
      SPAM_BASE_TIME: parseInt(process.env.SPAM_BASE_TIME) || 10000,
      SPAM_VARIATION: parseInt(process.env.SPAM_VARIATION) || 1500,
      
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
      STATUS_INTERVAL: parseInt(process.env.STATUS_INTERVAL) || 3600000,
      WEB_SERVER_PORT: parseInt(process.env.WEB_SERVER_PORT) || 3000
    };

    Logger.info("Configuration and accounts loaded successfully.");
    return { config: this.config, accounts: this.accounts };
  }

  /**
   * Reloads configuration from files, allowing for dynamic updates.
   * This specific version only reloads from .env for core config,
   * but cannot dynamically change loaded bot tokens without full restart.
   */
  static reloadConfig() {
    Logger.info("Reloading configuration...");
    // Clear dotenv cache - necessary for dotenv to re-read values
    const configKeys = [
        'CONTROL_CHANNEL_ID', 'CONVERSATION_CHANNEL_ID', 'WEBHOOK_URL',
        'AI_CONVERSATION_ENABLED', 'USE_LLM_FOR_CONVERSATION', // Include new LLM flag
        'CONVERSATION_INTERVAL_MIN', 'CONVERSATION_INTERVAL_MAX',
        'CONVERSATION_CHANCE', 'LEVELING_ENABLED', 'SPAM_BASE_TIME', 'SPAM_VARIATION',
        'LOG_LEVEL', 'STATUS_INTERVAL', 'WEB_SERVER_PORT',
        'TOKEN1', 'TOKEN2' // Also clear tokens for re-read, though client login won't re-run
    ];

    configKeys.forEach(key => {
        if (process.env[key] !== undefined) {
            delete process.env[key];
        }
    });

    const { config, accounts } = this.loadConfig(); // Re-read from files
    // Note: accounts array is re-populated here, but BotManager will retain old clients
    // for TOKEN1/TOKEN2 unless they are explicitly restarted.
    Logger.setLevel(config.LOG_LEVEL); // Re-apply log level
    Logger.info("Configuration reloaded. Note: Token changes require bot restart (`!restart 1` or `!restart 2`).");
    return { config, accounts };
  }
}

// 📝 Enhanced Logging System
// Provides a structured logging mechanism with different severity levels and history tracking.
class Logger {
  static levels = { error: 0, warn: 1, info: 2, debug: 3 };
  static currentLevel = 2; // Default to 'info'
  static logHistory = []; // Stores recent log messages
  static maxLogHistory = 500; // Increased max log history
  static wsServer = null; // Reference to WebSocket server for log broadcasting

  /**
   * Sets the WebSocket server instance for broadcasting logs.
   * @param {WebSocket.Server} wsServerInstance - The WebSocket server instance.
   */
  static setWsServer(wsServerInstance) {
    this.wsServer = wsServerInstance;
  }

  /**
   * Sets the minimum logging level. Messages below this level will not be displayed.
   * @param {string} level - The desired log level ('error', 'warn', 'info', 'debug').
   */
  static setLevel(level) {
    this.currentLevel = this.levels[level] || 2; // Default to 'info' if invalid level
    Logger.info(`Logging level set to: ${level}`);
  }

  /**
   * Formats a log message with timestamp and level, and stores it in history.
   * Also broadcasts it via WebSocket if a server is available.
   * @param {string} level - The log level.
   * @param {string} message - The main log message.
   * @param {string} [extra=''] - Optional additional information (e.g., error message).
   * @returns {string} The formatted log message.
   */
  static format(level, message, extra = '') {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message} ${extra}`;
    
    // Add to history and manage size
    this.logHistory.push(formattedMessage);
    if (this.logHistory.length > this.maxLogHistory) {
      this.logHistory.shift(); // Remove the oldest entry
    }

    // Broadcast log to all connected WebSocket clients
    if (this.wsServer) {
      this.wsServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'log', data: formattedMessage }));
        }
      });
    }
    
    return formattedMessage;
  }

  /**
   * Logs an error message.
   * @param {string} message - The error description.
   * @param {Error} [error=null] - The error object, if available.
   */
  static error(message, error = null) {
    if (this.currentLevel >= 0) { // Check if error level is enabled
      console.error(this.format('error', message, error ? error.message : ''));
    }
  }

  /**
   * Logs a warning message.
   * @param {string} message - The warning description.
   */
  static warn(message) {
    if (this.currentLevel >= 1) { // Check if warn level is enabled
      console.warn(this.format('warn', message));
    }
  }

  /**
   * Logs an informational message.
   * @param {string} message - The informational message.
   */
  static info(message) {
    if (this.currentLevel >= 2) { // Check if info level is enabled
      console.log(this.format('info', message));
    }
  }

  /**
   * Logs a debug message.
   * @param {string} message - The debug message.
   */
  static debug(message) {
    if (this.currentLevel >= 3) { // Check if debug level is enabled
      console.log(this.format('debug', message));
    }
  }

  /**
   * Retrieves a specified number of the most recent log entries.
   * @param {number} [count=20] - The number of log entries to retrieve.
   * @returns {string[]} An array of recent log messages.
   */
  static getRecentLogs(count = 20) {
    return this.logHistory.slice(-count);
  }
}

// 🎯 Enhanced Webhook Management
// Handles sending messages to Discord webhooks with rate limiting and queueing.
class WebhookManager {
  constructor(webhookUrl) {
    const { WebhookClient } = require("discord.js-selfbot-v13");
    this.webhook = new WebhookClient({ url: webhookUrl });
    this.queue = [];      // Queue for messages to be sent
    this.processing = false; // Flag to prevent concurrent processing
    this.rateLimitDelay = 1000; // Delay between webhook sends to avoid rate limits (Discord: 50 reqs/sec for webhooks)
    this.isWebhookActive = !!webhookUrl; // Track if webhook URL is provided and active
  }

  /**
   * Adds a message to the webhook queue for sending.
   * @param {string} content - The message content.
   * @param {object} [options={}] - Additional webhook options (e.g., username, avatarURL).
   */
  async send(content, options = {}) {
    if (!this.isWebhookActive) {
      Logger.debug("Webhook is not active, skipping send.");
      return;
    }
    const message = {
      content: this.formatMessage(content),
      username: options.username || "🤖 Bot Manager",
      avatarURL: options.avatarURL || "https://i.imgur.com/AfFp7pu.png", // Default avatar
      ...options
    };

    this.queue.push(message);
    this.processQueue(); // Start processing if not already
  }

  /**
   * Formats the message content by prepending a timestamp.
   * @param {string} content - The original message content.
   * @returns {string} The formatted message.
   */
  formatMessage(content) {
    const now = new Date().toLocaleString();
    return `🕓 **${now}**\n${content}`;
  }

  /**
   * Processes messages in the queue, respecting rate limits.
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) return; // Already processing or nothing in queue
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const message = this.queue.shift(); // Get the next message from the queue
      try {
        await this.webhook.send(message);
        Logger.debug("Webhook message sent successfully");
      } catch (error) {
        Logger.error("Failed to send webhook message", error);
        // If it's not a 404 (webhook deleted), re-add to queue for retry
        if (error.status !== 404) {
          this.queue.unshift(message);
        } else {
          Logger.error("Webhook URL seems invalid or deleted. Disabling webhook.", null);
          this.isWebhookActive = false; // Permanently disable if webhook is gone
          this.webhook = null; // Clear webhook client
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay)); // Wait before next send
    }
    
    this.processing = false;
  }
}

// 📊 Advanced Statistics
// Tracks various operational statistics of the bot manager.
class StatsManager {
  constructor() {
    this.stats = {
      startTime: Date.now(),      // Application start time
      messagesProcessed: 0,       // Total Discord messages processed
      commandsExecuted: 0,        // Commands received and executed via control channel
      aiConversations: 0,         // Messages sent as part of AI conversation
      levelingMessages: 0,        // Messages sent by the leveling system (spam)
      reconnections: 0,           // Number of times bots reconnected after disconnect
      errors: 0,                  // Total errors encountered
      botStatus: []               // Detailed status for each bot
    };
  }

  /**
   * Increments a specified statistic.
   * @param {string} stat - The name of the statistic to increment.
   */
  increment(stat) {
    if (this.stats.hasOwnProperty(stat)) {
      this.stats[stat]++;
      this.broadcastStats(); // Broadcast updates immediately
    } else {
      Logger.warn(`Attempted to increment unknown stat: ${stat}`);
    }
  }

  /**
   * Updates the status of a specific bot.
   * @param {number} index - The index of the bot.
   * @param {object} statusData - Object containing status properties (e.g., connected, username, reconnectAttempts).
   */
  updateBotStatus(index, statusData) {
    this.stats.botStatus[index] = { ...this.stats.botStatus[index], ...statusData };
    this.broadcastStats();
  }

  /**
   * Retrieves all current statistics, including formatted uptime and bot statuses.
   * @returns {object} An object containing all statistics.
   */
  getStats() {
    const uptime = Date.now() - this.stats.startTime;
    return {
      ...this.stats,
      uptime: uptime,
      uptimeFormatted: this.formatUptime(uptime),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formats a given duration in milliseconds into a human-readable string (e.g., "12h 34m 56s").
   * @param {number} ms - Duration in milliseconds.
   * @returns {string} Formatted uptime string.
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  /**
   * Broadcasts current statistics to all connected WebSocket clients.
   */
  broadcastStats() {
    if (Logger.wsServer) {
      Logger.wsServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'stats', data: this.getStats() }));
        }
      });
    }
  }
}

// 🤖 Enhanced Bot Management
// Core class managing Discord bot clients, their lifecycle, and interactions.
class BotManager {
  constructor(initialConfig, initialAccounts, wsServer) {
    this.config = initialConfig;
    this.accounts = initialAccounts; // Will contain { token: string, id: string } for each bot
    this.clients = []; // Stores Discord client instances, dynamically sized based on accounts
    this.levelings = []; // Stores sphinx-run leveling instances
    this.states = []; // Connection status of each bot (true = connected)
    this.reconnectAttempts = []; // Current reconnection attempts for each bot
    this.statusIntervals = []; // Intervals for periodic status updates
    
    // Initialize arrays based on number of accounts loaded from config
    for (let i = 0; i < this.accounts.length; i++) {
      this.clients.push(null);
      this.levelings.push(null);
      this.states.push(false);
      this.reconnectAttempts.push(0);
      this.statusIntervals.push(null);
    }

    this.webhookManager = new WebhookManager(this.config.WEBHOOK_URL); // Webhook for notifications
    this.aiEngine = new AIConversationEngine(); // AI for conversation management
    this.aiEngine.setUseLLM(this.config.USE_LLM_FOR_CONVERSATION); // Set initial LLM usage
    this.statsManager = new StatsManager(); // Statistics tracking
    this.conversationTimeout = null; // Timer for AI conversation scheduling
    this.nextSpeaker = 0; // Index of the next bot to speak in AI conversation
    this.maxReconnectAttempts = 10; // Maximum reconnection attempts before giving up (increased for robustness)
    
    Logger.setWsServer(wsServer); // Pass WebSocket server to Logger for broadcasting
    Logger.setLevel(this.config.LOG_LEVEL); // Set initial logging level based on config
    
    // System signal handling for graceful shutdown
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT')); // Ctrl+C
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM')); // Termination signal
    
    // Handle unhandled promise rejections to prevent process crashes
    process.on('unhandledRejection', (reason, promise) => {
      Logger.error('Unhandled Promise Rejection:', reason);
      this.statsManager.increment('errors');
      // Potentially attempt a partial restart or logging for specific types of rejections
    });
    
    // Handle uncaught exceptions to prevent process crashes
    process.on('uncaughtException', (error) => {
      Logger.error('Uncaught Exception:', error);
      this.statsManager.increment('errors');
      this.webhookManager.send(`⚠️ Critical Error: ${error.message}. Attempting graceful shutdown.`);
      this.gracefulShutdown('uncaughtException'); // Attempt graceful shutdown on critical error
    });
  }

  /**
   * Generates a random time interval within a specified base and variation.
   * Used for message sending intervals to make bot activity appear more natural.
   * @param {number} [base=this.config.SPAM_BASE_TIME] - The base time in milliseconds.
   * @param {number} [variation=this.config.SPAM_VARIATION] - The maximum random variation in milliseconds.
   * @returns {number} A random time in milliseconds.
   */
  getRandomTime(base = null, variation = null) {
    const baseTime = base || this.config.SPAM_BASE_TIME;
    const varTime = variation || this.config.SPAM_VARIATION;
    
    // Apply a random factor for more natural variation around the base time
    const randomFactor = 0.8 + Math.random() * 0.4; // Multiplier between 0.8 and 1.2
    // Add/subtract random variation
    const finalTime = baseTime * randomFactor + (Math.random() * varTime * 2) - varTime;
    
    return Math.max(1000, Math.floor(finalTime)); // Ensure minimum delay of 1 second
  }

  /**
   * Gets a random interval for AI conversation messages based on configured min/max.
   * @returns {number} A random conversation interval in milliseconds.
   */
  getConversationInterval() {
    const min = this.config.CONVERSATION_INTERVAL_MIN;
    const max = this.config.CONVERSATION_INTERVAL_MAX;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Initiates an AI conversation turn if enabled and conditions are met.
   * Sends a message from the next designated bot.
   */
  async startAIConversation() {
    if (!this.config.AI_CONVERSATION_ENABLED) {
      this.scheduleNextConversation(); // Keep scheduling, but don't send if disabled
      return;
    }
    
    // Ensure at least two bots are connected for a conversation to happen
    const connectedBots = this.states.filter(state => state).length;
    if (connectedBots < 2) {
      Logger.debug("AI Conversation skipped: Not enough bots connected for a conversation.");
      this.scheduleNextConversation();
      return;
    }

    // Find the actual index of the next speaker from connected bots
    let actualSpeakerIndex = -1;
    let attempts = 0;
    while (attempts < this.accounts.length * 2) { // Prevent infinite loop if no bots can speak
      if (this.states[this.nextSpeaker]) { // Check if the candidate bot is connected
        actualSpeakerIndex = this.nextSpeaker;
        break;
      }
      this.nextSpeaker = (this.nextSpeaker + 1) % this.accounts.length; // Move to next bot
      attempts++;
    }

    if (actualSpeakerIndex === -1) {
      Logger.warn("Could not find an active bot to participate in AI conversation.");
      this.scheduleNextConversation();
      return;
    }

    // Probability check to decide if a conversation turn should occur
    if (Math.random() > this.config.CONVERSATION_CHANCE) {
      Logger.debug(`AI Conversation skipped by Bot ${this.accounts[actualSpeakerIndex].id}: Failed conversation chance check.`);
      this.scheduleNextConversation();
      return;
    }

    // Use getNextMessage which now internally handles LLM vs fallback
    const message = await this.aiEngine.getNextMessage(actualSpeakerIndex);
    
    if (message && this.clients[actualSpeakerIndex]) {
      try {
        const channel = await this.clients[actualSpeakerIndex].channels.fetch(this.config.CONVERSATION_CHANNEL_ID);
        if (channel && channel.isTextBased()) {
          await channel.send(message);
          this.statsManager.increment('aiConversations');
          // If LLM is active, make sure nextSpeaker advances regardless of whether
          // the LLM generated a message or not (if it was a fallback, we still want to switch speakers)
          // The getNextMessage already handles `null` for consecutive speaking prevention.
          if (message !== null) { // Only switch speaker if a message was actually sent
              this.nextSpeaker = (actualSpeakerIndex + 1) % this.accounts.length;
          }
          
          Logger.debug(`AI Conversation: Bot ${this.accounts[actualSpeakerIndex].id} sent message: "${message.substring(0, 50)}..."`);
        } else {
          Logger.warn(`AI Conversation: Channel ${this.config.CONVERSATION_CHANNEL_ID} not found or not text-based.`);
        }
      } catch (error) {
        Logger.error(`Failed to send AI conversation message from bot ${this.accounts[actualSpeakerIndex].id}`, error);
        this.statsManager.increment('errors');
      }
    } else if (message === null) {
      Logger.debug(`AI Conversation: Bot ${this.accounts[actualSpeakerIndex].id} skipped turn to prevent consecutive speaking.`);
      // No need to change nextSpeaker here, getNextMessage handles it.
    }

    this.scheduleNextConversation(); // Schedule the next conversation turn
  }

  /**
   * Schedules the next AI conversation turn after a random interval.
   */
  scheduleNextConversation() {
    if (this.conversationTimeout) {
      clearTimeout(this.conversationTimeout); // Clear any existing timeout
    }

    const interval = this.getConversationInterval();
    this.conversationTimeout = setTimeout(() => {
      this.startAIConversation();
    }, interval);
    Logger.debug(`Next AI conversation scheduled in ${interval}ms.`);
  }

  /**
   * Starts a Discord client (bot) at a given index.
   * Handles login, event listeners, and initial setup.
   * @param {number} index - The index of the bot in the accounts array (0 for TOKEN1, 1 for TOKEN2).
   */
  async startClient(index) {
    if (index >= this.accounts.length) {
      Logger.warn(`Attempted to start client at index ${index}, but only ${this.accounts.length} accounts are configured.`);
      return;
    }

    if (this.clients[index] && this.states[index]) {
      Logger.warn(`Client ${this.accounts[index].id} is already running.`);
      return;
    }

    const token = this.accounts[index].token;
    const botId = this.accounts[index].id;

    Logger.info(`Attempting to start client ${botId} (Index: ${index})...`);
    this.statsManager.updateBotStatus(index, { connected: false, username: botId, reconnectAttempts: this.reconnectAttempts[index], initializing: true });

    try {
      // Dynamically require Discord client and sphinx-run
      const { Client } = require("discord.js-selfbot-v13");
      const { userAccount } = require("sphinx-run");
      
      const client = new Client({ 
        checkUpdate: false,   // Disable update checks for self-bots
        readyStatus: false,   // Do not set default ready status
        autoreconnect: true   // Enable Discord.js built-in auto-reconnect
      });
      
      this.clients[index] = client;
      this.reconnectAttempts[index] = 0; // Reset attempts on fresh start

      // Event: Client becomes ready
      client.on("ready", () => {
        Logger.info(`Client ${botId} (${client.user.username}) is ready!`);
        this.states[index] = true; // Mark as connected
        this.reconnectAttempts[index] = 0; // Reset reconnect attempts
        this.statsManager.updateBotStatus(index, { connected: true, username: client.user.username, reconnectAttempts: 0, initializing: false });
        
        // Setup leveling system if enabled
        if (this.config.LEVELING_ENABLED) {
          const leveling = new userAccount(client, require("discord.js-selfbot-v13"));
          this.levelings[index] = leveling;

          // Start leveling in Arabic
          leveling.leveling({
            channel: this.config.CONTROL_CHANNEL_ID,
            time: this.getRandomTime(),
            randomLetters: false,
            type: "ar",
          });

          // Start leveling in English
          leveling.leveling({
            channel: this.config.CONTROL_CHANNEL_ID,
            time: this.getRandomTime(),
            randomLetters: false,
            type: "eng",
          });
          Logger.info(`Leveling system enabled for client ${botId}.`);
        } else {
          Logger.info(`Leveling system disabled for client ${botId}.`);
        }

        // Start AI conversations if the first bot connects (index 0) and AI is enabled
        // Ensure only one AI conversation scheduler is running.
        if (index === 0 && this.config.AI_CONVERSATION_ENABLED) {
           if (!this.conversationTimeout) { // Only schedule if not already scheduled
                Logger.info("Initiating AI conversation scheduling.");
                this.scheduleNextConversation();
            }
        }

        // Send a webhook notification about successful connection
        this.webhookManager.send(`✅ Account ${botId} **${client.user.username}** started successfully!`);

        // Send periodic status updates via webhook
        if (this.statusIntervals[index]) clearInterval(this.statusIntervals[index]); // Clear old interval if exists
        this.statusIntervals[index] = setInterval(() => {
          this.webhookManager.send(`📢 Account ${botId} **${client.user.username}** is still running. Uptime: ${this.statsManager.formatUptime(Date.now() - this.statsManager.stats.startTime)}`);
        }, this.config.STATUS_INTERVAL);
      });

      // Event: Message received
      client.on("messageCreate", (msg) => {
        this.statsManager.increment('messagesProcessed');
        
        // Only the first client (index 0) handles commands to avoid duplication if multiple bots are in control channel
        if (index === 0) {
          this.handleCommand(msg);
        }
      });

      // Event: Client disconnects
      client.on("disconnect", (event) => {
        Logger.warn(`Client ${botId} disconnected. Code: ${event.code}, Reason: ${event.reason || 'N/A'}`);
        this.states[index] = false; // Mark as disconnected
        this.statsManager.updateBotStatus(index, { connected: false, username: botId, disconnectReason: event.reason || `Code: ${event.code}` });
        // Clear status interval if bot disconnects
        if (this.statusIntervals[index]) {
          clearInterval(this.statusIntervals[index]);
          this.statusIntervals[index] = null;
        }
      });

      // Event: Client error
      client.on("error", (error) => {
        Logger.error(`Client ${botId} error:`, error);
        this.statsManager.increment('errors');
        this.handleClientError(index, error); // Handle client-specific errors
      });

      // Event: warn (Discord.js warning messages)
      client.on('warn', (info) => {
        Logger.warn(`Client ${botId} Discord.js Warning: ${info}`);
      });

      // Attempt to log in to Discord
      await client.login(token);
      
    } catch (error) {
      Logger.error(`Failed to start client ${botId} (login error):`, error);
      this.statsManager.increment('errors');
      this.handleClientError(index, error); // Handle login specific errors
    }
  }

  /**
   * Handles errors encountered by a specific client, attempting reconnection.
   * Implements an exponential backoff strategy for reconnection attempts.
   * @param {number} index - The index of the client that encountered the error.
   * @param {Error} error - The error object.
   */
  handleClientError(index, error) {
    const botId = this.accounts[index]?.id || `Unknown Bot ${index}`;
    // Destroy client to clean up resources
    if (this.clients[index]) {
      this.clients[index].destroy();
      this.clients[index] = null;
    }
    this.states[index] = false; // Mark as disconnected
    this.statsManager.updateBotStatus(index, { connected: false, username: botId, error: error.message });

    // Clear any active status interval for this bot
    if (this.statusIntervals[index]) {
      clearInterval(this.statusIntervals[index]);
      this.statusIntervals[index] = null;
    }

    if (this.reconnectAttempts[index] < this.maxReconnectAttempts) {
      this.reconnectAttempts[index]++;
      this.statsManager.increment('reconnections');
      // Exponential backoff with a cap
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts[index]), 60000); // Max 60 seconds delay
      
      Logger.info(`Attempting to reconnect client ${botId} in ${delay}ms (attempt ${this.reconnectAttempts[index]}/${this.maxReconnectAttempts})`);
      this.webhookManager.send(`⚠️ Account ${botId} disconnected. Reconnecting in ${delay / 1000}s... (Attempt ${this.reconnectAttempts[index]})`);
      this.statsManager.updateBotStatus(index, { reconnectAttempts: this.reconnectAttempts[index], connected: false, initializing: true });
      
      setTimeout(() => {
        this.startClient(index); // Attempt to restart the client
      }, delay);
    } else {
      Logger.error(`Max reconnection attempts reached for client ${botId}. Giving up.`, error);
      this.webhookManager.send(`❌ Account ${botId} failed to connect after ${this.maxReconnectAttempts} attempts. Please check token or network.`);
      this.statsManager.updateBotStatus(index, { reconnectAttempts: this.reconnectAttempts[index], connected: false, initializing: false, status: 'Failed to reconnect' });
    }
  }

  /**
   * Stops a specific Discord client and cleans up its resources.
   * @param {number} index - The index of the client to stop (0 for Bot1, 1 for Bot2).
   * @param {function} [callback=null] - An optional callback function to execute after stopping.
   */
  stopClient(index, callback = null) {
    if (index >= this.accounts.length) {
      Logger.warn(`Attempted to stop client at index ${index}, but it does not exist.`);
      this.webhookManager.send(`❌ Bot ${index + 1} does not exist.`);
      if (callback) setTimeout(callback, 100);
      return;
    }
    const botId = this.accounts[index]?.id || `Unknown Bot ${index}`;
    if (this.clients[index]) {
      try {
        this.clients[index].destroy(); // Disconnect and destroy client
        this.clients[index] = null;
        this.states[index] = false;
        this.reconnectAttempts[index] = 0; // Reset attempts
        this.statsManager.updateBotStatus(index, { connected: false, username: botId, reconnectAttempts: 0, initializing: false, status: 'Stopped' });
        
        // Clear periodic status update interval
        if (this.statusIntervals[index]) {
          clearInterval(this.statusIntervals[index]);
          this.statusIntervals[index] = null;
        }
        // Stop leveling for this bot if it was enabled
        if (this.levelings[index]) {
            this.levelings[index].destroy();
            this.levelings[index] = null;
        }
        Logger.info(`Client ${botId} stopped.`);
        this.webhookManager.send(`⛔ Account ${botId} has been stopped.`);
      } catch (e) {
        Logger.error(`Error stopping client ${botId}:`, e);
        this.webhookManager.send(`❌ Error stopping bot ${botId}: ${e.message}`);
      }
    } else {
      Logger.warn(`Client ${botId} is not running or already stopped.`);
      this.webhookManager.send(`ℹ️ Account ${botId} was already stopped.`);
    }
    
    // Execute callback after a small delay to ensure cleanup
    if (callback) {
      setTimeout(callback, 1000);
    }
  }

  /**
   * Handles incoming commands from the control channel.
   * @param {Message} msg - The Discord message object.
   */
  handleCommand(msg) {
    // Only process messages from the control channel that start with '!'
    if (msg.channel.id !== this.config.CONTROL_CHANNEL_ID || !msg.content.startsWith("!")) {
      return;
    }

    const args = msg.content.trim().split(" ");
    const command = args[0].toLowerCase();
    const arg = args[1];

    this.statsManager.increment('commandsExecuted');
    Logger.info(`Received command: ${command} ${arg || ''} from ${msg.author.username}`);

    // Define available commands and their actions
    const commands = {
      "!help": () => {
        const helpText = `🛠️ **Available Commands:**
\`!help\` - Show this help message
\`!status\` - Show current bot connection status and feature states
\`!stop <1|2>\` - Stop specific bot (1 for TOKEN1, 2 for TOKEN2)
\`!start <1|2>\` - Start specific bot (1 for TOKEN1, 2 for TOKEN2)
\`!restart <1|2>\` - Restart specific bot (1 for TOKEN1, 2 for TOKEN2)
\`!conversation <on|off|reset>\` - Control AI conversations (on/off/reset history)
\`!llm_conversation <on|off>\` - Toggle LLM (Gemini) usage for AI conversations
\`!leveling <on|off>\` - Control the leveling/spam system
\`!uptime\` - Show total system uptime
\`!ping\` - Test bot response latency
\`!stats\` - Show detailed system and performance statistics
\`!config\` - Show current loaded configuration settings
\`!logs\` - Show recent system log entries
\`!reload_config\` - Reloads .env configuration (requires bot restart to apply token changes)`;
        this.webhookManager.send(helpText);
      },

      "!status": () => {
        let statusMessage = "📊 **System Status:**\n";
        this.accounts.forEach((account, index) => {
          const status = this.states[index] ? "✅ Running" : "❌ Stopped";
          const reconnect = this.reconnectAttempts[index] > 0 ? ` (${this.reconnectAttempts[index]} attempts)` : "";
          statusMessage += `- **${account.id}**: ${status}${reconnect}\n`;
        });
        const aiStatus = this.config.AI_CONVERSATION_ENABLED ? "✅ Enabled" : "❌ Disabled";
        const llmStatus = this.config.USE_LLM_FOR_CONVERSATION ? "✅ Enabled (Gemini)" : "❌ Disabled";
        const levelingStatus = this.config.LEVELING_ENABLED ? "✅ Enabled" : "❌ Disabled";
        
        statusMessage += `- AI Conversations: ${aiStatus}\n`;
        statusMessage += `- LLM for Conversations: ${llmStatus}\n`;
        statusMessage += `- Leveling System: ${levelingStatus}`;
        
        this.webhookManager.send(statusMessage);
      },

      "!conversation": () => {
        if (arg === "on") {
          this.config.AI_CONVERSATION_ENABLED = true;
          this.scheduleNextConversation(); // Start scheduling if enabled
          this.webhookManager.send("🤖 AI conversations enabled.");
        } else if (arg === "off") {
          this.config.AI_CONVERSATION_ENABLED = false;
          if (this.conversationTimeout) {
            clearTimeout(this.conversationTimeout); // Stop current scheduling
            this.conversationTimeout = null;
          }
          this.webhookManager.send("🔇 AI conversations disabled.");
        } else if (arg === "reset") {
          this.aiEngine.resetConversation(); // Reset AI conversation history
          this.webhookManager.send("🔄 Conversation history reset for AI.");
        } else {
          this.webhookManager.send("❌ Usage: `!conversation <on|off|reset>`");
        }
      },

      "!llm_conversation": () => {
        if (arg === "on") {
          this.config.USE_LLM_FOR_CONVERSATION = true;
          this.aiEngine.setUseLLM(true);
          this.webhookManager.send("🧠 LLM (Gemini) integration for AI conversations enabled. Responses will now be more dynamic.");
        } else if (arg === "off") {
          this.config.USE_LLM_FOR_CONVERSATION = false;
          this.aiEngine.setUseLLM(false);
          this.webhookManager.send("📴 LLM (Gemini) integration for AI conversations disabled. Responses will use predefined patterns.");
        } else {
          this.webhookManager.send("❌ Usage: `!llm_conversation <on|off>`");
        }
      },

      "!leveling": () => {
        if (arg === "on") {
          this.config.LEVELING_ENABLED = true;
          this.accounts.forEach((account, index) => {
            if (this.states[index] && this.clients[index] && !this.levelings[index]) {
              const { userAccount } = require("sphinx-run");
              this.levelings[index] = new userAccount(this.clients[index], require("discord.js-selfbot-v13"));
              this.levelings[index].leveling({ channel: this.config.CONTROL_CHANNEL_ID, time: this.getRandomTime(), randomLetters: false, type: "ar" });
              this.levelings[index].leveling({ channel: this.config.CONTROL_CHANNEL_ID, time: this.getRandomTime(), randomLetters: false, type: "eng" });
              Logger.info(`Leveling re-enabled for client ${account.id}.`);
            }
          });
          this.webhookManager.send("📈 Leveling system enabled.");
        } else if (arg === "off") {
          this.config.LEVELING_ENABLED = false;
          this.accounts.forEach((account, index) => {
            if (this.levelings[index]) {
              this.levelings[index].destroy();
              this.levelings[index] = null;
            }
          });
          this.webhookManager.send("📉 Leveling system disabled.");
        } else {
          this.webhookManager.send("❌ Usage: `!leveling <on|off>`");
        }
      },

      // Helper function to resolve bot index (1 or 2) to 0-based array index
      resolveBotIndex: (input) => {
        const index = parseInt(input);
        if (index === 1 && this.accounts.length >= 1) return 0;
        if (index === 2 && this.accounts.length >= 2) return 1;
        return -1;
      },

      "!stop": () => {
        const clientIndex = commands.resolveBotIndex(arg);
        if (clientIndex !== -1) {
          this.stopClient(clientIndex);
        } else {
          this.webhookManager.send(`❌ Invalid bot number. Use \`1\` or \`2\`.`);
        }
      },

      "!start": () => {
        const clientIndex = commands.resolveBotIndex(arg);
        if (clientIndex !== -1) {
          this.startClient(clientIndex);
          this.webhookManager.send(`▶️ Starting bot ${this.accounts[clientIndex].id}...`);
        } else {
          this.webhookManager.send(`❌ Invalid bot number. Use \`1\` or \`2\`.`);
        }
      },

      "!restart": () => {
        const clientIndex = commands.resolveBotIndex(arg);
        if (clientIndex !== -1) {
          this.stopClient(clientIndex, () => {
            setTimeout(() => this.startClient(clientIndex), 2000);
          });
          this.webhookManager.send(`🔄 Restarting bot ${this.accounts[clientIndex].id}...`);
        } else {
          this.webhookManager.send(`❌ Invalid bot number. Use \`1\` or \`2\`.`);
        }
      },

      "!uptime": () => {
        const stats = this.statsManager.getStats();
        this.webhookManager.send(`⏱️ System Uptime: ${stats.uptimeFormatted}`);
      },

      "!ping": async () => {
        const ping = Date.now() - msg.createdTimestamp;
        this.webhookManager.send(`🏓 Latency to Discord: ${ping}ms`);
      },

      "!stats": () => {
        const stats = this.statsManager.getStats();
        
        let botStatusDetails = "";
        stats.botStatus.forEach((bot, index) => {
            botStatusDetails += `**${bot.username || `Bot${index+1}`}**: ${bot.connected ? '✅ Connected' : '❌ Disconnected'}`;
            if (bot.reconnectAttempts > 0) botStatusDetails += ` (${bot.reconnectAttempts} recon attempts)`;
            if (bot.status) botStatusDetails += ` (${bot.status})`;
            botStatusDetails += `\n`;
        });

        const statsText = `📈 **System Performance & Statistics:**
💾 **Memory Usage (Node.js Process):**
- RSS (Resident Set Size): ${Math.round(stats.memoryUsage.rss / 1024 / 1024)} MB
- Heap Used: ${Math.round(stats.memoryUsage.heapUsed / 1024 / 1024)} MB
- External: ${Math.round(stats.memoryUsage.external / 1024 / 1024)} MB

📊 **Operational Statistics:**
- Uptime: ${stats.uptimeFormatted}
- Messages Processed: ${stats.messagesProcessed}
- Commands Executed: ${stats.commandsExecuted}
- AI Conversations: ${stats.aiConversations}
- Leveling Messages Sent: ${stats.levelingMessages}
- Reconnections: ${stats.reconnections}
- Errors: ${stats.errors}

🤖 **Bot Connection Status:**
${botStatusDetails}

🔧 **System Information:**
- Node.js Version: ${stats.nodeVersion}
- Platform: ${stats.platform}`;

        this.webhookManager.send(statsText);
      },

      "!config": () => {
        const configText = `⚙️ **Current Configuration Settings:**
- Control Channel ID: \`${this.config.CONTROL_CHANNEL_ID}\`
- Conversation Channel ID: \`${this.config.CONVERSATION_CHANNEL_ID}\`
- Webhook URL: \`[HIDDEN]\` (for security)
- AI Conversations: ${this.config.AI_CONVERSATION_ENABLED ? 'Enabled' : 'Disabled'}
- Use LLM for Conversations: ${this.config.USE_LLM_FOR_CONVERSATION ? 'Yes' : 'No'}
- Conversation Interval: ${this.config.CONVERSATION_INTERVAL_MIN}-${this.config.CONVERSATION_INTERVAL_MAX}ms
- Conversation Chance: ${(this.config.CONVERSATION_CHANCE * 100).toFixed(0)}%
- Leveling Enabled: ${this.config.LEVELING_ENABLED ? 'Yes' : 'No'}
- Spam Base Time: ${this.config.SPAM_BASE_TIME}ms
- Spam Variation: ${this.config.SPAM_VARIATION}ms
- Status Update Interval: ${Math.floor(this.config.STATUS_INTERVAL / 60000)} minutes
- Log Level: ${this.config.LOG_LEVEL}
- Max Reconnection Attempts: ${this.maxReconnectAttempts}
- Web Server Port: ${this.config.WEB_SERVER_PORT}`;

        this.webhookManager.send(configText);
      },

      "!logs": () => {
        const recentLogs = Logger.getRecentLogs(10).join('\n');
        const logsMessage = `📝 **Recent System Events (Last 10):**
\`\`\`
${recentLogs || 'No recent log entries to display.'}
\`\`\`
For a full log history and more detailed information, please visit the web interface at \`/api/logs\` or monitor the live feed at \`http://localhost:${this.config.WEB_SERVER_PORT}\`.`;
        this.webhookManager.send(logsMessage);
      },

      "!reload_config": async () => {
        // Stop current AI conversation scheduling before reconfiguring
        if (this.conversationTimeout) {
            clearTimeout(this.conversationTimeout);
            this.conversationTimeout = null;
        }

        const { config, accounts } = ConfigManager.reloadConfig();
        this.config = config;
        // Re-initialize webhook manager with potentially new URL
        this.webhookManager = new WebhookManager(this.config.WEBHOOK_URL); 
        this.aiEngine.setUseLLM(this.config.USE_LLM_FOR_CONVERSATION); // Update LLM usage in AI engine
        
        // This command reloads core config but doesn't automatically restart bots with new tokens.
        // User needs to !restart individual bots if tokens in accounts.json changed.
        this.webhookManager.send("🔄 Configuration reloaded from `.env`. Please `!restart 1` or `!restart 2` to apply new tokens/settings if they changed. AI conversation scheduler might restart if enabled.");
        
        // Re-evaluate AI conversation scheduling based on new config
        if (this.config.AI_CONVERSATION_ENABLED && this.accounts.length > 0) {
            // Check if at least one bot is connected to start AI conversation scheduling
            // The actual start of AI convo will happen when a bot is ready if it wasn't already.
            Logger.info("Re-evaluating AI conversation scheduling based on reloaded config.");
            this.scheduleNextConversation();
        }
        Logger.info("Configuration reloaded by user command.");
      }
    };

    const commandFunction = commands[command];
    if (commandFunction) {
      try {
        commandFunction(); // Execute the command function
      } catch (error) {
        Logger.error(`Error executing command ${command}:`, error);
        this.statsManager.increment('errors');
        this.webhookManager.send(`❌ Command execution error: \`${error.message}\``);
      }
    } else {
      this.webhookManager.send(`❓ Unknown command. Use \`!help\` for available commands.`);
    }
  }

  /**
   * Performs a graceful shutdown of all bot clients and the system.
   * Ensures resources are released cleanly.
   * @param {string} signal - The signal that triggered the shutdown.
   */
  async gracefulShutdown(signal) {
    Logger.info(`🛑 Starting graceful shutdown due to signal: ${signal}...`);
    this.webhookManager.send(`🛑 System is initiating graceful shutdown due to \`${signal}\`.`);
    
    // Stop AI conversation scheduling
    if (this.conversationTimeout) {
      clearTimeout(this.conversationTimeout);
      this.conversationTimeout = null;
      Logger.debug("AI conversation scheduler stopped.");
    }
    
    // Stop all Discord clients
    for (let i = 0; i < this.clients.length; i++) {
      if (this.clients[i] && this.states[i]) {
        Logger.info(`Stopping client ${this.accounts[i].id}...`);
        await new Promise(resolve => this.stopClient(i, resolve)); // Wait for each client to stop
      }
    }
    
    // Give some time for webhooks to send
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    
    Logger.info("✅ Shutdown sequence completed successfully. Exiting process.");
    process.exit(0); // Exit the Node.js process
  }

  /**
   * Initializes and starts all configured Discord bot clients.
   */
  async start() {
    Logger.info("🚀 Starting Discord Bot Manager application...");
    
    // Initialize bot status for all accounts
    this.accounts.forEach((account, index) => {
        this.statsManager.updateBotStatus(index, { connected: false, username: account.id, reconnectAttempts: 0, status: 'Offline', initializing: false });
    });

    try {
      // Start clients sequentially with a small delay between them
      for (let i = 0; i < this.accounts.length; i++) {
        await this.startClient(i);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Delay between starting bots
      }
      
      Logger.info("✅ All configured Discord clients have been initialized.");
      
      // Send a general startup notification to webhook
      this.webhookManager.send(`🎉 **System started successfully!**
- Running ${this.accounts.length} bot account(s).
- AI Conversations: ${this.config.AI_CONVERSATION_ENABLED ? 'Enabled' : 'Disabled'} (LLM: ${this.config.USE_LLM_FOR_CONVERSATION ? 'Enabled' : 'Disabled'})
- Leveling System: ${this.config.LEVELING_ENABLED ? 'Enabled' : 'Disabled'}
- Use \`!help\` in the control channel for available commands.
- Monitor live stats and logs at \`http://localhost:${this.config.WEB_SERVER_PORT}\` (or your server's IP).`);
      
    } catch (error) {
      Logger.error("Failed to start bot manager core application:", error);
      this.statsManager.increment('errors');
      this.webhookManager.send(`❌ **Critical Startup Failure:** ${error.message}. Please check logs.`);
    }
  }
}

// 🌐 Enhanced Web Server
// Provides a real-time web interface for monitoring bot status and statistics.
class WebServer {
  constructor(botManager, port = 3000) {
    this.botManager = botManager;
    this.port = port;
    this.app = require("express")(); // Initialize Express app
    this.wsServer = new WebSocket.Server({ noServer: true }); // Initialize WebSocket server
    this.setupRoutes(); // Configure API and dashboard routes
    this.setupWebSocket(); // Configure WebSocket connections
  }

  /**
   * Sets up WebSocket server handling.
   */
  setupWebSocket() {
    this.wsServer.on('connection', ws => {
      Logger.info('WebSocket client connected.');
      // Send initial stats when a client connects
      ws.send(JSON.stringify({ type: 'stats', data: this.botManager.statsManager.getStats() }));
      ws.send(JSON.stringify({ type: 'logs', data: Logger.getRecentLogs(50) })); // Send some initial logs

      ws.on('close', () => {
        Logger.info('WebSocket client disconnected.');
      });

      ws.on('error', error => {
        Logger.error('WebSocket error:', error);
      });
    });
  }

  /**
   * Sets up all the HTTP routes for the web server.
   */
  setupRoutes() {
    // Home page (Dashboard)
    this.app.get("/", (req, res) => {
      const stats = this.botManager.statsManager.getStats();
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>🤖 Discord Bot Manager - Ultimate Version</title>
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: #ecf0f1; 
              text-align: center; 
              padding: 20px; 
              margin: 0;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: flex-start; /* Align to top */
              align-items: center;
              font-size: 14px;
            }
            .container { 
              max-width: 1000px; /* Increased max-width */
              width: 95%; 
              margin: 20px auto; 
              background: rgba(255,255,255,0.15);
              backdrop-filter: blur(15px);
              border-radius: 25px;
              padding: 30px;
              box-shadow: 0 12px 40px rgba(0,0,0,0.4);
              border: 1px solid rgba(255,255,255,0.3);
            }
            h1 { 
              margin-bottom: 15px; 
              font-size: 2.8em; /* Slightly larger */
              text-shadow: 0 3px 5px rgba(0,0,0,0.4);
            }
            h2 {
                margin-top: 25px;
                margin-bottom: 15px;
                font-size: 1.8em;
                color: #f39c12;
            }
            p {
              font-size: 1.1em;
              line-height: 1.6;
            }
            .status-section { 
              background: linear-gradient(45deg, #27ae60, #2ecc71); 
              padding: 18px; 
              border-radius: 12px; 
              margin: 20px 0; 
              box-shadow: 0 6px 20px rgba(39,174,96,0.4);
              font-size: 1.3em;
              font-weight: bold;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            }
            .stats-grid, .bot-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
              gap: 20px;
              margin: 20px 0;
            }
            .stat-card, .bot-card, .log-card {
              background: rgba(255,255,255,0.1);
              padding: 25px;
              border-radius: 18px;
              border: 1px solid rgba(255,255,255,0.2);
              box-shadow: 0 4px 15px rgba(0,0,0,0.2);
              transition: transform 0.3s ease, box-shadow 0.3s ease;
              text-align: left; /* Align text left in cards */
            }
            .stat-card:hover, .bot-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            }
            .stat-number {
              font-size: 2.5em;
              font-weight: bold;
              color: #f39c12;
              margin-bottom: 5px;
            }
            .stat-label {
              font-size: 0.9em;
              opacity: 0.8;
            }
            .bot-card h3 {
                font-size: 1.5em;
                margin-top: 0;
                margin-bottom: 10px;
                color: #8be9fd; /* Light blue for bot names */
            }
            .bot-card p {
                margin: 5px 0;
                font-size: 1em;
            }
            .bot-card .status-indicator {
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                margin-right: 5px;
                background-color: grey; /* Default */
            }
            .bot-card .status-indicator.connected { background-color: #2ecc71; } /* Green */
            .bot-card .status-indicator.disconnected { background-color: #e74c3c; } /* Red */
            .bot-card .status-indicator.initializing { background-color: #f39c12; } /* Orange */

            .feature {
              display: inline-block;
              background: rgba(255,255,255,0.25);
              padding: 10px 20px;
              border-radius: 30px;
              margin: 8px;
              font-size: 0.95em;
              font-weight: 500;
              transition: background-color 0.3s ease;
            }
            .feature:hover {
              background-color: rgba(255,255,255,0.4);
            }
            .info-box {
              background: rgba(255,255,255,0.1);
              padding: 15px;
              border-radius: 12px;
              margin-top: 25px;
              font-size: 0.9em;
              opacity: 0.9;
            }
            #log-output {
                background: rgba(0,0,0,0.3);
                border-radius: 10px;
                padding: 15px;
                margin-top: 20px;
                text-align: left;
                max-height: 400px; /* Scrollable log area */
                overflow-y: scroll;
                font-family: 'Consolas', 'Monaco', monospace;
                white-space: pre-wrap; /* Preserve whitespace and wrap text */
                word-wrap: break-word;
                font-size: 0.85em;
                line-height: 1.4;
                color: #c7c7c7;
            }
            #log-output div {
                border-bottom: 1px solid rgba(255,255,255,0.05);
                padding-bottom: 5px;
                margin-bottom: 5px;
            }
            .disclaimer {
                background-color: #c0392b;
                color: white;
                padding: 15px;
                border-radius: 10px;
                margin-top: 30px;
                font-size: 0.9em;
                font-weight: bold;
                text-align: center;
            }

            @media (max-width: 768px) {
              .container {
                padding: 20px;
              }
              h1 {
                font-size: 2em;
              }
              .status-section {
                font-size: 1.1em;
              }
              .stats-grid, .bot-grid {
                grid-template-columns: 1fr; /* Stack columns on smaller screens */
              }
              .stat-number {
                font-size: 2em;
              }
            }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet">
          <script>
            // WebSocket for real-time updates
            const ws = new WebSocket('ws://' + window.location.host + '/ws');
            ws.onopen = () => console.log('WebSocket connected.');
            ws.onmessage = event => {
                const data = JSON.parse(event.data);
                if (data.type === 'stats') {
                    updateDashboard(data.data);
                } else if (data.type === 'log') {
                    addLogEntry(data.data);
                }
            };
            ws.onclose = () => console.log('WebSocket disconnected.');
            ws.onerror = error => console.error('WebSocket error:', error);

            function updateDashboard(stats) {
                document.getElementById('uptime').innerText = stats.uptimeFormatted;
                document.getElementById('messagesProcessed').innerText = stats.messagesProcessed;
                document.getElementById('aiConversations').innerText = stats.aiConversations;
                document.getElementById('commandsExecuted').innerText = stats.commandsExecuted;
                document.getElementById('reconnections').innerText = stats.reconnections;
                document.getElementById('errors').innerText = stats.errors;
                document.getElementById('memoryUsed').innerText = Math.round(stats.memoryUsage.heapUsed / 1024 / 1024) + ' MB';
                document.getElementById('nodeVersion').innerText = stats.nodeVersion;

                const botGrid = document.getElementById('bot-grid');
                botGrid.innerHTML = ''; // Clear existing bot cards
                stats.botStatus.forEach(bot => {
                    const card = document.createElement('div');
                    card.className = 'bot-card';
                    let statusIndicatorClass = '';
                    if (bot.connected) statusIndicatorClass = 'connected';
                    else if (bot.initializing) statusIndicatorClass = 'initializing';
                    else statusIndicatorClass = 'disconnected';

                    card.innerHTML = `
                        <h3><span class="status-indicator ${statusIndicatorClass}"></span>${bot.username}</h3>
                        <p>Status: ${bot.connected ? 'Connected' : (bot.initializing ? 'Initializing...' : 'Disconnected')}</p>
                        <p>Reconnect Attempts: ${bot.reconnectAttempts}</p>
                        ${bot.error ? `<p style="color: #e74c3c;">Error: ${bot.error}</p>` : ''}
                        ${bot.disconnectReason ? `<p>Reason: ${bot.disconnectReason}</p>` : ''}
                    `;
                    botGrid.appendChild(card);
                });
            }

            function addLogEntry(logMessage) {
                const logOutput = document.getElementById('log-output');
                const logEntry = document.createElement('div');
                logEntry.innerText = logMessage;
                logOutput.appendChild(logEntry);
                logOutput.scrollTop = logOutput.scrollHeight; // Scroll to bottom
                // Limit log messages displayed for performance
                while (logOutput.children.length > 50) {
                    logOutput.removeChild(logOutput.firstChild);
                }
            }

            // Initial load of logs
            window.onload = () => {
                fetch('/api/logs?count=50')
                    .then(response => response.json())
                    .then(data => {
                        const logOutput = document.getElementById('log-output');
                        logOutput.innerHTML = ''; // Clear any existing
                        data.logs.forEach(log => addLogEntry(log));
                    })
                    .catch(error => console.error('Error fetching initial logs:', error));
            };

          </script>
        </head>
        <body>
          <div class="container">
            <h1>🤖 Discord Bot Manager</h1>
            <p style="font-size: 1.2em; margin-bottom: 25px;">
              An advanced system for managing and monitoring Discord self-bots with AI capabilities.
            </p>
            
            <div class="disclaimer">
                🚨 **إخلاء مسؤولية مهم:** هذا النظام يستخدم بوتات ديسكورد ذاتية (self-bots) التي تخالف شروط خدمة ديسكورد وقد تؤدي إلى حظر حساباتك. استخدمه على مسؤوليتك الخاصة.
            </div>

            <div class="status-section">
              <span>✅ System is Active and Running</span>
            </div>
            
            <h2>📊 System Statistics</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number" id="uptime">${stats.uptimeFormatted}</div>
                <div class="stat-label">System Uptime</div>
              </div>
              <div class="stat-card">
                <div class="stat-number" id="messagesProcessed">${stats.messagesProcessed}</div>
                <div class="stat-label">Messages Processed</div>
              </div>
              <div class="stat-card">
                <div class="stat-number" id="aiConversations">${stats.aiConversations}</div>
                <div class="stat-label">AI Conversations</div>
              </div>
              <div class="stat-card">
                <div class="stat-number" id="commandsExecuted">${stats.commandsExecuted}</div>
                <div class="stat-label">Commands Executed</div>
              </div>
              <div class="stat-card">
                <div class="stat-number" id="reconnections">${stats.reconnections}</div>
                <div class="stat-label">Reconnections</div>
              </div>
              <div class="stat-card">
                <div class="stat-number" id="errors">${stats.errors}</div>
                <div class="stat-label">System Errors</div>
              </div>
            </div>
            
            <div class="info-box">
              🔧 Node.js Version: <span id="nodeVersion">${stats.nodeVersion}</span> | 💾 Memory Used: <span id="memoryUsed">${Math.round(stats.memoryUsage.heapUsed / 1024 / 1024)} MB</span>
            </div>

            <h2>🤖 Bot Status</h2>
            <div class="bot-grid" id="bot-grid">
                <!-- Bot cards will be injected here by JavaScript -->
            </div>
            
            <h2>📝 Live Logs</h2>
            <div id="log-output">
                <!-- Logs will be streamed here -->
            </div>

            <div style="margin-top: 35px;">
              <h3>🌟 Key Features:</h3>
              <div class="feature">🤖 Advanced AI Conversations</div>
              <div class="feature">📈 Automatic Leveling & Messaging</div>
              <div class="feature">🔄 Robust Auto Reconnect & Self-Healing</div>
              <div class="feature">📊 Real-time Web Monitoring</div>
              <div class="feature">🔥 Dynamic Configuration Reload</div>
              <div class="feature">🎛️ Comprehensive Discord Commands</div>
              <div class="feature">📝 Detailed & Live Logging</div>
              <div class="feature">🚀 Multi-Account Support</div>
            </div>
            
            <p style="margin-top: 35px; opacity: 0.8; font-size: 0.95em;">
              Control the bot using commands in your designated Discord channel.<br>
              Type <code>!help</code> for a list of all available commands.<br>
              Access API endpoints for raw data: <a href="/api/status" style="color: #ADD8E6;">/api/status</a>, <a href="/api/stats" style="color: #ADD8E6;">/api/stats</a>, <a href="/api/conversations" style="color: #ADD8E6;">/api/conversations</a>, <a href="/api/logs" style="color: #ADD8E6;">/api/logs</a>
            </p>
          </div>
        </body>
        </html>
      `);
    });

    // API Endpoint: Current Status (JSON)
    this.app.get("/api/status", (req, res) => {
      res.json(this.botManager.statsManager.getStats()); // Uses getStats for comprehensive data
    });

    // API Endpoint: Detailed Statistics (JSON)
    this.app.get("/api/stats", (req, res) => {
      res.json(this.botManager.statsManager.getStats());
    });

    // API Endpoint: Recent AI Conversations (JSON)
    this.app.get("/api/conversations", (req, res) => {
      res.json({
        history: this.botManager.aiEngine.conversationHistory, // Full history
        depth: this.botManager.aiEngine.conversationDepth,
        lastSpeaker: this.botManager.aiEngine.lastSpeaker,
        nextSpeaker: this.botManager.nextSpeaker,
        enabled: this.botManager.config.AI_CONVERSATION_ENABLED,
        conversationIntervalMin: this.botManager.config.CONVERSATION_INTERVAL_MIN,
        conversationIntervalMax: this.botManager.config.CONVERSATION_INTERVAL_MAX,
        conversationChance: this.botManager.config.CONVERSATION_CHANCE
      });
    });

    // API Endpoint: Recent System Logs (JSON)
    this.app.get("/api/logs", (req, res) => {
      const count = parseInt(req.query.count) || 100; // Allow specifying log count
      res.json({ logs: Logger.getRecentLogs(count) });
    });

    // Global Error Handler for Express
    this.app.use((err, req, res, next) => {
      Logger.error("Web server request error:", err);
      this.botManager.statsManager.increment('errors'); // Increment error stats for web errors
      res.status(500).json({ error: "Internal Server Error", message: err.message });
    });
  }

  /**
   * Starts the Express web server and listens on the configured port.
   */
  start() {
    const server = this.app.listen(this.port, () => {
      Logger.info(`🌐 Web server listening on port ${this.port}`);
    }).on('error', (err) => {
      Logger.error(`Failed to start web server on port ${this.port}:`, err);
      this.botManager.webhookManager.send(`❌ Web server failed to start on port ${this.port}: ${err.message}`);
      process.exit(1); 
    });

    // Handle WebSocket upgrades
    server.on('upgrade', (request, socket, head) => {
      if (request.url === '/ws') {
        this.wsServer.handleUpgrade(request, socket, head, ws => {
          this.wsServer.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });
  }
}

// 🚀 Main Execution Block
// This asynchronous IIFE (Immediately Invoke
