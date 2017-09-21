/**
 * @module ui/chart.reel
 */
var Component = require("montage/ui/component").Component;
var d3 = require('d3');

/**
 * @class BarChart
 * @extends Component
 */
exports.BarChart = Component.specialize( /** @lends BarChart# */ {

    _data: {
        value: null,
    },

    defaultOptions: {
        value: {
            height: 500,
            width: 960,
            margin: {
                top: 10,
                right: 0,
                bottom: 30,
                left: 50
            }
        }
    },

    options: {
        value: null
    },

    axis: {
        value: null
    },

    scale: {
        value: null
    },

    data: {
        set: function(data) {
            this._data = data;
            this.needsDraw = true;
            return this._data;
        },

        get: function() {
            return this._data || [];
        }
    },

    margin: {
        get: function () {
            var self = this,
                margin = self.options.margin || self.defaultOptions.margin;
            return {
                top: margin.bottom || 0,
                bottom: margin.bottom || 0,
                left: margin.left || 0,
                right: margin.right || 0
            };
        }
    },

    width: {
        get: function () {
            var self = this,
                margin = self.margin,
                width = self.options.width || self.defaultOptions.width;
            return (width - (margin.left || 0) - (margin.right || 0));
        }
    },

    height: {
        get: function () {
            var self = this,
                margin = self.margin,
                height = self.options.height || self.defaultOptions.height;
            return (height - (margin.top || 0) - (margin.bottom || 0));
        }
    },

    constructor: {
        value: function BarChart() {
            this.super();
            this.options = this.options || this.defaultOptions;
        }
    },

    enterDocument: {
        value: function(firstTime) {
            var self = this;

            if (firstTime) {

                // Init Scale
                this.scales = {
                    x: d3.scale.ordinal(),
                    y: d3.scale.linear()
                };

                // Init Axis
                this.axis = {
                    y: d3.svg.axis().scale(self.scales.y),
                    x: d3.svg.axis().scale(self.scales.x)
                };

                // Init 
                self.svg = d3.select(this.element).append("svg");
                self.view = self.svg.append("g")
                    .attr("class", "BarChart-view");

                // TODO move to renderAxis
                self.view.append("g")
                    .attr("class", "x BarChart-axis BarChart-axis-x");

                self.view.append("g")
                    .attr("class", "y BarChart-axis BarChart-axis-y"); 
            }
        }
    },

    draw: {
        value: function(timestamp) {
            var self = this;
            self.renderScale();
            self.renderAxis();
            self.renderData();
        }
    },

    renderData: {
        value: function () {

            var series,
                self = this,
                scales = this.scales,
                axis = this.axis,
                data = this.data,
                view = self.view,
                width = self.width,
                height = self.height;

            // Get series selection and map data
            series = view.selectAll(".BarChart-bar")
                    .data(data);

            // Deleted series container
            series.exit()
                .transition()
                .style("opacity", 0)
                .remove();

            // Create serie container
            series.enter().append("rect")
                .attr("class", "BarChart-bar");

            // Updated/Created series container
            series.transition()
                .attr("x", function(d) {
                    return scales.x(d.name);
                })
                .attr("width", scales.x.rangeBand())
                .attr("y", function(d) {
                    return scales.y(d.value);
                })
                .attr("fill", function(d) {
                    return d.color || 'steelblue';
                })
                .attr("height", function(d) {
                    return height - scales.y(d.value);
                });
        }
    },

    renderAxis: {
        value: function () {

            var legends,
                self = this,
                data = this.data,
                scales = this.scales,
                axis = this.axis,
                view = self.view,
                width = self.width,
                height = self.height;

            // Based on https://bl.ocks.org/mbostock/7555321

            function wrap(text, width) {
                text.each(function() {
                    var text = d3.select(this),
                        words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1, // ems
                        y = text.attr("y"),
                        dy = parseFloat(text.attr("dy")),
                        tspan = text.text(null).append("tspan")
                            .attr("x", 0).attr("y", y).attr("dy", dy + "em");
                    while ((word = words.pop())) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (tspan.node().getComputedTextLength() > width) {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan").attr("x", 0).attr("y", y)
                                .attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                        }
                    }
                });
            }

            function type(d) {
                d.value = +d.value;
                return d;
            }

            // Updated/Created axis
            view.select(".BarChart-axis-x").transition()
                .attr("transform", "translate(0," + height + ")")
                .call(axis.x)
                .selectAll(".tick text")
                .call(wrap, scales.x.rangeBand());

            view.select(".BarChart-axis-y").transition()
                .call(axis.y);
        }
    },

    renderScale: {

        value: function () {
            var self = this,
                data = this.data,
                scales = this.scales,
                svg = self.svg,
                view = self.view,
                margin = self.margin,
                width = self.width,
                height = self.height;

            svg.attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            view.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Compute new scale
            scales.x.domain(data.map(function(d) {
                return d.name;
            }));

            scales.y.domain([0, d3.max(data, function(d) {
                return d.value;
            })]);

            // Update Scale
            self.scales.x.rangeRoundBands([0, width], 0.1, 0.3);
            self.scales.y.range([height, 0]);

            // Update Axis
            self.axis.x.orient("bottom");
            self.axis.y.orient("left").ticks(8, "$");
        }
    }
});