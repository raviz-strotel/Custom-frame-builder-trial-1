import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PixelArtConverter from "@/pages/PixelArtConverter";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PixelArtConverter />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;