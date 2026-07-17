
const phoneNumber = "51932751676"
const OWNER = '51920645722@s.whatsapp.net'
const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestWaWebVersion,
    downloadMediaMessage
} = require('baileys')

const webp = require('node-webpmux')
const axios = require('axios');
const fs = require('fs');const yts = require('yt-search')
const { exec } = require('child_process')
const pino = require('pino')
const inicioBot = Date.now()
//const { exec } = require('child_process')
// const sharp = require('sharp')



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











// Hora de inicio del bot
const startTime = Date.now();

sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {

// Ignorar bienvenidas durante 2 minutos tras iniciar
if (Date.now() - startTime < 120000) {
    console.log('Bienvenida ignorada por reinicio');
    return;
}       
 console.log('EVENTO BIENVENIDA:', action)

        if (action !== 'add') return

        for (const user of participants) {

            const jid = user.phoneNumber || user.id || user
            const numero = jid.split('@')[0]

            // 👤 FOTO DE PERFIL (PRIORIDAD)
            let imageToSend

            try {
                imageToSend = await sock.profilePictureUrl(jid, 'image')
            } catch (e) {
                // 🖼️ FALLBACK LOCAL (MEDIA)
                imageToSend = './media/bienvenida.jpg'
            }

            const texto = `
╔══════════════════╗
        👑 BIENVENIDO 👑
╚══════════════════╝

✨ Hola @${numero}
💬 Bienvenido al grupo

━━━━━━━━━━━━━━━
📌 MENÚ DEL GRUPO
━━━━━━━━━━━━━━━
🔹 .menu → comandos
🔹 .info → bot info
🔹 .owner → creador
🔹 .help → ayuda

━━━━━━━━━━━━━━━
⚡ Disfruta tu estadía
🔥 MonkeyBot V7
`

            await sock.sendMessage(id, {
                image: { url: imageToSend },
                caption: texto,
                mentions: [jid]
            })

        }

    } catch (e) {
        console.log('Error bienvenida:', e)
    }
})

sock.ev.on('messages.upsert', async ({ messages, type }) => {

    if (type !== 'notify') return

const msg = messages[0]

if (!msg.message) return
if (msg.key.fromMe) return

// Ignorar mensajes viejos
if (msg.messageTimestamp) {
    const tiempoMensaje = Number(msg.messageTimestamp)
    const tiempoInicio = Math.floor(inicioBot / 1000)

    if (tiempoMensaje < tiempoInicio) return
}

   const texto =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    ''

    console.log('📩 MENSAJE:', texto)




if (texto === '.menu') {

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            image: { url: './media/menu.jpg' },
            caption: `🐒🍌 MONKEYBOT V7 🍌🐒

╭━━━〔 ⚙️ UTILIDAD 〕━━━╮
🔹 .menu
🔹 .ping
🔹 .info
🔹 .owner
🔹 .runtime
╰━━━━━━━━━━━━━━━━━━╯

╭━━━〔 🖼️ STICKERS 〕━━━╮
🔹 .s
🔹 .toimg
🔹 .take Pack|Autor
╰━━━━━━━━━━━━━━━━━━╯

╭━━━〔 🎵 AUDIO 〕━━━╮
🔹 .play <nombre>
🔹 .tomp3
🔹 .ytmp3 <link>
🔹 .audio
╰━━━━━━━━━━━━━━━━━━╯

╭━━━〔 🖼️ EFECTOS IMAGEN 〕━━━╮
🔹 .hd
🔹 .retro
🔹 .blur [1-50]
╰━━━━━━━━━━━━━━━━━━╯

╭━━━〔 🎥 DESCARGAS 〕━━━╮
🔹 .facebook <link>
🔹 .tiktok <link>
🔹 .play <nombre>
╰━━━━━━━━━━━━━━━━━━╯

╭━━━〔 🎭 DIVERSIÓN 〕━━━╮
🔹 .kiss
🔹 .slap
🔹 .kachera
🔹 .guapo
🔹 .dado
🔹 .moneda
╰━━━━━━━━━━━━━━━━━━╯

╭━━━〔 👮 ADMINISTRACIÓN 〕━━━╮
🔹 .tagall
🔹 .abrir
🔹 .cerrar
🔹 .kick
╰━━━━━━━━━━━━━━━━━━╯

🤖 Estado: Online
🍌 Powered by Monky Kachero`
        }
    )

}

