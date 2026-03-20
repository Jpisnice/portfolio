import { useVirtualizer } from "@tanstack/react-virtual";
import {
	type MouseEvent as ReactMouseEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import folderMaskUrl from "../assets/folder.svg?url";
import type { GithubProject } from "../data/githubProjects";
import { FolderPopover } from "./FolderPopover";

type Dir = "ltr" | "rtl";

function FolderIcon() {
	return (
		<img
			alt=""
			src={folderMaskUrl}
			width={FOLDER_WIDTH}
			height={FOLDER_HEIGHT}
			style={{
				display: "block",
				objectFit: "contain",
				width: FOLDER_WIDTH,
				height: FOLDER_HEIGHT,
			}}
		/>
	);
}

const ROW_CONFIG: Array<{ dir: Dir; duration: number; id: number }> = [
	{ dir: "ltr", duration: 22, id: 0 },
	{ dir: "rtl", duration: 28, id: 1 },
	{ dir: "ltr", duration: 20, id: 2 },
	{ dir: "rtl", duration: 34, id: 3 },
	{ dir: "ltr", duration: 26, id: 4 },
	{ dir: "rtl", duration: 24, id: 5 },
	{ dir: "ltr", duration: 30, id: 6 },
	{ dir: "rtl", duration: 22, id: 7 },
	{ dir: "ltr", duration: 28, id: 8 },
];

const FOLDERS_PER_ROW = 14; // duplicated x2 for seamless loop
const FOLDER_SCALE = 1.05;
const FOLDER_WIDTH = Math.round(70 * FOLDER_SCALE);
const FOLDER_HEIGHT = Math.round(62 * FOLDER_SCALE);
const FOLDER_GAP = Math.round(10 * FOLDER_SCALE);
const PADDING_TOP = Math.round(4 * FOLDER_SCALE);
const PADDING_LEFT = Math.round(5 * FOLDER_SCALE);
const ITEM_STEP = FOLDER_WIDTH + FOLDER_GAP;
const ROW_HEIGHT = FOLDER_HEIGHT + PADDING_TOP * 2;

// Big enough to feel infinite; we wrap scrollLeft away from edges.
// Kept even so HALF_COUNT stays integral.
const ITEM_COUNT = 2000;
const HALF_COUNT = ITEM_COUNT / 2;
const TOTAL_PX = ITEM_COUNT * ITEM_STEP;
const MID_PX = HALF_COUNT * ITEM_STEP;
const WRAP_THRESHOLD_PX = FOLDERS_PER_ROW * ITEM_STEP; // matches the old "half" translation
const OVERSCAN = 3;
const GRID_ROW_GAP = Math.round(6 * FOLDER_SCALE);

function VirtualMarqueeRow({
	duration,
	dir,
	projectCount,
	matchingIndices,
	searchActive,
}: {
	duration: number;
	dir: Dir;
	projectCount: number;
	matchingIndices: Set<number>;
	searchActive: boolean;
}) {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const [hoveredAbsIndex, setHoveredAbsIndex] = useState<number | null>(null);

	const pausedRef = useRef(false);
	const indexOffsetRef = useRef(0);

	const dirSign = dir === "ltr" ? 1 : -1;

	const speedPxPerSec = useMemo(() => {
		// Old CSS: translate from 0% to -50% over `duration` seconds.
		// With items duplicated x2, that means traveling "one non-duplicated row".
		const halfRangePx = FOLDERS_PER_ROW * ITEM_STEP;
		return halfRangePx / duration;
	}, [duration]);

	const getScrollElement = useCallback(() => scrollRef.current, []);
	const estimateSize = useCallback(() => ITEM_STEP, []);

	const virtualizer = useVirtualizer({
		horizontal: true,
		count: ITEM_COUNT,
		getScrollElement,
		estimateSize,
		overscan: OVERSCAN,
	});

	const handleMouseEnter = useCallback(
		(e: ReactMouseEvent<HTMLButtonElement>) => {
			pausedRef.current = true;
			const absIndexRaw = e.currentTarget.dataset.absIndex as
				| string
				| undefined;
			const absIndex = absIndexRaw ? Number(absIndexRaw) : NaN;
			if (Number.isNaN(absIndex)) return;
			setHoveredAbsIndex((prev) => (prev === absIndex ? prev : absIndex));
		},
		[],
	);

	const handleMouseLeave = useCallback(() => {
		pausedRef.current = false;
		setHoveredAbsIndex(null);
	}, []);

	useEffect(() => {
		// Make lint understand that this effect is intentionally tied to matchingIndices changes.
		// The value isn't used, but the reference identity is.
		matchingIndices.size;

		// Query updates can recycle virtualized items under the pointer, so force-resume
		// to avoid any row getting stuck in a paused state.
		pausedRef.current = false;
		setHoveredAbsIndex(null);
	}, [matchingIndices]);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		// Start from the middle so we can move either direction without hitting edges.
		el.scrollLeft = MID_PX;
		indexOffsetRef.current = 0;
		pausedRef.current = false;

		let lastTs = performance.now();
		let rafId = 0;

		const tick = (nowTs: number) => {
			const dtSeconds = (nowTs - lastTs) / 1000;
			lastTs = nowTs;

			if (!pausedRef.current) {
				el.scrollLeft += dirSign * speedPxPerSec * dtSeconds;

				// Keep scrollLeft in the center range and adjust the absolute index offset
				// so colors remain continuous.
				if (el.scrollLeft > TOTAL_PX - WRAP_THRESHOLD_PX) {
					indexOffsetRef.current += HALF_COUNT;
					el.scrollLeft -= MID_PX;
				} else if (el.scrollLeft < WRAP_THRESHOLD_PX) {
					indexOffsetRef.current -= HALF_COUNT;
					el.scrollLeft += MID_PX;
				}
			}

			rafId = requestAnimationFrame(tick);
		};

		rafId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafId);
	}, [dirSign, speedPxPerSec]);

	return (
		<div
			ref={scrollRef}
			style={styles.rowOuter}
			className="folder-marquee-scroll"
		>
			<div
				style={{
					width: virtualizer.getTotalSize(),
					height: "100%",
					position: "relative",
				}}
			>
				{virtualizer.getVirtualItems().map((virtualItem) => {
					const absIndex = indexOffsetRef.current + virtualItem.index;
					const isHovered = hoveredAbsIndex === absIndex;

					const projectIndex =
						projectCount > 0
							? ((absIndex % projectCount) + projectCount) % projectCount
							: 0;
					const isDimmed =
						searchActive &&
						projectCount > 0 &&
						!matchingIndices.has(projectIndex);

					return (
						<div
							key={virtualItem.key}
							className="folder-marquee-item"
							style={{
								transform: `translateX(${virtualItem.start + PADDING_LEFT}px)`,
							}}
						>
							<button
								type="button"
								className={`folder-btn${isHovered ? " folder-btn--hover" : ""}`}
								data-abs-index={absIndex}
								onMouseEnter={handleMouseEnter}
								onMouseLeave={handleMouseLeave}
								aria-label="Folder"
								style={{
									filter: isDimmed ? "grayscale(100%) opacity(0.35)" : "none",
								}}
							>
								<FolderIcon />
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function FolderGrid({
	projects,
	matchingIndices,
	searchActive,
	rows = Math.max(1, ROW_CONFIG.length - 1),
	className = "",
}: {
	projects: GithubProject[];
	matchingIndices: Set<number>;
	searchActive: boolean;
	rows?: number;
	className?: string;
}) {
	const config = ROW_CONFIG.slice(0, rows);
	const [active, setActive] = useState<null | {
		projectIndex: number;
		origin: { x: number; y: number };
	}>(null);

	const gridRef = useRef<HTMLDivElement | null>(null);

	const handleGridClick = useCallback(
		(e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			if (!target) return;

			const btn = target.closest<HTMLButtonElement>("button[data-abs-index]");
			if (!btn) return;

			const absIndexRaw = btn.dataset.absIndex;
			const absIndex = absIndexRaw ? Number(absIndexRaw) : NaN;
			if (Number.isNaN(absIndex)) return;

			const projectCount = projects.length;
			if (projectCount === 0) return;
			const projectIndex =
				((absIndex % projectCount) + projectCount) % projectCount;

			const rect = btn.getBoundingClientRect();
			const origin = {
				x: rect.left + rect.width / 2,
				y: rect.top + rect.height / 2,
			};

			setActive({ projectIndex, origin });
		},
		[projects.length],
	);

	useEffect(() => {
		const el = gridRef.current;
		if (!el) return;

		// Native listener avoids accessibility lint errors on `onClick` for a static container.
		el.addEventListener("click", handleGridClick);
		return () => el.removeEventListener("click", handleGridClick);
	}, [handleGridClick]);

	return (
		<>
			<style>{`
        .folder-marquee-scroll::-webkit-scrollbar { display: none; }
        .folder-marquee-item {
          position: absolute;
          top: ${PADDING_TOP}px;
          left: 0;
          height: ${FOLDER_HEIGHT}px;
        }
        .folder-btn {
          flex-shrink: 0;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          width: ${FOLDER_WIDTH}px;
          height: ${FOLDER_HEIGHT}px;
          transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), filter 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(1) translateY(0);
          will-change: transform;
        }
        .folder-btn--hover {
          transform: scale(1.14) translateY(-4px);
        }
      `}</style>
			<div ref={gridRef} style={styles.gridWrap} className={className}>
				{config.map((row) => (
					<VirtualMarqueeRow
						key={row.id}
						duration={row.duration}
						dir={row.dir}
						projectCount={projects.length}
						matchingIndices={matchingIndices}
						searchActive={searchActive}
					/>
				))}
			</div>

			{active && (
				<FolderPopover
					project={projects[active.projectIndex]}
					origin={active.origin}
					onClose={() => setActive(null)}
				/>
			)}
		</>
	);
}

export default FolderGrid;

const styles: {
	gridWrap: React.CSSProperties;
	rowOuter: React.CSSProperties;
} = {
	gridWrap: {
		overflow: "hidden",
		display: "flex",
		flexDirection: "column",
		gap: `${GRID_ROW_GAP}px`,
		padding: "0",
		background: "transparent",
		borderRadius: "0",
		cursor: "default",
		userSelect: "none",
		width: "100vw",
		height: "100vh",
	},
	rowOuter: {
		overflowX: "scroll",
		overflowY: "hidden",
		display: "block",
		width: "100vw",
		height: ROW_HEIGHT,
		scrollbarWidth: "none",
		msOverflowStyle: "none",
	},
};
