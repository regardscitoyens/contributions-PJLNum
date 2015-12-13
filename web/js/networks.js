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

  ns.contrGraph = false;
  ns.loadGraph = function(filename){
    ns.contrGraph = (filename.indexOf("users") === -1);
    console.log("Downloading data...");
    $.getJSON('data/'+filename).then(function(data){
      console.log("Building network...");
      if (ns.sigma) ns.sigma.kill();
      ns.sigma = new sigma({
        container: 'graph',
        settings: {
          labelThreshold: (ns.contrGraph ? 6 : 4),
          enableHovering: ns.contrGraph,
          singleHover: true,
          minNodeSize: (ns.contrGraph ? 3 : 1),
          maxNodeSize: (ns.contrGraph ? 8 : 10),
          edgeColor: "default",
          borderSize: 1,
          defaultEdgeColor: "#F8F8F8",
          maxEdgeSize: 0.05
        }
      });
      data["nodes"].forEach(function(n){
        ns.sigma.graph.addNode({
          id: n.id,
          label: (ns.contrGraph ? n.attributes.authorName : n.label),
          popup: (ns.contrGraph ? n.label : (n.label || "Citoyen " + n.id)),
          type: n.attributes.type,
          votes: n.attributes.total_votes,
          pro: n.attributes.votes_pro,
          unsure: n.attributes.votes_unsure,
          against: n.attributes.votes_against,
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
          "target": e.target
        });
      });
      console.log("Displaying graph...");
      ns.sigma.bind('clickNode', ns.clickNode).bind('clickStage', ns.unclickNode);
      ns.sigma.bind('overNode', ns.showNodeInfo).bind('outNode', ns.hideNodeInfo);
      $('#zoom').click(ns.zoom);
      $('#unzoom').click(ns.unzoom);
      $('#recenter').click(ns.recenter);
      ns.sigma.refresh();
      ns.drawLegend();
      $("#loader").hide();
      $('.sigma-tools, #desc').show();
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
      e.color = '#F8F8F8';
      e.hidden = false;
    });
    ns.sigma.refresh();
  }

  ns.histoVote = function(type, node){
    var percent = Math.round(1000*node[type]/node.votes)/10 - 0.05,
        str = node[type] + ' ' + type.replace(/pro/, 'pour').replace(/unsure/, 'mitigé').replace('against', 'contre'),
        text = (percent > 20 ? str : (percent > 5 ? node[type] : ''));
    return '<div class="' + type + '" style="width: ' + percent + '%">' + text + '</div>';
  };

  ns.popUp = false;
  ns.showNodeInfo = function(event) {
    var node = event.data.node;
    ns.popUp && ns.popUp.remove();
    console.log(node);
    ns.popUp = $('<div>').html(
      '<p>' + node.popup + '</p>' +
      (node.votes > 0 ? '<small>' + node.votes + " vote" + (node.votes > 1 ? 's' : '') + '</small><br/>' : '') +
      (node.contributions > 0 ? '<small>' + node.contributions + " contribution" + (node.contributions > 1 ? 's' : '') + '</small><br/>' : '') +
      (ns.contrGraph ?
       '<div class="votes">' +
          ns.histoVote('pro', node) +
          ns.histoVote('unsure', node) +
          ns.histoVote('against', node) +
        '</div>'
        : '')
    )
    .attr('id', 'node-info')
    .css({
      'display': 'inline-block',
      'width': (ns.contrGraph ? 350 : 200),
      'min-height': 30,
      'border-radius': 3,
      'padding': 5,
      'margin': '0 0 0 20px',
      'text-align': 'center',
      'background': '#fff',
      'color': '#000',
      'box-shadow': '0 0 4px #666',
      'position': 'absolute',
      'left': (node['cam0:x'] || node['renderer1:x']) - (ns.contrGraph ? 175 : 100),
      'top':  (node['cam0:y'] || node['renderer1:y']) + 15 + $('#desc').outerHeight()
    });
    $('#graph').append(ns.popUp);
  }
  ns.hideNodeInfo = function(event) {
    ns.popUp && ns.popUp.remove();
    ns.popUp = false;
  }

  ns.zoom = function() {
    sigma.misc.animation.camera(
      ns.sigma.camera,
      {ratio: ns.sigma.camera.ratio / 1.25 },
      {duration: 50 }
    );
  };
  ns.unzoom = function() {
    sigma.misc.animation.camera(
      ns.sigma.camera,
      {ratio: ns.sigma.camera.ratio * 1.25 },
      {duration: 50 }
    );
  };
  ns.recenter = function() {
    sigma.misc.animation.camera(
      ns.sigma.camera,
      {x: 0, y: 0, ratio: 1},
      {duration: 150, easing: 'cubicInOut'}
    );
  };

  ns.setResponsive = function(){
    $('#graph').width($(window).width() - 50)
               .height($(window).height() - $('#desc').outerHeight() - 50);
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
