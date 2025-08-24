const PopupLogic = () => {
  const closePopup = (popupDOM) => {
    const { container, popup, inputs, hiddableContainer, uploadingIndicator } =
      popupDOM;

    // If there is an uploading indicator (e.g. when uploading a file) user cannot exit
    if (uploadingIndicator && !uploadingIndicator.classList.contains("hidden"))
      return;

    container.classList.add("opacity-0");
    container.classList.add("pointer-events-none");
    container.classList.remove("opacity-100");
    container.classList.remove("pointer-events-auto");
    popup.classList.add("scale-75", "translate-y-8");
    if (hiddableContainer && !hiddableContainer.classList.contains("hidden")) {
      hiddableContainer.classList.add("hidden");
    }

    // Reset all input fields
    if (inputs) {
      Object.values(inputs).forEach((input) => {
        input.value = "";
        if (input.disabled) input.disabled = false;
      });
    }
  };

  const onFirstInputChange = (filename, hiddableContainer, inputs) => {
    hiddableContainer.classList.remove("hidden");

    inputs[1].value = filename || "";
    inputs[1].focus();
  };

  const openPopup = (popupDOM, fileInputInfos, isHidingContainer) => {
    const { container, popup, inputs, hiddableContainer } = popupDOM;

    container.classList.remove("opacity-0");
    container.classList.remove("pointer-events-none");
    container.classList.add("opacity-100");
    container.classList.add("pointer-events-auto");
    popup.classList.remove("scale-75", "translate-y-8");

    if (!inputs) return;

    const inputValues = Object.values(inputs);
    inputValues[0].focus();

    // Make the file name input container appear on file submission
    // when the user is not editing a file
    if (hiddableContainer) {
      if (isHidingContainer) {
        hiddableContainer.classList.add("hidden");
        fileInputInfos.classList.remove("hidden");

        inputValues[0].addEventListener("change", (e) =>
          onFirstInputChange(
            e.target.files[0].name,
            hiddableContainer,
            inputValues,
          ),
        );
      } else {
        inputValues[0].disabled = true;
        hiddableContainer.classList.remove("hidden");
        fileInputInfos.classList.add("hidden");
        inputValues[1].focus();
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
        popupDOM.inputs.filename.value = entityName;
        popupDOM.submitButton.textContent = "Delete";

        popupDOM.popup.action = `/delete/${entityId}`;
      }
    }
  };

  const onFilePopupSubmit = (e, popup, inputs, submitButton, closeButton) => {
    const uploadingIndicator = popup.querySelector("#uploading-indicator");
    uploadingIndicator.classList.remove("hidden");
    uploadingIndicator.classList.add("flex");

    Object.values(inputs).forEach((input) => {
      input.readOnly = true;
      input.tabIndex = -1;
      input.classList.add(
        "pointer-events-none",
        "text-zinc-500",
        "opacity-50",
        "cursor-not-allowed",
      );
    });

    const submitButtonContainer = submitButton.parentElement;
    submitButtonContainer.classList.add("hidden");
    submitButton.readOnly = true;
    submitButton.tabIndex = -1;

    closeButton.classList.add("cursor-not-allowed");
    closeButton.classList.remove("cursor-pointer");
  };

  return { closePopup, openPopup, updatePopupContent, onFilePopupSubmit };
};

export default PopupLogic;
