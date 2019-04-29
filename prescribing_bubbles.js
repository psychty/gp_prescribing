// !preview r2d3 data = read.csv("./Javascripts/cod1.csv"), d3_version = 4

// Based on https://bl.ocks.org/mbostock/4063269

// Initialization

//var w = 600;
//var h = 600;
    
//var svg = d3.select("body")
  //.append("svg")
  //.attr("width", w)
  //.attr("height", h);

svg.attr("font-family", "verdana")
  .attr("font-size", ".8em")
  .attr("text-anchor", "middle");
    
var svgSize = 1000;
var pack = d3.pack()
  .size([svgSize, svgSize])
  .padding(2.5);
    
var format = d3.format(",d"); // create a function to convert a value to numeric with proper formating
var format_t = d3.format(",c"); // create a function to convert a value to character

var year = d3.max(data, function(d) { return d.year; });
var sum1 = d3.sum(data, function(d) { return d.value; });
var area = "West Sussex";

// Colours
var color = d3.scaleOrdinal()
	.domain(data)
	.range(["#8eb145","#a25dce","#52bb55","#c94eb1","#c4aa35","#616bdb","#e28637","#46aed7","#d54637","#50b696","#d44886","#4d7f3e","#cd415f","#8196de","#a9572d","#6563a9","#cca467","#9a4c7b","#826f2c","#d889c3","#cd726e"]);
//	.range(["#C2464F", "#62A7B9", "#9DCB9C"]);

var group = svg.append("g");

r2d3.onResize(function(width, height) {
  var minSize = Math.min(width, height);
  var scale = minSize / svgSize;
  
group.attr("transform", function(d) {
  return "" +
"translate(" + (width - minSize) /2 + "," + (height - minSize) / 2 + ")," +
"scale(" + scale + "," + scale + ")";
});

});


// Rendering
r2d3.onRender(function(data, svg, width, height, options) {
  var root = d3.hierarchy({children: data})
    .sum(function(d) { return d.value; })
    .each(function(d) {
      if (id = d.data.id) {
        var id, i = id.lastIndexOf("."); 
        d.id = id;
        d.package = id.slice(0, i);
        d.class = id.slice(i + 1);
      }
    });

var node = group.selectAll(".node")
    .data(pack(root).leaves())
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

node.append("circle")
      .attr("id", function(d) { return d.id; })
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return color(d.package); });

node.append("clipPath")
      .attr("id", function(d) { return "clip-" + d.id; })
    .append("use")
      .attr("xlink:href", function(d) { return "#" + d.id; });

node.append("title")
  .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
 .selectAll("tspan")
 .data(function(d) { return d.class.split(/(?=[" "][^" "])/g); }) // This puts a line break before every space
 .enter().append("tspan")
 .attr("x", 0)
 .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2) * 10; })
 .text(function(d) { return d; });
 
node.append("text") // This is an if statement that says if the value is less than or equal to 50,000, print "", otherwise print the number
  .text(function(d) {            // 
          if (d.value <= 50000) {return ""}  
          else { return format(d.value)}
          });             
  
r2d3.resize(width, height);

var svgContainertext = d3.select("body")
  .append("text")
  .attr("width", (width / 100) *50)
  .attr("height", height);
  
svgContainertext.append("g")  
  .append("text")
  .text(function(d) { return "Causes of death; " + area + "; " + year; })
  .attr("x", (width / 100) * 2)
  .attr("y", (height / 100) * 5) 
  .attr("font-family", "sans-serif")
  .attr("font-size", "20px")
  .attr("fill", "black");
  
svgContainertext.append("g")
.append("text")
.text(function(d) { return "This visualisation shows the " + format(sum1) + " deaths in"; })
.attr("x",(width / 100) * 2)
.attr("y",(height / 100) * 6)
.attr("font-family", "sans-serif")
.attr("font-size", "12px")
.attr("fill", "#666");

svgContainertext.append("g")
.append("text")
.text(function(d) { return area + " by cause of death in " + year; })
.attr("x",(width / 100) * 2)
.attr("y",(height / 100) * 8)
.attr("font-family", "sans-serif")
.attr("font-size", "12px")
.attr("fill", "#666");

svgContainertext.append("g")
.append("text")
.attr("dy", "0em")
.text("Hover over a circle to see the cause.")
//.text("of death") // TO DO wrap text
.attr("x",(width / 100) * 2)
.attr("y", (height / 100) * 20)
.attr("font-family", "sans-serif")
.attr("font-size", "12px")
.attr("fill", "#666");

svgContainertext.append("g")
.append("text")
.text("The size of the circle represents the number")
.attr("x",(width / 100) * 2)
.attr("y", (height / 100) * 40)
.attr("font-family", "sans-serif")
.attr("font-size", "12px")
.attr("fill", "#666"); 

svgContainertext.append("g")
.append("text")
.text("of deaths for that cause. Similar causes")
.attr("x",(width / 100) * 2)
.attr("y", (height / 100) * 42)
.attr("font-family", "sans-serif")
.attr("font-size", "12px")
.attr("fill", "#666"); 

svgContainertext.append("g")
.append("text")
.text("(e.g. cancers), have the same colour.")
.attr("x",(width / 100) * 2)
.attr("y", (height / 100) * 44)
.attr("font-family", "sans-serif")
.attr("font-size", "12px")
.attr("fill", "#666"); 

svgContainertext.append("g")
.append("text")
.text(function(d) { return "Source: Global Burden of disease; 2016"; })
.attr("x",(width / 100) * 2)
.attr("y", (height / 100) * 95)
.attr("font-family", "sans-serif")
.attr("font-size", "12px")
.attr("fill", "#666");

  
});
