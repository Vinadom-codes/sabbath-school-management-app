
import { useState, useEffect } from "react";
import { FaX, FaArrowRightArrowLeft, FaChevronDown } from "react-icons/fa6";

const TransferMemberForm = ({
  selectedMember,
  actionUnits = [],
  onClose,
  onTransfer,
  isSubmitting = false,
}) => {
  const [selectedClassId, setSelectedClassId] = useState("");

  // Reset the destination whenever a different member is selected.
  useEffect(() => {
    setSelectedClassId("");
  }, [selectedMember]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClassId) return;

    await onTransfer(selectedClassId, selectedMember.userId);
  };

  if (!selectedMember) return null;

  // Prevent transferring a member to their current Action Unit.
  const availableUnits = actionUnits.filter(
    (unit) => unit.id !== selectedMember.classId
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
      bg-slate-950/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl
        overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Transfer Member
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Move this member to another Action Unit.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100
            hover:text-slate-700 transition"
          >
            <FaX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Selected Member */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Member to transfer
            </label>

            <input
              type="text"
              value={selectedMember.fullName}
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-slate-200
              bg-slate-50 text-slate-600 outline-none cursor-not-allowed"
            />

            <p className="text-xs text-slate-400 mt-2">
              This is the member you selected from the table.
            </p>
          </div>

          {/* Destination Action Unit */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Destination Action Unit
            </label>

            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full appearance-none px-4 py-3 pr-10 rounded-xl
                border border-slate-200 bg-white text-slate-700
                outline-none focus:border-blue-500 focus:ring-4
                focus:ring-blue-500/10 transition"
              >
                <option value="">
                  Choose an Action Unit to transfer this member
                </option>

                {availableUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>

              <FaChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2
                text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedClassId || isSubmitting}
            className="w-full flex items-center justify-center gap-2
            bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300
            disabled:cursor-not-allowed text-white font-semibold
            py-3 rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            <FaArrowRightArrowLeft size={18} />

            {isSubmitting ? "TRANSFERRING..." : "TRANSFER MEMBER"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default TransferMemberForm;
