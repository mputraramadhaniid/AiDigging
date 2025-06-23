document.addEventListener("DOMContentLoaded", () => {
  const personalBtn = document.getElementById("btn-personal");
  const businessBtn = document.getElementById("btn-business");
  const pricingContainer = document.getElementById("pricing-container");

  // --- DATA UNTUK SETIAP PAKET ---
  // Anda bisa mengubah semua teks, harga, dan fitur di sini
  const plansData = {
    personal: [
      {
        name: "Free",
        price: "$0",
        description: "Jelajahi bagaimana AI dapat membantu Anda dengan tugas sehari-hari.",
        buttonText: "Paket Anda saat ini",
        buttonClass: "cta-disabled",
        isCurrent: true,
        features: [
          "Akses ke PRO-4o mini dan penalaran",
          "Mode suara standar",
          "Data, nyita, nyita, dan web dengan pencarian",
          "Akses terbatas ke PRO-4o dan G4s-mini",
          "Akses terbatas ke unggahan file, analisis data tingkat lanjut, dan pembuatan gambar",
          "Gunakan PRO kustom",
        ],
        footerText: 'Sudah punya paket? <a href="#">Lihat bantuan persiapan</a>',
      },
      {
        name: "Plus",
        price: "$20",
        isPopular: true,
        description: "Tingkatkan produktivitas dan kreativitas dengan akses lebih luas.",
        buttonText: "Dapatkan Plus",
        buttonClass: "cta-primary",
        features: [
          "Semua yang ada di Free",
          "Batasan obrolan untuk pesan, unggahan file, analisis data tingkat lanjut, dan pembuatan gambar",
          "Mode suara standar dan canggih",
          "Akses ke riset mendalam, ragam model penalaran (g4s-mini, o4s-mini-high, dan o3s)",
          "Buat dan gunakan tugas, proyek, dan PRO kustom",
          "Akses terbatas ke pembuatan video Sora",
          "Kesempatan untuk menguji fitur baru",
        ],
        footerText: '<a href="#">Batasan berlaku</a>',
      },
      {
        name: "Pro",
        price: "$200",
        description: "Manfaatkan AiDigging dengan level akses tertinggi.",
        buttonText: "Dapatkan Pro",
        buttonClass: "cta-secondary",
        features: [
          "Semua yang ada di Plus",
          "Akses tidak terbatas ke semua model penalaran dan PRO-4os",
          "Akses tanpa batas ke suara canggih",
          "Akses luas ke riset mendalam, yang melakukan riset online mutakhir",
          "Akses ke pratinjau riset PRO-4.5s dan Operator",
          "Akses ke modus v1 pro, yang menggunakan lebih banyak komputasi",
          "Akses luas ke pembuatan video Sora",
          "Akses ke pratinjau riset agen Codex",
        ],
        footerText: 'Tidak terbatas dengan batasan pencegahan penyalahgunaan. <a href="#">Pelajari selengkapnya</a>',
      },
    ],
    business: [
      // Anda bisa definisikan data untuk paket bisnis di sini
      // Untuk contoh ini, kita gunakan data yang sama tapi harga berbeda
      {
        name: "Business Starter",
        price: "$50",
        description: "Mulai kolaborasi tim dengan kekuatan AI.",
        buttonText: "Mulai dengan Bisnis",
        buttonClass: "cta-primary",
        features: ["Semua fitur Plus", "Manajemen pengguna", "Ruang kerja kolaboratif", "Dukungan prioritas"],
        footerText: '<a href="#">Hubungi sales</a>',
      },
      {
        name: "Enterprise",
        price: "Kustom",
        isPopular: true,
        description: "Skalakan AI di seluruh organisasi Anda dengan keamanan tingkat lanjut.",
        buttonText: "Hubungi Sales",
        buttonClass: "cta-secondary",
        features: ["Semua fitur Business Starter", "Keamanan & kepatuhan tingkat lanjut", "Single Sign-On (SSO)", "Analitik penggunaan", "Kontrol admin tingkat lanjut"],
        footerText: '<a href="#">Pelajari lebih lanjut</a>',
      },
      {
        name: "Enterprise+",
        price: "Kustom+",
        description: "Solusi AI yang dirancang khusus untuk kebutuhan unik Anda.",
        buttonText: "Hubungi Sales",
        buttonClass: "cta-secondary",
        features: ["Semua fitur Enterprise", "Model AI yang di-fine-tune khusus", "Dukungan khusus 24/7", "Onboarding & training"],
        footerText: '<a href="#">Pelajari lebih lanjut</a>',
      },
    ],
  };

  function createFeatureListItem(featureText) {
    return `
            <li>
                <span class="material-icons">check_circle</span>
                <p>${featureText}</p>
            </li>
        `;
  }

  function createPricingCard(plan) {
    // Buat daftar fitur dari array data
    const featuresHTML = plan.features.map(createFeatureListItem).join("");

    // Tentukan kelas CSS tambahan untuk kartu
    const cardClasses = ["pricing-card"];
    if (plan.isPopular) cardClasses.push("pricing-card--popular");
    if (plan.isCurrent) cardClasses.push("pricing-card--current");

    return `
            <div class="${cardClasses.join(" ")}">
                ${plan.isPopular ? '<div class="card-badge">Populer</div>' : ""}
                <div class="card-header">
                    <h2 class="plan-name">${plan.name}</h2>
                    <p class="price">${plan.price}<span>/bulan</span></p>
                    <p class="description">${plan.description}</p>
                </div>
                <div class="card-body">
                    <button class="card-cta ${plan.buttonClass}" ${plan.isCurrent ? "disabled" : ""}>
                        ${plan.buttonText}
                    </button>
                    <ul class="features-list">
                        ${featuresHTML}
                    </ul>
                </div>
                <div class="card-footer">
                    ${plan.footerText}
                </div>
            </div>
        `;
  }

  function renderPlans(planType) {
    // Kosongkan kontainer
    pricingContainer.innerHTML = "";

    // Ambil data yang sesuai ('personal' atau 'business')
    const selectedPlans = plansData[planType];

    // Buat HTML untuk setiap kartu dan gabungkan
    const allCardsHTML = selectedPlans.map(createPricingCard).join("");

    // Masukkan HTML yang sudah jadi ke dalam kontainer
    pricingContainer.innerHTML = allCardsHTML;
  }

  // --- EVENT LISTENERS ---

  personalBtn.addEventListener("click", () => {
    personalBtn.classList.add("active");
    businessBtn.classList.remove("active");
    renderPlans("personal");
  });

  businessBtn.addEventListener("click", () => {
    businessBtn.classList.add("active");
    personalBtn.classList.remove("active");
    renderPlans("business");
  });

  // --- TAMPILAN AWAL ---
  // Saat halaman pertama kali dimuat, tampilkan paket "Pribadi"
  renderPlans("personal");
});
