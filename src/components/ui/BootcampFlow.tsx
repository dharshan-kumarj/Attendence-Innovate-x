

interface BootcampCardProps {
  title: string;
  color: string;
  onClick: () => void;
  className?: string;
}

export function BootcampCard({ title, color, onClick, className }: BootcampCardProps) {
  return (
    <button
      className={`rounded-xl shadow-xl p-7 text-gray-100 font-bold text-xl transition-transform transform hover:scale-105 hover:shadow-2xl border-2 border-gray-700/40 ${color} ${className || ''}`}
      onClick={onClick}
    >
      {title}
    </button>
  );
}

interface DaySelectorProps {
  onSelectDay: (day: number) => void;
  onClose: () => void;
  bootcamp?: string;
  className?: string;
}

export function DaySelector({ onSelectDay, onClose, bootcamp }: DaySelectorProps) {
  // Determine number of days
  const isHackathon = bootcamp?.toLowerCase().includes('hackathon');
  const days = isHackathon ? [1, 2] : [1, 2, 3, 4, 5];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-8 shadow-2xl w-80 flex flex-col items-center border border-gray-700">
        <h2 className="text-xl font-extrabold mb-6 text-gray-100">Select Day</h2>
        <div className={`grid ${days.length > 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mb-8 w-full`}>
          {days.map((day) => (
            <button
              key={day}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow w-full"
              onClick={() => onSelectDay(day)}
            >
              Day {day}
            </button>
          ))}
        </div>
        <button
          className="text-gray-400 hover:text-gray-200 font-medium"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

