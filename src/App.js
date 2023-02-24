import './App.css';
import TextEditor from './Components/TextEditor';
import { Route, Routes, Navigate } from "react-router-dom"
import { v4 as uuidv4 } from 'uuid'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Navigate to={`/document/${uuidv4()}`} replace />} />
        <Route path='/document/:id' element={<TextEditor />} />
      </Routes>

    </div>
  );
}

export default App;
