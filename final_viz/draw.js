var students_exams_data = []
var selected_groups = []
var combo_map = {}
var plot_headers = {
    "mchoice" : "Multiple Choice Questions",
    "parsons" : "Parsons Questions",
    "unittest" : "Unit Test Questions"
}
var color = d3.scaleOrdinal()
    .range(["#ca0020","#f4a582","#d5d5d5","#92c5de","#0571b0"]);

$(document).ready(function () {
    loadData();
    heatmapChart("totals.csv");
});

function loadData() {
    d3.csv("exams.csv", function (d) {
        students_exams_data = d
    });

};

function cohortFilter(combos) {
    var cohorts = students_exams_data.filter(function(d) { 
        return combos.reduce((prev,current) => prev || d.combo_id == current, false)})
    return cohorts
}

function findTestItems(cohorts, name) {
    var items = cohorts.filter(function(d) {return d.event_name == name})
    return items;
}

function groupDataByChapter(test_cohorts) {
    var groupedData = d3.nest()
        .key(function (d) { return d.div_num })
        .entries(test_cohorts);
    return groupedData.sort((a,b) => (+a.key) - (+b.key));
}

function createTestBars(filtered_cohorts, groups, test_name, test_id) {

    d3.select(test_id).selectAll("*").remove();
    d3.select("#bars-tooltip" + test_name).remove();
    
    if (!filtered_cohorts.length) {
        return;
    }

    var test_cohorts = findTestItems(filtered_cohorts, test_name);
    if (!test_cohorts.length) {
        return; 
    }

    d3.select(test_id).append("h6")
        .attr("class", "text-center")
        .html(plot_headers[test_name]);

    d3.select("body").append("div")
        .attr("class", "tooltip")
        .attr("id", "bars-tooltip" + test_name )
        .style("opacity", 0);

    var dataitems = groupDataByChapter(test_cohorts);
    var max = d3.max(test_cohorts, function(d) { return +d.student_q_count; } );
    var margin = { top: 10, right: 20, bottom: 50, left: 60 },
        width = 850 - margin.left - margin.right,
        height = 180 - margin.top - margin.bottom;

    var x0 = d3.scaleBand()
        .domain(dataitems.map(function (d) { return "ch" + d.key; }))
        .rangeRound([0, width])
        .paddingInner(0.1);

    var x1 = d3.scaleBand()
        .domain(groups)
        .rangeRound([0, x0.bandwidth()])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([0, max])
        .range([height, 0]);

    var svg = d3.select(test_id)
        .append("svg")
        .attr("id", "bars-plot-" + test_name)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    var slice = svg.selectAll(".slice")
        .data(dataitems)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform",function(d) { return "translate(" + x0("ch" + d.key) + ",0)"; })

    var tooltip = d3.select("#bars-tooltip" + test_name);

    var rect = slice.selectAll(".rect")
        .data(function(d) { return d.values})
        .enter().append("rect")
        .attr("opacity", function(d) { return d.percent_correct / 100 })
        .attr("x", function(d) { return x1(d.combo_id);})
        .attr("width", x1.bandwidth())
        .attr("y", function(d){ return y(d.student_q_count); })
        .attr("height", function(d){ return height - y(d.student_q_count); })
        .attr("fill", "#5b717c")
        .on("mouseover", function(d){
            d3.select(this)
            .attr("stroke", "black")
            .attr("stroke-width", 3);
            // var tooltip = d3.select("#bars-tooltip" + test_name);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip
                .style("left", (d3.event.pageX + 20) + "px")
                .style("top", (d3.event.pageY - 70) + "px")
                .style("display", "inline-block")
                .html("<b>Students: </b>" + d.student_q_count + "<br>" + "<b>% Correct: </b>" + (+d.percent_correct).toFixed(2) + " %<br>");
        })
        .on("mouseout", function(d){
            d3.select(this).attr("stroke-width", 0);
            tooltip.style("display", "none");
        });

    // add the x Axis
    var gx0 = svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0));

    gx0.selectAll("line")
        .attr("y2", "20")
        .attr("transform", "translate(" +(x0.bandwidth() * 0.53 )+ ",0)")
        .style("fill", "gray")

    gx0.selectAll("text")
        .style("text-anchor", "end")
        .style("fill", "gray")
        .attr("dx", "0.6em")
        .attr("dy", "2em")
        .filter(function (d, i) { return i === 0;})
        .style('fill', 'transparent');  

    // add the x Axis
    var gx1 = svg.append("g")
        .attr("class", "x1_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x1));

    gx1.selectAll("line")
        .style("stroke", "none")

    gx1.selectAll(".domain")
        .style("stroke", "none")

    
    gx1.selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-30)")
        .style("font-size","0.4rem")
        .attr("dx", "-.1em")
        .attr("dy", ".25em")
        .html(function (d) { return combo_map[d]});

    // hide axis lines and ticks
    svg.selectAll(".tick").style({"stroke-width":0});

    // add the y Axis
    var gy = svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll(".domain").style({"stroke-width": 0});
}

