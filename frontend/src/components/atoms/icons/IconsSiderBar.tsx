import { lazy, Suspense } from 'react';

type LazyIconComponent = React.LazyExoticComponent<React.ComponentType>;

const IconsBar = {
  Actividades: lazy(() =>
    import('@ant-design/icons/ScheduleOutlined')
  ),
  Cotizaciones: lazy(() =>
    import('@ant-design/icons/ProfileOutlined')
  ),
  Ordenes: lazy(() =>
    import('@ant-design/icons/SolutionOutlined')
  ),
  Usuarios: lazy(() =>
    import('@ant-design/icons/TeamOutlined')
  ),
  Activos: lazy(() =>
    import('@ant-design/icons/TranslationOutlined')
  )
} satisfies Record<string, LazyIconComponent>;

const IconAct = {
Adicionar: lazy(() =>
  import('@ant-design/icons/PlusOutlined')
),
Eliminar: lazy(() =>
  import('@ant-design/icons/MinusOutlined')
),
Editar: lazy(() =>
  import('@ant-design/icons/EditOutlined')
),
Ver: lazy(() =>
  import('@ant-design/icons/EyeOutlined')
),
Pendientes: lazy(() =>
  import('@ant-design/icons/ExclamationOutlined')
),
Hechas: lazy(() =>
  import('@ant-design/icons/CheckOutlined')
),
Consultas: lazy(() =>
  import('@ant-design/icons/SearchOutlined')
),
Programacion: lazy(() =>
  import('@ant-design/icons/CalendarOutlined')
),
Historial: lazy(() =>
  import('@ant-design/icons/SortDescendingOutlined')
),

}satisfies Record<string, LazyIconComponent>;

export const IconRegistry = {
  ...IconsBar,
  ...IconAct,
} satisfies Record<string, LazyIconComponent>;

export type IconKey = keyof typeof IconRegistry;

export function LazyIcon({ name }: { name: IconKey }) {
  const Icon = IconRegistry[name];

  return (
    <Suspense fallback={null}>
      <Icon />
    </Suspense>
  );
}




















// export const IconsUses = {
//   Actividades: <ScheduleOutlined />,
//   Cotizaciones: <ProfileOutlined />,
//   Ordenes: <SolutionOutlined />,
//   Usuarios: <TeamOutlined />,
//   Activos: <TranslationOutlined />
// } satisfies Record<string, ReactNode>;
