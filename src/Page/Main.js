import React from "react";
import "../Assets/Bundle/Main.css";
import HeaderArea from "../Components/Header/Header.js";
import FooterArea from "../Components/Footer/Footer.js";
import HomeFeed from "../Components/HomePage/FeedSection/HomeFeed.js";
import PostUploadCard from "../Components/HomePage/PostSection/PostUploadCard.js";
import UserSuggestion from "../Components/HomePage/UserSuggestion/UserSuggestion.js";
import { useAuth } from "../AuthChecker/AuthContext.js";

function Main() {
  const { loggedUser } = useAuth();

  return (
    <div className="home-main-container">

      {/* Header Section */}
      <HeaderArea />

      {/* Main Wrapper - PostUploadCard and HomeFeed */}
      <main className="main-wrapper">

        <div className="slide-bar-wrapper">
          <PostUploadCard loggedUserData={loggedUser} />
          <UserSuggestion />
        </div>

        <HomeFeed />

      </main>

      {/* Footer Section */}
      <FooterArea />
    </div>
  );
}

export default Main;