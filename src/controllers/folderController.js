import db from "../db/queries";
import { getNodesFromPath } from "../utils/utils";

const folderController = (() => {
  const getIndexViewParams = async (
    req,
    hasCreateFolderErrors = false,
    hasCreateFileErrors = false,
  ) => {
    let parentFolderId;

    // not comparing with typical comparison like !req.params.folderId
    // because folderId can be equal to 0.
    if (typeof req.params.folderId !== "undefined") {
      parentFolderId = req.params.folderId;
    } else {
      // folderId can come from a form's body when submitting either the folder or file popup
      parentFolderId = req.body.parentFolderId;
    }

    parentFolderId = parseInt(parentFolderId, 10);

    const { id: userId, username } = req.user;

    const entities = await db.getEntities(userId, parentFolderId);

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

    return {
      user: req.user,
      parentFolderId,
      nodes,
      entities,
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
