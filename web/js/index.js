(function(ns){

  ns.showGraph = function(name){
    $('iframe').attr('src', name + '.html');
  };

  ns.setResponsive = function(){
    $('iframe').width($(window).width())
      .height($(window).height() - $("#head").outerHeight() - 10);
  };

  $(window).resize(ns.setResponsive);

  $(document).ready(function(){
    ns.setResponsive();
    $("#contributions").click(function(){
      ns.showGraph('contributions')
    });
    $("#users").click(function(){
      ns.showGraph('users')
    });
  });

})(window.indexPJLNum = window.indexPJLNum || {});
