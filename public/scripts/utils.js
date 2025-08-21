const DOMMethods = (() => {
  const toggleModal = (modal, entityContainer, moreOptionsContainer) => {
    modal.classList.toggle("opacity-100");
    modal.classList.toggle("pointer-events-auto");
    modal.classList.toggle("opacity-0");
    modal.classList.toggle("pointer-events-none");
    entityContainer.classList.toggle("hover:bg-zinc-900");
    entityContainer.classList.toggle("bg-zinc-800");
    entityContainer.classList.toggle("bg-zinc-900");
    moreOptionsContainer.classList.toggle("opacity-0");
    moreOptionsContainer.classList.toggle("group-hover:opacity-100");
  };

  const closePopup = (container, popup, inputsParams, hiddableContainer) => {
    container.classList.add("opacity-0");
    container.classList.add("pointer-events-none");
    container.classList.remove("opacity-100");
    container.classList.remove("pointer-events-auto");
    popup.classList.add("scale-75", "translate-y-8");
    if (hiddableContainer && !hiddableContainer.classList.contains("hidden")) {
      hiddableContainer.classList.add("hidden");
    }

    // Reset all input fields
    Object.values(inputsParams).forEach((input) => {
      input.value = "";
      if (input.disabled) input.disabled = false;
    });
  };

  const openPopup = (
    container,
    popup,
    inputsParam,
    hiddableContainer,
    isHidingContainer = false,
  ) => {
    let inputs;
    if (inputsParam) {
      inputs = Object.values(inputsParam);
    }

    const onFirstInputChange = (filename) => {
      hiddableContainer.classList.remove("hidden");

      inputs[1].value = filename || "";
      inputs[1].focus();
    };

    container.classList.remove("opacity-0");
    container.classList.remove("pointer-events-none");
    container.classList.add("opacity-100");
    container.classList.add("pointer-events-auto");
    popup.classList.remove("scale-75", "translate-y-8");

    if (!inputs) return;
    inputs[0].focus();

    // Make the file name input container appear on file submission
    // when the user is not editing a file
    if (hiddableContainer) {
      if (isHidingContainer) {
        hiddableContainer.classList.add("hidden");

        inputs[0].addEventListener("change", (e) =>
          onFirstInputChange(e.target.files[0].name),
        );
      } else {
        inputs[0].disabled = true;
        hiddableContainer.classList.remove("hidden");
        inputs[1].focus();
      }
    }
  };

  const updatePopupContent = (
    popupDOMParam,
    CRUDType,
    entityId = null,
    entityName = null,
    parentFolderId = null,
  ) => {
    const popupDOM = popupDOMParam;
    const { entityType } = popupDOM;

    const titledEntityType = entityType === "folder" ? "Folder" : "File";

    if (CRUDType === "create") {
      popupDOM.title.textContent = `New ${titledEntityType}`;
      popupDOM.submitButton.textContent =
        entityType === "folder" ? "Create" : "Upload";
      popupDOM.submitButton.dataset.crudType = "create";

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
        popupDOM.submitButton.dataset.crudType = "edit";

        Object.values(popupDOM.inputs).forEach((input) => {
          if (input.type === "text") input.value = entityName;
        });

        popupDOM.popup.action = `/edit/${entityType}/${entityId}`;
      } else if (CRUDType === "delete") {
        popupDOM.title.textContent = `Delete ${titledEntityType}`;
        popupDOM.deleteContentEntityType.textContent = entityType;
        popupDOM.deleteContentEntityName.textContent = entityName;
        popupDOM.inputs.entityType.value = entityType;
        popupDOM.inputs.parentFolderId.value = parentFolderId;
        popupDOM.submitButton.textContent = "Delete";

        popupDOM.popup.action = `/delete/${entityId}`;
      }
    }
  };

  const updateFileDetailsContent = (entityInfos) => {
    const rightSidebar = document.getElementById("right-sidebar");
    const fileDetails = {
      icon: rightSidebar.querySelector("#file-details-icon"),
      name: rightSidebar.querySelector("#file-details-name"),
      size: rightSidebar.querySelector("#file-details-size"),
      extension: rightSidebar.querySelector("#file-details-extension"),
      uploadTime: rightSidebar.querySelector("#file-details-upload-time"),
      createdAt: rightSidebar.querySelector("#file-details-created-at"),
    };

    const {
      createdAt,
      iconPath,
      name,
      size,
      extension,
      uploadTime,
      storagePath,
    } = entityInfos;

    if (fileDetails.icon.src !== storagePath) fileDetails.icon.src = iconPath;
    fileDetails.icon.src = storagePath;
    fileDetails.icon.alt = `Preview of file ${name}`;
    fileDetails.name.textContent = name;
    fileDetails.size.textContent = size;
    fileDetails.extension.textContent = extension;
    fileDetails.uploadTime.textContent = uploadTime;
    fileDetails.createdAt.textContent = createdAt;

    rightSidebar.classList.remove("hidden");
    rightSidebar.classList.add("absolute");
  };

  const openFileDetails = (entityItem) => {
    const { entityType, entityFile, entityIcon } = entityItem.dataset;
    const parsedEntityObject = JSON.parse(entityFile);

    if (entityType !== "file") return;

    const entityName = entityItem.querySelector("#entity-name").textContent;

    const getIconPath = (iconName) => `/images/${iconName}.svg`;

    const entityInfos = {
      ...parsedEntityObject,
      iconPath: getIconPath(entityIcon),
      name: entityName,
    };

    DOMMethods.updateFileDetailsContent(entityInfos);
  };

  const handleEntityItemClickStylings = (event) => {
    const selectedEntity = event.target.closest(".entity-item");
    document.querySelectorAll(".entity-item").forEach((entityItem) => {
      const isSelected = entityItem === selectedEntity;
      Array.from(entityItem.children).forEach((child) => {
        if (child.classList.contains("more-options-container")) {
          child.classList.toggle("opacity-100", isSelected);
          child.classList.toggle("opacity-0", !isSelected);
        } else {
          child.classList.toggle("bg-zinc-900", isSelected);
          child.classList.toggle("border-1", isSelected);
          child.classList.toggle("border-amber-600", isSelected);
        }
      });
    });
  };

  return {
    toggleModal,
    closePopup,
    openPopup,
    updatePopupContent,
    updateFileDetailsContent,
    handleEntityItemClickStylings,
    openFileDetails,
  };
})();

