 #!/bin/bash
 # dumps station name code in PASSCAL segy
 od -Ad -t a -j 180 -w6 -N 6 --endian=big
