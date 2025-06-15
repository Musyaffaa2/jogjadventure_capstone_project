import { Destination, ApiResponse } from '../types/destination';

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

export class DestinationApiService {
  static async fetchDestinations(
    page: number = 1, 
    search: string = "", 
    category: string = "all"
  ): Promise<ApiResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '12'
    });
    
    if (search.trim()) {
      params.append('search', search.trim());
    }
    
    if (category !== 'all') {
      params.append('category', category);
    }

    const response = await fetch(`${API_BASE_URL}/destinations?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  static async fetchDestinationById(id: string): Promise<Destination> {
    const response = await fetch(`${API_BASE_URL}/destinations/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  static async fetchCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/destinations/meta/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  // Method baru untuk mengambil destinations berdasarkan rating
  static async fetchDestinationsByRating(limit: number = 8): Promise<Destination[]> {
    const params = new URLSearchParams({
      sort: 'rating',
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/destinations?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse = await response.json();
    return data.destinations || [];
  }

  // Method untuk mengambil popular destinations (sudah ada di route Anda)
  static async fetchPopularDestinations(): Promise<Destination[]> {
    const response = await fetch(`${API_BASE_URL}/destinations/featured/popular`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
}