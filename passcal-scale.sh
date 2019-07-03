#!/bin/bash
# dumps scale factor in PASSCAL segy
# PASSCAL uses floating point in header fields
od -Ad -t f4 -j 220 -N 4 --endian=big
