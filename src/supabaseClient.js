import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aerrcwyygaxomfhsonvo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnJjd3l5Z2F4b21maHNvbnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NzYzMTQsImV4cCI6MjEwMTM1MjMxNH0.4kpe-O152yQG11ruM6C3RHVzJIwjXVFMZJ85vXF_OiM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
