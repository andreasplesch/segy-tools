 #!/bin/bash
 # dumps sensor serial code in PASSCAL segy
 od -Ad -t a -j 186 -w8 -N 8 --endian=big
