| |objectScanCompiled|objectScan|jsonpath|jsonpathplus|jmespath|
|---|---|---|---|---|---|
|<a href="./test/comparison/suites/key.js">Get Key</a>|20.03 μs|24.77 μs|<span style="color:#b01414">25.57 μs</span>|<span style="color:#1f811f">5.52 μs</span>|<span style='color:#ff0000'>✘</span>|
|<a href="./test/comparison/suites/value.js">Get Value</a>|9.79 μs|18.43 μs|<span style="color:#b01414">33.04 μs</span>|<span style="color:#1f811f">2.35 μs</span>|4.67 μs|
|<a href="./test/comparison/suites/condition.js">Conditional Path</a>|11.62 μs _(code logic)_|20.24 μs _(code logic)_|27.32 μs|<span style="color:#b01414">454.35 μs</span>|<span style="color:#1f811f">6.34 μs</span>|
|<a href="./test/comparison/suites/recursive.js">Recursive Traversal</a>|20.95 μs _(depth-first)_|26.55 μs _(depth-first)_|<span style="color:#b01414">30.69 μs _[(custom depth-first)](https://cs.stackexchange.com/questions/99440)_</span>|<span style="color:#1f811f">9.40 μs _[(custom depth-first)](https://cs.stackexchange.com/questions/99440)_</span>|<span style='color:#ff0000'>✘</span>[*](https://github.com/jmespath/jmespath.py/issues/110)|
