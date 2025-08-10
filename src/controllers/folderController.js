import db from "../db/queries";
import { getNodesFromPath } from "../utils/utils";

const folderController = (() => {
  const getIndexViewParams = async (
    req,
    hasCreateFolderErrors = false,
    hasCreateFileErrors = false,
  ) => {
    let folderId;

    // not comparing with typical comparison like !req.params.folderId
    // because folderId can be equal to 0.
    if (typeof req.params.folderId !== "undefined") {
      folderId = req.params.folderId;
    } else {
      folderId = req.body.folderId;
    }

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
    const nodes = await getNodesFromPath(
      mainFolder.path.concat(mainFolder.name),
      userId,
    );

    return {
      user: req.user,
      folderId,
      nodes,
      folders,
      sidebarFolders,
      hasCreateFolderErrors,
      hasCreateFileErrors,
    };
  };

  const folderGet = async (req, res) => {
    const params = await getIndexViewParams(req);
    return res.render("index", { ...params });
  };

  return { folderGet, getIndexViewParams };
})();

export default folderController;
