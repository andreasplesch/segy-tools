 #!/bin/bash
 # dumps intrument serial number in PASSCAL segy
 od -Ad -t d2 -j 224 -N 2 --endian=big
