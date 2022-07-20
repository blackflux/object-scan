SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

node --predictable $SCRIPT_DIR/comparison/benchmark.js && \
node --always-opt $SCRIPT_DIR/comparison/benchmark.js && \
node --no-opt $SCRIPT_DIR/comparison/benchmark.js && \
node $SCRIPT_DIR/comparison/benchmark.js
