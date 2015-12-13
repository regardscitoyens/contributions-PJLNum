(function(ns){

  ns.sigma = undefined;

  ns.colors = {
    "Citoyen": "rgb(255,235,102)",
    "Institution": "rgb(5,225,255)",
    "Organisation à but non lucratif": "rgb(137,255,107)",
    "Organisation à but lucratif": "rgb(255,36,55)"
  };

  ns.drawLegend = function(filename){
    ns.legend = new sigma({
      container: 'legend',
      settings: {
        enableHovering: false,
        mouseEnabled: false,
        labelThreshold: 1
      }
    });
    var y = 0
    Object.keys(ns.colors).forEach(function(type){
      ns.legend.graph.addNode({
        id: type,
        label: " " + type.replace(/(yen|tion)/, '$1s'),
        x: 0,
        y: y++,
        size: 1,
        color: ns.colors[type]
      });
    });
    ns.legend.camera.ratio = 1.2;
    ns.legend.refresh();
  }

  ns.loadGraph = function(filename){
    var contrGraph = (filename.indexOf("users") === -1);
    console.log("Downloading data...");
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
          color: ns.colors[n.attributes.type_source || n.attributes.type]
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
      ns.sigma.bind('clickNode', ns.clickNode).bind('clickStage', ns.unclickNode);
      ns.sigma.refresh();
      ns.drawLegend();
      $("#loader").hide();
    });
  };

// Source Pimp Trizkit https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
  ns.shadeBlend = function(p,c0,c1) {
    var n=p<0?p*-1:p,u=Math.round,w=parseInt;
    if(c0.length>7){
      var f=c0.split(","),t=(c1?c1:p<0?"rgb(0,0,0)":"rgb(255,255,255)").split(","),R=w(f[0].slice(4)),G=w(f[1]),B=w(f[2]);
      return "rgb("+(u((w(t[0].slice(4))-R)*n)+R)+","+(u((w(t[1])-G)*n)+G)+","+(u((w(t[2])-B)*n)+B)+")"
    }else{
      var f=w(c0.slice(1),16),t=w((c1?c1:p<0?"#000000":"#FFFFFF").slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF;
      return "#"+(0x1000000+(u(((t>>16)-R1)*n)+R1)*0x10000+(u(((t>>8&0x00FF)-G1)*n)+G1)*0x100+(u(((t&0x0000FF)-B1)*n)+B1)).toString(16).slice(1)
    }
  };

  ns.selected = null;
  ns.clickNode = function(event) {
    var node = event.data.node;
    var bol = (ns.selected == node.id);
    if (ns.selected) ns.unclickNode(event, !bol);
    if (bol) return;
    ns.selected = node.id;
    var toKeep = ns.sigma.graph.neighbors(node.id);
    toKeep[node.id] = node;
    ns.sigma.graph.nodes().forEach(function(n) {
      if (!toKeep[n.id]) {
        n.color0 = n.color;
        n.color = ns.shadeBlend(0.6, n.color0);
      }
    });
    ns.sigma.graph.edges().forEach(function(e) {
      if ((e.source == node.id && toKeep[e.source]) ||
          (e.target == node.id && toKeep[e.target])) {
        e.color = ns.shadeBlend(0.6, node.color);
      } else e.hidden = true;
    });
    ns.sigma.refresh();
  }
  ns.unclickNode = function(event) {
    if (!ns.selected) return;
    ns.selected = null;
    ns.sigma.graph.nodes().forEach(function(n) {
      n.color = n.color0 || n.color;
    });
    ns.sigma.graph.edges().forEach(function(e) {
      e.color = '#EEE';
      e.hidden = false;
    });
    ns.sigma.refresh();
  }

  ns.setResponsive = function(){
    $('#graph').width($(window).width() - 50)
               .height($(window).height() - 50);
  };

  $(window).resize(ns.setResponsive);

  $(document).ready(function(){
    sigma.classes.graph.addMethod('neighbors', function(nodeId) {
      var k, neighbors = {}, index = this.allNeighborsIndex[nodeId] || {};
      for (k in index) neighbors[k] = this.nodesIndex[k];
      return neighbors;
    });

    ns.setResponsive();
    ns.loadGraph($("#graph").hasClass('users') ? 'users_supporters.json' : 'propositions_covoted5+.json');
  });

})(window.networksPJLNum = window.networksPJLNum || {});
