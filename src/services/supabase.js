import { createClient } from "@supabase/supabase-js";


const supabaseUrl = "https://inzpnctkohewjvksnmqm.supabase.co";


const supabaseKey = "sb_publishable_XhC8OuFjiPVC_zoXGFsUHw_rlni4TvC";


export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);