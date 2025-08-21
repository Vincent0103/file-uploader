import db from "../db/queries.js";

import {
  getNodesFromPath,
  getPopupObject,
  getEntityIcon,
  mapEntityForUI,
} from "../utils/utils.js";

const folderController = (() => {
  const getIndexViewParams = async (
    req,
    isCreatingEntity = true,
    entityId = null,
  ) => {
    let parentFolderId;

    // not comparing with typical comparison like !req.params.folderId
    // because folderId can be equal to 0.
    if (typeof req.body?.parentFolderId !== "undefined") {
      // folderId can come from a form's body when submitting either the folder or file popup
      parentFolderId = req.body.parentFolderId;
    } else {
      parentFolderId = req.params.folderId;
    }

    parentFolderId = parseInt(parentFolderId, 10);

    const { id: userId, username } = req.user;

    let entities = await db.getEntities(userId, parentFolderId);
    entities = entities.map((entity) => mapEntityForUI(entity));

    const iconNames = [
      {
        folderName: req.user.username,
        iconName: "home",
      },
      {
        folderName: "documents",
        iconName: "file-text",
      },
      {
        folderName: "images",
        iconName: "image",
      },
      {
        folderName: "videos",
        iconName: "film",
      },
      {
        folderName: "music",
        iconName: "music",
      },
    ];

    const sidebarFolders = (await db.getSidebarFolders(userId, username)).map(
      ({ id, name }) => ({
        folderId: id,
        name,
        iconName: iconNames.find(({ folderName }) => folderName === name)
          .iconName,
      }),
    );

    const parentFolder = await db.getFolderById(userId, parentFolderId);
    const nodes = await getNodesFromPath(
      parentFolder.path.concat(parentFolder.name),
      userId,
    );

    const CRUDType = isCreatingEntity ? "create" : "edit";
    const popups = {
      folder: getPopupObject(CRUDType, "folder", entityId),
      file: getPopupObject(CRUDType, "file", entityId),
    };

    return {
      user: req.user,
      parentFolderId,
      nodes,
      popups,
      CRUDType,
      entities,
      sidebarFolders,
    };
  };

  const folderGet = async (req, res) => {
    const params = await getIndexViewParams(req);
    return res.render("index", { ...params });
  };

  return { folderGet, getIndexViewParams };
})();

export default folderController;
