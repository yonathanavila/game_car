import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.SUPABASE_KEY;

// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const CreateNonce = async ({ address, nonce }) => {
  const { error } = await supabase.from("Nonce").insert({ address, nonce });

  if (error) {
    throw new Error(`Unexpected response from database: ${error}`);
  }

  return true;
};

export const GetNonce = async ({ address }) => {
  const { data, error } = await supabase
    .from("Nonce")
    .select("address")
    .eq("address", address);

  if (error) {
    throw new Error(`Unexpected response from database: ${error}`);
  }

  return data;
};
