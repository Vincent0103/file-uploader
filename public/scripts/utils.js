const DOMMethods = (() => {
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

  const openPopup = (container, popup, firstInput) => {
    container.classList.remove("opacity-0");
    container.classList.remove("pointer-events-none");
    container.classList.add("opacity-100");
    container.classList.add("pointer-events-auto");
    popup.classList.remove("scale-75", "translate-y-8");
    firstInput.focus();

    // Make the file name input appear on file submission
    if (firstInput.type === "file") {
      firstInput.addEventListener("change", (e) =>
        onFileSubmission(e.target.files[0].name),
      );
    }
  };

  const updatePopupContent = (
    entity,
    entityType,
    isCreating,
    entityId = null,
  ) => {
    const titledEntityType = entityType === "folder" ? "Folder" : "File";
    if (isCreating) {
      entity.title.textContent = `New ${titledEntityType}`;
      entity.submitButton.textContent = "Create";
      entity.popup.action = "/create/folder";
    } else {
      entity.title.textContent = `Edit ${titledEntityType}`;
      entity.submitButton.textContent = "Edit";
      if (entityId) {
        entity.popup.action = `/edit/folder/${entityId}`;
      } else {
        throw new Error(
          `Entity ID: ${entityId} does not exist upon to change the link's url for edition`,
        );
      }
    }
  };

  return {
    toggleModal,
    closePopup,
    openPopup,
    onFileSubmission,
    updatePopupContent,
  };
})();

const createEntityDOMObject = (entityType) => {
  const containerSelector = entityType === "folder" ? ".folder" : ".file";
  const container = document.querySelector(
    `${containerSelector}.popup-container`,
  );

  const entity = {
    container,
    popup: container.querySelector(".popup"),
    title: container.querySelector(".title"),
    inputs: container.querySelectorAll("input[type=file], input[type=text]"),
    openPopupButton: document.querySelector(
      `${containerSelector}.open-popup-button`,
    ),
    submitButton: container.querySelector("button[type=submit]"),
    closeButton: container.querySelector(".close-button"),
  };

  return entity;
};

export default DOMMethods;
export { createEntityDOMObject };
