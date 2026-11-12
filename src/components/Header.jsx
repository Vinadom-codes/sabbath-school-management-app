
import { FaBars, FaRegBell } from "react-icons/fa6";

const Header = ({ onMenuClick }) => {
  const greeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      return "Good morning";
    } else if (currentHour < 16) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  return ( 
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-white/90 px-4 py-4 backdrop-blur md:px-8">

      <div className="flex items-center gap-3">
        <button
          id="mobileMenu"
          type="button"
          onClick={onMenuClick}
          className="rounded-lg border border-line p-2 lg:hidden"
          aria-label="Open sidebar"
        >
          <FaBars />
        </button>

        <div>
          <p className="text-xs text-muted">
            Workspace / Dashboard
          </p>

          <h1 className="mt-1 text-xl font-bold md:text-2xl">
            {greeting()} Admin 👋
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="notify"
          className="rounded-xl border border-line p-2.5"
          type="button"
        >
          <FaRegBell />
        </button>

        <div className="hidden text-xs sm:block">
          <p className="text-muted">Admin</p>
        </div>
      </div>

    </header>
  );
};

export default Header;
