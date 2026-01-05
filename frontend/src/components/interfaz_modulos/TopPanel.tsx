import { ThemeToggle } from "../../Theme/ThemeToggle";
import logoInnovatImg from "../../assets/logoInnovat.webp";
import { useAuthState } from "../../api/auth";
import { Avatar, Skeleton } from "antd";
import TooltipAtom from "../atoms/tooltip/Tooltip";

interface TopPanelProps {
  title: string;
}

export function PanelSuperior({ title }: TopPanelProps) {
  const { user, isLoading } = useAuthState();
  const fullName = `${user?.name} ${user?.last_name}`;
  const avatarSrc = user?.image_base64
    ? `data:image/png;base64,${user.image_base64}`
    : "https://previews.123rf.com/images/yupiramos/yupiramos1609/yupiramos160922857/63058219-person-avatar-user-icon-vector-illustration-design.avif";

  return (
    <header className="flex items-stretch w-full h-12 bg-zinc-300">
      {/* Logo */}
      <div className="flex items-center pl-5 py-1">
        {isLoading ? (
          <Skeleton.Avatar active size="large" shape="square" />
        ) : (
          <img src={logoInnovatImg} alt="innovat" className="max-h-full" />
        )}
      </div>

      {/* Título */}
      <div className="flex-1 flex items-center justify-center font-bold text-xl text-slate-900">
        {isLoading ? (
          <Skeleton.Input style={{ width: 120 }} active size="small" />
        ) : (
          title
        )}
      </div>

      {/* Theme Toggle */}
      <div className="flex items-center justify-center w-12">
        <ThemeToggle />
      </div>

      {/* Perfil Usuario */}
      <div className="flex items-center justify-center w-20 bg-teal-700 rounded-l-lg shadow-xl overflow-hidden gap-2">
        {isLoading ? (
          <Skeleton.Avatar active size={45} />
        ) : (
          <TooltipAtom content={fullName} placement="top">
            <Avatar src={avatarSrc} size={45} />
          </TooltipAtom>
        )}
      </div>
    </header>
  );
}
