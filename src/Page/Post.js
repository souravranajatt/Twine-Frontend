import React from 'react';
import HeaderArea from "../Components/Header/Header.js";
import FooterArea from "../Components/Footer/Footer.js";
import "../Assets/Bundle/Post.css";

function Post() {
    return (
        <>
            <div className="main-wrapper-post">
                <HeaderArea />

                {/* Main Post Content */}
                <div className="middle-main-container-post">
                    hello
                </div>


                <FooterArea />
            </div>
        </>
    )
}

export default Post
