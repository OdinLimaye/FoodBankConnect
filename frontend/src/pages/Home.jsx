import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  useEffect(() => {
    function adjustScroll() {
      const scrollbar = document.getElementById("scrollbar");
      const thumb = document.getElementById("scrollthumb");
      const scrollEl = document.scrollingElement || document.documentElement;

      if (!scrollbar || !thumb) return;

      const barWidth = scrollbar.getBoundingClientRect().width;
      const thumbWidth = thumb.getBoundingClientRect().width;

      const maxScroll = Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth);
      const progress = maxScroll > 0 ? scrollEl.scrollLeft / maxScroll : 0;

      const maxThumbX = Math.max(0, barWidth - thumbWidth);
      const thumbX = Math.min(maxThumbX, Math.max(0, progress * maxThumbX));

      thumb.style.left = `${thumbX}px`;
    }

    window.addEventListener("DOMContentLoaded", adjustScroll);
    window.addEventListener("resize", adjustScroll);
    window.addEventListener("scroll", adjustScroll, { passive: true });

    return () => {
      window.removeEventListener("DOMContentLoaded", adjustScroll);
      window.removeEventListener("resize", adjustScroll);
      window.removeEventListener("scroll", adjustScroll);
    };
  }, []);

  return (
    <div id="wrapper">
      <div id="pictures">
        <table id="bgtable">
          <tbody>
            <tr>
              {[
                "central-texas-food-bank.jpg",
                "new-food-pantry.jpg",
                "st-ignatius.jpg",
                "volunteer2.jpg",
                "central-austin-food-pantry.jpg",
                "cooking-case.png",
                "drive-thru.jpg",
                "food-bank-delivery.jpg",
                "hope-food-pantry.jpg",
                "volunteer.jpg",
                "trader-joes.png",
                "trinity_church.jpeg",
                "d_lair.png",
              ].map((img, idx) => (
                <td key={idx} id={`bgtd${idx}`}>
                  <img
                    data-lazy={`images/${img}`}
                    className="fade-in bg-img"
                    src={`images/${img}`}
                    alt=""
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <div className="overlay"></div>
      </div>

      <div id="maintable">
        <table className="center">
          <tbody>
            <tr>
              <td>
                <img id="icon" src="favicon.svg" alt="Food Bank Icon" />
              </td>
            </tr>
            <tr>
              <td>
                <div className="invert">
                  <h1>Food Bank Connect</h1>
                  <p id="info">
                    <strong>We are foodbankconnect.me</strong>
                    <br />
                    We are a hub for food banks, donors, and volunteers to find
                    ways to use their skills and resources to provide food for
                    those suffering from hunger. We think no family should be
                    barred from accessing food due to poverty. Our site allows
                    those in need of assistance to search for services from
                    which they can directly benefit. Explore our site and find
                    out about our mission to end hunger!
                  </p>
                </div>

                <table id="nav-buttons">
                  <tbody>
                    <tr id="select-tr">
                      <td>
                        <Link to="/foodbanks" id="food-banks-btn">
                          <strong>View Food Banks</strong>
                        </Link>
                      </td>
                      <td>
                        <Link to="/sponsors" id="sponsors-btn">
                          <strong>View Sponsors</strong>
                        </Link>
                      </td>
                      <td>
                        <Link to="/programs" id="programs-btn">
                          <strong>View Programs</strong>
                        </Link>
                      </td>
                      <td>
                        <Link to="/about" id="about-btn">
                          <strong>About the Site</strong>
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr id="scroll-tr">
              <td>
                <div id="scrollbar">
                  <div id="scrollbody"></div>
                  <div id="scrollthumb"></div>
                </div>
                <p id="thumbtext">Shift+Scroll to Move</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
