import db from "../db/queries.js";
import { getPathFromEntityId, storageHandler } from "../scripts/utils.js";

const deleteController = (() => {
  const deleteFolderPost = [
    async (req, res) => {
      const entityId = parseInt(req.params.entityId, 10);
      const parentFolderId = parseInt(req.body.parentFolderId, 10);

      const filePath = await getPathFromEntityId(parentFolderId);
      await storageHandler.deleteFile(filePath, req.body.filename);
      await db.deleteEntity(entityId);

      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  return { deleteFolderPost };
})();

export default deleteController;
