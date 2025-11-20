import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
    return (
        <header className="nav">
            <div className="nav-inner">
                <Link className="brand" to="/">GalaxyGram</Link>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/create">Create</Link>
                </nav>
            </div>
        </header>
    );
}
