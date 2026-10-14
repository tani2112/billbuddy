export interface Listing {
  id: string;
  product_name: string;
  category: string;
  features_specs: string;
  target_audience?: string;
  platform: string;
  tone: string;
  language: string;
  image_url?: string | null;
  seo_title: string;
  description: string;
  selling_points: string[];
  keywords: string[];
  instagram_caption: string;
  call_to_action: string;
  alternative_titles: string[];
  is_saved: boolean;
  model_used: string;
  created_at: string;
  updated_at: string;
}

export interface ListingListItem {
  id: string;
  product_name: string;
  category: string;
  platform: string;
  tone: string;
  language: string;
  seo_title: string;
  is_saved: boolean;
  created_at: string;
  image_url?: string | null;
}

export interface GeneratePayload {
  product_name: string;
  category: string;
  features_specs: string;
  target_audience?: string;
  platform: string;
  tone: string;
  language: string;
  image_data?: string | null;
  model_override?: string | null;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'ollama_offline' | 'model_missing';
  ollama_connected: boolean;
  ollama_url: string;
  active_model: string;
  available_models: string[];
  model_ready: boolean;
  message: string;
  setup_instructions: {
    install_linux: string;
    start_service: string;
    pull_qwen: string;
    pull_vision: string;
    recommended_models: Array<{
      name: string;
      size: string;
      desc: string;
    }>;
  };
}

export interface DashboardStats {
  total_listings: number;
  saved_listings: number;
  platform_breakdown: Record<string, number>;
  category_breakdown: Record<string, number>;
  recent_listings: ListingListItem[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}
