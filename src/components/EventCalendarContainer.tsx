import EventCalendar from "./EventCalendar";
import EventList from "./EventList";

interface EventListProps {
  dateParam?: string;
}

const EventCalendarContainer = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { date } = searchParams;
  return (
    <div className="bg-white p-4 rounded-md">
      <EventCalendar />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Wydarzenia</h1>
      </div>
      <div className="flex flex-col gap-4">
        <EventList date={date} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;