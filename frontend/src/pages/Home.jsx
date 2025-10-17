import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Home.module.css";

const Home = () => {
  useEffect(() => {
    function adjustScroll() {
      // select the single scrollbar / thumb elements (CSS Modules classes)
      const scrollbar = document.querySelector(`.${styles.scrollbar}`);
      const thumb = document.querySelector(`.${styles.scrollthumb}`);
      // the element we scroll horizontally is the document's scrolling element
      const scrollEl = document.scrollingElement || document.documentElement;

      if (!scrollbar || !thumb || !scrollEl) return;

      const barWidth = scrollbar.getBoundingClientRect().width;
      const thumbWidth = thumb.getBoundingClientRect().width;

      const maxScroll = Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth);
      const progress = maxScroll > 0 ? scrollEl.scrollLeft / maxScroll : 0;

      const maxThumbX = Math.max(0, barWidth - thumbWidth);
      const thumbX = Math.min(maxThumbX, Math.max(0, progress * maxThumbX));

      thumb.style.left = `${thumbX}px`;
    }

    // Update thumb when page loads / resizes / scrolls
    window.addEventListener("DOMContentLoaded", adjustScroll);
    window.addEventListener("resize", adjustScroll);
    window.addEventListener("scroll", adjustScroll, { passive: true });

    // Enable Shift + Wheel -> horizontal scroll; also support normal wheel while pointer over page
    const onWheel = (e) => {
      // If shiftKey or (trackpad with horizontal delta), move horizontally
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        // prefer deltaX (if present) otherwise use deltaY when shift is pressed
        const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
        window.scrollBy({ left: delta, behavior: "auto" });
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });

    // Make sure adjustScroll runs initially
    setTimeout(adjustScroll, 100);

    return () => {
      window.removeEventListener("DOMContentLoaded", adjustScroll);
      window.removeEventListener("resize", adjustScroll);
      window.removeEventListener("scroll", adjustScroll);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* BACKGROUND IMAGES (horizontal strip) */}
      <div id="pictures" className={styles.pictures}>
        <table className={styles.bgtable}>
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
                    className={`${styles["fade-in"]} ${styles["bg-img"]}`}
                    src={`images/${img}`}
                    alt=""
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* translucent overlay sits above images but below interactive content */}
        <div className={styles.overlay}></div>
      </div>

      {/* FIXED / FOREGROUND CONTENT (logo, text, buttons) - stays on top of images */}
      <div className={styles.maintable}>
        <table className="center">
          <tbody>
            <tr>
              <td>
                <img
                  className={styles.icon}
                  src="favicon.svg"
                  alt="Food Bank Icon"
                />
              </td>
            </tr>

            <tr>
              <td>
                <div className="invert">
                  <h1>Food Bank Connect</h1>
                  <p className={styles.info}>
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
                        <Link to="/foodbanks" className={styles["food-banks-btn"]}>
                          <strong>View Food Banks</strong>
                        </Link>
                      </td>
                      <td>
                        <Link to="/sponsors" className={styles["sponsors-btn"]}>
                          <strong>View Sponsors</strong>
                        </Link>
                      </td>
                      <td>
                        <Link to="/programs" className={styles["programs-btn"]}>
                          <strong>View Programs</strong>
                        </Link>
                      </td>
                      <td>
                        <Link to="/about" className={styles["about-btn"]}>
                          <strong>About the Site</strong>
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            <tr className={styles["scroll-tr"]}>
              <td>
                <div className={styles.scrollbar}>
                  <div className={styles.scrollbody}></div>
                  <div className={styles.scrollthumb}></div>
                </div>
                <p className={styles.thumbtext}>Shift+Scroll to Move</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
