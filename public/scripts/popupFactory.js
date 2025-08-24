const createPopupDOMObject = (containerClass) => {
  const getInputsKeyValuePairs = (inputs) =>
    Array.from(inputs).reduce((acc, input) => {
      acc[input.id] = input;
      return acc;
    }, {});

  const container = document.querySelector(
    `.${containerClass}.popup-container`,
  );

  let inputs;
  let openPopupButton;
  let deleteContentEntityName;
  let deleteContentEntityType;
  let hiddableContainer;
  let fileInputInfos;
  let entityType;
  const popup = container.querySelector(".popup");
  const title = container.querySelector(".title");
  const submitButton = container.querySelector("button[type=submit]");
  const closeButton = container.querySelector(".close-button");
  const uploadingIndicator = popup.querySelector("#uploading-indicator");

  if (containerClass !== "deletion" && containerClass !== "error") {
    entityType = containerClass;
    openPopupButton = document.querySelector(
      `.${containerClass}.open-popup-button`,
    );

    const fileNameContainer = popup.querySelector("#file-name-container");
    if (fileNameContainer) hiddableContainer = fileNameContainer;

    fileInputInfos = popup.querySelector("small");
    inputs = container.querySelectorAll("input[type=file], input[type=text]");
    inputs = getInputsKeyValuePairs(inputs);
  } else if (containerClass === "deletion") {
    deleteContentEntityName = container.querySelector(
      "#delete-content-entity-name",
    );
    deleteContentEntityType = container.querySelector(
      "#delete-content-entity-type",
    );
    inputs = {
      filename: container.querySelector("#filename"),
    };
  }

  const popupDOM = {
    entityType,
    container,
    hiddableContainer,
    inputs,
    fileInputInfos,
    openPopupButton,
    deleteContentEntityName,
    deleteContentEntityType,
    popup,
    title,
    submitButton,
    closeButton,
    uploadingIndicator,
  };

  return popupDOM;
};

export default createPopupDOMObject;
