import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Check,
  Copy,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RefreshCw,
  Shuffle,
  AlertCircle,
} from 'lucide-react';
import { motion, MotionConfig } from 'motion/react';
import { GroupCard } from './components/GroupCard';
import {
  INITIAL_SAMPLE_GROUPS,
  SAMPLE_STUDENT_TEXT,
  SplitMode,
  calculateGroupPreview,
  formatGroupsForClipboard,
  parseStudentList,
  splitIntoGroups,
} from './utils/grouping';

export default function App() {
  const [rawInput, setRawInput] = useState<string>(SAMPLE_STUDENT_TEXT);
  const [splitMode, setSplitMode] = useState<SplitMode>('byGroupCount');
  const [inputValue, setInputValue] = useState<string>('4');
  const [groups, setGroups] = useState<string[][]>(INITIAL_SAMPLE_GROUPS);
  const [isSampleView, setIsSampleView] = useState<boolean>(true);
  const [generationKey, setGenerationKey] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoNote, setInfoNote] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [projectionMode, setProjectionMode] = useState<boolean>(false);

  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const students = useMemo(() => parseStudentList(rawInput), [rawInput]);
  const numericValue = useMemo(() => {
    const parsed = Number.parseInt(inputValue, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [inputValue]);

  const preview = useMemo(
    () => calculateGroupPreview(students.length, splitMode, numericValue),
    [students.length, splitMode, numericValue]
  );

  const totalAssignedStudents = useMemo(
    () => groups.reduce((sum, group) => sum + group.length, 0),
    [groups]
  );

  const groupSizeRange = useMemo(() => {
    if (groups.length === 0) return null;
    const sizes = groups.map((g) => g.length);
    const min = Math.min(...sizes);
    const max = Math.max(...sizes);
    return { min, max };
  }, [groups]);

  const handleModeChange = (nextMode: SplitMode) => {
    setSplitMode(nextMode);
    setErrorMessage(null);
    if (nextMode === 'byGroupCount' && numericValue < 1) {
      setInputValue('4');
    } else if (nextMode === 'byGroupSize' && numericValue < 1) {
      setInputValue('4');
    }
  };

  const handleStepValue = (delta: number) => {
    const current = numericValue >= 1 ? numericValue : 1;
    const next = Math.max(1, current + delta);
    setInputValue(String(next));
    setErrorMessage(null);
  };

  const runSplit = (isReshuffle: boolean) => {
    if (students.length === 0) {
      setErrorMessage('Vui lòng nhập ít nhất 1 tên sinh viên để chia nhóm.');
      return;
    }

    if (!Number.isFinite(numericValue) || numericValue < 1) {
      setErrorMessage(
        splitMode === 'byGroupCount'
          ? 'Số nhóm phải lớn hơn hoặc bằng 1.'
          : 'Số người mỗi nhóm phải lớn hơn hoặc bằng 1.'
      );
      return;
    }

    setErrorMessage(null);
    const result = splitIntoGroups(
      students,
      splitMode,
      numericValue,
      isReshuffle ? groups : undefined
    );

    setGroups(result.groups);
    setInfoNote(result.note ?? null);
    setIsSampleView(false);
    setGenerationKey((prev) => prev + 1);
  };

  const handleLoadSample = () => {
    setRawInput(SAMPLE_STUDENT_TEXT);
    setSplitMode('byGroupCount');
    setInputValue('4');
    setGroups(INITIAL_SAMPLE_GROUPS);
    setIsSampleView(true);
    setErrorMessage(null);
    setInfoNote(null);
    setGenerationKey((prev) => prev + 1);
  };

  const handleClearList = () => {
    setRawInput('');
    setErrorMessage(null);
    setInfoNote(null);
  };

  const handleCopyResults = async () => {
    if (groups.length === 0) return;

    const text = formatGroupsForClipboard(groups);
    let success = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        success = true;
      }
    } catch {
      success = false;
    }

    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopied(true);
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } else {
      setErrorMessage('Trình duyệt không cho phép tự động sao chép. Vui lòng thử lại.');
    }
  };

  const gridColumnsClass = useMemo(() => {
    const count = groups.length;
    if (count <= 1) return 'grid-cols-1 max-w-2xl';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count === 3) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
    if (count === 4) {
      return projectionMode
        ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
        : 'grid-cols-1 md:grid-cols-2';
    }
    return projectionMode
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
  }, [groups.length, projectionMode]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        {/* Top Bar */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-4">
            <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              Chia Nhóm Lớp Học
            </h1>

            <div className="hidden sm:flex items-center gap-3 text-sm text-slate-500 whitespace-nowrap">
              <span className="tabular-nums">{students.length} sinh viên trong danh sách</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{groups.length} nhóm đang hiển thị</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setProjectionMode((prev) => !prev)}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {projectionMode ? (
                  <>
                    <Minimize2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Hiện bảng nhập</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Chế độ trình chiếu</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-6">
          <div
            className={`grid gap-8 items-start ${
              projectionMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]'
            }`}
          >
            {/* Left Zone: Input & Configuration */}
            {!projectionMode && (
              <section
                aria-label="Thiết lập danh sách và cách chia nhóm"
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
              >
                <div className="space-y-6">
                  {/* Student List Input */}
                  <div>
                    <div className="mb-2 flex items-baseline justify-between gap-2">
                      <label
                        htmlFor="student-list-input"
                        className="text-base font-bold text-slate-900"
                      >
                        Danh sách sinh viên
                      </label>
                      <span className="text-sm font-semibold text-blue-700 tabular-nums">
                        {students.length} sinh viên
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-slate-600">
                      Dán danh sách tên sinh viên, mỗi dòng một người. Dòng trống sẽ tự động được bỏ qua.
                    </p>
                    <textarea
                      id="student-list-input"
                      rows={11}
                      value={rawInput}
                      onChange={(e) => {
                        setRawInput(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder={'Nguyễn Văn An\nTrần Thị Bình\nLê Hoàng Cường...'}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-4 py-3 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                    <div className="mt-2.5 flex items-center justify-between gap-4 text-sm">
                      <button
                        type="button"
                        onClick={handleLoadSample}
                        className="font-medium text-blue-700 hover:text-blue-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer"
                      >
                        Nạp danh sách mẫu (16 người)
                      </button>
                      <button
                        type="button"
                        onClick={handleClearList}
                        disabled={rawInput.length === 0}
                        className="font-medium text-slate-500 hover:text-slate-900 hover:underline disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer"
                      >
                        Xóa danh sách
                      </button>
                    </div>
                  </div>

                  <hr className="border-slate-200" />

                  {/* Mode Selector */}
                  <div>
                    <span className="mb-2.5 block text-base font-bold text-slate-900">
                      Cách chia nhóm
                    </span>
                    <div
                      role="group"
                      aria-label="Lựa chọn cách chia nhóm"
                      className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1"
                    >
                      <button
                        type="button"
                        onClick={() => handleModeChange('byGroupCount')}
                        aria-pressed={splitMode === 'byGroupCount'}
                        className={`min-h-[42px] rounded-md px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                          splitMode === 'byGroupCount'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Theo số nhóm
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeChange('byGroupSize')}
                        aria-pressed={splitMode === 'byGroupSize'}
                        className={`min-h-[42px] rounded-md px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                          splitMode === 'byGroupSize'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Theo số người / nhóm
                      </button>
                    </div>
                  </div>

                  {/* Numeric Input */}
                  <div>
                    <label
                      htmlFor="split-number-input"
                      className="mb-2 block text-base font-bold text-slate-900"
                    >
                      {splitMode === 'byGroupCount'
                        ? 'Số lượng nhóm'
                        : 'Số người mỗi nhóm'}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStepValue(-1)}
                        aria-label="Giảm 1"
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer"
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <input
                        id="split-number-input"
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            runSplit(false);
                          }
                        }}
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-center text-lg font-bold tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      />
                      <button
                        type="button"
                        onClick={() => handleStepValue(1)}
                        aria-label="Tăng 1"
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    {preview ? (
                      <p className="mt-2.5 text-sm text-slate-600 tabular-nums">
                        Dự kiến: <strong className="font-semibold text-slate-900">{preview.groupCount} nhóm</strong>{' '}
                        <span aria-hidden="true">·</span>{' '}
                        {preview.minSize === preview.maxSize
                          ? `${preview.minSize} người/nhóm`
                          : `${preview.minSize}–${preview.maxSize} người/nhóm`}
                      </p>
                    ) : (
                      <p className="mt-2.5 text-sm text-slate-500">
                        Nhập danh sách sinh viên và số lớn hơn 0 để xem dự kiến.
                      </p>
                    )}
                  </div>

                  {/* Error message */}
                  {errorMessage && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-800"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Primary Action Button */}
                  <button
                    type="button"
                    onClick={() => runSplit(false)}
                    className="inline-flex min-h-[50px] w-full items-center justify-center gap-2.5 rounded-lg bg-blue-700 px-6 py-3 text-base font-bold text-white shadow-xs transition-colors hover:bg-blue-800 active:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 cursor-pointer"
                  >
                    <Shuffle className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>Chia nhóm</span>
                  </button>
                </div>
              </section>
            )}

            {/* Right Zone: Classroom Projection Results Stage */}
            <section aria-label="Kết quả chia nhóm" className="min-w-0">
              {/* Stage Action Toolbar */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h2
                    className={`font-display font-bold tracking-tight text-slate-900 ${
                      projectionMode ? 'text-3xl' : 'text-2xl'
                    }`}
                  >
                    {isSampleView ? 'Nhóm mẫu minh họa' : 'Kết quả chia nhóm'}
                  </h2>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-base text-slate-600 tabular-nums">
                    <span>{groups.length} nhóm</span>
                    <span aria-hidden="true">·</span>
                    <span>{totalAssignedStudents} sinh viên</span>
                    {groupSizeRange && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>
                          {groupSizeRange.min === groupSizeRange.max
                            ? `Mỗi nhóm ${groupSizeRange.min} người`
                            : `${groupSizeRange.min}–${groupSizeRange.max} người mỗi nhóm`}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => runSplit(true)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-xs transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Chia lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyResults}
                    disabled={groups.length === 0}
                    className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                      copied
                        ? 'border border-emerald-300 bg-emerald-50 text-emerald-900'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                        <span>Đã sao chép kết quả</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>Sao chép kết quả</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Screen reader announcement for clipboard */}
              <div className="sr-only" aria-live="polite">
                {copied ? 'Đã sao chép kết quả chia nhóm vào bộ nhớ tạm.' : ''}
              </div>

              {/* Informational note when group count exceeds students */}
              {infoNote && (
                <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900">
                  <AlertCircle className="h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
                  <span>{infoNote}</span>
                </div>
              )}

              {/* Group Cards Grid */}
              <motion.div
                key={generationKey}
                initial={{ opacity: 0.7, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className={`grid gap-6 ${gridColumnsClass}`}
              >
                {groups.map((members, index) => (
                  <GroupCard
                    key={`group-${index + 1}`}
                    groupNumber={index + 1}
                    members={members}
                    projectionMode={projectionMode}
                  />
                ))}
              </motion.div>
            </section>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