if (texto === '.hd') {

    const fs = require('fs')
    const { exec } = require('child_process')

    try {

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

        if (!quoted || !quoted.imageMessage) {

            await sock.sendMessage(
                msg.key.remoteJid,
                {
                    text: '🖼️ Responde a una imagen con .hd para mejorar calidad.'
                }
            )
            return
        }


        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '✨ Mejorando imagen...'
            }
        )


        const buffer = await downloadMediaMessage(
            {
                message: quoted
            },
            'buffer',
            {},
            {
                logger: pino({ level: 'silent' })
            }
        )


        fs.writeFileSync(
            './imagen.jpg',
            buffer
        )


        exec(
            'ffmpeg -i imagen.jpg -vf "scale=1920:-1:flags=lanczos,unsharp=5:5:1.0:5:5:0.0" -q:v 2 hd.jpg',
            async (error) => {


                if (error) {

                    console.log('HD ERROR:', error)

                    await sock.sendMessage(
                        msg.key.remoteJid,
                        {
                            text: '❌ Error mejorando imagen.'
                        }
                    )
                    return
                }


                if (!fs.existsSync('./hd.jpg')) {

                    await sock.sendMessage(
                        msg.key.remoteJid,
                        {
                            text: '❌ No se creó la imagen HD.'
                        }
                    )
                    return
                }


                await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        image: fs.readFileSync('./hd.jpg'),
                        caption: '✅ Imagen mejorada con FFmpeg'
                    }
                )


                if (fs.existsSync('./imagen.jpg')) {
                    fs.unlinkSync('./imagen.jpg')
                }

                if (fs.existsSync('./hd.jpg')) {
                    fs.unlinkSync('./hd.jpg')
                }

            }
        )


    } catch (e) {

        console.log('HD CATCH:', e)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ Error procesando imagen.'
            }
        )

    }
}





if (texto.startsWith('.ytmp3 ')) {

    const url = texto.slice(7).trim()

    if (!url) {
        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '🎵 Envía un enlace de YouTube.\nEjemplo:\n.ytmp3 https://youtube.com/watch?v=xxxxx'
            }
        )
        return
    }

    try {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '⏳ Descargando audio de YouTube...'
            }
        )


        const { exec } = require('child_process')
        const fs = require('fs')


        exec(
            `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "ytmp3.%(ext)s" "${url}"`,
            async (error) => {

                if (error) {

                    console.log('YTMP3 ERROR:', error)

                    await sock.sendMessage(
                        msg.key.remoteJid,
                        {
                            text: '❌ No se pudo descargar el audio.'
                        }
                    )

                    return
                }


                const archivo = './ytmp3.mp3'


                if (!fs.existsSync(archivo)) {

                    await sock.sendMessage(
                        msg.key.remoteJid,
                        {
                            text: '❌ No se encontró el MP3 generado.'
                        }
                    )

                    return
                }


                await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        audio: fs.readFileSync(archivo),
                        mimetype: 'audio/mpeg'
                    }
                )


                if (fs.existsSync(archivo)) {
                    fs.unlinkSync(archivo)
                }

            }
        )


    } catch (e) {

        console.log('YTMP3 CATCH:', e)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ Error procesando el enlace.'
            }
        )

    }

}


if (texto.startsWith('.robot ')) {

    const mensaje = texto.slice(7).trim()

    if (!mensaje) {
        return await sock.sendMessage(from, {
            text: '🤖 Escribe un texto.\nEjemplo:\n.robot Hola soy MONKEYBOT'
        })
    }

    try {

        // Generar voz con Google TTS
        const gtts = require('gtts')

        const archivo = './temp_robot.mp3'

        const tts = new gtts(mensaje, 'es')
        
        tts.save(archivo, function (err) {

            if (err) {
                console.log(err)
                return
            }

        })


        await new Promise(resolve => setTimeout(resolve, 2000))


        // Convertir a efecto robot
        const { exec } = require('child_process')

        exec(
        `ffmpeg -i ${archivo} -af "aecho=0.8:0.88:60:0.4, chorus=0.7:0.9:55:0.4:0.25:2" robot.mp3`,
        async (error) => {

            if (error) {
                console.log(error)
                return
            }

            await sock.sendMessage(
                from,
                {
                    audio: {
                        url: './robot.mp3'
                    },
                    mimetype: 'audio/mpeg',
                    ptt: true
                }
            )

        })

    } catch (e) {
        console.log(e)
    }

}


if (texto === '.ping') {

    const inicio = Date.now()

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: '🏓 Pong'
        }
    )

    const ping = Date.now() - inicio

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text:
`🤖 MONKEYBOT V7

🏓 Pong
⚡ Ping: ${ping} ms
🟢 Estado: Online`
        }
    )

}

