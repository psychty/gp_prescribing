
//  https://www.youtube.com/watch?v=lPr60pexvEM

(function() {
  var width = 500,
  height = 500;

  // Force diagrames do not care about margins

  var svg = d3.select("#chart")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .append("g")
    .attr("transform", "translate(0,0)")
    // .attr("font-family", "verdana")
    // .attr("font-size", ".8em")
    // .attr("text-anchor", "middle")

    var radiusScale = d3.scaleSqrt().domain([1, 657909]).range([4,40]) // Define the min and max of your input (domain), and the output(range) you want

    // create a force simulation acting on our circles
    var simulation = d3.forceSimulation()
        .force("x", d3.forceX(width / 2).strength(0.05)) // force our circle nodes towards the middle of the width of our svg
        .force("y", d3.forceY(height / 2).strength(0.05))
        .force("collide", d3.forceCollide(function(d) {
          return radiusScale(d.value) + 1;
        })) // if the radius of the circle matches the radiua of the forceCollide then there will be no overlap between circles

    d3.queue()
      .defer(d3.csv, "Coastal_2018_prescribing.csv")
      .await(ready)

    function ready (error, datapoints) {

      var circles = svg.selectAll(".artist")
      .data(datapoints)
      .enter().append("circle")
      .attr("class", "artist")
      .attr("r", function(d) {
        return radiusScale(d.value) // use the scaled value as a radius
      })
      .attr("fill", "lightblue")

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

})();
