// API Types for the attendance system

export interface TeamMember {
  team_name: string;
  team_leader: string;
  team_member1: string;
  team_member2: string;
  reg_leader: string;
  reg_member1: string;
  reg_member2: string;
}

export interface TeamsResponse {
  success: boolean;
  category: string;
  count: number;
  teams: TeamMember[];
  sources?: string[];
}

export interface AttendanceRecord {
  regno: string;
  name: string;
  day: string;
  event_type: string;
  category?: string;
}

export interface AttendanceRequest {
  attendance_records: AttendanceRecord[];
}

export interface AttendanceResponse {
  success: boolean;
  message: string;
  summary: {
    total_records: number;
    successful: number;
    failed: number;
  };
  detailed_results: Array<{
    regno: string;
    name: string;
    result: any;
  }>;
}

export interface ApiError {
  error: string;
  message?: string;
}
