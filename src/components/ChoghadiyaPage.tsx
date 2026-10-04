import { fetchChoghadiya } from "../api";
import DayTablePage, { type DayTableConfig } from "./DayTablePage";

const CONFIG: DayTableConfig = {
  bannerTitle: "Aaj Ka Choghadiya",
  dayTitle: "Day Choghadiya",
  nightTitle: "Night Choghadiya",
  fetcher: fetchChoghadiya,
  legend: [
    { tone: "good", label: "Auspicious" },
    { tone: "bad", label: "Inauspicious" },
    { tone: "neutral", label: "Normal" }
  ]
};

export function ChoghadiyaPage() {
  return <DayTablePage config={CONFIG} />;
}

export default ChoghadiyaPage;
