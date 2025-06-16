import { Destination, ApiResponse } from '../types/destination';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export class DestinationApiService {
  // Helper method untuk handle response dan parsing JSON
  private static async handleResponse(response: Response): Promise<any> {
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
      } catch (e) {
        console.error('Failed to read error response:', e);
      }
      throw new Error(errorMessage);
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Expected JSON but received:', responseText);
      console.error('Content-Type:', contentType);
      throw new Error(`Expected JSON response but got: ${contentType || 'unknown'}. Response: ${responseText.substring(0, 200)}`);
    }

    try {
      const data = await response.json();
      console.log('Successfully parsed JSON:', data);
      return data;
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      const responseText = await response.text();
      console.error('Raw response that failed to parse:', responseText.substring(0, 500));
      throw new Error(`Failed to parse JSON response: ${parseError.message}`);
    }
  }

  // Helper method untuk create fetch dengan timeout dan proper headers
  private static async fetchWithTimeout(url: string, timeout: number = 10000): Promise<Response> {
    console.log('Fetching URL:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  static async fetchDestinations(
    page: number = 1, 
    search: string = "", 
    category: string = "all"
  ): Promise<ApiResponse> {
    try {
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

      
      const url = `${API_BASE_URL}/api/destinations?${params}`;
      const response = await this.fetchWithTimeout(url);
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error in fetchDestinations:', error);
      throw error;
    }
  }

  static async fetchDestinationById(id: string): Promise<Destination> {
    try {
      const url = `${API_BASE_URL}/api/destinations/${id}`;
      const response = await this.fetchWithTimeout(url);
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error in fetchDestinationById:', error);
      throw error;
    }
  }

  static async fetchCategories(): Promise<string[]> {
    try {
      const url = `${API_BASE_URL}/api/destinations/meta/categories`;
      const response = await this.fetchWithTimeout(url);
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error in fetchCategories:', error);
      throw error;
    }
  }

  // Method baru untuk mengambil destinations berdasarkan rating
  static async fetchDestinationsByRating(limit: number = 8): Promise<Destination[]> {
    try {
      const params = new URLSearchParams({
        sort: 'rating',
        limit: limit.toString()
      });

      // ✅ FIX: Menambahkan /api prefix
      const url = `${API_BASE_URL}/api/destinations?${params}`;
      const response = await this.fetchWithTimeout(url);
      const data: ApiResponse = await this.handleResponse(response);
      return data.destinations || [];
    } catch (error) {
      console.error('Error in fetchDestinationsByRating:', error);
      throw error;
    }
  }

  // Method untuk mengambil popular destinations (sudah ada di route Anda)
  static async fetchPopularDestinations(): Promise<Destination[]> {
    try {
      // Check if API_BASE_URL is defined
      if (!API_BASE_URL) {
        console.error('VITE_API_URL is not defined in environment variables');
        throw new Error('API URL not configured. Please check your .env file.');
      }

      // ✅ FIX: Menambahkan /api prefix - INI YANG PALING PENTING!
      const url = `${API_BASE_URL}/api/destinations/featured/popular`;
      const response = await this.fetchWithTimeout(url);
      const data = await this.handleResponse(response);
      
      // Validate that we received an array
      if (!Array.isArray(data)) {
        console.error('Expected array but received:', typeof data, data);
        throw new Error('Invalid response format: expected array of destinations');
      }

      return data;
    } catch (error) {
      console.error('Error in fetchPopularDestinations:', error);
      
      // Return mock data as fallback
      console.log('Returning mock data as fallback');
      return this.getMockDestinations();
    }
  }

  // Mock data sebagai fallback jika API tidak tersedia
  private static getMockDestinations(): Destination[] {
    return [
      {
        id: '1',
        name: "Borobudur Temple",
        image: "https://picsum.photos/400/600?random=1",
        description: "Ancient Buddhist temple and UNESCO World Heritage site in Central Java",
        rating: 4.8,
        location: "Magelang, Central Java",
        category: "Cultural Heritage",
        price: 50000,
        facilities: ["Parking", "Guide", "Restaurant"],
        openingHours: "06:00 - 17:00",
        contactInfo: "+62-293-788266"
      },
      {
        id: '2',
        name: "Prambanan Temple",
        image: "https://picsum.photos/400/300?random=2",
        description: "Magnificent Hindu temple complex dedicated to Trimurti",
        rating: 4.7,
        location: "Yogyakarta",
        category: "Cultural Heritage",
        price: 40000,
        facilities: ["Parking", "Museum", "Souvenir Shop"],
        openingHours: "06:00 - 17:00",
        contactInfo: "+62-274-496401"
      },
      {
        id: '3',
        name: "Taman Sari Water Castle",
        image: "https://picsum.photos/400/300?random=3",
        description: "Royal water castle and bathing complex of Yogyakarta Sultanate",
        rating: 4.5,
        location: "Yogyakarta City",
        category: "Historical Site",
        price: 15000,
        facilities: ["Guide", "Photography Spot"],
        openingHours: "08:00 - 16:00",
        contactInfo: "+62-274-373358"
      },
      {
        id: '4',
        name: "Malioboro Street",
        image: "https://picsum.photos/400/380?random=4",
        description: "Famous shopping street and cultural center of Yogyakarta",
        rating: 4.4,
        location: "Yogyakarta City",
        category: "Shopping & Culture",
        price: 0,
        facilities: ["Shopping", "Street Food", "Hotels"],
        openingHours: "24 Hours",
        contactInfo: "Public Area"
      },
      {
        id: '5',
        name: "Keraton Yogyakarta",
        image: "https://picsum.photos/400/600?random=5",
        description: "Royal palace and cultural center of Yogyakarta Sultanate",
        rating: 4.6,
        location: "Yogyakarta City",
        category: "Cultural Heritage",
        price: 25000,
        facilities: ["Museum", "Traditional Performance", "Guide"],
        openingHours: "08:30 - 14:00",
        contactInfo: "+62-274-373358"
      },
      {
        id: '6',
        name: "Parangtritis Beach",
        image: "https://picsum.photos/400/300?random=6",
        description: "Stunning black sand beach with mystical legends",
        rating: 4.3,
        location: "Bantul, Yogyakarta",
        category: "Beach & Nature",
        price: 10000,
        facilities: ["ATV Rental", "Horse Riding", "Restaurant"],
        openingHours: "24 Hours",
        contactInfo: "+62-274-367431"
      },
      {
        id: '7',
        name: "Jomblang Cave",
        image: "https://picsum.photos/400/600?random=7",
        description: "Spectacular vertical cave with heavenly light phenomenon",
        rating: 4.9,
        location: "Gunungkidul, Yogyakarta",
        category: "Adventure & Nature",
        price: 450000,
        facilities: ["Professional Guide", "Safety Equipment", "Transport"],
        openingHours: "07:00 - 15:00",
        contactInfo: "+62-817-4312-5678"
      },
      {
        id: '8',
        name: "Kalibiru National Park",
        image: "https://picsum.photos/400/300?random=8",
        description: "Scenic forest park with Instagram-worthy tree top platforms",
        rating: 4.4,
        location: "Kulon Progo, Yogyakarta",
        category: "Nature & Adventure",
        price: 25000,
        facilities: ["Tree Top Platform", "Zip Line", "Camping Ground"],
        openingHours: "06:00 - 18:00",
        contactInfo: "+62-274-773-456"
      }
    ];
  }

  // Method untuk test koneksi API
  static async testConnection(): Promise<{status: number, ok: boolean, message: string}> {
    try {
      if (!API_BASE_URL) {
        return {
          status: 0,
          ok: false,
          message: 'API URL not configured'
        };
      }

      // ✅ FIX: Menambahkan /api prefix
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/api/health`, 5000);
      return {
        status: response.status,
        ok: response.ok,
        message: response.ok ? 'Connection successful' : 'Connection failed'
      };
    } catch (error) {
      return {
        status: 0,
        ok: false,
        message: `Connection error: ${error.message}`
      };
    }
  }
}