import FoodbanksBarChart from "../components/charts/FoodbanksBarChart";
import ProgramPieChart from "../components/charts/ProgramPieChart";
import SponsorSankey from "../components/charts/SponsorSankey.jsx";

import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import Header from "../components/Header.jsx"

const Visualizations = () => {
  return (
    <>
      <Navbar/>
      <Header headerText={"FoodBankConnect Visualizations"}/>
      <div style={{ padding: "2rem" }}>
        <FoodbanksBarChart/>
        <br /><br /><br />
        <ProgramPieChart/>
        <br /><br /><br />
        <SponsorSankey/>
      </div>
      <Footer/>
    </>

  );
};

export default Visualizations;