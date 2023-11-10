// svg-default-stage-items.js

var hasStageItemsListenId = undefined;  // switch only one time store activeListenId

function defaultStageHtmlElementsShow(){
/* SVG STAGE, HTML decoration */
    try{
        document.getElementById("divMainAnimationContainer_" + activeListenId).style.display = "inline-block";
        document.getElementById("animatedBackGround_" + activeListenId).style.display = "inline-block";   // svg sky, ocean
        document.getElementById("divSvgBuoy_" + activeListenId).style.display = "inline-block";
        document.getElementById("divSvgIceTux_" + activeListenId).style.display = "inline-block"; // the floe, scholle
        document.getElementById("divSvgScrewHeadTopRight_" + activeListenId).style.display = "inline-block";
        document.getElementById("divSvgScrewHeadTopLeft_" + activeListenId).style.display = "inline-block";
        document.getElementById("divSvgScrewHeadBottomRight_" + activeListenId).style.display = "inline-block";
        document.getElementById("divSvgScrewHeadBottomLeft_" + activeListenId).style.display = "inline-block";
        document.getElementById("divSvgGlasBreakTopRight_" + activeListenId).style.display = "inline-block";
        document.getElementById("divSvgFlatSpeaker_" + activeListenId).style.display = "inline-block";
        document.getElementById("divSvgFlatSpeakerTopRight_" + activeListenId).style.display = "inline-block";
    }
    catch (error) {}
}
;
function colorizeDefaultSvgStageElements(darkBody){
/* target: colorize the SVG stage at day and night conditions, means dark mode pressed or not
 *  clouds and iceBerg move animated within the svg
 *
 * injected extra gradient in svg (means no use of it by default, copied gradient statement back into the svg file),
 *  because stuff not working, id="lgTuxStageOceanColorStopOne" and offset value via javascript,
 * !!!!!!!!!! have to add this to the svg or <g>, since inkscape throws it away, maybe because it is not used actually? create a ticket and burn it
 *	<linearGradient id="lgTuxStageOceanColorNight" x1="459.32" x2="466.57" y1="501.07" y2="231.73" gradientTransform="matrix(1,0,0,2.7448,0,-375.27)" gradientUnits="userSpaceOnUse" xlink:href="#lgTuxStageOceanNightLight">
 *		<stop id="lgTuxStageOceanColorStopOne" style="stop-color:black" offset="0"/>
 *		<stop id="lgTuxStageOceanColorStopTwo" style="stop-color:DarkSlateGray	" offset="1"/>
 *	</linearGradient>
 */
    let tuxStageSky   = document.getElementById('tuxStageSky');
    let tuxStageOcean = document.getElementById('tuxStageOcean');
    let tuxCloudOne   = document.getElementById('tuxCloudOne');
    let tuxCloudTwo   = document.getElementById('tuxCloudTwo');
    let tuxCloudThree = document.getElementById('tuxCloudThree');
    let tuxCloudFour  = document.getElementById('tuxCloudFour');
    let tuxCloudFive  = document.getElementById('tuxCloudFive');
    let tuxCloudOneBigWhite   = document.getElementById('tuxCloudOneBigWhite');
    let tuxCloudTwoBigWhite   = document.getElementById('tuxCloudTwoBigWhite');
    let tuxCloudThreeBigWhite = document.getElementById('tuxCloudThreeBigWhite');
    let tuxCloudFourBigWhite  = document.getElementById('tuxCloudFourBigWhite');
    let tuxIceBerg_1_Layer  = document.getElementById('tuxIceBerg_1_Layer');
    let tuxIceBerg_2_Layer  = document.getElementById('tuxIceBerg_2_Layer');
    let tuxIceBerg_3_Layer  = document.getElementById('tuxIceBerg_3_Layer');
    let tuxIceBerg_4_Layer  = document.getElementById('tuxIceBerg_4_Layer');
    let tuxStageStarsLeft    = document.getElementById('tuxStageStarsLeft');
    let tuxStageStarsRight   = document.getElementById('tuxStageStarsRight');
    let gTuxStageStars   = document.getElementById('gTuxStageStars');
    let starBackGroundPath  = document.getElementById('starBackGroundPath');

    if(darkBody){

        let bodyStyle = window.getComputedStyle(document.body, null);
        tuxStageSky.style.fill   = bodyStyle.backgroundColor;
        tuxStageOcean.style.fill = "url(#lgTuxStageOceanColorNight)"
        tuxCloudOne.style.fill    = bodyStyle.backgroundColor;
        tuxCloudTwo.style.fill    = bodyStyle.backgroundColor;
        tuxCloudThree.style.fill  = bodyStyle.backgroundColor;
        tuxCloudFour.style.fill   = bodyStyle.backgroundColor;
        tuxCloudFive.style.fill   = bodyStyle.backgroundColor;
        tuxCloudOneBigWhite.style.fill    = bodyStyle.backgroundColor;
        tuxCloudTwoBigWhite.style.fill    = bodyStyle.backgroundColor;
        tuxCloudThreeBigWhite.style.fill  = bodyStyle.backgroundColor;
        tuxCloudFourBigWhite.style.fill   = bodyStyle.backgroundColor;
        tuxCloudFiveBigWhite.style.fill   = bodyStyle.backgroundColor;
        tuxIceBerg_1_Layer.style.fill = "hsl(240, 5%," + tuxIceBerg_1_LayerUpDown.update() + "%)";
        tuxIceBerg_2_Layer.style.fill = "hsl(180, 5%," + tuxIceBerg_2_LayerUpDown.update() + "%)";
        tuxIceBerg_3_Layer.style.fill = "hsl(190, 5%," + tuxIceBerg_3_LayerUpDown.update() + "%)";
        tuxIceBerg_4_Layer.style.fill = "hsl(200, 5%," + tuxIceBerg_4_LayerUpDown.update() + "%)";
        gTuxStageStars.style.display = "inline-block";
        starBackGroundPath.style.display = "inline-block";

    } else {

        tuxStageSky.style.fill   = "url(#lgTuxStageSkyColor)";
        tuxStageOcean.style.fill = "url(#lgTuxStageOceanColor)";
        let bodyStyle = window.getComputedStyle(document.body, null);
        tuxEllipse.style.fill = "hsl(240,50%," + tuxEllipseColorUpDown.update() + "%)";
        tuxIceBerg_1_Layer.style.fill = "hsl(240, 50%," + tuxIceBerg_1_LayerUpDown.update() + "%)";
        tuxIceBerg_2_Layer.style.fill = "hsl(180, 50%," + tuxIceBerg_2_LayerUpDown.update() + "%)";
        tuxIceBerg_3_Layer.style.fill = "hsl(190, 35%," + tuxIceBerg_3_LayerUpDown.update() + "%)";
        tuxIceBerg_4_Layer.style.fill = "hsl(200, 35%," + tuxIceBerg_4_LayerUpDown.update() + "%)";
        tuxCloudOne.style.fill = "hsl(240,50%," + tuxCloudOneUpDow.update() + "%)";
        tuxCloudTwo.style.fill = "hsl(240,50%," + tuxCloudTwoUpDow.update() + "%)";
        tuxCloudThree.style.fill = "hsl(240,50%," + tuxCloudThreeUpDow.update() + "%)";
        tuxCloudFour.style.fill = "hsl(240,50%," + tuxCloudFourUpDow.update() + "%)";
        tuxCloudFive.style.fill = "hsl(240,50%," + tuxCloudFourUpDow.update() + "%)";
        tuxCloudOneBigWhite.style.fill   = "#fff";
        tuxCloudTwoBigWhite.style.fill   = "#fff";
        tuxCloudThreeBigWhite.style.fill = "#fff";
        tuxCloudFourBigWhite.style.fill  = "#fff";
        tuxCloudFiveBigWhite.style.fill  = "#fff";
        gTuxStageStars.style.display = "none";
        starBackGroundPath.style.display = "none";
    }
}
;