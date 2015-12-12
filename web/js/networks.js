(function(ns){

  ns.sigma = undefined;

  ns.downloadGraph = function(filename){
    console.log("Downloading data...");
    $.getJSON('data/networks/'+filename).then(function(data){
      console.log("Building network...");
      if (ns.sigma) ns.sigma.kill();
      ns.sigma = new sigma({
        container: 'graph',
        settings: {
          labelThreshold: 2,
          singleHover: true,
          minNodeSize: 1,
          maxNodeSize: 12,
          edgeColor: "default",
          borderSize: 1,
          defaultEdgeColor: "#EEE",
          maxEdgeSize: 0.05,
          drawEdges: true
        }
      }).configForceAtlas2({
        adjustSizes: true,
        scalingRatio: 10,
        strongGravityMode: true,
        gravity: 0.1,
        slowDown: 15,

      });
      data["nodes"].forEach(function(n){
        ns.sigma.graph.addNode({
          id: n.id,
          label: n.label,
          type: n.attributes.type,
          votes: n.attributes.total_votes,
          contributions: n.attributes.total_contributions,
          x: n.x*10,
          y: -n.y*10,
          size: Math.pow(n.size, 3),
          color: n.color
        });
      });
      data["edges"].forEach(function(e){
        ns.sigma.graph.addEdge({
          "id": e.id,
          "source": e.source,
          "target": e.target,
          "weight": e.attributes.Weight
        });
      });
      console.log("Displaying graph...");
      ns.sigma.refresh();
    });
  };

  ns.setResponsive = function(){
    $('#graph').width($(window).width() - 50)
               .height($(window).height() - 50);
  };

  $(window).resize(ns.setResponsive);

})(window.networksPJLNum = window.networksPJLNum || {});
