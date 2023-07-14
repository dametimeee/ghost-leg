import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./Home";

const App = () => {
  return (
    <Router>
      <Route path="/">
        <Home />
      </Route>
    </Router>
  );
};

export default App;
