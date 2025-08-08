window.addEventListener("DOMContentLoaded", () => {
  const createButtons = document.querySelectorAll(".create-button");
  const createContainers = document.querySelectorAll(".create-container");
  const createPopups = document.querySelectorAll(".create-popup");
  const closeCreateButtons = document.querySelectorAll(".close-create-button");
  const createInputs = [];

  createPopups.forEach((createPopup) => {
    createInputs.push(createPopup.querySelector("input"));
  });

  const closePopup = (createContainer, createPopup) => {
    createContainer.classList.add("opacity-0");
    createContainer.classList.add("pointer-events-none");
    createContainer.classList.remove("opacity-100");
    createContainer.classList.remove("pointer-events-auto");
    createPopup.classList.add("scale-75", "translate-y-8");
  };

  const openPopup = (createContainer, createPopup, createInput) => {
    createContainer.classList.remove("opacity-0");
    createContainer.classList.remove("pointer-events-none");
    createContainer.classList.add("opacity-100");
    createContainer.classList.add("pointer-events-auto");
    createPopup.classList.remove("scale-75", "translate-y-8");
    createInput.focus();
  };

  createButtons.forEach((createButton, index) => {
    createButton.addEventListener("click", () =>
      openPopup(
        createContainers[index],
        createPopups[index],
        createInputs[index],
      ),
    );
  });

  closeCreateButtons.forEach((closeCreateButton, index) => {
    closeCreateButton.addEventListener("click", () =>
      closePopup(createContainers[index], createPopups[index]),
    );
  });

  // Close popup when clicking outside the popup
  createContainers.forEach((container, index) => {
    container.addEventListener("click", (event) => {
      if (!createPopups[index].contains(event.target)) {
        closePopup(container, createPopups[index]);
      }
    });
  });
});
