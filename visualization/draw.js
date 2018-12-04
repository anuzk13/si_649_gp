var data1 = []

// var data2 = []
var cohortList = ["1", "2", "3", "4"] 

var legendLabels = ["0-25%", "26-50%", "51-75%", "76-100%"]

var color = d3.scaleOrdinal()
    .range(["#ca0020","#f4a582","#d5d5d5","#92c5de","#0571b0"]);

$(document).ready(function () {
    loadData();
});

function loadData() {    
    d3.csv("data/sampledataexam1.csv", function (d) {
        data1 = d
        // createMChoiceCircles(findMChoiceItems(cohortFilter()));
        createMChoiceCircles(groupDataByChapterMChoice());
        createParsonsCircles(groupDataByChapterParsons());
        createUnitTestCircles(groupDataByChapterUnitTest());
    });
    d3.csv("data/sampledataexam2.csv", function (d) {
        data2 = d
    });


};

function cohortFilter() { 
    var cohorts = data1.filter(function(d) { return d.combo_id == "1" || d.combo_id == "2" || d.combo_id == "3" || d.combo_id == "4"})
    return cohorts

}

function findMChoiceItems(cohorts) {
    var items = cohorts.filter(function(d) {return d.event_name == "mchoice"}) 
    return items;
}

function groupDataByChapterMChoice() {    
    var groupedData = d3.nest()
        .key(function (d) { return d.div })
        .entries(findMChoiceItems(cohortFilter()));    
    return groupedData;
}

function findParsonsItems(cohorts) {
    var items = cohorts.filter(function(d) {return d.event_name == "parsons"}) 
    return items;
}

function groupDataByChapterParsons() {    
    var groupedData = d3.nest()
        .key(function (d) { return d.div })
        .entries(findParsonsItems(cohortFilter()));    
    return groupedData;
}

function findUnitTestItems(cohorts) {
    var items = cohorts.filter(function(d) {return d.event_name == "unittest"}) 
    return items;
}

function groupDataByChapterUnitTest() {    
    var groupedData = d3.nest()
        .key(function (d) { return d.div })
        .entries(findUnitTestItems(cohortFilter()));    
    return groupedData;
}

function createMChoiceCircles(dataitems) {

    var margin = { top: 20, right: 20, bottom: 30, left: 60 },
        width = 940 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x0 = d3.scaleBand()
        .domain(dataitems.map(function (d) { return d.key; }))
        .rangeRound([0, width])
        .paddingInner(0.1);

    var x1 = d3.scaleBand()
        .domain(cohortList)
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05); 

    var y = d3.scaleLinear()
        // .domain([0, (d3.max(findMChoiceItems(cohortFilter()), function (d) { return d.student_q_count; }))])
        .domain([0, 50])
        .range([height, 0]);

    var tooltip = d3.select("body").append("div").attr("class", "toolTip"); //NEW

    var svg = d3.select("#mChoiceCircles").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    var slice = svg.selectAll(".slice")
        .data(dataitems)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform",function(d) { return "translate(" + x0(d.key) + ",0)"; })

    var rect = slice.selectAll(".rect")
        .data(function(d) { return d.values})
        .enter().append("rect")
        .attr("opacity", function(d) { return d.percent_correct / 100 })
        .attr("x", function(d) { return x1(d.combo_id);})
        .attr("width", x1.bandwidth())
        .attr("y", function(d){ return y(d.student_q_count); })
        .attr("height", function(d){ return height - y(d.student_q_count); })
        .attr("fill", "#5b717c") 
        .on("mousemove", function(d,i){
            d3.select(this)
                .attr("stroke", "black")
                .attr("stroke-width", 3);
            tooltip.style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 150 + "px")
                .style("display", "inline-block")
                .html("<b>Students: </b>" + d.student_q_count + "<br>" + "<b>% Correct: </b>" + d.percent_correct + "<br>");
        })
        .on("mouseout", function(d){ 
            d3.select(this).attr("stroke-width", 0);
            tooltip.style("display", "none");
        }); 

    // add the x Axis
    var gx0 = svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.1em")
        .attr("dy", "2em");

    // add the x Axis
    var gx1 = svg.append("g")
        .attr("class", "x1_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x1))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.1em")
        .attr("dy", ".25em");

    // hide axis lines and ticks
    svg.selectAll(".tick").styles({"stroke-width":0});

    // add the y Axis
    var gy = svg.append("g")
        .call(d3.axisLeft(y));
    
    svg.selectAll(".domain").styles({"stroke-width": 0});


}

