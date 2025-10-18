import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SponsorCard from "../components/SponsorCard";

// --- Static list for reference ---
const sponsorsListStatic = [
  {
    name: "Trader Joe's",
    image: "/images/trader-joes.png",
    alt: "Trader Joe's Logo",
    contribution: "Food Sourcing",
    contributionAmt: 180000,
    contributionUnit: "Pounds",
    affiliation: "Private Corporation",
    pastInvolvement: "Hope Food Pantry",
    about: `Trader Joe's is a national chain of grocery stores known for
            offering high-quality products at affordable prices. To keep costs
            low, Trader Joe's often buys directly from suppliers whenever
            possible and avoids charging fees for shelf placement, allowing
            savings to be passed on to customers. 
            The company is also committed to reducing food waste through its
            Neighborhood Shares Program, which donates unsold but safe-to-eat
            food to local food banks and non-profit organizations, supporting
            communities across the country.`,
    sponsor_link: "https://www.traderjoes.com/home/about-us",
    map_link:
      "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d220539.8874539993!2d-97.82659583598571!3d30.267412043571!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1strader%20joe&#39;s!5e0!3m2!1sen!2sus!4v1760663282849!5m2!1sen!2sus",
  },
  {
    name: "Dragon's Lair Comics and Fantasy",
    image: "/images/d_lair.png",
    alt: "Dragon's Lair Comics and Fantasy Logo",
    contribution: "Food Drive Partners",
    contributionAmt: 1200,
    contributionUnit: "Pounds",
    affiliation: "Local Business",
    pastInvolvement: "Hope Food Pantry",
    about: `Dragon's Lair Comics and Fantasy originally opened in 1986 in downtown
            Austin. Since then, the franchise has expanded to several locations,
            including San Marcos and even as far as Columbus, Ohio. Dragon's Lair
            Comics and Fantasy is a specialty store that sells comics, games,
            manga, plush toys, action figures, and other pop culture
            collectibles.
            Twice a year, Dragon's Lair hosts a semi-annual food drive called
            CanMander for the Hope Food Pantry, donating roughly 1,200 pounds of
            canned food each year. The store also partners with and supports other
            community organizations, including CASA, AIDS Walk Austin, and Hill
            Country Ride for AIDS.`,
    sponsor_link: "https://www.dlair.net/austin/",
    map_link:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3442.7507971841947!2d-97.73534872543222!3d30.358031503646735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644cba542543a81%3A0x71d6a75b8593f74b!2sDragon%27s%20Lair%20Comics%20and%20Fantasy!5e0!3m2!1sen!2sus!4v1759120976221!5m2!1sen!2sus",
  },
  {
    name: "Trinity Church of Austin",
    image: "/images/trinity_church.jpeg",
    alt: "Trinity Church of Austin Logo",
    contribution: "Housing Pantry",
    contributionAmt: "N/A",
    contributionUnit: "",
    affiliation: "Church",
    pastInvolvement: "Hope Food Pantry",
    about: `The Trinity Church of Austin originally began in 1946, then known as
            Trinity Methodist Church, as a project to attract more youth to the
            area north of 45th Street. Over the years, Trinity became a welcoming
            community known for its inclusivity and commitment to social justice.
            The church is dually affiliated with both the United Methodist Church
            (UMC) and the United Church of Christ (UCC), reflecting its open and
            progressive values.
            The Trinity Church of Austin also founded the Hope Food Pantry and has
            continued to house and support it for the past 20 years, serving
            countless families in need throughout the Austin community.`,
    sponsor_link: "https://www.trinitychurchofaustin.org/about/",
    map_link:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6889.361204326793!2d-97.73415362543467!3d30.303153106268617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644ca79c5b19ad5%3A0xb8e828e4b25fb889!2sTrinity%20Church%20of%20Austin!5e0!3m2!1sen!2sus!4v1759121661517!5m2!1sen!2sus",
  },
];

const Sponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSponsors() {
      try {
        const res = await fetch("https://foodbankconnect.me/API/sponsors");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setSponsors(data);
      } catch (err) {
        console.error("Failed to fetch sponsors, using static list as fallback:", err);
        setSponsors(sponsorsListStatic);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSponsors();
  }, []);

  if (loading) return <div className="container my-5">Loading sponsors...</div>;

  // ✅ Always show sponsors (even if fetch failed)
  return (
    <div className="sponsors-page">
      <Navbar />
      <Header headerText="Sponsors & Donors" />

      <main className="container my-5">
        {error && (
          <div className="text-danger mb-3">
            Failed to load live data, showing static list instead. Error: {error}
          </div>
        )}

        <div className="mb-4 text-muted">
          Showing {sponsors.length} Sponsors in Total
        </div>

        <div className="row g-4">
          {sponsors.map((sponsor, idx) => (
            <div key={idx} className="col-md-4">
              <SponsorCard
                sponsor_img={sponsor.image}
                sponsor_alt={sponsor.alt}
                name={sponsor.name}
                about={sponsor.about}
                contribution={sponsor.contribution}
                contribution_amt={sponsor.contributionAmt}
                contribution_unit={sponsor.contributionUnit}
                affiliation={sponsor.affiliation}
                sponsor_link={sponsor.sponsor_link}
                past_inv={sponsor.pastInvolvement}
                map_link={sponsor.map_link}
              />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Sponsors;
