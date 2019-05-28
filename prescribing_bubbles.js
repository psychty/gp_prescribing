//  https://www.youtube.com/watch?v=lPr60pexvEM
// https://archive.nytimes.com/www.nytimes.com/interactive/2013/05/25/sunday-review/corporate-taxes.html

// These are some global variables, they start life either as blank arrays (e.g. the variables with [];) as these become created/filled by functions to say all the unique items in the dataframe or alternatively as null/undefined in the case of selected_chapter which will later be used to filter or select a chapter of interest. To begin with we dont want any chapter selected which is why it is null
var chapter_categories = [];
var chapter_totals = [];
var selected_chapter = null;

(function() {
  var width = 800,
  height = 1000;
  // Force diagrams do not care about margins

// create a function to convert a value to numeric with proper formating
  var format = d3.format(",d");

  var chapter_key = ["Gastro-Intestinal System","Cardiovascular System", "Respiratory System", "Central Nervous System", "Infections", "Endocrine System", "Obstetrics,Gynae and Urinary Tract Disorders", "Malignant Disease and Immunosuppression", "Nutrition and Blood", "Musculoskeletal and Joint Diseases", "Eye", "Ear, Nose and Oropharynx", "Skin", "Immunological Products and Vaccines", "Anaesthesia", "Preparations used in Diagnosis", "Other Drugs and Preparations", "Dressings", "Appliances", "Incontinence Appliances", "Stoma Appliances"]

  var y_new = d3.scaleOrdinal()
    .domain(chapter_key)
    .range([50, 100, 150, 200, 250, 300, 350, 400, 450, 500,550,600,650,700,750,800,850,900,950,1000,1050])

// Define the min and max of your input (domain), and the output(range) you want
  var radiusScale = d3.scaleSqrt()
    .domain([1, 1010000])
    .range([3,53])

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
    // .attr("font-family", "verdana")
    .attr("font-size", ".8em")
    .attr("text-anchor", "middle")

// Create functions to show, move, and hide the tooltip
var tooltip = d3.select("#chart")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
	    .style("z-index", "10")
	    .style("visibility", "hidden");

// This creates the function for what to do when someone moves the mouse over a circle (e.g. move the tooltip in relation to the mouse cursor).
var mousemove = function(d) {
  tooltip
    .html("<p>In 2018, there were <strong>" + format(d.items) + "</strong> items prescribed in the " + d.BNF_section + " BNF section.</p><p>This is part of the <strong>" + d.BNF_chapter + "</strong> BNF chapter.</p>")
    .style("top", (event.pageY-10)+"px")
    .style("left",(event.pageX+10)+"px")
}

// This creates functions for the force physics applied to the circles to say where to place them given certain events
// These are the default forces
var forceX = d3.forceX(function(d){
  return 400}).strength(0.2)

var forceY = d3.forceY(function(d){
  return 400}).strength(0.2)

// This is a function which tells the circles how close or far away they need to be. If the radius of the circle matches the radius of the forceCollide then there will be no overlap between circles. Adding a + 1 with add a small gap between the circles. Adding a negative (- 1) will add some overlap.
var forceCollide = d3.forceCollide(function(d) {
  return radiusScale(d.items) + 1.5
}).iterations(1)

var forceCollideApart = d3.forceCollide(function(d) {
  return radiusScale(d.items) + 3
}).iterations(6)


// create a force simulation acting on our circles. this is the default simulation, using the forceX and forceY functions defined above.
var simulation = d3.forceSimulation()
    .force("x", d3.forceX(width /2).strength(0.04))
    .force("y", d3.forceY(400).strength(0.04))
    .force("collide", forceCollide)

// Load data from csv file - this data becomes globally available, not just as an object to be called
d3.queue()
  .defer(d3.csv, "WSx_2018_prescribing.csv")
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

        chapter_categories = create_chapter_categories(datapoints);
        chapter_totals = create_chapter_totals(datapoints);

        buildMenu();
    }

// We can also use a function which is picked up when an event occurs. In particular this has an if else statement that we will use to split our circles. It currently pulls out the value of the selected_chapter (at the beginning this is null) amd then says any circles/datapoints (d) with that BNF_chapter name should be forced towards x = 100 and y = 100, whilst anything else should be pushed to x = 500 and y = the vertical middle

// TODO: I wonder if I need to get the circles to come apart to allow the smaller ones to escape and then draw back in?

var forceXSplit = d3.forceX(function(d){
      if(d.BNF_chapter === selected_chapter) {
        return width / 4
      } else {
        return width / 2
      }
    }).strength(0.25)

var forceYSplit = d3.forceY(function(d){
      if(d.BNF_chapter === selected_chapter) {
        return 200
      } else {
        return 600
      }
    }).strength(0.25)

// Add svg_size_key: circles
var valuesToShow = [1000, 50000, 400000, 1000000]
var xCircle = 65
var xLabel = 150
var yCircle = 130

var svg_size_key = d3.select("#chart_legend")
      .append("svg")
        .attr("width", 250)
        .attr("height", 130)
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

// Loop through array to get distinct chapter names
function create_chapter_categories (all_datapoints){
var cats = []; // Create a variable called cats
    all_datapoints.forEach(function(item){ // For every datapoint
      if(cats.indexOf(item.BNF_chapter) === -1) // This says look at the BNF_chapter names currently in the array (at the start there are none). If the current value you are looking at in the data does not appear in the array (signified by === -1) then move to push the value
      {
        cats.push(item.BNF_chapter) // push says add the value to the array
      }
    })
    return cats; // Once all datapoints have been examined, the result returned should be an array containing all the unique values of BNF_chapter in the data
  }

function create_chapter_totals (all_datapoints){
var cats = []; // Create a variable called cats
    all_datapoints.forEach(function(item){ // For every datapoint
      if(cats[item.BNF_chapter] !== undefined) // If the BNF_chapter is defined (e.g. not undefined)
      {
        cats[item.BNF_chapter]++; // Add one to the count every time BNF_chapter appears in the data
      } else {
        cats[item.BNF_chapter] = 1; // Otherwise, if there are no additional copies of the BNF_chapter, then the count should be one
      }
    })
    return cats; // Once all datapoints have been examined, the result returned should be an array containing the number of times each chapter appears in the data

}

// This function builds a menu by creating a button for every value in the chapter_categories array.
function buildMenu(){
  chapter_categories.forEach(function(item, index){ // The index is the position of the loop, which can be used later for the border colour
    var button = document.createElement("button");
    button.innerHTML = item;
    button.className = 'filterButton';
    button.style.borderColor = chapterColour(index);

    var div = document.getElementById("chapter_categories");
    div.appendChild(button); // This appends the button to the div

// This says listen for which value is clicked, for whatever is clicked, the following actions should take place.
    button.addEventListener('click', function(e){
      selected_chapter = e.target.innerHTML;
      simulation
        .force("x", forceXSplit)
        .force("y", forceYSplit)
        .force("collide", forceCollideApart)
        .alphaTarget(0.2)
        .restart()

var label_x = selected_chapter
var label_x_chapter_sum = "This chapter has " + chapter_totals[selected_chapter] + " sections."
var label_x_chapter_total_items_a = "The total number of items"
var label_x_chapter_total_items_b = "prescribed in this chapter:"
var label_x_item_value = d3.format(",")(100000)

// Remove any title/subtitle text elements previously rendered
    svg.select('#label_title')
    .transition()
    .duration(1500)
    .delay(250)
    .attr("opacity", 0)
    .remove();

    svg.select('#label_subtitle')
    .transition()
    .duration(1500)
    .delay(500)
    .attr("opacity", 0)
    .remove();

    svg.select('#label_subtitle_1')
    .transition()
    .duration(1500)
    .delay(600)
    .attr("opacity", 0)
    .remove();

    svg.select('#label_subtitle_2')
    .transition()
    .duration(1500)
    .delay(600)
    .attr("opacity", 0)
    .remove();

    svg.select('#label_subtitle_3')
    .transition()
    .duration(1500)
    .delay(600)
    .attr("opacity", 0)
    .remove();

      svg
      .append("text")
      .attr('id', 'label_title')
      .attr("x", 300)
      .attr("y", 50)
      .style("font-size", "1.2rem")
      .style("font-weight", "bold")
      .attr("alignment-baseline","left")
      .attr("fill", "#f1f1f1")
      .transition()
      .duration(1000)
      .delay(2000)
      .text(function(d) {
            return label_x })
      .attr("fill", "#151f6d");

    svg
      .append("text")
      .attr('id', 'label_subtitle')
      .attr("x", 375)
      .attr("y", 75)
      .style("font-size", ".8rem")
      .attr("alignment-baseline","left")
      .attr("fill", "#f1f1f1")
      .transition()
      .duration(1000)
      .delay(2500)
      .text(function(d) {
            return label_x_chapter_sum})
      .attr("fill", "#000000");

      svg
        .append("text")
        .attr('id', 'label_subtitle_1')
        .attr("x", 435)
        .attr("y", 100)
        .style("font-size", ".8rem")
        .attr("alignment-baseline","left")
        .attr("fill", "#f1f1f1")
        .transition()
        .duration(1000)
        .delay(2750)
        .text(function(d) {
              return label_x_chapter_total_items_a})
        .attr("fill", "#000000");

        svg
          .append("text")
          .attr('id', 'label_subtitle_2')
          .attr("x", 435)
          .attr("y", 115)
          .style("font-size", ".8rem")
          .attr("alignment-baseline","left")
          .attr("fill", "#f1f1f1")
          .transition()
          .duration(1000)
          .delay(2750)
          .text(function(d) {
                return label_x_chapter_total_items_b})
          .attr("fill", "#000000");

        svg
          .append("text")
          .attr('id', 'label_subtitle_3')
          .attr("x", 555)
          .attr("y", 115)
          .style("font-size", "32px")
          .style("font-weight", "bold")
          .attr("alignment-baseline","left")
          .attr("fill", "#f1f1f1")
          .transition()
          .duration(1000)
          .delay(2750)
          .text(function(d) {
                return label_x_item_value})
          .attr("fill", "#151f6d");

    })
  })
}

// TODO: add a button that positions all the circles like the webpage using y_new

})();
