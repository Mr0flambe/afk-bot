const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("AFK bot is alive");
});

app.listen(3000, () => {
  console.log("Keep-alive server running");
});
const mineflayer = require('mineflayer')
const config = require('./settings.json')

let bot = null
let reconnecting = false

function startBot () {
  console.log('🚀 Starting bot...')

  bot = mineflayer.createBot({
    host: config.server.host,
    port: config.server.port,
    username: config.bot.username,
    auth: 'offline',          // cracked server
    version: config.server.version
  })

  // ===== WHEN BOT JOINS =====
  bot.once('spawn', () => {
    console.log('✅ Bot joined server')

    // AuthMe login (safe delay)
    setTimeout(() => {
      bot.chat('/login ' + config.bot.password)
      console.log('🔐 Sent /login')
    }, 5000)
  })

  // ===== ANTI-AFK (CROUCH) =====
  const afkInterval = setInterval(() => {
    if (!bot || !bot.entity) return

    // random look
    bot.look(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI - Math.PI / 2,
      true
    )

    // small movement
    bot.setControlState('forward', true)
    setTimeout(() => bot.setControlState('forward', false), 800)

    // jump sometimes
    if (Math.random() > 0.6) {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 400)
    }

  }, 20000)


  // ===== CHAT LOG =====
  bot.on('chat', (username, message) => {
    console.log(`<${username}> ${message}`)
  })

  // ===== ERROR HANDLING =====
  bot.on('error', err => {
    if (err.code === 'ECONNRESET') {
      console.log('⚠️ Connection reset by server (Aternos)')
      return
    }
    console.log('⚠️ Error:', err.message)
  })

  bot.on('kicked', reason => {
    console.log('❌ Kicked:', reason)
  })

  // ===== SAFE RECONNECT =====
  bot.on('end', () => {
    clearInterval(afkInterval)

    if (reconnecting) return
    reconnecting = true

    console.log('🔁 Reconnecting in 45 seconds...')
    setTimeout(() => {
      reconnecting = false
      startBot()
    }, 45000)
  })
}

startBot()
