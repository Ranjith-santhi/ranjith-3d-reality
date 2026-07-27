import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="logo">Antigravity</div>
            <ul className="nav-links">
                <li><Link to="/origin" className="nav-link">Origin</Link></li>
                <li><Link to="/creator" className="nav-link">The Creator</Link></li>
                <li><Link to="/wireframe" className="nav-link">Wireframe</Link></li>
                <li><Link to="/foundations" className="nav-link">Foundations</Link></li>
                <li><Link to="/rendered-reality" className="nav-link">Rendered Reality</Link></li>
                <li><Link to="/in-motion" className="nav-link">In Motion</Link></li>
                <li><Link to="/animation" className="nav-link">Animation</Link></li>
                <li><Link to="/fabric" className="nav-link">Boundaries</Link></li>
                <li><Link to="/symmetry" className="nav-link">Symmetry</Link></li>
                <li><Link to="/key-features" className="nav-link">Key Features</Link></li>
                <li><Link to="/transmit" className="nav-link">Transmit</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
