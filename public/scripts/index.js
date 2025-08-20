// eslint-disable-next-line import/extensions
import DOMMethods, { createPopupDOMObject } from "./utils.js";

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

  const [firstInput] = Object.values(popupDOM.inputs);
  const { container, popup, hiddableContainer } = popupDOM;

  DOMMethods.openPopup(container, popup, firstInput, hiddableContainer, true);
};

const listenEditPopup = (event, popupDOMs) => {
  const button = event.target.closest(".edit.open-popup-button");
  if (button) {
    const entityItem = button.closest(".entity-item");
    const { entityType, entityId } = entityItem.dataset;
    const entityName = entityItem.querySelector("#entity-name").textContent;

    const popupDOM = popupDOMs.find((item) => item.entityType === entityType);
    DOMMethods.updatePopupContent(popupDOM, "edit", entityId, entityName);

    const [firstInput] = Object.values(popupDOM.inputs);
    const { container, popup, hiddableContainer } = popupDOM;

    DOMMethods.openPopup(container, popup, firstInput, hiddableContainer);
  }
};

const listenDeletePopup = (event, deletePopup) => {
  const button = event.target.closest(".delete.open-popup-button");
  if (button) {
    const entityItem = button.closest(".entity-item");
    const { entityType, entityId, parentFolderId } = entityItem.dataset;

    // the entityType is dependant of the entity being deleted
    // which is the reason why we need to set it here based
    // on the currently deleting entity
    deletePopup.entityType = entityType;

    const entityName = entityItem.querySelector("#entity-name").textContent;

    DOMMethods.updatePopupContent(
      deletePopup,
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

  const popupDOMs = [folderDOM, fileDOM, deletePopup];
  const entityRelatedPopupDOMs = popupDOMs.slice(0, 2);

  listenVisiblePopupEvents(popupDOMs);
  DOMMethods.listenOpenedRightSidebar();

  entityRelatedPopupDOMs.forEach((popupDOM) => {
    popupDOM.openPopupButton.addEventListener("click", () => {
      listenCreatePopup(popupDOM);
    });
  });

  document.addEventListener("click", (event) => {
    listenEditPopup(event, entityRelatedPopupDOMs);
    listenDeletePopup(event, deletePopup);

    DOMMethods.listenFileClick(event);
    DOMMethods.listenMoreOptionsButton(event);

    // Close open modals if clicking outside
    DOMMethods.listenOpenedModals(event);
  });
});
