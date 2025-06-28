// map initiation and input data

const map = L.map('map').setView([50, 11], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const mapData = [
	{
		"type": "ExternalData",
		"service": "geoshape",
		"ids": "Q183",
		"properties": {
			"title": "Germany",
			"description": "Country in Europe",
			"sort": 1
		}
	},
	{
		"type": "ExternalData",
		"service": "geoshape",
		"ids": "Q980",
		"properties": {
			"title": "Bavaria",
			"description": "Federate state of Germany",
			"sort": 2
		}
	},
	{
		"type": "ExternalData",
		"service": "geopoint",
		"ids": "Q1726",
		"properties": {
			"title": "Munich",
			"description": "Capital city of Bavaria"
		}
	},
	{
		"type": "ExternalData",
		"service": "geopoint",
		"ids": "Q64",
		"properties": {
			"title": "Berlin",
			"description": "Capital city of Germany"
		}
	},
	{
		"type": "Feature",
		"ids": "Q104520",
		"properties": {
			"title": "Pomerania",
			"description": "Historical region in Central Europe",
			"sort": 2
		},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[12.403220118585438, 54.28648148799488], [12.988232294301554, 53.88917035620389], [12.741911378210403, 53.752852734385186], [13.111392752347768, 53.74374912037476], [12.988232294301554, 53.698201455990926], [13.188368038625327, 53.61609130191087], [13.480874126483968, 53.734643533672056], [13.542454355506436, 53.670849174801816], [13.865750557876368, 53.66172779946561], [13.74259009983021, 53.60695807685522], [14.004306073177588, 53.43305120805303], [14.081281359455147, 53.49720522078363], [14.250626989267602, 53.38716753760099], [14.050491244943885, 53.21235788444923], [14.31220721829132, 53.101582868276665], [14.466157790847546, 52.95343789922214], [14.697083649683748, 52.96271187009921], [14.928009508518727, 53.07384443897445], [15.112750195586244, 53.027573987295284], [15.389861226188714, 53.06459432275108], [15.436046397956119, 53.240006988506366], [15.743947543069794, 53.3228472220689], [15.913293172882305, 53.21235788444923], [16.098033859950988, 53.26763824272541], [16.03645363092849, 53.396348231476], [16.328959718785967, 53.41470367916577], [16.25198443250727, 53.52467012429091], [16.683046035667132, 53.50636216632955], [16.77541637920089, 53.38716753760099], [17.0063422380359, 53.54297017270284], [16.760021321945857, 53.934511054653115], [17.43740384119576, 54.09733026826845], [17.66832970003071, 54.06120327883954], [17.683724757286967, 54.16948994635541], [17.560564299240752, 54.232526591119324], [17.791490158076925, 54.421060039250534], [18.022416016911933, 54.57305001016533], [17.97623084514447, 54.83989077405221], [17.0217372952921, 54.67109550024588], [16.482910291343416, 54.51947102224324], [16.144219031717284, 54.268504366829404], [14.29681216103512, 53.916380682207546], [13.773380214341444, 54.16948994635541], [13.465479069227769, 54.115381972941606], [13.403898840205215, 54.22352724320194], [13.773380214341444, 54.31343246602705], [13.619429641785189, 54.43001627530555], [13.74259009983021, 54.53733850320455], [13.326923553926548, 54.67109550024588], [12.988232294301554, 54.45687324087169], [12.434010233096643, 54.49265513671082], [12.403220118585438, 54.28648148799488]]]
		}
	}
];

// popup HTML

function makePopup(properties) {
	return `<span class="popup-title">${
		properties.title
	}</span><span class="popup-content">${
		properties.description
	}</span>`;
}

const POPUP_SEPARATOR = `<hr>`;

// geography

let regions = [];

function getClickedRegions(latlng) {
	let clickedRegions = [];
	const coordinates = [latlng.lng, latlng.lat];
	for (let i = 0; i < regions.length; i++) {
		if (turf.booleanPointInPolygon(coordinates, regions[i]))
			clickedRegions.push(makePopup(regions[i].properties));
	}
	return clickedRegions.join(POPUP_SEPARATOR);
}

// handle popup logistics

function addGeoJSON(geoJSON) {
	const isRegion = geoJSON.geometry.type !== "Point";
	if (isRegion) regions.push(geoJSON);
	L.geoJSON(geoJSON, {
		onEachFeature: function(_, layer) {
			layer.on("click", e => {
				if (isRegion) {
					map.openPopup(getClickedRegions(e.latlng), e.latlng);
				} else if (!layer.getPopup()) {
					layer.bindPopup(
						makePopup(geoJSON.properties)
						+ POPUP_SEPARATOR
						+ getClickedRegions(e.latlng)
					).openPopup();
				}
			});
		}
	}).addTo(map);
}

// build map

let fetchPromises = [];

for (let i = 0; i < mapData.length; i++) {
	const element = mapData[i];
	// retrieve data from Wikidata
	if (element.type == "ExternalData") {
		fetchPromises.push(
			fetch(`https://maps.wikimedia.org/${element.service}?getgeojson=1&ids=${element.ids}`)
				.then(res => res.json())
				.then(geoJSON => {
					geoJSON = geoJSON.features[0]; // simplify by getting rid of FeatureCollections
					geoJSON.properties = element.properties;
					addGeoJSON(geoJSON);
				})
		);
	// apply locally given data
	} else if (element.type == "Feature") {
		addGeoJSON(element);
	}
}

// finalise data, i.e. apply sorting

Promise.all(fetchPromises).then(_ => {
	regions.sort((a, b) => b.properties.sort - a.properties.sort);
});
