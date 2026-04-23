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
const closeNewFolderDialog = document.querySelector(".add-folder-dialog .close-dialog-button");

addNewFolderButton?.addEventListener("click", () => {
  addNewFolderDialog.showModal();
})

closeNewFolderDialog?.addEventListener("click", () => {
  addNewFolderDialog.close();
});

class CustomDropDownMenu {
  constructor({
    triggerElementID,
    actionItemArray,
    height,
    width,
    logEvent,
  }) {
    this.triggerElementID = triggerElementID;
    this.actionItemArray = actionItemArray;
    this.height = parseInt(height.slice(0, -2));
    this.width = parseInt(width.slice(0, -2));
    this.isOpen = false;
    this.logEvent = logEvent;
  }
  #calculatePosition() {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    this.triggerElementRect = this.triggerElement.getBoundingClientRect();

    const triggerPositionX =
      this.triggerElementRect.left + this.triggerElementRect.width / 2;
    const triggerPositionY =
      this.triggerElementRect.top + this.triggerElementRect.height / 2;

    let menuPositionX = null;
    let menuPositionY = null;

    if (windowWidth - triggerPositionX > this.width + 16) {
      menuPositionX = triggerPositionX + 16;
    } else {
      menuPositionX = windowWidth - this.width - 16;
    }

    if (windowHeight - triggerPositionY > this.height + 16) {
      menuPositionY = triggerPositionY + 16;
    } else {
      menuPositionY = windowHeight - this.height - 16;
    }

    menuPositionX = Math.ceil(menuPositionX);
    menuPositionY = Math.ceil(menuPositionY);

    return { menuPositionX, menuPositionY };
  }
  setEventListeners() {
    this.menuElement = document.createElement("div");
    this.triggerElement = document.querySelector(`#${this.triggerElementID}`);

    this.triggerElement.addEventListener("click", (event) => {
      if (this.logEvent == true) console.log(event.target);
      if (this.isOpen == false) {
        this.isOpen = true;
        this.render();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        !this.menuElement.contains(event.target) &&
        this.isOpen == true &&
        !this.triggerElement.contains(event.target)
      ) {
        this.close();
      }
    });
  }
  render() {
    if (this.logEvent == true)
      console.log("Opening Menu of Title: ", this.menuTitle);

    const { menuPositionX, menuPositionY } = this.#calculatePosition();

    // for user's custom styling, target this class
    this.menuElement.classList.add("mycdm-menu-card");

    this.menuElement.style.position = "fixed";
    this.menuElement.style.height = `${this.height}px`;
    this.menuElement.style.width = `${this.width}px`;
    this.menuElement.style.left = `${menuPositionX}px`;
    this.menuElement.style.top = `${menuPositionY}px`;
    this.menuElement.style.overflow = "hidden";

    this.menuElement.classList.add("mycdm-border-1", "mycdm-border-gray");
    this.menuElement.classList.add("mycdm-bg-light", "mycdm-rounded-md");
    this.menuElement.classList.add("mycdm-shadow");
    this.menuElement.classList.add("mycdm-flex", "mycdm-flex-col");

    this.menuElement.innerHTML = /* html */ `
            <div class="mycdm-action-group">
            </div>
        `;

    // target mycdm-menu-title for custom styling of menu title
    // target mycdm-action-group for custom styling of the action-group

    const actionGroup = this.menuElement.querySelector(".mycdm-action-group");
    actionGroup.style.overflow = "auto";
    this.actionItemArray.forEach((actionItem) => {
      const actionItemElement = document.createElement("div");

      // target mycdm-action-item for custom styling
      actionItemElement.classList.add("mycdm-action-item");

      actionItemElement.classList.add(
        "mycdm-px-4",
        "mycdm-py-2-5",
        "mycdm-mt-2",
      );
      actionItemElement.classList.add("mycdm-hover-bg-medium");
      actionItemElement.classList.add("mycdm-active-bg-dark-medium");

      actionItemElement.style.userSelect = "none";
      actionItemElement.innerHTML = /* html */ `
                <div class="mycdm-flex-row">
                <img src="${actionItem.actionIconSrc}">
                 ${actionItem.actionName}
                </div>
            `;
      actionItemElement.addEventListener("click", () => {
        actionItem.actionFunction();
        this.close();
      });
      actionGroup.appendChild(actionItemElement);
    });

    document.body.appendChild(this.menuElement);


    this.menuElement.classList.remove("mycdm-fade-out");
    this.menuElement.classList.add("mycdm-fade-in");
  }
  close() {
    if (this.logEvent == true) {
      console.log("Closing Menu of Title: ", this.menuTitle);
    }
    this.menuElement.classList.remove("mycdm-fade-in");
    this.menuElement.classList.add("mycdm-fade-out");
    setTimeout(() => {
      this.menuElement.remove();
      this.isOpen = false;
    }, 500);
  }
}

