#!/bin/bash
# dumps sample data in PASSCAL segy, as signed 4 byte integers
od -Ad -t d4 -j 240 -w4 --endian=big
# just data without address
# od -An -t d4 -j 240 -w4 --endian=big
