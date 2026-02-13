const DATA_URL = "books.json";

const root = document.getElementById("list");

let data;

function asArray(v) {
	if (!v) return [];
	return Array.isArray(v) ? v : [v];
}

function searchKey(value) {
	if (value == null) return "";
	if (typeof value === "string" || typeof value === "number") {
		return value.toString();
	}
	if (Array.isArray(value)) {
		return value.map(searchKey).join("##");
	}
	if (typeof value === "object") {
		return Object.values(value).map(searchKey).join("##");
	}
	return "";
}

function searchTransformation(str) {
	return str
		.toLowerCase()
		.replace(/'\.,:;!\?-/g, "")
		.replace(/ë/g, "e")
		.replace(/æ/g, 'ae')
		.replace(/ſ/g, 's')
		.replace(/-\n/g, '')
		.replace(/\n/g, ' ')
		.replace(/ɛ/g, 'z')
		.replace(/ξξ/g, 'th')
		.replace(/ξ/g, 'dh')
		.replace(/ȣ/g, 'y');
}

fetch(DATA_URL)
	.then(r => r.json())
	.then(json => {
		data = json;
		data.forEach(work => {
			work._searchKey = searchTransformation(searchKey(work));
		});
		renderList();
	})
	.catch(err => {
		root.textContent =
			"Failed to load data.";
		console.error(err);
	});

function applyToList(list, formatter) {
	if (typeof(list) === "string" || typeof(list) === "number") {
		return [formatter(list)];
	} else {
		let formatted = [];
		list.forEach(value => {
			formatted.push(formatter(value));
		});
		return formatted;
	}
}

function renderList() {
	root.innerHTML = applyToList(data, work => `<div class="item">${renderItem(work, {})}</div>`).join("");
}

function utilSep(list, sep) {
	return typeof(list) === "string" || typeof(list) === "number" ? list : list.join(sep);
}

function ordinalSuffix(i) {
    let j = i % 10, k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
}

const lects = {
	"sangiorgio": "San Giorgio",
	"southgreece": "southern Greece",
};

function formatLect(lect) {
	if (lects[lect]) {
		return lects[lect];
	} else if (/\-/.test(lect)) {
		return formatLect(lect.replace(/\-.+$/g, '')) + ", " + formatLect(lect.replace(/^.+?\-/g, ''));
	} else {
		return lect.charAt(0).toString().toUpperCase() + lect.substring(1);
	}
}

const scripts = {
	"latin": "pure Latin (unspecified)",
	"latin-bashkimi": "Latin (Bashkimi)",
	"latin-catholic": "Latin with Catholic symbols",
	"latin-greek": "Latin with Greek letters (unspecified)",
	"latin-frasheri": "Latin (Frashëri)",
	"latin-standard": "Latin (standard)",
	"greek": "pure Greek (unspecified)",
	"greek-latin": "Greek with Latin letters (unspecified)",
	"latin-agimi": "Latin (Agimi)",
	"vithkuqi": "Vithkuqi",
	"elbasan": "Elbasan",
	"arabic": "Perso-Arabic",
}

function renderItem(work, not_required) {
	let ret = "";
	function missingData(field) {
		console.warn(`No ${field} for object ${JSON.stringify(work)}.`);
	}
	// Title.
	if (work.title) {
		ret += `<div class="title">${work.title}</div>`;
	} else if (!not_required.title) {
		missingData("title");
	}
	// Meta.
	ret += `<div class="meta">`
	// Edition.
	if (work.edition) {
		ret += `<div class="field"><span class="label">Edition:</span> ${ordinalSuffix(work.edition)}</div>`
	}
	// Volume.
	if (work.volume) {
		ret += `<div class="field"><span class="label">Volume:</span> ${work.volume}</div>`;
	}
	// Author.
	if (work.author === false) {
		ret += `<div class="field">anonymous</div>`;
	} else if (work.author) {
		ret += `<div class="field"><span class="label">Author:</span> ${utilSep(work.author)}</div>`;
	} else if (!not_required.author) {
		missingData("author");
	}
	// Year.
	if (work.year) {
		ret += `<div class="field"><span class="label">Year:</span> ${utilSep(work.year)}</div>`;
	} else if (!work.editions && !work.volumes && !not_required.year) {
		missingData("year");
	}
	// Editions.
	if (work.editions || work.volumes) {
		if (work.editions && work.volumes) {
			console.warn(`Both editions and volumes were given for ${JSON.stringify(work)}.`);
		}
		worklist = work.editions ?? work.volumes;
		ret += `<div class="field"><dl><dt class="label">${work.editions ? "Editions" : "Volumes"}:</dt><dd>${
			applyToList(worklist, edition => `<div class="edition">${renderItem(edition, {
				title: not_required.title || typeof(work.title) !== "undefined",
				year: not_required.year || typeof(work.year) !== "undefined",
				author: not_required.author || typeof(work.author) !== "undefined",
				script: not_required.script || typeof(work.script) !== "undefined",
			})}</div>`).join("")
		}</dd></dl></div>`
	}
	// Type.
	if (work.type) {
		ret += `<div class="field"><span class="label">Type:</span> ${work.type}</div>`;
	}
	// Location.
	if (work.location) {
		ret += `<div class="field"><span class="label">Location:</span> ${work.location}</div>`;
	}
	// Publisher.
	if (work.publisher) {
		ret += `<div class="field"><span class="label">Publisher:</span> ${work.publisher}</div>`;
	}
	// Pages.
	if (work.pages) {
		ret += `<div class="field"><span class="label">Pages:</span> ${work.pages}</div>`;
	} else if (!work.volumes && !work.editions) {
		missingData("pages");
	}
	// Links.
	if (work.link) {
		let links = [];
		[
			{
				key: "bksh",
				display: "BKSH",
				formatter: id => "https://bibliotekadigjitale.bksh.al/?view=ImageView&manifest=https%3A%2F%2Fbibliotekadigjitale.bksh.al%2Fiiif%2FManifester%2FIIIF%2F" + id.replace(/!/g, '%21') + ".dir"
			},
			{
				key: "unishk",
				display: "UNISHK",
				formatter: id => "https://adsh.unishk.edu.al/items/show/" + id
			},
			{
				key: "onb",
				display: "ÖNB",
				formatter: id => "https://viewer.onb.ac.at/" + id
			},
			{
				key: "mdz",
				display: "MDZ",
				formatter: id => "https://www.digitale-sammlungen.de/en/view/" + id
			},
			{
				key: "gb",
				display: "Google Books",
				formatter: id => "https://books.google.com?id=" + id
			},
			{
				key: "ws",
				display: "Wikisource",
				formatter: id => "https://wikisource.org/wiki/Index:" + id
			},
			{
				key: "ao",
				display: "Albanian Orthodox",
				formatter: id => "https://albanianorthodox.com/wp-content/uploads/" + id
			},
			{
				key: "url",
				display: "Url",
				formatter: url => url
			},
		].forEach(site => {
			if (work.link[site.key]) {
				let link = `<span class="field"><span class="label">${
					site.display
				}:</span> ${
					applyToList(work.link[site.key], id => `<a class="ext" href="${site.formatter(id)}">${id}</a>`).join(", ")
				}</span>`;
				links.push(link);
			}
		});
		ret += `<div class="field"><dl><dt class="label">External links:</dt><dd>${links.join("")}</dd></dl></div>`;
	}
	// Lect.
	if (work.lect) {
		ret += `<div class="field"><span class="label">Lect:</span> ${formatLect(work.lect)}</div>`;
	}
	// Script.
	if (work.script) {
		ret += `<div class="field"><span class="label">Writing system:</span> ${applyToList(work.script, script => {
			if (!scripts[script]) {
				console.warn("Undefined script " + script);
			}
			return scripts[script];
		}).join(", ")}</div>`;
	} else if (!not_required.script) {
		missingData("script");
	}
	ret += `</div>`
	return ret;
}
