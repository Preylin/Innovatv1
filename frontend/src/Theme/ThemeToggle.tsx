import TooltipAtom from "../components/atoms/tooltip/Tooltip";
import { useTheme } from "./useTheme";

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <TooltipAtom content="Cambiar tema" placement="bottom">
      <button
      onClick={toggle}
      className="p-2 transition grid"
    >
      {isDark ? (
        <svg
          className="w-5 h-5 text-black"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1.5M12 19.5V21M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M3 12h1.5M19.5 12H21M4.22 19.78l1.06-1.06M18.72 5.28l1.06-1.06M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-gray-900"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1111.21 3a7.5 7.5 0 009.79 9.79z"
          />
        </svg>
      )}
    </button>
    </TooltipAtom>
  );
}
