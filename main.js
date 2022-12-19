/*   This file is part of Full Statistical Mode Reconstruction Project
 *
 *   Copyright (C) 2021 Ivan Burenkov - All Rights Reserved
 *   You may use, distribute and modify this code under the
 *   terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function init() {
  //Pth = Module.cwrap("Pt", "number", ["number", "number", "number", "number"]);
  calcg2 = Module.cwrap("g2calc", "number", [
    "number",
    "number",
    "number",
    "number",
    "number"
  ]);
}
window.onload = init();
function cArray(size) {
  var offset = Module._malloc(size * 8);
  Module.HEAPF64.set(new Float64Array(size), offset / 8);
  return {
    data: Module.HEAPF64.subarray(offset / 8, offset / 8 + size),
    offset: offset,
    size: size
  };
}
function cFree(cArrayVar) {
  Module._free(cArrayVar.offset);
}
function cArrayInt(size) {
  const nBytes = Int32Array.BYTES_PER_ELEMENT;
  const offset = Module._malloc(size * nBytes);
  return {
    data: Module.HEAP32.subarray(offset / nBytes, offset / nBytes + size),
    offset: offset,
    size: size
  };
}
/* 
//This function executes code when WASM has finished loading
Module["onRuntimeInitialized"] = function () {
  //console.log("wasm loaded");
  //runCcode();
};
 */
//Global vars
var tsvG2Values = "";
var t0; // = performance.now()
var t1; // = performance.now()
var dataLength;
var tmult;
var tres;
var norm=1.0;
var islog=0;
var isnorm=0;
var myArray;
var c;
var firstRun=1;

document.getElementById('inputfile') 
			.addEventListener('change', function() {
        //var name = document.getElementById('inputfile').files.item(0).name;  
        //alert('Selected file: ' + name.files.item(0).name);
			var nn;
			var fr=new FileReader; 
			fr.onload=function(){ 
				//document.getElementById('output').textContent=fr.result;
				var b = fr.result.split('\n')
				var a=[];
				height=b.length-1;
				width=1;
				for(const i in b){
					a.push(b[i].split('\t').map(Number));
					if(a[i].length>width){
						width=a[i].length;
            nn=width*length;
					}
				}
        dataLength=nn;
				a.pop();
				var x = Math.floor(400/width);
				var y = Math.floor(400/height);
				c = a.flat();
				myArray = cArray(width*height);
				if(!c.some(isNaN)){
				  for(const i in c){
				    myArray.data[i]=c[i];
				    dataready=true;
				  }
					/* for(const i in a){
						for(const j in a[i]){
						ctx.fillStyle = 'rgb('+a[i][j]*10+','+a[i][j]*10+','+a[i][j]*10+')';
						ctx.fillRect(j*x,i*y,(j+1)*x,(i+1)*y);
						}
					}  */
          ////////////////////////////////////
          //document.getElementById('plotlyDivLabel').innerHTML="<h2>Loaded data</h2><span id='plotlyDiv'></span>";
          //produceOutput('plotlyDiv',nn,myArray);
		
          //myArrayg2 = cArrayInt(599);
          //calcg2(myArray.offset,width*height,1,myArrayg2.offset);
          //produceOutput('plotlyDiv',599,myArray);
          

          ////////////////////////////////////
				} else {
					alert("Uploaded file contains nonnumerical values");
				}
				//document.getElementById('res').innerHTML=makeTableHTML(a);
			} 
	fr.onprogress = function(data) {
		if (data.lengthComputable) {                                            
		  var valeur= Math.round((data.loaded * 100) / data.total);
		  $('.progress-bar').css('width', valeur+'%').attr('aria-valuenow', valeur);
		    //console.log(progress);
		}
	      }					
          document.getElementById('fileLoaded').innerHTML="Now, please, set desired parameters and hit 'Calculate!' button.";
			fr.readAsText(this.files[0]); 
	showonlyID('g2controls');
		}) 


