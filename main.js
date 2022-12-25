let posColors = {
    "Grad Student": "#ea5545",   // red
    "Postdoc": "#ef9b20",        // orange
    "Research Staff": "#87bc45", // green
    "Lecturer": "#ffd700",       // gold
    "Assistant Professor": "#f46a9b", // pink
    "Associate Professor": "#27aeef", // blue
    "Full Professor": "#b33dc6"       // purple
}

let posEnum = {
    "Grad Student": 1,
    "Postdoc": 2,
    "Research Staff": 3,
    "Lecturer": 4,
    "Assistant Professor": 5,
    "Associate Professor": 6,
    "Full Professor": 7
}

d3.csv("https://raw.githubusercontent.com/academicsalaries/academicsalaries.github.io/main/salaries.csv", function(d) {
    return {
      // parse the data into an array of csv objects
      id:        +d.id,
      salary:    +d.salary,   
      infsalary:  Math.round((+d.salary)*Math.pow(1.025,2022-(d.year))),   
      year:      +d.year,
      university: d.university,
      department: d.department,
      field:      d.field,
      position:   d.position,
      posEnum:    posEnum[d.position],
      phd:       +d.phd,
      toolTipVisible: false,
      scatter:    0.5*(Math.random()-0.5),
    };
  }).then(function(salaryData) {	
console.log(salaryData);	   
// CHART BELOW:
    
let svg = d3.select("#plotSVG")
  .style("overflow","visible")
  .append("g")
  .attr("transform", "translate(80,10)")

let xScale = d3.scaleLinear()
  .domain([2000, 2025])  // x-variable has a max of 2025
  .range([0, Math.min(window.innerWidth-100,600)]);      // x-axis is 600px wide

let yScale = d3.scaleLinear()
  .domain([0, 400000])   // y-variable has a max of 400000
  .range([500, 0]);      // y-axis is 500px high

let xVar = document.getElementById("select-x-var").value;
let yVar = document.getElementById("select-y-var").value;

let linear = true;
let noscatter = true;

// Filters:
let f1university = document.getElementById("filter1-university").value;
let f1field = document.getElementById("filter1-field").value;
let f1position = document.getElementById("filter1-position").value;
let f2university = document.getElementById("filter2-university").value;
let f2field = document.getElementById("filter2-field").value;
let f2position = document.getElementById("filter2-position").value;

// return 0 if hidden, i if part of group i & both groups active, else 3
function visGroup(d) {
  let vis = 0;
  let grp1active = (f1university=="all" && f1field=="all" && f1position=="all") ? false : true;
  let grp2active = (f2university=="all" && f2field=="all" && f2position=="all") ? false : true;
  let grpsActive = grp1active || grp2active;
  if(grpsActive) {
	if(grp1active) {
	  if( (f1university==d.university || f1university=="all") && (f1field==d.field || f1field=="all") && (f1position==d.position || f1position=="all") ) {
		  vis = (grp2active) ? 1 : 3;
	  }
	}
	if(grp2active) {
	  if( (f2university==d.university || f2university=="all") && (f2field==d.field || f2field=="all") && (f2position==d.position || f2position=="all") ) {
		  vis = (grp1active) ? 2 : 3;
	  }
	}
  } else {
	vis = 3;
  }
  return vis;
}

function shiftX(d) {
	return (visGroup(d)==1) ? -0.05 : ((visGroup(d)==2) ? 0.05 : 0) + ((noscatter) ? 0 : d.scatter);
}

// color by position, or by group if 2 groups are being selected
function visColor(d) {
   return (visGroup(d)==1) ? "#0000FF" : ((visGroup(d)==2) ? "#FF0000" : posColors[d.position] );
}

// rescale the y-axis
function rescaleY() {
	if (linear) {
		yScale = d3.scaleLinear()
		.domain([ (d3.max(salaryData, d => (visGroup(d)) ? d[yVar] : -1)-d3.min(salaryData, d => (visGroup(d)) ? d[yVar] : 999999)>30000) ? 0 : 
		d3.min(salaryData, d => (visGroup(d)) ? d[yVar] : 999999)-1000, d3.max(salaryData, d => (visGroup(d)) ? d[yVar] : -1)+1000 ])    
		.range([500, 0]);
	}
	else {
		yScale = d3.scaleLog()
		.domain([d3.min(salaryData, d => (visGroup(d)) ? d[yVar] : 999999)-1000, d3.max(salaryData, d => (visGroup(d)) ? d[yVar] : -1)+1000 ])    
		.range([500, 0]);
	}
}
// rescale the x-axis
function rescaleX() {
  xScale = d3.scaleLinear()
    .domain([d3.min(salaryData, d => (visGroup(d)) ? d[xVar] : 9999)-1, d3.max(salaryData, d => (visGroup(d)) ? d[xVar] : 0)+1 ])    
    .range([0, Math.min(window.innerWidth-100,600)]);
}
  
rescaleX();
rescaleY();

// format axes
svg.append("g")   // the axis will be contained in an SVG group element
  .attr("id","yAxis")
  .call(d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat(d3.format("$,"))
          .tickSizeOuter(0)
       )
svg.append("g")       
  .attr("transform", "translate(0,500)")   // translate x-axis to bottom of chart
  .attr("id","xAxis")
  .call(d3.axisBottom(xScale)
          .ticks(5)
          .tickFormat(d3.format("d"))
          .tickSizeOuter(0)
       )

// Point Data
svg.selectAll(".bubble")
  .data(salaryData)    // bind each element of the data array to one SVG circle
  .join("circle")
  .attr("class", "bubble")
  .attr("cx", d => xScale(d[xVar]))   // set the x position based on xVar
  .attr("cy", d => yScale(d[yVar]))   // set the y position based on salary
  .attr("r", d => 4.5)
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
  .attr("transform", d => "translate(" + (xScale( d[xVar] )+20) + ", " + yScale( d[yVar]) + ")"  )
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
  .text(d => d.position + " (PhD " + d.phd + ")")
  .attr("y", d => 38 )
  .style("font-family", "sans-serif")
  .style("font-style", "italic")
  .style("font-size", 14)
  .attr("stroke", "none")
  .attr("fill", d => posColors[d.position])

svg.selectAll(".bubble-tip")
  .append("text")
  .classed("bubble-tip-yText", true)
  .text(d => "$" + d.salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " (" + d.year + ") -> worth " + "$" + d.infsalary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " in 2022")
  .attr("y", d => 56 )
  .style("font-family", "sans-serif")
  .style("font-size", 14)
  .attr("stroke", "none")
  .attr("fill", d => posColors[d.position])

// transition animation
function transition() {
  // transition each circle element
    svg.selectAll(".bubble")
      .transition()
      .duration(1000)
      .attr("cx", (d) => xScale(d[xVar]+shiftX(d)) )
      .attr("cy", (d) => yScale(d[yVar]) )
  // transition each tooltip
    svg.selectAll(".bubble-tip")
      .transition()
      .duration(1000)
      .attr("transform", d => "translate(" + (xScale(d[xVar])+20) + ", " +  yScale(d[yVar]) + ")" )
}

// redraw the y-axis
function redrawY() {
  svg.select("#yAxis")            
    .call(d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat(d3.format("$,"))
          .tickSizeOuter(0)
       )
}

// redraw the x-axis
function redrawX() {
  svg.select("#xAxis")            
    .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d3.format("d"))
        .tickSizeOuter(0)
     )
}

