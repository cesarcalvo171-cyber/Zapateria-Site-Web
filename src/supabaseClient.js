import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://byvdyzvmelqynvffetmt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dmR5enZtZWxxeW52ZmZldG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NTEwODcsImV4cCI6MjA5OTAyNzA4N30.zEclXcRef_oiObhg_VzvnjYKLs5Uw-ev7JhfGxnO-yY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
