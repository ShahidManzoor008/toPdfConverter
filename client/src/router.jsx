import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PDFConverter from "./pages/PDFConverter";

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<PDFConverter />} />
    </Routes>
  </Router>
);

export default AppRouter;
