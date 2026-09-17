// Every statistic on the site lives here with its primary-source citation.
// Each one was verified verbatim against the cited document. Do not add figures
// that have not been checked against their primary source.

export type Stat = {
  id: string;
  value: string;
  label: string;
  detail: string;
  source: string;
  sourceUrl: string;
};

export const solarStats: Stat[] = [
  {
    id: "iea-soiling",
    value: "4–7%",
    label: "of global solar energy output lost to soiling, on average",
    detail:
      "Soiling is responsible for an average 4–7% global energy loss, resulting in multi-billion-euro annual revenue losses for the PV industry.",
    source: "IEA PVPS Task 13/16 Fact Sheet, Understanding, Measuring, and Mitigating Soiling Losses in PV Power Systems, September 2025",
    sourceUrl: "https://iea-pvps.org/fact-sheets/fs-soiling-losses/",
  },
  {
    id: "unsw-soiling",
    value: "8–9%",
    label: "energy reduction at most operational Australian solar farms studied, from dust between rain events",
    detail:
      "UNSW modelling found most operational solar farms in Australia showed energy reductions of 8–9% due to accumulated dust of up to 2.5–3 g/m² between rainfall events.",
    source: "Prasad, Nishant and Kay, Applied Energy vol. 310, 2022, doi:10.1016/j.apenergy.2022.118626",
    sourceUrl: "https://doi.org/10.1016/j.apenergy.2022.118626",
  },
  {
    id: "joule-soiling",
    value: "€3–5bn",
    label: "a year in global revenue lost to soiling in 2018, even with optimised cleaning",
    detail:
      "Soiling reduced global solar power production by at least 3–4% in 2018, causing global revenue losses of at least 3–5 billion euros, with losses projected to reach 4–7% by 2023.",
    source: "Ilse et al., Joule vol. 3 no. 10, 2019, doi:10.1016/j.joule.2019.08.019",
    sourceUrl: "https://doi.org/10.1016/j.joule.2019.08.019",
  },
];

export const australiaStats: Stat[] = [
  {
    id: "cer-rooftop",
    value: "1 in 3",
    label: "suitable Australian homes have rooftop solar",
    detail:
      "Australia reached 4 million small-scale renewable energy installations in December 2024, with 1 in 3 suitable Australian homes now having rooftop solar.",
    source: "Clean Energy Regulator, 3 December 2024",
    sourceUrl:
      "https://cer.gov.au/news-and-media/news/2024/december/australia-reaches-4-million-small-scale-renewable-energy-installations",
  },
  {
    id: "abs-renting",
    value: "30.6%",
    label: "of occupied private dwellings in Australia are rented",
    detail: "Of all occupied private dwellings, 31 per cent are owned outright, 35 per cent are owned with a mortgage and 30.6 per cent are rented.",
    source: "Australian Bureau of Statistics, Housing: Census 2021",
    sourceUrl: "https://www.abs.gov.au/statistics/people/housing/housing-census/latest-release",
  },
];
