 #!/bin/bash
 # dumps sample interval in us in PASSCAL segy
 od -Ad -t d4 -j 200 -N 4 --endian=big
