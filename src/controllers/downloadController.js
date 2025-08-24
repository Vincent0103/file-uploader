import db from "../db/queries.js";
import { getPathFromEntityId, storageHandler } from "../scripts/utils.js";

const downloadController = (() => {
  const downloadGet = async (req, res, next) => {
    if (!req.isAuthenticated()) {
      const error = {
        statusCode: 401,
        message: "Unauthorized access to the file.",
      };
      return next(error);
    }

    if (!req.params) {
      const { fileId } = req.params;
      if (!fileId || Number.isNaN(Number(fileId))) {
        const error = {
          statusCode: 404,
          message: "File id is not recognized.",
        };
        return next(error);
      }
    }

    const fileId = parseInt(req.params.fileId, 10);
    const entity = await db.getEntityById(fileId);
    const { name, predecessorId } = entity;

    const filePath = await getPathFromEntityId(predecessorId);
    const downloadLink = await storageHandler.createDownloadUrl(filePath, name);
    return res.redirect(downloadLink);
  };

  return { downloadGet };
})();

export default downloadController;
