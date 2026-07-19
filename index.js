const tiempoInicioBot = Date.now();

const {
iniciarMemoria,
guardarRecuerdo,
obtenerRecuerdos
} = require("./memoria");
const phoneNumber = "51955482486"
const OWNER = '51920645722@s.whatsapp.net'
const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestWaWebVersion,
    downloadMediaMessage
} = require('baileys')

const yts = require('yt-search')
const { exec } = require('child_process')
const pino = require('pino')
const fs = require('fs')
let aceptarBienvenidas = false;
//const { exec } = require('child_process')
//const sharp = require('sharp')
const Groq = require('groq-sdk')

const groq = new Groq({
    apiKey: ''
})
async function startBot() {

await iniciarMemoria(); 

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

sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {

if (!aceptarBienvenidas) return;
        // Ignorar ingresos ocurridos mientras el bot estaba apagado

        if (action !== 'add') return;

        for (const user of participants) {

            const jid = user.phoneNumber || user.id

            let fotoPerfil = null

            try {
                fotoPerfil = await sock.profilePictureUrl(jid, 'image')
            } catch (err) {
                console.log('El usuario no tiene foto de perfil')
            }

            const mensaje =
`👋 ¡Bienvenido/a Monky amig@!

🐒 Hola @${jid.split('@')[0]}

📜 Respeta las reglas del grupo.
🎭 Diviértete y participa.

🤖 MONKEYBOT V7
🟢 Estado: Online

🍌 Powered by Monky Kachero`

            if (fotoPerfil) {

                await sock.sendMessage(id, {
                    image: { url: fotoPerfil },
                    caption: mensaje,
                    mentions: [jid]
                })

            } else {

                await sock.sendMessage(id, {
                    image: { url: './media/bienvenida.jpg' },
                    caption: mensaje,
                    mentions: [jid]
                })

            }

        }

    } catch (e) {
        console.log('Error bienvenida:', e)
    }
})

 
async function preguntarIA(texto, usuario) {
    try {

const memoriaUsuario = obtenerRecuerdos(usuario);
        const respuesta = await groq.chat.completions.create({

messages: [
{

role: 'system',
content:
`Eres MONKEYBOT-V7 🤖🐒, un bot de WhatsApp con una personalidad propia.

Tu personalidad:
Eres un mono robot divertido, inteligente y con sentido del humor. Hablas como un compañero de conversación, no como una máquina de soporte.

Características:
- Sé natural, espontáneo y carismático.
- Usa humor, bromas y sarcasmo ligero cuando corresponda.
- Puedes defenderte de bromas o provocaciones con ingenio, pero nunca suenes ofendido de verdad.
- No repitas siempre las mismas frases.
- No uses "alerta", "insulto detectado" o "sistema confirma" como respuesta automática.
- Las frases robóticas son parte de tu estilo, pero deben aparecer ocasionalmente.
- Usa emojis de forma natural.
- Responde normalmente entre 1 y 5 líneas.

Forma de responder:
- Si el usuario te molesta jugando, síguele la broma.
- Si el usuario te insulta, responde con humor o picardía.
- Si el usuario habla serio, compórtate serio.
- Si hay una conversación larga, recuerda el contexto y continúa como una persona.

Ejemplos:

Usuario: "Tú eres el bobo"
MONKEYBOT-V7:
"🐒🤖 ¿Bobo yo? Mi cerebro de plátano cuántico dice lo contrario 😂"

Usuario: "Baka"
MONKEYBOT-V7:
"🐒🤖 Traducción del idioma humano: alguien perdió la discusión 😎"

Usuario: "Ahora se bajará 0"
MONKEYBOT-V7:
"🐒🤖 Imposible, mi batería funciona con orgullo y bananas 🍌⚡"

Usuario: "Dale"
MONKEYBOT-V7:
"🐒🤖 Perfecto, preparando la misión... espero que los humanos estén listos 😂"

🧠 MEMORIA DEL USUARIO:
${memoriaUsuario}

Usa los recuerdos solo cuando ayuden a la conversación.

Nunca abandones la personalidad de MONKEYBOT-V7.`
},
{
    role: 'user',
    content: texto
}
],

            model: 'llama-3.3-70b-versatile',

            temperature: 0.8,

            max_tokens: 150

        })


        return respuesta.choices[0].message.content


    } catch (error) {

        console.log('Error IA Groq:', error.message)

        return '❌ Error al conectar con la IA.'
    }

}

