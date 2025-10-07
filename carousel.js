(() => {
  const self = {
    STORAGE_KEY_PRODUCTS: "ebkProducts",
    STORAGE_KEY_FAVS: "ebkFavorites",
    PRODUCT_JSON_URL:
      "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json",

    heartEmpty:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23ff7a00' stroke-width='2' viewBox='0 0 24 24'><path d='M12 21s-6-4.35-9-7.73C-1 8.27 2.5 2 8 2c2.53 0 4 1.5 4 1.5S13.47 2 16 2c5.5 0 9 6.27 5 11.27C18 16.65 12 21 12 21z'/></svg>",
    heartFilled:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='%23ff7a00' viewBox='0 0 24 24'><path d='M12 21s-6-4.35-9-7.73C-1 8.27 2.5 2 8 2c2.53 0 4 1.5 4 1.5S13.47 2 16 2c5.5 0 9 6.27 5 11.27C18 16.65 12 21 12 21z'/></svg>",

    pick(obj, keys) {
      for (const k of keys) if (obj && obj[k] != null && obj[k] !== "") return obj[k];
      return null;
    },
    numberFrom(v) {
      if (!v) return null;
      if (typeof v === "number") return v;
      const s = String(v)
        .replace(/[^\d.,]/g, "")
        .replace(/\.(?=.*\.)/g, "")
        .replace(",", ".");
      const n = parseFloat(s);
      return isNaN(n) ? null : n;
    },
    formatTRY(n) {
      return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(n);
    },

    async loadProducts() {
      const cached = localStorage.getItem(self.STORAGE_KEY_PRODUCTS);
      if (cached) {
        console.log("📦 LocalStorage'dan ürünler yüklendi");
        return JSON.parse(cached);
      }
      console.log("🌐 Fetch ile ürünler çekiliyor...");
      const res = await fetch(self.PRODUCT_JSON_URL);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.products || [];
      localStorage.setItem(self.STORAGE_KEY_PRODUCTS, JSON.stringify(list));
      return list;
    },

    buildHTML(products) {
      const favSet = new Set(JSON.parse(localStorage.getItem(self.STORAGE_KEY_FAVS)) || []);

      const cardsHTML = products
        .map((p, i) => {
          const id = self.pick(p, ["id", "product_id", "sku"]) ?? String(i + 1);
          const title = self.pick(p, ["title", "name", "product_name"]) ?? "Ürün";
          const img = self.pick(p, ["img", "image", "image_url"]) ?? "";
          const url = self.pick(p, ["url", "link", "href"]) ?? "#";
          const price = self.numberFrom(self.pick(p, ["price", "current_price"]));
          const original = self.numberFrom(
            self.pick(p, ["original", "original_price", "old_price"])
          );

          let percent = null;
          if (original && price && Math.abs(original - price) > 0.01) {
            percent = Math.round(((original - price) / original) * 100);
          }

          const isFav = favSet.has(String(id));

          return `
          <div class="card" data-id="${id}" data-url="${url}">
            <div class="img-wrap">
              <img src="${img}" alt="${title}">
              <button class="fav">
                <img src="${isFav ? self.heartFilled : self.heartEmpty}" alt="favori">
              </button>
            </div>
            <div class="info">
              <div class="title">${title}</div>
              <div class="prices">
                ${
                  price != null ? `<div class="price">${self.formatTRY(price)}</div>` : ""
                }
                ${
                  original != null && Math.abs(original - price) > 0.01
                    ? `<div class="original">${self.formatTRY(original)}</div>`
                    : ""
                }
              </div>
              ${
                percent != null && percent > 0
                  ? `<div class="save">%${percent} indirim</div>`
                  : ""
              }
              <button class="add">Sepete Ekle</button>
            </div>
          </div>`;
        })
        .join("");

      const html = `
        <section id="carousel-section">
          <div class="carousel-hero"><h2>Beğenebileceğinizi Düşündüklerimiz</h2></div>
          <div class="carousel">
            <button class="arrow left">‹</button>
            <div class="track">${cardsHTML}</div>
            <button class="arrow right">›</button>
          </div>
        </section>
      `;
      (document.querySelector("main") || document.body).insertAdjacentHTML("afterbegin", html);
    },

    buildCSS() {
      const css = `
        #carousel-section { font-family: system-ui,sans-serif; margin: 20px auto; max-width: 1200px; }
        .carousel-hero { padding: 16px; background: #fff4e9; border-radius:12px; margin-bottom:12px; }
        .carousel { position:relative; overflow:hidden; border:1px solid #eee; border-radius:16px; background:#fff; padding:20px 10px; }
        .track { display:flex; gap:16px; transition: transform .4s ease; }
        .card { flex:0 0 calc(20% - 16px); border:1px solid #eee; border-radius:12px; background:#fff; display:flex; flex-direction:column; cursor:pointer; transition: all .25s ease; }
        .card:hover { transform: translateY(-6px); border-color:#ff7a00; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .img-wrap { position:relative; aspect-ratio:1/1; background:#fafafa; display:flex; align-items:center; justify-content:center; border-bottom:1px solid #eee; }
        .img-wrap img { max-width:100%; max-height:100%; object-fit:contain; }
        .fav { position:absolute; top:8px; right:8px; border:none; background:transparent; padding:0; cursor:pointer; }
        .fav img { width:26px; height:26px; object-fit:contain; }
        .info { padding:10px; flex:1; display:flex; flex-direction:column; justify-content:space-between; }
        .title { font-size:14px; font-weight:600; margin-bottom:8px; line-height:1.4em; white-space:normal; overflow:visible; height:auto; }
        .prices { display:flex; gap:8px; align-items:center; margin-bottom:6px; }
        .price { font-weight:700; font-size:16px; }
        .original { font-size:13px; color:#999; text-decoration:line-through; }
        .save { font-size:13px; color:#c2410c; font-weight:600; margin-bottom:8px; }
        .add { border:none; background:#ff7a00; color:#fff; border-radius:8px; padding:8px 0; cursor:pointer; }
        .arrow { position:absolute; top:50%; transform:translateY(-50%); background:#fff; border:1px solid #ddd; border-radius:50%; width:40px; height:40px; font-size:22px; cursor:pointer; z-index:5; }
        .arrow.left { left:5px; }
        .arrow.right { right:5px; }
      `;
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
    },

    setEvents() {
      const track = document.querySelector(".track");
      const cards = document.querySelectorAll(".card");
      const total = cards.length;
      const cardW = cards[0].getBoundingClientRect().width;
      const gapPx = parseFloat(getComputedStyle(track).gap || "16");
      const step = cardW + gapPx;
      const maxShift = step * (total - 5);
      let shift = 0;

      const update = () => (track.style.transform = `translateX(-${shift}px)`);

      document.querySelector(".arrow.left").addEventListener("click", () => {
        shift = Math.max(0, shift - step);
        update();
      });
      document.querySelector(".arrow.right").addEventListener("click", () => {
        shift = Math.min(maxShift, shift + step);
        update();
      });

      const favSet = new Set(JSON.parse(localStorage.getItem(self.STORAGE_KEY_FAVS)) || []);
      document.querySelectorAll(".fav").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const card = btn.closest(".card");
          const id = String(card.dataset.id);
          const img = btn.querySelector("img");
          if (favSet.has(id)) {
            favSet.delete(id);
            img.src = self.heartEmpty;
          } else {
            favSet.add(id);
            img.src = self.heartFilled;
          }
          localStorage.setItem(self.STORAGE_KEY_FAVS, JSON.stringify([...favSet]));
        });
      });

      cards.forEach((card) => {
        card.addEventListener("click", () => {
          const url = card.dataset.url;
          if (url && url !== "#") window.open(url, "_blank");
        });
      });
    },

    async init() {
      const products = await self.loadProducts();
      self.buildCSS();
      self.buildHTML(products);
      self.setEvents();
    },
  };

  self.init();
})();

