import { type FC } from "react";

interface IsLoadingProps {
  loading: boolean;
}

export const SkeletonHeaderTable: FC<IsLoadingProps> = ({ loading }) => {
  if (!loading) return null;
  return (
    <div className="h-[calc(100vh-58px)] flex flex-col gap-4 p-4 text-slate-400">
      <header className="flex flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 h-20 shadow-sm">
        <div className="h-8 w-full animate-pulse bg-slate-200 dark:bg-zinc-700 rounded-md" />
        <div className="h-9 w-60 animate-pulse bg-slate-200 dark:bg-zinc-700 rounded-md" />
      </header>

      <main className="flex-1 flex flex-col gap-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-4 rounded-xl shadow-sm w-full overflow-hidden">
        <div className="grid grid-cols-6 gap-4 pb-3 border-b border-slate-100 dark:border-zinc-800 w-full">
          <div className="h-5 w-2/3 animate-pulse bg-slate-300 dark:bg-zinc-600 rounded" />
          <div className="h-5 w-3/4 animate-pulse bg-slate-300 dark:bg-zinc-600 rounded" />
          <div className="h-5 w-1/2 animate-pulse bg-slate-300 dark:bg-zinc-600 rounded" />
          <div className="h-5 w-2/3 animate-pulse bg-slate-300 dark:bg-zinc-600 rounded" />
          <div className="h-5 w-3/4 animate-pulse bg-slate-300 dark:bg-zinc-600 rounded" />
          <div className="h-5 w-1/2 animate-pulse bg-slate-300 dark:bg-zinc-600 rounded" />
        </div>

        <div className="flex-1 flex flex-col justify-between py-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-6 gap-4 items-center w-full py-3 border-b border-slate-50 dark:border-zinc-800/50 last:border-0"
            >
              <div className="h-4 w-full animate-pulse bg-slate-200 dark:bg-zinc-700 rounded" />
              <div className="h-4 w-5/6 animate-pulse bg-slate-200 dark:bg-zinc-700 rounded" />
              <div className="h-4 w-4/5 animate-pulse bg-slate-200 dark:bg-zinc-700 rounded" />
              <div className="h-4 w-full animate-pulse bg-slate-200 dark:bg-zinc-700 rounded" />
              <div className="h-4 w-11/12 animate-pulse bg-slate-200 dark:bg-zinc-700 rounded" />
              <div className="h-4 w-2/3 animate-pulse bg-slate-200 dark:bg-zinc-700 rounded" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
