| |objectScanCompiled|objectScan|jsonpath|jsonpathplus|jmespath|
|---|---|---|---|---|---|
|<a href="./test/comparison/suites/key.js">Get Key</a>|19.73 μs|<span style="color:#b01414">26.06 μs</span>|24.84 μs|<span style="color:#1f811f">6.34 μs</span>|<span style='color:#ff0000'>✘</span>|
|<a href="./test/comparison/suites/value.js">Get Value</a>|10.93 μs|20.21 μs|<span style="color:#b01414">33.20 μs</span>|<span style="color:#1f811f">3.10 μs</span>|4.99 μs|
|<a href="./test/comparison/suites/condition.js">Conditional Path</a>|13.84 μs<i><sup><a href="timing_ref_1">[1]</a></sup></i>|22.23 μs<i><sup><a href="timing_ref_1">[1]</a></sup></i>|28.41 μs|<span style="color:#b01414">494.41 μs</span>|<span style="color:#1f811f">5.97 μs</span>|
|<a href="./test/comparison/suites/recursive.js">Recursive Traversal</a>|20.18 μs<i><sup><a href="timing_ref_2">[2]</a></sup></i>|26.32 μs<i><sup><a href="timing_ref_2">[2]</a></sup></i>|<span style="color:#b01414">30.67 μs<i><sup><a href="timing_ref_3">[3]</a></sup></i></span>|<span style="color:#1f811f">9.42 μs<i><sup><a href="timing_ref_3">[3]</a></sup></i></span>|<span style='color:#ff0000'>✘</span><i><sup><a href="timing_ref_4">[4]</a></sup></i>|

<a id="#timing_ref_1">[1]</a>:  Only in code logic<br>
<a id="#timing_ref_2">[2]</a>:  [Depth-first](https://en.wikipedia.org/wiki/Tree_traversal#Depth-first_search) traversal<br>
<a id="#timing_ref_3">[3]</a>:  [Custom depth-first](https://cs.stackexchange.com/questions/99440) traversal<br>
<a id="#timing_ref_4">[4]</a>: [Reference](https://github.com/jmespath/jmespath.py/issues/110)<br>
