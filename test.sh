names=("TEST=" "BORT=" "LOL=")
values=("wow" "" "NICE")
length=${#names[@]}
let l=$length-1
for i in $(seq 0 $l); do
    if [ -n "${values[i]}" ]; then
        if [ "${names[i]}" = "TEST=" ] || [ "${names[i]}" = "LOL=" ]; then
            names[$i]="wat/""${names[i]}"
        fi
        echo "${names[i]}${values[i]}"
    fi
done
