import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import ArticleDetail from "./pages/ArticleDetail.jsx";
import EmployeeDetail from "./pages/EmployeeDetail.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/employee/:id" element={<EmployeeDetail />} />
      </Routes>
    </div>
  );
}
