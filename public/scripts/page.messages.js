window.PageMessages = function () {
    const messages = $($('#messagestable > tbody > tr').get().reverse());
    let message;
    let messageId;
    let dateTime;
    let expeditionType;
    let expeditionSize;
    let headerText;
    let parseResult;
    let galaxy;
    let system;
    let planet;
    let timestamp;
    let coords;
    let labels;
    let values;
    let resources;

    this.colors = new top.Colors();
    const $this = this;

    this.init = function () {
        messages.each(function (key, obj) {
            // spy report
            if ($(obj).find('.spyRaport').length > 0) {
                $this.parseSpyReport(key, obj);
            } else if ($(obj).hasClass('message_head') && $($(obj).find('td')[3]).html().search(/Spionage\-Aktivität/) !== -1) {
                $this.parseEnemySpying(key, obj);
            } else if ($(obj).find('.raportMessage').length > 0) {
                $this.parseBattleReport(key, obj);
            } else if ($(obj).hasClass('message_head') && $($(obj).find('td')[3]).html().search(/Expeditionsbericht/) !== -1) {
                $this.parseExpedition(key, obj);
            }
        });
    }

    this.parseSpyReport = function (key, obj) {
        dateTime = $(messages[key - 1]).find('td:nth-child(2)').html();

        headerText = $(obj).find('.spyRaportHead a').html();
        parseResult = headerText.match(/Spionagebericht von (.*) \[([0-9]+)\:([0-9]+)\:([0-9]+)\] am (.*)/, headerText);
        galaxy = parseResult[2];
        system = parseResult[3];
        planet = parseResult[4];
        timestamp = parseResult[5];
        coords = galaxy + ':' + system + ':' + planet;

        labels = $(obj).find('.spyRaportContainerRow .spyRaportContainerCell:nth-child(2n+1)');
        values = $(obj).find('.spyRaportContainerRow .spyRaportContainerCell:nth-child(2n)');
        resources = {};

        labels.each(function (labelKey, label) {
            resources[($(label).find('a').attr('onclick') || '').match(/\(([0-9]+)\)/)[1]] = getInt($(values[labelKey]).html());
        });

        postJSON('spy-reports', {
            id: parseInt($(obj).attr('class').match(/message\_([0-9]+)/)[1]),
            galaxy: parseInt(parseResult[2]),
            system: parseInt(parseResult[3]),
            planet: parseInt(parseResult[4]),
            timestamp: parseResult[5],
            resources: resources,
            ressVisible: $(obj).html().search(/Rohstoffe/) !== -1,
            shipsVisible: $(obj).html().search(/Schiffe/) !== -1,
            deffVisible: $(obj).html().search(/Verteidigungsanlagen/) !== -1,
            buildingsVisible: $(obj).html().search(/Gebäude/) !== -1,
            researchVisible: $(obj).html().search(/Forschungen/) !== -1
        }, function (response) {
        });
    }

    this.parseBattleReport = function (key, obj) {
        var html = $(obj).html();
        var parseResult = getCoordinates($(obj).find('.raportMessage').html());

        postJSON('battle-reports', {
            report_id: html.match(/(raport|report)\=([^"]{32})/)[2],
            galaxy: parseInt(parseResult[1]),
            system: parseInt(parseResult[2]),
            planet: parseInt(parseResult[3]),
            attacker_lost: getInt(html.match(/Angreifer\: ([\.0-9]+)\</)[1]),
            defender_lost: getInt(html.match(/Verteidiger\: ([\.0-9]+)\</)[1]),
            metal: getInt(html.match(/(reportSteal|raportSteal) element901\"\>([\.0-9]+)\</)[2]),
            crystal: getInt(html.match(/(reportSteal|raportSteal) element902\"\>([\.0-9]+)\</)[2]),
            deuterium: getInt(html.match(/(reportSteal|raportSteal) element903\"\>([\.0-9]+)\</)[2]),
            debris_metal: getInt(html.match(/(reportDebris|raportDebris) element901\"\>([\.0-9]+)\</)[2]),
            debris_crystal: getInt(html.match(/(reportDebris|raportDebris) element902\"\>([\.0-9]+)\</)[2]),
            timestamp: $(messages[key + 1]).find('td:nth-child(2)').html()
        }, function (response) {
        });
    }

    this.parseEnemySpying = function (key, obj) {
        messageId = $(obj).attr('id').replace(/message\_/, '');
        dateTime = $(obj).hasClass('message_head') && $($(obj).find('td')[1]).html();
        const coords = $($(messages[key - 1]).find('td')).html().match(/([0-9]+)\:([0-9]+)\:([0-9]+)/g);

        postJSON('hostile-spying', {
            external_id: messageId,
            date_time: dateTime,
            planet_start_coordinates: coords[0],
            planet_target_coordinates: coords[1]
        }, function () {
        });
    };

    this.parseExpedition = function (key, obj) {
        messageId = $(obj).attr('id').replace(/message\_/, '');
        dateTime = $(obj).hasClass('message_head') && $($(obj).find('td')[1]).html();

        $($(messages[key - 1]).find('td')).html($($(messages[key - 1]).find('td')).html().replace(/Logbuch Nachtrag des Kommunikationsoffiziers: Dieser Bereich des Universums ist wohl noch nicht erkundet worden./, '<span style="color: ' + $this.colors.green() + '"><i class="fa fa-check"></i></span> Logbuch Nachtrag des Kommunikationsoffiziers: Dieser Bereich des Universums ist wohl noch nicht erkundet worden.'));
        $($(messages[key - 1]).find('td')).html($($(messages[key - 1]).find('td')).html().replace(/Logbuch Nachtrag des Kommunikationsoffiziers: Es ist ein erhebendes Gefühl, der Erste in einem unerforschten Sektor zu sein./, '<span style="color: ' + $this.colors.green() + '"><i class="fa fa-check"></i></span> Logbuch Nachtrag des Kommunikationsoffiziers: Es ist ein erhebendes Gefühl, der Erste in einem unerforschten Sektor zu sein.'));
        $($(messages[key - 1]).find('td')).html($($(messages[key - 1]).find('td')).html().replace(/Logbuch Nachtrag des Kommunikationsoffiziers: Es scheint nicht so, als ob jemals ein Mensch in diesem Bereich der Galaxis gewesen wäre./, '<span style="color: ' + $this.colors.red() + '"><i class="fa fa-exclamation-triangle"></i> 25%</span> Logbuch Nachtrag des Kommunikationsoffiziers: Es scheint nicht so, als ob jemals ein Mensch in diesem Bereich der Galaxis gewesen wäre.'));
        $($(messages[key - 1]).find('td')).html($($(messages[key - 1]).find('td')).html().replace(/Logbuch Nachtrag des Kommunikationsoffiziers: Es wurden Anzeichen für die Präsenz anderer Expeditionsflotten gefunden./, '<span style="color: ' + $this.colors.red() + '"><i class="fa fa-exclamation-triangle"></i> 50%</span> Logbuch Nachtrag des Kommunikationsoffiziers: Es wurden Anzeichen für die Präsenz anderer Expeditionsflotten gefunden.'));
        $($(messages[key - 1]).find('td')).html($($(messages[key - 1]).find('td')).html().replace(/Logbuch Nachtrag des Kommunikationsoffiziers: Wenn wir uns zu unsicher fühlen, können wir uns ja mit all den anderen Expeditionen, die hier herum fliegen, zusammen tun./, '<span style="color: ' + $this.colors.red() + '"><i class="fa fa-exclamation-triangle"></i> 75%</span> Logbuch Nachtrag des Kommunikationsoffiziers: Wenn wir uns zu unsicher fühlen, können wir uns ja mit all den anderen Expeditionen, die hier herum fliegen, zusammen tun.'));

        message = $($(messages[key - 1]).find('td')).html();
        expeditionType = 'UNKNOWN';
        expeditionSize = null;

        if (message.match(/Deine Expedition hat einen kleinen Asteroidenschwarm entdeckt, aus dem einige Ressourcen gewonnen werden können./)
            || message.match(/Auf einem abgelegenen Planetoiden wurden einige leicht zugängliche Ressourcenfelder gefunden und erfolgreich Rohstoffe gewonnen./)
            || message.match(/Deine Expedition stieß auf sehr alte Raumschiffwracks einer längst vergangenen Schlacht. Einzelne Komponenten konnte man bergen und recyceln./)
            || message.match(/Die Expedition stieß auf einen radioaktiv verstrahlten Planetoiden mit hochgiftiger Atmosphäre. Jedoch ergaben Scans, dass dieser Planetoid sehr rohstoffhaltig ist. Mittels automatischer Drohnen wurde versucht, ein Maximum an Rohstoffen zu gewinnen./)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-ress">Ress (klein)</span>');
            expeditionType = 'RESOURCE';
            expeditionSize = 'SMALL';
        }

        if (message.match(/Deine Expedition fand einen uralten, voll beladenen, aber menschenleeren Frachterkonvoi. Einige Ressourcen konnten geborgen werden./)
            || message.match(/Auf einem kleinen Mond mit eigener Atmosphäre fand deine Expedition große Rohstoffvorkommen. Die Bodencrews sind dabei diese natürlichen Schätze zu heben./)
            || message.match(/Wir haben einen kleinen Konvoi ziviler Schiffe getroffen, die dringend Nahrung und Medikamente benötigten. Im Austausch dafür erhielten wir eine ganze Menge nützlicher Ressourcen./)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-ress">ress (mittel)</span>');
            expeditionType = 'RESOURCE';
            expeditionSize = 'MEDIUM';
        }

        if (message.match(/Deine Expeditionsflotte meldet den Fund eines riesigen Alien-Schiffswracks. Mit der Technologie konnten sie zwar nichts anfangen, aber das Schiff ließ sich in seine Einzelteile zerlegen und dadurch konnte man wertvolle Rohstoffe gewinnen./)
            || message.match(/Ein Mineraliengürtel um einen unbekannten Planeten enthielt Unmengen an Rohstoffen. Die Expeditionsflotte meldet volle Lager!/)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-ress">ress (groß)</span>');
            expeditionType = 'RESOURCE';
            expeditionSize = 'LARGE';
        }

        if (message.match(/Wir sind auf die Überreste einer Vorgängerexpedition gestoßen! Unsere Techniker schauen, ob sie einige der Wracks wieder Flugfähig bekommen/)
            || message.match(/Wir haben eine verlassene Piratenbasis gefunden. Im Hangar liegen noch einige alte Schiffe. Unsere Techniker schauen nach, ob einige davon noch zu gebrauchen sind./)
            || message.match(/Unsere Expedition fand einen Planeten, der wohl durch anhaltende Kriege fast komplett zerstört wurde. In der Umlaufbahn trieben diverse Schiffswracks. Die Techniker versuchen, einige davon zu reparieren. Vielleicht erhalten wir so auch Information darüber, was hier geschehen ist./)
            || message.match(/Deine Expedition ist auf eine alte Sternenfestung gestoßen, die wohl seit Ewigkeiten verlassen ist. Im Hangar der Festung wurden ein paar Schiffe gefunden. Die Techniker schauen, ob sie einige davon wieder flott bekommen./)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-ships">Schiffe (klein)</span>');
            $($(messages[key - 1]).find('td')).html(message.replace(/([ a-zA-ZüöäÜÖÄß]+)\: ([.0-9]+)/g, '<span style="color: ' + $this.colors.red() + ';">$1: $2</span>'));
            expeditionType = 'FLEET';
            expeditionSize = 'SMALL';
        }

        if (message.match(/Wir haben die Reste einer Armada gefunden. Die Techniker der Expeditionsflotte haben sich sofort auf die halbwegs intakten Schiffe begeben und versuchen, diese wieder instandzusetzen./)
            || message.match(/Unsere Expedition stieß auf eine alte, automatische Schiffswerft. Einige Schiffe sind noch in der Produktionsphase, und unsere Techniker versuchen, die Energieversorgung der Werft wiederherzustellen./)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-ships">Schiffe (mittel)</span>');
            $($(messages[key - 1]).find('td')).html(message.replace(/([ a-zA-ZüöäÜÖÄß]+)\: ([.0-9]+)/g, '<span style="color: ' + $this.colors.red() + ';">$1: $2</span>'));
            expeditionType = 'FLEET';
            expeditionSize = 'MEDIUM';
        }

        if (message.match(/Wir haben einen riesigen Raumschiffsfriedhof gefunden. Einigen Technikern der Expeditionsflotte ist es gelungen, das eine oder andere Schiff wieder in Betrieb zu nehmen./)
            || message.match(/Wir haben einen Planeten mit Resten einer Zivilisation entdeckt. Aus dem Orbit ist noch ein riesiger Raumbahnhof zu erkennen, der als einziges Gebäude noch intakt ist. Einige unserer Techniker und Piloten haben sich auf die Oberfläche begeben um nachzuschauen, ob ein paar der dort abgestellten Schiffe noch zu gebrauchen sind./)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-ships">Schiffe (groß)</span>');
            $($(messages[key - 1]).find('td')).html(message.replace(/([ a-zA-ZüöäÜÖÄß]+)\: ([.0-9]+)/g, '<span style="color: ' + $this.colors.red() + ';">$1: $2</span>'));
            expeditionType = 'FLEET';
            expeditionSize = 'LARGE';
        }

        if (message.match(/Außer einiger kurioser, kleiner Tierchen von einem unbekannten Sumpfplaneten, bringt diese Expedition nichts Aufregendes von ihrer Reise mit./)
            || message.match(/Deine Expedition hat wunderschöne Bilder einer Supernova gemacht. Wirklich neue Erkenntnisse hat diese Expedition jedoch nicht gebracht. Aber man hat gute Chancen auf den Bestes-Bild-Des-Universums-Wettbewerb in diesem Jahr./)
            || message.match(/Ein seltsames Computervirus legte kurz nach Verlassen des Sonnensystems die Navigation lahm. Dies führte dazu, dass die gesamte Expeditionsflotte die ganze Zeit im Kreis flog. Überflüssig zu sagen, dass die Expedition nicht besonders erfolgreich war./)
            || message.match(/Eine Lebensform aus reiner Energie hat dafür gesorgt, dass sämtliche Expeditionsmitglieder tagelang auf die hypnotischen Muster auf den Bildschirmen starrten. Als endlich die Meisten wieder klar im Kopf geworden waren, musste die Expedition aufgrund von akutem Deuterium-Mangel allerdings abgebrochen werden./)
            || message.match(/Nun, zumindest weiß man jetzt, dass rote Anomalien der Klasse 5 nicht nur chaotische Auswirkungen auf die Schiffssysteme haben, sondern auch massive Halluzinationen bei der Crew auslösen können. Viel mehr hat diese Expedition aber nicht gebracht./)
            || message.match(/Trotz der ersten, vielversprechenden Scans dieses Sektors kommen wir leider mit leeren Händen zurück./)
            || message.match(/Vielleicht hätte man den Geburtstag des Captains nicht auf diesem abgelegenen Planeten feiern sollen. Ein fieses Dschungelfieber hat große Teile der Crew gezwungen die Expedition in der Krankenstation zu begleiten. Der akute Personalausfall führte dazu, dass die Expedition scheiterte./)
            || message.match(/Deine Expedition hat, wortwörtlich, mit der Leere des Alls Bekanntschaft gemacht. Es gab nicht einmal einen kleinen Asteroiden, oder Strahlung, oder Partikel, oder irgendetwas, dass diese Expedition aufregend gestaltet hätte/)
            || message.match(/Ein Reaktorfehler des Führungsschiffes hätte beinahe die gesamte Expedition vernichtet. Zum Glück waren die Techniker mehr als fähig und konnten das Schlimmste verhindern. Die Reparatur nahm jedoch soviel Zeit in Anspruch, dass die Expedition unverrichteter Dinge wieder zurückkehrte./)
            || message.match(/Es konnten keine Schiffe repariert werden./)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-nothing">nichts</span>');
            expeditionType = 'NOTHING';
            expeditionSize = null;
        }

        if (message.match(/Eine unvorhergesehene Rückkopplung in den Energiespulen der Antriebsaggregate beschleunigte den Rücksprung der Expedition, so dass sie nun früher als erwartet zurückkehrt. Ersten Meldungen zufolge hat sie jedoch nichts Spannendes zu berichten./)
            || message.match(/Der etwas wagemutige neue Kommandant nutzte ein instabiles Wurmloch, um den Rückflug zu verkürzen – mit Erfolg! Jedoch hat die Expedition selbst keine neuen Erkenntnisse gebracht./)
            || message.match(/Deine Expedition meldet keinen Besonderheiten in dem erforschten Sektor. Jedoch geriet die Flotte beim Rücksprung in einen Sonnenwind. Dadurch wurde der Sprung ziemlich beschleunigt. Deine Expedition kehrt nun etwas früher nach Hause./)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-nothing">nichts (schnell)</span>');
            expeditionType = 'NOTHING_FAST';
            expeditionSize = null;
        }

        if (message.match(/Ein böser Patzer des Navigators führte zu einer Fehlkalkulation beim Sprung der Expedition. Nicht nur landete die Flotte an einem völlig falschen Ort, auch der Rückweg nahm nun erheblich mehr Zeit in Anspruch./)
            || message.match(/Aus bisher unbekannten Gründen, ging der Sprung der Expeditionsflotte völlig daneben. Beinahe wäre man im Herzen einer Sonne herausgekommen. Zum Glück ist man in einem bekannten System gelandet, jedoch wird der Rücksprung länger dauern als ursprünglich gedacht./)
            || message.match(/Das neue Navigationsmodul hat wohl doch noch mit einigen Bugs zu kämpfen. Nicht nur ging der Sprung der Expeditionsflotte in die völlig falsche Richtung, auch wurde das gesamte Deuterium verbraucht, wobei der Sprung der Flotte nur knapp hinter dem Mond des Startplaneten endete. Etwas enttäuscht kehrt die Expedition nun auf Impuls zurück. Dadurch wird die Rückkehr wohl ein wenig verzögert./)
            || message.match(/Deine Expedition geriet in einen Sektor mit verstärkten Partikelstürmen. Dadurch überluden sich die Energiespeicher der Flotte und bei sämtlichen Schiffen fielen die Hauptsysteme aus. Deine Mechaniker konnten das Schlimmste verhindern, jedoch wird die Expedition nun mit einiger Verspätung zurückkehren./)
            || message.match(/Das Führungsschiff deiner Expeditionsflotte kollidierte mit einem fremden Schiff, das ohne Vorwarnung direkt in die Flotte sprang. Das fremde Schiff explodierte und die Schäden am Führungsschiff waren beachtlich. Sobald die gröbsten Reparaturen abgeschlossen sind, werden sich deine Schiffe auf den Rückweg machen, da in diesem Zustand die Expedition nicht fortgeführt werden kann./)
            || message.match(/Der Sternwind eines roten Riesen verfälschte den Sprung der Expedition dermaßen, dass es einige Zeit dauerte, den Rücksprung zu berechnen. Davon abgesehen gab es in dem Sektor, in dem die Expedition herauskam, nichts außer der Leere zwischen den Sternen./)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-nothing">nichts (langsam)</span>');
            expeditionType = 'NOTHING_SLOW';
            expeditionSize = null;
        }

        if (message.match(/Ein paar anscheinend sehr verzweifelte Weltraumpiraten haben versucht, unsere Expeditionsflotte zu kapern./)
            || message.match(/Einige primitive Barbaren greifen uns mit Raumschiffen an, die nicht einmal ansatzweise die Bezeichnung Raumschiff verdient haben. Sollte der Beschuss ernst zu nehmende Ausmaße annehmen, sehen wir uns gezwungen das Feuer zu erwidern./)
            || message.match(/Wir haben ein paar Funksprüche sehr betrunkener Piraten aufgefangen. Anscheinend sollen wir überfallen werden./)
            || message.match(/Wir mussten uns gegen einige Piraten wehren, die zum Glück nicht allzu zahlreich waren./)
            || message.match(/Unsere Expeditionsflotte meldet, dass ein gewisser Moa Tikarr und seine wilde Meute die bedingungslose Kapitulation unserer Flotte verlangen. Sollten sie Ernst machen, werden sie feststellen müssen, dass sich unsere Schiffe durchaus zu wehren wissen./)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-fight">Piraten (klein)</span>');
            expeditionType = 'PIRATES';
            expeditionSize = 'SMALL';
        }

        if (message.match(/Deine Expeditionsflotte hatte ein unschönes Zusammentreffen mit einigen Weltraumpiraten./)
            || message.match(/Wir sind in den Hinterhalt einiger Sternen-Freibeuter geraten! Ein Kampf war leider unvermeidlich./)
            || message.match(/Der Hilferuf, dem die Expedition folgte, stellte sich als böse Falle einiger arglistiger Sternen-Freibeuter heraus. Ein Gefecht war unvermeidlich./)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-fight">Piraten (mittel)</span>');
            expeditionType = 'PIRATES';
            expeditionSize = 'MEDIUM';
        }

        if (message.match(/Die aufgefangenen Signale stammten nicht von Fremdwesen, sondern von einer geheimen Piratenbasis! Die Piraten waren von unserer Anwesenheit in ihrem Sektor nicht besonders begeistert./)
            || message.match(/Die Expeditionsflotte meldet schwere Kämpfe mit nicht-identifizierten Piratenschiffen!/)
            || message.match(/Wir haben gerade eine dringende Nachricht vom Expeditionskommandanten erhalten: "Sie kommen auf uns zu! Sie sind aus dem Hyperraum gesprungen, zum Glück sind es nur Piraten, wir haben also eine Chance, wir werden kämpfen!"/)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-fight">Piraten (groß)</span>');
            expeditionType = 'PIRATES';
            expeditionSize = 'LARGE';
        }

        if (message.match(/Deine Expeditionsflotte hatte einen nicht besonders freundlichen Erstkontakt mit einer unbekannten Spezies./)
            || message.match(/Einige fremdartig anmutende Schiffe haben ohne Vorwarnung die Expeditionsflotte angegriffen!/)
            || message.match(/Unsere Expedition wurde von einer kleinen Gruppe unbekannter Schiffe angegriffen!/)
            || message.match(/Die Expeditionsflotte meldet Kontakt mit unbekannten Schiffen. Die Funksprüche sind nicht entschlüsselbar, jedoch scheinen die fremden Schiffe ihre Waffen zu aktivieren./)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-fight">Aliens (klein)</span>');
            expeditionType = 'ALIENS';
            expeditionSize = 'SMALL';
        }

        if (message.match(/Eine unbekannte Spezies greift unsere Expedition an!/)
            || message.match(/Deine Expeditionsflotte hat anscheinend das Hoheitsgebiet einer bisher unbekannten, aber äußerst aggressiven und kriegerischen Alienrasse verletzt./)
            || message.match(/Die Verbindung zu unserer Expeditionsflotte wurde kurzfristig gestört. Soweit wir die letzte Botschaft richtig entschlüsselt haben, steht die Flotte unter schwerem Feuer – die Aggressoren konnten nicht identifiziert werden./)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-fight">Aliens (mittel)</span>');
            expeditionType = 'ALIENS';
            expeditionSize = 'MEDIUM';
        }

        if (message.match(/Deine Expedition ist in eine Alien-Invasions-Flotte geraten und meldet schwere Gefechte!/)
            || message.match(/Ein großer Verband kristalliner Schiffe unbekannter Herkunft hält direkten Kollisionskurs mit unserer Expeditionsflotte. Wir müssen nun wohl vom Schlimmsten ausgehen./)
            || message.match(/Wir hatten ein wenig Schwierigkeiten, den Dialekt der fremden Rasse richtig auszusprechen. Unser Diplomat nannte versehentlich "Feuer!" statt "Frieden!"./)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-fight">Aliens (groß)</span>');
            expeditionType = 'ALIENS';
            expeditionSize = 'LARGE';
        }

        if (message.match(/Von der Expedition ist nur noch folgender Funkspruch übrig geblieben: Zzzrrt Oh Gott! Krrrzzzzt das zrrrtrzt sieht krgzzzz ja aus wie Krzzzzzzzztzzzz.../)
            || message.match(/Das Letzte, was von dieser Expedition noch gesendet wurde, waren einige unglaublich gut gelungene Nahaufnahmen eines sich öffnenden, schwarzen Loches./)
            || message.match(/Ein Kernbruch des Führungsschiffes führte zu einer Kettenreaktion, die in einer durchaus spektakulären Explosion die gesamte Expedition vernichtete./)
            || message.match(/Die Expeditionsflotte ist nicht mehr aus dem Sprung in den Normalraum zurückgekehrt. Unsere Wissenschaftler rätseln noch immer, was geschehen sein könnte, jedoch scheint die Flotte endgültig verloren zu sein./)
        ) {
            $($(obj).find('td')[3]).html('<span class="badge badge-black-hole">Schwarzes Loch</span>');
            expeditionType = 'BLACK_HOLE';
            expeditionSize = null;
        }

        postJSON('expeditions', {
            external_id: messageId,
            date_time: dateTime,
            type: expeditionType,
            size: expeditionSize,
            message
        }, function () {
        });
    }
};
