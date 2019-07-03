#!/bin/bash
# dumps 3200 byte EBCDIC encoded header to standard out
# use standard in
dd conv=ascii,unblock cbs=80 ibs=3200 count=1 status=noxfer 2> /dev/null
