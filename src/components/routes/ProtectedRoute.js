import React, { useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import CurrentUserContext from "components/CurrentUserContext";

const ProtectedRoute = ({ auth = true, redirectTo = "/", ...props }) => {
  const {
    currentUser: { email },
  } = useContext(CurrentUserContext);

  if ((auth && !email) || (!auth && email)) {
    return "wat";
    // return <Redirect to={redirectTo} />
  }

  return <Route {...props} />;
};

export default ProtectedRoute;
