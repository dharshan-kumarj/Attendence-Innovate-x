import { useState } from 'react';
import { BootcampCard, DaySelector } from './components/ui/BootcampFlow';
import { TeamAttendanceModal } from './components/ui/TeamAttendanceModal';

const bootcamps = [
	{ title: 'AI/ML Bootcamp', color: 'bg-indigo-900 shadow-xl' },
	{ title: 'Cyber Bootcamp', color: 'bg-cyan-900 shadow-xl' },
	{ title: 'Full-Stack Bootcamp', color: 'bg-green-900 shadow-xl' },
	{ title: 'Innovate-X Hackathon', color: 'bg-red-900 shadow-xl' },
];

export default function MobileBootcamp() {
	const [selectedBootcamp, setSelectedBootcamp] = useState<string | null>(null);
	const [selectedDay, setSelectedDay] = useState<number | null>(null);
	const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);

	return (
		<div className="min-h-screen bg-gradient-to-tr from-gray-950 via-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
			<h1 className="text-4xl font-extrabold mb-8 text-center text-gray-100 drop-shadow-lg tracking-tight">
				Bootcamp Attendance
			</h1>
			<div className="grid grid-cols-1 gap-8 w-full max-w-md">
				{bootcamps.map((camp) => (
					<BootcampCard
						key={camp.title}
						title={camp.title}
						color={camp.color}
						onClick={() => setSelectedBootcamp(camp.title)}
					/>
				))}
			</div>
	  {selectedBootcamp && !selectedDay && (
		<DaySelector
		  bootcamp={selectedBootcamp}
		  onSelectDay={(day: number) => {
			setSelectedDay(day);
			setAttendanceModalOpen(true);
		  }}
		  onClose={() => setSelectedBootcamp(null)}
		/>
	  )}
			{attendanceModalOpen && selectedBootcamp && selectedDay && (
				<TeamAttendanceModal
					bootcamp={selectedBootcamp}
					day={selectedDay}
					onClose={() => {
						setAttendanceModalOpen(false);
						setSelectedBootcamp(null);
						setSelectedDay(null);
					}}
				/>
			)}
		</div>
	);
}
