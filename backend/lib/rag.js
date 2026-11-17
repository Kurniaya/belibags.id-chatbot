
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const CSV_PATH = path.join(__dirname, "../../data/products.csv");

function loadProducts() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`File CSV tidak ditemukan: ${CSV_PATH}`);
  }

  const fileContent = fs.readFileSync(CSV_PATH, "utf-8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_quotes: true,
    trim: true,
  });

  return records.map((row, index) => ({
    id: index + 1,
    name: row["whitespace-normal"] || "",
    price: row["font-medium 2"] || "",
    description: row["min-w-0"] || "",
    url: row["contents href"] || "",
    image: row["_image_yazkc_11 src"] || "",
  }));
}

function searchProducts(question, limit = 5) {
  const products = loadProducts();

  const keywords = question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);

  const results = products
    .map((product) => {
      const searchableText =
        `${product.name} ${product.description}`.toLowerCase();

      const score = keywords.reduce(
        (total, keyword) =>
          total + (searchableText.includes(keyword) ? 1 : 0),
        0
      );

      return { ...product, score };
    })
    .filter((product) => product.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return results;
}

module.exports = {
  loadProducts,
  searchProducts,
};
