
import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";
// import { toast } from "react-toastify";
import { ToastContainer, toast } from "react-toastify";
import MemberTransfer from "../components/MemberTransfer";

const API_URL = "http://localhost:8080/api/v1/users";

const emptyStudentForm = {
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  gender: "",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState(emptyStudentForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all registered students.
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(
         toast.error(result.message || "Failed to fetch students.") 
        );
      }

      // Supports an API response containing { data: [...] }.
      const studentList = Array.isArray(result.data) 
            ? result.data : Array.isArray(result) 
            ? result : [];

      setStudents(studentList);
    } catch (error) {
      toast.error("Could not load students. Check your network or contact your Engineer");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter students by name, email or phone number.
  const filteredStudents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return students;

    return students.filter((student) => {
      const fullName =
        `${student.first_name || ""} ${student.last_name || ""}`
          .trim()
          .toLowerCase();

      return (
        fullName.includes(search) ||
        (student.email || "").toLowerCase().includes(search) ||
        (student.phone || "").toLowerCase().includes(search)
      );
    });
  }, [students, searchTerm]);

  // Calculate the total number of pages.
const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);

// Calculate the records to display on the current page.
const paginatedStudents = useMemo(() => {
  const startIndex = (currentPage - 1) * rowsPerPage;

  return filteredStudents.slice(
    startIndex,
    startIndex + rowsPerPage
  );
}, [filteredStudents, currentPage, rowsPerPage]);

// Return to page 1 whenever the search term changes.
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm]);

// Prevent the current page from exceeding the available pages.
useEffect(() => {
  if (totalPages > 0 && currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
}, [currentPage, totalPages]);

  // Update form fields.
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setStudentForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Submit a new student to the API.
  const handleAddStudent = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!studentForm.gender) {
    toast.error("Please select the student's gender.");
    return;
  }

    setIsSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: studentForm.email.trim(),
          first_name: studentForm.first_name.trim(),
          last_name: studentForm.last_name.trim(),
          phone: studentForm.phone.trim(),
          gender:studentForm.gender.toUpperCase(),
        }),
      });

      const responseText = await response.text();

      let result = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
         toast.error(`The server returned an invalid response (HTTP ${response.status}).`) 
        );
      }

      if (!response.ok || result.status === "error") {
          console.error("API error response:", result);
        throw new Error(
          toast.error( result.message || "Failed to add student.")
        );
      } 

      toast.success("Student added successfully!");

      setStudentForm({ ...emptyStudentForm });
      setIsModalOpen(false);

      // Refresh the table to include the new student.
      await fetchStudents();
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    if (isSubmitting) return;

    setIsModalOpen(false);
    setStudentForm({ ...emptyStudentForm });
  };

  // Export all students matching the current search.
