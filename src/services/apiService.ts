// API utilities for fetching data from the backend

import { TeamsResponse, AttendanceRequest, AttendanceResponse, ApiError } from '../types/api';

const API_BASE_URL = 'https://innovatex-backend-r6ie.onrender.com';

export class ApiService {
  /**
   * Fetch teams by category from the backend
   */
  static async getTeamsByCategory(category: string): Promise<TeamsResponse> {
    try {
      // Normalize category names for the API
      const categoryMap: { [key: string]: string } = {
        'AI/ML Bootcamp': 'aiml',
        'Cyber Bootcamp': 'cyber',
        'Full-Stack Bootcamp': 'fullstack',
        'Innovate-X Hackathon': 'fullstack' // Hackathon uses full stack teams
      };

      const apiCategory = categoryMap[category] || category.toLowerCase();
      
      const response = await fetch(`${API_BASE_URL}/teams-by-category/${apiCategory}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: TeamsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching teams by category:', error);
      throw error;
    }
  }

  /**
   * Submit attendance records to the backend
   */
  static async submitAttendance(attendanceData: AttendanceRequest): Promise<AttendanceResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: AttendanceResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting attendance:', error);
      throw error;
    }
  }

  /**
   * Get event type and category from bootcamp name
   */
  static getEventDetails(bootcamp: string): { event_type: string; category: string } {
    const isHackathon = bootcamp.toLowerCase().includes('hackathon');
    
    if (isHackathon) {
      return {
        event_type: 'hackathon',
        category: 'General'
      };
    }

    // For bootcamps, extract category
    let category = 'General';
    if (bootcamp.toLowerCase().includes('ai') || bootcamp.toLowerCase().includes('ml')) {
      category = 'AI/ML';
    } else if (bootcamp.toLowerCase().includes('cyber')) {
      category = 'Cyber';
    } else if (bootcamp.toLowerCase().includes('full') || bootcamp.toLowerCase().includes('stack')) {
      category = 'Full Stack';
    }

    return {
      event_type: 'bootcamp',
      category
    };
  }
}
