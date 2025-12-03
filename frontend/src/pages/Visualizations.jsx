import FoodbanksBarChart from "../components/charts/FoodbanksBarChart";
import ProgramPieChart from "../components/charts/ProgramPieChart";
import SponsorsLineChart from "../components/charts/SponsorsLineChart";

const Visualizations = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>FoodBankConnect Visualizations</h1>

      <FoodbanksBarChart />
      <ProgramPieChart />
      <SponsorsLineChart />
    </div>
  );
};

export default Visualizations;