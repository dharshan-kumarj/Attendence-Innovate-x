import { useState } from 'react';

interface AttendanceRecord {
  registration_number: string;
  name: string;
  day: string;
  timestamp: string;
  team_name: string;
}

interface AttendanceResponse {
  success: boolean;
  category: string;
  total_attendance: number;
  attendance_data: AttendanceRecord[];
}

interface TeamMember {
  name: string;
  registration_number: string;
  attendance: { [day: string]: boolean };
}

interface TeamData {
  team_name: string;
  members: TeamMember[];
}

interface AttendanceDashboardProps {
  onClose: () => void;
}

export function AttendanceDashboard({ onClose }: AttendanceDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'AI/ML Bootcamp', value: 'aiml', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { name: 'Cyber Bootcamp', value: 'cyber', color: 'bg-cyan-600 hover:bg-cyan-700' },
    { name: 'Full-Stack Bootcamp', value: 'fullstack', color: 'bg-green-600 hover:bg-green-700' },
  ];

  const days = ['1', '2', '3', '4', '5'];

  // Process attendance data to group by teams and members
  const processAttendanceData = (data: AttendanceRecord[]): TeamData[] => {
    const teamsMap = new Map<string, TeamData>();

    data.forEach(record => {
      if (!teamsMap.has(record.team_name)) {
        teamsMap.set(record.team_name, {
          team_name: record.team_name,
          members: []
        });
      }

      const team = teamsMap.get(record.team_name)!;
      let member = team.members.find(m => m.registration_number === record.registration_number);
      
      if (!member) {
        member = {
          name: record.name,
          registration_number: record.registration_number,
          attendance: {}
        };
        team.members.push(member);
      }

      member.attendance[record.day] = true;
    });

    return Array.from(teamsMap.values()).sort((a, b) => a.team_name.localeCompare(b.team_name));
  };

  const fetchAttendanceData = async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedCategory(category);

      const response = await fetch(`https://innovatex-backend-r6ie.onrender.com/dashboard/attendance/${category}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AttendanceResponse = await response.json();
      
      if (data.success) {
        setAttendanceData(data);
      } else {
        setError('Failed to fetch attendance data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get processed team data and apply search filter
  const getFilteredTeamData = (): TeamData[] => {
    if (!attendanceData) return [];
    
    const processedData = processAttendanceData(attendanceData.attendance_data);
    
    if (!searchQuery.trim()) return processedData;
    
    const query = searchQuery.toLowerCase();
    return processedData.filter(team => 
      team.team_name.toLowerCase().includes(query) ||
      team.members.some(member => 
        member.name.toLowerCase().includes(query) ||
        member.registration_number.toLowerCase().includes(query)
      )
    );
  };

  const filteredTeamData = getFilteredTeamData();

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-500 bg-opacity-30 text-yellow-300 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const goBack = () => {
    setSelectedCategory(null);
    setAttendanceData(null);
    setSearchQuery('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-100">
              {selectedCategory ? `${attendanceData?.category.toUpperCase()} Dashboard` : 'Attendance Admin Dashboard'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {attendanceData && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-gray-400">
                Total Attendance: <span className="text-blue-400 font-semibold">{attendanceData.total_attendance}</span>
              </p>
              <button
                onClick={goBack}
                className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors"
              >
                ← Back to Categories
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {!selectedCategory ? (
            /* Category Selection */
            <div className="p-8 flex flex-col items-center justify-center h-full">
              <h3 className="text-xl font-semibold text-gray-200 mb-6 text-center">
                Select a category to view attendance data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => fetchAttendanceData(category.value)}
                    disabled={loading}
                    className={`${category.color} disabled:opacity-50 text-white p-6 rounded-lg font-semibold transition-colors text-center hover:scale-105 transform transition-transform`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              {loading && (
                <div className="flex items-center space-x-2 mt-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className="text-gray-400">Loading attendance data...</span>
                </div>
              )}
            </div>
          ) : (
            /* Attendance Data Display */
            <div className="flex flex-col h-full min-h-0">
              {error ? (
                <div className="p-8 text-center">
                  <div className="text-red-400 mb-4">
                    <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold">Error Loading Data</h3>
                    <p className="text-gray-400 mt-2">{error}</p>
                  </div>
                  <button
                    onClick={() => fetchAttendanceData(selectedCategory)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : attendanceData ? (
                <>
                  {/* Search Bar */}
                  <div className="px-6 py-4 border-b border-gray-700 flex-shrink-0">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search by name, registration number, or team..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-10 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {searchQuery && (
                      <p className="text-sm text-gray-400 mt-2">
                        Showing {filteredTeamData.length} teams
                      </p>
                    )}
                  </div>

                  {/* Team Attendance Table */}
                  <div className="flex-1 min-h-0 overflow-auto">
                    {filteredTeamData.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        <p>{searchQuery ? 'No teams found matching your search.' : 'No attendance data available.'}</p>
                      </div>
                    ) : (
                      <div className="h-full overflow-auto">
                        <table className="w-full min-w-max">
                          <thead className="bg-gray-800 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-800 border-r border-gray-600 min-w-[150px]">
                                Team Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[200px]">
                                Member Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[120px]">
                                Reg Number
                              </th>
                              {days.map(day => (
                                <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[80px]">
                                  Day {day}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {filteredTeamData.map((team, teamIndex) => 
                              team.members.map((member, memberIndex) => (
                                <tr key={`${teamIndex}-${memberIndex}`} className="hover:bg-gray-800 transition-colors">
                                  <td className="px-4 py-3 text-sm font-medium text-blue-400 sticky left-0 bg-gray-900 border-r border-gray-600">
                                    {memberIndex === 0 ? (
                                      <div className="flex items-center">
                                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs mr-2">
                                          {team.members.length}
                                        </span>
                                        {highlightText(team.team_name, searchQuery)}
                                      </div>
                                    ) : (
                                      <div className="text-gray-600">↳</div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-100">
                                    {highlightText(member.name, searchQuery)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-300">
                                    {highlightText(member.registration_number, searchQuery)}
                                  </td>
                                  {days.map(day => (
                                    <td key={day} className="px-4 py-3 text-center">
                                      {member.attendance[day] ? (
                                        <span className="text-green-400 text-lg font-bold" title={`Present on Day ${day}`}>
                                          ✓
                                        </span>
                                      ) : (
                                        <span className="text-red-400 text-lg font-bold" title={`Absent on Day ${day}`}>
                                          ✗
                                        </span>
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading attendance data...</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
