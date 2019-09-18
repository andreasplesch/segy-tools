# segy-tools

Seismic data in SEG-Y format often requires inspecting files before processing with targeted software. It is convenient to use standard unix tools such as dd or od for this purpose since these tools are typically available on any system without installation procedures. This repo collects small examples or shell scripts to quickly inspect any SEG-Y file or extract trace data.

# Resources

https://www.passcal.nmt.edu/content/passcal-seg-y-trace-header

https://seg.org/Portals/0/SEG/News%20and%20Resources/Technical%20Standards/seg_y_rev1.pdf

https://ds.iris.edu/files/sac-manual/commands/write.html

---

http://man7.org/linux/man-pages/man1/od.1.html

http://man7.org/linux/man-pages/man1/dd.1.html

# Plot example

```sh
#!/bin/bash
# plots x,y in positions 80 and 84 as signed 4 byte integers for all traces via gnuplot
#
# example using simple shell math: 3200 ebdic header length, 400 binary header length, 80 trace header offset
# nso number of samples per trace, from binary header
# dump a long line with x and y as the first two columns, use awk to isolate
# plot after dividing by 1000 to convert to km
nso=`od -An -j 3220 -N 2 -t d2 --endian=big $1`
od -An -j $((3200+400+80)) -w$((nso*4+240)) -t d4 --endian=big $1 | awk '{print $2/1000,$3/1000}' | gnuplot -e "plot '-'" -p
```

![image](https://user-images.githubusercontent.com/6171115/60623278-480b0f00-9db0-11e9-8424-8e9186267ee1.png)
