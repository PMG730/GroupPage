import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GroupsPage from "./pages/GroupsPage";

import Header from "./components/Header";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <div className="Page">
          <header className="App-header">
            <Header />
          </header>
          <Routes>
            <Route path="/" element={<GroupsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
