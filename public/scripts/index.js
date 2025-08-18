// eslint-disable-next-line import/extensions
import DOMMethods, { createEntityDOMObject } from "./utils.js";

const createAndEditRelated = (folder, file) => {
  [folder, file].forEach(
    ({ container, popup, inputs, openPopupButton, closeButton }) => {
      openPopupButton.addEventListener("click", (event) => {
        const button = event.target.closest(".open-popup-button");
        if (button) {
          const { entityType } = button.dataset;
          const entity = entityType === "folder" ? folder : file;

          DOMMethods.updatePopupContent(entity, entityType, true);
          DOMMethods.openPopup(container, popup, inputs[0]);
        }
      });

      closeButton.addEventListener("click", () =>
        DOMMethods.closePopup(container, popup, inputs),
      );

      // Close popup when clicking outside the popup
      container.addEventListener("click", (event) => {
        if (!popup.contains(event.target)) {
          DOMMethods.closePopup(container, popup, inputs);
        }
      });
    },
  );

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".edit-button");
    if (button) {
      const entityItem = button.closest(".entity-item");
      const { entityType } = entityItem.dataset;

      const entity = entityType === "folder" ? folder : file;
      DOMMethods.updatePopupContent(entity, entityType, false);
      DOMMethods.openPopup(entity.container, entity.popup, entity.inputs[0]);
    }
  });
};

window.addEventListener("DOMContentLoaded", () => {
  const folder = createEntityDOMObject("folder");
  const file = createEntityDOMObject("file");

  createAndEditRelated(folder, file);

  document.addEventListener("click", (event) => {
    // Handle more-options-button click
    const button = event.target.closest(".more-options-button");
    if (button) {
      const entityItem = button.closest(".entity-item");
      if (entityItem) {
        const modal = entityItem.querySelector(".more-modal");
        const entityLink = entityItem.querySelector(".entity-link");
        const moreOptionsContainer = entityItem.querySelector("div.absolute");
        DOMMethods.toggleModal(modal, entityLink, moreOptionsContainer);
      }
      return;
    }

    // Close open modals if clicking outside
    document.querySelectorAll(".more-modal.opacity-100").forEach((modal) => {
      const entityItem = modal.closest(".entity-item");
      if (entityItem && !entityItem.contains(event.target)) {
        const entityLink = entityItem.querySelector(".entity-link");
        const moreOptionsContainer = entityItem.querySelector("div.absolute");
        DOMMethods.toggleModal(modal, entityLink, moreOptionsContainer);
      }
    });
  });
});
