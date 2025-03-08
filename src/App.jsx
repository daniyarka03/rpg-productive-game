import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ProductivityApocalypse from './pages/ProductivityApocalypse'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ProductivityApocalypse />
    </>
  )
}

export default App
