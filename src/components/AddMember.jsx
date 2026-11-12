import { useState } from "react";
import {FaChevronDown } from "react-icons/fa6"

const AddMember = ({users, showMemberForm, setShowMemberForm, selectedClass, loadingUsers, selectedClassId, submittingMember, members,  setSubmittingMember, setMembers, toast, setShowStaffForm }) => {
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [memberSearchTerm, setMemberSearchTerm] = useState("");
    const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);

    // Filter registered users based on the search input.
    const filteredUsers = users.filter((user) => {
            const search = memberSearchTerm.trim().toLowerCase();

            const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
            return (
                fullName.includes(search) ||
                (user.email || "").toLowerCase().includes(search) ||
                (user.phone || "").toLowerCase().includes(search)
            );
    });

        // Check whether a user already belongs to the selected Action Unit.
        const isAlreadyMember = (userId) => {
            return members.some(
                (member) => (member.user_id || member.id) === userId
            );
        };

        // Select or deselect a user.
        const handleMemberSelection = (userId) => {
            if (isAlreadyMember(userId)) return;

            setSelectedUserIds((current) =>
                current.includes(userId)
                ? current.filter((id) => id !== userId)
                : [...current, userId]
            );
        };


const handleAddMember = async (event) => {
  event.preventDefault();

  if (!selectedClassId) {
    toast.error("Please select an Action Unit.");
    return;
  }

  if (selectedUserIds.length === 0) {
    toast.error("Please select at least one member.");
    return;
  }

  // Remove users who may already have been added.
  const usersToAdd = selectedUserIds.filter(
    (userId) => !isAlreadyMember(userId)
  );

  if (usersToAdd.length === 0) {
    toast.info("All selected users already belong to this Action Unit.");
    return;
  }

  setSubmittingMember(true);

  const results = [];

  try {
    // Submit one request at a time to avoid SQLite locking.
    for (const userId of usersToAdd) {
      const user = users.find((item) => item.id === userId);

      try {
        const response = await fetch(
          `http://localhost:8080/api/v1/classes/${encodeURIComponent(selectedClassId)}/membership`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok || result.status !== "ok") {
          throw new Error(
            result.message || "Failed to add member."
          );
        }

        results.push({
          userId,
          name: user
            ? `${user.first_name} ${user.last_name}`
            : userId,
          success: true,
        });

      } catch (error) {
        toast.error(`Failed to add ${userId}:`, error);

        results.push({
          userId,
          name: user
            ? `${user.first_name} ${user.last_name}`
            : userId,
          success: false,
          error: error.message,
        });
      }
    }
    setShowMemberForm(false);
    // Refresh membership list after all requests.
    const membersResponse = await fetch(
      `http://localhost:8080/api/v1/classes/${encodeURIComponent(selectedClassId)}/membership`
    );

    const membersResult = await membersResponse.json();

    if (!membersResponse.ok || membersResult.status !== "ok") {
      throw new Error(
        membersResult.message || "Could not refresh Action Unit members."
      );
    }

    const updatedMembers = Array.isArray(membersResult.data)
      ? membersResult.data
      : [];

    setMembers(updatedMembers);

    // Identify which requests succeeded and failed.
    const successful = results.filter(
      (item) => item.success
    );

    const failed = results.filter(
      (item) => !item.success
    );

    // Keep only failed selections for retry.
    setSelectedUserIds(failed.map((item) => item.userId));

    if (failed.length === 0) {
      toast.success(
        `${successful.length} member(s) added successfully!`
      );

      setMemberSearchTerm("");
      setIsMemberPickerOpen(false);
    } else if (successful.length > 0) {
      toast.warning(
        `${successful.length} member(s) added; ${failed.length} failed. You can retry the failed members.`
      );
    } else {
      toast.error(
        `Unable to add the selected members. ${failed.length} request(s) failed.`
      );
    }

  } catch (error) {
    console.error("Add members error:", error);
    toast.error(error.message || "Something went wrong.");
  } finally {
    setSubmittingMember(false);
  }
};


  return (

<>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedClass?.name} — Members
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    People enrolled in this action unit.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowMemberForm((current) => !current);
                    setShowStaffForm(false);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {showMemberForm ? "Cancel" : "+ Add Member"}
                </button>
              </div>
    
                  {showMemberForm && (
                    <form
                      onSubmit={handleAddMember}
                      className="space-y-4 rounded-xl border border-blue-100 bg-white p-5 shadow-sm"
                    >
                      <h3 className="font-semibold text-slate-900">
                        Add Member to {selectedClass?.name}
                      </h3>
    
                     
                     <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Select Members
                    </label>

                    {/* Selection trigger */}
                    <button
                        type="button"
                        onClick={() => setIsMemberPickerOpen((prev) => !prev)}
                        disabled={loadingUsers || !selectedClassId || submittingMember}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-3 text-left outline-none transition focus:border-blue-500"
                    >
                        <span className="text-sm text-slate-600">
                        {loadingUsers
                            ? "Loading users..."
                            : selectedUserIds.length > 0
                            ? `${selectedUserIds.length} user(s) selected`
                            : "Search and select registered users"}
                        </span>
                        <FaChevronDown  className={`h-5 w-5 text-slate-400 transition-transform ${isMemberPickerOpen ? "rotate-180" : ""}`} />
                    </button>

  {/* Searchable dropdown */}
  {isMemberPickerOpen && (
    <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">

      {/* Search input */}
      <div className="border-b border-slate-200 p-3">
        <input
          type="search"
          value={memberSearchTerm}
          onChange={(event) =>
            setMemberSearchTerm(event.target.value)
          }
          placeholder="Search by name, email or phone..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Select all / clear */}
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <span className="text-xs text-slate-500">
          {filteredUsers.length} user(s) found
        </span>

        <button
          type="button"
          onClick={() => {
            const availableIds = filteredUsers
              .filter((user) => !isAlreadyMember(user.id))
              .map((user) => user.id);

            setSelectedUserIds((current) =>
              [...new Set([...current, ...availableIds])]
            );
          }}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          Select all results
        </button>
      </div>

      {/* User list */}
      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">

        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const alreadyAdded = isAlreadyMember(user.id);
            const isSelected = selectedUserIds.includes(user.id);

            return (
              <label
                key={user.id}
                className={`flex items-center gap-3 px-3 py-3 transition ${
                  alreadyAdded
                    ? "cursor-not-allowed bg-slate-50 opacity-60"
                    : "cursor-pointer hover:bg-blue-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={alreadyAdded || submittingMember}
                  onChange={() => handleMemberSelection(user.id)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {user.first_name} {user.last_name}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {user.email || user.phone || "No contact information"}
                  </p>
                </div>

                {alreadyAdded && (
                  <span className="shrink-0 text-xs font-medium text-green-600">
                    Already added
                  </span>
                )}
              </label>
            );
          })
        ) : (
          <p className="px-3 py-8 text-center text-sm text-slate-500">
            No registered users found.
          </p>
        )}

      </div>

      {/* Dropdown footer */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2">
        <span className="text-xs font-medium text-slate-600">
          {selectedUserIds.length} selected
        </span>

        <button
          type="button"
          onClick={() => setIsMemberPickerOpen(false)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    </div>
  )}

  {/* Selected members preview */}
  {selectedUserIds.length > 0 && (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {selectedUserIds.map((userId) => {
        const user = users.find((item) => item.id === userId);

        if (!user) return null;

        return (
          <span
            key={userId}
            className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
          >
            {user.first_name} {user.last_name}

            <button
              type="button"
              disabled={submittingMember}
              onClick={() => handleMemberSelection(userId)}
              className="font-bold hover:text-red-600"
              aria-label={`Remove ${user.first_name} ${user.last_name}`}
            >
              &times;
            </button>
          </span>
        );
      })}

      <button
        type="button"
        disabled={submittingMember}
        onClick={() => setSelectedUserIds([])}
        className="text-xs font-medium text-red-600 hover:text-red-800"
      >
        Clear all
      </button>
    </div>
  )}
</div>

                      
    
                      <button
                        type="submit"
                        disabled={submittingMember || selectedUserIds.length === 0}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                        {submittingMember
                            ? "Adding Members..."
                            : `Add ${selectedUserIds.length} Selected Member(s)`}
                        </button>
                    </form>
                  )}
    
</>
  )
}

export default AddMember
