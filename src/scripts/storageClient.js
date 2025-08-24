import { StorageClient } from "@supabase/storage-js";

const { SUPABASE_URL, SUPABASE_KEY } = process.env;

const storageClient = new StorageClient(SUPABASE_URL, {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
});

export default storageClient;
