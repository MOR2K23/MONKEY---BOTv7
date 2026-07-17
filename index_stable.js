const phoneNumber = "51920645722"

const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestWaWebVersion,
    downloadMediaMessage
} = require('baileys')

const pino = require('pino')
const fs = require('fs')
const { exec } = require('child_process')
//const sharp = require('sharp')

async function startBot() {

    const { state, saveCreds } =
        await useMultiFileAuthState('./session')

    const { version } =
        await fetchLatestWaWebVersion()

    console.log('WA Version:', version)
    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '22.04.4']
    })
if (!state.creds.registered) {

    setTimeout(async () => {

        try {

            const code = await sock.requestPairingCode(phoneNumber)
console.log("NUMERO USADO:", phoneNumber)
console.log("CODIGO:", code)
            console.log('\n====================')
            console.log('PAIRING CODE:', code)
            console.log('====================\n')

        } catch (err) {

            console.log('ERROR PAIRING:', err)

        }

    }, 5000)

}
    sock.ev.on('creds.update', saveCreds)
sock.ev.on('messages.upsert', async ({ messages, type }) => {

    const msg = messages[0]
if (!msg.message) return
if (msg.key.fromMe) return


   const texto =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    ''

    console.log('📩 MENSAJE:', texto)

    if (texto === '.menu') {

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            image: {
                url: './media/menu.jpg'
            },
            caption: `╭━━━〔 🤖 MONKEYBOT V7 〕━━━⬣

📋 MENÚ PRINCIPAL

🔹 .menu
🔹 .ping
🔹 .owner
🔹 .info

╰━━━━━━━━━━━━━━━━⬣`
        }
    )

}
    if (texto === '.ping') {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '🏓 Pong'
            }
        )

    }
if (texto === '.owner') {

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: `👤 PROPIETARIO

Nombre: Monky Kachero

🤖 MONKEYBOT V7`
        }
    )

}
if (texto === '.info') {

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: `🤖 MONKEYBOT V7

📌 Versión: 1.0
👤 Owner: Monky Kachero
⚡ Estado: Online
🟢 Plataforma: Baileys + Termux`
        }
    )

}


if (texto === '.s') {

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: '🧪 Comando sticker detectado'
        }
    )

}


})

sock.ev.on('connection.update', (update) => {

    const { connection, lastDisconnect } = update
        console.log(update)
     
  if (connection === 'open') {

    console.log('✅ CONECTADO')
    console.log('🤖 MONKEYBOT ONLINE')

}

        if (connection === 'close') {

    const statusCode =
        lastDisconnect?.error?.output?.statusCode

    const shouldReconnect =
        statusCode !== DisconnectReason.loggedOut

    console.log('❌ DESCONECTADO:', statusCode)

    if (shouldReconnect) {

        console.log('🔄 Reconectando en 3 segundos...')

        setTimeout(() => {
            startBot()
        }, 3000)

    }
}
    })
}

startBot()
