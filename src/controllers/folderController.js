import db from "../db/queries";
import { getNodesObject } from "../utils/utils";

const folderController = (() => {
  const folderGet = async (req, res) => {
    let { folderId } = req.params;
    folderId = parseInt(folderId, 10);

    const { id: userId, username } = req.user;

    const folders = await db.getFolders(userId, folderId);

    const iconNames = ["home", "file-text", "image", "film", "music"];
    const sidebarFolders = (await db.getSidebarFolders(userId, username)).map(
      ({ id, name }, index) => ({
        folderId: id,
        name,
        iconName: iconNames[index],
      }),
    );

    const mainFolder = await db.getFolderById(userId, folderId);
    const nodes = await getNodesObject(
      mainFolder.path.concat(mainFolder.name),
      userId,
    );

    return res.render("index", {
      user: req.user,
      nodes,
      folders,
      sidebarFolders,
    });
  };

  return { folderGet };
})();

export default folderController;
