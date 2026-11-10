#!/bin/bash
# Final renders one at a time: each line of queue.txt is "name|env assignments|script"; done names go to queue.done.
cd "$(dirname "$0")"
touch queue.done
while true; do
  line=$(grep -v '^#' queue.txt | while IFS='|' read -r n e s; do grep -qx "$n" queue.done || { echo "$n|$e|$s"; break; }; done)
  [ -z "$line" ] && { sleep 30; continue; }
  IFS='|' read -r n e s <<< "$line"
  echo "start $n $(date -u +%H:%M)" >> queue.log
  env $e OUT=final/$n.png nice -n 2 "${PY:-venv/bin/python}" $s > final/$n.log 2>&1 && echo "$n" >> queue.done || { echo "FAIL $n" >> queue.log; echo "$n" >> queue.done; }
  echo "end $n $(date -u +%H:%M)" >> queue.log
done
