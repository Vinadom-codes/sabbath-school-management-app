
import { useCallback, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddMember from "../components/AddMember";

const API_BASE = "http://localhost:8080/api/v1";

const emptyMemberForm = {
  class_name: "",
  start_date: "",
  end_date: "",
};

const emptyStaffForm = {
  user_id: "",
  role: "",
};

const emptyClassForm = {
  name: "",
  period_start: "",
  period_end: "",
};

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.status === "error") {
    throw new Error(
      result.message || `Request failed (${response.status})`
    );
  }

  return result;
}

function getFullName(person) {
  return [person.first_name, person.last_name]
    .filter(Boolean)
    .join(" ") || "Unnamed user";
}

function isValidUUID(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString();
}

function DataTable({title, people, search, setSearch, loading, emptyMessage, showRole = false,}) {
  const filteredPeople = people.filter((person) => {
    const searchableText = [person.first_name, person.last_name, person.email, person.phone, person.gender, person.role,]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search.toLowerCase().trim());
  });

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {filteredPeople.length} {filteredPeople.length === 1 ? "person" : "people"}
          </p>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, phone..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-xs"
          aria-label={`Search ${title}`}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Name</th>
              <th className="px-5 py-4 font-semibold">Email</th>
              <th className="px-5 py-4 font-semibold">Phone Number</th>
              <th className="px-5 py-4 font-semibold">Gender</th>
              {showRole && (
                <th className="px-5 py-4 font-semibold">Role</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={showRole ? 4 : 3}
                  className="px-5 py-12 text-center"
                >
                  <ClipLoader color="#2563eb" size={30} />
                  <p className="mt-3 text-slate-500">
                    Loading {title.toLowerCase()}...
                  </p>
                </td>
              </tr>
            ) : filteredPeople.length === 0 ? (
              <tr>
                <td
                  colSpan={showRole ? 4 : 3}
                  className="px-5 py-12 text-center text-slate-500"
                >
                  {people.length === 0
                    ? emptyMessage
                    : "No matching records found."}
                </td>
              </tr>
            ) : (
              filteredPeople.map((person) => (
                <tr
                  key={person.id}
                  className="transition hover:bg-blue-50/50"
                >
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                    {getFullName(person)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {person.email || "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {person.phone || "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {person.gender || "—"}
                  </td>
                  {showRole && (
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {person.role || "Staff"}
                      </span>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");

  const [members, setMembers] = useState([]);
  const [staff, setStaff] = useState([]);

  const [membersSearch, setMembersSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const [submittingMember, setSubmittingMember] = useState(false);
  const [submittingStaff, setSubmittingStaff] = useState(false);

  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);

  const [memberForm, setMemberForm] = useState({
  user_id: "",
});
  const [staffForm, setStaffForm] = useState(emptyStaffForm);

    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(false);

    
const [showClassModal, setShowClassModal] = useState(false);
const [submittingClass, setSubmittingClass] = useState(false);

const [classForm, setClassForm] = useState({
  ...emptyClassForm,
});


  const selectedClass = classes.find(
    (item) => item.id === selectedClassId
  );

  // Attendance management
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendanceDraft, setAttendanceDraft] = useState({});
  const [submittingAttendance, setSubmittingAttendance] = useState(false);
  const [showAttendanceDetails, setShowAttendanceDetails] = useState(false);
  const [selectedAttendanceGroup, setSelectedAttendanceGroup] = useState(null);
  const [editingAttendance, setEditingAttendance] = useState(false);
  const [attendanceEditDraft, setAttendanceEditDraft] = useState({});

  const isSaturday = (value) => {
    if (!value) return false;
    return new Date(`${value}T00:00:00`).getDay() === 6;
  };

  const canEditAttendance = (recordedAt) => {
    if (!recordedAt) return false;
    const recordedTime = new Date(recordedAt).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return (
      Number.isFinite(recordedTime) &&
      Date.now() >= recordedTime &&
      Date.now() - recordedTime < twentyFourHours
    );
  };

  const fetchAttendance = useCallback(async (classId) => {
    if (!classId) {
      setAttendanceRecords([]);
      return;
    }

    setLoadingAttendance(true);
    try {
      const result = await apiRequest(
        `/classes/${encodeURIComponent(classId)}/attendance`
      );
      setAttendanceRecords(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setAttendanceRecords([]);
      toast.error(`Could not load attendance records: ${error.message}`);
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  const attendanceGroups = Object.values(
    attendanceRecords.reduce((groups, record) => {
      const date = record.attendance_date;
      if (!date) return groups;
      if (!groups[date]) groups[date] = { date, records: [] };
      groups[date].records.push(record);
      return groups;
    }, {})
  ).sort((a, b) => b.date.localeCompare(a.date));

  const handleAttendanceStatus = (userId, status) => {
    setAttendanceDraft((current) => ({
      ...current,
      [userId]: {
        ...current[userId],
        status: current[userId]?.status === status ? "" : status,
      },
    }));
  };

  
const handleSubmitAttendance = async (event) => {
  event.preventDefault();

  if (!selectedClassId) {
    toast.error("Please select an Action Unit first.");
    return;
  }

  if (!isSaturday(attendanceDate)) {
    toast.error("Attendance can only be recorded for a Saturday.");
    return;
  }

  if (members.length === 0) {
    toast.error("There are no members in this Action Unit.");
    return;
  }

  const incompleteMember = members.find(
    (member) => !attendanceDraft[member.id]?.status
  );

  if (incompleteMember) {
    toast.error(
      `Please mark ${getFullName(incompleteMember)} as present or absent.`
    );
    return;
  }

  setSubmittingAttendance(true);

  const results = [];

  try {
    // Submit attendance records one after another
    for (const member of members) {
      const payload = [ {
        attendance_date: attendanceDate,
        notes: attendanceDraft[member.id]?.notes?.trim() || "",
        status: attendanceDraft[member.id].status,
        user_id: member.user_id || member.id,
      }
      ];

      try {
        await apiRequest(
          `/classes/${encodeURIComponent(selectedClassId)}/attendance`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        results.push({
          member: getFullName(member),
          success: true,
        });
      } catch (error) {
        console.error(
          `Attendance failed for ${getFullName(member)}:`,
          error
        );

        results.push({
          member: getFullName(member),
          success: false,
          error: error.message,
        });
      }
    }

    // Calculate submission results
    const successful = results.filter(
      (item) => item.success
    ).length;

    const failed = results.length - successful;

    console.log("Attendance submission results:", results);

    // Refresh attendance history once, after all requests
    await fetchAttendance(selectedClassId);

    // Close and reset only when every record succeeds
    if (failed === 0) {
      setShowAttendanceModal(false);
      setAttendanceDraft({});
      setAttendanceDate("");

      toast.success(
        `${successful} attendance record(s) saved successfully.`
      );
    } else if (successful > 0) {
      toast.warning(
        `${successful} attendance record(s) saved; ${failed} failed. Please review before retrying.`
      );
    } else {
      toast.error(
        "No attendance records were saved. Please try again."
      );
    }
  } catch (error) {
    console.error("Attendance submission error:", error);
    toast.error(
      error.message || "Unable to refresh attendance records."
    );
  } finally {
    setSubmittingAttendance(false);
  }
};


  const openAttendanceDetails = (group) => {
    setSelectedAttendanceGroup(group);
    setAttendanceEditDraft(
      Object.fromEntries(
        group.records.map((record) => [
          record.id,
          { status: record.status, notes: record.notes || "" },
        ])
      )
    );
    setEditingAttendance(false);
    setShowAttendanceDetails(true);
  };

  // Placeholder for the future PUT integration. No update request is sent yet.
  const handleUpdateAttendance = () => {
    toast.info("Attendance editing will be enabled when the PUT endpoint is available.");
  };


//   Get all sabbath school class members
const fetchUsers = async () => {
  setLoadingUsers(true);

  try {
    const response = await fetch("http://localhost:8080/api/v1/users");
    const result = await response.json();
    
    if (!response.ok || result.status !== "ok") {
      throw new Error("Failed to fetch registered users.");
    }

    setUsers(Array.isArray(result.data) ? result.data : []);
  } catch (error) {
    toast.error(error.message || "Could not load users.");
  } finally {
    setLoadingUsers(false);
  }
};
useEffect(() => {
  fetchUsers();

}, []);

  // 1. Get all Sabbath School classes/units.
  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true);

    try {
      const result = await apiRequest("/classes");
      const items = Array.isArray(result.data) ? result.data : [];

      setClasses(items);

      setSelectedClassId("");
    //   setSelectedClassId((currentId) => {
    //     if (items.some((item) => item.id === currentId)) {
    //       return currentId;
    //     }

    //     return items[0]?.id || "";
    //   });
    } catch (error) {
      toast.error(`Could not load classes: ${error.message}`);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // 2. Get the selected class's members.
  const fetchMembers = useCallback(async (classId) => {
    if (!classId) {
      setMembers([]);
      return;
    }

    setLoadingMembers(true);

    try {
      const result = await apiRequest(
        `/classes/${encodeURIComponent(classId)}/membership`
      );

      setMembers(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setMembers([]);
      toast.error(`Could not load members: ${error.message}`);
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  // 3. Get the selected class's staff.
  const fetchStaff = useCallback(async (classId) => {
    if (!classId) {
      setStaff([]);
      return;
    }

    setLoadingStaff(true);

    console.log("Fetching staff for class:", classId);
    try {
      const result = await apiRequest(
        `/classes/${encodeURIComponent(classId)}/staffs`
      );
 
      setStaff(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setStaff([]);
      toast.error(`Could not load staff: ${error.message}`);
    } finally {
      setLoadingStaff(false);
    }
  }, []);


// const fetchStaff = useCallback(async (classId) => {
//   if (!classId) {
//     setStaff([]);
//     return;
//   }

//   setLoadingStaff(true);

//   try {
//     const result = await apiRequest(
//       `/classes/${encodeURIComponent(classId)}/staffs`
//     );

//     console.log("Requested class ID:", classId);
//     console.table(
//       (result.data || []).map((person) => ({
//         id: person.id,
//         name: `${person.first_name} ${person.last_name}`,
//         role: person.role,
//       }))
//     );

//     setStaff(Array.isArray(result.data) ? result.data : []);
//   } catch (error) {
//     setStaff([]);
//     toast.error(`Could not load staff: ${error.message}`);
//   } finally {
//     setLoadingStaff(false);
//   }
// }, []);


  // Whenever the selected class changes, reload its data.
  useEffect(() => {
    setMembersSearch("");
    setStaffSearch("");
    setShowMemberForm(false);
    setShowStaffForm(false);

    if (!selectedClassId) {
      setMembers([]);
      setStaff([]);
      return;
    }

    fetchMembers(selectedClassId);
    fetchStaff(selectedClassId);
  }, [selectedClassId, fetchMembers, fetchStaff]);

  useEffect(() => {
    if (!selectedClassId) {
      setAttendanceRecords([]);
      return;
    }
    fetchAttendance(selectedClassId);
  }, [selectedClassId, fetchAttendance]);
 
   
 // 4. Add an existing user to the selected class.
 
// const handleAddMember = async (event) => {
//   event.preventDefault();

//   // 1. Validate the selected Action Unit.
//   if (!selectedClassId) {
//     toast.error("Please select an Action Unit");
//     return;
//   }

//   // 2. Validate the selected member.
//   if (!selectedUserId) {
//     toast.error("Please select a member");
//     return;
//   }

//   // 3. Check whether the member already exists in this Action Unit.
//   const memberExists = members.some(
//     (member) => member.id === selectedUserId
//   );

//   if (memberExists) {
//     toast.error("This member already belongs to the selected Action Unit.");
//     return;
//   }

//   setSubmittingMember(true);

//   try {
//     // 4. Add the member to the selected Action Unit.
//     const response = await fetch(
//       `http://localhost:8080/api/v1/classes/${selectedClassId}/membership`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           user_id: selectedUserId,
//         }),
//       }
//     );

//     const result = await response.json();

//     if (!response.ok || result.status !== "ok") {
//       throw new Error(
//         result.message || "Failed to add member to Action Unit."
//       );
//     }

//     // 5. Find the selected member's name for the success message.
//     const selectedMember = users.find(
//       (user) => user.id === selectedUserId
//     );

//     const memberName = selectedMember
//       ? `${selectedMember.first_name} ${selectedMember.last_name}`
//       : "Member";

//     toast.success(
//       `${memberName} added to the Action Unit successfully!`
//     );

//     // 6. Reset the form.
//     setSelectedUserId("");

//     // 7. Fetch the updated membership list.
//     const membersResponse = await fetch(
//       `http://localhost:8080/api/v1/classes/${selectedClassId}/membership`
//     );

//     const membersResult = await membersResponse.json();

//     if (membersResponse.ok && membersResult.status === "ok") {
//       setMembers(
//         Array.isArray(membersResult.data)
//           ? membersResult.data
//           : []
//       );
//     }

//   } catch (error) {
//     console.error("Add member error:", error);
//     toast.error(error.message || "Something went wrong.");
//   } finally {
//     setSubmittingMember(false);
//   }
// };


// Handle Add Staff
const handleAddStaff = async (event) => {
  event.preventDefault();

  // Validate the selected class
  if (!selectedClass?.id) {
    toast.error("Please select a class first.");
    return;
  }

  // Validate the selected user
  if (!staffForm.user_id) {
    toast.error("Please select a registered user.");
    return;
  }

  // Validate the role
  if (!staffForm.role.trim()) {
    toast.error("Please enter a staff role.");
    return;
  }

 const staffExists = staff.some(
   (person) => person.id === staffForm.user_id
);

if (staffExists) {
  toast.error(
    "This user is already registered as staff in this Action Unit."
  );
  return;
}

  setSubmittingStaff(true);

  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/classes/${selectedClass.id}/staffs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          user_id: staffForm.user_id,
          role: staffForm.role.trim(),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.status !== "ok") {
      throw new Error(
        result.message || "Failed to add staff to the class."
      );
    }

    toast.success(
      `Staff added to ${selectedClass.name} successfully!`
    );

    // Fetch the updated staff list
    const staffResponse = await fetch(
      `http://localhost:8080/api/v1/classes/${selectedClass.id}/staffs`
    );

    const staffResult = await staffResponse.json();

    if (!staffResponse.ok || staffResult.status !== "ok") {
      throw new Error(
        "Staff was added, but refreshing the staff table failed."
      );
    }

    setStaff(
      Array.isArray(staffResult.data) ? staffResult.data : []
    );

    // Reset the form
    setStaffForm({
      ...emptyStaffForm,
    });

  } catch (error) {
    console.error("Add staff error:", error);
    toast.error(error.message || "Something went wrong.");
  } finally {
    setSubmittingStaff(false);
  }
};

// Adding an action unit

const handleCreateClass = async (event) => {
  event.preventDefault();

  if (!classForm.name.trim()) {
    toast.error("Please enter an action unit name.");
    return;
  }

  if (!classForm.period_start || !classForm.period_end) {
    toast.error("Please select both start and end dates.");
    return;
  }

  if (classForm.period_end < classForm.period_start) {
    toast.error("End date cannot be before the start date.");
    return;
  }

  setSubmittingClass(true);

  try {
    const response = await fetch(
      "http://localhost:8080/api/v1/classes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          name: classForm.name.trim(),
          period_start: classForm.period_start,
          period_end: classForm.period_end,
        }),
      }
    );

    const result = await response.json();

    console.log("Create class response:", result);

    if (!response.ok || result.status !== "ok") {
      throw new Error(
        result.message || "Failed to create action unit."
      );
    }

    toast.success("Action unit created successfully!");

    setClassForm({ ...emptyClassForm });
    setShowClassModal(false);

    // Refresh the classes list
    await fetchClasses();
  } catch (error) {
    console.error("Create class error:", error);
    toast.error(error.message || "Something went wrong.");
  } finally {
    setSubmittingClass(false);
  }
};

// EXPORT CLASS UNIT
const handleExportActionUnit = () => {
//   if (!selectedClass) {
//     toast.error("Please select an Action Unit.");
//     return;
//   }

//   if (members.length === 0 && staff.length === 0) {
//     toast.error("No staff or members available to export.");
//     return;
//   }

//   // Get IDs of users already in the members list
//   const memberIds = new Set(
//     members.map((member) => member.id)
//   );

//   // Exclude staff who are already listed as members
//   const uniqueStaff = staff.filter(
//     (person) => !memberIds.has(person.id)
//   );

//   // Combine staff first, followed by regular members
//   const exportData = [
//     ...uniqueStaff.map((person) => ({
//       name: getFullName(person),
//       category: "STAFF",
//       role: person.role || "",
//       email: person.email || "",
//       phone: person.phone ? `="${person.phone}"` : "",
//     })),

//     ...members.map((person) => ({
//       name: getFullName(person),
//       category: "MEMBER",
//       role: "",
//       email: person.email || "",
//       phone: person.phone ? `="${person.phone}"` : "",
//     })),
//   ];

// // Get IDs of users already in the members list
// const memberIds = new Set(
//   members.map((member) => member.id)
// );

// // Remove staff who are already listed as members
// const uniqueStaff = staff.filter(
//   (person) => !memberIds.has(person.id)
// );

// // Sort staff by role
// const sortedStaff = [...uniqueStaff].sort((a, b) => {
//   const roleOrder = {
//     teacher: 1,
//     "leader 1": 2,
//     "leader 2": 3,
//   };

//   return (
//     (roleOrder[a.role?.toLowerCase()] || 99) -
//     (roleOrder[b.role?.toLowerCase()] || 99)
//   );
// });

// // Staff first, followed by regular members
// const exportData = [
//   ...sortedStaff.map((person) => ({
//     name: getFullName(person),
//     category: "STAFF",
//     role: person.role || "Staff",
//     email: person.email || "",
//     phone: person.phone || "",
//   })),

//   ...members.map((person) => ({
//     name: getFullName(person),
//     category: "MEMBER",
//     role: "",
//     email: person.email || "",
//     phone: person.phone || "",
//   })),
// ];

// console.log(staff.map(person => ({
//   name: getFullName(person),
//   role: person.role
// })));
//   // CSV escaping helper
//   const escapeCSV = (value) => {
//     const text = String(value ?? "");
//     return `"${text.replace(/"/g, '""')}"`;
//   };

//   // Create CSV content
//   const title = `MEMBERS OF ${selectedClass.name.toUpperCase()}`;

//   const headers = [
//     "S/N",
//     "NAME",
//     "CATEGORY",
//     "ROLE",
//     "EMAIL",
//     "PHONE NUMBER",
//   ];

//   const rows = exportData.map((person, index) => [
//     index + 1,
//     person.name,
//     person.category,
//     person.role,
//     person.email,
//     person.phone ? `="${person.phone}"` : "",
//   ]);

    // Get IDs of all staff members
const staffIds = new Set(
  staff.map((person) => person.id)
);

// Sort staff by role
const sortedStaff = [...staff].sort((a, b) => {
  const roleOrder = {
    teacher: 1,
    "leader 1": 2,
    "leader 2": 3,
    "care coordinator": 4,
  };

  const roleA = roleOrder[a.role?.trim().toLowerCase()] ?? 99;
  const roleB = roleOrder[b.role?.trim().toLowerCase()] ?? 99;

  return roleA - roleB;
});

// Remove staff from the regular members list
const regularMembers = members.filter(
  (person) => !staffIds.has(person.id)
);

// Staff first, followed by regular members
const exportData = [
  ...sortedStaff.map((person) => ({
    name: getFullName(person),
    gender:person.gender || "NA",
    category: "STAFF",
    role: person.role || "",
    email: person.email || "",
    phone: person.phone || "",
  })),

  ...regularMembers.map((person) => ({
    name: getFullName(person),
    gender:person.gender || "NA",
    category: "MEMBER",
    role: "",
    email: person.email || "",
    phone: person.phone || "",
  })),
];

const title = `MEMBERS OF ${selectedClass.name.toUpperCase()}`

const headers = [
  "S/N",
  "NAME",
  "GENDER",
  "CATEGORY",
  "ROLE",
  "EMAIL",
  "PHONE NUMBER",
];

const escapeCSV = (value) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

const rows = exportData.map((person, index) => [
  index + 1,
  person.name,
  person.gender,
  person.category,
  person.role,
  person.email,
  person.phone ? `="${person.phone}"` : "",
]);

const csvContent = [
  [escapeCSV(title)].join(","),
  "",
  headers.map(escapeCSV).join(","),
  ...rows.map((row) => row.map(escapeCSV).join(",")),
].join("\r\n");

  // Create downloadable CSV file
  const blob = new Blob(
    ["\uFEFF" + csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `MEMBERS_OF_${selectedClass.name
    .replace(/[^a-z0-9]/gi, "_")
    .toUpperCase()}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  toast.success("Action Unit members exported successfully!");
};

  return (
    <main id="main" className="ml-0 min-h-screen min-w-0 bg-slate-50 px-4 py-6 sm:px-6 lg:ml-20 lg:px-8">
      <ToastContainer position="top-right" autoClose={3500} />

      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-600 sm:text-3xl">
              ACTION UNIT MANAGEMENT AREA
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Add action units, manage class members, staff and mark attendance here
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchClasses();
              if (selectedClassId) {
                fetchMembers(selectedClassId);
                fetchStaff(selectedClassId);
                fetchAttendance(selectedClassId);
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <span aria-hidden="true">↻</span>
            Refresh
          </button>
        </div>

            
<button
  type="button"
  onClick={() => setShowClassModal(true)}
  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy">
  Create Action Unit
</button>


{showClassModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    onClick={(event) => {
      if (event.target === event.currentTarget && !submittingClass) {
        setShowClassModal(false);
      }
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-class-title"
      className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            id="create-class-title"
            className="text-xl font-bold text-slate-900"
          >
            Create Action Unit
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter the details for the new class.
          </p>
        </div>

        <button
          type="button"
          disabled={submittingClass}
          onClick={() => setShowClassModal(false)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleCreateClass} className="space-y-4">
        <div>
          <label
            htmlFor="class-name"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Action Unit Name
          </label>

          <input
            id="class-name"
            type="text"
            required
            value={classForm.name}
            onChange={(event) =>
              setClassForm({
                ...classForm,
                name: event.target.value,
              })
            }
            placeholder="e.g. Action Unit 2"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label
            htmlFor="period-start"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Period Start
          </label>

          <input
            id="period-start"
            type="date"
            required
            value={classForm.period_start}
            onChange={(event) =>
              setClassForm({
                ...classForm,
                period_start: event.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label
            htmlFor="period-end"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Period End
          </label>

          <input
            id="period-end"
            type="date"
            required
            min={classForm.period_start || undefined}
            value={classForm.period_end}
            onChange={(event) =>
              setClassForm({
                ...classForm,
                period_end: event.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            disabled={submittingClass}
            onClick={() => setShowClassModal(false)}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submittingClass}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submittingClass && (
              <ClipLoader color="#ffffff" size={16} />
            )}

            {submittingClass ? "Creating..." : "Create Action Unit"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}



        {/* Class selector */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="class-selector"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
             {loadingClasses
                  ? "Loading classes..."
                  : classes.length === 0
                    ? "No classes available"
                    : " Select Sabbath School Unit"}
           
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              id="class-selector"
              value={selectedClassId}
              onChange={(event) =>
                setSelectedClassId(event.target.value)
              }
              disabled={loadingClasses || classes.length === 0}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select action Unit here</option>

              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            {loadingClasses && (
              <div className="flex items-center justify-center">
                <ClipLoader color="#2563eb" size={25} />
              </div>
            )}
          </div>

          {selectedClass && (
            <div className="mt-4 flex flex-col gap-4 rounded-lg bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-semibold text-blue-950">
                        {selectedClass.name}
                    </h2>
                    <p className="mt-1 text-sm text-blue-800">
                        Period: {formatDate(selectedClass.period_start)} –{" "}
                        {formatDate(selectedClass.period_end)}
                    </p>
                </div>    

                <div>
                    <button
                        type="button"
                         onClick={handleExportActionUnit}
                        disabled={loadingMembers || loadingStaff}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 16V4m0 12 4-4m-4 4-4-4M4 20h16"
                            />
                        </svg>

                        Export Members
                    </button>
                </div>

            </div>

            
          )}
        </section>

        {!selectedClassId && !loadingClasses && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <h2 className="font-semibold text-slate-800">
              No action unit selected
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Select a Sabbath School Action Unit above to view its members, staff and mark attendance
            </p>
          </div>
        )}

        {selectedClassId && (
          <>

            {/* ATTENDANCE MANAGEMENT */}
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedClass?.name} — Attendance
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Record and review attendance for this Action Unit.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttendanceDate("");
                    setAttendanceDraft(
                      Object.fromEntries(
                        members.map((member) => [member.id, { status: "", notes: "" }])
                      )
                    );
                    setShowAttendanceModal(true);
                  }}
                  disabled={loadingMembers || members.length === 0}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Mark Attendance
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-800">Attendance Records</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Previous attendance sessions for this Action Unit.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Date</th>
                        <th className="px-5 py-3 font-semibold">Present</th>
                        <th className="px-5 py-3 font-semibold">Absent</th>
                        <th className="px-5 py-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingAttendance ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-10 text-center">
                            <ClipLoader color="#2563eb" size={25} />
                            <p className="mt-2 text-slate-500">Loading attendance...</p>
                          </td>
                        </tr>
                      ) : attendanceGroups.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                            No attendance records found for this Action Unit.
                          </td>
                        </tr>
                      ) : (
                        attendanceGroups.map((group) => {
                          const presentCount = group.records.filter(
                            (record) => record.status?.toLowerCase() === "present"
                          ).length;
                          const absentCount = group.records.filter(
                            (record) => record.status?.toLowerCase() === "absent"
                          ).length;

                          return (
                            <tr key={group.date} className="hover:bg-slate-50">
                              <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                                {formatDate(group.date)}
                              </td>
                              <td className="px-5 py-4 text-emerald-700">{presentCount}</td>
                              <td className="px-5 py-4 text-rose-700">{absentCount}</td>
                              <td className="px-5 py-4">
                                <button
                                  type="button"
                                  onClick={() => openAttendanceDetails(group)}
                                  className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* MARK ATTENDANCE MODAL */}
            {showAttendanceModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-5"
                onClick={(event) => {
                  if (event.target === event.currentTarget && !submittingAttendance) {
                    setShowAttendanceModal(false);
                  }
                }}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="mark-attendance-title"
                  className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 id="mark-attendance-title" className="text-xl font-bold text-slate-900">
                        Mark Attendance
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">{selectedClass?.name}</p>
                    </div>
                    <button
                      type="button"
                      disabled={submittingAttendance}
                      onClick={() => setShowAttendanceModal(false)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      aria-label="Close attendance modal"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSubmitAttendance} className="space-y-5">
                    <div className="max-w-xs">
                      <label htmlFor="attendance-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                        Attendance Date (Saturday only)
                      </label>
                      <input
                        id="attendance-date"
                        type="date"
                        required
                        value={attendanceDate}
                        onChange={(event) => {
                          const value = event.target.value;
                          if (value && !isSaturday(value)) {
                            toast.error("Please select a Saturday.");
                            setAttendanceDate("");
                            return;
                          }
                          setAttendanceDate(value);
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Name</th>
                            <th className="px-4 py-3 font-semibold">Gender</th>
                            <th className="px-4 py-3 text-center font-semibold">Present</th>
                            <th className="px-4 py-3 text-center font-semibold">Absent</th>
                            <th className="px-4 py-3 font-semibold">Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {members.map((member) => (
                            <tr key={member.id}>
                              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                                {getFullName(member)}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {member.gender || member.sex || "—"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={attendanceDraft[member.id]?.status === "present"}
                                  onChange={() => handleAttendanceStatus(member.id, "present")}
                                  aria-label={`Mark ${getFullName(member)} present`}
                                  className="h-4 w-4 rounded border-blue cursor-pointer text-blue-600 focus:border-blue-500"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={attendanceDraft[member.id]?.status === "absent"}
                                  onChange={() => handleAttendanceStatus(member.id, "absent")}
                                  aria-label={`Mark ${getFullName(member)} absent`}
                                  className="h-4 w-4 rounded border-slate-300 cursor-pointer text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={attendanceDraft[member.id]?.notes || ""}
                                  onChange={(event) =>
                                    setAttendanceDraft((current) => ({
                                      ...current,
                                      [member.id]: {
                                        ...current[member.id],
                                        notes: event.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Add note..."
                                  className="w-full min-w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        disabled={submittingAttendance}
                        onClick={() => setShowAttendanceModal(false)}
                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingAttendance || members.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submittingAttendance && <ClipLoader color="#ffffff" size={16} />}
                        {submittingAttendance ? "Saving..." : "Submit Attendance"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ATTENDANCE DETAILS MODAL */}
            {showAttendanceDetails && selectedAttendanceGroup && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-5"
                onClick={(event) => {
                  if (event.target === event.currentTarget) {
                    setShowAttendanceDetails(false);
                    setEditingAttendance(false);
                  }
                }}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="attendance-details-title"
                  className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6"
                >
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 id="attendance-details-title" className="text-xl font-bold text-slate-900">
                        Attendance Details
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {selectedClass?.name} · {formatDate(selectedAttendanceGroup.date)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttendanceDetails(false);
                        setEditingAttendance(false);
                      }}
                      className="self-end rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:self-start"
                      aria-label="Close details modal"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-sm">
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <p className="text-xs font-medium uppercase text-emerald-700">Present</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-800">
                        {selectedAttendanceGroup.records.filter((record) => record.status?.toLowerCase() === "present").length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-rose-50 p-3">
                      <p className="text-xs font-medium uppercase text-rose-700">Absent</p>
                      <p className="mt-1 text-2xl font-bold text-rose-800">
                        {selectedAttendanceGroup.records.filter((record) => record.status?.toLowerCase() === "absent").length}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-[650px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Name</th>
                          <th className="px-4 py-3 font-semibold">Gender</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedAttendanceGroup.records.map((record) => {
                          const member = members.find(
                            (person) =>
                              (record.user_id && person.id === record.user_id) ||
                              (record.membership_id && person.membership_id === record.membership_id) ||
                              (getFullName(person).toLowerCase() ===
                                `${record.first_name || ""} ${record.last_name || ""}`.trim().toLowerCase())
                          );
                          const editValue = attendanceEditDraft[record.id] || {
                            status: record.status,
                            notes: record.notes || "",
                          };

                          return (
                            <tr key={record.id}>
                              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                                {`${record.first_name || ""} ${record.last_name || ""}`.trim() || getFullName(member || {})}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {member?.gender || member?.sex || "—"}
                              </td>
                              <td className="px-4 py-3">
                                {editingAttendance ? (
                                  <select
                                    value={editValue.status || ""}
                                    onChange={(event) =>
                                      setAttendanceEditDraft((current) => ({
                                        ...current,
                                        [record.id]: { ...current[record.id], status: event.target.value },
                                      }))
                                    }
                                    className="rounded-lg border border-slate-300 px-2 py-1.5"
                                  >
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                  </select>
                                ) : (
                                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    record.status?.toLowerCase() === "present"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-rose-50 text-rose-700"
                                  }`}>
                                    {record.status || "—"}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {editingAttendance ? (
                                  <input
                                    type="text"
                                    value={editValue.notes || ""}
                                    onChange={(event) =>
                                      setAttendanceEditDraft((current) => ({
                                        ...current,
                                        [record.id]: { ...current[record.id], notes: event.target.value },
                                      }))
                                    }
                                    className="w-full min-w-40 rounded-lg border border-slate-300 px-3 py-2"
                                  />
                                ) : (
                                  record.notes || "—"
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    {editingAttendance ? (
                      <>
                        <p className="mr-auto self-center text-xs text-amber-700">
                          Saving edits is pending the backend PUT endpoint.
                        </p>
                        <button
                          type="button"
                          onClick={() => setEditingAttendance(false)}
                          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled
                          onClick={handleUpdateAttendance}
                          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white opacity-50"
                        >
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <>
                        {selectedAttendanceGroup.records.every((record) =>
                          canEditAttendance(record.recorded_at)
                        ) && (
                          <button
                            type="button"
                            onClick={() => setEditingAttendance(true)}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowAttendanceDetails(false)}
                          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Close
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MEMBERS */}
            <section className="space-y-4">
             
              
              <AddMember users= {users} showMemberForm = {showMemberForm } setShowMemberForm = {setShowMemberForm} selectedClass = {selectedClass } loadingUsers ={loadingUsers } selectedClassId= {selectedClassId} submittingMember ={submittingMember } members = {members }  setSubmittingMember= { setSubmittingMember} setMembers= {setMembers} toast = {toast} setShowStaffForm = {setShowStaffForm}/>

              <DataTable
                title="Class Members"
                people={members}
                search={membersSearch}
                setSearch={setMembersSearch}
                loading={loadingMembers}
                emptyMessage="No members have been added to this class yet."
              />
            </section>

            {/* STAFF */}
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedClass?.name} — Staff
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Leaders and other staff assigned to this action unit.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowStaffForm((current) => !current);
                    setShowMemberForm(false);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  {showStaffForm ? "Cancel" : "+ Add Staff"}
                </button>
              </div>

              {showStaffForm && (
                <form
                  onSubmit={handleAddStaff}
                  className="space-y-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm"
                >
                  <h3 className="font-semibold text-slate-900">
                    Assign Staff to {selectedClass?.name}
                  </h3>

                  <div>
                    <select
                        id="staff-user-id"
                        required
                        value={staffForm.user_id}
                        onChange={(event) =>
                        setStaffForm({
                            ...staffForm,
                            user_id: event.target.value,
                        })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value="">Select a registered student</option>

                        {members.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} — {user.email}
                        </option>
                        ))}
                    </select>
                    
                  </div>

                  <div>
                    <label
                      htmlFor="staff-role"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Staff Role
                    </label>
                    <input
                      id="staff-role"
                      required
                      value={staffForm.role}
                      onChange={(event) =>
                        setStaffForm({
                          ...staffForm,
                          role: event.target.value,
                        })
                      }
                      placeholder="e.g. Leader 1, Secretary, Teacher"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingStaff}
                    className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingStaff && (
                      <ClipLoader color="#ffffff" size={16} />
                    )}
                    {submittingStaff ? "Adding..." : "Save Staff"}
                  </button>
                </form>
              )}

              <DataTable
                title="Class Staff"
                people={staff}
                search={staffSearch}
                setSearch={setStaffSearch}
                loading={loadingStaff}
                emptyMessage="No staff have been assigned to this class yet."
                showRole
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
