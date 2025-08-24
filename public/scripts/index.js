import PopupLogic from "./popupLogic.js";
import FileDetailsLogic from "./fileDetailsLogic.js";
import createPopupDOMObject from "./popupFactory.js";
import EventListeners from "./eventListeners.js";
import EntityItemLogic from "./entityItemLogic.js";

window.addEventListener("DOMContentLoaded", () => {
  const folderDOM = createPopupDOMObject("folder");
  const fileDOM = createPopupDOMObject("file");
  const deletePopup = createPopupDOMObject("deletion");

  const fileDetailsLogic = FileDetailsLogic();
  const popupLogic = PopupLogic();
  const eventListeners = EventListeners();
  const entityItemLogic = EntityItemLogic();

  let errorPopup;
  if (document.querySelector(".error.popup-container")) {
    errorPopup = createPopupDOMObject("error");
  }

  const popupDOMs = [folderDOM, fileDOM, deletePopup];
  if (errorPopup) popupDOMs.push(errorPopup);

  const entityRelatedPopupDOMs = popupDOMs.slice(0, 2);

  eventListeners.listenVisiblePopupEvents(popupLogic, popupDOMs);
  eventListeners.listenOpenedRightSidebar();

  fileDOM.popup.addEventListener("submit", (e) => {
    const { popup, inputs, submitButton, closeButton } = fileDOM;
    popupLogic.onFilePopupSubmit(e, popup, inputs, submitButton, closeButton);
  });

  entityRelatedPopupDOMs.forEach((popupDOM) => {
    popupDOM.openPopupButton.addEventListener("click", () => {
      eventListeners.listenCreatePopup(popupLogic, popupDOM);
    });
  });

  document.addEventListener("click", (event) => {
    eventListeners.listenEditPopup(event, popupLogic, entityRelatedPopupDOMs);
    eventListeners.listenDeletePopup(event, popupLogic, deletePopup);
    entityItemLogic.handleEntityItemClickStylings(event);

    const entityItem = event.target.closest(".entity-item");
    if (entityItem) {
      const { entityType } = entityItem.dataset;
      if (entityType === "file")
        eventListeners.listenFileClick(event, fileDetailsLogic);
    }

    eventListeners.listenMoreOptionsButton(event, entityItemLogic);

    // Close open modals if clicking outside
    eventListeners.listenOpenedModals(event, entityItemLogic);
  });
});