const handleExportCSV = () => {
  if (filteredStudents.length === 0) {
    toast.info("There are no student records to export.");
    return;
  }

  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Phone Number",
    "Gender",
  ];

  const escapeCSV = (value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const rows = filteredStudents.map((student) => [
    student.first_name,
    student.last_name,
    student.email,
    student.phone,
    student.gender,
    // student.is_active === undefined
    //   ? ""
    //   : student.is_active
    //     ? "Active"
    //     : "Inactive",
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  // BOM helps Excel display CSV characters correctly.
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "sabbath-school-students.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  toast.success("Student records exported successfully!");
};

  return (
    <section id="main" className="ml-0 min-h-screen min-w-0 bg-slate-50 px-4 py-6 sm:px-6 lg:ml-20 lg:px-8">
        <ToastContainer position="top-right" autoClose={3500} />

        

      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
           
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="text-xl leading-none">+</span>
            Add a Sabbath School Student
          </button>
        </div>

        <MemberTransfer />

        <div className="mb-2 mt-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Students
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              All registered Sabbath School students.
            </p>
          </div>

          
        </div>

        {/* Students table card */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                All Students
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredStudents.length}{" "}
                {filteredStudents.length === 1 ? "student" : "students"} found
              </p>
            </div>

            {/* Search input */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <div className="relative w-full sm:max-w-sm">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 ">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                        >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-4-4" />
                        </svg>
                    </span>

                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) =>
                        setSearchTerm(event.target.value)
                        }
                        placeholder="Search name, email or phone..."
                        aria-label="Search students"
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <button
                    type="button"
                    onClick={handleExportCSV}
                    disabled={filteredStudents.length === 0}
                    className="inline-flex items-center justify-center w-50 gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                    >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M12 15V3" />
                    </svg>

                    Export CSV
                </button>
                </div>
          </div>
                {/* nnnnn */}
                
                


          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    NAME
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    EMAIL
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    PHONE NUMBER
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    GENDER
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <ClipLoader
                          color="#2563eb"
                          size={35}
                          aria-label="Loading students"
                        />

                        <p className="text-sm text-slate-500">
                          Loading students...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold uppercase text-blue-700">
                            {student.first_name?.charAt(0) || ""}
                            {student.last_name?.charAt(0) || ""}
                          </div>

                          <span className="font-medium text-slate-800">
                            {student.first_name} {student.last_name}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2 text-sm text-slate-600">
                        {student.email}
                      </td>

                      <td className="px-3 py-2 text-sm text-slate-600">
                        {student.phone}
                      </td>

                     
                      <td className="px-3 py-2 text-sm text-slate-600"> {student.gender || "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-7 w-7"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            aria-hidden="true"
                          >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-4-4" />
                          </svg>
                        </div>

                        <p className="font-medium text-slate-700">
                          {searchTerm
                            ? "No students found"
                            : "No students registered yet"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {searchTerm
                            ? "Try a different search term."
                            : "Click Add a Student to register the first student."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

         

          {/* Table footer */}
                    {!isLoading && filteredStudents.length > 0 && (
                    <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                        {/* Showing records */}
                        <p className="text-sm text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                            {(currentPage - 1) * rowsPerPage + 1}
                        </span>
                        {" - "}
                        <span className="font-semibold text-slate-700">
                            {Math.min(currentPage * rowsPerPage, filteredStudents.length)}
                        </span>
                        {" of "}
                        <span className="font-semibold text-slate-700">
                            {filteredStudents.length}
                        </span>
                        {" students"}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">

                        {/* Previous button */}
                        <button
                            type="button"
                            onClick={() =>
                            setCurrentPage((page) => Math.max(page - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                            (page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                aria-current={currentPage === page ? "page" : undefined}
                                className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${
                                currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                {page}
                            </button>
                            )
                        )}

                        {/* Next button */}
                        <button
                            type="button"
                            onClick={() =>
                            setCurrentPage((page) =>
                                Math.min(page + 1, totalPages)
                            )
                            }
                            disabled={currentPage === totalPages}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>

                        {/* Refresh button */}
                        <button
                            type="button"
                            onClick={fetchStudents}
                            disabled={isLoading}
                            className="ml-1 self-center font-medium text-blue-600 transition hover:text-blue-800 disabled:opacity-50"
                        >
                            Refresh
                        </button>
                        </div>
                    </div>
                    )}
                            </div>
                        </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-student-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Modal heading */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2
                  id="add-student-title"
                  className="text-xl font-bold text-slate-800"
                >
                  Add a Student
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the student's information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                aria-label="Close modal"
                className="rounded-lg p-2 text-2xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                &times;
              </button>
            </div>

            {/* Student form */}
            <form onSubmit={handleAddStudent}  className="max-h-[80vh] overflow-y-auto p-4 space-y-4">
              <div className="space-y-5 px-6 py-6">
                <div>
                  <label
                    htmlFor="first_name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    value={studentForm.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                    maxLength={100}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="last_name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    value={studentForm.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                    maxLength={100}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={studentForm.email}
                    onChange={handleInputChange}
                    placeholder="student@example.com"
                    required
                    maxLength={254}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={studentForm.phone}
                    onChange={handleInputChange}
                    placeholder="+2349024420018"
                    pattern="^\+[1-9]\d{1,14}$"
                    title="Enter a valid international phone number, e.g. +2349024420018"
                    required
                    maxLength={16}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />
                </div>
                <div>
                      
                    <label
                        htmlFor="gender"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Gender <span className="text-red-500">*</span>
                    </label>

                    <select
                        id="gender"
                        name="gender"
                        value={studentForm.gender}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>

                </div>
              </div>

              {/* Modal actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <ClipLoader
                        color="#ffffff"
                        size={17}
                        aria-label="Saving student"
                      />
                      Saving...
                    </>
                  ) : (
                    "Save Student"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
