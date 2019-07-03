#!/bin/bash
# resets scaleco field in trace headers to 1
# 
# example how to write binary using echo
#
# use as
# resetscale.sh infile.sgy outfile.sgy

# get samples per trace

nso=`dd if=$1 conv=swab | od -j 3220 -N 2 -t u2 -w2 | awk 'NR==1{print $2}' `

# copy ebcdic and binary header
dd if=$1 of=$2 bs=3600 count=1

# write trace header and data
tr=0
while true
  do 
  dd if=$1 of=$2 iflag=skip_bytes oflag=append skip=$((3600+$tr*(240+$nso*4))) bs=70 count=1 conv=notrunc &> dd.err
  grep cannot dd.err &> /dev/null
  if [ $? -eq 0 ] 
    then  break 
  fi
# write scaleco
  echo -e -n '\x00\x01' >> $2
# write remainder
  dd if=$1 of=$2 iflag=skip_bytes oflag=append skip=$((3600+$tr*(240+$nso*4)+72)) bs=$((240-72+$nso*4)) count=1 conv=notrunc
  tr=$(($tr+1))
done
