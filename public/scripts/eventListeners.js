const EventListeners = () => {
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

  const listenMoreOptionsButton = (event, entityItemLogic) => {
    const button = event.target.closest(".more-options-button");
    if (button) {
      const entityItem = button.closest(".entity-item");
      if (entityItem) {
        const modal = entityItem.querySelector(".more-modal");
        const moreOptionsContainer = entityItem.querySelector("div.absolute");
        entityItemLogic.toggleModal(modal, moreOptionsContainer);
      }
    }
  };

  const listenOpenedModals = (event, entityItemLogic) => {
    document.querySelectorAll(".more-modal.opacity-100").forEach((modal) => {
      const entityItem = modal.closest(".entity-item");
      if (entityItem && !entityItem.contains(event.target)) {
        const moreOptionsContainer = entityItem.querySelector("div.absolute");
        entityItemLogic.toggleModal(modal, moreOptionsContainer);
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

  return {
    listenFileClick,
    listenOpenedRightSidebar,
    listenMoreOptionsButton,
    listenOpenedModals,
    listenVisiblePopupEvents,
    listenCreatePopup,
    listenEditPopup,
    listenDeletePopup,
  };
};

export default EventListeners;
