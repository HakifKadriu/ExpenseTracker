import React from "react";
import "./App.css";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Login from "./Views/Login/Login";
import Register from "./Views/Register/Register";
import Dashboard from './Views/Dashboard/MyExpenses';
import SharedExpenses from "./Views/Dashboard/SharedExpenses";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Login />
        </Route>

        <Route exact path="/register">
          <Register />
        </Route>

        <Route exact path="/login">
          <Login />
        </Route>

        <Route exact path="/myexpenses/:mode">
          <Dashboard />
        </Route>

        <Route exact path="/sharedexpenses/:mode">
          <SharedExpenses />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