if (texto === '.audio') {

    try {

        const fs = require('fs')
        const { exec } = require('child_process')

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

        if (!quoted || !quoted.videoMessage) {

            await sock.sendMessage(
                msg.key.remoteJid,
                {
                    text: '🎵 Responde a un video con .audio para extraer el sonido.'
                }
            )

            return
        }


        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '⏳ Extrayendo audio del video...'
            }
        )


        // Descargar video citado
        const buffer = await downloadMediaMessage(
            {
                message: quoted
            },
            'buffer',
            {},
            {
                logger: pino({ level: 'silent' })
            }
        )


        fs.writeFileSync(
            './video.mp4',
            buffer
        )


        // Convertir video a mp3
        exec(
            'ffmpeg -i video.mp4 -vn -c:a libmp3lame -q:a 2 audio.mp3',
            async (error) => {


                if (error) {

                    console.log('AUDIO FFMPEG ERROR:', error)

                    await sock.sendMessage(
                        msg.key.remoteJid,
                        {
                            text: '❌ Error convirtiendo el audio.'
                        }
                    )

                    return
                }


                if (!fs.existsSync('./audio.mp3')) {

                    await sock.sendMessage(
                        msg.key.remoteJid,
                        {
                            text: '❌ No se generó el archivo de audio.'
                        }
                    )

                    return
                }


                await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        audio: fs.readFileSync('./audio.mp3'),
                        mimetype: 'audio/mpeg',
                        ptt: false
                    }
                )


                // Limpieza de archivos
                if (fs.existsSync('./video.mp4')) {
                    fs.unlinkSync('./video.mp4')
                }

                if (fs.existsSync('./audio.mp3')) {
                    fs.unlinkSync('./audio.mp3')
                }


            }
        )


    } catch (e) {

        console.log('AUDIO ERROR:', e)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ Error procesando el video.'
            }
        )

    }

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


if (texto === '.tomp3') {

const quoted =
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

if (!quoted?.videoMessage) {

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: '🎥 Responde a un video con .tomp3'
        }
    )

    return
}

try {

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: '⏳ Extrayendo audio...'
        }
    )

    const buffer = await downloadMediaMessage(
        {
            message: quoted,
            key: msg.key
        },
        'buffer',
        {}
    )

    fs.writeFileSync('./video.mp4', buffer)

    exec(
        'ffmpeg -y -i ./video.mp4 -vn -ab 128k -ar 44100 ./audio.mp3',
        async (err) => {

            if (err) {

                console.log(err)

                return await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text: '❌ Error convirtiendo el video'
                    }
                )
            }

            await sock.sendMessage(
                msg.key.remoteJid,
                {
                    audio: fs.readFileSync('./audio.mp3'),
                    mimetype: 'audio/mpeg'
                }
            )

            if (fs.existsSync('./video.mp4'))
                fs.unlinkSync('./video.mp4')

            if (fs.existsSync('./audio.mp3'))
                fs.unlinkSync('./audio.mp3')

        }
    )

} catch (e) {

    console.log(e)

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: '❌ No pude extraer el audio'
        }
    )

}

}

if (texto === '.owner') {

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            image: { url: './media/owner.jpg' },
            caption: `╭━━━〔 👑 OWNER OFICIAL 👑 〕━━━⬣
┃
┃ 👤 Nombre: Orlando
┃ 😎 Apodo: Tu Kachero
┃ 🤖 Proyecto: MONKEYBOT V7
┃ ⚡ Cargo: Fundador y Desarrollador
┃ 🌎 País: Perú 🇵🇪
┃ 📱 Contacto: +51 920 645 722
┃ 🔥 Versión: 1.0
┃ 🟢 Estado: Activo
┃
╰━━━━━━━━━━━━━━━━━━⬣

🐒 MONKEYBOT V7`
        }
    )

}


if (texto.startsWith('.facebook ')) {

    const url = texto.slice(10).trim()

    if (!url) {
        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '📹 Envía un enlace de Facebook.\nEjemplo:\n.facebook https://facebook.com/xxxxx'
            }
        )
        return
    }

    try {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '⏳ Descargando video de Facebook...'
            }
        )

        const { exec } = require('child_process')
        const fs = require('fs')

        exec(`yt-dlp -f "best[ext=mp4]" -o "facebook.mp4" "${url}"`,
        async (error) => {

            if (error) {
                console.log('FACEBOOK ERROR:', error)

                await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text: '❌ No se pudo descargar el video.'
                    }
                )
                return
            }

            if (!fs.existsSync('./facebook.mp4')) {

                await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text: '❌ El archivo no fue generado.'
                    }
                )
                return
            }

            await sock.sendMessage(
                msg.key.remoteJid,
                {
                    video: fs.readFileSync('./facebook.mp4'),
                    caption: '✅ Video descargado de Facebook'
                }
            )

            // borrar archivo después de enviar
            if (fs.existsSync('./facebook.mp4')) {
                fs.unlinkSync('./facebook.mp4')
            }

        })

    } catch (e) {

        console.log('FACEBOOK CATCH:', e)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ Error al procesar el video.'
            }
        )
    }
}

if (texto === '.bombom') {

    const grupo = await sock.groupMetadata(msg.key.remoteJid)

    const participantes = grupo.participants

    const elegido =
        participantes[Math.floor(Math.random() * participantes.length)]

    const usuario = elegido.id

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text:
`✨🔥 EL BOMBÓN DEL GRUPO 🔥✨

👑 @${usuario.split('@')[0]}

😍 Nivel de belleza: 1000%

💘 Tiene a medio grupo suspirando

😎 Nació para destacar y lo sabe

🔥✨ ¡Hoy la suerte eligió a la persona más guapa del grupo! ✨🔥`,
            mentions: [usuario]
        }
    )

}

