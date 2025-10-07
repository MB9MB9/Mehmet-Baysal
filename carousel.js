//JSON dosyasında ki URL lerin bazırları direkt ürüne yönlendirmek yerine arama sayfasına yönlendiriyor. URL yi değiştirmek yerine dosyada ki yapıya göre yönlendirme yaptım.
(() => {
  const self = {
    STORAGE_KEY_PRODUCTS: "ebkProducts",
    STORAGE_KEY_FAVS: "ebkFavorites",
    PRODUCT_JSON_URL:
      "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json",
      //user story beğenebileceğinizi düşündüklerimiz
    TITLE: "Beğenebileceğinizi düşündüklerimiz",
    heartEmpty:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23ff7a00' stroke-width='2' viewBox='0 0 24 24'><path d='M12 21s-6-4.35-9-7.73C-1 8.27 2.5 2 8 2c2.53 0 4 1.5 4 1.5S13.47 2 16 2c5.5 0 9 6.27 5 11.27C18 16.65 12 21 12 21z'/></svg>",
    heartFilled:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='%23ff7a00' stroke='%23ff7a00' stroke-width='0' viewBox='0 0 24 24'><path d='M12 21s-6-4.35-9-7.73C-1 8.27 2.5 2 8 2c2.53 0 4 1.5 4 1.5S13.47 2 16 2c5.5 0 9 6.27 5 11.27C18 16.65 12 21 12 21z'/></svg>",
    products: [],
  };
// ebebek anasayfa dışında çalıştırmak istersen wrong page çıktısı alırsın
  const init = async() => {
    if (location.pathname !==  "/" &&  location.pathname !== "") {
      console.log("wrong page");
      return;}
      
    const old = document.getElementById("ebk-carousel");
    if (old) old.remove();

    await self.fetchingProducts();
    self.buildHTML();
    self.buildCSS();
  };
// fetching
  self.fetchingProducts = async () => {
    const cached =  localStorage.getItem(self.STORAGE_KEY_PRODUCTS);
    if(cached) {
      self.products = JSON.parse(cached);
      return;}


    const res = await fetch(self.PRODUCT_JSON_URL);
    const data =  await res.json();
    self.products = data;
    localStorage.setItem(self.STORAGE_KEY_PRODUCTS,JSON.stringify(data));};


  self.buildHTML = () => {
    const favs = JSON.parse(localStorage.getItem(self.STORAGE_KEY_FAVS) || "[]");
//ürünlerin(cards) yapısı
    const cardsHTML  = self.products
      .map( (p) => {
        //sadece indirim olan ürünleri gösteriyorum. Zam almış ürünün eski fiyatını göstermiyorum
        const discount = p.original_price > p.price
            ? Math.round(((p.original_price - p.price) / p.original_price) * 100): 0;
        const isFav = favs.includes(String(p.id));
        return `

        <div class="carousel-card" data-id="${p.id}" onclick="window.open('${p.url}', '_blank')">
          <div class="heart-btn">
            <img src="${isFav ? self.heartFilled : self.heartEmpty}" alt="fav" /></div> 
          <div class="img-wrap">
            <img src="${p.img}" alt="${p.name}" /></div>
          <div class="info">
            <div class="name">${p.name}</div>
            <div class="price-row">
              <span class="price">${p.price.toFixed(2)}₺</span>
              ${discount > 0
                  ? `<span class="original">${p.original_price.toFixed(
                      2
                    )}₺</span><span class="discount">-${discount}%</span>`
                  : ""
              }
            </div>
            <button class="add-btn" onclick="event.stopPropagation(); alert('${p.name} sepete eklendi (örnek)')">Sepete Ekle</button>
          </div>
        </div>
      `; })
      .join("");

    const html = `
      <section id="ebk-carousel">
        <h2 class="carousel-title">${self.TITLE}</h2>
        <div class="carousel-container">
          <button class="arrow left">&#10094;</button>
          <div class="carousel-track">
            ${cardsHTML}
          </div>
          <button class="arrow right">&#10095;</button>
        </div>
      </section>`;

    const main = document.querySelector("main") || document.body;
    main.insertAdjacentHTML("afterbegin", html);

    const track = document.querySelector("#ebk-carousel .carousel-track");
    document
      .querySelector("#ebk-carousel .arrow.left")
      .addEventListener("click", () => {
        track.scrollBy({ left: -track.offsetWidth, behavior: "smooth" });
      });
    document
      .querySelector("#ebk-carousel .arrow.right")
      .addEventListener("click", () => {
        track.scrollBy({ left: track.offsetWidth, behavior: "smooth" });
      });

    // Kalpler için event
    document.querySelectorAll("#ebk-carousel .heart-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const card = e.target.closest(".carousel-card");
        const id = card.dataset.id.toString();
        let favs = JSON.parse(localStorage.getItem(self.STORAGE_KEY_FAVS) || "[]");
        const isFav = favs.includes(id);
        const img = btn.querySelector("img");

        if (isFav) {
          favs = favs.filter((x) => x !== id);
          img.src = self.heartEmpty;
        } else {
          favs.push(id);
          img.src = self.heartFilled;
        }
        localStorage.setItem(self.STORAGE_KEY_FAVS, JSON.stringify(favs));
      });
    });
  };

  self.buildCSS = () => {
    const css = `
      #ebk-carousel { 
        padding: 20px; 
        font-family: Arial, sans-serif; 
        max-width: 1200px; 
        margin: 20px auto; 
        position: relative; 
      }/* Başlık( beğenebileceğinizi düşündüklerimiz)*/
      #ebk-carousel .carousel-title { 
        font-size: 22px; 
        font-weight: bold; 
        margin: 0 0 8px; 
        background-color: #fff8dc; 
        padding: 12px 20px; 
        border-radius: 10px; 
        display: block; 
        width: 100%; 
        box-sizing: border-box; 
      }
      #ebk-carousel .carousel-container { position: relative; overflow: hidden; }
      #ebk-carousel .carousel-track {
        display: flex; gap: 15px;
        overflow-x: auto; scroll-behavior: smooth;
      }
      #ebk-carousel .carousel-card {
        flex: 0 0 calc(20% - 12px);
        border: 1px solid #eee;
        border-radius: 10px;
        padding: 10px;
        background: #fff;
        cursor: pointer;
        position: relative;
        transition: transform 0.2s ease;
      }
      #ebk-carousel .carousel-card:hover { transform: scale(1.02); }
      #ebk-carousel .img-wrap { text-align: center; }
      #ebk-carousel .img-wrap img { width: 100%; height: auto; border-radius: 8px; object-fit: contain; }
      #ebk-carousel .info { margin-top: 10px; }
      #ebk-carousel .name { font-size: 14px; height: 40px; overflow: hidden; }
      #ebk-carousel .price-row { margin-top: 5px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
      #ebk-carousel .price { font-weight: bold; color: #000; }
      #ebk-carousel .original { text-decoration: line-through; color: #999; font-size: 13px; }
      #ebk-carousel .discount { background: #ffefe5; color: #ff7a00; font-weight: bold; font-size: 12px; padding: 2px 6px; border-radius: 8px; }
      #ebk-carousel .add-btn {
        margin-top: 8px;
        width: 100%;
        background: #ff7a00;
        border: none;
        color: #fff;
        padding: 6px 0;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
      }
      #ebk-carousel .heart-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: #fff;
        border-radius: 50%;
        padding: 4px;
        z-index: 5;
        box-shadow: 0 0 4px rgba(0,0,0,0.1);
      }
      #ebk-carousel .heart-btn img { width: 24px; height: 24px; }
      #ebk-carousel .arrow {
        position: absolute;
        top: 45%;
        transform: translateY(-50%);
        background: rgba(255,255,255,0.95);
        border: none;
        font-size: 20px;
        cursor: pointer;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        z-index: 10;
      }
      #ebk-carousel .arrow.left { left: 6px; }
      #ebk-carousel .arrow.right { right: 6px; }
      @media(max-width:768px){ 
        #ebk-carousel .carousel-card { flex: 0 0 45%; } 
        #ebk-carousel .arrow { font-size: 18px; width: 28px; height: 28px; }
      }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }; 
  init();
})();
