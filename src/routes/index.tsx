import { createFileRoute } from '@tanstack/react-router'

import { githubProjects } from '../data/githubProjects'
import FolderGrid from '../components/FolderGrid'
import { PortfolioChrome } from '../components/PortfolioChrome'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <>
      <FolderGrid projects={githubProjects} />
      <div className="portfolio-vignette-layer" aria-hidden="true" />
      <PortfolioChrome />
    </>
  )
}
