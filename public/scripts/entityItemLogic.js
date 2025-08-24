const EntityItemLogic = () => {
  const toggleModal = (modal, moreOptionsContainer) => {
    modal.classList.toggle("opacity-100");
    modal.classList.toggle("pointer-events-auto");
    modal.classList.toggle("opacity-0");
    modal.classList.toggle("pointer-events-none");
    moreOptionsContainer.classList.toggle("opacity-0");
    moreOptionsContainer.classList.toggle("group-hover:opacity-100");
  };

  const handleEntityItemClickStylings = (event) => {
    const selectedEntity = event.target.closest(".entity-item");

    document.querySelectorAll(".entity-item").forEach((entityItem) => {
      const isSelected = entityItem === selectedEntity;
      Array.from(entityItem.children).forEach((child) => {
        if (child.classList.contains("more-options-container")) {
          child.classList.toggle("md:opacity-100", isSelected);
          child.classList.toggle("md:opacity-0", !isSelected);
        } else {
          child.classList.toggle("bg-zinc-900", isSelected);
          child.classList.toggle("border-1", isSelected);
          child.classList.toggle("border-amber-600", isSelected);
        }
      });
    });
  };

  return { toggleModal, handleEntityItemClickStylings };
};

export default EntityItemLogic;
