const header = document.querySelector(".header");

window.onscroll = () => {
  if (window.scrollY > 100) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled")
  }
}