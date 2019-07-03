#!/bin/bash
# dumps 400 byte binary header as 2 byte integers
# refer to the documentation on the number format of fields
# Most fields are 2 byte integers, some are 4 byte integers
# use -t d4 -w4 to dump as 4 byte integers
# use standard in

od -A d -j 3200 -N 400 -t d2 -w2 --endian=big
