#!/usr/bin/ruby

require 'scanf'

STDIN.each_line {|line|
    inputs = line.scanf("%f %f %f %f %f %f")
    minx = inputs[0]
    miny = inputs[1]
    maxx = inputs[2]
    maxy = inputs[3]
    range = inputs[4]
    scale = inputs[5]
    bbw = maxx - minx
    bbh = maxy - miny
    transx = range - minx
    transy = range - miny
    width = (bbw + range * 2.0) * scale
    height = (bbh + range * 2.0) * scale
    puts "#{transx} #{transy} #{width.ceil} #{height.ceil}"
}
