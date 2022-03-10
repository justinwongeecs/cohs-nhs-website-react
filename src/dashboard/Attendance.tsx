import React, { useState, useEffect } from "react";
import Collapsible from "react-collapsible";
import {AttendedEvent, Event, Student } from "../App";
import DashboardPagination, { DashboardPaginationKeys } from "../components/DashboardPagination";
import DropdownHeader, { DropdownHeaderStates } from "../components/DropdownHeader";
import SpinnerNode from "../components/Spinner";

interface AttendanceProps {
  student: Student | undefined;
  events: Event[];
  isLoading: boolean;
}

interface CategorizedAttendanceEventsViewProps {
  events: Event[];
  student: Student | undefined;
}

interface AttendanceEventProps {
  event: Event;
  student: Student | undefined;
}

const Attendance: React.FC<AttendanceProps> = ({ student, isLoading, events }) => {
  const [priorEvents, setPriorEvents] = useState<Event[]>([]);
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    findAndCategorizeEvents();
  }, [events, student?.attendance]);

  const findAndCategorizeEvents = () => {
    const priorEventsList: Event[] = [];
    const todayEventsList: Event[] = [];
    const upcomingEventsList: Event[] = [];

    events.forEach((event: Event) => {
      if (event.startDate < new Date()) {
        priorEventsList.push(event);
      } else if (event.startDate > new Date()) {
        upcomingEventsList.push(event);
      } else {
        todayEventsList.push(event);
      }
    });

    setPriorEvents(priorEventsList);
    setTodayEvents(todayEventsList);
    setUpcomingEvents(upcomingEventsList);
  };

  if (isLoading) {
    return <SpinnerNode />;
  }
  return (
    <main>
      <h1 className="text-4xl font-bold">Attendance</h1>
      <DashboardPagination
        defaultActiveKey={DashboardPaginationKeys.Attendance}
      />

      {student?.attendance.length === 0 ? (
        <h4 className="no-found small-glass">No Events Attended</h4>
      ) : (
        <>
          <Collapsible
            trigger={
              <DropdownHeader
                text={"Prior Events"}
                ddState={DropdownHeaderStates.Closed}
                list={priorEvents}
              />
            }
            triggerWhenOpen={
              <DropdownHeader
                text={"Prior Events"}
                ddState={DropdownHeaderStates.Open}
                list={priorEvents}
              />
            }
          >
            <CategorizedAttendanceEventsView events={priorEvents} student={student} />
          </Collapsible>
          <Collapsible
            trigger={
              <DropdownHeader
                text={"Today"}
                ddState={DropdownHeaderStates.Closed}
                list={todayEvents}
              />
            }
            triggerWhenOpen={
              <DropdownHeader
                text={"Today"}
                ddState={DropdownHeaderStates.Open}
                list={todayEvents}
              />
            }
          >
            <CategorizedAttendanceEventsView events={todayEvents} student={student} />
          </Collapsible>
          <Collapsible
            trigger={
              <DropdownHeader
                text={"Upcoming Events"}
                ddState={DropdownHeaderStates.Closed}
                list={upcomingEvents}
              />
            }
            triggerWhenOpen={
              <DropdownHeader
                text={"Upcoming Events"}
                ddState={DropdownHeaderStates.Open}
                list={upcomingEvents}
              />
            }
          >
            <CategorizedAttendanceEventsView events={upcomingEvents} student={student} />
          </Collapsible>
        </>
      )}
    </main>
  );
};

