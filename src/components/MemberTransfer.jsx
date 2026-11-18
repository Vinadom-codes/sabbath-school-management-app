
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaMagnifyingGlass,
  FaArrowRightArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
} from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import TransferMemberForm from "./TransferMemberForm";

const API_URL = "/request/api/v1";

const ITEMS_PER_PAGE = 10;

const MemberTransfer = () => {
  const [actionUnits, setActionUnits] = useState([]);
  const [members, setMembers] = useState([]);

  const [searchName, setSearchName] = useState("");
  const [selectedFilterClass, setSelectedFilterClass] = useState("");

  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);


  

  // --------------------------------
  // FETCH ACTION UNITS AND MEMBERS
  // --------------------------------

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      // Fetch all Action Units.
      const classResponse = await fetch(`${API_URL}/classes`);

      if (!classResponse.ok) {
        throw new Error("Unable to fetch Action Units.");
      }

      const classResult = await classResponse.json();

      const classes = classResult.data || [];

      setActionUnits(classes);

      // Fetch members of every Action Unit.
      const memberRequests = classes.map(async (unit) => {
        const response = await fetch(
          `${API_URL}/classes/${unit.id}/membership`
        );

        if (!response.ok) {
          throw new Error(`Unable to fetch members of ${unit.name}.`);
        }

        const result = await response.json();

        const unitMembers = result.data || [];
       
        return unitMembers.map((member) => ({
            ...member,

            // Member details returned by the membership API
            userId: member.id,
            firstName: member.first_name || "",
            lastName: member.last_name || "",

            fullName: `${member.first_name || ""} ${
                member.last_name || ""
            }`.trim(),

            gender: member.gender || "—",

            // Action Unit details
            classId: unit.id,
            className: unit.name,
        }));
      });

      const membersByClass = await Promise.all(memberRequests);

      // Combine members from all Action Units into one array.
      const allMembers = membersByClass.flat();

      setMembers(allMembers);
      

    } catch (error) {
      console.error("Fetch error:", error);

      toast("Unable to load members.","error");

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --------------------------------
  // OPEN TRANSFER MODAL
  // --------------------------------

  const handleOpenTransfer = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;

    setIsModalOpen(false);
    setSelectedMember(null);
  };

  // --------------------------------
  // TRANSFER MEMBER
  // --------------------------------
