 #!/bin/bash
 # dumps number of samples in PASSCAL segy
 od -Ad -t d4 -j 228 -N 4 --endian=big
