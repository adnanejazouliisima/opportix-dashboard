"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_router_dom_1 = require("react-router-dom");
var react_1 = require("react");
var Login_1 = require("./Login");
// import Dashboard from './Dashboard';
// import AdminPanel from './AdminPanel';
function App() {
    var _a = (0, react_1.useState)(null), user = _a[0], setUser = _a[1];
    (0, react_1.useEffect)(function () {
        // Check local storage for persistent login
        var savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);
    var handleLogin = function (userData, token) {
        setUser(userData);
    };
    var handleLogout = function () {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };
    return (<react_router_dom_1.BrowserRouter>
      <react_router_dom_1.Routes>
        <react_router_dom_1.Route path="/login" element={!user ? <Login_1.default onLogin={handleLogin}/> : <react_router_dom_1.Navigate to="/" replace/>}/>
        <react_router_dom_1.Route path="/" element={user ? (<div style={{ color: "white", padding: 20 }}>
                <h1>Dashboard App</h1>
                <p>Bienvenue {user.displayName}</p>
                <button onClick={handleLogout}>Déconnexion</button>
              </div>) : <react_router_dom_1.Navigate to="/login" replace/>}/>
      </react_router_dom_1.Routes>
    </react_router_dom_1.BrowserRouter>);
}
exports.default = App;
