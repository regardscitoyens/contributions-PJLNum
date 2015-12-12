(function(ns){

  ns.sigma = undefined;

  ns.downloadGraph = function(filename){
    var contrGraph = (filename.indexOf("users") === -1);
    console.log("Downloading data...");
  setTimeout(function(){
    $.getJSON('data/'+filename).then(function(data){
      console.log("Building network...");
      if (ns.sigma) ns.sigma.kill();
      ns.sigma = new sigma({
        container: 'graph',
        settings: {
          labelThreshold: (contrGraph ? 6 : 5),
          singleHover: true,
          minNodeSize: (contrGraph ? 2 : 1),
          maxNodeSize: (contrGraph ? 8 : 12),
          edgeColor: "default",
          borderSize: 1,
          defaultEdgeColor: "#EEE",
          maxEdgeSize: 0.05
        }
      });
      data["nodes"].forEach(function(n){
        ns.sigma.graph.addNode({
          id: n.id,
          label: (contrGraph ? n.attributes.authorName : n.label),
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
      $("#loader").hide();
    });
  }, 100);
  };

  ns.setResponsive = function(){
    $('#graph').width($(window).width() - 50)
               .height($(window).height() - 50);
  };

  $(window).resize(ns.setResponsive);

})(window.networksPJLNum = window.networksPJLNum || {});
