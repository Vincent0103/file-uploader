import db from "../db/queries.js";

import {
  getNodesFromEntityId,
  getPopupObject,
  mapEntityForUI,
  getSidebarInformations,
} from "../utils.js";

const folderController = (() => {
  const getIndexViewParams = async (
    req,
    next,
    isCreatingEntity = true,
    entityId = null,
  ) => {
    let parentFolderId;

    // not comparing with typical comparison like !req.params.folderId
    // because folderId can be equal to 0.
    if (typeof req.body?.parentFolderId !== "undefined") {
      // folderId can come from a form's body when submitting either the folder or file popup
      parentFolderId = req.body.parentFolderId;
    } else if (req.params.folderId) {
      parentFolderId = req.params.folderId;
      if (isNaN(Number(parentFolderId))) {
        throw new Error("Folder does not exist");
      }
    } else {
      throw new Error("Folder does not exist");
    }

    parentFolderId = parseInt(parentFolderId, 10);
    const folderIdExists = await db.doesFolderIdExists(parentFolderId);

    if (!folderIdExists) {
      throw new Error(`Folder of id ${parentFolderId} does not exist`);
    }
    const { id: userId } = req.user;

    let entities = await db.getEntities(userId, parentFolderId);
    entities = entities.map((entity) => mapEntityForUI(entity));

    const nodes = await getNodesFromEntityId(parentFolderId);

    const CRUDType = isCreatingEntity ? "create" : "edit";
    const popups = {
      folder: getPopupObject(CRUDType, "folder", entityId),
      file: getPopupObject(CRUDType, "file", entityId),
    };

    const sidebarInformations = await getSidebarInformations(req);

    return {
      user: req.user,
      sidebarInformations,
      parentFolderId,
      nodes,
      popups,
      CRUDType,
      entities,
    };
  };

  const folderGet = async (req, res, next) => {
    try {
      const params = await getIndexViewParams(req, next);
      return res.render("index", { ...params });
    } catch (err) {
      const error = {
        statusCode: 404,
        message: err.message,
      };
      next(error);
    }
  };

  return { folderGet, getIndexViewParams };
})();

export default folderController;