const handleTransferMember = async (destinationClassId, userId) => {
  if (!destinationClassId || !userId || !selectedMember) {
    toast("Please select a valid Action Unit.", "error");
    return;
  }

  const destinationUnit = actionUnits.find(
    (unit) => unit.id === destinationClassId
  );

  if (!destinationUnit) return;

  try {
    setIsSubmitting(true);

    
    const currentClassId = selectedMember.classId;

    const response = await fetch(
      `${API_URL}/classes/${currentClassId}/membership/transfer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_id: destinationClassId,
          user_id: userId,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Member transfer failed."
      );
    }

    const memberName = selectedMember.fullName;

    setIsModalOpen(false);
    setSelectedMember(null);

    toast(
      `${memberName} transferred to ${destinationUnit.name} successfully`,
      "success"
    );

    // Refresh Action Units and members.
    await fetchData();

  } catch (error) {
    console.error("Transfer error:", error);

    toast("Unable to transfer member.", "error");

  } finally {
    setIsSubmitting(false);
  }
};

  // --------------------------------
  // FILTER MEMBERS
  // --------------------------------

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesName = member.fullName
        .toLowerCase()
        .includes(searchName.toLowerCase().trim());

      const matchesClass = selectedFilterClass
        ? member.classId === selectedFilterClass
        : true;

      return matchesName && matchesClass;
    });
  }, [members, searchName, selectedFilterClass]);

  // --------------------------------
  // PAGINATION
  // --------------------------------

  const totalPages = Math.ceil(
    filteredMembers.length / ITEMS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedMembers = filteredMembers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset pagination when filters change.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, selectedFilterClass]);

  // --------------------------------
  // MEMBER INITIALS
  // --------------------------------

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // --------------------------------
  // RENDER COMPONENT
  // --------------------------------

  return (
    <div className="w-full space-y-6">
        <ToastContainer position="top-right" autoClose={3500} />
        
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center
      sm:justify-between gap-3">

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Member Transfer
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            View members across Action Units and manage transfers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50
        text-blue-700 px-4 py-2.5 rounded-xl w-fit">

          <FaUsers size={19} />

          <span className="text-sm font-semibold">
            {members.length} Members
          </span>

        </div>
      </div>

     
      {/* MEMBERS TABLE */}
      <div className="bg-white border border-slate-100
      rounded-2xl shadow-sm overflow-hidden">
        
         {/* TABLE CAPTION */}
        <div className="px-5 py-5 border-b border-slate-100">

          <h3 className="text-sm font-bold text-slate-800
          uppercase tracking-wider">
            ALL ACTION UNITS AND MEMBERS
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            View and transfer members between Action Units.
          </p>

        </div>

         {/* FILTER SECTION */}
      <div className=" p-4">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* NAME SEARCH */}
          <div>
            <label className="block text-xs font-semibold
            text-slate-500 mb-2 uppercase tracking-wide">
              Search by Name
            </label>

            <div className="relative">

              <FaMagnifyingGlass className="absolute left-4 top-1/2
              -translate-y-1/2 text-slate-400" size={18} />

              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Search member name..."
                className="w-full pl-11 pr-4 py-3 rounded-xl
                border border-slate-200 text-sm outline-none
                focus:border-blue-500 focus:ring-4
                focus:ring-blue-500/10 transition"
              />

            </div>
          </div>

          {/* ACTION UNIT FILTER */}
          <div>
            <label className="block text-xs font-semibold
            text-slate-500 mb-2 uppercase tracking-wide">
              Filter by Action Unit
            </label>

            <select
              value={selectedFilterClass}
              onChange={(e) => setSelectedFilterClass(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border
              border-slate-200 bg-white text-sm text-slate-700
              outline-none focus:border-blue-500
              focus:ring-4 focus:ring-blue-500/10 transition"
            >

              <option value="">All Action Units</option>

              {actionUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}

            </select>
          </div>

        </div>

      </div>


       

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">

                <th className="px-5 py-4 text-xs font-bold
                text-slate-500 uppercase whitespace-nowrap">
                  S/NO
                </th>

                <th className="px-5 py-4 text-xs font-bold
                text-slate-500 uppercase whitespace-nowrap">
                  NAME
                </th>

                <th className="px-5 py-4 text-xs font-bold
                text-slate-500 uppercase whitespace-nowrap">
                  GENDER
                </th>

                <th className="px-5 py-4 text-xs font-bold
                text-slate-500 uppercase whitespace-nowrap">
                  ACTION UNIT
                </th>

                <th className="px-5 py-4 text-xs font-bold
                text-slate-500 uppercase text-center whitespace-nowrap">
                  TRANSFER
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (

                <tr>
                  <td colSpan="5" className="text-center py-12
                  text-sm text-slate-400">
                    Loading members...
                  </td>
                </tr>

              ) : paginatedMembers.length > 0 ? (

                paginatedMembers.map((member, index) => (

                  <tr
                    key={`${member.classId}-${member.userId}`}
                    className="hover:bg-slate-50/80 transition"
                  >

                    {/* S/NO */}
                    <td className="px-5 py-4 text-sm
                    text-slate-500 font-medium">
                      {startIndex + index + 1}
                    </td>

                    {/* NAME */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3
                      min-w-[200px]">

                        <div className="w-10 h-10 rounded-full
                        bg-blue-50 text-blue-700 flex items-center
                        justify-center text-xs font-bold shrink-0">

                          {getInitials(
                            member.firstName,
                            member.lastName
                          )}

                        </div>

                        <span className="text-sm font-semibold
                        text-slate-700 whitespace-nowrap">
                          {member.fullName || "Unknown Member"}
                        </span>

                      </div>

                    </td>

                    {/* GENDER */}
                    <td className="px-5 py-4 text-sm
                    text-slate-600">
                      {member.gender}
                    </td>

                    {/* ACTION UNIT */}
                    <td className="px-5 py-4">

                      <span className="inline-flex items-center
                      px-3 py-1.5 rounded-lg bg-blue-50
                      text-blue-700 text-xs font-semibold
                      whitespace-nowrap">
                        {member.className}
                      </span>

                    </td>

                    {/* TRANSFER BUTTON */}
                    <td className="px-5 py-4 text-center">

                      <button
                        type="button"
                        onClick={() => handleOpenTransfer(member)}
                        title={`Transfer ${member.fullName}`}
                        className="inline-flex items-center
                        justify-center w-9 h-9 rounded-xl
                        bg-slate-100 text-slate-600
                        hover:bg-blue-600 hover:text-white
                        transition duration-200"
                      >

                        <FaArrowRightArrowLeft size={17} />

                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="5" className="text-center py-14">

                    <FaUsers size={32} className="mx-auto
                    text-slate-300 mb-3" />

                    <p className="text-sm font-semibold
                    text-slate-600">
                      No members found
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Try changing your search or filter.
                    </p>

                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}
        {!loading && filteredMembers.length > 0 && (

          <div className="flex flex-col sm:flex-row
          items-center justify-between gap-4 px-5 py-4
          border-t border-slate-100">

            <p className="text-xs text-slate-500">

              Showing{" "}
              <span className="font-semibold text-slate-700">
                {startIndex + 1}
              </span>
              {" "}to{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(
                  startIndex + ITEMS_PER_PAGE,
                  filteredMembers.length
                )}
              </span>
              {" "}of{" "}
              <span className="font-semibold text-slate-700">
                {filteredMembers.length}
              </span>
              {" "}members

            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="w-9 h-9 flex items-center justify-center
                rounded-lg border border-slate-200 text-slate-600
                hover:bg-slate-50 disabled:opacity-40
                disabled:cursor-not-allowed transition"
              >
                <FaChevronLeft size={18} />
              </button>

              <span className="text-sm font-semibold text-slate-700
              px-3">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="w-9 h-9 flex items-center justify-center
                rounded-lg border border-slate-200 text-slate-600
                hover:bg-slate-50 disabled:opacity-40
                disabled:cursor-not-allowed transition"
              >
                <FaChevronRight size={18} />
              </button>

            </div>

          </div>

        )}

      </div>

      {/* TRANSFER MODAL */}
      {isModalOpen && selectedMember && (

        <TransferMemberForm
          selectedMember={selectedMember}
          actionUnits={actionUnits}
          onClose={handleCloseModal}
          onTransfer={handleTransferMember}
          isSubmitting={isSubmitting}
        />

      )}

      

    </div>
  );
};

export default MemberTransfer;
