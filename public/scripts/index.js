window.addEventListener("DOMContentLoaded", () => {
  const newFolderButton = document.getElementById("new-folder-button");
  const newFolderContainer = document.getElementById("new-folder-container");
  const newFolderPopup = document.getElementById("new-folder-popup");
  const closeCreateFolderButton = document.getElementById(
    "close-create-folder-button",
  );

  const closePopup = () => {
    newFolderContainer.classList.add("opacity-0");
    newFolderContainer.classList.add("pointer-events-none");
    newFolderContainer.classList.remove("opacity-100");
    newFolderContainer.classList.remove("pointer-events-auto");
    newFolderPopup.classList.add("scale-75", "translate-y-8");
  };

  const openPopup = () => {
    newFolderContainer.classList.remove("opacity-0");
    newFolderContainer.classList.remove("pointer-events-none");
    newFolderContainer.classList.add("opacity-100");
    newFolderContainer.classList.add("pointer-events-auto");
    newFolderPopup.classList.remove("scale-75", "translate-y-8");
  };

  newFolderButton.addEventListener("click", openPopup);
  closeCreateFolderButton.addEventListener("click", closePopup);

  // Close popup when clicking outside the popup
  newFolderContainer.addEventListener("click", (event) => {
    if (!newFolderPopup.contains(event.target)) {
      closePopup();
    }
  });
});
