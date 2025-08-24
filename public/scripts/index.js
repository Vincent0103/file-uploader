import PopupLogic from "./popupLogic.js";
import FileDetailsLogic from "./fileDetailsLogic.js";
import createPopupDOMObject from "./popupFactory.js";
import DOMMethods from "./utils.js";

const listenFileClick = (event, fileDetailsLogic) => {
  const targetEntityItem = event.target.closest(".entity-item");
  const element = event.target;
  if (
    !targetEntityItem ||
    element.closest(".more-options-button") ||
    element.closest(".more-modal")
  ) {
    return;
  }
  fileDetailsLogic.openFileDetails(targetEntityItem);
};

const listenOpenedRightSidebar = () => {
  const rightSidebar = document.getElementById("right-sidebar");
  const closeButton = rightSidebar.querySelector(".close-button");
  closeButton.addEventListener("click", () => {
    if (rightSidebar.classList.contains("hidden")) return;
    rightSidebar.classList.add("hidden");
  });
};

const listenMoreOptionsButton = (event) => {
  const button = event.target.closest(".more-options-button");
  if (button) {
    const entityItem = button.closest(".entity-item");
    if (entityItem) {
      const modal = entityItem.querySelector(".more-modal");
      const moreOptionsContainer = entityItem.querySelector("div.absolute");
      DOMMethods.toggleModal(modal, moreOptionsContainer);
    }
  }
};

const listenOpenedModals = (event) => {
  document.querySelectorAll(".more-modal.opacity-100").forEach((modal) => {
    const entityItem = modal.closest(".entity-item");
    if (entityItem && !entityItem.contains(event.target)) {
      const moreOptionsContainer = entityItem.querySelector("div.absolute");
      DOMMethods.toggleModal(modal, moreOptionsContainer);
    }
  });
};

const listenVisiblePopupEvents = (popupLogic, popupDOMs) => {
  popupDOMs.forEach((popupDOM) => {
    const { container, popup, closeButton } = popupDOM;
    closeButton.addEventListener("click", () =>
      popupLogic.closePopup(popupDOM),
    );

    // Close popup when clicking outside the popup
    container.addEventListener("click", (event) => {
      if (!popup.contains(event.target)) {
        popupLogic.closePopup(popupDOM);
      }
    });
  });
};

const listenCreatePopup = (popupLogic, popupDOM) => {
  popupLogic.updatePopupContent(popupDOM, "create");
  const { fileInputInfos } = popupDOM;

  popupLogic.openPopup(popupDOM, fileInputInfos, true);
};

const listenEditPopup = (event, popupLogic, popupDOMs) => {
  const button = event.target.closest(".edit.open-popup-button");
  if (button) {
    const entityItem = button.closest(".entity-item");

    const { entityId, entityType } = entityItem.dataset;

    const entityName = entityItem.querySelector("#entity-name").textContent;

    const popupDOM = popupDOMs.find((item) => item.entityType === entityType);
    popupLogic.updatePopupContent(popupDOM, "edit", entityId, entityName);

    const { fileInputInfos } = popupDOM;
    popupLogic.openPopup(popupDOM, fileInputInfos, false);
  }
};

const listenDeletePopup = (event, popupLogic, deletePopup) => {
  const button = event.target.closest(".delete.open-popup-button");
  if (button) {
    const entityItem = button.closest(".entity-item");
    const { entityId, entityType, parentFolderId } = entityItem.dataset;

    // the entityType is dependant of the entity being deleted
    // which is the reason why we need to set it here based
    // on the currently deleting entity
    deletePopup.entityType = entityType;

    const entityName = entityItem.querySelector("#entity-name").textContent;

    popupLogic.updatePopupContent(
      deletePopup,
      "delete",
      entityId,
      entityName,
      parentFolderId,
    );
    popupLogic.openPopup(deletePopup);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  const folderDOM = createPopupDOMObject("folder");
  const fileDOM = createPopupDOMObject("file");
  const deletePopup = createPopupDOMObject("deletion");

  const fileDetailsLogic = FileDetailsLogic();
  const popupLogic = PopupLogic();

  let errorPopup;
  if (document.querySelector(".error.popup-container")) {
    errorPopup = createPopupDOMObject("error");
  }

  const popupDOMs = [folderDOM, fileDOM, deletePopup];
  if (errorPopup) popupDOMs.push(errorPopup);

  const entityRelatedPopupDOMs = popupDOMs.slice(0, 2);

  listenVisiblePopupEvents(popupLogic, popupDOMs);
  listenOpenedRightSidebar();

  fileDOM.popup.addEventListener("submit", (e) => {
    const { popup, inputs, submitButton, closeButton } = fileDOM;
    popupLogic.onFilePopupSubmit(e, popup, inputs, submitButton, closeButton);
  });

  entityRelatedPopupDOMs.forEach((popupDOM) => {
    popupDOM.openPopupButton.addEventListener("click", () => {
      listenCreatePopup(popupLogic, popupDOM);
    });
  });

  document.addEventListener("click", (event) => {
    listenEditPopup(event, popupLogic, entityRelatedPopupDOMs);
    listenDeletePopup(event, popupLogic, deletePopup);
    DOMMethods.handleEntityItemClickStylings(event);

    const entityItem = event.target.closest(".entity-item");
    if (entityItem) {
      const { entityType } = entityItem.dataset;
      if (entityType === "file") listenFileClick(event, fileDetailsLogic);
    }

    listenMoreOptionsButton(event);

    // Close open modals if clicking outside
    listenOpenedModals(event);
  });
});