// Action: checkboxes
logCheckbox = document.getElementById('log');
logCheckbox.addEventListener('change', e => {
    if(e.target.checked){
        linear = false;
    } else {
		linear = true;
	}
	rescaleY();
	redrawY();
	transition();
});

scatterCheckbox = document.getElementById('scatter');
scatterCheckbox.addEventListener('change', e => {
    if(e.target.checked){
        noscatter = false;
    } else {
		noscatter = true;
	}
	transition();
})

// update the x-variable based on the user selection
document.getElementById("select-x-var").addEventListener("change", (e)=>{
  xVar = e.target.value   
  rescaleX();
  redrawX();
  transition();
})

// update the y-variable based on the user selection
document.getElementById("select-y-var").addEventListener("change", (e)=>{
  yVar = e.target.value   
  rescaleY();
  redrawY();
  transition();
})


// Filter events
function setVisibilities() {
  svg.selectAll(".bubble")
      .attr("opacity", d => ( visGroup(d) ? 1 : 0) )
      .attr("stroke", d => visColor(d) )
      
  svg.selectAll(".bubble-tip")
      .attr("opacity", d => ( visGroup(d) ? 1 : 0) )
      
  svg.selectAll(".bubble-tip").selectAll("text")
      .attr("fill", d => visColor(d) )
      
  rescaleY();
  rescaleX();
  redrawY();
  redrawX();
  transition();
}

document.getElementById("filter1-university").addEventListener("change", (e)=>{ 
  f1university = e.target.value;
  setVisibilities();
})

document.getElementById("filter1-field").addEventListener("change", (e)=>{ 
  f1field = e.target.value;
  setVisibilities();
})

document.getElementById("filter1-position").addEventListener("change", (e)=>{ 
  f1position = e.target.value;
  setVisibilities();
})

document.getElementById("filter2-university").addEventListener("change", (e)=>{ 
  f2university = e.target.value;
  setVisibilities();
})

document.getElementById("filter2-field").addEventListener("change", (e)=>{ 
  f2field = e.target.value;
  setVisibilities();
})

document.getElementById("filter2-position").addEventListener("change", (e)=>{ 
  f2position = e.target.value;
  setVisibilities();
})

document.getElementById("reset").onclick = function() {
	document.getElementById("filter1-university").selectedIndex = 0;
	document.getElementById("filter1-field").selectedIndex = 0;
	document.getElementById("filter1-position").selectedIndex = 0;
	document.getElementById("filter2-university").selectedIndex = 0;
	document.getElementById("filter2-field").selectedIndex = 0;
	document.getElementById("filter2-position").selectedIndex = 0;
    f1university = "all";
    f1field = "all";
    f1position = "all";
    f2university = "all";
    f2field = "all";
    f2position = "all";
    setVisibilities();
};


 });
