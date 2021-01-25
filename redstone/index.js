const faStart = "       ....#  ... !#  . ..^#  .     ...#    .. !#   ! ..o#  .o  .^";
const faCountinue = "#?..^   o#   o   ^#?..^   .#       .#  ... !#  . ..^#  .     ...#    .. !#   ! ..o#  .o  .^";
const faEnd = "#?..^   o#   o   ^#?..^     ..#        !#       .o#?.......^#        o#?.......^";

function GetFA(bitCount) {
    let fa = faStart;
    for (let i = 0; i < bitCount - 2; i++) fa += faCountinue;
    return fa + faEnd;
}

var updaters = [
    new Updater("4bFA", GetFA(4)),
    new Updater("andGate", "  ?  ?  .#  >o>o!"),
    new Updater("lever", "?"),
    new Updater("pistonTutorial", "?.>oo o#    o"),
    new Updater("pistonTutorial2", " ?#?>?# ?")
];
