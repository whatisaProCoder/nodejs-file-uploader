const header = document.querySelector(".header");

window.onscroll = () => {
  if (window.scrollY > 100) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled")
  }
}

// add new folder dialog box

const addNewFolderButton = document.querySelector(".folders-section .new-button")
const addNewFolderDialog = document.querySelector(".add-folder-dialog");
const closeNewFolderDialog = document.querySelector(".close-dialog-button");

addNewFolderButton.addEventListener("click", () => {
  addNewFolderDialog.showModal();
})

closeNewFolderDialog.addEventListener("click", () => {
  addNewFolderDialog.close();
})



