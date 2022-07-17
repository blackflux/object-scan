| |objectScanCompiled|objectScan|jsonpath|jsonpathplus|jmespath|
|---|---|---|---|---|---|
|<a href="./test/comparison/suites/key.js">Get Key</a>|18.60 μs|25.60 μs|<span style="color:#b01414">26.54 μs</span>|<span style="color:#1f811f">5.32 μs</span>|<span style='color:#ff0000'>✘</span>|
|<a href="./test/comparison/suites/value.js">Get Value</a>|9.67 μs|18.57 μs|<span style="color:#b01414">30.39 μs</span>|<span style="color:#1f811f">2.67 μs</span>|5.25 μs|
|<a href="./test/comparison/suites/condition.js">Conditional Path</a>|12.21 μs<i><sup><a href="#timing_ref_1">[1]</a></sup></i>|20.29 μs<i><sup><a href="#timing_ref_1">[1]</a></sup></i>|26.60 μs|<span style="color:#b01414">454.71 μs</span>|<span style="color:#1f811f">5.64 μs</span>|
|<a href="./test/comparison/suites/recursive.js">Recursive Traversal</a>|20.12 μs<i><sup><a href="#timing_ref_2">[2]</a></sup></i>|28.87 μs<i><sup><a href="#timing_ref_2">[2]</a></sup></i>|<span style="color:#b01414">31.14 μs<i><sup><a href="#timing_ref_3">[3]</a></sup></i></span>|<span style="color:#1f811f">10.18 μs<i><sup><a href="#timing_ref_3">[3]</a></sup></i></span>|<span style='color:#ff0000'>✘</span><i><sup><a href="#timing_ref_4">[4]</a></sup></i>|

<a id="timing_ref_1">[1]</a>:  Only in code logic<br>
<a id="timing_ref_2">[2]</a>:  [Depth-first](https://en.wikipedia.org/wiki/Tree_traversal#Depth-first_search) traversal<br>
<a id="timing_ref_3">[3]</a>:  [Custom depth-first](https://cs.stackexchange.com/questions/99440) traversal<br>
<a id="timing_ref_4">[4]</a>: [Reference](https://github.com/jmespath/jmespath.py/issues/110)<br>
