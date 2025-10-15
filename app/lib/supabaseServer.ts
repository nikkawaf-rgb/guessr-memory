import { createClient } from "@supabase/supabase-js";

const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!url) throw new Error("SUPABASE_URL is missing");
if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");

export const supabaseServer = createClient(url, serviceKey);


