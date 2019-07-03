 #!/bin/bash
 # plots x,y in positions 80 and 84 as signed 4 byte integers for all traces via gnuplot
 #
 # example using simple shell math: 3200 ebdic header length, 400 binary header length, 80 trace header offset
 # nso number of samples per trace, from binary header
 # dump a long line with x and y as the first two columns, use awk to isolate
 # plot after dividing by 1000 to convert to km
 nso=`od -An -j 3220 -N 2 -t d2 --endian=big $1`
 od -An -j $((3200+400+80)) -w$((nso*4+240)) -t d4 --endian=big $1 | awk '{print $2/1000,$3/1000}' | gnuplot -e "plot '-'" -p
