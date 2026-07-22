import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hslobmsjtzxlwrfrwxhq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzbG9ibXNqdHp4bHdyZnJ3eGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MzY2MTcsImV4cCI6MjEwMDMxMjYxN30.o_cibZMRQ9XrzaIwkaxBg_xW_-y-P0ffgGDpsYGy05I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
