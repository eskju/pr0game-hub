window.anonymizeBattleReport = function() {
    $("head").append('<style>.anonymize { filter: blur(5px); }</style>');
    $("body").html($("body").html().replace(/\[([0-9]{1,3})\:([0-9]{1,3})\:([0-9]{1,3})\]/g,'[<span class="anonymize">$1:$2:$3</span>]'));

    var cells = $('td');
    cells.each(function(key, obj) {
        $(obj).html($(obj).html().replace(/([0-9]{3,})\%/g,' <span class="anonymize">$1%</span>'));
    });

    var rounds = $("body").html().split('<hr>');
    var roundCount = rounds.length;
    var returnHtml = '';
    for(var i = 0; i < roundCount; i++) {
        if(i === 0) {
            returnHtml += rounds[i];
        }

        if(i === roundCount - 1 && roundCount > 1) {
            //returnHtml += '<hr>';
            returnHtml += '<div style="margin: 20px auto; text-align: center"><img style="border-radius: 0; width: 600px" src="https://pr0game-hub.eskju.net/ff_transparent.png"></div>';
            //returnHtml += '<hr>';
            returnHtml += rounds[i];
        }
    }

    $("body").html(returnHtml);
    $('#anonymize').remove();
};
