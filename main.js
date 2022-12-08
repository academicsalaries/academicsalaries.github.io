let posColors = {
    "Grad Student": "#ea5545",   // red
    "Postdoc": "#ef9b20",        // orange
    "Research Staff": "#87bc45", // green
    "Assistant Prof": "#f46a9b", // pink
    "Assoc Prof": "#27aeef",     // blue
    "Full Prof": "#b33dc6"       // purple
}

d3.csv("https://raw.githubusercontent.com/academicsalaries/academicsalaries.github.io/main/salaries.csv", function(d) {
    return {
      // parse the data into an array of csv objects
      id:        +d.id,
      salary:    +d.salary,   
      year:      +d.year,
      university: d.university,
      department: d.department,
      position:   d.position,
      phd:       +d.phd,
      toolTipVisible: false
    };
  }).then(function(salaryData) {	
	   
// chart here:
    
let svg = d3.select("#plotSVG")
  .style("overflow","visible")
  .append("g")
  .attr("transform", "translate(50,50)")

let xScale = d3.scaleLinear()
  .domain([1990, 2025])  // x-variable has a max of 2025
  .range([0, 600]);      // x-axis is 600px wide

let yScale = d3.scaleLinear()
  .domain([0, 400000])   // y-variable has a max of 400000
  .range([400, 0]);      // y-axis is 400px high

let xVar = document.getElementById("select-x-var").value;
let yVar = document.getElementById("select-y-var").value;


// rescale the y-axis
yScale = d3.scaleLinear()
  .domain([0, d3.max(salaryData, d => d[yVar]) ])    
  .range([400, 0]);


svg.append("g")   // the axis will be contained in an SVG group element
  .attr("id","yAxis")
  .call(d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat(d3.format("d"))
          .tickSizeOuter(0)
       )
  
svg.append("g")       
  .attr("transform", "translate(0,400)")   // translate x-axis to bottom of chart
  .attr("id","xAxis")
  .call(d3.axisBottom(xScale)
          .ticks(5)
          .tickFormat(d3.format("d"))
          .tickSizeOuter(0)
       )

svg.selectAll(".bubble")
  .data(salaryData)    // bind each element of the data array to one SVG circle
  .join("circle")
  .attr("class", "bubble")
  .attr("cx", d => xScale(d.year))     // set the x position based on year
  .attr("cy", d => yScale(d.salary))   // set the y position based on salary
  .attr("r", d => 4)
  .attr("stroke", d => posColors[d.position])
  .attr("fill", d => posColors[d.position])
  .attr("fill-opacity", 0.5)
  .on("mouseover",(e,d) => {    // event listener to show tooltip on hover
    d3.select("#bubble-tip-"+d.id)
      .style("display","block");
  })
  .on("mouseout", (e,d) => {    // event listener to hide tooltip after hover
    if(!d.toolTipVisible){
      d3.select("#bubble-tip-"+d.id)
        .style("display","none");
    }
  })
  .on("click", (e,d) => {    // event listener to make tooltip remain visible on click
    if(!d.toolTipVisible){
      d3.select("#bubble-tip-"+d.id)
        .style("display", "block");
      d.toolTipVisible = true;
    }
    else{
      d3.select("#bubble-tip-"+d.id)
        .style("display", "none");
      d.toolTipVisible = false;
    }
  });

// Bubble Tips
svg.selectAll(".bubble-tip")
  .data(salaryData)
  .join("g")
  .attr("class", "bubble-tip")
  .attr("id", (d)=> "bubble-tip-"+d.id)
  .attr("transform", d => "translate(" + (xScale( d.year )+20) + ", " + yScale( d.salary) + ")"  )
  .style("display", "none")   
  .append("rect")     // this is the background to the tooltip
  .attr("x",-5)
  .attr("y",-20)
  .attr("rx",5)
  .attr("fill","white")
  .attr("fill-opacity", 0.9)
  .attr("width",180)
  .attr("height",100)

// Bubble Tip text
svg.selectAll(".bubble-tip")
  .append("text")
  .text(d =>d.university)
  .style("font-family", "sans-serif")
  .style("font-size", 14)
  .attr("stroke", "none")
  .attr("fill", d => posColors[d.position])

svg.selectAll(".bubble-tip")
  .append("text")
  .text(d => d.department)
  .attr("y", d => 20 )
  .style("font-family", "sans-serif")
  .style("font-style", "italic")
  .style("font-size", 14)
  .attr("stroke", "none")
  .attr("fill", d => posColors[d.position])

svg.selectAll(".bubble-tip")
  .append("text")
  .text(d => d.position)
  .attr("y", d => 38 )
  .style("font-family", "sans-serif")
  .style("font-style", "italic")
  .style("font-size", 14)
  .attr("stroke", "none")
  .attr("fill", d => posColors[d.position])

svg.selectAll(".bubble-tip")
  .append("text")
  .classed("bubble-tip-yText", true)
  .text(d => "$" + d[yVar].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
  .attr("y", d => 56 )
  .style("font-family", "sans-serif")
  .style("font-size", 14)
  .attr("stroke", "none")
  .attr("fill", d => posColors[d.position])

document.getElementById("select-x-var").addEventListener("change", (e)=>{
  
  // update the x-variable based on the user selection
  xVar = e.target.value   
  
  // rescale the x-axis
  xScale = d3.scaleLinear()
    .domain([d3.min(salaryData, d => d[xVar])-1, d3.max(salaryData, d => d[xVar])+1 ])    
    .range([0, 600]);

  // redraw the x-axis
  svg.select("#xAxis")            
    .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d3.format("d"))
        .tickSizeOuter(0)
     )

  // transition each circle element
    svg.selectAll(".bubble")
      .transition()
      .duration(1000)
      .attr("cx", (d) => xScale(d[xVar]) )
  
  // transition each tooltip
    svg.selectAll(".bubble-tip")
      .transition()
      .duration(1000)
      .attr("transform", d => "translate(" + (xScale(d[xVar])+20) + ", " +  yScale(d[yVar]) + ")" )
})

document.getElementById("select-y-var").addEventListener("change", (e)=>{
  
  // update the y-variable based on the user selection
  yVar = e.target.value   

  // rescale the y-axis
  yScale = d3.scaleLinear()
    .domain([0, d3.max(salaryData, d => d[yVar]) ])    
    .range([400, 0]);

  // redraw the y-axis
  svg.select("#yAxis")            
    .call(d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat(d3.format("d"))
          .tickSizeOuter(0)
       )

  // transition each circle element and tooltip
  svg.selectAll(".bubble")
    .transition()
    .duration(1000)
    .attr("cy", (d) => yScale(d[yVar]) )
    
  svg.selectAll(".bubble-tip-yText")
    .text(d => "(" + d[yVar] + " " + yVar + ")")
  
  svg.selectAll(".bubble-tip")
      .attr("transform", d => "translate(" + (xScale(d[xVar])+20) + ", " +  yScale(d[yVar]) + ")" )
})


 });
