
require("dotenv").config();

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { getChatResponse } = require("./lib/chat");

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "belibags",
  }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("Scan QR berikut menggunakan WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("WhatsApp Belibags berhasil terhubung!");
});

client.on("authenticated", () => {
  console.log("WhatsApp berhasil diautentikasi.");
});

client.on("auth_failure", (message) => {
  console.error("Autentikasi WhatsApp gagal:", message);
});

client.on("disconnected", (reason) => {
  console.log("WhatsApp terputus:", reason);
});

client.on("message", async (message) => {
  try {
    if (message.fromMe || message.isStatus) return;
    if (message.from.endsWith("@g.us")) return;

    const text = message.body?.trim();
    if (!text) return;

    console.log(`Pesan masuk: ${text}`);

    const result = await getChatResponse(text);

    await message.reply(result.answer);

    console.log("Balasan chatbot berhasil dikirim.");
  } catch (error) {
    console.error("WhatsApp chatbot error:", error.message);
    await message.reply(
      "Maaf, sedang ada gangguan. Silakan coba beberapa saat lagi."
    );
  }
});

client.initialize();
