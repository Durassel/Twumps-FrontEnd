"use strict";

let index_directive = function  (d3Factory) {
  return {
    link: link,
    restrict: 'EA'
  };

  function link(scope, element, attrs) {
    d3Factory.d3().then(function(d3) {
      let color = d3.scale.category20c(),
        data      = [10, 20, 30],
        width     = 100,
        height    = 100,
        min       = Math.min(width, height),
        svg       = d3.select(element[0]).append('svg'),
        pie       = d3.layout.pie().sort(null),
        arc       = d3.svg.arc()
          .outerRadius(min / 2 * 0.9)
          .innerRadius(min / 2 * 0.5);

      svg.attr({width: width, height: height});
      let g = svg.append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
      g.selectAll('path').data(pie(data))
        .enter().append('path')
        .style('stroke', 'white')
        .attr('d', arc)
        .attr('fill', function(d, i){ return color(i) });

    });
  }
};

let tag_cloud = function ($window, d3Factory, d3CloudFactory) {
  return {
    link: link,
    restrict: 'E',
    scope: {
        tags: '=',
        wordClicked: '=method'
    }
  };

  function link(scope, element, attrs) {
    d3Factory.d3().then(function(d3) {
      d3CloudFactory.d3().then(function(d3Cloud) {
        let tags = scope.tags;
        // let fill = d3.scale.linear().domain([0, 1]).range(["white", "black"]);
        let fill = d3.scale.category20b();
        let w = $('.main-content').width(),
            h = 450;
        let max, fontSize;

        let layout = d3Cloud.layout.cloud()
          .timeInterval(Infinity)
          .size([w, h])
          .fontSize(function (d) {
            return fontSize(d[1]);
          })
          .rotate(function() { return (Math.round(Math.random()) * 2 - 1) * (Math.floor(~~(Math.random() * 2) * 90)); })
          .text(function (d) {
            return d[0];
          })
          .on("end", draw);

        let svg = d3.select(element[0]).append("svg")
          .attr("width", w)
          .attr("height", h);

        let vis = svg.append("g").attr("transform", "translate(" + [w >> 1, h >> 1] + ")");

        update();

        $window.onresize = function (event) {
          update();
        };

        $('.btn-expand-collapse').click(function(e) {
            if (!$('.navbar-primary').hasClass('collapsed')) {
              update();
            }
        });

        $('.btn-deflate-collapse').click(function(e) {
          update();
        });

        function draw(data, bounds) {
          let w = $('.main-content').width(),
              h = 450;

          svg.attr("width", w).attr("height", h);

          let scale = bounds ? Math.min(
            w / Math.abs(bounds[1].x - w / 2),
            w / Math.abs(bounds[0].x - w / 2),
            h / Math.abs(bounds[1].y - h / 2),
            h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;

          let text = vis.selectAll("text")
            .data(data, function (d) {
              return d.text.toLowerCase();
            });

          text.transition()
            .duration(1000)
            .attr("transform", function (d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("font-size", function (d) {
              return d.size + "px";
            });
          text.enter().append("text")
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("font-size", function (d) {
              return d.size + "px";
            })
            .style("opacity", 1e-6)
            .transition()
            .duration(1000)
            .style("opacity", 1);
          text.style("font-family", function (d) {
            return d.font;
          })
            .style("fill", function (d) {
              return fill(d.text.toLowerCase());
            })
            .text(function (d) {
              return d.text;
            })
            .on("click", function(d) {
              scope.wordClicked(d['0']);
            });

          vis.transition().attr("transform", "translate(" + [w >> 1, h >> 1] + ")scale(" + scale + ")");
        }

        function update() {
          w = $('.main-content').width();
          h = 450;

          layout.font('impact').spiral('rectangular');
          fontSize = d3.scale['sqrt']().range([10, 100]);
          if (tags.length) {
            fontSize.domain([+tags[tags.length - 1][1] || 1, +tags[0][1]]);
          }
          layout.stop().words(tags).start();
        }
      });
    });
  }
};

let emotion = function($window, d3Factory) {
  return {
    link: link,
    restrict: 'E',
    scope: {
      data: '='
    }
  };

  function link(scope, element, attrs) {
    d3Factory.d3().then(function(d3) {
      // Setup letiables
      let _data = scope.data;
      let fulldata = []
      let year = _data[0].year

      for (let i in _data) {
        fulldata[_data[i].year] = [
          { name: 'Positive', percent : Math.round(_data[i].pos) },
          { name: 'Neutral',  percent : Math.round(_data[i].neutral) },
          { name: 'Negative', percent : Math.round(_data[i].neg) }  
        ]
      }

      let data = fulldata[year]

      var color = d3.scale.ordinal()
        .domain(["Positive", "Neutral", "Negative"])
        .range(["#28a745", "#DEE5E5" , "#DD2D4A"]);

      var pie = d3.layout.pie()
        .value(function(d) { return d.percent } )
        .sort(null)
        .padAngle(.03);

      let w = 275,
          h = 275;

      var outerRadius = w/2;
      var innerRadius = 100;

      var arc = d3.svg.arc()
        .outerRadius(outerRadius)
        .innerRadius(innerRadius);

      var svg = d3.select("#emotion")
        .append("svg")
        .attr("id", "emotion-svg")
        .attr({
            width:w,
            height:h
        }).append('g')
        .attr({
            transform:'translate('+w/2+','+h/2+')'
        });
      
      var path = svg.selectAll('path')
        .data(pie(data))
        .enter()
        .append('path')
        .attr({
            d:arc,
            fill:function(d,i){
              return color(d.data.name);
            }
        });

      path.transition()
        .duration(1000)
        .attrTween('d', function(d) {
            var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
            return function(t) {
                return arc(interpolate(t));
            };
        });

      var restOfTheData = function(){
        svg.append("text")
          .attr("text-anchor", "middle")
          .attr('class','title')
          .attr({
            transform:'translate('+ 0 +','+ (-35) +')'
          })  
          .style({
            'font-size': "20px",
            'font-weight': 'bold'
          }) 
          .text(year);

        var legendRectSize = 18;
        var legendSpacing  = 7;
        var legendHeight   = legendRectSize + legendSpacing;

        // Legend
        let legends = []
        for (let i in data) {
          legends.push(data[i].percent + " % " + data[i].name)
        }

        var legend = svg.selectAll('.legend')
          .data(legends)
          .enter()
          .append('g')
          .attr({
            class:'legend',
            transform:function(d,i) {
              return 'translate(-55,' + ((i*legendHeight)-10) + ')';
            }
          });

        legend.append('rect')
          .attr({
            width:legendRectSize,
            height:legendRectSize,
            rx:20,
            ry:20
          })
          .style({
            fill:color,
            stroke:color
          });

        legend.append('text')
          .attr({
            x:30,
            y:15
          })
          .text(function(d){
            return d;
          }).style({
            fill:'#929DAF',
            'font-size':'14px'
          });
      };

      setTimeout(restOfTheData, 1000);

      // Select
      var select  = d3.select("#emotion")
        .append("select")
        .attr('class','select')
        .on("change", change);

      var options = select.selectAll('option')
        .data(Object.keys(fulldata)); // Data join

      options.enter().append("option").text(function(d) { return d; });

      function change() {
        var selected = select.property('selectedIndex'),
            year     = options[0][selected].__data__;

        updateData(year);
      }

      function updateData(year) {
        data = fulldata[year]

        // Update circles
        path = path.data(pie(data)); // compute the new angles
        var arcs = path.transition()
          .duration(1000)
          .attrTween('d', function(d) {
            var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
            return function(t) {
              return arc(interpolate(t));
            };
          });
        path.attr("d", arc); // redraw the arcs

        // Update legends
        var legendRectSize = 18;
        var legendSpacing  = 7;
        var legendHeight   = legendRectSize + legendSpacing;
        var legends = []
        for (let i in data) {
          legends.push(data[i].percent + " % " + data[i].name)
        }

        svg.selectAll('.legend').remove();

        var legend = svg.selectAll('.legend')
          .data(legends)
          .enter()
          .append('g')
          .attr({
            class:'legend',
            transform:function(d,i) {
              return 'translate(-55,' + ((i*legendHeight)-10) + ')';
            }
          });

        legend.append('rect')
          .attr({
            width:legendRectSize,
            height:legendRectSize,
            rx:20,
            ry:20
          })
          .style({
            fill:color,
            stroke:color
          });

        legend.append('text')
          .attr({
            x:30,
            y:15
          })
          .text(function(d){
            return d;
          }).style({
            fill:'#929DAF',
            'font-size':'14px'
          });

        // Update title year
        d3.select(".title").text(year)

        function getCentroid(arcs, element) {
          var c = arcs.centroid(element),
              x = c[0], y = c[1],
              h = Math.sqrt(x * x + y * y);

          var bbox = element.getBBox();
          return [(bbox.x + bbox.width/2) / h * 100, (bbox.y + bbox.height/2) / h * 100];
        }
      }
    })
  }
};

index_directive.$inject = ['d3Factory'];
tag_cloud.$inject       = ['$window', 'd3Factory', 'd3CloudFactory'];
emotion.$inject         = ['$window', 'd3Factory'];
module.exports          = {index_directive, tag_cloud, emotion};