import {
  Listing,
  ListingListItem,
  GeneratePayload,
  SystemHealth,
  DashboardStats
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/api/health`);
    return handleResponse<SystemHealth>(res);
  },

  async getModels(): Promise<{ models: string[]; active: string }> {
    const res = await fetch(`${API_BASE}/api/models`);
    return handleResponse<{ models: string[]; active: string }>(res);
  },

  async generateListing(payload: GeneratePayload): Promise<Listing> {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Listing>(res);
  },

  async getListings(params?: {
    q?: string;
    category?: string;
    platform?: string;
    saved_only?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ListingListItem[]> {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.category) query.set('category', params.category);
    if (params?.platform) query.set('platform', params.platform);
    if (params?.saved_only) query.set('saved_only', 'true');
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    const res = await fetch(`${API_BASE}/api/listings?${query.toString()}`);
    return handleResponse<ListingListItem[]>(res);
  },

  async getListingById(id: string): Promise<Listing> {
    const res = await fetch(`${API_BASE}/api/listings/${id}`);
    return handleResponse<Listing>(res);
  },

  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
    const res = await fetch(`${API_BASE}/api/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Listing>(res);
  },

  async toggleSaveListing(id: string): Promise<Listing> {
    const res = await fetch(`${API_BASE}/api/listings/${id}/save`, {
      method: 'POST',
    });
    return handleResponse<Listing>(res);
  },

  async deleteListing(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/listings/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete listing (status ${res.status})`);
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/api/dashboard/stats`);
    return handleResponse<DashboardStats>(res);
  },

  getExportTxtUrl(id: string): string {
    return `${API_BASE}/api/listings/${id}/export`;
  },

  async analyzeImage(imageData: string, userHints?: string): Promise<{
    success: boolean;
    vision_model_used?: string | null;
    detected_features: string[];
    suggested_category?: string | null;
    suggested_colors: string[];
    notes: string;
  }> {
    const res = await fetch(`${API_BASE}/api/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_data: imageData, user_hints: userHints || '' }),
    });
    return handleResponse(res);
  }
};
