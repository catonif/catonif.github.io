// map initiation and input data

const map = L.map('map').setView([50, 11], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var marker = new L.marker([50.0875, 14.421389], { opacity: 0.01 });
marker.bindTooltip("My Label", {permanent: true, className: "my-label", offset: [-15, 29], direction: "top", interactive: true });
marker.bindPopup("pizza")
marker.addTo(map);