import { fetchHora } from "../api";
import DayTablePage, { type DayTableConfig } from "./DayTablePage";

/** A hora is read by its lord, so the swatches are the classical graha colours
 *  rather than an auspicious/inauspicious verdict. */
const CONFIG: DayTableConfig = {
  bannerTitle: "Running Hora",
  dayTitle: "Day Hora",
  nightTitle: "Night Hora",
  fetcher: fetchHora,
  className: "hora-page",
  legend: [
    { tone: "jupiter", label: "Jupiter - Fruitful" },
    { tone: "venus", label: "Venus - Beneficial" },
    { tone: "mercury", label: "Mercury - Quick" },
    { tone: "moon", label: "Moon - Gentle" },
    { tone: "sun", label: "Sun - Vigorous" },
    { tone: "mars", label: "Mars - Aggressive" },
    { tone: "saturn", label: "Saturn - Sluggish" }
  ]
};

export function HoraPage() {
  return <DayTablePage config={CONFIG} />;
}

export default HoraPage;
