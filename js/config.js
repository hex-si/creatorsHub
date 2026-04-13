// js/config.js

// 🚨 ACTION REQUIRED: Replace these placeholders with your actual Supabase URL and Anon Key
const SUPABASE_URL = 'https://nxdwgiielhqtaxtjcqnv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54ZHdnaWllbGhxdGF4dGpjcW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDY3NDcsImV4cCI6MjA5MTY4Mjc0N30.Cz7tTjrRyAfKcP5_IHwWMTfsgX1O1xlSFJa9euFYtrA';

// Supabase Initialization
let supabaseClient = null;
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  // If config.js loads before supabase-js, define global var
  window.initSupabase = () => {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  };
}

// Note: VAPID_KEY is located in pwa.js
