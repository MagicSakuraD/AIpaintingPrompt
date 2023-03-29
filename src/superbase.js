import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rcpziamawqfsddzokimv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcHppYW1hd3Fmc2Rkem9raW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzk5MDM2NzUsImV4cCI6MTk5NTQ3OTY3NX0.IIjs06vzC3XSkf_iQBcblYPUBkoC2DOfeBe920xrVo8";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
