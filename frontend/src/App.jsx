import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'

export default function App() {
  const [ingested, setIngested] = useState(false)
  const [projectName, setProjectName] = useState('')

  return (
    <div className="flex h-screen overflow-hidden" style={{background:'var(--color-bg)'}}>
      <Sidebar
        ingested={ingested}
        setIngested={setIngested}
        setProjectName={setProjectName}
      />
      <ChatWindow ingested={ingested} projectName={projectName} />
    </div>
  )
}
