import React, { useState, useEffect, useRef } from "react";
import "../Assets/Bundle/Main.css";
import HeaderArea from "../Components/Header/Header.js";
import FooterArea from "../Components/Footer/Footer.js";
import HomeFeed from "../Components/HomePage/FeedSection/HomeFeed.js";
import PostCard from "../Components/HomePage/PostSection/PostCard.js";
import { loggedUserDataAPI } from "../Utils/homePageAPI.js";

function Main() {

  const [loggedUserData, setLoggedUserData] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchLoggedData = async () => {
      try {
        const res = await loggedUserDataAPI();
        setLoggedUserData(res);
      } catch (err) {
        setLoggedUserData(null);
      }
    };
    fetchLoggedData();
  }, []);

  return (
    <div className="home-main-container">

      {/* Header Section */}
      <HeaderArea />

      {/* Main Wrapper - PostCard and HomeFeed */}
      <main className="main-wrapper">

        <PostCard loggedUserData={loggedUserData} />
        <HomeFeed />

      </main>

      {/* Footer Section */}
      <FooterArea />
    </div>
  );
}

export default Main;