var heatmapChart = function(csvFile) {

    var margin = { top: 50, right: 0, bottom: 100, left: 100 },
    width = 400 - margin.left - margin.right,
    height = 530 - margin.top - margin.bottom,
    gridWidth = 90;
    gridHeight = 30;
    legendElementWidth = 30,
    colors = colorbrewer.YlGnBu[9]
    pretests = ["6", "12", "no_pretest"],
    pretests_scale = {
        "6": 1, 
        "12": 2,
        "no_pretest": 3
    },
    pretests_labels = {
        "6": "Pretest fail", 
        "12": "Pretest pass", 
        "no_pretest": "No Pretest", 
    }
    exams_labels = {
        "exam1 6": "Exam 1, fail",
        "exam1 12": "Exam 1, pass",
        "exam1 no_exam": "No Exam 1",
        "exam2 6": "Exam 2, fail",
        "exam2 12": "Exam 2, pass",
        "exam2 no_exam": "No Exam 2",
        "exam3 6": "Exam 3, fail",
        "exam3 12": "Exam 3, pass",
        "exam3 no_exam": "No Exam 3",
        "exam4 6": "Exam 3, fail",
        "exam4 12": "Exam 3, pass",
        "exam4 no_exam": "No Exam 4"
    }
    exams = ["exam1 6",
        "exam1 12",
        "exam1 no_exam",
        "exam2 6",
        "exam2 12",
        "exam2 no_exam",
        "exam3 6",
        "exam3 12",
        "exam3 no_exam",
        "exam4 6",
        "exam4 12",
        "exam4 no_exam"],
    exams_scale = {
        "exam1 6": 1,
        "exam1 12": 2,
        "exam1 no_exam": 3,
        "exam2 6": 4,
        "exam2 12": 5,
        "exam2 no_exam": 6,
        "exam3 6": 7,
        "exam3 12": 8,
        "exam3 no_exam": 9,
        "exam4 6": 10,
        "exam4 12": 11,
        "exam4 no_exam": 12
    }

    var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

        
    var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var examLabels = svg.selectAll(".examLabel")
    .data(exams)
    .enter().append("text")
    .text(function (d) { return exams_labels[d]; })
    .attr("x", 0)
    .attr("color", function (d) { return d.includes('6') ? 'red' : d.includes('12') ? 'green' : 'gray' ; })
    .attr("y", function (d, i) { return i * gridHeight; })
    .style("text-anchor", "end")
    .attr("transform", "translate(-6," + gridHeight/ 1.5 + ")")
    .attr("class", function (d, i) {
            var clss = d.includes('6') ? 'failed ' : d.includes('12') ? 'pass ' : 'notest ';
            clss +=  ((i >= 0 && i <= 4) ? "examLabel mono axis axis-workweek" : "examLabel mono axis"); 
            return clss
        });

    var pretestLabels = svg.selectAll(".pretestLabel")
    .data(pretests)
    .enter().append("text")
    .text(function(d) { return pretests_labels[d]; })
    .attr("x", function(d, i) { return i * gridWidth; })
    .attr("y", 0)
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + gridWidth / 2 + ", -6)")
    .attr("class", function(d, i) { 
        var clss = d.includes('6') ? 'failed ' : d.includes('12') ? 'pass ' : 'notest ';
        clss += ((i >= 7 && i <= 16) ? "pretestLabel mono axis axis-workpretest" : "pretestLabel mono axis"); 
        return clss;    
    });
  
    d3.csv(csvFile,
    function(d) {
        return {
            exam: d.exam_value + '',
            pretest: d.pretest_value + '',
            combo: +d.combo_id,
            value: +d.count,
            selected: false
        };
    },
    function(error, data) {
        var colorScale = d3.scaleQuantile()
            .domain([    7,    97,   161,   190,   225,   254,   262,   293,   337,
                        355,   420,   425,   467,   497,   549,   552,   663,   723,
                        749,   757,   991,  1155,  1444,  1669, 13137, 13258, 13492,
                        13612, 23145, 23430, 23594, 23813, 38812, 38885, 39161, 39695])
            .range(colors);

        var cards = svg.selectAll(".pretest")
            .data(data, function(d) {return exams_scale[d.exam]+':'+pretests_scale[d.pretest];});

        cards.append("title");

        var elemts = cards.enter().append("rect")
            .attr("x", function(d) { return (pretests_scale[d.pretest] - 1) * gridWidth; })
            .attr("y", function(d) { return (exams_scale[d.exam] - 1) * gridHeight; })
            .attr("rx", 4)
            .attr("id",  function(d) { return "rect" + d.combo; })
            .attr("ry", 4)
            .attr("class", "pretest bordered")
            .attr("width", gridWidth - 3)
            .attr("height", gridHeight - 3)
            .style("fill", colors[0]);

        elemts.transition()
            .duration(1000)
            .style("fill", function(d) { return colorScale(d.value); })
            
        elemts.on("click", function(d){
            var elem = d3.select("#rect" + d.combo);
            combo_map[d.combo] = pretests_labels[d.pretest] + "/" + exams_labels[d.exam];
            if (elem.classed("selected-combo")) {
                selected_groups.splice(selected_groups.indexOf(d.combo + ''), 1); 
                elem.classed("selected-combo", false);
            } else {
                elem.classed("selected-combo", true);
                selected_groups.push(d.combo + '');
            }
            var filtered_cohorts = cohortFilter(selected_groups);
            if (filtered_cohorts.length) {
                d3.select("#empty_filter")
                    .style("display", "none");
            } else {
                d3.select("#empty_filter")
                    .style("display", "block");
            }
            createTestBars(filtered_cohorts, selected_groups, "mchoice", "#mChoiceCircles");
            createTestBars(filtered_cohorts, selected_groups, "parsons", "#parsonsCircles");
            createTestBars(filtered_cohorts, selected_groups, "unittest", "#unitTestCircles");
        })
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("<b>Pretest: </b>" + pretests_labels[d.pretest] + "<br>" 
                    + "<b>% Exam: </b>" + exams_labels[d.exam] + "<br>"
                    + "<b>% Total count: </b>" + d.value + "<br>")
                .style("left", (d3.event.pageX + 50) + "px")
                .style("top", (d3.event.pageY - 50) + "px")
                .style("display", "inline-block");
        })
        .on("mouseout", function(d){
            d3.select(this).attr("stroke-width", 0);
            div.style("display", "none");
        })


        cards.select("title").text(function(d) { return d.value; });

        svg.selectAll(".exam_line")
        .data(['exam1 6', 'exam2 6', 'exam3 6', 'exam4 6'])
        .enter().append("line")
        .attr("x1", - gridWidth)
        .attr("y1", function(d) { return ( exams_scale[d] + 2) * gridHeight - 2 })
        .attr("x2", 3 * gridWidth)
        .attr("y2", function(d) { return ( exams_scale[d] + 2) * gridHeight - 2 })
        .attr("stroke-width", 2)
        .attr("class", "exam_line")
        .attr("stroke", "black");

        svg.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(20,20)");

        var legend = svg.selectAll(".legendQuant")
            .data([0].concat(colorScale.quantiles()), function(d) { return d; }).enter();

        legend.append("rect")
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", height)
        .attr("width", legendElementWidth)
        .attr("height", gridHeight / 2)
        .style("fill", function(d, i) {  return colors[i]; });

        legend.append("text")
        .attr("class", "mono label_heat")
        .text(function(d) { return "≥ " + Math.round(d); })
        .attr("transform", function (d, i) {
           var translate = "translate(" + (legendElementWidth * i + legendElementWidth / 2) + "," + (height + gridHeight) + ") rotate(60)";
           return translate;
        })

        legend.exit().remove();

    });  
};



