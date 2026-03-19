import { createFileRoute } from '@tanstack/react-router'

import FolderGrid from '../components/FolderGrid'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return <FolderGrid />
}
