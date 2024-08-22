require("dotenv").config();
const {
  makeWASocket,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const qrcode = require("qrcode-terminal");

const registeredNumbers = JSON.parse(process.env.REGISTERED_NUMBERS);

const { saveMessage } = require("./controllers/messageController");

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

    if (!registeredNumbers.includes(number)) {
      console.log(
        `Nomor ${number} tidak diizinkan. Pesan tidak akan diproses.`
      );
      return;
    }

    console.log("Nomor pengguna:", number);
    console.log("Nama pengirim:", sender);

    // Simpan pesan ke database //
    await saveMessage(number, sender, pesan);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Kirim pesan balasan //
    await socket.sendMessage(
      chat.key.remoteJid,
      { text: "Pesan telah diterima dan disimpan ke database!" },
      { quoted: chat }
    );
  });
}

connectWhatsapp().catch(console.error);
