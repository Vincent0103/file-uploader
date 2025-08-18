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

    if (!inputsParams || !Array.isArray(inputsParams)) return;

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

    if (!firstInput) return;

    firstInput.focus();

    // Make the file name input appear on file submission
    if (firstInput.type === "file") {
      firstInput.addEventListener("change", (e) =>
        onFileSubmission(e.target.files[0].name),
      );
    }
  };

  const updatePopupContent = (
    popupDOMParam,
    entityType,
    CRUDType,
    entityId = null,
    entityName = null,
    parentFolderId = null,
  ) => {
    const titledEntityType = entityType === "folder" ? "Folder" : "File";
    const popupDOM = popupDOMParam;

    if (CRUDType === "create") {
      popupDOM.title.textContent = `New ${titledEntityType}`;
      popupDOM.submitButton.textContent =
        entityType === "folder" ? "Create" : "Upload";

      popupDOM.popup.action = `/create/${entityType}`;
    } else {
      if (!entityId) {
        throw new Error(
          `Entity ID: ${entityId} does not exist upon to change the link's url for edition`,
        );
      }

      if (CRUDType === "edit") {
        popupDOM.title.textContent = `Edit ${titledEntityType}`;
        popupDOM.submitButton.textContent = "Edit";

        popupDOM.popup.action = `/edit/${entityType}/${entityId}`;
      } else {
        popupDOM.title.textContent = `Delete ${titledEntityType}`;
        popupDOM.deleteContentEntityType.textContent = entityType;
        popupDOM.deleteContentEntityName.textContent = entityName;
        popupDOM.inputs.entityId.value = entityId;
        popupDOM.inputs.entityType.value = entityType;
        popupDOM.inputs.parentFolderId.value = parentFolderId;
        popupDOM.submitButton.textContent = "Delete";

        popupDOM.popup.action = `/delete/${entityType}/${entityId}`;
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

const createPopupDOMObject = (entityType, forDeletion = false) => {
  const popupDOM = {};
  const containerSelector = forDeletion ? ".deletion" : `.${entityType}`;

  const container = document.querySelector(
    `${containerSelector}.popup-container`,
  );

  popupDOM.container = container;

  if (!forDeletion) {
    const inputs = container.querySelectorAll(
      "input[type=file], input[type=text]",
    );
    const openPopupButton = document.querySelector(
      `${containerSelector}.open-popup-button`,
    );
    popupDOM.inputs = inputs;
    popupDOM.openPopupButton = openPopupButton;
  } else {
    popupDOM.deleteContentEntityName = container.querySelector(
      "#delete-content-entity-name",
    );
    popupDOM.deleteContentEntityType = container.querySelector(
      "#delete-content-entity-type",
    );
    popupDOM.inputs = {
      entityId: container.querySelector("#entityId"),
      entityType: container.querySelector("#entityType"),
      parentFolderId: container.querySelector("#parentFolderId"),
    };
  }

  popupDOM.popup = container.querySelector(".popup");
  popupDOM.title = container.querySelector(".title");
  popupDOM.submitButton = container.querySelector("button[type=submit]");
  popupDOM.closeButton = container.querySelector(".close-button");

  return popupDOM;
};

export default DOMMethods;
export { createPopupDOMObject };
