import type { Point } from '@/lib/route-map';
// One-time public OSM lookup, 2026-10-04; not a separate itinerary.
// Area points represent a beach/airport/streetscape, not a terminal or entrance.
// Ambiguous addresses have no coordinate. Sources are retained for review.
export const placeCoordinates:Record<string,{point:Point;source:string;area?:boolean}> = {
 sessun:{point:[41.3904561,2.1650268],source:"https://www.openstreetmap.org/node/6357924078"},
 eseoese:{point:[41.3920976,2.1617215],source:"https://www.openstreetmap.org/node/6123758692"},
 "bargain-garden":{point:[41.3906569,2.189988],source:"https://www.openstreetmap.org/node/12074283952"},
  "hilton-bcn": {
    "point": [
      41.3886867,
      2.1315596
    ],
    "source": "https://www.openstreetmap.org/way/652896201"
  },
  "hilton-mad": {
    "point": [
      40.4521697,
      -3.5855357
    ],
    "source": "https://www.openstreetmap.org/way/262521352"
  },
  "ewr": {
    "point": [
      40.6891397,
      -74.1726854
    ],
    "source": "https://www.openstreetmap.org/way/141207228",
    "area": true
  },
  "bcn": {
    "point": [
      41.2968559,
      2.0826892
    ],
    "source": "https://www.openstreetmap.org/way/314726876",
    "area": true
  },
  "mad": {
    "point": [
      40.4950168,
      -3.5619325
    ],
    "source": "https://www.openstreetmap.org/way/167025457",
    "area": true
  },
  "palau": {
    "point": [
      41.3875838,
      2.1752198
    ],
    "source": "https://www.openstreetmap.org/way/377216661"
  },
  "santa-caterina": {
    "point": [
      41.3861461,
      2.1785169
    ],
    "source": "https://www.openstreetmap.org/way/31957078"
  },
  "chocolate": {
    "point": [
      41.3871081,
      2.1817252
    ],
    "source": "https://www.openstreetmap.org/way/167056918"
  },
  "miro": {
    "point": [
      41.3686501,
      2.1598485
    ],
    "source": "https://www.openstreetmap.org/relation/3347844"
  },
  "park-guell": {
    "point": [
      41.4142034,
      2.1516022
    ],
    "source": "https://www.openstreetmap.org/way/66713401"
  },
  "sagrada": {
    "point": [
      41.4035047,
      2.1742801
    ],
    "source": "https://www.openstreetmap.org/relation/9194723"
  },
  "sagradas-tapas": {
    "point": [
      41.4085399,
      2.1745509
    ],
    "source": "https://www.openstreetmap.org/node/8222340617"
  },
  "pedrera": {
    "point": [
      41.3953994,
      2.1618775
    ],
    "source": "https://www.openstreetmap.org/relation/8974896"
  },
  "batllo": {
    "point": [
      41.3915411,
      2.1647614
    ],
    "source": "https://www.openstreetmap.org/relation/9427554"
  },
  "barceloneta": {
    "point": [
      41.3793812,
      2.1933981
    ],
    "source": "https://www.openstreetmap.org/relation/7333373",
    "area": true
  },
  "bogatell": {
    "point": [
      41.3939417,
      2.2073583
    ],
    "source": "https://www.openstreetmap.org/relation/2175041",
    "area": true
  },
  "cosmocaixa": {
    "point": [
      41.4125315,
      2.1315647
    ],
    "source": "https://www.openstreetmap.org/way/248742203"
  },
  "paradeta": {
    "point": [
      41.3766194,
      2.1383174
    ],
    "source": "https://www.openstreetmap.org/node/6968932686"
  },
  "sants": {
    "point": [
      41.3790121,
      2.1399601
    ],
    "source": "https://www.openstreetmap.org/relation/7646696"
  },
  "ona": {
    "point": [
      41.390378,
      2.1704577
    ],
    "source": "https://www.openstreetmap.org/node/7528238286"
  },
  "sant-pau": {
    "point": [
      41.4126654,
      2.1743359
    ],
    "source": "https://www.openstreetmap.org/relation/7422814"
  },
  "born": {
    "point": [
      41.3847576,
      2.1828059
    ],
    "source": "https://www.openstreetmap.org/way/22430203",
    "area": true
  },
  "gaudi-avenue": {
    "point": [
      41.4070092,
      2.1744002
    ],
    "source": "https://www.openstreetmap.org/way/459464520",
    "area": true
  },
  "poblenou": {
    "point": [
      41.4045599,
      2.1966952
    ],
    "source": "https://www.openstreetmap.org/way/239562141",
    "area": true
  },
  "gracia": {
    "point": [
      41.4002243,
      2.1575761
    ],
    "source": "https://www.openstreetmap.org/way/86681381",
    "area": true
  },
  "thinking-mu": {
    "point": [
      41.3946793,
      2.159332
    ],
    "source": "https://www.openstreetmap.org/node/12020213118"
  },
  "paloma-wool": {
    "point": [
      41.3998842,
      2.1717758
    ],
    "source": "https://www.openstreetmap.org/node/11067138968"
  },
  "passeig-gracia": {
    "point": [
      41.3943949,
      2.1621566
    ],
    "source": "https://www.openstreetmap.org/way/294085186",
    "area": true
  },
  "apartment": {
    "point": [
      41.39804,
      2.1689552
    ],
    "source": "https://www.openstreetmap.org/node/6173160220"
  },
  "atocha": {
    "point": [
      40.4046611,
      -3.6889703
    ],
    "source": "https://www.openstreetmap.org/way/733993037"
  },
  "grocery-concepcio": {
    "point": [
      41.3958835,
      2.1686308
    ],
    "source": "https://www.openstreetmap.org/way/176206668"
  },
  "grocery-veritas": {
    "point": [
      41.4017446,
      2.1669113
    ],
    "source": "https://www.openstreetmap.org/node/11635197681"
  },
  "grocery-condis": {
    "point": [
      41.396857,
      2.1704726
    ],
    "source": "https://www.openstreetmap.org/node/13059373602"
  },
  "camper": {
    "point": [
      41.392762,
      2.1632215
    ],
    "source": "https://www.openstreetmap.org/node/5915698088"
  },
  "indi-cold": {
    "point": [
      41.392088,
      2.1627065
    ],
    "source": "https://www.openstreetmap.org/node/11291344954"
  },
  "skfk": {
    "point": [
      41.4034062,
      2.1574284
    ],
    "source": "https://www.openstreetmap.org/node/10763878207"
  },
  "bimba": {
    "point": [
      41.3896894,
      2.1351095
    ],
    "source": "https://www.openstreetmap.org/node/11048677998"
  }
};
