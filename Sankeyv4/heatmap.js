
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
    datasets = ["totals.csv"];


var heatmapChart = function(csvFile) {

    
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


        elemts.transition()           // apply a transition
            .duration(1000)
            .style("fill", function(d) { return colorScale(d.value); })
            
        elemts.on("click", function(d){
            var elem = d3.select("#rect" + d.combo);
            if (elem.classed("selected-combo")) {
                elem.classed("selected-combo", false);
            } else {
                elem.classed("selected-combo", true);
            }
        })
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html( 'Holi' + "<br/>" + 'Ana')
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
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

$(document).ready(function () {
    heatmapChart(datasets[0]);
});

