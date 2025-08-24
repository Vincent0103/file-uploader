import mime from "mime-types";
import db from "../db/queries.js";
import { getPathFromEntityId, storageHandler } from "../scripts/utils.js";

const deleteController = (() => {
  const deletePost = [
    async (req, res) => {
      const entityId = parseInt(req.params.entityId, 10);
      const parentFolderId = parseInt(req.body.parentFolderId, 10);

      // If deleting a file instead of a folder
      const entity = await db.getEntityById(entityId);
      console.log(entity);
      if (entity.file) {
        const filePath = await getPathFromEntityId(parentFolderId);
        const extension = mime.extension(entity.file.extension);

        await storageHandler.deleteFile(filePath, req.body.filename, extension);
      }

      await db.deleteEntity(entityId);
      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  return { deletePost };
})();

export default deleteController;