const CategorizedAttendanceEventsView: React.FC<CategorizedAttendanceEventsViewProps> = ({events, student}) => {

  const [yearCategories, setYearCategories] = useState<string[]>([]);
  const [yearSelectionIndex, setYearSelectionIndex] = useState<number>(0);

  useEffect(() => {
    createYearCategories();
  }, [events]);

  const createYearCategories = () => {
    var items: string[] = [];
    events.forEach((event) => {
      const eventYear = event.startDate.getFullYear().toString();
      if (eventYear !== items[items.length - 1]) {
        items.push(eventYear);
      }
    });
    setYearCategories(items);
  }

  const reverseYearSelectionIndex = () => {
    const nextYearSelectionIndex = yearSelectionIndex - 1;
    if (nextYearSelectionIndex >= 0 ) {
      setYearSelectionIndex(nextYearSelectionIndex);
    }
  }

  const advanceYearSelectionIndex = () => {
    const nextYearSelectionIndex = yearSelectionIndex + 1;
    if (nextYearSelectionIndex < yearCategories.length) {
      setYearSelectionIndex(nextYearSelectionIndex);
    }
  }

  return (
    <div>
       <div className="flex items-center w-full my-2">
        <button disabled={yearSelectionIndex === 0} onClick={reverseYearSelectionIndex}>
          {
            yearSelectionIndex === 0  ?
            <i className="fas fa-chevron-left bg-indigo-200 py-1 px-2 rounded-full text-white mx-3 focus:outline-none"></i> :
            <i className="fas fa-chevron-left bg-indigo-300 hover:bg-indigo-400 py-1 px-2 rounded-full text-white mx-3 focus:outline-none"></i>
          }
          
        </button>
        <div className="flex-grow"></div>
        <p className="font-bold text-xl">{yearCategories[yearSelectionIndex]}</p>
        <div className="flex-grow"></div>
        <button disabled={yearSelectionIndex === yearCategories.length - 1} onClick={advanceYearSelectionIndex}>
          {
            yearSelectionIndex === yearCategories.length - 1 ?
            <i className="fas fa-chevron-right bg-indigo-200 py-1 px-2 rounded-full text-white mx-3 focus:outline-none"></i> :
            <i className="fas fa-chevron-right bg-indigo-300 hover:bg-indigo-400 py-1 px-2 rounded-full text-white mx-3 active:outline-none"></i>
          }
        </button>
      </div>
      
      <div className="space-y-5">
        {events.filter((event: Event) => event.startDate.getFullYear().toString() === yearCategories[yearSelectionIndex]).map(
          (event: Event, index: number) => (
            <AttendanceEvent event={event} student={student} key={index} />
          )
        )}
      </div>
    </div>
  );
}

const AttendanceEvent: React.FC<AttendanceEventProps> = ({ event, student }) => {

  const [attendedEvent, setAttendedEvent] = useState<AttendedEvent>();

  useEffect(() => {
    getAttendedEvent();
  }, [event, student]);

  const getAttendedEvent = () => {
    student?.attendance.forEach((attendedEvent) => {
      if (event.code === attendedEvent.code) {
        setAttendedEvent({
          code: event.code,
          didAttend: attendedEvent.didAttend,
          localEventName: attendedEvent.localEventName,
          projectHours: attendedEvent.projectHours,
          startDate: attendedEvent.startDate
        });
      }
    });
  }

  return (
    <div className="bg-white/60 p-3 rounded-2xl flex flex-col items-center space-y-3">
      <h4 className="text-xl text-center font-bold">{event.name}</h4>
      <h4>{event.startDate ? event.startDate.toLocaleDateString("en-US") : ""}</h4>
      <div className="flex space-x-3">
        <p className={attendedEvent?.didAttend ? "bg-emerald-400 text-white font-bold w-fit rounded-full p-0.5 px-2" : "bg-red-400 text-white font-bold w-fit rounded-full p-0.5 px-2"}>
          {attendedEvent?.didAttend ? "Present" : "Absent"}
        </p>
        {attendedEvent?.projectHours ? (
              <p className="bg-blue-400 rounded-full py-0.5 px-3 w-fit text-white space-x-2">
                <strong className="honor-point-value">{attendedEvent?.projectHours}</strong>
                <i className="far fa-clock"></i>
              </p>
          
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Attendance;
