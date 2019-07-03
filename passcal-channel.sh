 #!/bin/bash
 # dumps channel name code in PASSCAL segy
 od -Ad -t a -j 194 -w4 -N 4 --endian=big
