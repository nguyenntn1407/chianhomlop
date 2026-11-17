export type SplitMode = 'byGroupCount' | 'byGroupSize';

export interface GroupPalette {
  name: string;
  cardBg: string;
  cardBorder: string;
  headerBg: string;
  headerBorder: string;
  titleText: string;
  countText: string;
  indexText: string;
  rowBg: string;
}

export const GROUP_PALETTES: GroupPalette[] = [
  {
    name: 'Cobalt',
    cardBg: 'bg-white',
    cardBorder: 'border-blue-300',
    headerBg: 'bg-blue-100/90',
    headerBorder: 'border-blue-200',
    titleText: 'text-blue-950',
    countText: 'text-blue-800',
    indexText: 'text-blue-700',
    rowBg: 'hover:bg-blue-50/70',
  },
  {
    name: 'Emerald',
    cardBg: 'bg-white',
    cardBorder: 'border-emerald-300',
    headerBg: 'bg-emerald-100/90',
    headerBorder: 'border-emerald-200',
    titleText: 'text-emerald-950',
    countText: 'text-emerald-800',
    indexText: 'text-emerald-700',
    rowBg: 'hover:bg-emerald-50/70',
  },
  {
    name: 'Amber',
    cardBg: 'bg-white',
    cardBorder: 'border-amber-300',
    headerBg: 'bg-amber-100/90',
    headerBorder: 'border-amber-200',
    titleText: 'text-amber-950',
    countText: 'text-amber-800',
    indexText: 'text-amber-700',
    rowBg: 'hover:bg-amber-50/70',
  },
  {
    name: 'Rose',
    cardBg: 'bg-white',
    cardBorder: 'border-rose-300',
    headerBg: 'bg-rose-100/90',
    headerBorder: 'border-rose-200',
    titleText: 'text-rose-950',
    countText: 'text-rose-800',
    indexText: 'text-rose-700',
    rowBg: 'hover:bg-rose-50/70',
  },
  {
    name: 'Violet',
    cardBg: 'bg-white',
    cardBorder: 'border-violet-300',
    headerBg: 'bg-violet-100/90',
    headerBorder: 'border-violet-200',
    titleText: 'text-violet-950',
    countText: 'text-violet-800',
    indexText: 'text-violet-700',
    rowBg: 'hover:bg-violet-50/70',
  },
  {
    name: 'Cyan',
    cardBg: 'bg-white',
    cardBorder: 'border-cyan-300',
    headerBg: 'bg-cyan-100/90',
    headerBorder: 'border-cyan-200',
    titleText: 'text-cyan-950',
    countText: 'text-cyan-800',
    indexText: 'text-cyan-700',
    rowBg: 'hover:bg-cyan-50/70',
  },
  {
    name: 'Orange',
    cardBg: 'bg-white',
    cardBorder: 'border-orange-300',
    headerBg: 'bg-orange-100/90',
    headerBorder: 'border-orange-200',
    titleText: 'text-orange-950',
    countText: 'text-orange-800',
    indexText: 'text-orange-700',
    rowBg: 'hover:bg-orange-50/70',
  },
  {
    name: 'Fuchsia',
    cardBg: 'bg-white',
    cardBorder: 'border-fuchsia-300',
    headerBg: 'bg-fuchsia-100/90',
    headerBorder: 'border-fuchsia-200',
    titleText: 'text-fuchsia-950',
    countText: 'text-fuchsia-800',
    indexText: 'text-fuchsia-700',
    rowBg: 'hover:bg-fuchsia-50/70',
  },
];

export const SAMPLE_STUDENT_NAMES: string[] = [
  'Nguyễn Minh Anh',
  'Trần Quốc Bảo',
  'Lê Thị Thu Cúc',
  'Phạm Hoàng Dũng',
  'Hoàng Gia Hân',
  'Vũ Đức Khang',
  'Đặng Ngọc Lan',
  'Bùi Tuấn Minh',
  'Ngô Phương Nga',
  'Dương Thành Nhân',
  'Lý Hải Phong',
  'Đỗ Thảo Quyên',
  'Trịnh Văn Sơn',
  'Mai Khánh Trang',
  'Phan Hữu Trọng',
  'Võ Thị Thanh Vân',
];

