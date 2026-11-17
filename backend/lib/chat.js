
require("dotenv").config();

const Groq = require("groq-sdk");
const { searchProducts } = require("./rag");
const { getKnowledgeResponse } = require("./knowledge");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function getChatResponse(message) {
  if (!message || typeof message !== "string" || !message.trim()) {
    throw new Error("Pertanyaan tidak boleh kosong.");
  }

  // 1. Periksa FAQ dari knowledge.json
  const knowledgeAnswer = getKnowledgeResponse(message);

  if (knowledgeAnswer) {
    return {
      answer: knowledgeAnswer,
      products: [],
    };
  }

  // 2. Cari produk menggunakan RAG
  const products = searchProducts(
    message,
    Number(process.env.RAG_TOP_K) || 8
  );

  if (products.length === 0) {
    return {
      answer:
        "Maaf, aku belum menemukan produk yang sesuai. Bisa coba gunakan nama atau jenis tas yang lebih spesifik?",
      products: [],
    };
  }

  // 3. Susun konteks produk
  const productContext = products
    .map((product, index) => `
Produk ${index + 1}:
Nama: ${product.name}
Harga: Rp${product.price}
Deskripsi: ${product.description}
Link Shopee: ${product.url}
`)
    .join("\n");

  // 4. Kirim konteks ke Groq
  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: `
Kamu adalah asisten belanja Belibags.id.

Tugasmu:
- Jawab menggunakan bahasa Indonesia yang ramah dan natural.
- Gunakan hanya informasi produk dalam konteks.
- Jangan mengarang harga, ukuran, warna, stok, bahan, atau spesifikasi.
- Jika informasi tidak tersedia, katakan bahwa informasi tersebut belum tercantum.
- Rekomendasikan produk yang paling relevan.
- Cantumkan nama dan harga produk jika tersedia.
- Sertakan link Shopee produk jika relevan.

Data produk:
${productContext}
`,
      },
      {
        role: "user",
        content: message.trim(),
      },
    ],
    temperature: 0.3,
    max_tokens: Number(process.env.GROQ_MAX_TOKENS) || 1500,
  });

  const answer =
    completion.choices[0]?.message?.content ||
    "Maaf, aku belum bisa memberikan jawaban.";

  return {
    answer,
    products,
  };
}

module.exports = { getChatResponse };