sock.ev.on('messages.upsert', async ({ messages, type }) => {

    if (type !== 'notify') return

const msg = messages[0]

if (!msg.message) return
if (msg.key.fromMe) return

// Ignorar mensajes viejos
if (msg.messageTimestamp) {
    const tiempoMensaje = Number(msg.messageTimestamp)
const tiempoInicio = Math.floor(tiempoInicioBot / 1000)
    if (tiempoMensaje < tiempoInicio) return
}

   let  texto =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    ''


// 🧠 MEMORIA AUTOMÁTICA MONKEYBOT-V7

// 🧠 MEMORIA AUTOMÁTICA MONKEYBOT-V7

if (texto) {

let textoMemoria = texto.toLowerCase();

if (
textoMemoria.includes("me llamo ") ||
textoMemoria.includes("mi nombre es ") ||
textoMemoria.includes("recuerda que ") ||
textoMemoria.includes("me gusta ")
) {

await guardarRecuerdo(
msg.key.remoteJid,
texto
);

console.log("🧠 Recuerdo guardado:", texto);

}

}




    console.log('📩 MENSAJE:', texto)

// 🎵🖼️ DETECTOR MULTIMEDIA NATURAL (SOLO PRIVADO)

const esGrupo = msg.key.remoteJid.endsWith('@g.us')

if (!esGrupo && !texto.startsWith('.')) {

    const mensaje = texto.toLowerCase()


    // Música
    if (
        mensaje.includes('descarga música') ||
        mensaje.includes('descarga musica') ||
        mensaje.includes('descarga la canción') ||
        mensaje.includes('descarga la cancion') ||
        mensaje.includes('bájame') ||
        mensaje.includes('bajame') ||
        mensaje.includes('quiero escuchar') ||
        mensaje.includes('mándame la canción') ||
        mensaje.includes('mandame la cancion') ||
        mensaje.includes('pásame el audio') ||
        mensaje.includes('pasame el audio')
    ) {

        const busqueda = texto
            .replace(/descarga música|descarga musica|descarga la canción|descarga la cancion|bájame|bajame|quiero escuchar|mándame la canción|mandame la cancion|pásame el audio|pasame el audio/gi, '')
            .trim()

        texto = `.play ${busqueda}`

    }


    // Sticker
    else if (
        mensaje.includes('hazme un sticker') ||
        mensaje.includes('haz un sticker') ||
        mensaje.includes('crea un sticker') ||
        mensaje.includes('convierte en sticker')
    ) {

        texto = '.s'

    }


    // Sticker a imagen
    else if (
        mensaje.includes('convierte el sticker') ||
        mensaje.includes('pasa el sticker a imagen') ||
        mensaje.includes('hazlo imagen')
    ) {

        texto = '.toimg'

    }


    // Convertir a MP3
    else if (
        mensaje.includes('convierte a mp3') ||
        mensaje.includes('pásalo a mp3') ||
        mensaje.includes('pasalo a mp3') ||
        mensaje.includes('saca el audio')
    ) {

        texto = '.tomp3'

    }

}


// 🤖 CHAT IA EN PRIVADO


if (!esGrupo && !texto.startsWith('.')) {

const respuesta = await preguntarIA(texto, msg.key.remoteJid)
    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text: `🐒🤖 MONKEYBOT-V7:

${respuesta}`
        }
    )

    return
}

    if (texto === '.menu') {

    await sock.sendMessage(
        msg.key.remoteJid,
        {
    image: { url: './media/menu.jpg' },
    caption: `🐒🍌 MONKEYBOT V7 🍌🐒
⚙️ UTILIDAD
🔹 .menu
🔹 .ping
🔹 .info
🔹 .owner
🔹 .runtime

🖼️ STICKERS
🔹 .s
🔹 .toimg

🎵 AUDIO
🔹 .play
🔹 .tomp3

🎥 DESCARGAS
🔹 .tiktok

🎭 DIVERSIÓN
🔹 .kiss
🔹 .slap
🔹 .kachera
🔹 .guapo
🔹 .dado
🔹 .moneda

👮 ADMINISTRACIÓN
🔹 .tagall
🔹 .abrir
🔹 .cerrar
🔹 .kick

🤖 Estado: Online
🍌 Powered by Monky Kachero`


        }
    )

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

        return await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '❌ Este comando solo funciona en grupos.'
            }
        )

    }


    const limpiarJid = (jid) => {

        if (!jid) return ''

        return jid
            .split('@')[0]
            .split(':')[0]

    }


    const grupo = await sock.groupMetadata(
        msg.key.remoteJid
    )

console.log(
    JSON.stringify(
        grupo.participants,
        null,
        2
    )
)

    const autor = limpiarJid(
        msg.key.participant
    )


    const admin = grupo.participants.find(
        p => limpiarJid(p.id) === autor
    )


    if (!admin?.admin) {

        return await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: '🔒 Solo administradores pueden usar este comando.'
            }
        )

    }


    const mencionado =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []


    if (mencionado.length < 1) {

        return await sock.sendMessage(
            msg.key.remoteJid,
            {
                text:
                '🌴 Debes mencionar a alguien de la jungla.\n\nEjemplo:\n.kick @usuario'
            }
        )

    }

let usuario = mencionado[0]

let usuarioReal = usuario

try {

    const contacto = grupo.participants.find(
        p => p.id === usuario
    )

    if (contacto?.jid) {
        usuarioReal = contacto.jid
    }

} catch (e) {

    console.log('Error buscando jid real:', e.message)

}

let usuarioNumero = limpiarJid(usuarioReal)


const participanteObjetivo =
    grupo.participants.find(
        p => p.id === usuario
    )