if (texto === '.kachera') {

    const grupo = await sock.groupMetadata(msg.key.remoteJid)

    const participantes = grupo.participants

    const elegido =
        participantes[Math.floor(Math.random() * participantes.length)]

    const usuario = elegido.id

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text:
`🔥💋 LA MÁS KACHERA DEL GRUPO 💋🔥

👑 @${usuario.split('@')[0]}

🥵❤️‍🔥 Nivel de kachería: 1000%

🔥 Cuidado, está rompiendo corazones por aquí... 😏`,
            mentions: [usuario]
        }
    )

}


if (texto === '.tagall') {

    if (!msg.key.remoteJid.endsWith('@g.us')) {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ Este comando solo funciona en grupos'
            }
        )

        return
    }

    const grupo =
        await sock.groupMetadata(msg.key.remoteJid)

    const participantes = grupo.participants

    let textoTag = '🐒🔥 *ATENCIÓN MONKYBROS* 🔥🐒\n🍌 El llamado de la jungla ha comenzado...\n\n'

    let menciones = []

    for (let p of participantes) {

        textoTag += `➤ @${p.id.split('@')[0]}\n`

        menciones.push(p.id)

    }

    textoTag += '\n🤖 MONKEYBOT V7'

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: textoTag,
            mentions: menciones
        }
    )

}

if (texto.startsWith('.kick')) {

    if (!msg.key.remoteJid.endsWith('@g.us')) {
        return await sock.sendMessage(msg.key.remoteJid, {
            text: '❌ Este comando solo funciona en grupos'
        })
    }

    let grupo
    try {
        grupo = await sock.groupMetadata(msg.key.remoteJid)
    } catch (e) {
        console.log(e)
        return await sock.sendMessage(msg.key.remoteJid, {
            text: '❌ No pude obtener información del grupo'
        })
    }

    const admin = grupo.participants.find(
        p => p.id === msg.key.participant
    )

    if (!admin?.admin) {
        return await sock.sendMessage(msg.key.remoteJid, {
            text: '🔒 Solo los administradores pueden usar este comando'
        })
    }

    // Obtener usuario a expulsar
    let usuario =
        msg.message?.extendedTextMessage?.contextInfo?.participant

    const menciones =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid

    if (!usuario && menciones?.length) {
        usuario = menciones[0]
    }

    if (!usuario) {
        return await sock.sendMessage(msg.key.remoteJid, {
            text: '👤 Responde a un mensaje o menciona a un usuario'
        })
    }

    // Normalizar JIDs
    const limpiarNumero = (jid) => {
        if (!jid) return ''
        return jid.split('@')[0].split(':')[0]
    }

    const usuarioNum = limpiarNumero(usuario)
    const ownerNum = limpiarNumero(OWNER)
    const botNum = limpiarNumero(sock.user.id)

    // 🔒 PROTECCIÓN OWNER
    if (usuarioNum === ownerNum) {
        return await sock.sendMessage(msg.key.remoteJid, {
            text: '🐒🍌 No puedes expulsar al creador de MONKEYBOT'
        })
    }

    // 🔒 PROTECCIÓN BOT
    if (usuarioNum === botNum) {
        return await sock.sendMessage(msg.key.remoteJid, {
            text: '🐒🍌 MONKEYBOT no puede ser expulsado de su propia jungla'
        })
    }

    try {

        await sock.sendMessage(msg.key.remoteJid, {
            text:
`🐒⚖️ *CONSEJO DE LA JUNGLA* ⚖️🐒

Después de una reunión extraordinaria...

👢 @${usuario.split('@')[0]} ha sido declarado culpable.

🍌 Castigo: expulsión inmediata de la jungla.

💀 Procediendo...`,
            mentions: [usuario]
        })

        const stickers = fs.readdirSync('./stickers/kick')

        if (stickers.length > 0) {

            const randomFile =
                stickers[Math.floor(Math.random() * stickers.length)]

            await sock.sendMessage(msg.key.remoteJid, {
                sticker: fs.readFileSync(`./stickers/kick/${randomFile}`)
            })
        }

        await new Promise(resolve => setTimeout(resolve, 500))

        await sock.groupParticipantsUpdate(
            msg.key.remoteJid,
            [usuario],
            'remove'
        )

        await sock.sendMessage(msg.key.remoteJid, {
            text:
`💀👢 *EXPULSIÓN COMPLETADA* 👢💀

@${usuario.split('@')[0]} fue expulsado de la jungla.

🐒 MONKEYBOT V7`,
            mentions: [usuario]
        })

    } catch (e) {

        console.log(e)

        await sock.sendMessage(msg.key.remoteJid, {
            text: '❌ No pude expulsar al usuario.\n¿Soy admin del grupo?'
        })
    }

}

