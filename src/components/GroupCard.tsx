import { GROUP_PALETTES } from '../utils/grouping';

interface GroupCardProps {
  groupNumber: number;
  members: string[];
  projectionMode: boolean;
}

export function GroupCard({ groupNumber, members, projectionMode }: GroupCardProps) {
  const palette = GROUP_PALETTES[(groupNumber - 1) % GROUP_PALETTES.length];

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-xl border ${palette.cardBorder} ${palette.cardBg} shadow-xs`}
    >
      <header
        className={`flex items-baseline justify-between gap-4 border-b px-5 py-4 ${palette.headerBg} ${palette.headerBorder}`}
      >
        <h2
          className={`font-display font-bold tracking-tight ${palette.titleText} ${
            projectionMode ? 'text-3xl' : 'text-2xl'
          }`}
        >
          Nhóm {groupNumber}
        </h2>
        <span
          className={`whitespace-nowrap shrink-0 font-semibold tabular-nums ${palette.countText} ${
            projectionMode ? 'text-lg' : 'text-base'
          }`}
        >
          {members.length} thành viên
        </span>
      </header>

      <ol className="flex-1 divide-y divide-slate-100 px-3 py-2">
        {members.map((studentName, idx) => (
          <li
            key={`${groupNumber}-${idx}-${studentName}`}
            className={`flex items-baseline gap-3.5 rounded-lg px-2.5 py-2.5 transition-colors ${palette.rowBg}`}
          >
            <span
              className={`w-7 shrink-0 text-right font-semibold tabular-nums ${palette.indexText} ${
                projectionMode ? 'text-xl' : 'text-lg'
              }`}
            >
              {idx + 1}.
            </span>
            <span
              className={`font-semibold leading-snug text-slate-900 break-words ${
                projectionMode ? 'text-2xl' : 'text-xl'
              }`}
            >
              {studentName}
            </span>
          </li>
        ))}
      </ol>
    </article>
  );
}
