import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";
import folderMaskUrl from "../assets/folder.svg?url";

type Dir = "ltr" | "rtl";

const PALETTE: Array<{ body: string; shade: string; dark: string }> = [
	{ body: "#7ec8e3", shade: "#5ab4d4", dark: "#3a9ab8" },
	{ body: "#89d4e8", shade: "#65bedd", dark: "#45a6c8" },
	{ body: "#6cbfe0", shade: "#4aadd1", dark: "#2d97bc" },
];

function FolderIcon({ colorIndex = 0 }: { colorIndex?: number }) {
	// The source SVG already contains the full-resolution artwork.
	// `colorIndex` is kept only to avoid changing the call sites.
	void colorIndex;

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
const ITEM_COUNT = 2000;
const HALF_COUNT = ITEM_COUNT / 2;
const TOTAL_PX = ITEM_COUNT * ITEM_STEP;
const MID_PX = HALF_COUNT * ITEM_STEP;
const WRAP_THRESHOLD_PX = FOLDERS_PER_ROW * ITEM_STEP; // matches the old "half" translation
const OVERSCAN = 5;
const GRID_ROW_GAP = Math.round(6 * FOLDER_SCALE);

function mod(n: number, m: number) {
	return ((n % m) + m) % m;
}

function VirtualMarqueeRow({
	rowIndex,
	duration,
	dir,
}: {
	rowIndex: number;
	duration: number;
	dir: Dir;
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

	const virtualizer = useVirtualizer({
		horizontal: true,
		count: ITEM_COUNT,
		getScrollElement: () => scrollRef.current,
		estimateSize: () => ITEM_STEP,
		overscan: OVERSCAN,
	});

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
					const colorIndex = mod(rowIndex + absIndex, PALETTE.length);
					const isHovered = hoveredAbsIndex === absIndex;

					return (
						<div
							key={virtualItem.key}
							style={{
								position: "absolute",
								top: PADDING_TOP,
								left: 0,
								transform: `translateX(${virtualItem.start + PADDING_LEFT}px)`,
								height: FOLDER_HEIGHT,
							}}
						>
							<button
								type="button"
								style={{
									...styles.folderBtn,
									transform: isHovered
										? "scale(1.14) translateY(-4px)"
										: "scale(1) translateY(0)",
								}}
								onMouseEnter={() => {
									pausedRef.current = true;
									setHoveredAbsIndex(absIndex);
								}}
								onMouseLeave={() => {
									pausedRef.current = false;
									setHoveredAbsIndex(null);
								}}
								aria-label="Folder"
							>
								<FolderIcon colorIndex={colorIndex} />
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function FolderGrid({
	rows = Math.max(1, ROW_CONFIG.length - 1),
	className = "",
}: {
	rows?: number;
	className?: string;
}) {
	const config = ROW_CONFIG.slice(0, rows);

	return (
		<>
			<style>{`
        .folder-marquee-scroll::-webkit-scrollbar { display: none; }
      `}</style>
			<div style={styles.gridWrap} className={className}>
				{config.map((row) => (
					<VirtualMarqueeRow
						key={row.id}
						rowIndex={row.id}
						duration={row.duration}
						dir={row.dir}
					/>
				))}
			</div>
		</>
	);
}

export default FolderGrid;

const styles: {
	gridWrap: React.CSSProperties;
	rowOuter: React.CSSProperties;
	folderBtn: React.CSSProperties;
} = {
	gridWrap: {
		overflow: "hidden",
		display: "flex",
		flexDirection: "column",
		gap: `${GRID_ROW_GAP}px`,
		padding: "0",
		background: "#eef1f5",
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
	folderBtn: {
		flexShrink: 0,
		background: "none",
		border: "none",
		padding: 0,
		cursor: "pointer",
		width: `${FOLDER_WIDTH}px`,
		height: `${FOLDER_HEIGHT}px`,
		transition: "transform 0.18s cubic-bezier(.34,1.56,.64,1)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
};