if (texto.startsWith('.take ')) {

    const quoted =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (!quoted?.stickerMessage) {
        return await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '🖼️ Responde a un sticker\n\nEjemplo:\n.take MonkeyBot|Alberto'
            }
        )
    }

    try {

        const args = texto.slice(6).split('|')

        const packname = args[0]?.trim() || 'MonkeyBot'
        const author = args[1]?.trim() || 'Bot'

        const buffer = await downloadMediaMessage(
            {
                message: quoted,
                key: msg.key
            },
            'buffer',
            {}
        )

        fs.writeFileSync('./take.webp', buffer)

        const img = new webp.Image()
        await img.load('./take.webp')

        const json = {
            'sticker-pack-id': 'monkeybot-v7',
            'sticker-pack-name': packname,
            'sticker-pack-publisher': author,
            emojis: ['🐵']
        }

        const exifAttr = Buffer.from([
            0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,
            0x01,0x00,0x41,0x57,0x07,0x00
        ])

        const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')

        const exif = Buffer.concat([
            exifAttr,
            Buffer.from([
                jsonBuffer.length,
                0x00,0x00,0x00
            ]),
            jsonBuffer
        ])

        img.exif = exif

        await img.save('./take-final.webp')

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                sticker: fs.readFileSync('./take-final.webp')
            }
        )

        if (fs.existsSync('./take.webp'))
            fs.unlinkSync('./take.webp')

        if (fs.existsSync('./take-final.webp'))
            fs.unlinkSync('./take-final.webp')

    } catch (e) {

        console.log(e)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ Error al cambiar pack y autor'
            }
        )
    }
}


if (texto === '.cerrar') {

    if (!msg.key.remoteJid.endsWith('@g.us')) {

        return await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ Este comando solo funciona en grupos'
            }
        )

    }

const grupo = await sock.groupMetadata(
    msg.key.remoteJid
)

console.log('MI ID:', sock.user.id)
console.log('PARTICIPANTES:', grupo.participants)
const participante = grupo.participants.find(
    p => p.id === msg.key.participant
)

if (!participante?.admin) {

    return await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: '🔒 Solo los administradores pueden usar este comando'
        }
    )

}

    try {

        await sock.groupSettingUpdate(
            msg.key.remoteJid,
            'announcement'
        )

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '🔒 Grupo cerrado\n\n🐒 Solo los administradores pueden enviar mensajes.'
            }
        )

    } catch (e) {

        console.log(e)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ No pude cerrar el grupo.\n\n¿El bot es administrador?'
            }
        )

    }

}



if (texto === '.abrir') {

    if (!msg.key.remoteJid.endsWith('@g.us')) {

        return await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ Este comando solo funciona en grupos'
            }
        )

    }

const grupo = await sock.groupMetadata(
    msg.key.remoteJid
)

const participante = grupo.participants.find(
    p => p.id === msg.key.participant
)

if (!participante?.admin) {

    return await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: '🔒 Solo los administradores pueden usar este comando'
        }
    )

}

    try {

        await sock.groupSettingUpdate(
            msg.key.remoteJid,
            'not_announcement'
        )

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '🔓 Grupo abierto\n\n🐒 Todos los MonkyBros pueden enviar mensajes.'
            }
        )

    } catch (e) {

        console.log(e)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ No pude abrir el grupo.\n\n¿El bot es administrador?'
            }
        )

    }

}

