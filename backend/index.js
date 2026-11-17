
require("dotenv").config();

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { getChatResponse } = require("./lib/chat");

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "./.wwebjs_auth",
  }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// Menampilkan QR Code untuk login WhatsApp
client.on("qr", (qr) => {
  console.log("Scan QR Code berikut menggunakan WhatsApp:");
  qrcode.generate(qr, { small: true });
});

// Ketika WhatsApp berhasil terhubung
client.on("ready", () => {
  console.log("Bot WhatsApp Belibags.id siap digunakan!");
});

// Ketika ada pesan masuk
client.on("message", async (msg) => {
  try {
    // Abaikan pesan dari bot sendiri, grup, dan status
    if (
      msg.fromMe ||
      msg.from.endsWith("@g.us") ||
      msg.from === "status@broadcast"
    ) {
      return;
    }

    const message = msg.body?.trim();

    if (!message) return;

    console.log(`Pesan masuk: ${message}`);

    // Proses pesan menggunakan RAG + Groq
    const result = await getChatResponse(message);

    // Kirim jawaban ke pelanggan
    await msg.reply(result.answer);

    console.log("Balasan berhasil dikirim.");
  } catch (error) {
    console.error("WhatsApp bot error:", error.message);

    await msg.reply(
      "Maaf, chatbot sedang mengalami kendala. Silakan coba beberapa saat lagi."
    ).catch(() => {});
  }
});

// Menangani error autentikasi
client.on("auth_failure", (message) => {
  console.error("Autentikasi WhatsApp gagal:", message);
});

// Menangani koneksi terputus
client.on("disconnected", (reason) => {
  console.log("WhatsApp terputus:", reason);
});

// Menjalankan WhatsApp Gateway
client.initialize();
