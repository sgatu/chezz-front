import './assets/index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Menu from './pages/Menu';
import Game from './pages/Game';
import { Toaster } from './components/shadcn/ui/toaster';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Menu />} />
          <Route path='/game/:id' element={<Game />}></Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  )
}

export default App
