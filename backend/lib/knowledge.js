
const fs = require("fs");
const path = require("path");

const KNOWLEDGE_PATH = path.join(__dirname, "../knowledge.json");

function getKnowledgeResponse(message) {
  if (!message || typeof message !== "string") {
    return null;
  }

  const knowledge = JSON.parse(
    fs.readFileSync(KNOWLEDGE_PATH, "utf-8")
  );

  const normalized = message.toLowerCase().trim();

  // Periksa apakah pesan cocok dengan jawaban langsung
  if (knowledge.responses?.[normalized]) {
    return knowledge.responses[normalized];
  }

  // Periksa keyword dan alias
  for (const [keyword, target] of Object.entries(
    knowledge.keywords || {}
  )) {
    if (normalized.includes(keyword.toLowerCase())) {
      const response = knowledge.responses?.[target];

      if (response) {
        return response;
      }
    }
  }

  return null;
}

module.exports = { getKnowledgeResponse };
