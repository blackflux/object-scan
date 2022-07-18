|_[v8 --no-opt](https://flaviocopes.com/node-runtime-v8-options/)_|objectScanCompiled|objectScan|[jsonpath](https://www.npmjs.com/package/jsonpath)|[jsonpath-plus](https://www.npmjs.com/package/jsonpath-plus)|[jmespath](https://www.npmjs.com/package/jmespath)|
|---|---|---|---|---|---|
|<a href="./test/comparison/suites/key.js">Get Key</a>|<span style='color:#00ff00'>✔</span> 1.81x|<span style='color:#00ff00'>✔</span> 4.98x|<span style="color:#b01414"><span style='color:#00ff00'>✔</span> 5.84x</span>|<span style="color:#1f811f"><span style='color:#00ff00'>✔</span> 1.00x</span>|<span style='color:#ff0000'>✘</span>|
|<a href="./test/comparison/suites/value.js">Get Value</a>|<span style='color:#00ff00'>✔</span> 3.33x|<span style='color:#00ff00'>✔</span> 11.81x|<span style="color:#b01414"><span style='color:#00ff00'>✔</span> 26.56x</span>|<span style="color:#1f811f"><span style='color:#00ff00'>✔</span> 1.00x</span>|<span style='color:#00ff00'>✔</span> 3.35x|
|<a href="./test/comparison/suites/condition.js">Conditional Path</a>|<span style="color:#1f811f"><span style='color:#00ff00'>✔</span><i><sup><a href="#timing_ref_1">[1]</a></sup></i> 1.00x</span>|<span style='color:#00ff00'>✔</span><i><sup><a href="#timing_ref_1">[1]</a></sup></i> 3.03x|<span style='color:#00ff00'>✔</span> 6.23x|<span style="color:#b01414"><span style='color:#00ff00'>✔</span> 27.09x</span>|<span style='color:#00ff00'>✔</span> 1.45x|
|<a href="./test/comparison/suites/recursive.js">Recursive Traversal</a>|<span style="color:#1f811f"><span style='color:#00ff00'>✔</span><i><sup><a href="#timing_ref_2">[2]</a></sup></i> 1.00x</span>|<span style="color:#b01414"><span style='color:#00ff00'>✔</span><i><sup><a href="#timing_ref_2">[2]</a></sup></i> 2.12x</span>|<span style='color:#00ff00'>✔</span><i><sup><a href="#timing_ref_3">[3]</a></sup></i> 1.70x|<span style='color:#00ff00'>✔</span><i><sup><a href="#timing_ref_3">[3]</a></sup></i> 1.27x|<span style='color:#ff0000'>✘</span><i><sup><a href="#timing_ref_4">[4]</a></sup></i>|
|<a href="./test/comparison/suites/callback.js">Callback</a>|<span style="color:#1f811f"><span style='color:#00ff00'>✔</span><i><sup><a href="#timing_ref_5">[5]</a></sup></i> 1.00x</span>|<span style="color:#b01414"><span style='color:#00ff00'>✔</span><i><sup><a href="#timing_ref_5">[5]</a></sup></i> 1.86x</span>|<span style='color:#ff0000'>✘</span>|<span style='color:#00ff00'>✔</span> 1.11x|<span style='color:#ff0000'>✘</span>|
|<a href="./test/comparison/suites/parent.js">Get Parent</a>|<span style='color:#00ff00'>✔</span> 1.15x|<span style="color:#b01414"><span style='color:#00ff00'>✔</span> 2.38x</span>|<span style='color:#ff0000'>✘</span>|<span style="color:#1f811f"><span style='color:#00ff00'>✔</span> 1.00x</span>|<span style='color:#ff0000'>✘</span>|
|<a href="./test/comparison/suites/multiplePaths.js">Multiple Paths</a>|<span style="color:#1f811f"><span style='color:#00ff00'>✔</span> 1.00x</span>|<span style="color:#b01414"><span style='color:#00ff00'>✔</span> 4.22x</span>|<span style='color:#ff0000'>✘</span><i><sup><a href="#timing_ref_6">[6]</a></sup></i>|<span style='color:#ff0000'>✘</span><i><sup><a href="#timing_ref_6">[6]</a></sup></i>|<span style='color:#00ff00'>✔</span><i><sup><a href="#timing_ref_7">[7]</a></sup></i> 1.21x|