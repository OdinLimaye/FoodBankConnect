import SuppliesPieChart from "../components/charts/SuppliesPieChart";
import SchoolsMap from "../components/charts/SchoolsMap.jsx"
import OrgsBarChart from "../components/charts/OrgsBarChart.jsx"

import Header from "../components/Header.jsx"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"

const ProviderVisualizations = () => {
  return (
    <>
      <Navbar/>
      <Header headerText={"Project Pencil ATX Visualizations"}/>
      <div style={{ padding: "2rem" }}>
        <SuppliesPieChart/>
        <br /><br /><br />
        <SchoolsMap/>
        <br /><br /><br />
        <OrgsBarChart/>
      </div>
      <Footer/>
    </>

  );
};

export default ProviderVisualizations;
