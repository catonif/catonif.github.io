var recent = 0;
var future = 0;
var correct = 0;
var wrong = 0;

var values = new Array(16);
for (let i = 0; i < 16; i++) values[i] = 0;

function pressed(what) {
	recent <<= 1;
	recent += what;
	recent %= 16;
	values[recent]++;
	if (recent === future) correct++;
	else wrong++;
	future = recent << 1;
	future %= 16;
	let howManyZero = values[future];
	let howManyOne = values[future + 1];
	if (howManyZero < howManyOne) future++;
	else future += Math.round(Math.random());
	document.getElementById("bar").value = wrong / (correct + wrong);
	document.getElementById("count").innerHTML = correct + wrong;
}