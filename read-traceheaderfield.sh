#!/bin/bash
# dumps value of a single trace header field as 2 byte and 4 byte integer
# 
# use standard in
# use as
# read-traceheaderfield.sh N samples/trace offset
# N = which trace starting from 0
# samples/trace = check binary header, eg. 3001
# offset = which field position to lookup, eg. 72

od --endian=big -v -A d -j $((3600+$1*(240+$2*4)+$3)) -N 4 -t u2 -w4 | head -n 1 | awk '{print $1*1.,$2,$3,$2*65536+$3}'
