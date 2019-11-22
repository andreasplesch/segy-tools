// https://observablehq.com/d/c0c035a64cbb6b72@1212
import define1 from "./e93997d5089d7165@2200.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["stk00819t.first5.sgy",new URL("./files/132b650120a2e6db55c12dbc467db4dec8fe43014096f20997944567e8fd0015a16d9c2505505242455d792f0ce4b2a1f48a77c01c95cc0c808b706c71e7caa1",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["html"], function(html){return(
html`<div style='text-align:right;font-size:10px'> (c) 2019, Andreas Plesch, Waltham, MA, All rights reserved </div>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`# SEG-Y analyzer
Analyse SEG-Y files. Files are not uploaded to a server, they are only made available to be read locally by your browser. Fairly large files can analysed since the data is only read on a trace by trace basis and never read completely.

Javascript Dataview is used to deal with Big Endian order. EBCDIC is decoded with a small library. An EBCDIC textual 3200 byte header and a 400 byte binary header is expected to exist. It should be straightforward to add a switch to enable Seismic Unix, or other formats, without these header, but existing 240 byte trace headers.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## 1. Provide file`
)});
  main.variable(observer("segyfile")).define("segyfile", ["html"], function(html){return(
html`<input type=file accept='.sgy,.segy'>`
)});
  main.variable(observer()).define(["md","currentFile","segybuffer","binaryHeader","formatMap","totalTraceNo"], function(md,currentFile,segybuffer,binaryHeader,formatMap,totalTraceNo){return(
md`
File ** ${currentFile.name} ** has ** ${segybuffer.byteLength} ** bytes.

Given 3600 bytes of header, and ${binaryHeader.hns} samples per trace, and ${formatMap[binaryHeader.format].size}  bytes per sample, there should be ** ${totalTraceNo} ** number of traces in the file.
`
)});
  main.variable(observer("totalTraceNo")).define("totalTraceNo", ["segybuffer","binaryHeader","formatMap"], function(segybuffer,binaryHeader,formatMap){return(
(segybuffer.byteLength - 3600) / (240 + binaryHeader.hns * formatMap[binaryHeader.format].size)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## 2. EBCDIC Header`
)});
  main.variable(observer()).define(["html","ebcdicHeader_fmt"], function(html,ebcdicHeader_fmt){return(
html`<pre style='font-size:10px'>
${ebcdicHeader_fmt}
</pre>
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## 3. Binary Header`
)});
  main.variable(observer("viewof customOffset")).define("viewof customOffset", ["number"], function(number){return(
number({value: 27, placeholder: "1 to 399", title: "custom offset", description: "offset between 1 and 399", step:2, min:1, max:399, submit:0})
)});
  main.variable(observer("customOffset")).define("customOffset", ["Generators", "viewof customOffset"], (G, _) => G.input(_));
  main.variable(observer()).define(["md","binaryHeader","formatMap","customOffset","customOffsetValue"], function(md,binaryHeader,formatMap,customOffset,customOffsetValue){return(
md`
| offset | description | value |
| ------ | ----------- | ----- |
| 1-4  | job id | ${binaryHeader.jobid} |
| 5-8  | (in-)line number | ${binaryHeader.lino} |
| 9-12  | reel number | ${binaryHeader.reno} |
| 17-18  | interval in μs | ** ${binaryHeader.hdt} ** |
| 21-22  | number of samples | ** ${binaryHeader.hns} ** |
| 25-26  | data format code | ** ${binaryHeader.format} (${formatMap[binaryHeader.format].txt}) ** |
| 300.301  | SEG-Y revision | ${binaryHeader.rmaj}.${binaryHeader.rmin} |
| 302-303  | trace length fixed | ${binaryHeader.flgf} (${binaryHeader.flgf ? "use 21-22" : "use 114-115 in trace header"}) |
| ${customOffset}-${customOffset+1} | custom field 16bit | ${customOffsetValue.int16} |
| ${customOffset}-${customOffset+3} | custom field 32bit | ${customOffsetValue.int32} |

`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## 4. Trace Data and Headers`
)});
  main.variable(observer()).define(["md","traceSamples","traceNo"], function(md,traceSamples,traceNo){return(
md`
| samples min | samples max |
| -- | -- |
| ${traceSamples(traceNo).min} | ${traceSamples(traceNo).max} |
`
)});
  main.variable(observer("traceView")).define("traceView", ["traceSamples","traceNo","vegalite","width"], function(traceSamples,traceNo,vegalite,width)
{
  const samples = traceSamples(traceNo).values;
  
  const maxSamples = Math.min(500, samples.length);
  return vegalite(
  { 
    $schema: 'https://vega.github.io/schema/vega-lite/v3.json',
    data: {
      values: samples.map(
        (v,i) => { return { data: v, index: i }}),
      name: 'source'
    },
    vconcat: [
      {
        width: width-200,
        height: 100,
        title: `histogram (zero's not counted), ${maxSamples} out of ${samples.length} samples`,
        selection: {
          a: {type: 'single'}
        },
        mark: 'bar',
        transform: [
          {"filter": "datum.data != 0 "},
          {"sample": maxSamples}
          ],
        encoding: {
          y: {title:'count', field: 'data', aggregate:'count', type: 'quantitative'},
          x: {title:'amplitude', field: 'data', bin: {maxbins:30}, type: 'quantitative', axis: {format:'.2~f'}},
          _tooltip: {field: 'data', aggregate:'count', type: 'quantitative'},
          color: {
            condition: {selection: 'a', value: 'steelblue'},
            value: 'grey'
          }
        }
      },
      {
        width: width-200,
        height: 10, 
        selection: {
          a: {type: 'single'}
        },
        mark: 'rect',
        transform: [
          {filter: `datum.index % ${samples.length / maxSamples} < 1`}
          ],
        encoding: {
          x: {title:'sample number', field: 'index', type: 'ordinal'},
          color: {title:'amplitude', field: 'data', type: 'quantitative'},
          _tooltip: {field: 'data', aggregate:'count', type: 'quantitative'},
          
        }
      }
    ]
  },
  {
    renderer:'svg',
    padding: {left: 5, top: 5, right: 0, bottom: 5},
    _defaultStyle: 'overflow: auto'
  }             
  )
}
);
  main.variable(observer("viewof traceNo")).define("viewof traceNo", ["number","totalTraceNo"], function(number,totalTraceNo){return(
number({value: 1, title: "trace to analyse", description: "trace 1 to "+totalTraceNo, step:1, min:1, max:totalTraceNo, submit:0})
)});
  main.variable(observer("traceNo")).define("traceNo", ["Generators", "viewof traceNo"], (G, _) => G.input(_));
  main.variable(observer("viewof traceOffset")).define("viewof traceOffset", ["number"], function(number){return(
number({value: 21, placeholder: "1 to 237", title: "custom offset", description: "offset between 1 and 237", step:2, min:1, max:237, submit:0})
)});
  main.variable(observer("traceOffset")).define("traceOffset", ["Generators", "viewof traceOffset"], (G, _) => G.input(_));
  main.variable(observer()).define(["md","traceOffset","traceOffsetValuesInt1632","traceHeaderMDTable"], function(md,traceOffset,traceOffsetValuesInt1632,traceHeaderMDTable){return(
md`
| offset | shortName | first | value  | last |
| ------ | --------- | ----- | ------ | ---- |
| ${traceOffset} | custom 16 bit | ${traceOffsetValuesInt1632.first.int16} | ** ${traceOffsetValuesInt1632.value.int16} ** | ${traceOffsetValuesInt1632.last.int16} |
| ${traceOffset} | custom 32 bit | ${traceOffsetValuesInt1632.first.int32} | ** ${traceOffsetValuesInt1632.value.int32} ** | ${traceOffsetValuesInt1632.last.int32} |
${traceHeaderMDTable.join('\n')}
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## 5. Plots`
)});
  main.variable(observer("viewof traceOffsetX")).define("viewof traceOffsetX", ["number"], function(number){return(
number({value: 73, placeholder: "1 to 237", title: "offset for x", description: "offset between 1 and 237", step:2, min:1, max:237, submit:0})
)});
  main.variable(observer("traceOffsetX")).define("traceOffsetX", ["Generators", "viewof traceOffsetX"], (G, _) => G.input(_));
  main.variable(observer("viewof traceOffsetY")).define("viewof traceOffsetY", ["number"], function(number){return(
number({value: 77, placeholder: "1 to 237", title: "offset for y", description: "offset between 1 and 237", step:2, min:1, max:237, submit:0})
)});
  main.variable(observer("traceOffsetY")).define("traceOffsetY", ["Generators", "viewof traceOffsetY"], (G, _) => G.input(_));
  main.variable(observer("plotView")).define("plotView", ["allPlotHeaders","vegalite","width","traceOffsetX","traceOffsetY"], function(allPlotHeaders,vegalite,width,traceOffsetX,traceOffsetY)
{
  const minx = allPlotHeaders.stats.minx;
  const maxx = allPlotHeaders.stats.maxx;
  const miny = allPlotHeaders.stats.miny;
  const maxy = allPlotHeaders.stats.maxy;
  
  const maxTraces = Math.min(5000, allPlotHeaders.values.length);
  
  return vegalite(
  { 
    $schema: 'https://vega.github.io/schema/vega-lite/v3.json',
    data: {
      values: allPlotHeaders.values,
      name: 'plotsource'
    },
    width: width-200,
    height: 200,
    title: `${maxTraces} out of ${allPlotHeaders.values.length} records`,
    selection: {"grid": {"type": "interval", "bind": "scales"}},
    mark: {
      type:'circle',
      size:10,
      clip:true
    },
    transform: [{
      sample: maxTraces
    }],
    encoding: {
      x: {
        title:`offset: ${traceOffsetX}`,
        field: 'x',
        type: 'quantitative',
        scale: {domain: [minx, maxx]},
        axis: {format:'.2~f'}
      },
      y: {
        title:`offset: ${traceOffsetY}`,
        field: 'y',
        type: 'quantitative',
        scale: {domain: [miny, maxy]},
        axis: {format:'.2~f'}},
    }
  },
  {
    renderer:'svg',
    padding: {left: 5, top: 5, right: 0, bottom: 5},
    _defaultStyle: 'overflow: auto'
  }             
)
}
);
  main.variable(observer("traceRecords")).define("traceRecords", ["totalTraceNo","binaryHeader","traceSamples"], function(totalTraceNo,binaryHeader,traceSamples){return(
function (halfWindow = 1000/2, maxRecords = 200, maxSamples = 600, trace = 1){
  const trStart = Math.max(1, trace - halfWindow);
  const trEnd = Math.min(totalTraceNo, trace + halfWindow);
  const trStep = Math.max(1, (trEnd-trStart)/maxRecords);
  const sStep = Math.max(1, binaryHeader.hns/maxSamples);
  let records = [],
      samples,
      trFloor,
      sFloor,
      min = 1e99,
      max = -1e99,
      tr, i
    ;
  for (tr = trStart; tr < trEnd; tr += trStep) {
    trFloor = Math.floor(tr);
    samples = traceSamples(trFloor);
    if (samples.min < min) min = samples.min;
    if (samples.max > max) max = samples.max;
    
    for (i = 0; i < samples.values.length; i += sStep) {
      sFloor = Math.floor(i);
      records.push( {
        trNo: Math.floor(tr),
        time: sFloor * binaryHeader.hdt/1e6,
        value: samples.values[sFloor]
      })
    }
  }
  //return [trStart, trEnd, tr, trStep, trFloor, samples, sStep, i, sFloor]
  return {records: records, min: min, max: max}
}
)});
  main.variable(observer("amplitudePlot")).define("amplitudePlot", ["traceRecords","width","vegalite"], function(traceRecords,width,vegalite)
{
  const data = traceRecords();
  const plotHeight = 600;
  const plotWidth = width-200;
  const firstTrace = data.records[0].trNo;
  const samples = data.records.filter(r=>r.trNo==firstTrace).length;
  const markHeight = plotHeight/samples;
  const firstTime = data.records[0].time;
  const traces = data.records.filter(r=>r.time==firstTime).length;
  const markWidth = (plotWidth+100)/traces;
  const clipFactor = 0.8;
  const rangeClip = (1 - clipFactor) * (data.max - data.min)/2;
  const min = data.min + rangeClip;
  const max = data.max - rangeClip;
  
  return vegalite(
  { 
    $schema: 'https://vega.github.io/schema/vega-lite/v3.json',
    data: {
      values: data.records,
      name: 'plotsource'
    },
    width: plotWidth,
    height: plotHeight,
    title: `subsampled records: ${traces} traces, ${samples} samples per trace`,
    selection: {"grid": {"type": "interval", "bind": "scales"}},
    mark: {
      type:'rect',
      size:1,
      width:markWidth,
      height:markHeight,
      _clip:true
    },
    encoding: {
      x: {
        title:`trace No`,
        field: 'trNo',
        type: 'quantitative',
        axis: {format:'.1~f'}
      },
      y: {
        title:`time in s`,
        field: 'time',
        type: 'quantitative',
        "sort": "descending",
        axis: {
          format:'.2~f',
        }
      },
      color: {
        title:'amplitude',
        field: 'value',
        type: 'quantitative',
        scale: {
          domain: [min, max],
          scheme: "greys"
        }}
    },
    
  },
  {
    renderer:'svg',
    padding: {left: 5, top: 5, right: 0, bottom: 5},
    _defaultStyle: 'overflow: auto'
  }             
)
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`## SEG-Y trace header table`
)});
  main.variable(observer()).define(["md","segyTraceHeaders"], function(md,segyTraceHeaders){return(
md`
| offset | size |  shortName | description |
| -----  |----- |  --------- | ----------- |
${
segyTraceHeaders.map ( f =>
                      "| <small>"+f.offset+
                      "</small> | <small>"+f.size+
                      "</small> | <small>"+f.shortID+
                      "</small> | <small>"+f.txt+
                      "  </small> |"
                      ).join("\n")
}
`
)});
  main.variable(observer()).define(["md","segyBinaryHeaders"], function(md,segyBinaryHeaders){return(
md`
## SEG-Y Binary Header table
| offset | description |
| -----  | ----------- |
${
segyBinaryHeaders.map ( f =>
                      "| <small>"+f.offset+
                      "</small> | <small>"+f.txt+
                      "  </small> |"
                      ).join("\n")
}
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Supporting Cells`
)});
  main.variable(observer("segybuffer")).define("segybuffer", ["currentFile"], function*(currentFile)
{
  yield currentFile.arrayBuffer();
  // yield defaultFile.arrayBuffer();
  // for await (const file of Generators.input(segyfile)) {
  //   yield file.arrayBuffer();
  // }
}
);
  main.variable(observer("currentFile")).define("currentFile", ["defaultFile","Generators","segyfile"], async function*(defaultFile,Generators,segyfile)
{
  yield defaultFile;
  for await (const file of Generators.input(segyfile)) {
    yield file;
  }
}
);
  main.variable(observer("defaultFile")).define("defaultFile", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("stk00819t.first5.sgy")
)});
  main.variable(observer("vegaStyle")).define("vegaStyle", ["html"], function(html){return(
html`<style> .vega-embed-wrapper {overflow: auto} </style>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### for trace header`
)});
  main.variable(observer("firstlastTraceHeader")).define("firstlastTraceHeader", ["traceHeader","totalTraceNo"], function(traceHeader,totalTraceNo)
{
  return [traceHeader(1),traceHeader(totalTraceNo)]
}
);
  main.variable(observer("traceHeaderMDTable")).define("traceHeaderMDTable", ["traceHeader","traceNo","firstlastTraceHeader"], function(traceHeader,traceNo,firstlastTraceHeader){return(
traceHeader(traceNo).map 
( (f, i) =>
  "| <small>"+f.field.offset+
  "</small> | <small> "+f.field.shortID+
  "</small> | <small>"+firstlastTraceHeader[0][i].value+
  "</small> | <small> ** "+f.value+
  " ** <small> | <small>"+firstlastTraceHeader[1][i].value+
  "</small>|" )
)});
  main.variable(observer("traceOffsetValuesInt1632")).define("traceOffsetValuesInt1632", ["getTraceOffsetValuesInt1632","traceOffset","totalTraceNo","traceNo"], function(getTraceOffsetValuesInt1632,traceOffset,totalTraceNo,traceNo)
{
  return {
    first: getTraceOffsetValuesInt1632(1, traceOffset),
    last: getTraceOffsetValuesInt1632(totalTraceNo, traceOffset),
    value: getTraceOffsetValuesInt1632(traceNo, traceOffset)
  }
}
);
  main.variable(observer("getTraceOffsetValuesInt1632")).define("getTraceOffsetValuesInt1632", ["segybuffer","binaryHeader","formatMap"], function(segybuffer,binaryHeader,formatMap)
{
  return function (trace, offset) {
    const view = new DataView(segybuffer, 3600 + (trace - 1) * (240 + binaryHeader.hns * formatMap[binaryHeader.format].size), 240);
    return {int16: view.getInt16(offset-1), int32: view.getInt32(offset-1)}
  }
}
);
  main.variable(observer("traceHeader")).define("traceHeader", ["segybuffer","binaryHeader","formatMap","segyTraceHeaders"], function(segybuffer,binaryHeader,formatMap,segyTraceHeaders)
{
  return function (trace) {
    const view = new DataView(segybuffer, 3600 + (trace - 1) * (240 + binaryHeader.hns * formatMap[binaryHeader.format].size), 240);
    let header = segyTraceHeaders.map(
      function extractHeaders (field) {
        const offset = field.offset-1;
        if (field.size == 2) {
          return view.getInt16(offset)
        }
        if (field.size == 4) {
          return view.getInt32(offset)
        }
        if (field.size == 6) {
          if (offset == 218) {
            const vertical = view.getInt16(offset)/10;
            const crossline = view.getInt16(offset+2)/10;
            const inline = view.getInt16(offset+4)/10;
            return [vertical,crossline,inline]
          }  
          const mantissa = view.getInt32(offset);
          const exponent = view.getInt8(offset+4);
          return mantissa * Math.pow(10,exponent);
        }
        if (field.size == 8) {
          return view.getBigInt64(offset).toString(16);
        }
    });
    return header.map((v, i) => { return {field: segyTraceHeaders[i], value: v }} )
  }
}
);
  main.variable(observer("segyTraceHeaders")).define("segyTraceHeaders", ["specTraceHeader"], function(specTraceHeader)
{
  function addField(specLine) {
    const fields = specLine.split('\t').filter(item => item !== " ");
    return {
      shortID:fields[0],
      size:fields[1],
      offset:/\d*/.exec(fields[2])[0],
      range:fields[2],
      txt:fields[3]
    };
  }
  const specLines = specTraceHeader.split('\n');
  return specLines.map(addField);
  }
);
  main.variable(observer("allPlotHeaders")).define("allPlotHeaders", ["segyTraceHeaders","traceOffsetX","traceOffsetY","totalTraceNo","getTraceOffsetValuesInt1632"], function(segyTraceHeaders,traceOffsetX,traceOffsetY,totalTraceNo,getTraceOffsetValuesInt1632)
{
  let records = [];
  
  let headerX = segyTraceHeaders.filter(h => h.offset == traceOffsetX)[0];
  let headerY = segyTraceHeaders.filter(h => h.offset == traceOffsetY)[0];
  let sizeX = headerX ? headerX.size : 2; 
  let sizeY = headerY ? headerY.size : 2;
  let x,y;
  let sizeKeyX = 1.0 * sizeX > 2 ? "int32" : "int16";
  let sizeKeyY = 1.0 * sizeY > 2 ? "int32" : "int16";
  
  let stats = { 
    minx: 1e99, 
    maxx: -1e99,
    miny: 1e99, 
    maxy: -1e99
  };
  
  for ( let trace = 1; trace <= totalTraceNo; trace++ ) {
    x = getTraceOffsetValuesInt1632 ( trace, traceOffsetX )[sizeKeyX];
    y = getTraceOffsetValuesInt1632 ( trace, traceOffsetY )[sizeKeyY];
    records.push({x:x, y:y});
    if (x < stats.minx) {stats.minx = x;}
    if (x > stats.maxx) {stats.maxx = x;}
    if (y < stats.miny) {stats.miny = y;}
    if (y > stats.maxy) {stats.maxy = y;}
  }
  
  return { values: records, stats: stats}
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`### for trace samples`
)});
  main.variable(observer("traceSamples")).define("traceSamples", ["segybuffer","binaryHeader","formatMap","getTraceOffsetValuesInt1632","ibm2js"], function(segybuffer,binaryHeader,formatMap,getTraceOffsetValuesInt1632,ibm2js)
{
  return function(trace) {
    const view = new DataView( segybuffer, 3600 + (trace - 1) * (240 + binaryHeader.hns * formatMap[binaryHeader.format].size) + 240, binaryHeader.hns * formatMap[binaryHeader.format].size);
    let ns = getTraceOffsetValuesInt1632(trace, 115).int16;
    let samples = [],
        sample,
        i4;
    for (let i=0; i<ns; i++) {
      i4 = i*4;
      sample = view.getFloat32(i4);
      if (binaryHeader.format == 1) {
        sample = ibm2js( [
          view.getUint8(i4+0),
          view.getUint8(i4+1),
          view.getUint8(i4+2),
          view.getUint8(i4+3)
          ]);
      }
      samples.push(sample);
    }
    return {
      values: samples,
      min: Math.min(...samples),
      max: Math.max(...samples)
    }
  }
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`### for binary header`
)});
  main.variable(observer("binaryHeader")).define("binaryHeader", ["segybuffer"], function(segybuffer)
{
  const view = new DataView( segybuffer, 3200, 400);
  let trHeader = {
    hdt: view.getInt16(16),
    hns: view.getInt16(20),
    format: view.getInt16(24),
    jobid: view.getInt32(0),
    lino: view.getInt32(3),
    reno: view.getInt32(4),
    rmaj: view.getInt8(300),
    rmin: view.getInt8(301),
    flgf: view.getInt16(302)
  };
  return trHeader
}
);
  main.variable(observer("segyBinaryHeaders")).define("segyBinaryHeaders", ["specBinaryHeader"], function(specBinaryHeader)
{
  return specBinaryHeader.replace(/\n(\d\d\d\d–)/g,'|$1')
    .split('|')
    .slice(1)
    .map(field => { return {
      offset: field.match(/^\d\d\d\d/)[0]-3200,
      txt: field.match(/^\d\d\d\d–( |(\d\d\d\d ))([^]*)/)[3].replace(/\n/g,' ')
    } })            
}
);
  main.variable(observer("customOffsetValue")).define("customOffsetValue", ["segybuffer","customOffset"], function(segybuffer,customOffset)
{
  const view = new DataView( segybuffer, 3200, 400);
  const offset = customOffset - 1;
  return {int16:view.getInt16(offset), int32:view.getInt32(offset)};
}
);
  main.variable(observer("formatMap")).define("formatMap", function()
{
  return {
    1: {size:4, txt:"4-byte IBM floating-point"},
    2: {size:4, txt:"4-byte, two's complement integer"},
    3: {size:2, txt:"2-byte, two's complement integer"},
    4: {size:4, txt:"4-byte fixed-point with gain (obsolete)"},
    5: {size:4, txt:"4-byte IEEE floating-point"},
    6: {size:8, txt:"8-byte IEEE floating-point"},
    7: {size:3, txt:"3-byte two’s complement integer"},
    8: {size:1, txt:"1-byte, two's complement integer"},
    9: {size:8, txt:"8-byte, two's complement integer"},
    10: {size:4, txt:"4-byte, unsigned integer"},
    11: {size:2, txt:"2-byte, unsigned integer"},
    12: {size:8, txt:"8-byte, unsigned integer"},
    15: {size:3, txt:"3-byte, unsigned integer"},
    16: {size:1, txt:"1-byte, unsigned integer"}
  }
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`### libraries`
)});
  const child1 = runtime.module(define1);
  main.import("number", child1);
  main.variable(observer("ebcdicHeader")).define("ebcdicHeader", ["segybuffer","EBCDIC","EBCDIC2ASCII"], function(segybuffer,EBCDIC,EBCDIC2ASCII)
{
  
  const bytes = new Uint8Array(segybuffer,0,3200);
  const chars = Array.from(bytes).map(b => b > 15 ? b.toString(16):'0'+b.toString(16));
  const hexString = chars.join('');
  return EBCDIC().decode(hexString);
  return EBCDIC2ASCII(hexString);
}
);
  main.variable(observer("ebcdicHeader_fmt")).define("ebcdicHeader_fmt", ["ebcdicHeader"], function(ebcdicHeader)
{
  const lineLength = 80;
  const headerArray = ebcdicHeader.split("");
  const header = headerArray.map((c, i, a) => (i+1) % lineLength ? c : c+"\n");
  return header.join("");
}
);
  main.variable(observer("EBCDIC")).define("EBCDIC", ["require"], function(require){return(
require('https://wzrd.in/standalone/ut-codec-ebcdic@latest')
)});
  main.variable(observer()).define(["EBCDIC"], function(EBCDIC){return(
EBCDIC().decode('405a7F7B5B6C507D4D5D55')
)});
  main.variable(observer("NM_EBCDIC")).define("NM_EBCDIC", ["require"], function(require){return(
require("https://wzrd.in/standalone/nm-ebcdic-converter@latest")
)});
  main.variable(observer()).define(["NM_EBCDIC"], function(NM_EBCDIC){return(
NM_EBCDIC.toASCII('C6')
)});
  main.variable(observer("EBCDIC2ASCII")).define("EBCDIC2ASCII", ["NM_EBCDIC"], function(NM_EBCDIC)
{
  return function (ebcdic) {
    const ebcdicOneChar = ebcdic.split("");
    let twoChars = new Array (ebcdic.length >> 1 );
    twoChars = twoChars.fill(0).map((c,i) => ebcdicOneChar[i*2]+ebcdicOneChar[i*2+1]);
    return twoChars.map(c => NM_EBCDIC.toASCII(c.toUpperCase())).join("");
  }
}
);
  main.variable(observer()).define(["md","EBCDIC2ASCII"], function(md,EBCDIC2ASCII){return(
md`${EBCDIC2ASCII("05d6c6")}`
)});
  main.variable(observer("specTraceHeader")).define("specTraceHeader", function(){return(
`tracl 	4 	1-4 	Trace sequence number within line – numbers continue to increase if additional reels are required on same line.
tracr 	4 	5-8 	Trace sequence number within reel – each reel starts at trace number one.	
fldr 	4 	9-12 	Original field record number.	
tracf	4 	13-16 	Trace number within the original field record.	
ep 	4 	17-20 	Energy source point number – used when more than one record occurs at the same effective surface location.	
cdp 	4 	21-24 	“Ensemble number: CDP, CMP, CRP, etc.” 	
cdpt 	4 	25-28 	Trace number within the CDP ensemble – each ensemble starts with trace number one.	
trid 	2 	29-30 	“Trace identification code. -1=other, 0=unknown, 1=seismic, 2=dead, 3=dummy, 4=time-break, 5=uphole, 6=sweep, 7=timing, 8=water-break, etc.”	
nvs 	2 	31-32 	“Number of vertically summed traces yielding this trace. (1 is one trace, 2 is two summed traces, etc.)“	
nhs 	2 	33-34 	“Number of horizontally stacked traces yielding this trace.  (1 is one trace, 2 is two stacked traces, etc.)“
duse 	2 	35-36 	“Data use: 1=production, 2=test.” 	
offset 	4 	37-40 	Distance from source point center to receiver group center (negative if opposite to direction in which line is shot).	
gelev 	4 	41-44 	“Receiver group elevation; elevations above sea level are positive, below sea level are negative.”	
selev 	4 	45-48 	Surface elevation at source.	
sdepth 	4 	49-52 	Source depth below surface (a positive number).	
gdel 	4 	53-56 	Datum elevation at receiver group. 	
sdel 	4 	57-60 	Datum elevation at source. 	
swdep 	4 	61-64 	Water depth at source. 	
gwdep 	4 	65-68 	Water depth at group. 	
scalel 	2 	69-70 	“Scalar to be applied to all elevations and depths in bytes 41-68 to give real value. Scaler = 1, +/- 10, … +/- 10,000. Positive=multiplier; negative=divisor.”	
scalco 	2 	71-72 	“Scalar to be applied to all coordinates in bytes 73-88 to give real value. Scaler = 1, +/- 10, … +/- 10,000. Positive=multiplier; negative=divisor.” 	
sx 	4 	73-76 	Source coordinate - X.	
sy 	4 	77-80 	Source coordinate - Y. 	
gx 	4 	81-84 	Group coordinate - X.	
gy 	4 	85-88 	Group coordinate - Y.	
counit 	2 	89-90 	“Coordinate units: 1=length (m or ft), 2=seconds of arc, 3=decimal degrees, 4=degrees, minutes, seconds (DMS).” 	
wevel 	2 	91-92 	Weathering velocity (ft/s or m/s).	
swevel 	2 	93-94 	Subweathering velocity (ft/s or m/s).	
sut 	2 	95-96 	Uphole time at source (ms).	
gut 	2 	97-98 	Uphole time at group (ms).	
sstat 	2 	99-100 	Source static correction (ms).	
gstat 	2 	101-102 	Group static correction (ms).	
tstat 	2 	103-104 	Total static applied (ms). (Zero if no static has been applied.)	
laga 	2 	105-106 	“Lag time A (ms). Time between end of 240-byte trace ID header and time break.Positive if time break occurs after end of header, negative if time break occurs before end of header.”	
lagb 	2 	107-108 	Lag Time B (ms). Time between time break and the initiation time of the energy source. May be positive or negative.	
delrt 	2 	109-110 	Delay recording time (ms). Time between initiation time of energy source and time when recording of data samples begins. (For deep water work if data recording does not start at zero time.)	
muts 	2 	111-112 	Mute time – start (ms).	
mute 	2 	113-114 	Mute time – end (ms).	
ns 	2 	115-116 	Number of samples in this trace.
dt 	2 	117-118 	Sample interval in µsec for this trace.	
gain 	2 	119-120 	“Gain type of field instruments: 1=fixed, 2=binary, 3=floating point, 4-N = optional use.”	
igc 	2 	121-122 	Instrument gain constant (dB).	
igi 	2 	123-124 	Instrument early or initial gain (dB).	
corr 	2 	125-126 	“Correlated: 1=no, 2=yes.”	
sfs 	2 	127-128 	Sweep frequency at start (Hz).	
sfe 	2 	129-130 	Sweep frequency at end (Hz).	
slen 	2 	131-132 	Sweep length (ms).	
styp 	2 	133-134 	“Sweep type: 1=linear, 2=parabolic, 3=exponential, 4=other.”	
stas 	2 	135-136 	Sweep trace taper length at start (ms).	
stae 	2 	137-138 	Sweep trace taper length at end (ms).	
tatyp 	2 	139-140 	“Taper type: 1=linear, 2=cosine squared, 3=other.”	
afilf 	2 	141-142 	“Alias filter frequency (Hz), if used.”	
afils 	2 	143-144 	Alias filter slope (dB/octave).	
nofilf 	2 	145-146 	“Notch filter frequency (Hz), if used.”	
nofils 	2 	147-148 	Notch filter slope (dB/octave).	
lcf 	2 	149-150 	“Low cut frequency (Hz), if used.”	
hcf 	2 	151-152 	“High cut frequency (Hz), if used.”	
lcs 	2 	153-154 	Low cut slope (dB/octave).	
hcs 	2 	155-156 	High cut slope (dB/octave).	
year 	2 	157-158 	Year data recorded.	
day 	2 	159-160 	Day of year (Julian day for GMT and UTC time basis).	
hour 	2 	161-162 	Hour of day (24 hour clock).	
minute 	2 	163-164 	Minute of hour.	
sec 	2 	165-166 	Second of minute.	
timbas 	2 	167-168 	“Time basis code: I=local, 2=GMT, 3=other, 4=UTC (Coordinated Universal Time).”	
trwf 	2 	169-170 	“Trace weighting factor – defined as 2 raised to the power (-N) volts for the least significant bit. (N = 0, 1, …. 32, 767.)“	
grnors 	2 	171-172 	Geophone group number of roll switch position one.	
grnofr 	2 	173-174 	Geophone group number of trace number one within original field record.	
grnlof 	2 	175-176 	Geophone group number of last trace within original field record.	
gaps 	2 	177-178 	Gap size (total number of groups dropped).	
ofrav 	2 	179-180 	“Overtravel associated with taper at beginning or end of line: I=down (or behind), 2=up (or ahead).”
- 	4 	181-184 	X-coordinate of ensemble (CDP) position of this trace (scalar in Trace Header bytes 71-72 applies).	
- 	4 	185-188 	Y-coordinate of ensemble (CDP) position of this trace (scalar in Trace Header bytes 71-72 applies).	
- 	4 	189-192 	“For 3-D poststack data, in-line number. If one in-line per SEG-Y file is being recorded, this value should be the same for all traces.”	
- 	4 	193-196 	“For 3-D poststack data, cross-line number. This will typically be the same value as the ensemble (CDP) number in Trace Header bytes 21-24, but this does not have to be the case.”	
- 	4 	197-200 	Shotpoint number. This is probably only applicable to 2-D poststack data. Note that it is assumed that the shotpoint number refers to the source location nearest to the ensemble (CDP) location for a particular trace.	
- 	2 	201-202 	Scalar to be applied to SP number in bytes 197-200 to give the real value. Positive=multiplier; negative=divisor; zero=no scaling.	
- 	2 	203-204 	“Trace value measurement unit: -1=other, 0=unknown, 1=Pascal (Pa), 2=Volts (V), 3=milliVolts (mV), 4=Amperes (A), 5=Meters (m), 6=meters/second, 7=meters/(sec power 2), 8=Newton (N), 9=Watt (W).”	
- 	6 	205-210 	Transcuction constant – multiplicative constant used to convert the Data Trace samples to the Transduction Units (bytes 211-212).	
- 	2 	211-212 	“Transduction units: -1=other, 0=unknown, 1=Pascal (Pa), 2=Volts (V), 3=milliVolts (mV), 4=Amperes (A), 5=Meters (m), 6=meters/second, 7=meters/(sec power 2), 8=Newton (N), 9=Watt (W).”	
- 	2 	213-214 	Device/Trace identifier – unit number or id number of the device associated with the Data Trace. This allows traces to be associated across trace ensembles independent of the trace number (bytes 25-28).	
- 	2 	215-216 	“Scalar to be applied to times specified in bytes 95-114 to give true time value in ms. Scalar = 1, +/- 10, … +/- 10,000. Positive=multiplier, negative=divisor, zero=no scaling.”	
- 	2 	217-218 	“Source Type/Orientation: -1 to -n=other, 0=unknown, 1=vibrator vertical, 2=vibrator xline, 3=vibrator inline, 4=impulse vertical, 5=impulse xline, 6=impulse inline, 7=distributed impulse vertical, 8=distributed impulse xline, 9=distributed impulse inline.”	
- 	6 	219-224 	Source energy direction with respect to the source orientation. The positive orientation direction is in bytes 217-218. Energy direction is encoded in tenths of degrees (347.8 deg is encoded as 3478).	
- 	6 	225-230 	Source measurement.	
- 	2 	231-232 	“Source measurement unit: -1=other, 0=unknown, 1=Joule (J), 2=kilowatt (kW), 3=Pascal (Pa), 4=Bar (Bar), 4=Bar-meter (Bar-m), 5=Newton (N), 6=kilogram (kg).”	
- 	8 	233-240 	Unassigned – for optional information.`
)});
  main.variable(observer("specBinaryHeader")).define("specBinaryHeader", function(){return(
`
3201–3204 Job identification number.
3205–3208 Line number. For 3-D poststack data, this will typically contain the in-line
number.
3209–3212 Reel number.
3213–3214 Number of data traces per ensemble. Mandatory for prestack data.
3215–3216 Number of auxiliary traces per ensemble. Mandatory for prestack data.
3217–3218 Sample interval. Microseconds (µs) for time data, Hertz (Hz) for frequency
data, meters (m) or feet (ft) for depth data.
3219–3220 Sample interval of original field recording. Microseconds (µs) for time data,
Hertz (Hz) for frequency data, meters (m) or feet (ft) for depth data.
3221–3222 Number of samples per data trace.
Note: The sample interval and number of samples in the Binary File Header
should be for the primary set of seismic data traces in the file.
3223–3224 Number of samples per data trace for original field recording.
3225–3226 Data sample format code. Mandatory for all data. These formats are described
in Appendix E.
1 = 4-byte IBM floating-point
2 = 4-byte, two's complement integer
3 = 2-byte, two's complement integer
4 = 4-byte fixed-point with gain (obsolete)
5 = 4-byte IEEE floating-point
6 = 8-byte IEEE floating-point
7 = 3-byte two’s complement integer
8 = 1-byte, two's complement integer
9 = 8-byte, two's complement integer
10 = 4-byte, unsigned integer
11 = 2-byte, unsigned integer
12 = 8-byte, unsigned integer
15 = 3-byte, unsigned integer
16 = 1-byte, unsigned integer
3227–3228 Ensemble fold — The expected number of data traces per trace ensemble
(e.g. the CMP fold).
3229–3230 Trace sorting code (i.e. type of ensemble) :
–1 = Other (should be explained in a user Extended Textual File Header
stanza)
 0 = Unknown
 1 = As recorded (no sorting)
 2 = CDP ensemble
 3 = Single fold continuous profile
 4 = Horizontally stacked
 5 = Common source point
 6 = Common receiver point
 7 = Common offset point
 8 = Common mid-point
 9 = Common conversion point
3231–3232 Vertical sum code:
1 = no sum,
2 = two sum,
…,
N = M–1 sum (M = 2 to 32,767)
3233–3234 Sweep frequency at start (Hz).
3235–3236 Sweep frequency at end (Hz).
3237–3238 Sweep length (ms).
3239–3240 Sweep type code:
1 = linear
2 = parabolic
3 = exponential
4 = other
3241–3242 Trace number of sweep channel.
3243–3244 Sweep trace taper length in milliseconds at start if tapered (the taper starts at
zero time and is effective for this length).
3245–3246 Sweep trace taper length in milliseconds at end (the ending taper starts at
sweep length minus the taper length at end).
3247–3248 Taper type:
1 = linear
2 = cosine squared
3 = other
3249–3250 Correlated data traces:
1 = no
2 = yes
3251–3252 Binary gain recovered:
1 = yes
2 = no
3253–3254 Amplitude recovery method:
1 = none
2 = spherical divergence
3 = AGC
4 = other
3255–3256 Measurement system: If Location Data stanzas are included in the file, this
entry would normally agree with the Location Data stanza. If there is a
disagreement, the last Location Data stanza is the controlling authority. If units
are mixed, e.g. meters on surface, feet in depth, then a Location Data stanza is
mandatory.
1 = Meters
2 = Feet
3257–3258 Impulse signal polarity
1 = Increase in pressure or upward geophone case movement gives negative
number on trace.
2 = Increase in pressure or upward geophone case movement gives positive
number on trace.
3259–3260 Vibratory polarity code:
Seismic signal lags pilot signal by:
1 = 337.5° to 22.5°
2 = 22.5° to 67.5°
3 = 67.5° to 112.5°
4 = 112.5° to 157.5°
5 = 157.5° to 202.5°
6 = 202.5° to 247.5°
7 = 247.5° to 292.5°
8 = 292.5° to 337.5°
3261–3264 Extended number of data traces per ensemble. If nonzero, this overrides the
number of data traces per ensemble in bytes 3213–3214.
3265–3268 Extended number of auxiliary traces per ensemble. If nonzero, this overrides
the number of auxiliary traces per ensemble in bytes 3215–3216.
3269–3272 Extended number of samples per data trace. If nonzero, this overrides the
number of samples per data trace in bytes 3221–3222.
3273–3280 Extended sample interval, IEEE double precision (64-bit). If nonzero, this
overrides the sample interval in bytes 3217–3218 with the same units.
3281–3288 Extended sample interval of original field recording, IEEE double precision (64-
bit) . If nonzero, this overrides the sample interval of original field recording in
bytes 3219–3220 with the same units.
3289–3292 Extended number of samples per data trace in original recording. If nonzero,
this overrides the number of samples per data trace in original recording in
bytes 3223–3224.
3293–3296 Extended ensemble fold. If nonzero, this overrides ensemble fold in bytes 3227–3228.
3297–3300 The integer constant 1690906010 (0102030416). This is used to allow
unambiguous detection of the byte ordering to expect for this SEG-Y file. For
example, if this field reads as 6730598510 (0403020116) then the bytes in every
Binary File Header, Trace Header and Trace Data field must be reversed as
they are read, i.e. converting the endian-ness of the fields. If it reads
3362099510 (0201040316) then consecutive pairs of bytes need to be swapped
in every Binary File Header, Trace Header and Trace Data field.
The byte ordering of all other portions (the Extended Textual Header and Data
Trailer) of the SEG-Y file is not affected by this field.
3301–3500 Unassigned
3501–     Major SEG-Y Format Revision Number. This is an 8-bit unsigned value. Thus
for SEG-Y Revision 2.0, as defined in this document, this will be recorded as
0216. This field is mandatory for all versions of SEG-Y, although a value of
zero indicates “traditional” SEG-Y conforming to the 1975 standard.
3502–     Minor SEG-Y Format Revision Number. This is an 8-bit unsigned value with a
radix point between the first and second bytes. Thus for SEG-Y Revision 2.0,
as defined in this document, this will be recorded as 0016. This field is
mandatory for all versions of SEG-Y.
3503–3504 Fixed length trace flag. A value of one indicates that all traces in this SEG-Y
file are guaranteed to have the same sample interval, number of trace header
blocks and trace samples, as specified in Binary File Header bytes 3217–3218
or 3281–3288, 3517–3518, and 3221–3222 or 3289–3292. A value of zero
indicates that the length of the traces in the file may vary and the number of
samples in bytes 115–116 of the Standard SEG-Y Trace Header and, if
present, bytes 137–140 of SEG-Y Trace Header Extension 1 must be
examined to determine the actual length of each trace. This field is mandatory
for all versions of SEG-Y, although a value of zero indicates “traditional” SEGY conforming to the 1975 standard. Irrespective of this flag, it is strongly
recommended that corect values for the number of samples per trace and
sample interval appear in the appropriate trace Trace Header locations.
3505–3506 Number of 3200-byte, Extended Textual File Header records following the
Binary Header. If bytes 3521–3528 are nonzero, that field overrides this one. A
value of zero indicates there are no Extended Textual File Header records (i.e.
this file has no Extended Textual File Header(s)). A value of -1 indicates that
there are a variable number of Extended Textual File Header records and the
end of the Extended Textual File Header is denoted by an ((SEG: EndText))
stanza in the final record (Section 6.2). A positive value indicates that there
are exactly that many Extended Textual File Header records.
Note that, although the exact number of Extended Textual File Header records
may be a useful piece of information, it will not always be known at the time the
Binary Header is written and it is not mandatory that a positive value be
recorded here or in bytes 3521–3528. It is however recommended to record
the number of records if possible as this makes reading more effective and
supports direct access to traces on disk files. In the event that this number
exceeds 32767, set this field to –1 and bytes 3521–3528 to
3600+3200*(number of Extended Textual File Header records). Add a further
128 if a SEG-Y Tape Label is present.
3507–3510 Maximum number of additional 240 byte trace headers. A value of zero
indicates there are no additional 240 byte trace headers. The actual number
for a given trace may be supplied in bytes 157–158 of SEG-Y Trace Header
Extension 1.
3511–3512 Time basis code:
1 = Local
2 = GMT (Greenwich Mean Time)
3 = Other, should be explained in a user defined stanza in the Extended
 Textual File Header
4 = UTC (Coordinated Universal Time)
5 = GPS (Global Positioning System Time)
3513–3520 Number of traces in this file or stream. (64-bit unsigned integer value) If zero,
all bytes in the file or stream are part of this SEG-Y dataset.
3521–3528 Byte offset of first trace relative to start of file or stream if known, otherwise
zero. (64-bit unsigned integer value) This byte count will include the initial
3600 bytes of the Textual and this Binary File Header plus the Extended
Textual Header if present. When nonzero, this field overrides the byte offset
implied by any nonnegative number of Extended Textual Header records
present in bytes 3505–3506.
3529–3532 Number of 3200-byte data trailer stanza records following the last trace (4 byte
signed integer). A value of 0 indicates there are no trailer records. A value of -1
indicates an undefined number of trailer records (0 or more) following the data.
It is, however, recommended to record the number of trailer records if possible
as this makes reading more efficient.
3533–3600 Unassigned
`
)});
  main.variable(observer("ibm2js")).define("ibm2js", function()
{
  return function (buffer) {
    var sign = buffer[0] >> 7
    var exponent = buffer[0] & 0x7f
    var fraction = 0
    function bit(buffer, bit) {
        return buffer[Math.floor(bit / 8)] >> (7 - (bit % 8)) & 1
    }
    for (var i = 0; i < 24; i++) {
        fraction += bit(buffer, 8 + i) / (2 << i)
    }
    return (1 - 2 * sign) * Math.pow(16.0, exponent - 64) * fraction
  }
}
);
  main.variable(observer("vegaEmbed")).define("vegaEmbed", ["require"], function(require){return(
require('vega-embed@6')
)});
  main.variable(observer("vegalite")).define("vegalite", ["require"], function(require){return(
require("@observablehq/vega-lite@0.2")
)});
  return main;
}
