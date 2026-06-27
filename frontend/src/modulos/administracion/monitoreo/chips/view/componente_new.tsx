import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "#components/ui/sheet";
import { cn } from "#lib/utils";

export type PanelMode = "create" | "update" | null;

interface PanelFlexProps {
  mode?: PanelMode;
  children_main_content: React.ReactNode;
  children_create?: React.ReactNode;
  children_update?: React.ReactNode;
  className?: string;
  classNameMain?: string;
  classNameLateral?: string;
  onClose?: () => void;
}

export function PanelFlex({
  mode = null,
  children_main_content,
  children_create,
  children_update,
  className,
  classNameMain,
  classNameLateral,
  onClose,
}: PanelFlexProps) {
  const showLateral = mode !== null;

  return (
    <div className={cn("w-full flex gap-6 relative min-h-100", className)}>
      
      {/* 1. Contenido Principal - Ocupa siempre el 100% de su contenedor de forma fluida */}
      <div className={cn("flex-1 p-6 border rounded-lg bg-background", classNameMain)}>
        {children_main_content}
      </div>

      {/* 2. Panel Lateral usando el Sheet de Shadcn-UI */}
      <Sheet open={showLateral} onOpenChange={(open) => !open && onClose?.()}>
        {/* side="right" hace que aparezca desde la derecha. sm:max-w-md controla el ancho de manera responsiva */}
        <SheetContent side="right" className={cn("w-100 sm:max-w-135 overflow-y-auto", classNameLateral)}>
          <SheetHeader className="mb-4">
            <SheetTitle>
              {mode === "create" ? "Registrar Nuevo" : "Actualizar Registro"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create" 
                ? "Complete el siguiente formulario para guardar los datos." 
                : "Modifique los campos necesarios para actualizar la información."}
            </SheetDescription>
          </SheetHeader>

          {/* Renderizado condicional del contenido */}
          <div className="py-4">
            {mode === "create" && children_create}
            {mode === "update" && children_update}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
