// eslint-disable-next-line import/extensions
import DOMMethods, { createPopupDOMObject } from "./utils.js";

const listenVisiblePopupEvents = (popupDOMs) => {
  popupDOMs.forEach(({ popupDOM }) => {
    const { container, popup, inputs, closeButton } = popupDOM;
    closeButton.addEventListener("click", () =>
      DOMMethods.closePopup(container, popup, inputs),
    );

    // Close popup when clicking outside the popup
    container.addEventListener("click", (event) => {
      if (!popup.contains(event.target)) {
        DOMMethods.closePopup(container, popup, inputs);
      }
    });
  });
};

const listenCreatePopup = (popupDOM, entityType) => {
  DOMMethods.updatePopupContent(popupDOM, entityType, "create");
  DOMMethods.openPopup(popupDOM.container, popupDOM.popup, popupDOM.inputs[0]);
};

const listenEditPopup = (event, popupDOMs) => {
  const button = event.target.closest(".edit.open-popup-button");
  if (button) {
    const entityItem = button.closest(".entity-item");
    const { entityType, entityId } = entityItem.dataset;

    const { popupDOM } = popupDOMs.find(
      (item) => item.entityType === entityType,
    );

    DOMMethods.updatePopupContent(popupDOM, entityType, "edit", entityId);
    DOMMethods.openPopup(
      popupDOM.container,
      popupDOM.popup,
      popupDOM.inputs[0],
    );
  }
};

const listenDeletePopup = (event, deletePopup) => {
  const button = event.target.closest(".delete.open-popup-button");
  if (button) {
    const entityItem = button.closest(".entity-item");
    const { entityType, entityId, parentFolderId } = entityItem.dataset;
    const entityName = entityItem.querySelector("#entity-name").textContent;

    DOMMethods.updatePopupContent(
      deletePopup,
      entityType,
      "delete",
      entityId,
      entityName,
      parentFolderId,
    );
    DOMMethods.openPopup(deletePopup.container, deletePopup.popup);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  const folderDOM = createPopupDOMObject("folder");
  const fileDOM = createPopupDOMObject("file");
  const deletePopup = createPopupDOMObject(null, true);

  const popupDOMs = [
    {
      popupDOM: folderDOM,
      entityType: "folder",
    },
    {
      popupDOM: fileDOM,
      entityType: "file",
    },
  ];

  listenVisiblePopupEvents([...popupDOMs, { popupDOM: deletePopup }]);

  popupDOMs.forEach(({ popupDOM, entityType }) => {
    popupDOM.openPopupButton.addEventListener("click", () => {
      listenCreatePopup(popupDOM, entityType);
    });
  });

  document.addEventListener("click", (event) => {
    listenEditPopup(event, popupDOMs);
    listenDeletePopup(event, deletePopup);
  });

  document.addEventListener("click", (event) => {
    // Handle more-options-button click
    const button = event.target.closest(".more-options-button");
    if (button) {
      const entityItem = button.closest(".entity-item");
      if (entityItem) {
        const modal = entityItem.querySelector(".more-modal");
        const entityContainer = entityItem.querySelector(".entity-container");
        const moreOptionsContainer = entityItem.querySelector("div.absolute");
        DOMMethods.toggleModal(modal, entityContainer, moreOptionsContainer);
      }
      return;
    }

    // Close open modals if clicking outside
    document.querySelectorAll(".more-modal.opacity-100").forEach((modal) => {
      const entityItem = modal.closest(".entity-item");
      if (entityItem && !entityItem.contains(event.target)) {
        const entityContainer = entityItem.querySelector(".entity-container");
        const moreOptionsContainer = entityItem.querySelector("div.absolute");
        DOMMethods.toggleModal(modal, entityContainer, moreOptionsContainer);
      }
    });
  });
});