function createParsonsCircles(dataitems) {

    var margin = { top: 20, right: 20, bottom: 30, left: 60 },
        width = 940 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x0 = d3.scaleBand()
        .domain(dataitems.map(function (d) { return d.key; }))
        .rangeRound([0, width])
        .paddingInner(0.1);

    var x1 = d3.scaleBand()
        .domain(cohortList)
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05); 

    var y = d3.scaleLinear()
        // .domain([0, (d3.max(findMChoiceItems(cohortFilter()), function (d) { return d.student_q_count; }))])
        .domain([0, 50])
        .range([height, 0]);

    var tooltip = d3.select("body").append("div").attr("class", "toolTip"); //NEW

    var svg = d3.select("#parsonsCircles").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    var slice = svg.selectAll(".slice")
        .data(dataitems)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform",function(d) { return "translate(" + x0(d.key) + ",0)"; })

    var rect = slice.selectAll(".rect")
        .data(function(d) { return d.values})
        .enter().append("rect")
        .attr("opacity", function(d) { return d.percent_correct / 100 })
        .attr("x", function(d) { return x1(d.combo_id);})
        .attr("width", x1.bandwidth())
        .attr("y", function(d){ return y(d.student_q_count); })
        .attr("height", function(d){ return height - y(d.student_q_count); })
        .attr("fill", "#5b717c") 
        .on("mousemove", function(d,i){
            d3.select(this)
                .attr("stroke", "black")
                .attr("stroke-width", 3);
            tooltip.style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 150 + "px")
                .style("display", "inline-block")
                .html("<b>Students: </b>" + d.student_q_count + "<br>" + "<b>% Correct: </b>" + d.percent_correct + "<br>");
        })
        .on("mouseout", function(d){ 
            d3.select(this).attr("stroke-width", 0);
            tooltip.style("display", "none");
        }); 

    // add the x Axis
    var gx0 = svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.1em")
        .attr("dy", "2em");

    // add the x Axis
    var gx1 = svg.append("g")
        .attr("class", "x1_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x1))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.1em")
        .attr("dy", ".25em");

    // hide axis lines and ticks
    svg.selectAll(".tick").styles({"stroke-width":0});

    // add the y Axis
    var gy = svg.append("g")
        .call(d3.axisLeft(y));
    
    svg.selectAll(".domain").styles({"stroke-width": 0});


}

function createUnitTestCircles(dataitems) {

    var margin = { top: 20, right: 20, bottom: 30, left: 60 },
        width = 940 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x0 = d3.scaleBand()
        .domain(dataitems.map(function (d) { return d.key; }))
        .rangeRound([0, width])
        .paddingInner(0.1);

    var x1 = d3.scaleBand()
        .domain(cohortList)
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05); 

    var y = d3.scaleLinear()
        // .domain([0, (d3.max(findMChoiceItems(cohortFilter()), function (d) { return d.student_q_count; }))])
        .domain([0, 50])
        .range([height, 0]);

    var tooltip = d3.select("body").append("div").attr("class", "toolTip"); //NEW

    var svg = d3.select("#unitTestCircles").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    var slice = svg.selectAll(".slice")
        .data(dataitems)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform",function(d) { return "translate(" + x0(d.key) + ",0)"; })

    var rect = slice.selectAll(".rect")
        .data(function(d) { return d.values})
        .enter().append("rect")
        .attr("opacity", function(d) { return d.percent_correct / 100 })
        .attr("x", function(d) { return x1(d.combo_id);})
        .attr("width", x1.bandwidth())
        .attr("y", function(d){ return y(d.student_q_count); })
        .attr("height", function(d){ return height - y(d.student_q_count); })
        .attr("fill", "#5b717c") 
        .on("mousemove", function(d,i){
            d3.select(this)
                .attr("stroke", "black")
                .attr("stroke-width", 3);
            tooltip.style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 150 + "px")
                .style("display", "inline-block")
                .html("<b>Students: </b>" + d.student_q_count + "<br>" + "<b>% Correct: </b>" + d.percent_correct + "<br>");
        })
        .on("mouseout", function(d){ 
            d3.select(this).attr("stroke-width", 0);
            tooltip.style("display", "none");
        }); 

    // add the x Axis
    var gx0 = svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.1em")
        .attr("dy", "2em");

    // add the x Axis
    var gx1 = svg.append("g")
        .attr("class", "x1_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x1))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.1em")
        .attr("dy", ".25em");

    // hide axis lines and ticks
    svg.selectAll(".tick").styles({"stroke-width":0});

    // add the y Axis
    var gy = svg.append("g")
        .call(d3.axisLeft(y));
    
    svg.selectAll(".domain").styles({"stroke-width": 0});


}




