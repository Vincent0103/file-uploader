const createRelated = () => {
  const createButtons = document.querySelectorAll(".create-button");
  const createContainers = document.querySelectorAll(".create-container");
  const createPopups = document.querySelectorAll(".create-popup");
  const closeCreateButtons = document.querySelectorAll(".close-create-button");
  const inputs = [];

  createPopups.forEach((createPopup) => {
    createPopup
      .querySelectorAll("input[type=file], input[type=text]")
      .forEach((input) => {
        inputs.push(input);
      });
  });

  const closePopup = (createContainer, createPopup, inputsParams) => {
    createContainer.classList.add("opacity-0");
    createContainer.classList.add("pointer-events-none");
    createContainer.classList.remove("opacity-100");
    createContainer.classList.remove("pointer-events-auto");
    createPopup.classList.add("scale-75", "translate-y-8");

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

  const openPopup = (createContainer, createPopup, input) => {
    createContainer.classList.remove("opacity-0");
    createContainer.classList.remove("pointer-events-none");
    createContainer.classList.add("opacity-100");
    createContainer.classList.add("pointer-events-auto");
    createPopup.classList.remove("scale-75", "translate-y-8");
    input.focus();

    // Make the file name input appear on file submission
    if (input.type === "file") {
      input.addEventListener("change", (e) =>
        onFileSubmission(e.target.files[0].name),
      );
    }
  };

  createButtons.forEach((createButton, index) => {
    createButton.addEventListener("click", () =>
      openPopup(createContainers[index], createPopups[index], inputs[index]),
    );
  });

  closeCreateButtons.forEach((closeCreateButton, index) => {
    closeCreateButton.addEventListener("click", () =>
      closePopup(createContainers[index], createPopups[index], inputs),
    );
  });

  // Close popup when clicking outside the popup
  createContainers.forEach((container, index) => {
    container.addEventListener("click", (event) => {
      if (!createPopups[index].contains(event.target)) {
        closePopup(container, createPopups[index], inputs);
      }
    });
  });
};

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

window.addEventListener("DOMContentLoaded", () => {
  createRelated();

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".more-options-button");
    if (button) {
      const entityItem = button.closest(".entity-item");
      if (entityItem) {
        const modal = entityItem.querySelector(".more-modal");
        const entityLink = entityItem.querySelector("a");
        const moreOptionsContainer = entityItem.querySelector("div.absolute");
        toggleModal(modal, entityLink, moreOptionsContainer);
      }
      return;
    }

    document.querySelectorAll(".more-modal.opacity-100").forEach((modal) => {
      const entityItem = modal.closest(".entity-item");
      if (entityItem && !entityItem.contains(event.target)) {
        const entityLink = entityItem.querySelector("a");
        const moreOptionsContainer = entityItem.querySelector("div.absolute");
        toggleModal(modal, entityLink, moreOptionsContainer);
      }
    });
  });
});
