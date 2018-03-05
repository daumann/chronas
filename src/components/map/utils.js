import { provArea, adjacent } from './data/datadef'
import { relPlus, rulPlus, provinceGeojson } from './data/metadata'
import * as scale from 'd3-scale'

const turf = require('@turf/turf');
const turfUnion = require('@turf/union');
const turfArea = require('@turf/area');

const utils = {

  activeTextFeat: 'political',
  activeAreaFeat: 'political',

  countryIsSetup: false,
  culIsSetup: false,
  relIsSetup: false,
  relGenIsSetup: false,

  rulStops: [],
  relStops: [],

  _scaleLogText: scale.scaleLog()
    .domain([500, 15000])
    .range([0, 700]),

  isTouching: function (array1, array2) {

    for (var i = 0; i < array1.length; i++) {
      for (var j = 0; j < array2.length; j++) {
        if (array1[i] == array2[j]) {
          return true;
        }
      }
    }
    return false;
  },

  getExtrema2: function (fullpts) {

    var minX = [fullpts[0][0][0], fullpts[0][0][1]];
    var minY = [fullpts[0][0][0], fullpts[0][0][1]];
    var maxX = [fullpts[0][0][0], fullpts[0][0][1]];
    var maxY = [fullpts[0][0][0], fullpts[0][0][1]];

    for (var j = 0; j < fullpts.length; j++) {
      for (var i = 0; i < fullpts[j].length; i++) {
        if (minX[0] > fullpts[j][i][0]) minX = [fullpts[j][i][0], fullpts[j][i][1]];
        if (maxX[0] < fullpts[j][i][0]) maxX = [fullpts[j][i][0], fullpts[j][i][1]];
        if (minY[1] > fullpts[j][i][1]) minY = [fullpts[j][i][0], fullpts[j][i][1]];
        if (maxY[1] < fullpts[j][i][1]) maxY = [fullpts[j][i][0], fullpts[j][i][1]];
      }
    }

    return ([minX, minY, maxX, maxY]);
  },

  get_polygon_centroid2: function (fullpts) {
    var pts = [];
    for (var j = 0; j < fullpts.length; j++) {
      for (var k = 0; k < fullpts[j].length; k++) {
        pts.push(fullpts[j][k])
      }
    }

    var twicearea = 0,
      x = 0, y = 0,
      nPts = pts.length,
      p1, p2, f;

    for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
      p1 = pts[i];
      p2 = pts[j];
      f = p1[0] * p2[1] - p2[0] * p1[1];
      twicearea += f;
      x += ( p1[0] + p2[0] ) * f;
      y += ( p1[1] + p2[1] ) * f;
    }
    f = twicearea * 3;
    return [x / f, y / f];

  },

  getCoordsForMultiPolyLine: function (myCoords) {

    var extremas = this.getExtrema2(myCoords);
    var point = this.get_polygon_centroid2(myCoords);

    // max x - min x > max y - min y
    if (extremas[2][0] - extremas[0][0] > extremas[3][1] - extremas[1][1]) {
/*
      currLabelSize = Math.sqrt((  (extremas[0][1] - point[1]) * (extremas[0][1] - point[1])
        + (extremas[0][0] - point[0]) * (extremas[0][0] - point[0]) ))
        +
        Math.sqrt((extremas[2][1] - point[1]) * (extremas[2][1] - point[1])
          + (extremas[2][0] - point[0]) * (extremas[2][0] - point[0]));
*/
      //    minX to  maxX
      return [
        [extremas[0][0], extremas[0][1]],
        [point[0], point[1]],
        [extremas[2][0], extremas[2][1]]
      ];  //angle != 0
    }
    //    minX, minY, maxX, maxY
    else {
/*
      currLabelSize = Math.sqrt((  (extremas[0][1] - point[1]) * (extremas[0][1] - point[1])
        + (extremas[0][0] - point[0]) * (extremas[0][0] - point[0]) ))
        +
        Math.sqrt((extremas[2][1] - point[1]) * (extremas[2][1] - point[1])
          + (extremas[2][0] - point[0]) * (extremas[2][0] - point[0]));
*/
      if (extremas[1][0] - extremas[3][0] < 1) {
        return [
          [extremas[1][0], extremas[1][1]],
          [point[0], point[1]],
          [extremas[3][0], extremas[3][1]]
        ];
      } else {
        return [
          [extremas[3][0], extremas[3][1]],
          [point[0], point[1]],
          [extremas[1][0], extremas[1][1]]
        ];
      }
    }
  }, // probably won't need

  /*
   var textOnCurve = function(fontSize,text,offset,x1,y1,x2,y2,x3,y3,x4,y4){
   // exaggerate x2,y2

   ctx.save();
   ctx.textAlign = "center";
   var widths = [];
   for(var i = 0; i < text.length; i ++){

   var availableLength = Math.sqrt(((x1-x2) * (x1-x2)) + ((y1-y2) * (y1-y2)) )

   ctx.shadowColor = "white";
   ctx.shadowOffsetX = 0;
   ctx.shadowOffsetY = 0;
   ctx.shadowBlur = 7;
   ctx.font = fontSize+"px Tahoma black";

   while ( ctx.measureText(text).width * 1.8 < availableLength && fontSize < 400 ) {
   fontSize++;
   ctx.font = fontSize+"px Tahoma black";
   }

   widths[widths.length] = ctx.measureText(text[i]).width;
   offset = Math.round(availableLength / 2)
   }
   var ch = curveHelper(x1,y1,x2,y2,x3,y3,x4,y4);
   var pos = offset;
   var cpos = 0;

   for(var i = 0; i < text.length; i ++){
   pos += widths[i] / 2;
   cpos = ch.forward(pos);
   ch.tangent(cpos);
   ctx.setTransform(ch.vect.x, ch.vect.y, -ch.vect.y, ch.vect.x, ch.vec.x, ch.vec.y);
   ctx.fillText(text[i],0,0);

   pos += widths[i] / 2;
   }
   ctx.restore();
   },
   */

