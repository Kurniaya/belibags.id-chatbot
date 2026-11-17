const CSV_PATH = "data/products.csv";
const PRODUCTS_PER_PAGE = 12;

// Nama kolom ini mengikuti hasil scraping Shopee yang diberikan.
const COLUMN = {
  link: "contents href",
  image: "_image_yazkc_11 src",
  name: "whitespace-normal",
  price: "font-medium 2",
  note: "min-w-0"
};

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;

const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");
const resultCount = document.getElementById("result-count");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const emptyState = document.getElementById("empty-state");
const pagination = document.getElementById("pagination");

document.getElementById("current-year").textContent = new Date().getFullYear();

function cleanText(value) {
  return String(value ?? "").trim();
}

function parsePrice(rawPrice) {
  const value = Number(rawPrice);
  if (!Number.isFinite(value)) return 0;

  // Di CSV hasil scraping, harga tampil seperti 59.301 untuk Rp59.301.
  // Jika nilainya desimal di bawah 1000, kalikan 1000 agar menjadi rupiah.
  return value > 0 && value < 1000 ? Math.round(value * 1000) : Math.round(value);
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

function getCategory(name) {
  const text = name.toLowerCase();
  if (text.includes("tote")) return "tote";
  if (text.includes("anak") || text.includes("paud") || text.includes("tk")) return "anak";
  if (text.includes("backpack") || text.includes("ransel")) return "backpack";
  return "lainnya";
}

function categoryLabel(category) {
  const labels = {
    anak: "Tas Anak",
    backpack: "Backpack",
    tote: "Tote Bag",
    lainnya: "Collection"
  };
  return labels[category] || "Collection";
}

function mapCsvRow(row, index) {
  const name = cleanText(row[COLUMN.name]);
  const image = cleanText(row[COLUMN.image]);
  const link = cleanText(row[COLUMN.link]);

  return {
    id: index + 1,
    name,
    image,
    link,
    price: parsePrice(row[COLUMN.price]),
    note: cleanText(row[COLUMN.note]),
    category: getCategory(name)
  };
}

async function loadProducts() {
  try {
    if (typeof Papa === "undefined") {
      throw new Error("Library PapaParse belum berhasil dimuat.");
    }

    Papa.parse(CSV_PATH, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        allProducts = results.data
          .map(mapCsvRow)
          .filter(product => product.name && product.link);

        document.getElementById("total-products").textContent = allProducts.length;
        loadingState.hidden = true;
        applyFilters();
      },
      error: (error) => {
        console.error("Gagal membaca CSV:", error);
        loadingState.hidden = true;
        errorState.hidden = false;
      }
    });
  } catch (error) {
    console.error(error);
    loadingState.hidden = true;
    errorState.hidden = false;
  }
}

function applyFilters() {
  const keyword = searchInput.value.toLowerCase().trim();
  const category = categoryFilter.value;
  const sort = sortSelect.value;

  filteredProducts = allProducts.filter(product => {
    const matchesName = product.name.toLowerCase().includes(keyword);
    const matchesCategory = category === "all" || product.category === category;
    return matchesName && matchesCategory;
  });

  if (sort === "low") filteredProducts.sort((a, b) => a.price - b.price);
  if (sort === "high") filteredProducts.sort((a, b) => b.price - a.price);
  if (sort === "name") filteredProducts.sort((a, b) => a.name.localeCompare(b.name, "id"));

  currentPage = 1;
  renderProducts();
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const imageWrap = document.createElement("div");
  imageWrap.className = "product-image-wrap";

  const image = document.createElement("img");
  image.className = "product-image";
  image.src = product.image;
  image.alt = product.name;
  image.loading = "lazy";
  image.onerror = () => {
    image.removeAttribute("src");
    image.alt = "Gambar produk tidak tersedia";
    imageWrap.classList.add("image-unavailable");
  };

  const tag = document.createElement("span");
  tag.className = "product-tag";
  tag.textContent = "BELIBAGS PICK";

  imageWrap.append(image, tag);

  const info = document.createElement("div");
  info.className = "product-info";

  const category = document.createElement("p");
  category.className = "product-category";
  category.textContent = categoryLabel(product.category);

  const name = document.createElement("h3");
  name.className = "product-name";
  name.textContent = product.name;

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = product.price ? formatRupiah(product.price) : "Harga tidak tersedia";

  const note = document.createElement("p");
  note.className = "product-note";
  note.textContent = product.note;

  const link = document.createElement("a");
  link.className = "product-link";
  link.href = product.link;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View on Shopee ↗";

  info.append(category, name, price);
  if (product.note) info.append(note);
  info.append(link);
  card.append(imageWrap, info);

  return card;
}

function renderProducts() {
  productGrid.innerHTML = "";
  pagination.innerHTML = "";

  const total = filteredProducts.length;
  resultCount.textContent = `${total} produk ditemukan`;
  emptyState.hidden = total !== 0;

  if (total === 0) return;

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const pageProducts = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);

  pageProducts.forEach(product => productGrid.appendChild(createProductCard(product)));
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  if (totalPages <= 1) return;

  const previous = createPageButton("←", currentPage === 1, () => {
    currentPage--;
    renderProducts();
    document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
  });
  pagination.appendChild(previous);

  for (let page = 1; page <= totalPages; page++) {
    // Tampilkan tombol di sekitar halaman aktif agar pagination tidak terlalu panjang.
    if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
      const button = createPageButton(String(page), false, () => {
        currentPage = page;
        renderProducts();
        document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
      });
      if (page === currentPage) button.classList.add("active");
      pagination.appendChild(button);
    } else if (Math.abs(page - currentPage) === 2) {
      const dots = document.createElement("span");
      dots.textContent = "…";
      dots.className = "page-dots";
      pagination.appendChild(dots);
    }
  }

  const next = createPageButton("→", currentPage === totalPages, () => {
    currentPage++;
    renderProducts();
    document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
  });
  pagination.appendChild(next);
}

function createPageButton(label, disabled, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "page-button";
  button.textContent = label;
  button.disabled = disabled;
  button.addEventListener("click", onClick);
  return button;
}

searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);

loadProducts();
// WhatsApp Tokotas
const whatsappNumber = "6283848921874";

const whatsappMessage =
  "Halo, saya tertarik dengan produk Belibags.id. " +
  "Boleh minta informasi mengenai katalog dan pemesanan tas?";

const whatsappButton = document.getElementById("whatsappButton");

if (whatsappButton) {
  whatsappButton.href =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
}