
import { useEffect, useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://localhost:8080/api/v1";

const ATTENDANCE_OPTIONS = ["Present", "Absent", "Sick"];

const STATUS_STYLES = {
  Present: {
    active: "border-emerald-500 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  Absent: {
    active: "border-rose-500 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  Sick: {
    active: "border-amber-500 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
};

function formatDate(dateString) {
  if (!dateString) return "";

  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getSaturdays(year) {
  const dates = [];
  const date = new Date(year, 0, 1, 12);

  while (date.getFullYear() === year && date.getDay() !== 6) {
    date.setDate(date.getDate() + 1);
  }

  while (date.getFullYear() === year) {
    dates.push(getLocalDateString(date));
    date.setDate(date.getDate() + 7);
  }

  return dates;
}

function Icon({ name, className = "h-5 w-5" }) {
  const icons = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    download: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="m7 10 5 5 5-5M12 15V3" />
      </>
    ),
    close: <path d="m18 6-12 12M6 6l12 12" />,
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.5 9a7 7 0 0 1 11.6-2L20 12M4 12l2.9 5a7 7 0 0 0 11.6-2" />
      </>
    ),
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

const Attendance = () => {
  const today = getLocalDateString();
  const currentYear = new Date().getFullYear();

  // Action Unit states
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Class staff states
  const [classStaff, setClassStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Class members states
  const [classMembers, setClassMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Coordinator login states
  const [coordinatorName, setCoordinatorName] = useState("");
  const [coordinator, setCoordinator] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Attendance states
  const [attendance, setAttendance] = useState({});
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState(null);

  // Date states
  const [selectedDate, setSelectedDate] = useState(
    new Date().getDay() === 6
      ? today
      : getSaturdays(currentYear).find((date) => date >= today) ||
          getSaturdays(currentYear)[0]
  );

  const [year, setYear] = useState(currentYear);

  const sabbathDates = useMemo(() => getSaturdays(year), [year]);

  // Fetch all Action Units when the component loads
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);

      try {
        const response = await fetch(`${API_BASE_URL}/classes`);
        const result = await response.json();

        if (!response.ok || result.status !== "ok") {
          throw new Error(
            result.message || "Could not load Action Units."
          );
        }

        setClasses(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error("Fetch Action Units error:", error);
        toast.error(error.message || "Could not load Action Units.");
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // Keep the selected year in sync with the selected Saturday
  useEffect(() => {
    if (!selectedDate) return;

    const [dateYear] = selectedDate.split("-").map(Number);
    setYear(dateYear);
  }, [selectedDate]);

  // Filter members using the search input
  const visibleMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return classMembers.filter((member) =>
      `${member.name} ${member.id}`.toLowerCase().includes(query)
    );
  }, [classMembers, search]);

  // A separate attendance record for each Action Unit and Saturday
  const recordKey = `${selectedClassId}|${selectedDate}`;

  const currentAttendance = attendance[recordKey] || {};

  // Calculate attendance totals
  const counts = useMemo(() => {
    const values = classMembers.map(
      (member) => currentAttendance[member.id]
    );

    return {
      Present: values.filter((value) => value === "Present").length,
      Absent: values.filter((value) => value === "Absent").length,
      Sick: values.filter((value) => value === "Sick").length,
      Unmarked: values.filter((value) => !value).length,
    };
  }, [classMembers, currentAttendance]);

  const isComplete =
    classMembers.length > 0 && counts.Unmarked === 0;

  // Fetch staff and open the coordinator login modal
  async function chooseClass(classId) {
    const selected = classes.find((item) => item.id === classId);

    setSelectedClassId(classId);
    setSelectedClass(selected?.name || "");

    // Reset data from the previously selected Action Unit
    setCoordinator(null);
    setClassStaff([]);
    setClassMembers([]);
    setCoordinatorName("");
    setSearch("");
    setMessage(null);
    setLoginError("");

    if (!classId || !selected) {
      setShowLogin(false);
      return;
    }

    setShowLogin(true);
    setLoadingStaff(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/classes/${encodeURIComponent(classId)}/staffs`
      );

      const result = await response.json();

      if (!response.ok || result.status !== "ok") {
        throw new Error(
          result.message || "Could not load Action Unit staff."
        );
      }

      setClassStaff(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Fetch Action Unit staff error:", error);
      toast.error(error.message || "Could not load Action Unit staff.");
      setShowLogin(false);
    } finally {
      setLoadingStaff(false);
    }
  }

  // Verify that the entered name belongs to a staff member
  // assigned to the selected Action Unit
  async function handleLogin(event) {
    event.preventDefault();

    setLoginError("");

    if (!selectedClassId) {
      setLoginError("Please select an Action Unit.");
      return;
    }

    if (!coordinatorName.trim()) {
      setLoginError("Please enter your full name.");
      return;
    }

    if (loadingStaff) {
      setLoginError("Please wait while Action Unit staff are loading.");
      return;
    }

    if (classStaff.length === 0) {
      setLoginError(
        "No staff members have been assigned to this Action Unit."
      );
      return;
    }

    setIsAuthenticating(true);

    try {
      // Normalise spaces and letter casing before comparing names
      const enteredName = coordinatorName
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

      const matchedStaff = classStaff.find((staff) => {
        const fullName = `${staff.first_name || ""} ${
          staff.last_name || ""
        }`
          .trim()
          .replace(/\s+/g, " ")
          .toLowerCase();

        return fullName === enteredName;
      });

      if (!matchedStaff) {
        setLoginError(
          "Your name does not match any staff member assigned to this Action Unit."
        );
        return;
      }

      // The entered name matches a staff member.
      // Now fetch members belonging to the selected Action Unit.
      setLoadingMembers(true);

      const response = await fetch(
        `${API_BASE_URL}/classes/${encodeURIComponent(
          selectedClassId
        )}/membership`
      );

      const result = await response.json();

      if (!response.ok || result.status !== "ok") {
        throw new Error(
          result.message || "Could not load Action Unit members."
        );
      }

      const members = Array.isArray(result.data) ? result.data : [];

      // Format API member records for the attendance table
      const formattedMembers = members.map((member) => {
        const fullName = `${member.first_name || ""} ${
          member.last_name || ""
        }`
          .trim()
          .replace(/\s+/g, " ");

        return {
          ...member,
          id: member.membership_id || member.id,
          name: fullName,
          gender: member.gender || "",
        };
      });

      setClassMembers(formattedMembers);

      setCoordinator({
        id: matchedStaff.id,
        name: `${matchedStaff.first_name || ""} ${
          matchedStaff.last_name || ""
        }`.trim(),
        className: selectedClass,
      });

      setShowLogin(false);
      setCoordinatorName("");
      setSearch("");

      toast.success(`Access granted for ${selectedClass}.`);
    } catch (error) {
      console.error("Attendance login error:", error);
      setLoginError(error.message || "Login failed. Please try again.");
      toast.error(error.message || "Could not open attendance register.");
    } finally {
      setIsAuthenticating(false);
      setLoadingMembers(false);
    }
  }

  // Mark an individual member's attendance
  function markAttendance(memberId, status) {
    setAttendance((previous) => {
      const oldRecord = previous[recordKey] || {};

      return {
        ...previous,
        [recordKey]: {
          ...oldRecord,
          [memberId]: status,
        },
      };
    });

    setMessage(null);
  }

  // Mark every member as present
  function markAll(status) {
    setAttendance((previous) => {
      const oldRecord = previous[recordKey] || {};
      const updated = { ...oldRecord };

      classMembers.forEach((member) => {
        updated[member.id] = status;
      });

      return {
        ...previous,
        [recordKey]: updated,
      };
    });

    setMessage(null);
  }

  // Clear attendance marks for the selected Action Unit and date
  function clearAttendance() {
    setAttendance((previous) => {
      const updated = { ...(previous[recordKey] || {}) };

      classMembers.forEach((member) => {
        delete updated[member.id];
      });

      return {
        ...previous,
        [recordKey]: updated,
      };
    });

    setMessage(null);
  }

  // Export the currently displayed Action Unit attendance to CSV
  function exportAttendance() {
    if (classMembers.length === 0) {
      toast.warning("There are no members to export.");
      return;
    }

    const headers = [
      "Membership ID",
      "Student Name",
      "Gender",
      "Action Unit",
      "Date",
      "Attendance",
    ];

    const rows = classMembers.map((member) => [
      member.id,
      member.name,
      member.gender || "",
      selectedClass,
      selectedDate,
      currentAttendance[member.id] || "Unmarked",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `attendance-${selectedClass.replace(
      /\s+/g,
      "-"
    )}-${selectedDate}.csv`;

    link.click();
    URL.revokeObjectURL(url);

    toast.success("Attendance CSV exported successfully.");
  }

  // Change the attendance year
  function selectYear(newYear) {
    setYear(newYear);

    const dates = getSaturdays(newYear);

    const nearest =
      dates.find((date) => date >= today) ||
      dates[dates.length - 1];

    setSelectedDate(nearest);
  }

  // Sign out the current coordinator
  function signOut() {
    setCoordinator(null);
    setClassMembers([]);
    setClassStaff([]);
    setCoordinatorName("");
    setSearch("");
    setMessage(null);
    setShowLogin(false);

    toast.info("You have signed out.");
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        theme="light"
      />

      <div
        id="main"
        className="min-h-screen bg-canvas px-4 py-6 text-slate-800 sm:px-6 lg:ml-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Header */}
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white shadow-soft">
                  <Icon name="calendar" className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
                    Sabbath School Attendance
                  </h1>

                  <p className="mt-1 text-sm text-muted">
                    Record and manage weekly class attendance.
                  </p>
                </div>
              </div>
            </div>

            {coordinator && (
              <div className="flex items-center gap-3 self-start rounded-xl border border-line bg-white px-4 py-3 sm:self-auto">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-primary">
                  <Icon name="shield" />
                </div>

                <div>
                  <p className="text-xs text-muted">
                    Signed in as coordinator
                  </p>

                  <p className="text-sm font-bold text-navy">
                    {coordinator.name}
                  </p>

                  <p className="text-xs text-muted">
                    {coordinator.className}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={signOut}
                  className="ml-2 rounded-lg px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                >
                  Sign out
                </button>
              </div>
            )}
          </header>

          {/* Attendance session configuration */}
          <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-primary">
                <Icon name="calendar" />
              </div>

              <div>
                <h2 className="font-bold text-navy">
                  Attendance session
                </h2>

                <p className="text-xs text-muted">
                  Select the Action Unit and the Saturday you are recording.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* Action Unit dropdown */}
              <div>
                <label
                  htmlFor="attendance-class"
                  className="mb-2 block text-sm font-semibold text-navy"
                >
                  Action Unit
                </label>

                <select
                  id="attendance-class"
                  value={selectedClassId}
                  onChange={(event) => chooseClass(event.target.value)}
                  disabled={loadingClasses}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    {loadingClasses
                      ? "Loading Action Units..."
                      : "Choose an Action Unit"}
                  </option>

                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                {loadingClasses && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                    <ClipLoader size={16} color="#2563eb" />
                    Loading Action Units...
                  </div>
                )}
              </div>

              {/* Saturday date dropdown */}
              <div>
                <label
                  htmlFor="attendance-date"
                  className="mb-2 block text-sm font-semibold text-navy"
                >
                  Saturday / Sabbath date
                </label>

                <div className="flex gap-2">
                  <select
                    aria-label="Select attendance year"
                    value={year}
                    onChange={(event) =>
                      selectYear(Number(event.target.value))
                    }
                    className="w-28 rounded-xl border border-line bg-white px-3 py-3 text-sm outline-none focus:border-primary"
                  >
                    {Array.from(
                      { length: 7 },
                      (_, index) => currentYear - 3 + index
                    ).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <select
                    id="attendance-date"
                    value={selectedDate}
                    onChange={(event) => {
                      setSelectedDate(event.target.value);
                      setMessage(null);
                    }}
                    className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-3 text-sm outline-none focus:border-primary"
                  >
                    {sabbathDates.map((date) => (
                      <option key={date} value={date}>
                        {formatDate(date)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {selectedDate && (
              <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl bg-blue-50/70 px-4 py-3 text-sm">
                <Icon
                  name="calendar"
                  className="h-4 w-4 text-primary"
                />

                <span className="text-muted">Selected session:</span>

                <span className="font-bold text-navy">
                  {formatDate(selectedDate)}
                </span>

                {selectedClass && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
                    {selectedClass}
                  </span>
                )}
              </div>
            )}
          </section>

          {/* Loading members */}
          {loadingMembers && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white px-6 py-12 shadow-card">
              <ClipLoader size={38} color="#2563eb" />

              <p className="mt-4 text-sm font-semibold text-navy">
                Loading Action Unit members...
              </p>

              <p className="mt-1 text-xs text-muted">
                Please wait while the attendance register is prepared.
              </p>
            </div>
          )}

          {/* Attendance table */}
          {coordinator && selectedClass && !loadingMembers && (
            <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">

              {/* Table header */}
              <div className="flex flex-col justify-between gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:p-6">
                <div>
                  <h2 className="text-lg font-bold text-navy">
                    Class register
                  </h2>

                  <p className="mt-1 text-xs text-muted">
                    Mark each member Present, Absent, or Sick.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => markAll("Present")}
                    disabled={classMembers.length === 0}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    Mark all present
                  </button>

                  <button
                    type="button"
                    onClick={clearAttendance}
                    disabled={classMembers.length === 0}
                    className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Icon name="refresh" className="h-3.5 w-3.5" />
                    Clear marks
                  </button>
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3 border-b border-line bg-slate-50/60 p-4 sm:grid-cols-4">
                {[
                  {
                    label: "Present",
                    value: counts.Present,
                    color: "text-emerald-700",
                    bg: "bg-emerald-50",
                  },
                  {
                    label: "Absent",
                    value: counts.Absent,
                    color: "text-rose-700",
                    bg: "bg-rose-50",
                  },
                  {
                    label: "Sick",
                    value: counts.Sick,
                    color: "text-amber-700",
                    bg: "bg-amber-50",
                  },
                  {
                    label: "Unmarked",
                    value: counts.Unmarked,
                    color: "text-slate-700",
                    bg: "bg-slate-100",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-xl ${item.bg} p-4`}
                  >
                    <p className={`text-xs font-semibold ${item.color}`}>
                      {item.label}
                    </p>

                    <p className={`mt-1 text-2xl font-extrabold ${item.color}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Search */}
              <div className="border-b border-line p-4 sm:p-5">
                <div className="relative max-w-lg">
                  <Icon
                    name="search"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  />

                  <input
                    type="search"
                    placeholder="Search by name or Membership ID..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-xl border border-line py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <p className="mt-3 text-xs text-muted">
                  Showing {visibleMembers.length} of {classMembers.length}{" "}
                  members.
                </p>
              </div>

              {/* Members table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-5 py-4">No.</th>
                      <th className="px-4 py-4">Member name</th>
                      <th className="px-4 py-4">Gender</th>
                      <th className="px-4 py-4">Present</th>
                      <th className="px-4 py-4">Absent</th>
                      <th className="px-4 py-4">Sick</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line">
                    {visibleMembers.map((member) => {
                      const current = currentAttendance[member.id];

                      return (
                        <tr
                          key={member.id}
                          className="transition hover:bg-slate-50/80"
                        >
                          <td className="px-5 py-4 text-xs text-muted">
                            {classMembers.findIndex(
                              (item) => item.id === member.id
                            ) + 1}
                          </td>

                      
                          <td className="px-4 py-4">
                            <p className="text-sm font-semibold text-navy">
                              {member.name}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-xs text-muted">
                            {member.gender || "—"}
                          </td>

                          {ATTENDANCE_OPTIONS.map((status) => (
                            <td key={status} className="px-4 py-4">
                              <label className="inline-flex cursor-pointer items-center justify-center">
                                <input
                                  type="radio"
                                  name={`attendance-${recordKey}-${member.id}`}
                                  value={status}
                                  checked={current === status}
                                  onChange={() =>
                                    markAttendance(member.id, status)
                                  }
                                  className="sr-only"
                                  aria-label={`${member.name}: ${status}`}
                                />

                                <span
                                  className={`grid h-9 w-9 place-items-center rounded-xl border-2 transition ${
                                    current === status
                                      ? STATUS_STYLES[status].active
                                      : "border-slate-200 bg-white text-slate-300 hover:border-slate-300"
                                  }`}
                                >
                                  {current === status ? (
                                    <Icon
                                      name="check"
                                      className="h-4 w-4"
                                    />
                                  ) : (
                                    <span className="h-2 w-2 rounded-full bg-current" />
                                  )}
                                </span>
                              </label>
                            </td>
                          ))}
                        </tr>
                      );
                    })}

                    {visibleMembers.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-12 text-center text-sm text-muted"
                        >
                          {classMembers.length === 0
                            ? "No members have been added to this Action Unit."
                            : "No members match your search."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table footer */}
              <div className="flex flex-col justify-between gap-4 border-t border-line p-5 sm:flex-row sm:items-center sm:p-6">
                <div>
                  <p className="text-sm font-semibold text-navy">
                    {isComplete
                      ? "All members have been marked."
                      : `${counts.Unmarked} members still need attendance marks.`}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Attendance marks are currently held in this page only.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={exportAttendance}
                    className="flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy hover:bg-slate-50"
                  >
                    <Icon name="download" className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Initial state */}
          {!coordinator && (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-primary">
                <Icon name="users" className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-navy">
                Ready to record attendance?
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                Select an Action Unit above. You will be asked to verify
                your name against the staff assigned to that Action Unit
                before the attendance register opens.
              </p>

              <button
                type="button"
                onClick={() => {
                  if (!selectedClassId) {
                    toast.warning("Please select an Action Unit first.");
                    return;
                  }

                  setShowLogin(true);
                }}
                disabled={!selectedClassId}
                className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon name="lock" className="h-4 w-4" />
                  Login as Care Coordinator
                </span>
              </button>
            </section>
          )}

          {/* Footer message */}
          <p className="text-center text-xs text-muted">
            Sabbath School Attendance Management · Coordinator access
          </p>
        </div>

        {/* Care Coordinator login modal */}
        {showLogin && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowLogin(false);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="coordinator-login-title"
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              {/* Modal header */}
              <div className="bg-navy px-6 py-7 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
                    <Icon name="shield" className="h-6 w-6" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLogin(false)}
                    className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
                    aria-label="Close login"
                  >
                    <Icon name="close" />
                  </button>
                </div>

                <h2
                  id="coordinator-login-title"
                  className="mt-5 text-xl font-extrabold"
                >
                  Care Coordinator Login
                </h2>

                <p className="mt-2 text-sm text-blue-100">
                  Verify your name to mark attendance for {selectedClass}.
                </p>
              </div>

              {/* Login form */}
              <form onSubmit={handleLogin} className="space-y-5 p-6">

                {/* Selected Action Unit */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy">
                    Selected Action Unit
                  </label>

                  <div className="rounded-xl border border-line bg-slate-50 px-4 py-3 text-sm font-semibold text-navy">
                    {selectedClass}
                  </div>
                </div>

                {/* Coordinator name */}
                <div>
                  <label
                    htmlFor="coordinator-name"
                    className="mb-2 block text-sm font-semibold text-navy"
                  >
                    Your full name
                  </label>

                  <input
                    id="coordinator-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={coordinatorName}
                    onChange={(event) => {
                      setCoordinatorName(event.target.value);
                      setLoginError("");
                    }}
                    disabled={loadingStaff || isAuthenticating}
                    className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                    placeholder="Enter your registered full name"
                  />
                </div>

                {/* Staff loading indicator */}
                {loadingStaff && (
                  <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-4">
                    <ClipLoader size={22} color="#2563eb" />

                    <p className="text-xs font-medium text-navy">
                      Checking Action Unit staff...
                    </p>
                  </div>
                )}

                {/* No staff assigned */}
                {!loadingStaff && classStaff.length === 0 && (
                  <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                    No staff members were found for this Action Unit.
                    Please contact the administrator.
                  </p>
                )}

                {/* Login error */}
                {loginError && (
                  <p
                    role="alert"
                    className="rounded-lg bg-rose-50 p-3 text-xs leading-5 text-rose-700"
                  >
                    {loginError}
                  </p>
                )}

                {/* Access information */}
                <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-muted">
                  <span className="font-semibold text-navy">
                    Authorised access only.
                  </span>{" "}
                  Your name must match a staff member assigned to the
                  selected Action Unit.
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={
                    isAuthenticating ||
                    loadingStaff ||
                    classStaff.length === 0 ||
                    loadingMembers
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-soft hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAuthenticating || loadingMembers ? (
                    <>
                      <ClipLoader size={18} color="#ffffff" />
                      <span>Verifying and loading...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="lock" className="h-4 w-4" />
                      Verify and continue
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Attendance;