class ActionItem {
  constructor(actionName, actionFunction, actionIconSrc) {
    this.actionName = actionName;
    this.actionFunction = actionFunction;
    this.actionIconSrc = actionIconSrc;
  }
}

document?.querySelectorAll(".folder-menu-button")
  .forEach(button => {
    const folderId = button.dataset.folderId;
    const folderName = button.dataset.folderName;
    const folderShareId = button.dataset.folderShareId;
    const folderShareExpiresAt = button.dataset.folderShareExpiresAt;

    new CustomDropDownMenu({
      triggerElementID: `folder-menu-${folderId}`,
      actionItemArray: [
        new ActionItem("Share", () => {
          openShareFolderDialog(folderName, folderId, folderShareId, folderShareExpiresAt);
        }, "/share-icon.svg"),
        new ActionItem("Edit", () => {
          openEditFolderDialog(folderName, folderId);
        }, "/edit-icon.svg"),
        new ActionItem("Delete", () => {
          openDeleteFolderDialog(folderName, folderId);
        }, "/delete-icon.svg"),
      ],
      height: "160px",
      width: "140px",
    }).setEventListeners();
  });

// edit form

const editFolderDialog = document.querySelector(".edit-folder-dialog");

function openEditFolderDialog(selectedFolderName, selectedFolderID) {
  const formElement = document.querySelector(".edit-folder-dialog form");

  formElement.action = `/folder/${selectedFolderID}/edit`;

  const folderNameElement = document.querySelector(".edit-folder-dialog .folder-name");

  folderNameElement.textContent = selectedFolderName;

  const inputField = document.querySelector("#edit-folder-name-input-field");

  inputField.textContent = "";

  editFolderDialog.showModal();
}

const closeEditFolderDialogButton = document.querySelector(".edit-folder-dialog .close-dialog-button");

closeEditFolderDialogButton?.addEventListener("click", () => {
  editFolderDialog.close();

  const inputField = document.querySelector("#edit-folder-name-input-field");

  inputField.value = "";
})

// share form

const shareFolderDialog = document.querySelector(".share-folder-dialog");

function openShareFolderDialog(selectedFolderName, selectedFolderID, folderShareId, folderShareExpiresAt) {
  const formElement = document.querySelector(".share-folder-dialog form");

  formElement.action = `/folder/${selectedFolderID}/share`;

  const folderNameElement = document.querySelector(".share-folder-dialog .folder-name");

  folderNameElement.textContent = selectedFolderName;

  const inputField = document.querySelector("#share-folder-duration-input-field");

  inputField.textContent = "1";

  const otherElements = document.querySelectorAll(".share-folder-dialog .other-elements");

  const copyLinkButton = document.querySelector(".share-folder-dialog .other-elements .primary-button");
  const deleteLinkButton = document.querySelector(".share-folder-dialog .other-elements .secondary-button");

  const expiry = document.querySelector(".share-folder-dialog .expiry");

  if (folderShareId && folderShareExpiresAt) {
    formElement.classList.add("hidden");
    otherElements.forEach(ele => ele.classList.remove("hidden"));

    copyLinkButton.addEventListener("click", () => {
      navigator.clipboard.writeText(window.location.hostname + `/publicshare/folder/${folderShareId}`)
      alert("Folder share link copied to clipboard");
    });

    deleteLinkButton.href = `/folder/${selectedFolderID}/share/delete`;

    const daysLeft = ((new Date(folderShareExpiresAt) - Date.now()) / (1000 * 60 * 60 * 24)).toFixed(1);
    if (daysLeft == 1)
      expiry.textContent = `1 day`;
    else
      expiry.textContent = `${daysLeft} days`
  } else {
    formElement.classList.remove("hidden");
    otherElements.forEach(ele => ele.classList.add("hidden"));
  }

  shareFolderDialog.showModal();
}

