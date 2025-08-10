const toggleModal = (modal, entityLink, moreOptionsContainer) => {
  modal.classList.toggle("opacity-100");
  modal.classList.toggle("pointer-events-auto");
  modal.classList.toggle("opacity-0");
  modal.classList.toggle("pointer-events-none");
  entityLink.classList.toggle("hover:bg-zinc-900");
  entityLink.classList.toggle("bg-zinc-800");
  entityLink.classList.toggle("bg-zinc-900");
  moreOptionsContainer.classList.toggle("opacity-0");
  moreOptionsContainer.classList.toggle("group-hover:opacity-100");
};

const createAndEditRelated = () => {
  const folder = {
    popupContainer: document.querySelector(".folder.popup-container"),
    popup: document.querySelector(".folder .popup"),
    createButton: document.getElementById("create-folder-button"),
    closeButton: document.getElementById("close-folder-button"),
  };
  const file = {
    popupContainer: document.querySelector(".file.popup-container"),
    popup: document.querySelector(".file .popup"),
    createButton: document.getElementById("create-file-button"),
    closeButton: document.getElementById("close-file-button"),
  };

  const closePopup = (container, popup, inputsParams) => {
    container.classList.add("opacity-0");
    container.classList.add("pointer-events-none");
    container.classList.remove("opacity-100");
    container.classList.remove("pointer-events-auto");
    popup.classList.add("scale-75", "translate-y-8");

    // Make the file name input appear on file submission
    inputsParams.forEach((input) => {
      const fileNameContainer = document.getElementById("file-name-container");
      fileNameContainer.classList.add("hidden");
      input.value = "";
    });
  };

  const onFileSubmission = (filename) => {
    const fileNameContainer = document.getElementById("file-name-container");
    fileNameContainer.classList.remove("hidden");

    const fileNameInput = document.getElementById("fileName");
    fileNameInput.value = filename || "";
    fileNameInput.focus();
  };

  const openPopup = (container, popup, input) => {
    container.classList.remove("opacity-0");
    container.classList.remove("pointer-events-none");
    container.classList.add("opacity-100");
    container.classList.add("pointer-events-auto");
    popup.classList.remove("scale-75", "translate-y-8");
    input.focus();

    // Make the file name input appear on file submission
    if (input.type === "file") {
      input.addEventListener("change", (e) =>
        onFileSubmission(e.target.files[0].name),
      );
    }
  };

  const inputs = [];

  [folder, file].forEach(
    ({ popupContainer, popup, createButton, closeButton }, index) => {
      popup
        .querySelectorAll("input[type=file], input[type=text]")
        .forEach((input) => {
          inputs.push(input);
        });

      createButton.addEventListener("click", () =>
        openPopup(popupContainer, popup, inputs[index]),
      );

      closeButton.addEventListener("click", () =>
        closePopup(popupContainer, popup, inputs),
      );

      // Close popup when clicking outside the popup
      popupContainer.addEventListener("click", (event) => {
        if (!popup.contains(event.target)) {
          closePopup(popupContainer, popup, inputs);
        }
      });
    },
  );

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".edit-button");
    if (button) {
      const entityItem = button.closest(".entity-item");
      // if (entityItem) {
      //   const modal = entityItem.querySelector(".more-modal");
      //   const entityLink = entityItem.querySelector(".entity-link");
      //   const moreOptionsContainer = entityItem.querySelector("div.absolute");
      //   toggleModal(modal, entityLink, moreOptionsContainer);
      // }

      openPopup(
        document.querySelector(".folder .popup-container"),
        document.querySelector(".folder .popup"),
        document.querySelector(".folder .popup input[type=text]"),
      );
    }
  });
};

window.addEventListener("DOMContentLoaded", () => {
  createAndEditRelated();

  document.addEventListener("click", (event) => {
    // Handle more-options-button click
    const button = event.target.closest(".more-options-button");
    if (button) {
      const entityItem = button.closest(".entity-item");
      if (entityItem) {
        const modal = entityItem.querySelector(".more-modal");
        const entityLink = entityItem.querySelector(".entity-link");
        const moreOptionsContainer = entityItem.querySelector("div.absolute");
        toggleModal(modal, entityLink, moreOptionsContainer);
      }
      return;
    }

    // Close open modals if clicking outside
    document.querySelectorAll(".more-modal.opacity-100").forEach((modal) => {
      const entityItem = modal.closest(".entity-item");
      if (entityItem && !entityItem.contains(event.target)) {
        const entityLink = entityItem.querySelector(".entity-link");
        const moreOptionsContainer = entityItem.querySelector("div.absolute");
        toggleModal(modal, entityLink, moreOptionsContainer);
      }
    });
  });
});
