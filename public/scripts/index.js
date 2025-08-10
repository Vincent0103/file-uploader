window.addEventListener("DOMContentLoaded", () => {
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
});
