
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { getChatResponse } = require("./lib/chat");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mengecek backend
app.get("/", (req, res) => {
  res.json({
    message: "Belibags RAG API is running",
  });
});

// Chatbot API
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Pertanyaan tidak boleh kosong.",
      });
    }

    const result = await getChatResponse(message);

    res.json({
      success: true,
      answer: result.answer,
      products: result.products.map((product) => ({
        name: product.name,
        price: product.price,
        url: product.url,
        image: product.image,
      })),
    });
  } catch (error) {
    console.error("Chat error:", error.message);

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memproses pertanyaan.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Belibags RAG API berjalan di http://localhost:${PORT}`);
});
