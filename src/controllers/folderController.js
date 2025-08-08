import db from "../db/queries";

const folderController = (() => {
  const folderGet = async (req, res) => {
    let { folderId } = req.params;
    folderId = parseInt(folderId, 10);

    const { id: userId } = req.user;

    const folders = await db.getFolders(userId, folderId);

    return res.render("index", { user: req.user, path: ["home"], folders });
  };

  return { folderGet };
})();

export default folderController;
