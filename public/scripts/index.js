import onFormSubmit from "./fileInputHandler.js";
import DOMMethods, { createPopupDOMObject } from "./utils.js";

const listenFileClick = (event) => {
  DOMMethods.handleEntityItemClickStylings(event);

  const targetEntityItem = event.target.closest(".entity-item");
  const element = event.target;
  if (
    !targetEntityItem ||
    element.closest(".more-options-button") ||
    element.closest(".more-modal")
  ) {
    return;
  }
  DOMMethods.openFileDetails(targetEntityItem);
};

const listenOpenedRightSidebar = () => {
  const rightSidebar = document.getElementById("right-sidebar");
  const closeButton = rightSidebar.querySelector(".close-button");
  closeButton.addEventListener("click", () => {
    if (rightSidebar.classList.contains("hidden")) return;
    rightSidebar.classList.remove("block");
    rightSidebar.classList.add("hidden");
  });
};

const listenMoreOptionsButton = (event) => {
  const button = event.target.closest(".more-options-button");
  if (button) {
    const entityItem = button.closest(".entity-item");
    if (entityItem) {
      const modal = entityItem.querySelector(".more-modal");
      const entityContainer = entityItem.querySelector(".entity-container");
      const moreOptionsContainer = entityItem.querySelector("div.absolute");
      DOMMethods.toggleModal(modal, entityContainer, moreOptionsContainer);
    }
  }
};

const listenOpenedModals = (event) => {
  document.querySelectorAll(".more-modal.opacity-100").forEach((modal) => {
    const entityItem = modal.closest(".entity-item");
    if (entityItem && !entityItem.contains(event.target)) {
      const entityContainer = entityItem.querySelector(".entity-container");
      const moreOptionsContainer = entityItem.querySelector("div.absolute");
      DOMMethods.toggleModal(modal, entityContainer, moreOptionsContainer);
    }
  });
};

const listenVisiblePopupEvents = (popupDOMs) => {
  popupDOMs.forEach((popupDOM) => {
    const { container, popup, inputs, hiddableContainer, closeButton } =
      popupDOM;
    closeButton.addEventListener("click", () =>
      DOMMethods.closePopup(container, popup, inputs, hiddableContainer),
    );

    // Close popup when clicking outside the popup
    container.addEventListener("click", (event) => {
      if (!popup.contains(event.target)) {
        DOMMethods.closePopup(container, popup, inputs, hiddableContainer);
      }
    });
  });
};

const listenCreatePopup = (popupDOM) => {
  DOMMethods.updatePopupContent(popupDOM, "create");
  const { container, popup, inputs, fileInputInfos, hiddableContainer } =
    popupDOM;

  DOMMethods.openPopup(
    container,
    popup,
    inputs,
    fileInputInfos,
    hiddableContainer,
    true,
  );
};

const listenEditPopup = (event, popupDOMs) => {
  const button = event.target.closest(".edit.open-popup-button");
  if (button) {
    const entityItem = button.closest(".entity-item");

    const { entityFile, entityType } = entityItem.dataset;
    const parsedEntityObject = JSON.parse(entityFile);

    const entityName = entityItem.querySelector("#entity-name").textContent;

    const popupDOM = popupDOMs.find((item) => item.entityType === entityType);
    DOMMethods.updatePopupContent(
      popupDOM,
      "edit",
      parsedEntityObject.entityId,
      entityName,
    );

    const { container, inputs, popup, fileInputInfos, hiddableContainer } =
      popupDOM;
    DOMMethods.openPopup(
      container,
      popup,
      inputs,
      fileInputInfos,
      hiddableContainer,
    );
  }
};

const listenDeletePopup = (event, deletePopup) => {
  const button = event.target.closest(".delete.open-popup-button");
  if (button) {
    const entityItem = button.closest(".entity-item");
    const { entityFile } = entityItem.dataset;
    const parsedEntityObject = JSON.parse(entityFile);

    // the entityType is dependant of the entity being deleted
    // which is the reason why we need to set it here based
    // on the currently deleting entity
    deletePopup.entityType = parsedEntityObject.entityType;

    const entityName = entityItem.querySelector("#entity-name").textContent;

    DOMMethods.updatePopupContent(
      deletePopup,
      "delete",
      parsedEntityObject.entityId,
      entityName,
      parsedEntityObject.parentFolderId,
    );
    DOMMethods.openPopup(deletePopup.container, deletePopup.popup);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  const folderDOM = createPopupDOMObject("folder");
  const fileDOM = createPopupDOMObject("file");
  const deletePopup = createPopupDOMObject(null, true);

  const popupDOMs = [folderDOM, fileDOM, deletePopup];
  const entityRelatedPopupDOMs = popupDOMs.slice(0, 2);

  listenVisiblePopupEvents(popupDOMs);
  listenOpenedRightSidebar();

  entityRelatedPopupDOMs.forEach((popupDOM) => {
    popupDOM.openPopupButton.addEventListener("click", () => {
      listenCreatePopup(popupDOM);
    });
  });

  fileDOM.popup.addEventListener("submit", (event) => {
    const submitButton = event.submitter;
    const { crudType } = submitButton.dataset;

    if (crudType !== "edit") onFormSubmit(event, fileDOM);
  });

  document.addEventListener("click", (event) => {
    listenEditPopup(event, entityRelatedPopupDOMs);
    listenDeletePopup(event, deletePopup);

    listenFileClick(event);
    listenMoreOptionsButton(event);

    // Close open modals if clicking outside
    listenOpenedModals(event);
  });
});
