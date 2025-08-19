import db from "../db/queries";
import { getNodesFromPath, getPopupObject, getFileIcon } from "../utils/utils";

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
    entities = entities.map((entity) => ({
      ...entity,
      fileIcon: getFileIcon(entity),
    }));

    const iconNames = ["home", "file-text", "image", "film", "music"];
    const sidebarFolders = (await db.getSidebarFolders(userId, username)).map(
      ({ id, name }, index) => ({
        folderId: id,
        name,
        iconName: iconNames[index],
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
