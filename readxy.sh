 #!/bin/bash
 # dumps x,y in positions 80 and 84 as signed 4 byte integers for all traces
 # for plotting
 #
 # example using simple shell math: 3200 ebdic header length, 400 binary header length, 80 trace header offset
 # nso number of samples per trace, from binary header
 # dump a long line with x and y as the first two columns, use awk to isolate
 nso=`od -An -j 3220 -N 2 -t d2 --endian=big $1`
 od -Ad -j $((3200+400+80)) -w$((nso*4+240)) -t d4 --endian=big $1 | awk '{print $1,$2,$3}'