export const SAMPLE_STUDENT_TEXT = SAMPLE_STUDENT_NAMES.join('\n');

export const INITIAL_SAMPLE_GROUPS: string[][] = [
  ['Nguyễn Minh Anh', 'Trần Quốc Bảo', 'Lê Thị Thu Cúc', 'Phạm Hoàng Dũng'],
  ['Hoàng Gia Hân', 'Vũ Đức Khang', 'Đặng Ngọc Lan', 'Bùi Tuấn Minh'],
  ['Ngô Phương Nga', 'Dương Thành Nhân', 'Lý Hải Phong', 'Đỗ Thảo Quyên'],
  ['Trịnh Văn Sơn', 'Mai Khánh Trang', 'Phan Hữu Trọng', 'Võ Thị Thanh Vân'],
];

export function parseStudentList(rawText: string): string[] {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export interface PreviewEstimate {
  groupCount: number;
  minSize: number;
  maxSize: number;
}

export function calculateGroupPreview(
  studentCount: number,
  mode: SplitMode,
  value: number
): PreviewEstimate | null {
  if (studentCount <= 0 || !Number.isFinite(value) || value < 1) {
    return null;
  }

  const safeValue = Math.floor(value);
  const groupCount =
    mode === 'byGroupCount'
      ? Math.min(safeValue, studentCount)
      : Math.max(1, Math.ceil(studentCount / safeValue));

  const minSize = Math.floor(studentCount / groupCount);
  const maxSize = Math.ceil(studentCount / groupCount);

  return { groupCount, minSize, maxSize };
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getPartitionSignature(groups: string[][]): string {
  return groups
    .map((group) => [...group].sort().join('|'))
    .sort()
    .join('||');
}

export interface SplitResult {
  groups: string[][];
  note?: string;
}

export function splitIntoGroups(
  students: string[],
  mode: SplitMode,
  value: number,
  previousGroups?: string[][]
): SplitResult {
  const safeValue = Math.max(1, Math.floor(value));
  let groupCount: number;
  let note: string | undefined;

  if (mode === 'byGroupCount') {
    if (safeValue > students.length) {
      groupCount = students.length;
      note = `Số nhóm yêu cầu (${safeValue}) nhiều hơn số sinh viên (${students.length}), hệ thống đã chia thành ${groupCount} nhóm.`;
    } else {
      groupCount = safeValue;
    }
  } else {
    groupCount = Math.max(1, Math.ceil(students.length / safeValue));
  }

  const distributeOnce = (): string[][] => {
    const shuffled = shuffleArray(students);
    const groups: string[][] = Array.from({ length: groupCount }, () => []);
    shuffled.forEach((student, index) => {
      groups[index % groupCount].push(student);
    });
    return groups;
  };

  let result = distributeOnce();

  // When reshuffling ("Chia lại"), try to guarantee a visibly different partition if mathematically possible
  if (previousGroups && previousGroups.length === groupCount && groupCount > 1 && students.length > 2) {
    const prevSig = getPartitionSignature(previousGroups);
    let attempts = 0;
    while (getPartitionSignature(result) === prevSig && attempts < 12) {
      result = distributeOnce();
      attempts++;
    }
  }

  return { groups: result, note };
}

export function formatGroupsForClipboard(groups: string[][]): string {
  const totalStudents = groups.reduce((sum, g) => sum + g.length, 0);
  const header = `KẾT QUẢ CHIA NHÓM (${totalStudents} sinh viên · ${groups.length} nhóm)`;
  const body = groups
    .map((members, groupIndex) => {
      const lines = members.map((name, idx) => `${idx + 1}. ${name}`).join('\n');
      return `Nhóm ${groupIndex + 1} (${members.length} thành viên):\n${lines}`;
    })
    .join('\n\n');

  return `${header}\n\n${body}`;
}
