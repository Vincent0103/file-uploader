import db from "../db/queries";
import { getNodesAndPaths } from "../utils/utils";

const folderController = (() => {
  const folderGet = async (req, res) => {
    let { folderId } = req.params;
    folderId = parseInt(folderId, 10);

    const { id: userId } = req.user;

    const folders = await db.getFolders(userId, folderId);
    const mainFolder = await db.getFolderById(userId, folderId);
    const nodesAndPaths = getNodesAndPaths(mainFolder.path);

    return res.render("index", { user: req.user, nodesAndPaths, folders });
  };

  return { folderGet };
})();

export default folderController;
