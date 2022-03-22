// ==UserScript==
// @name         Exchange planet images
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  replace the original planet images with custom URLs
// @author       eichhorn
// @match        http://pr0game.local/game.php*
// @match        https://pr0game.com/game.php*
// @match        https://www.pr0game.com/game.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pr0game.local
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    "use strict";const availableImages=["debris.jpg","dschjungelplanet01.jpg","dschjungelplanet02.jpg","dschjungelplanet03.jpg","dschjungelplanet04.jpg","dschjungelplanet05.jpg","dschjungelplanet06.jpg","dschjungelplanet07.jpg","dschjungelplanet08.jpg","dschjungelplanet09.jpg","dschjungelplanet10.jpg","eisplanet01.jpg","eisplanet02.jpg","eisplanet03.jpg","eisplanet04.jpg","eisplanet05.jpg","eisplanet06.jpg","eisplanet07.jpg","eisplanet08.jpg","eisplanet09.jpg","eisplanet10.jpg","gasplanet01.jpg","gasplanet02.jpg","gasplanet03.jpg","gasplanet04.jpg","gasplanet05.jpg","gasplanet06.jpg","gasplanet07.jpg","gasplanet08.jpg","mond.jpg","normaltempplanet01.jpg","normaltempplanet02.jpg","normaltempplanet03.jpg","normaltempplanet04.jpg","normaltempplanet05.jpg","normaltempplanet06.jpg","normaltempplanet07.jpg","trockenplanet01.jpg","trockenplanet02.jpg","trockenplanet03.jpg","trockenplanet04.jpg","trockenplanet05.jpg","trockenplanet06.jpg","trockenplanet07.jpg","trockenplanet08.jpg","trockenplanet09.jpg","trockenplanet10.jpg","wasserplanet01.jpg","wasserplanet02.jpg","wasserplanet03.jpg","wasserplanet04.jpg","wasserplanet05.jpg","wasserplanet06.jpg","wasserplanet07.jpg","wasserplanet08.jpg","wasserplanet09.jpg","wuestenplanet01.jpg","wuestenplanet02.jpg","wuestenplanet03.jpg","wuestenplanet04.jpg"];if(-1!==document.location.href.search(/\/game.php\?page\=settings/)){let e,t,a="<table><tr><th>Planetenbild</th><th>Planetenbild</th><th>Planetenbild URL (fÃ¼r Eigene)</th></tr>";$("#planetSelector option").each(function(l,n){t=$(n).html().substring($(n).html(),$(n).html().search(/\[/)-1),e=GM_getValue("image_"+t)||"DEFAULT",a+='<tr><td style="text-align: left">'+$(n).html()+'</td><td><select class="planet-image-selector" data-planet-name="'+t+'">',a+='<option value="DEFAULT">Standard-Bild</option>',a+='<option value="CUSTOM" '+(-1!==e.search(/http\:/)?"selected":"")+">Eigenes Bild (URL)</option>",$.each(availableImages,function(t,l){a+='<option value="/styles/theme/nova/planeten/'+l+'" '+("/styles/theme/nova/planeten/"+l===e?"selected":"")+">"+l+"</option>"}),a+='</select></td><td><input class="planet-image-url" data-planet-name="'+t+'" class="planet-image-url" style="width: 100%" value="'+(-1!==e.search(/http\:/)?e:"")+'"></td></tr>'}),a+="</table>",$("content").prepend(a),$(".planet-image-selector").each(function(e,t){$(t).change(function(){GM_setValue("image_"+$(this).attr("data-planet-name"),$(t).val())})}),$(".planet-image-url").each(function(e,t){$(t).change(function(){console.log($(t).val()),GM_setValue("image_"+$(this).attr("data-planet-name"),$(t).val())})})}let altName,planetImageUrl;if($("img").each(function(e,t){(altName=$(t).attr("alt"))&&(planetImageUrl=GM_getValue("image_"+altName))&&$(this).attr("src",planetImageUrl)}),-1!==document.location.href.search(/\/game.php\?page\=imperium/)&&$("content img").each(function(e,t){(altName=$($("#planetSelector option")[e]).html().substring($($("#planetSelector option")[e]).html(),$($("#planetSelector option")[e]).html().search(/\[/)-1))&&(planetImageUrl=GM_getValue("image_"+altName))&&$(this).attr("src",planetImageUrl)}),-1!==document.location.href.search(/\/game.php\?page\=galaxy/)){let e,t,a,l;$("content > table > tbody > tr").each(function(n,p){e=parseInt($($(p).find("td")[0]).html()),t=$("input[name=galaxy]").val()+":"+$("input[name=system]").val()+":"+e,e>=1&&e<=15&&$("#planetSelector option").each(function(e,n){-1!==$(n).html().search(t)&&-1===$(n).html().search(/(Mond|Moon)/)&&(a=$(n).html().substring($(n).html(),$(n).html().search(/\[/)-1),(l=GM_getValue("image_"+a))&&$(p).find("td:nth-child(2) img").attr("src",l)),-1!==$(n).html().search(new RegExp("(Mond|Moon)(.*)"+t))&&(a=$(n).html().substring($(n).html(),$(n).html().search(/\[/)-1),(l=GM_getValue("image_"+a))&&$(p).find("td:nth-child(4) img").attr("src",l))})})}$("#planetSelector option:selected").each(function(e,t){const a=$("#planetSelector option:selected").html().substring($("#planetSelector option:selected").html(),$("#planetSelector option:selected").html().search(/\[/)-1),l=GM_getValue("image_"+a);l&&$(".planetSelectorWrapper img").attr("src",l)}),$(".planeth img").each(function(e,t){const a=$("#planetSelector option:selected").html().substring($("#planetSelector option:selected").html(),$("#planetSelector option:selected").html().search(/\[/)-1),l=GM_getValue("image_"+a);l&&200==$(t).attr("width")&&200==$(t).attr("height")&&$(t).attr("src",l)});
})();