const closeShareFolderDialogButton = document.querySelector(".share-folder-dialog .close-dialog-button");

closeShareFolderDialogButton?.addEventListener("click", () => {
  shareFolderDialog.close();

  const inputField = document.querySelector("#share-folder-duration-input-field");

  inputField.value = "1";
})

// delete form

const deleteFolderDialog = document.querySelector(".delete-folder-dialog");

function openDeleteFolderDialog(selectedFolderName, selectedFolderID) {
  const formElement = document.querySelector(".delete-folder-dialog form");

  formElement.action = `/folder/${selectedFolderID}/delete`;

  const folderNameElement = document.querySelector(".delete-folder-dialog .folder-name");

  folderNameElement.textContent = selectedFolderName;

  deleteFolderDialog.showModal();
}

const closeDeleteFolderDialogButton = document.querySelector(".delete-folder-dialog .close-dialog-button");

const deleteDialogCancelButton = document.querySelector("#delete-dialog-cancel-button");

closeDeleteFolderDialogButton?.addEventListener("click", () => {
  deleteFolderDialog.close();
});

deleteDialogCancelButton?.addEventListener("click", () => {
  deleteFolderDialog.close();
});

// converting all dates on screen for client timezone

const dates = document.querySelectorAll("#date");

dates.forEach(date => {
  const universalDateTime = date.textContent;

  const userDateTime = new
    Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(universalDateTime));

  date.textContent = userDateTime;
})

// files section

const addNewFileDialog = document.querySelector(".add-file-dialog");
const closeAddNewFileDialog = document.querySelector(".add-file-dialog .close-dialog-button")
const addNewFileButton = document.querySelector(".files-section .new-button");
const fileField = document.querySelector("#file");
const fileNameInputField = document.querySelector("#file-name-input-field");

addNewFileButton?.addEventListener("click", () => {
  fileField.value = "";
  fileNameInputField.value = "";
  addNewFileDialog.showModal();
});

closeAddNewFileDialog?.addEventListener("click", () => {
  addNewFileDialog.close();
  fileField.value = "";
  fileNameInputField.value = "";
});

fileField?.addEventListener("change", (event) => {

  const file = fileField.files?.[0];

  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    alert("File must be under 10 MB");
    fileField.value = "";
  }

  if (file.name.length > 100) {
    alert("File name must be under 100 characters");
    fileField.value = "";
  }
});


// file menu buttons
document?.querySelectorAll(".file-menu-button")
  .forEach(button => {
    const fileId = button.dataset.fileId;
    const fileName = button.dataset.fileName;
    const fileShareId = button.dataset.fileShareId;
    const fileShareExpiresAt = button.dataset.fileShareExpiresAt;

    new CustomDropDownMenu({
      triggerElementID: `file-menu-${fileId}`,
      actionItemArray: [
        new ActionItem("Share", () => {
          openShareFileDialog(fileName, fileId, fileShareId, fileShareExpiresAt);
        }, "/share-icon.svg"),
        new ActionItem("Edit", () => {
          openEditFileDialog(fileName, fileId);
        }, "/edit-icon.svg"),
        new ActionItem("Delete", () => {
          openDeleteFileDialog(fileName, fileId);
        }, "/delete-icon.svg"),
      ],
      height: "160px",
      width: "140px",
    }).setEventListeners();
  });