if (texto.startsWith('.img ')) {

    let input = texto.slice(5).trim();

    if (!input) {
        return sock.sendMessage(msg.key.remoteJid, {
            text: '🖼️ Uso: .img gato saltando\nEj: .img anime perro'
        });
    }

    // ⏳ mensaje de carga
    const loadingMsg = await sock.sendMessage(msg.key.remoteJid, {
        text: '⏳ Generando imagen, espera...'
    });

    // 🎯 estilos simples
    let style = '';
    let query = input.toLowerCase();

    if (query.startsWith('anime ')) {
        style = 'anime, ultra quality, detailed, ';
        query = query.replace('anime ', '');
    } else if (query.startsWith('realista ')) {
        style = 'realistic, ultra detailed, 4k, ';
        query = query.replace('realista ', '');
    } else if (query.startsWith('hd ')) {
        style = 'high definition, sharp focus, ';
        query = query.replace('hd ', '');
    }

    const prompt = style + query;

    const urls = [
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux`,
        `https://pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024`,
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024`
    ];

    let imgBuffer = null;

    try {

        for (let i = 0; i < urls.length; i++) {

            try {
                const res = await axios.get(urls[i], {
                    responseType: 'arraybuffer',
                    timeout: 25000
                });

                if (res.data && res.data.length > 1000) {
                    imgBuffer = Buffer.from(res.data);
                    break;
                }

            } catch (e) {
                console.log(`❌ API ${i + 1} falló`);
            }
        }

        if (!imgBuffer) {
            throw new Error('Todas las APIs fallaron');
        }

        await sock.sendMessage(msg.key.remoteJid, {
            image: imgBuffer,
            caption: `🖼️ Resultado:\n${prompt}`
        });

        console.log('✔ Imagen enviada');

    } catch (err) {

        console.log('IMG FINAL ERROR:', err.message);

        await sock.sendMessage(msg.key.remoteJid, {
            text: '❌ No se pudo generar la imagen. Intenta otro prompt.'
        });

    }

    return;
}

if (texto === '.dado') {

    const numero =
        Math.floor(Math.random() * 6) + 1

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text:
`🎲 MONKEYBOT V7

Resultado: ${numero}`
        }
    )

}


if (texto === '.moneda') {

    const resultado =
        Math.random() < 0.5 ? 'Cara' : 'Cruz'

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text:
`🪙 MONKEYBOT V7

Resultado: ${resultado}`
        }
    )

}

if (texto === '.runtime') {

    const tiempo = Date.now() - inicioBot

    const segundos = Math.floor(tiempo / 1000) % 60
    const minutos = Math.floor(tiempo / (1000 * 60)) % 60
    const horas = Math.floor(tiempo / (1000 * 60 * 60))

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text:
`🤖 MONKEYBOT V7

⏰ Tiempo activo:
${horas}h ${minutos}m ${segundos}s

🟢 Estado: Online`
        }
    )

}

if (texto === '.retro') {

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (!quoted?.imageMessage) {
        return sock.sendMessage(msg.key.remoteJid, {
            text: '📸 Responde a una imagen con .retro'
        })
    }

    try {

        const buffer = await downloadMediaMessage(
            {
                message: quoted
            },
            'buffer',
            {},
            {
                logger: console,
                reuploadRequest: sock.updateMediaMessage
            }
        )

        const input = './temp_retro.jpg'
        const output = './retro.jpg'

        fs.writeFileSync(input, buffer)

        exec(
            `ffmpeg -i "${input}" -vf "colorbalance=rs=0.3:gs=0.1:bs=-0.2,eq=contrast=1.2:saturation=0.6,noise=alls=10:allf=t" "${output}" -y`,
            async (err) => {

                if (err) {
                    console.log(err)
                    return sock.sendMessage(from, {
                        text: '❌ Error al aplicar efecto retro'
                    })
                }

                await sock.sendMessage(msg.key.remoteJid, {
                    image: fs.readFileSync(output),
                    caption: '📷 Efecto Retro'
                })

                fs.unlinkSync(input)
                fs.unlinkSync(output)
            }
        )

    } catch (e) {
        console.log(e)
        sock.sendMessage(from, {
            text: '❌ Error procesando imagen'
        })
    }
}

if (texto.startsWith('.blur')) {

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (!quoted?.imageMessage) {
        return sock.sendMessage(msg.key.remoteJid, {
            text: '📸 Responde a una imagen\n\nEjemplo:\n.blur 10'
        })
    }

    try {

        let sigma = parseInt(texto.split(' ')[1]) || 10

        if (sigma < 1) sigma = 1
        if (sigma > 50) sigma = 50

        const buffer = await downloadMediaMessage(
            { message: quoted },
            'buffer',
            {},
            {
                logger: console,
                reuploadRequest: sock.updateMediaMessage
            }
        )

        const input = './temp_blur.jpg'
        const output = './blur.jpg'

        fs.writeFileSync(input, buffer)

        exec(
            `ffmpeg -i "${input}" -vf "gblur=sigma=${sigma}" "${output}" -y`,
            async (err) => {

                if (err) {
                    console.log(err)
                    return sock.sendMessage(from, {
                        text: '❌ Error al aplicar blur'
                    })
                }

                await sock.sendMessage(from, {
                    image: fs.readFileSync(output),
                    caption: `🌫️ Blur aplicado\n📊 Intensidad: ${sigma}`
                })

                try { fs.unlinkSync(input) } catch {}
                try { fs.unlinkSync(output) } catch {}

            }
        )

    } catch (e) {
        console.log(e)
        sock.sendMessage(from, {
            text: '❌ Error procesando imagen'
        })
    }
}


if (texto === '.s') {

const quoted =
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

if (!quoted?.imageMessage && !quoted?.videoMessage) {

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: '📸 Responde a una foto o video con .s'
        }
    )

    return
}

try {

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: '⏳ Creando sticker...'
        }
    )

    const buffer = await downloadMediaMessage(
        {
            message: quoted,
            key: msg.key
        },
        'buffer',
        {}
    )

    if (quoted?.imageMessage) {

console.log('BUFFER SIZE:', buffer.length)        

fs.writeFileSync('./foto.jpg', buffer)

        exec(
            'ffmpeg -y -i ./foto.jpg -vf "scale=512:512:force_original_aspect_ratio=decrease" ./sticker.webp',
            async (err) => {

                if (err) {

                    console.log(err)

                    return await sock.sendMessage(
                        msg.key.remoteJid,
                        {
                            text: '❌ Error creando sticker'
                        }
                    )
                }



await sock.sendMessage(
    msg.key.remoteJid,
    {
        sticker: fs.readFileSync('./sticker.webp')
    }
)

                if (fs.existsSync('./foto.jpg'))
                    fs.unlinkSync('./foto.jpg')

                if (fs.existsSync('./sticker.webp'))
                    fs.unlinkSync('./sticker.webp')

            }
        )

    }


    if (quoted?.videoMessage) {

        fs.writeFileSync('./video.mp4', buffer)

        exec(
            'ffmpeg -y -i ./video.mp4 -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -loop 0 -an ./sticker.webp',
            async (err) => {

                if (err) {

                    console.log(err)

                    return await sock.sendMessage(
                        msg.key.remoteJid,
                        {
                            text: '❌ Error creando sticker animado'
                        }
                    )
                }

                await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        sticker: fs.readFileSync('./sticker.webp')
                    }
                )

                if (fs.existsSync('./video.mp4'))
                    fs.unlinkSync('./video.mp4')

                if (fs.existsSync('./sticker.webp'))
                    fs.unlinkSync('./sticker.webp')

            }
        )

    }

} catch (e) {

    console.log(e)

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: '❌ Error creando sticker'
        }
    )

}

}

if (texto === '.toimg') {

const quoted =
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

if (!quoted?.stickerMessage) {

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: '🖼️ Responde a un sticker con .toimg'
        }
    )

    return
}

try {

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: '⏳ Convirtiendo sticker...'
        }
    )

    const buffer = await downloadMediaMessage(
        {
            message: quoted,
            key: msg.key
        },
        'buffer',
        {}
    )

    fs.writeFileSync('./sticker.webp', buffer)

    exec(
      'ffmpeg -y -vcodec webp -i ./sticker.webp -frames:v 1 ./imagen.png',
        async (err) => {

            if (err) {

                console.log(err)

                return await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text: '❌ Error convirtiendo sticker'
                    }
                )

            }

            await sock.sendMessage(
                msg.key.remoteJid,
                {
                    image: fs.readFileSync('./imagen.png'),
                    caption: '✅ Sticker convertido'
                }
            )

            if (fs.existsSync('./sticker.webp'))
                fs.unlinkSync('./sticker.webp')

            if (fs.existsSync('./imagen.png'))
                fs.unlinkSync('./imagen.png')

        }
    )

} catch (e) {

    console.log(e)

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: '❌ No pude convertir ese sticker'
        }
    )

}

}


  if (texto.startsWith('.tiktok ')) {

    const link = texto.slice(8).trim()

    if (!link) {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '📹 Ingresa un enlace de TikTok.\n\nEjemplo:\n.tiktok https://vt.tiktok.com/xxxxx/'
            }
        )

        return
    }

    try {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '🔍 Buscando información del video...'
            }
        )

        exec(
            `yt-dlp -j "${link}"`,
            async (err, stdout) => {

                if (err) {

                    console.log(err)

                    return await sock.sendMessage(
                        msg.key.remoteJid,
                        {
                            text: '❌ No pude obtener información del video.'
                        }
                    )
                }

                const data = JSON.parse(stdout)

                await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text:
`🎵 *INFORMACIÓN DEL TIKTOK*

📌 Título: ${data.title || 'Sin título'}

👤 Autor: ${data.uploader || 'Desconocido'}

⏱️ Duración: ${data.duration || 0} segundos

⬇️ Descargando video...`
                    }
                )

                exec(
                    `yt-dlp -o "tiktok.mp4" "${link}"`,
                    async (error) => {

                        if (error) {

                            console.log(error)

                            return await sock.sendMessage(
                                msg.key.remoteJid,
                                {
                                    text: '❌ Error al descargar el video.'
                                }
                            )
                        }

                        await sock.sendMessage(
                            msg.key.remoteJid,
                            {
                                video: fs.readFileSync('./tiktok.mp4'),
                                caption:
`✅ Descargado por MONKEYBOT V7

🎵 ${data.title || 'TikTok'}`
                            }
                        )

                        if (fs.existsSync('./tiktok.mp4'))
                            fs.unlinkSync('./tiktok.mp4')

                    }
                )

            }
        )

    } catch (e) {

        console.log(e)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ Ocurrió un error.'
            }
        )

    }

}




if (texto === '.savekiss') {

    const quoted =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (!quoted?.stickerMessage) {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '💋 Responde a un sticker con .savekiss'
            }
        )

        return
    }

    try {

        const buffer = await downloadMediaMessage(
            {
                message: quoted,
                key: msg.key
            },
            'buffer',
            {}
        )

        const carpeta = './stickers/kiss'

        const archivos = fs.readdirSync(carpeta)

        const numero = archivos.length + 1

        const nombre = `kiss${numero}.webp`

        fs.writeFileSync(`${carpeta}/${nombre}`, buffer)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: `✅ Sticker guardado como ${nombre}`
            }
        )

    } catch (e) {

        console.log(e)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ Error al guardar el sticker'
            }
        )

    }

}

if (texto === '.saveslap') {

    const quoted =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (!quoted?.stickerMessage) {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '💥 Responde a un sticker con .saveslap'
            }
        )

        return
    }

    try {

        const buffer = await downloadMediaMessage(
            {
                message: quoted,
                key: msg.key
            },
            'buffer',
            {}
        )

        const carpeta = './stickers/slap'

        const archivos = fs.readdirSync(carpeta)

        const numero = archivos.length + 1

        const nombre = `slap${numero}.webp`

        fs.writeFileSync(`${carpeta}/${nombre}`, buffer)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: `✅ Sticker guardado como ${nombre}`
            }
        )

    } catch (e) {

        console.log(e)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ Error al guardar el sticker'
            }
        )

    }

}



if (texto === '.savekick') {

    const quoted =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (!quoted?.stickerMessage) {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '👢 Responde a un sticker con .savekick'
            }
        )

        return
    }

    try {

        const buffer = await downloadMediaMessage(
            {
                message: quoted,
                key: msg.key
            },
            'buffer',
            {}
        )

        const carpeta = './stickers/kick'

        const archivos = fs.readdirSync(carpeta)

        const numero = archivos.length + 1

        const nombre = `kick${numero}.webp`

        fs.writeFileSync(`${carpeta}/${nombre}`, buffer)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: `✅ Sticker guardado como ${nombre}`
            }
        )

    } catch (e) {

        console.log(e)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ Error al guardar el sticker'
            }
        )

    }

}

if (texto.startsWith('.play ')) {

    const busqueda = texto.slice(6).trim()

    if (!busqueda) {
        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '🎵 Escribe una canción.\nEjemplo:\n.play Grupo 5 Motor y Motivo'
            }
        )
        return
    }

    try {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '🔍 Buscando canción...'
            }
        )

        const resultados = await yts(busqueda)
        const video = resultados.videos[0]

        if (!video) {
            await sock.sendMessage(
                msg.key.remoteJid,
                {
                    text: '❌ No encontré resultados.'
                }
            )
            return
        }

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text:
`🎵 ${video.title}

⏱️ ${video.timestamp}

⬇️ Descargando audio...`
            }
        )

exec(
    `yt-dlp -x --audio-format mp3 -o "audio.%(ext)s" "${video.url}"`,
    async (error) => {

        if (error) {
            console.log(error)
            await sock.sendMessage(
                msg.key.remoteJid,
                { text: '❌ Error al descargar audio.' }
            )
            return
        }

        const archivos = fs.readdirSync('./')
        const audioFile = archivos.find(file => file.startsWith('audio.'))

        if (!audioFile) {
            await sock.sendMessage(
                msg.key.remoteJid,
                { text: '❌ No se pudo generar el audio.' }
            )
            return
        }

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                audio: fs.readFileSync(`./${audioFile}`),
                mimetype: 'audio/mpeg'
            }
        )

        try {
            fs.unlinkSync(`./${audioFile}`)
        } catch (err) {
            console.log('Error eliminando audio:', err.message)
        }

    }

    } catch (e) {

        console.log(e)

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ Ocurrió un error.'
            }
        )

    }

}


if (texto.startsWith('.kiss')) {

    const mention =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    if (mention.length < 1) {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '💋 Etiqueta a alguien.\nEjemplo: .kiss @usuario'
            }
        )

        return
    }

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: `💋 @${mention[0].split('@')[0]} recibió un beso`,
            mentions: mention
        }
    )

    const stickers = fs.readdirSync('./stickers/kiss')

    const randomFile =
        stickers[Math.floor(Math.random() * stickers.length)]

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            sticker: fs.readFileSync(`./stickers/kiss/${randomFile}`)
        }
    )
}


if (texto.startsWith('.slap')) {

    const mention =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    if (mention.length < 1) {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '💥 Etiqueta a alguien.\nEjemplo: .slap @usuario'
            }
        )

        return
    }

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: `💥 @${mention[0].split('@')[0]} recibió una cachetada`,
            mentions: mention
        }
    )

    const stickers = fs.readdirSync('./stickers/slap')

    const randomFile =
        stickers[Math.floor(Math.random() * stickers.length)]

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            sticker: fs.readFileSync(`./stickers/slap/${randomFile}`)
        }
    )



}


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
