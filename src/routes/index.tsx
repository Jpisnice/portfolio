import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { githubProjects } from '../data/githubProjects'
import FolderGrid from '../components/FolderGrid'
import { PortfolioChrome } from '../components/PortfolioChrome'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [query, setQuery] = useState('')

  const searchActive = query.trim().length > 0

  const matchingIndices = useMemo((): Set<number> => {
    if (!query.trim()) return new Set()
    const q = query.toLowerCase()
    return new Set(
      githubProjects.reduce<number[]>((acc, project, i) => {
        const haystack = [project.name, project.description, project.tag].join(' ').toLowerCase()
        if (haystack.includes(q)) acc.push(i)
        return acc
      }, []),
    )
  }, [query])

  return (
    <>
      <FolderGrid projects={githubProjects} matchingIndices={matchingIndices} searchActive={searchActive} />
      <div className="portfolio-vignette-layer" aria-hidden="true" />
      <PortfolioChrome query={query} onQueryChange={setQuery} />
    </>
  )
}
