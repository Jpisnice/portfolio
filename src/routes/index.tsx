import * as fuzzySearch from "@m31coding/fuzzy-search";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import FolderGrid from "../components/FolderGrid";
import { PortfolioChrome } from "../components/PortfolioChrome";
import { githubProjects } from "../data/githubProjects";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const [query, setQuery] = useState("");

	const searchActive = query.trim().length > 0;

	const searcher = useMemo(() => {
		type Entry = { index: number; project: (typeof githubProjects)[number] };

		const entries: Entry[] = githubProjects.map((project, index) => ({
			index,
			project,
		}));

		const nextSearcher = fuzzySearch.SearcherFactory.createDefaultSearcher<
			Entry,
			number
		>();

		nextSearcher.indexEntities(
			entries,
			(e) => e.index,
			(e) => [e.project.name, e.project.description, e.project.tag],
		);

		return nextSearcher;
	}, []);

	const matchingIndices = useMemo((): Set<number> => {
		if (!query.trim()) return new Set();

		// Query returns a list of matches with the original entity object attached.
		// We want to dim the folder rows based on project-array index => `absIndex % projects.length`.
		const result = searcher.getMatches(
			new fuzzySearch.Query(query.trim(), Infinity),
		);

		return new Set(result.matches.map((m) => m.entity.index));
	}, [query, searcher]);

	return (
		<>
			<FolderGrid
				projects={githubProjects}
				matchingIndices={matchingIndices}
				searchActive={searchActive}
			/>
			<div className="portfolio-vignette-layer" aria-hidden="true" />
			<PortfolioChrome query={query} onQueryChange={setQuery} />
		</>
	);
}
