import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./components/Welcome";
import Wallet from "./components/Wallet";
export default function App() {
  return (
    <Router>
      <main className="flex flex-col items-center justify-center h-screen ">
        <div className="p-10 mx-auto border-4 border-black-400 rounded-lg">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/wallet" element={<Wallet />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
}