// helper function locates points on bezier curves.
  curveHelper: function (x1, y1, x2, y2, x3, y3, x4, y4) {
    var tx1, ty1, tx2, ty2, tx3, ty3, tx4, ty4;
    var a,b,c,u;
    var vec,currentPos,currentDist,vec1,vect,quad;
    vec = {x:0,y:0};
    vec1 = {x:0,y:0};
    vect = {x:0,y:0};
    quad = false;
    currentPos = 0;
    currentDist = 0;
    if(x4 === undefined || x4 === null){
      quad = true;
      x4 = x3;
      y4 = y3;
    }
    var estLen = Math.sqrt((x4 - x1) * (x4 - x1) + (y4 - y1) * (y4 - y1));
    var onePix = 1 / estLen;
    function posAtC(c){
      tx1 = x1; ty1 = y1;
      tx2 = x2; ty2 = y2;
      tx3 = x3; ty3 = y3;
      tx1 += (tx2 - tx1) * c;
      ty1 += (ty2 - ty1) * c;
      tx2 += (tx3 - tx2) * c;
      ty2 += (ty3 - ty2) * c;
      tx3 += (x4 - tx3) * c;
      ty3 += (y4 - ty3) * c;
      tx1 += (tx2 - tx1) * c;
      ty1 += (ty2 - ty1) * c;
      tx2 += (tx3 - tx2) * c;
      ty2 += (ty3 - ty2) * c;
      vec.x = tx1 + (tx2 - tx1) * c;
      vec.y = ty1 + (ty2 - ty1) * c;
      return vec;
    }
    function posAtQ(c){
      tx1 = x1; ty1 = y1;
      tx2 = x2; ty2 = y2;
      tx1 += (tx2 - tx1) * c;
      ty1 += (ty2 - ty1) * c;
      tx2 += (x3 - tx2) * c;
      ty2 += (y3 - ty2) * c;
      vec.x = tx1 + (tx2 - tx1) * c;
      vec.y = ty1 + (ty2 - ty1) * c;
      return vec;
    }
    function forward(dist){
      var step;
      helper.posAt(currentPos);

      while(currentDist < dist){
        vec1.x = vec.x;
        vec1.y = vec.y;
        currentPos += onePix;
        helper.posAt(currentPos);
        currentDist += step = Math.sqrt((vec.x - vec1.x) * (vec.x - vec1.x) + (vec.y - vec1.y) * (vec.y - vec1.y));

      }
      currentPos -= ((currentDist - dist) / step) * onePix
      currentDist -= step;
      helper.posAt(currentPos);
      currentDist += Math.sqrt((vec.x - vec1.x) * (vec.x - vec1.x) + (vec.y - vec1.y) * (vec.y - vec1.y));
      return currentPos;
    }

    function tangentQ(pos){
      a = (1-pos) * 2;
      b = pos * 2;
      vect.x = a * (x2 - x1) + b * (x3 - x2);
      vect.y = a * (y2 - y1) + b * (y3 - y2);
      u = Math.sqrt(vect.x * vect.x + vect.y * vect.y);
      vect.x /= u;
      vect.y /= u;
    }
    function tangentC(pos){
      a  = (1-pos)
      b  = 6 * a * pos;
      a *= 3 * a;
      c  = 3 * pos * pos;
      vect.x  = -x1 * a + x2 * (a - b) + x3 * (b - c) + x4 * c;
      vect.y  = -y1 * a + y2 * (a - b) + y3 * (b - c) + y4 * c;
      u = Math.sqrt(vect.x * vect.x + vect.y * vect.y);
      vect.x /= u;
      vect.y /= u;
    }
    var helper = {
      vec : vec,
      vect : vect,
      forward : forward,
    }
    if(quad){
      helper.posAt = posAtQ;
      helper.tangent = tangentQ;
    }else{
      helper.posAt = posAtC;
      helper.tangent = tangentC;
    }
    return helper
  },

  fillCollectionId: function (myId, addTo, postfix) {

    //addto = d3 gActiveCouLabels
    var tmpName = "";
    var groups = {};
    var polyGroups = {};
    var polyArray = [];
    var myColl = {
      "type": "FeatureCollection",
      "features": []
    };
    var myLineColl = {
      "type": "FeatureCollection",
      "features": []
    };

    for (var key in myId) {
      if (postfix == "co") {
        tmpName = "";
        if (rulPlus[key]) tmpName = rulPlus[key][0];
      }
      else if (postfix == "rg") {
        tmpName = key
      }
      else if (postfix == "cu") {
        tmpName = "";
        if (culPlus[key]) tmpName = culPlus[key][0];
      }
      else if (postfix == "e") {
        tmpName = "";
        if (relPlus[key]) tmpName = relPlus[key][0];
      }

      for (var i1 = 1; i1 < myId[key].length; i1++) {
        loop1:
          for (var i2 = 0; i2 < myId[key].length; i2++) {
            for (var i3 = 0; i3 < myId[key][i1].length; i3++) {
              if (i1 != i2 && this.isTouching(adjacent[myId[key][i1][i3]], myId[key][i2])) {
                Array.prototype.push.apply(myId[key][i2], myId[key][i1]);
                myId[key].splice(i1, 1);
                i1--;
                break loop1;
              }
            }
          }
      }

      for (var i1 = 0, tot1 = myId[key].length; i1 < tot1; i1++) {
        for (var i2 = 0, tot2 = myId[key][i1].length; i2 < tot2; i2++) {
          if (groups.hasOwnProperty(key)) {
            if (groups[key][i1] === undefined) {
              groups[key][i1] = [];
              polyGroups[key][i1] = [];
            }
            groups[key][i1].push(provinceGeojson.features[myId[key][i1][i2]].geometry.coordinates[0])
            polyGroups[key][i1].push(provinceGeojson.features[myId[key][i1][i2]])
          }
          else {
            groups[key] = [
              [provinceGeojson.features[myId[key][i1][i2]].geometry.coordinates[0]]
            ];
            polyGroups[key] = [
              [provinceGeojson.features[myId[key][i1][i2]]]
            ];
          }
        }
      }


      for (var i = 0; i < groups[key].length; i++) {  //tmpLength
        //
        // console.debug(i)
        // try {
        //   polyArray.push(turf.union.apply( this, polyGroups[key][i] ));
        //   console.debug("turf, this",turf, this)
        //   console.debug("polyArray",polyArray)
        //   polyArray[polyArray.length-1].properties.n = key
        // }
        // catch (err) {
        //
        // }

        var lineCoordinates = this.getCoordsForMultiPolyLine(groups[key][i])

        var point = {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": lineCoordinates[1]
          },
          "properties": {}
        }

        try {
          // var multiLine = turfUnion.apply( this, polyGroups[key][i] ); // UNION A LOT OF PROVINCES    2000MS (!)
          var multiLine = turf.lineString(lineCoordinates)  // EXTREMACENTROIDLINE    200MS


          //turfUnion.apply( this, polyGroups[key][i] );
          // console.debug(JSON.stringify(polyGroups[key][i]),"->", JSON.stringify(multiLine))
        }
        catch (err) {

        }


        multiLine.properties.n = key
        multiLine.properties.d = this._scaleLogText(turfArea(multiLine)/100000000) //
        myLineColl.features.push(multiLine);

        var angleDeg = Math.atan2(lineCoordinates[2][1] - lineCoordinates[0][1], lineCoordinates[2][0] - lineCoordinates[0][0]) * 180 / Math.PI;
        // var line = turf.lineString(lineCoordinates)
        // point.properties.n = tmpName
        // point.properties.d = Math.round(Math.sqrt(turf.lineDistance(line))) * 10
        // point.properties.ro = -1 * angleDeg

        myColl.features.push(point);
      }
    }

    return [myColl, polyArray, myLineColl]
  },
  /*
   function addAreaFeat(setActiveFeat) {
   activeAreaFeat = setActiveFeat;
   if (setActiveFeat === 'none') {
   $("#provinceAreas").css("visibility", "hidden")
   }
   else {
   $("#provinceAreas").css("visibility", "visible")

   switch (activeAreaFeat) {
   case "country":

   for (var i = 0; i < provinceGeojson.features.length; i++) {
   tmpCountry = "undefined";
   tmpProv = provinceGeojson.features[i].properties.name;

   if (activeYear.hasOwnProperty(tmpProv)) {
   tmpCountry = activeYear[tmpProv][0];
   }


   if (tmpCountry != "undefined")
   provinceGeojson.features[i].properties.Acolor = rulPlus[tmpCountry][1];
   else {
   provinceGeojson.features[i].properties.Acolor = undefinedColor;
   }

   }

   //        activeFeatureCollection = jQuery.extend({}, countriesArea);
   break;
   case "culture":

   for (var i = 0; i < provinceGeojson.features.length; i++) {
   provinceGeojson.features[i].properties.Acolor = (culPlus[provinceGeojson.features[i].properties.Cul] !== undefined) ? culPlus[provinceGeojson.features[i].properties.Cul][1] : undefinedColor;
   }
   //        activeFeatureCollection = jQuery.extend({}, culArea);
   break;
   case "religion":

   for (var i = 0; i < provinceGeojson.features.length; i++) {

   provinceGeojson.features[i].properties.Acolor = (relPlus[provinceGeojson.features[i].properties.Rel] !== undefined) ? relPlus[provinceGeojson.features[i].properties.Rel][1] : undefinedColor;
   }
   break;


   case "religionGeneral":

   for (var i = 0; i < provinceGeojson.features.length; i++) {

   provinceGeojson.features[i].properties.Acolor =
   (relGen[provinceGeojson.features[i].properties.Rel] !== undefined)
   ? relGen[provinceGeojson.features[i].properties.Rel][1]
   : undefinedColor;
   }

   //         activeFeatureCollection = jQuery.extend({}, relArea);
   break;
   case "population":

   var max = 1000;
   for (var i = 0; i < provinceGeojson.features.length; i++) {
   if (provinceGeojson.features[i].properties.Pop > max)
   max = provinceGeojson.features[i].properties.Pop;
   }
   max = Math.log(max / 1000);
   var fraction = 0
   for (var i = 0; i < provinceGeojson.features.length; i++) {
   fraction = Math.log(provinceGeojson.features[i].properties.Pop / 1000) / max;

   provinceGeojson.features[i].properties.Acolor = "rgb(" + Math.round(200 + fraction * 55) + "," + Math.round(200 - fraction * 200) + "," + Math.round(200 - fraction * 200) + ")";
   }
   //         activeFeatureCollection = jQuery.extend({}, popArea);
   break;


   }

   activeAreaFeature
   .style("fill", function (d) {
   return d.properties.Acolor; //._storage_options
   })
   }
   },
   */
  addTextFeat: function (areaDefs, setActiveFeat) {

    this.activeTextFeat = setActiveFeat;

    if ((this.activeTextFeat === "political" && !this.countryIsSetup) ||
      (this.activeTextFeat === "culture" && !this.culIsSetup) ||
      (this.activeTextFeat === "religion" && !this.relIsSetup) ||
      (this.activeTextFeat === "religionGeneral" && !this.relGenIsSetup)) {

      var countryCollection = {};
      var relCollection = {};

      var relGenIdCollection = {};
      var culCollection = {};
      var popCollection = {};

      var tmpProv, tmpCountry, tmpRel, tmpCul, tmpPop, tmpCap, tmpCoo;

      for (var i = 0; i < provinceGeojson.features.length; i++) {  //tmpLength

        tmpCoo = undefined;
        tmpCountry = undefined;
        tmpRel = undefined;
        tmpCul = undefined;
        tmpPop = undefined;
        tmpCap = undefined;

        tmpProv = provinceGeojson.features[i].properties.name;
        tmpCoo = provinceGeojson.features[i].geometry.coordinates[0];


        if (areaDefs.hasOwnProperty(tmpProv)) {
          tmpCountry = areaDefs[tmpProv][0];
          tmpCul = areaDefs[tmpProv][1];
          tmpRel = areaDefs[tmpProv][2];
          tmpCap = areaDefs[tmpProv][3];
          tmpPop = areaDefs[tmpProv][4];

          provinceGeojson.features[i].properties.Cul = tmpCul;
          provinceGeojson.features[i].properties.Rel = tmpRel;
          provinceGeojson.features[i].properties.Pop = tmpPop;
          provinceGeojson.features[i].properties.Cap = tmpCap;

          if (this.activeTextFeat == "political" && rulPlus[tmpCountry]) {
            provinceGeojson.features[i].properties.nameLabel = rulPlus[tmpCountry][0];
          }
          else if (this.activeTextFeat == "religion" && relPlus[tmpCountry]) {
            provinceGeojson.features[i].properties.nameLabel = relPlus[tmpCountry][0];
          }
        }

        if (this.activeTextFeat === "political" && !this.countryIsSetup)
          this.prepareCollectionIDs(countryCollection, tmpCountry, i);
        if (this.activeTextFeat === "culture" && !this.culIsSetup)
          this.prepareCollectionIDs(culCollection, tmpCul, i);
        if (this.activeTextFeat === "religion" && !this.relIsSetup)
          this.prepareCollectionIDs(relCollection, tmpRel, i);
        // if (!relGenIsSetup)
        //     prepareCollectionIDs(relGenIdCollection, relGen[tmpRel][0], i);

      }


      if (!this.countryIsSetup && (this.activeTextFeat === "political")) {
        // this.countryIsSetup = true;
        return this.fillCollectionId(countryCollection, null, "co");
      }
      else if (!this.culIsSetup && (this.activeTextFeat === "culture")) {
        // this.culIsSetup = true;
        return this.fillCollectionId(culCollection, null, "cu");
      }
      else if (!this.relIsSetup && (this.activeTextFeat === "religion")) {
        // this.relIsSetup = true;
        return this.fillCollectionId(relCollection, null, "e");
      } else {
        return []
      }
    }

    // activeLoaded = false;

    return []
  },

  prepareCollectionIDs: function (targetC, attr, provId) {
    if (attr !== "na" && attr != undefined) {
      if (targetC.hasOwnProperty(attr)) {
        if (targetC[attr][0].length == 0 || this.isTouching(targetC[attr][0], adjacent[provId])) {
          targetC[attr][0].push(provId);
        }
        else {
          let it = 1;
          while ((targetC[attr][it] !== undefined) && (!this.isTouching(targetC[attr][it], adjacent[provId]))) {
            it++
          }
          if (targetC[attr][it] === undefined) targetC[attr][it] = [];
          targetC[attr][it].push(provId)
        }
      }
      else {
        targetC[attr] = [
          [provId]
        ];
      }
    }
  },

  updatePercentiles: function (featureCollection, accessor) {
    const {features} = featureCollection;
    features.forEach(f => {
      f.properties.value = accessor(f);
    });
  }

};

export default utils;