const embroideryTab = document.querySelector("#embroidery-tab");
const picturesTab = document.querySelector("#pictures-tab");
const embroideryContent = document.querySelector("#embroidery-content");
const picturesContent = document.querySelector("#pictures-content");

embroideryTab.addEventListener("click", () => {
    if (embroideryTab.classList.contains("active")) return;
    embroideryTab.classList.add("active");
    picturesTab.classList.remove("active");
    embroideryContent.classList.remove("d-none");
    picturesContent.classList.add("d-none");
});

picturesTab.addEventListener("click", () => {
    if (picturesTab.classList.contains("active")) return;
    picturesTab.classList.add("active");
    embroideryTab.classList.remove("active");
    picturesContent.classList.remove("d-none");
    embroideryContent.classList.add("d-none");
});
