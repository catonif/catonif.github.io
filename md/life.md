% 1D Life

[Download](https://github.com/catonif/1dlife/releases/tag/1.0.0) for Windows, it's way faster  
[More of my stuff](https://catonif.github.io/)

| - | - |
| [Render in 2D]{#r2dlabel} | [ ]{#inputRenderIn2D} |
| [AutoStep]{#autoLabel} | [ ]{#inputAuto onchange="autoSet()"} |
| Habitat Width | [...]{#inputSize value="32"} |
| Neighbour distance | [...]{#inputNeighDistance value="1"} |
| Game rule | [---]{#inputRule onchange="ruleGt()" value="$12"} |
| [AutoStep delay]{#waitLabel} | [...]{#inputWait value="100"} |

[[start]](lifer.start()) [[step]](lifer.step()){#stepBtn}

```
```
{#outputElement}

<script>

	ruleGt();
	function ruleGt() {
		const isGt = inputRule.value == "gt";
		inputRenderIn2D.checked = inputRenderIn2D.disabled = isGt;
		
		document.getElementById("r2dlabel").style.color = isGt ? "gray" : "white";
	}

	autoSet();
	function autoSet() {
		const auto = inputAuto.checked;
		document.getElementById("waitLabel").style.color = auto ? "white" : "gray";
		document.getElementById("stepBtn").style.display = auto ? "none" : "inline";
		inputWait.disabled = !auto;
	}

</script>