// ============================================================
// data.js — Supabase Live Data Wrappers
// All global mock arrays have been removed per architecture upgrade.
// ============================================================

// Categories remain static because they represent application navigation state,
// rather than dynamic user-generated content.
const CATEGORIES = [
  { id: 'creative', name: 'Creative', icon: '🎨', description: 'Design, art & content creation', color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #A855F7)' },
  { id: 'student', name: 'Student Services', icon: '📚', description: 'Tutoring, assignments & research', color: '#2563EB', gradient: 'linear-gradient(135deg, #2563EB, #60A5FA)' },
  { id: 'business', name: 'Business Growth', icon: '📈', description: 'Marketing, branding & strategy', color: '#059669', gradient: 'linear-gradient(135deg, #059669, #34D399)' },
  { id: 'products', name: 'Products', icon: '📦', description: 'Physical goods & handmade items', color: '#D97706', gradient: 'linear-gradient(135deg, #D97706, #FBBF24)' },
];

/**
 * Fetch all verified sellers from the database
 */
async function getSellers() {
  try {
    const { data, error } = await supabaseClient
      .from('sellers')
      .select('*')
      .eq('verified', true)
      .order('featured', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return [];
  }
}

/**
 * Fetch a specific seller by their ID
 */
async function getSellerById(id) {
  try {
    const { data, error } = await supabaseClient
      .from('sellers')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching seller ${id}:`, error);
    return null;
  }
}

/**
 * Fetch services, optionally filtered by a specific seller
 */
async function getServices(sellerId = null) {
  try {
    let query = supabaseClient.from('services').select('*');
    if (sellerId) {
      query = query.eq('seller_id', sellerId);
    }
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

/**
 * Fetch physical products, optionally filtered by a specific seller
 */
async function getProducts() {
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Fetch testimonials
 */
async function getTestimonials() {
  if (!supabaseClient) return [];
  try {
    const { data, error } = await supabaseClient
      .from('testimonials')
      .select('*')
      .order('rating', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}
