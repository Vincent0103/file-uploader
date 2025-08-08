import db from "../db/queries";
import { getNodesObject } from "../utils/utils";

const folderController = (() => {
  const folderGet = async (req, res) => {
    let { folderId } = req.params;
    folderId = parseInt(folderId, 10);

    const { id: userId } = req.user;

    const folders = await db.getFolders(userId, folderId);
    const mainFolder = await db.getFolderById(userId, folderId);
    const nodes = await getNodesObject(mainFolder.path, userId);

    return res.render("index", { user: req.user, nodes, folders });
  };

  return { folderGet };
})();

export default folderController;
