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

document.querySelectorAll(".folder-menu-button")
  .forEach(button => {
    const folderId = button.dataset.folderId;

    new CustomDropDownMenu({
      triggerElementID: `folder-menu-${folderId}`,
      actionItemArray: [
        new ActionItem("Share", () => {
          console.log(`/folder/${folderId}/share`);
        }, "/share-icon.svg"),
        new ActionItem("Edit", () => {
          console.log(`/folder/${folderId}/edit`);
        }, "/edit-icon.svg"),
        new ActionItem("Delete", () => {
          console.log(`/folder/${folderId}/delete`);
        }, "/delete-icon.svg"),
      ],
      height: "160px",
      width: "140px",
    }).setEventListeners();
  })