// edit file dialog

const editFileDialog = document.querySelector(".edit-file-dialog");

function openEditFileDialog(selectedFileName, selectedFileID) {
  const formElement = document.querySelector(".edit-file-dialog form");

  formElement.action = `/file/${selectedFileID}/edit`;

  const fileNameElement = document.querySelector(".edit-file-dialog .file-name");

  fileNameElement.textContent = selectedFileName;

  const inputField = document.querySelector("#edit-file-name-input-field");

  inputField.textContent = "";

  editFileDialog.showModal();
}

const closeEditFileDialogButton = document.querySelector(".edit-file-dialog .close-dialog-button");

closeEditFileDialogButton?.addEventListener("click", () => {
  editFileDialog.close();

  const inputField = document.querySelector("#edit-file-name-input-field");

  inputField.value = "";
})

// delete file dialog

const deleteFileDialog = document.querySelector(".delete-file-dialog");

function openDeleteFileDialog(selectedFileName, selectedFileID) {
  const formElement = document.querySelector(".delete-file-dialog form");

  formElement.action = `/file/${selectedFileID}/delete`;

  const fileNameElement = document.querySelector(".delete-file-dialog .file-name");

  fileNameElement.textContent = selectedFileName;

  deleteFileDialog.showModal();
}

const closeDeleteFileDialogButton = document.querySelector(".delete-file-dialog .close-dialog-button");

closeDeleteFileDialogButton?.addEventListener("click", () => {
  deleteFileDialog.close();
});

const deleteFileDialogCancelButton = document.querySelector("#delete-file-dialog-cancel-button");

deleteFileDialogCancelButton?.addEventListener("click", () => {
  deleteFileDialog.close();
});

// share file dialog

const shareFileDialog = document.querySelector(".share-file-dialog");

function openShareFileDialog(selectedFileName, selectedFileID, fileShareId, fileShareExpiresAt) {
  const formElement = document.querySelector(".share-file-dialog form");

  formElement.action = `/file/${selectedFileID}/share`;

  const fileNameElement = document.querySelector(".share-file-dialog .file-name");

  fileNameElement.textContent = selectedFileName;

  const inputField = document.querySelector("#share-file-duration-input-field");

  inputField.textContent = "1";

  const otherElements = document.querySelectorAll(".share-file-dialog .other-elements");

  const copyLinkButton = document.querySelector(".share-file-dialog .other-elements .primary-button");
  const deleteLinkForm = document.querySelector(".share-file-dialog #delete-form");

  const expiry = document.querySelector(".share-file-dialog .expiry");

  if (fileShareId && fileShareExpiresAt) {
    formElement.classList.add("hidden");
    otherElements.forEach(ele => ele.classList.remove("hidden"));

    copyLinkButton.addEventListener("click", () => {
      navigator.clipboard.writeText(window.location.hostname + `/publicshare/file/${fileShareId}`)
      alert("File share link copied to clipboard");
    });

    deleteLinkForm.action = `/file/${selectedFileID}/share/delete`;

    const daysLeft = ((new Date(fileShareExpiresAt) - Date.now()) / (1000 * 60 * 60 * 24)).toFixed(1);
    if (daysLeft == 1)
      expiry.textContent = `1 day`;
    else
      expiry.textContent = `${daysLeft} days`
  } else {
    formElement.classList.remove("hidden");
    otherElements.forEach(ele => ele.classList.add("hidden"));
  }

  shareFileDialog.showModal();
}

const closeShareFileDialogButton = document.querySelector(".share-file-dialog .close-dialog-button");

closeShareFileDialogButton?.addEventListener("click", () => {
  shareFileDialog.close();

  const inputField = document.querySelector("#share-file-duration-input-field");

  inputField.value = "1";
})
