const masuk = document.getElementById("masuk");
const pesan = document.getElementById("pesan");

document.addEventListener("DOMContentLoaded", function () {
  const dropdownToggle = document.querySelector(".dropdown-toggle");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  dropdownToggle.addEventListener("click", function () {
    dropdownMenu.classList.toggle("show");
  });

  // Menutup dropdown jika klik di luar area
  window.addEventListener("click", function (event) {
    if (!event.target.matches(".dropdown-toggle") && !event.target.closest(".dropdown-toggle")) {
      if (dropdownMenu.classList.contains("show")) {
        dropdownMenu.classList.remove("show");
      }
    }
  });
});


masuk.addEventListener("click", () => {
  window.location.href = "index.html";
});

pesan.addEventListener("click", () => {
  window.location.href = "index.html";
});