const createPopupDOMObject = (entityType, forDeletion = false) => {
  const getInputsKeyValuePairs = (inputs) =>
    Array.from(inputs).reduce((acc, input) => {
      acc[input.id] = input;
      return acc;
    }, {});

  const containerSelector = forDeletion ? ".deletion" : `.${entityType}`;
  const container = document.querySelector(
    `${containerSelector}.popup-container`,
  );

  let inputs;
  let openPopupButton;
  let deleteContentEntityName;
  let deleteContentEntityType;
  let hiddableContainer;
  const popup = container.querySelector(".popup");
  const title = container.querySelector(".title");
  const submitButton = container.querySelector("button[type=submit]");
  const closeButton = container.querySelector(".close-button");

  if (!forDeletion) {
    openPopupButton = document.querySelector(
      `${containerSelector}.open-popup-button`,
    );

    const fileNameContainer = popup.querySelector("#file-name-container");
    if (fileNameContainer) hiddableContainer = fileNameContainer;

    inputs = container.querySelectorAll("input[type=file], input[type=text]");
    inputs = getInputsKeyValuePairs(inputs);
  } else {
    deleteContentEntityName = container.querySelector(
      "#delete-content-entity-name",
    );
    deleteContentEntityType = container.querySelector(
      "#delete-content-entity-type",
    );
    inputs = {
      entityId: container.querySelector("#entityId"),
      entityType: container.querySelector("#entityType"),
      parentFolderId: container.querySelector("#parentFolderId"),
    };
  }

  const popupDOM = {
    entityType,
    container,
    hiddableContainer,
    inputs,
    openPopupButton,
    deleteContentEntityName,
    deleteContentEntityType,
    popup,
    title,
    submitButton,
    closeButton,
  };

  return popupDOM;
};

export default DOMMethods;
export { createPopupDOMObject };
