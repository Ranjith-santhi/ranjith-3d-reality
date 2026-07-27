import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Wireframe from './pages/Wireframe';
import InMotion from './pages/InMotion';
import Foundations from './pages/Foundations';
import Animation from './pages/Animation';
import Fabric from './pages/Fabric';
import Symmetry from './pages/Symmetry';
import KeyFeatures from './pages/KeyFeatures';
import SmoothScroll from './components/SmoothScroll';

function App() {
  return (
    <Router>
      <SmoothScroll>

        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/origin" element={<Home />} />
          <Route path="/creator" element={<About />} />
          <Route path="/wireframe" element={<Wireframe />} />
          <Route path="/foundations" element={<Foundations />} />
          <Route path="/rendered-reality" element={<Projects />} />
          <Route path="/in-motion" element={<InMotion />} />
          <Route path="/animation" element={<Animation />} />
          <Route path="/fabric" element={<Fabric />} />
          <Route path="/symmetry" element={<Symmetry />} />
          <Route path="/key-features" element={<KeyFeatures />} />
          <Route path="/transmit" element={<Contact />} />
        </Routes>
      </SmoothScroll>
    </Router>
  );
}

export default App;
