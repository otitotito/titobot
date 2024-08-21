const {
  makeWASocket,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const qrcode = require("qrcode-terminal");

async function connectWhatsapp() {
  const auth = await useMultiFileAuthState("session");
  const socket = makeWASocket({
    printQRInTerminal: false,
    browser: ["mybot", "", ""],
    auth: auth.state,
    logger: pino({ level: "silent" }),
  });

  socket.ev.on("creds.update", auth.saveCreds);

  socket.ev.on("connection.update", async ({ connection, qr }) => {
    if (connection === "open") {
      console.log("BOT WHATSAPP SUDAH SIAP✅ -- BY RNA!");
    } else if (connection === "close") {
      console.log("Koneksi terputus, mencoba untuk menyambung kembali...");
      await connectWhatsapp();
    } else if (qr) {
      qrcode.generate(qr, { small: true }, (code) => {
        console.log("QR Code untuk otentikasi:\n", code);
      });
    }
  });

  socket.ev.on("messages.upsert", async ({ messages }) => {
    const chat = messages[0];
    const number = chat.key.remoteJid.split("@")[0];
    const sender = chat.pushName || "Tidak Diketahui";
    const pesan =
      (
        chat.message?.extendedTextMessage?.text ??
        chat.message?.ephemeralMessage?.message?.extendedTextMessage?.text ??
        chat.message?.conversation
      )?.toLowerCase() || "";

    if (chat.key.fromMe) return;

    console.log("Nomor pengguna:", number);
    console.log("Nama pengirim:", sender);

    await socket.sendMessage(
      chat.key.remoteJid,
      { text: "Hello World" },
      { quoted: chat }
    );
  });
}

connectWhatsapp().catch(console.error);
