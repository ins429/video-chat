import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Main from "./pages/Main";
import ChannelPage from "./pages/Channel";
import { PageLoader } from "./components/Loader";
import CurrentUserContext from "./components/CurrentUserContext";

const AppRouter = () => {
  const { loading, currentUser } = useContext(CurrentUserContext);
  console.log("pjlee 000");

  if (loading || !currentUser) {
    return <PageLoader text />;
  }
  console.log("pjlee 111");

  return (
    <Router>
      <Routes>
        <Route path="/:channelName" element={<ChannelPage />} />
        <Route path="/" element={<Main />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