function runCcodeG2() {
  document.getElementById('fileLoaded').innerHTML="Calculating ... <div class='spinner-border' role='status'>  <span class='visually-hidden'>Loading...</span></div>";
  setTimeout(function(){runCcodeG2true();},100);
}
function runCcodeG2true() {
  t0 = performance.now();

  myArrayg2 = cArrayInt(599);
  tmult = document.getElementById("sLoss").value;
  tres = document.getElementById("tRes").value;
  var binconversion = tmult/tres;
  //console.log(binconversion);
  console.log(HEAPF64[(myArray.offset)/8],HEAPF64[(myArray.offset)/8+width*height-1],HEAP32[(myArrayg2.offset)/4],HEAP32[(myArrayg2.offset)/4+598]);
  console.log(myArray,width*height,binconversion,myArrayg2,norm);
  norm=calcg2(myArray.offset,width*height,binconversion,myArrayg2.offset,norm);
  console.log(myArray,width*height,binconversion,myArrayg2,norm);
  console.log(HEAPF64[(myArray.offset)/8],HEAPF64[(myArray.offset)/8+width*height-1],HEAP32[(myArrayg2.offset)/4],HEAP32[(myArrayg2.offset)/4+598]);
  //document.getElementById('plotlyDiv').innerHTML="<h2>Reconstructed data</h2><span id='plotlyDivG2'></span>";
  produceOutput('plotlyDiv',599,myArrayg2,islog,isnorm);

  t1 = Math.floor(performance.now() - t0);
if(firstRun==1){
  hideonlyID('fitIntro');
  showonlyID('tsvdata');
  showonlyID('LogScale');		
  showonlyID('NormG2');
	firstRun=0;
}
  document.getElementById("timing").innerHTML = "Done in " + t1 + " ms";
}