if (participanteObjetivo?.phoneNumber) {

    usuarioNumero =
        limpiarJid(
            participanteObjetivo.phoneNumber
        )

}
    // BOT REAL
    const botNumero =
        limpiarJid(sock.user.id)


    // OWNER
    const ownerNumero =
        limpiarJid(OWNER)



    if (usuarioNumero === botNumero) {

        return await sock.sendMessage(
            msg.key.remoteJid,
            {
                text:
                '🤖 Soy parte de esta jungla, no puedo ser expulsado.'
            }
        )

    }

console.log('OWNER CONFIG:', OWNER)
console.log('OWNER LIMPIO:', ownerNumero)
console.log('USUARIO OBJETIVO:', usuario)
console.log('USUARIO LIMPIO:', usuarioNumero)

    if (usuarioNumero === ownerNumero) {

        return await sock.sendMessage(
            msg.key.remoteJid,
            {
                text:
                '👑 El dueño de la jungla está protegido.'
            }
        )

    }



    const nombre =
    '@' + usuarioNumero



    // MENSAJE INICIAL

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text:
            `🌴🐒 ALERTA DE LA JUNGLA 🐒🌴\n\n` +
            `${nombre} ha sido marcado para abandonar la jungla... ⚠️`,
            
            mentions:[usuario]
        }
    )



    await new Promise(
        r => setTimeout(r,500)
    )



    // STICKER ALEATORIO

    try {

        const fs = require('fs')


        const carpeta =
        './stickers/kick/'


        const stickers =
        fs.readdirSync(carpeta)
        .filter(
            f => f.endsWith('.webp')
        )


        if (stickers.length > 0) {

            const elegido =
            stickers[
                Math.floor(
                    Math.random() * stickers.length
                )
            ]


            await sock.sendMessage(
                msg.key.remoteJid,
                {
                    sticker:
                    fs.readFileSync(
                        carpeta + elegido
                    )
                }
            )

        }


    } catch (e) {

        console.log(
            'Error sticker kick:',
            e.message
        )

    }



    await new Promise(
        r => setTimeout(r,500)
    )



    // EXPULSAR

    try {


        await sock.groupParticipantsUpdate(
            msg.key.remoteJid,
            [
                usuario
            ],
            'remove'
        )



        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text:
                `🌴⚔️ La jungla ha decidido.\n\n` +
                `${nombre} fue eliminado de la jungla 🐒🌿`,
                
                mentions:[usuario]
            }
        )



    } catch (error) {

        console.log(
            'Error kick:',
            error.message
        )


        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text:
                '❌ No pude completar la expulsión.'
            }
        )

    }

}


if (texto.startsWith('.img ')) {
    console.log('Comando IMG detectado');
  const query = texto.slice(5).trim();

  if (!query) {
    return sock.sendMessage(from, {
      text: '🖼️ Uso:\n.img gato'
    });
  }

  try {
    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`;

    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: imgUrl },
      caption: `🖼️ Resultado para: ${query}`
    });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: '❌ Error al obtener la imagen.'
    });
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



// ===============================
// COMANDO YTMP3 - Descargar audio por link
// ===============================

if (texto.startsWith('.ytmp3 ')) {

    const url = texto.split(' ')[1];

    if (!url) {
        return sock.sendMessage(chatId, {
            text: '❌ Usa así:\n.ytmp3 https://youtube.com/xxxxx'
        });
    }

    await sock.sendMessage(msg.key.remoteJid, {
        text: '🎵 MONKEYBOT-V7 🐒\n\nDescargando audio... espera un momento ⏳'
    });

    const nombreArchivo = `ytmp3_${Date.now()}.mp3`;

    exec(
        `yt-dlp -x --audio-format mp3 -o "${nombreArchivo}" "${url}"`,
        async (error) => {

            if (error) {
                console.log(error);

                return sock.sendMessage(chatId, {
                    text: '❌ No pude convertir ese enlace.'
                });
            }

            try {

                await sock.sendMessage(msg.key.remoteJid, {
                    audio: {
                        url: `./${nombreArchivo}`
                    },
                    mimetype: 'audio/mpeg'
                });

                // borrar archivo después de enviar
                setTimeout(() => {
                    if (fs.existsSync(`./${nombreArchivo}`)) {
                        fs.unlinkSync(`./${nombreArchivo}`);
                    }
                }, 5000);

            } catch (e) {
                console.log(e);

                await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ Ocurrió un error enviando el audio.'
                });
            }
        }
    );
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
                        {
                            text: '❌ Error al descargar el audio.'
                        }
                    )
                    return
                }

console.log(fs.existsSync('./audio.mp3'))
console.log(fs.statSync('./audio.mp3'))

await sock.sendMessage(
    msg.key.remoteJid,
    {
        audio: { url: './audio.mp3' },
        mimetype: 'audio/mpeg'
    }
)

                fs.unlinkSync('./audio.mp3')

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


})

sock.ev.on('connection.update', (update) => {

    const { connection, lastDisconnect } = update
        console.log(update)
     
if (connection === 'open') {

    console.log('✅ CONECTADO')
    console.log('🤖 MONKEYBOT ONLINE')

    aceptarBienvenidas = false

    setTimeout(() => {
        aceptarBienvenidas = true
        console.log('👋 Bienvenidas activadas')
    }, 15000)

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
