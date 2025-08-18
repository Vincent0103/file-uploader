import db from "../db/queries";

const deleteController = (() => {
  const deleteFolderPost = [
    async (req, res) => {
      const entityId = parseInt(req.params.entityId, 10);
      const parentFolderId = parseInt(req.body.parentFolderId, 10);
      await db.deleteEntity(entityId);

      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  return { deleteFolderPost };
})();

export default deleteController;
