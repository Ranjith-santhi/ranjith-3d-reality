import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Animation from './pages/Animation';
import Symmetry from './pages/Symmetry';
import SmoothScroll from './components/SmoothScroll';

const ScrollToTop = () => {
  const { pathname, state, hash } = useLocation();

  useEffect(() => {
    // Reset window & Lenis scroll position to top instantly on every route change
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, state, hash]);

  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <SmoothScroll>

        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/origin" element={<Home />} />
          <Route path="/creator" element={<About />} />
          <Route path="/animation" element={<Animation />} />
          <Route path="/symmetry" element={<Symmetry />} />
        </Routes>
      </SmoothScroll>
    </Router>
  );
}

export default App;
