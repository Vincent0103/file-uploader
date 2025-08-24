import { StorageClient } from "@supabase/storage-js";

const { STORAGE_URL, STORAGE_KEY } = process.env;

const storageClient = new StorageClient(STORAGE_URL, {
  apikey: STORAGE_KEY,
  Authorization: `Bearer ${STORAGE_KEY}`,
});

export default storageClient;
