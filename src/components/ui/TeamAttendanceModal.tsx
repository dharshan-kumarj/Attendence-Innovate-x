import { useState, useEffect } from 'react';
import { TeamMember, AttendanceRecord } from '../../types/api';
import { ApiService } from '../../services/apiService';

interface TeamAttendanceModalProps {
  bootcamp: string;
  day: number;
  onClose: () => void;
}

interface AttendanceState {
  [key: string]: {
    name: string;
    checked: boolean;
  };
}

export function TeamAttendanceModal({ bootcamp, day, onClose }: TeamAttendanceModalProps) {
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    loadTeams();
  }, [bootcamp]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getTeamsByCategory(bootcamp);
      
      if (response.success) {
        setTeams(response.teams);
        
        // Initialize attendance state with all team members
        const initialAttendance: AttendanceState = {};
        response.teams.forEach(team => {
          // Add team leader
          if (team.reg_leader && team.reg_leader !== "Not specified") {
            initialAttendance[team.reg_leader] = {
              name: team.team_leader,
              checked: false
            };
          }
          
          // Add team member 1
          if (team.reg_member1 && team.reg_member1 !== "Not specified") {
            initialAttendance[team.reg_member1] = {
              name: team.team_member1,
              checked: false
            };
          }
          
          // Add team member 2
          if (team.reg_member2 && team.reg_member2 !== "Not specified") {
            initialAttendance[team.reg_member2] = {
              name: team.team_member2,
              checked: false
            };
          }
        });
        
        setAttendance(initialAttendance);
      } else {
        setError('Failed to load teams');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading teams');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (regno: string) => {
    setAttendance(prev => ({
      ...prev,
      [regno]: {
        ...prev[regno],
        checked: !prev[regno].checked
      }
    }));
  };

  const submitAttendance = async () => {
    try {
      setSubmitting(true);
      setSubmitMessage(null);
      
      // Get event details
      const eventDetails = ApiService.getEventDetails(bootcamp);
      
      // Prepare attendance records for checked members
      const attendanceRecords: AttendanceRecord[] = Object.entries(attendance)
        .filter(([_, member]) => member.checked)
        .map(([regno, member]) => ({
          regno,
          name: member.name,
          day: day.toString(),
          event_type: eventDetails.event_type,
          category: eventDetails.category
        }));

      if (attendanceRecords.length === 0) {
        setSubmitMessage('Please select at least one person to mark attendance.');
        return;
      }

      const response = await ApiService.submitAttendance({
        attendance_records: attendanceRecords
      });

      if (response.success) {
        setSubmitMessage(`✅ Successfully recorded attendance for ${response.summary.successful} people!`);
        
        // Reset checkboxes after successful submission
        setTimeout(() => {
          setAttendance(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
              updated[key].checked = false;
            });
            return updated;
          });
          setSubmitMessage(null);
        }, 2000);
      } else {
        setSubmitMessage('❌ Failed to submit attendance. Please try again.');
      }
    } catch (err) {
      setSubmitMessage(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCount = Object.values(attendance).filter(member => member.checked).length;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-100">Loading teams...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-4">Error Loading Teams</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={loadTeams}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Retry
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-gray-100 text-center">
            {bootcamp}
            <span className="font-normal text-gray-400 ml-2">| Day {day}</span>
          </h2>
          <p className="text-gray-400 text-center mt-2">
            Select team members to mark attendance ({selectedCount} selected)
          </p>
        </div>

        {/* Teams List */}
        <div className="flex-1 overflow-y-auto p-6">
          {teams.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>No teams found for this category.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {teams.map((team, teamIndex) => (
                <div key={teamIndex} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">{team.team_name}</h3>
                  <div className="space-y-2">
                    {/* Team Leader */}
                    {team.reg_leader && team.reg_leader !== "Not specified" && (
                      <label className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={attendance[team.reg_leader]?.checked || false}
                          onChange={() => handleAttendanceChange(team.reg_leader)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="text-green-400 text-sm font-medium">Team Leader:</span>
                          <div className="text-gray-200">{team.team_leader}</div>
                          <div className="text-gray-400 text-sm">Reg: {team.reg_leader}</div>
                        </div>
                      </label>
                    )}

                    {/* Team Member 1 */}
                    {team.reg_member1 && team.reg_member1 !== "Not specified" && (
                      <label className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={attendance[team.reg_member1]?.checked || false}
                          onChange={() => handleAttendanceChange(team.reg_member1)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="text-yellow-400 text-sm font-medium">Member 1:</span>
                          <div className="text-gray-200">{team.team_member1}</div>
                          <div className="text-gray-400 text-sm">Reg: {team.reg_member1}</div>
                        </div>
                      </label>
                    )}

                    {/* Team Member 2 */}
                    {team.reg_member2 && team.reg_member2 !== "Not specified" && (
                      <label className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={attendance[team.reg_member2]?.checked || false}
                          onChange={() => handleAttendanceChange(team.reg_member2)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="text-purple-400 text-sm font-medium">Member 2:</span>
                          <div className="text-gray-200">{team.team_member2}</div>
                          <div className="text-gray-400 text-sm">Reg: {team.reg_member2}</div>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Message */}
        {submitMessage && (
          <div className="px-6 py-3 border-t border-gray-700">
            <p className={`text-center font-medium ${
              submitMessage.includes('✅') ? 'text-green-400' : 'text-red-400'
            }`}>
              {submitMessage}
            </p>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="p-6 border-t border-gray-700 flex gap-4 justify-between">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Select all
                setAttendance(prev => {
                  const updated = { ...prev };
                  Object.keys(updated).forEach(key => {
                    updated[key].checked = true;
                  });
                  return updated;
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Select All
            </button>
            
            <button
              onClick={() => {
                // Clear all
                setAttendance(prev => {
                  const updated = { ...prev };
                  Object.keys(updated).forEach(key => {
                    updated[key].checked = false;
                  });
                  return updated;
                });
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Clear All
            </button>
            
            <button
              onClick={submitAttendance}
              disabled={submitting || selectedCount === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>Submit Attendance ({selectedCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