function produceOutput(divName,sizeXY,dataCArray,islog,isnorm){
  let nn=sizeXY;
  var g2Values = [];
  var tValues = [];
  var g2ValuesErr = [];
  tsvG2Values = "";
  var tunit;
  var tunitmul;
  if(tres<10){
    tunit="ns";
    tunitmul=1;
  } else {
    if(tres<10000){
      tunit="us";
      tunitmul=1000;
    } else {
      if(tres<10000000){
        tunit="ms";
        tunitmul=1000000;
      }
    }
  }
  for (i = 0; i < nn; i++) {
    if(isnorm==1){
      tValues[i]=(i-299)*tres/tunitmul;
      g2Values[i] = dataCArray.data[i]/norm;
      g2ValuesErr[i]=Math.sqrt(g2Values[i]/norm);
    } else {
      tValues[i]=(i-299)*tres/tunitmul;
      g2Values[i] = dataCArray.data[i];
      g2ValuesErr[i]=Math.sqrt(g2Values[i]);
    }
    if (i == nn - 1) {
      tsvG2Values = tsvG2Values + tValues[i] + "\t" + g2Values[i];
    } else {
      tsvG2Values = tsvG2Values + tValues[i] + "\t" + g2Values[i] + "\n";
    }
  }

  document.getElementById("datatsv").value = tsvG2Values;
  
  var data = [
    {
      x: tValues,
      y: g2Values,
      error_y: {
        type: 'data',
        array: g2ValuesErr,
        visible: true
      },
      xaxis: "Delay",
      yaxis: "<var>G</var><sup>(2)<sup>(<var>t</var>)",
      type: 'scatter'
    }
  ];
  var plotlyButtons = {
    modeBarButtonsToRemove: ["toImage", "sendDataToCloud"],
    modeBarButtonsToAdd: [
      {
        name: "Save as SVG",
        icon: Plotly.Icons.camera,
        click: function (gd) {
          Plotly.downloadImage(gd, { format: "svg" });
        }
      }
    ]
  };
  if(islog==1){
    var plotlyLayout = {
      title: "Second order autocorrelation function",
      xaxis: {title: 't, '+tunit},
      yaxis: {title: "G<sup>(2)</sup>(t)",
      type: 'log',
          autorange: true
        }
    };
  } else {
    var plotlyLayout = {
      title: "Second order autocorrelation function",
      xaxis: {title: 't, '+tunit},
      yaxis: {title: "G<sup>(2)</sup>(t)"}
  };  
  }
  /* if(isnorm==1){
    var plotlyLayout = {
      title: "Second order autocorrelation function",
      xaxis: {title: 't, '+tunit},
      yaxis: {title: "g<sup>(2)</sup>(t)"}
    };
  } */
  Plotly.newPlot(divName, data, plotlyLayout, plotlyButtons);

  //#region old
  /* 
  var zValues = [];
  var xValues = [];
  var yValues = [];
  tsvJPDValues = "";
  tsvRPDValues = "";
  for (i = 0; i < width; i++) {
    zValues[i] = [];
    xValues[i] = i;
    yValues[i] = i;
    for (j = 0; j < height; j++) {
      zValues[i][j] = dataCArray.data[i * width + j];
      if (j == height - 1) {
        tsvJPDValues = tsvJPDValues + zValues[i][j];
      } else {
        tsvJPDValues = tsvJPDValues + zValues[i][j] + "\t";
      }
    }
    if (i != width - 1) {
      tsvJPDValues = tsvJPDValues + "\n";
    }
  }

  document.getElementById("datatsv").value = tsvJPDValues;
  


  var jpdData = {
    z: zValues,
    x: xValues,
    y: yValues,
    name: "Joint PND",
    colorscale: "Blackbody", //'Electric',
    type: "heatmap",
    colorbar: { len: 0.5 }
  };
  rpd = cArray(2 * nn);

  jpdrpd(dataCArray.offset, rpd.offset, nn);
  var iValues = [];
  var sValues = [];
  for (i = 0; i < width; i++) {
    iValues[i] = rpd.data[i];
    sValues[i] = rpd.data[i + width];
    if (j == width - 1) {
      tsvRPDValues = tsvRPDValues + i + "\t" + sValues[i] + "\t" + iValues[i];
    } else {
      tsvRPDValues =
        tsvRPDValues + i + "\t" + sValues[i] + "\t" + iValues[i] + "\n";
    }
  }
  var RPDiData = {
    y: xValues,
    x: iValues,
    orientation: "h",
    name: "Idler arm PND",
    marker: { color: "rgb(102,0,0)" },
    xaxis: "x2",
    type: "bar"
  };
  var RPDsData = {
    x: xValues,
    y: sValues,
    name: "Signal arm PND",
    marker: { color: "rgb(0,0,102)" },
    yaxis: "y2",
    type: "bar"
  };
  var bb = document.getElementById("sidebarMenu").getBoundingClientRect();
  let sidebarwidth = bb.right - bb.left;
  function getViewport() {
    return Math.floor(
      Math.min(window.innerHeight, window.innerWidth - sidebarwidth)
    );
  }
  let screenwidth = Math.floor(getViewport()/1.4);

  var plotlyLayout = {
    title: "Photon Number Distributions (PNDs)",
    showlegend: false,
    autosize: false,
    width: screenwidth, //-sidebarwidth-100,//Math.floor(screenwidth*0.6),
    height: screenwidth, //-sidebarwidth-150,//Math.floor(screenwidth*0.6)-50,
    margin: { t: 100 },
    hovermode: "closest",
    bargap: 0.1,
    xaxis: {
      domain: [0, 0.84],
      showgrid: false,
      showline: true,
      title: "Signal number of photons",
      zeroline: false
    },
    yaxis: {
      domain: [0, 0.84],
      showgrid: false,
      showline: true,
      title: "Idler number of photons",
      zeroline: false
    },
    xaxis2: {
      domain: [0.86, 1],
      showgrid: true //,
      //zeroline: false
    },
    yaxis2: {
      domain: [0.86, 1],
      showgrid: true //,
      //zeroline: false
    },
    font: {
      family: "Arial",
      size: Math.floor(screenwidth / 40), //((screenwidth-sidebarwidth-100)/50),
      color: "#000"
    }
  };

  var plotlyData = [jpdData, RPDsData, RPDiData];
  var plotlyButtons = {
    modeBarButtonsToRemove: ["toImage", "sendDataToCloud"],
    modeBarButtonsToAdd: [
      {
        name: "Save as SVG",
        icon: Plotly.Icons.camera,
        click: function (gd) {
          Plotly.downloadImage(gd, { format: "svg" });
        }
      }
    ]
  };
  
  Plotly.newPlot(divName, plotlyData, plotlyLayout, plotlyButtons);
 */
//#endregion
}
