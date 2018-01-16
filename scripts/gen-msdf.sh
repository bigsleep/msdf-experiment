#!/bin/bash

MSDFGEN=./msdfgen
scale=2.0

usage() {
    echo "Usage: $0 font" 1>&2
    exit 1
}

read_metrics() {
    IFS=, read -r "$4" "$5" "$6" "$7" <<<"0,0,0,0"
    while read -r line; do
        IFS='=' read -r input_name input < <(echo "$line" | tr -d ' ')
        case "$input_name" in
            "codepoint" ) read -r "$3" <<<"$input" ;;
            "bounds" ) IFS=, read -r "$4" "$5" "$6" "$7" <<<"$input" ;;
            "advance" ) read -r "$8" <<<"$input" ;;
            "range" ) read -r "$9" <<<"$input" ;;
        esac
    done < <(echo "codepoint = $2"; $MSDFGEN metrics -font $1 $2)
}

gen_msdf() {
    read_metrics $1 $2 codepoint minx miny maxx maxy advance range
    read -r transx transy width height < <(./scripts/calc.rb <<<"$minx $miny $maxx $maxy $range $scale")
    $MSDFGEN msdf -font $font $codepoint -o resource/msdf$codepoint.png -translate $transx $transy -size $width $height -scale $scale -range $range
    echo $transx $transy $advance $range $scale
}

if [ $# -ne 1 ]; then
    usage
fi

font=$1
first=32
last=126
metrics="{\n"

for i in $(seq $first $last); do
    m="\""$i"\": "$(gen_msdf $font $i |
        xargs -n5 sh -c 'printf "{\"translatex\":$0,\"translatey\":$1,\"advance\":$2,\"range\":$3,\"scale\":$4}"')
    if [ $i == $last ]; then
        metrics+=$m"\n"
    else
        metrics+=$m",\n"
    fi
done

metrics+="}"

echo -e $metrics
