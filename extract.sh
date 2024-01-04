#!/bin/bash
declare names;
declare acc;
readarray -t names < <(grep -oP '<label.*title=\"\K[A-Za-z ]+(?=")' page.html)
readarray -t acc < <(grep -oP '<label.*title="[A-Za-z ]+">\K.+(?=<)' page.html)
echo $names
echo $acc

printf "{\n" > orgs.json
for (( i=0; i<${#acc[*]}; ++i)); do
    printf '"%s": "%s",\n' "${acc[$i]}" "${names[$i]}" >> orgs.json
done
echo "}" >> orgs.json