import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ModernInventory from "./ModernInventory";

function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ModernInventory />} />
                <Route path="/inventory" element={<ModernInventory />} />
            </Routes>
        </Router>
    );
}

export default AppRouter;
