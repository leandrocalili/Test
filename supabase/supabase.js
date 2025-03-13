import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://lmhkpebskctrtdxnrlpk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtaGtwZWJza2N0cnRkeG5ybHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MDA1MzcsImV4cCI6MjA1NzQ3NjUzN30.eYX3zE54VrJ7Bn0JyuS5ga3aIHPcU26vt_nmwG0Md8s";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // Mantém a sessão mesmo após recarregar a página
    storage: window.localStorage, // Armazena a sessão no localStorage
  },
});
