import ItemsByCategoryBar from "../components/charts/ItemsByCategoryBar";
import RequestStatusPie from "../components/charts/RequestStatusPie";
import RequestsOverTimeLine from "../components/charts/RequestsOverTimeLine";

const ProviderVisualizations = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Project Pencil ATX Visualizations</h1>

      <ItemsByCategoryBar />
      <RequestStatusPie />
      <RequestsOverTimeLine />
    </div>
  );
};

export default ProviderVisualizations;
