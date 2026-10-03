// Fill these in from Supabase > Project Settings > API. The anon key is safe to ship to the browser
// ONLY because row-level security (supabase/schema.sql) limits what it can do.
window.YASC_CONFIG = {
  SUPABASE_URL: "https://jjgpnirkacwrbyoywill.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ3BuaXJrYWN3cmJ5b3l3aWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMzcxNDMsImV4cCI6MjEwNjYxMzE0M30.4sufbGl-Evq5BR8MXS1peDdWLB_Ywd-u6jaow0hpt1o",
  SCHEDULE_ID: "main",         // one shared schedule row; change to run a second, separate schedule
  EDIT_CODE: "8888",           // passcode that allows editing the schedule
  VIEW_CODE: "5555"            // passcode that allows viewing only
};
