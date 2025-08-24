const FileDetailsLogic = () => {
  const updateFileDetailsContent = (entityInfos) => {
    const rightSidebar = document.getElementById("right-sidebar");
    const fileDetails = {
      icon: rightSidebar.querySelector("#file-details-icon"),
      name: rightSidebar.querySelector("#file-details-name"),
      size: rightSidebar.querySelector("#file-details-size"),
      extension: rightSidebar.querySelector("#file-details-extension"),
      uploadTime: rightSidebar.querySelector("#file-details-upload-time"),
      createdAt: rightSidebar.querySelector("#file-details-created-at"),
      downloadLink: rightSidebar.querySelector("#file-details-download-link"),
    };

    const {
      id,
      createdAt,
      iconPath,
      name,
      size,
      extension,
      uploadTime,
      storagePath,
    } = entityInfos;

    // Set placeholder image first
    fileDetails.icon.src = iconPath;

    // When the main image loads, replace the placeholder
    const mainImage = new window.Image();
    mainImage.src = storagePath;
    mainImage.onload = () => {
      fileDetails.icon.src = storagePath;
      mainImage.src = "";
    };
    fileDetails.icon.alt = `Preview of file ${name}`;
    fileDetails.name.textContent = name;
    fileDetails.size.textContent = size;
    fileDetails.extension.textContent = extension;
    fileDetails.uploadTime.textContent = uploadTime;
    fileDetails.createdAt.textContent = createdAt;
    fileDetails.downloadLink.href = `/download/${id}`;

    rightSidebar.classList.remove("hidden");
  };

  const openFileDetails = (entityItem) => {
    const { entityId, entityType, entityFile, entityIcon } = entityItem.dataset;
    const parsedEntityObject = JSON.parse(entityFile);

    if (entityType !== "file") return;

    const entityName = entityItem.querySelector("#entity-name").textContent;

    const getIconPath = (iconName) => `/images/${iconName}.svg`;

    const entityInfos = {
      ...parsedEntityObject,
      id: parseInt(entityId, 10),
      iconPath: getIconPath(entityIcon),
      name: entityName,
    };

    updateFileDetailsContent(entityInfos);
  };

  return { updateFileDetailsContent, openFileDetails };
};

export default FileDetailsLogic;
