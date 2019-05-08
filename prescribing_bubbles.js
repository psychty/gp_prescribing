
//  https://www.youtube.com/watch?v=lPr60pexvEM

// https://archive.nytimes.com/www.nytimes.com/interactive/2013/05/25/sunday-review/corporate-taxes.html

(function() {
  var width = 800,
  height = 800;
  // Force diagrams do not care about margins

// create a function to convert a value to numeric with proper formating
  var format = d3.format(",d");

// Define the min and max of your input (domain), and the output(range) you want
  var radiusScale = d3.scaleSqrt()
    .domain([1, 1010000])
    .range([1,50])

  var chapter_key = ["Gastro-Intestinal System","Cardiovascular System", "Respiratory System", "Central Nervous System", "Infections", "Endocrine System", "Obstetrics,Gynae+Urinary Tract Disorders", "Malignant Disease & Immunosuppression", "Nutrition And Blood", "Musculoskeletal & Joint Diseases", "Eye", "Ear, Nose And Oropharynx", "Skin", "Immunological Products & Vaccines", "Anaesthesia", "Preparations used in Diagnosis", "Other Drugs And Preparations", "Dressings", "Appliances", "Incontinence Appliances", "Stoma Appliances"]

// Define a colour pallete for the given chapters (this could be the chapter name or the chapter code)
  var chapterColour = d3.scaleOrdinal()
  	.domain(chapter_key)
  	.range(["#6481c6","#4ac158","#c451ba","#7ab43d","#7963cf","#b0b639","#d94279","#468938","#d38cca","#d8992e","#49b9d3","#d24d33","#5cc396","#984c80","#9cb26a","#be5b63","#36845f","#e68f6d","#6f7128","#9d5f2c","#c6a059"])

// Define the chart svg
var svg = d3.select("#chart")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .append("g")
    .attr("transform", "translate(0,0)")
    .attr("font-family", "verdana")
    .attr("font-size", ".8em")
    .attr("text-anchor", "middle")

// Create functions to show, move, and hide the tooltip
var tooltip = d3.select("#chart")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
	    .style("z-index", "10")
	    .style("visibility", "hidden");

var mousemove = function(d) {
  tooltip
    .html("<p>In 2018, there were <strong>" + format(d.items) + "</strong> items prescribed in the " + d.BNF_section + " BNF section.</p><p>This is part of the <strong>" + d.BNF_chapter + "</strong> BNF chapter.</p>")
    .style("top", (event.pageY-10)+"px")
    .style("left",(event.pageX+10)+"px")
}

// This creates functions for the force physics applied to the circles to say where to place them given certain events
// These are the default forces
var forceX = d3.forceX(function(d){
  return width / 2}).strength(0.02)

var forceY = d3.forceY(function(d){
  return height / 2}).strength(0.02)

// This is a function which tells the circles how close or far away they need to be. If the radius of the circle matches the radius of the forceCollide then there will be no overlap between circles. Adding a + 1 with add a small gap between the circles. Adding a negative (- 1) will add some overlap.
var forceCollide = d3.forceCollide(function(d) {
  return radiusScale(d.items) +1
}).iterations(2)

// create a force simulation acting on our circles. this is the default simulation, using the forceX and forceY functions defined above.
var simulation = d3.forceSimulation()
    .force("x", d3.forceX(width /2).strength(0.04))
    .force("y", d3.forceY(height /2).strength(0.04))
    .force("collide", forceCollide)


// TODO: Load more than one csv data object and calculate fields from them both to use in tooltips and other text

//     d3.csv("Coastal_2018_prescribing.csv", function(error, csv_data) {
//  var data = d3.nest()
//   .key(function(d) { return d.BNF_chapter;})
//   .rollup(function(d) {
//    return d3.sum(d, function(g) {return g.items; });
//   }).entries(csv_data);
// ...
// });

// Load data from csv file
  d3.queue()
    .defer(d3.csv, "WSx_2018_prescribing.csv")
    // .defer(d3.csv, "Coastal_2018_prescribing_chapter.csv")
    .await(ready)

// Build the things
function ready (error, datapoints) {

// Build the circles
var circles = svg.selectAll(".bubbles")
      .data(datapoints)
      .enter().append("circle")
      .attr("class", "bubbles") // give it the class 'bubbles'
      .attr("r", function(d) {
        return radiusScale(d.items) // use the scaled value as a radius
      })
      .style("fill", function (d) {
        return chapterColour(d.BNF_chapter); // Use the function chapterColour to assign a colour
      })
      .on("mouseover", function(){return tooltip.style("visibility", "visible");})
	    .on("mousemove", mousemove)
	    .on("mouseout", function(){return tooltip.style("visibility", "hidden");}); // I think this function ammends the visibility of the tooltip object to hidden

// TODO:  Figure out creating a variable based on the button clicked (e.g. the chpter title clicked) and have it appear here also with a line to the circles force centre.
      simulation.nodes(datapoints)
        .on('tick', ticked)

        function ticked () {
          circles
           .attr("cx", function(d) {
             return d.x
           })
           .attr("cy", function(d){
             return d.y
           })
        }
    }


// This is a function that listens for the event of someone clicking the 'combined_button' button
    d3.select("#combined_button").on('click', function(){
      simulation
        .force("x", forceX)
        .force("y", forceY)
        .force("collide", forceCollide)
        .alphaTarget(0.5)
        .restart()
    })

// We can also use a different function which is picked up when an event occurs. In particular this has an if else statement that we will use to split our circles. It currently pulls out the Gastro-intestinal system
// https://www.d3-graph-gallery.com/graph/interactivity_button.html

    var forceXSplit = d3.forceX(function(d){
      if(d.BNF_chapter === 'Gastro-Intestinal System') {
        return 100
      } else {
        return 500
      }
    }).strength(0.1) // force our circle nodes towards the middle of the width of our svg

    var forceYSplit = d3.forceY(function(d){
      if(d.BNF_chapter === 'Gastro-Intestinal System') {
        return 100
      } else {
        return height / 2
      }
    }).strength(0.1) // force our circle nodes towards the middle of the width of our svg

// This is a function that listens for the event of someone clicking the 'combined_button' button
    d3.select("#split_button_gastro").on('click', function(){
      simulation
       .velocityDecay(0.2)
        .force("x", forceXSplit)
        .force("y", forceYSplit)
        .force("collide", forceCollide)
        .alphaTarget(0.25)
        .restart()

// TODO: text wrapping
// We want to add some text to the svg once the button is clicked
// var sum = d3.sum(datapoints, function(d) { return d.items; })
        var label_x = "Gastro-Intestinal system"
        var label_x_chapter_sum = "This chapter has sections."

// The order of elements, particularly what goes before and after transition(), duration() and delay() are very important
        svg
            .append("text")
            .attr("x", 300)
            .attr("y", 50)
            .style("font-size", "11px")
            .style("font-weight", "bold")
            .attr("alignment-baseline","left")
            .attr("fill", "#f1f1f1")
            .transition()
            .duration(1000)
            .delay(2000)
            .text(function(d) {
                return label_x })
            .attr("fill", "#000000")

          svg
            .append("text")
            .attr("x", 350)
            .attr("y", 65)
            .style("font-size", "10px")
            .attr("alignment-baseline","left")
            .attr("fill", "#f1f1f1")
            .transition()
            .duration(1000)
            .delay(2500)
            .text(function(d) {
                return label_x_chapter_sum})
            .attr("fill", "#000000")
    })

// Add svg_size_key: circles
    var svg_size_key = d3.select("#chart_legend")
      .append("svg")
        .attr("width", 250)
        .attr("height", 130)

    var valuesToShow = [1000, 50000, 400000, 1000000]
    var xCircle = 65
    var xLabel = 150
    var yCircle = 130

    svg_size_key
      .selectAll("legend")
      .data(valuesToShow)
      .enter()
      .append("circle")
        .attr("cx", xCircle)
        .attr("cy", function(d) {
          return yCircle - radiusScale(d)
        })
        .attr("r",
          function(d) { return radiusScale(d)
          })
        .style("fill", "none")
        .attr("stroke", "black")

// Add svg_size_key: segments
    svg_size_key
      .selectAll("legend")
      .data(valuesToShow)
      .enter()
      .append("line")
        .attr('x1', function(d){ return xCircle + radiusScale(d) } )
        .attr('x2', xLabel)
        .attr('y1', function(d){ return yCircle - radiusScale(d) } )
        .attr('y2', function(d){ return yCircle - radiusScale(d) } )
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('2,2'))

// Add legend: labels
    svg_size_key
      .selectAll("legend")
      .data(valuesToShow)
      .enter()
      .append("text")
        .attr('x', xLabel)
        .attr('y', function(d) {
          return yCircle - radiusScale(d)
        })
        .text( function(d) {
          return format(d) + " items"
        })
        .attr("font-size", 11)
        .attr('alignment-baseline', 'top')

})();
