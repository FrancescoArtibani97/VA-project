var xMousePos = 0;
var yMousePos = 0;
var lastScrolledLeft = 0;
var lastScrolledTop = 0;
var foreground;
var background;

//  -------------------------------------------parametri globali che l'utente puo cambiare
YEAR = [2019]
CMD_REGIONS = "only"
REGIONS = []
KIND_OF_TERRITORY = "region"
CMD_CRIMES = "only"
ABSOLUTE = false
CRIMES = []
//per evitare il cross origin
//var dataset_path = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/dataset1219.csv"
var dataset_path = "datasets/dataset_crimes/dataset1219.csv"
//inizializzazione elementi del dom
//fill dropmenu degli anni 
var select = document.getElementById("year");
for (let i = 2012; i < 2020; i++) {
    var el = document.createElement("option");
    el.textContent = i;
    el.value = i;
   // select.appendChild(el);
}


// set the dimensions and margins of the graph
var margin = {top: 50, right: 15, bottom: 15, left: 0},
    width = document.getElementById("my_dataviz").clientWidth+ margin.left + margin.right
    height = document.getElementById("my_dataviz").clientHeight - margin.top - margin.bottom;
    //console.log(width)
// append the svg_PC object to the body of the page
var svg_pc = d3.select("#my_dataviz")
            .append("svg")
            .attr("width", width +margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
var svg_PC = svg_pc.append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");


//quando cambio anno ridisegno l'intera parallel coord.
function changeYear(year){
    svg_PC.selectAll("*").remove();
    if(!YEAR.includes(year)) YEAR.push(year)
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
function changeAbsolute(flag){
    svg_PC.selectAll("*").remove();
    ABSOLUTE = flag
    //document.getElementById("absolute").textContent="absolute: " + ABSOLUTE
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
function changeCmdRegions(cmd){
    svg_PC.selectAll("*").remove();
    CMD_REGIONS = cmd
    //document.getElementById("cmd_region").textContent=CMD_REGIONS
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
function changeKindOfTerritory(newData){
    REGIONS = []
    d3.text(dataset_path, function(raw) {//retrive sum of delicts
        var dsv = d3.dsvFormat(';');
        var data =dsv.parse(raw);
        for (let i = 0; i < data.length; i++) {
            length_name=  (data[i].territorio.substring(0,7).match(/\s/g) || []).length //conta i white spaces: 6 provincie,4regioni, 2macroregioni,0 Italia
            if(newData == 0 && length_name == 6 && !REGIONS.includes(data[i].territorio.trim())){//provinces
                REGIONS.push(data[i].territorio.trim())
                KIND_OF_TERRITORY = "prov"
            }
            if(newData == 1 && length_name == 4 && !REGIONS.includes(data[i].territorio.trim())){//regions
                REGIONS.push(data[i].territorio.trim())
                KIND_OF_TERRITORY = "region"
            }
        }
    })
    //console.log(REGIONS)
    return REGIONS
}
function add_delete_territory(territory){ //when user click on a territory in a map it will be added or deleted from regions
    if(REGIONS.includes(territory.trim())) {
        REGIONS.splice(REGIONS.indexOf(territory.trim()), 1);
        console.log(REGIONS)
    }
    else REGIONS.push(territory)
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
function changeCmdCrimes(){
    sv.selectAll("*").remove();
    if(CMD_CRIMES == "only") CMD_CRIMES = "except"
    else{
    CMD_CRIMES = "only"
    }
    document.getElementById("cmd_crime").textContent=CMD_CRIMES
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
function changeCrimes(crime){
    if(!CRIMES.includes(crime)){
    CRIMES.push(crime.trim())
    }
    sv.selectAll("*").remove();
    CRIMES.forEach( function(r){
    if(CMD_CRIMES == "only") document.getElementById(r).style.color = "green"
    else{
        document.getElementById(r).style.color = "red"
    }
    })
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
    console.log(REGIONS)
}
//filtra il le P.c. con l'anno scelto dall'utente
function filterByYear(year,data){
    const data_filtered = []
    for (let i = 0; i < data.length; i++) {
        year.forEach(function(y){
            if(data[i].anno == ""+y) data_filtered.push(data[i])
        })
    }
    //console.log(data_filtered)
    return data_filtered
} 
//filtra in base al territorio, only fa solo le regioni passate, except fa tutte tranne quelle passate
function filterByRegion(command,regions,data,kindOfTerr){
    //console.log(regions)    
    list_all_territories = []
    for (let i = 0; i < data.length; i++) {
        length_name =  (data[i].territorio.substring(0,7).match(/\s/g) || []).length
        if(kindOfTerr == "prov" && length_name == 6){
            list_all_territories.push(data[i])
        }
        if(kindOfTerr == "region" && length_name == 4){
            list_all_territories.push(data[i])
        }
    }
    data_filtered = []
    //console.log(list_all_territories)
    for (let i = 0; i < list_all_territories.length; i++) {
        const terr = list_all_territories[i];
        for (let r = 0; r < regions.length; r++) {
            if(terr.territorio.trim() == regions[r].trim()){
                data_filtered.push(terr)
            }
        }
    }
    if(command == "only") return data_filtered
    else if(command == "except") return list_all_territories.filter(n => !data_filtered.includes(n)) 
    
    
}

//filtra in base al crimie, only fa solo i crimini passati, except fa tutti tranni quelli passati
function filterByCrime(command,crimes,data){
    
    ////////d3.keys(data[0]) sono le classi ["territorio", "anno", "popolazione",..] della prima riga
    ///////d3.values(data[0]) sono i valori delle classi ["Italia", "2012", "59394207",..] della prima riga
    function filterCrimes(crime){
    if(command == "except"){
        if(crimes.includes(crime)) return false
        return true
    }
    else if(command == "only"){
        if(crimes.includes(crime)) return true
        return false
    }
    }
    
    dimensions = dimensions.filter(filterCrimes)
    //console.log(dimensions)
    
    return dimensions

}


//riempie la select con i nomi delle regioni/citta
function fillRegionSelect(dataset_path){
    d3.text(dataset_path, function(raw) {//retrive sum of delicts
        var dsv = d3.dsvFormat(';');
        var data =dsv.parse(raw);
        var regioni=[]
        for (let i = 0; i < data.length; i++) {
            const region = data[i].territorio.trim();
            if(! regioni.includes(region)) {
            regioni.push(region)
            }
        }
        regioni.sort()
        console.log
        for (let i = 0; i < regioni.length; i++) {
            var el = document.createElement("option");
            region = regioni[i]
            el.textContent = region;
            el.value = region;
            el.id = region;
            document.getElementById("regions").appendChild(el);
            
        }
        })
}

//riempie la select con i nomi dei crimini
function fillCrimeSelect(dimensions){
    var crimes=[]
    dimensions.forEach(function(crime){
    crime = crime.trim()
    if(! crimes.includes(crime)) {
        crimes.push(crime)
    }
    })
    crimes.sort()
    for (let i = 0; i < crimes.length; i++) {
    var el = document.createElement("option");
    crime = crimes[i]
    el.textContent = crime;
    el.value = crime;
    el.id = crime;
    document.getElementById("crimes").appendChild(el);
    
    }
    
}

//fillRegionSelect(dataset_path)


function draw(year,command_regions,regions,command_crimes,crimes,isAbsolute) {
    //clean and retrieve measuremenets
    d3.select("#my_dataviz").selectAll("*").remove();
    margin = {top: 50, right: 15, bottom: 15, left: 0},
    width = document.getElementById("my_dataviz").clientWidth+ margin.left + margin.right
    height = document.getElementById("my_dataviz").clientHeight - margin.top - margin.bottom;
    svg_pc = d3.select("#my_dataviz")
            .append("svg")
            .attr("width", width +margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
    svg_PC = svg_pc.append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");
    //console.log(REGIONS)
    const PCtooltip = d3.select('#PCtooltip');
    d3.text(dataset_path, function(raw) {//retrive sum of delicts
        var dsv = d3.dsvFormat(';');
        var data =dsv.parse(raw);
    
    //fillRegionSelect(data)
        
    data = filterByYear(year, data)
    if(regions.length>0) data = filterByRegion(command_regions, regions, data,KIND_OF_TERRITORY)
    dimensions = d3.keys(data[0]).filter(function(d) { return d != "territorio" && d!= "totale" && d!="anno" && d!= "popolazione"})
    //fillCrimeSelect(dimensions)
    dimensions = filterByCrime(command_crimes,crimes,data)
    //console.log(dimensions)


    //ogni asse verticale delle parallel coo. lo salvo dentro y 
    var y = {}
    for (i in dimensions) {
        var name = dimensions[i]
        y[name] = d3.scaleLinear()
        //d3.extent  returns the minimum and maximum value in an array, in this case i take from the dataset the i-th feature domain
        .domain( d3.extent(data, function(d) {
                
                if(!isAbsolute){
                return +d[name];
                }
                else{
                r = (d[name]/d["popolazione"])*10000
                return +r;
                }
            }))
        .range([height, 0]) ///general height of the graph
    }
    
    //asse x -> it find the best position for each Y axis
    x = d3.scalePoint() //Ordinal ranges can be derived from continuous ranges: ex .domain(["A", "B", "C", "D"]) .range([0, 720]); ---> x("B") == 240
        .domain(dimensions)  ///.domain(["territorio", "anno", "popolazione",..])
        .range([0, document.getElementById("my_dataviz").clientWidth-margin.right])
        //.range([0, Math.min(document.getElementById("my_dataviz").clientWidth-margin.right,99*dimensions.length)])///general width of the graph, varia a seconda di quanti crimini metti
        .padding(0.5);
        //.range([0, (350-11*dimensions.length)*dimensions.length])///general width of the graph, varia a seconda di quanti crimini metti

    console.log(document.getElementById("my_dataviz").clientWidth)
    function path(d) {
        return d3.line()(dimensions.map(function(p) {
        //console.log(x(p))
        //p è il nome del crimine
        //y[p] e x sono le funzioni interpolatrici tra dominio e range, una per asse
        //d[p] è il valore del crimine nella riga d, tipo d = data[i] e p = omicidio, d[p] = 30
        if(!isAbsolute) return [x(p), y[p](d[p])]; 
        else{
            return [x(p), y[p](  (d[p]/d["popolazione"]) *10000)]
        }
        }));
        /////per ogni riga del csv (d), per ogni feature assegno la sua x e le sue y
    }
    //PCtooltip management
    function drawTooltip(regione,anno) {
       if(YEAR.length>1) PCtooltip.html(regione + " " + anno) //Change the content of all tooltip elements:
        else PCtooltip.html(regione)
        var d = document.getElementById('PCtooltip');
        PCtooltip.style('display', 'block');
        d.style.position = "absolute"; 
        d.style.top = event.pageY-500+"px"
        d.style.left = event.pageX+"px"
        d3.selectAll('#PCtooltip').raise().classed("active", true);
    }
    function removeTooltip() {
        if (PCtooltip) PCtooltip.style('display', 'none');
    } 
    // Draw the lines
    //BRUSH
    // Add grey background lines for context.
    background = svg_PC.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", path)
        .style("stroke", "grey")
        .style("stroke-width", "3")
        .style("opacity", 0.5);

    // Add blue foreground lines for focus.
    foreground = svg_PC.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", path)
        .style("stroke", "#0000CD")
        .style("stroke-width", "1.5")
        .style("opacity", 0.9);
    //each
    foreground.attr("name",function(d){
            return d["territorio"]})
        .on("mouseover", function(d) {
            d3.select(this).raise().classed("active", true);
            d3.select(this).style("stroke", "#FF0000")
            drawTooltip(d["territorio"],d["anno"])
            name =d['territorio'].trim();
            if(visualization==0){
                var id =d3.select('#mapProv').selectAll('path').filter(function(d){
                    var terName = d3.select('#'+this['id']).attr('name');
                    return terName == name;  
                });
                showTooltipProv(id,150);
            }
            else{
                var id =d3.select('#mapReg').selectAll('path').filter(function(d){
                    var terName = d3.select('#'+this['id']).attr('name');
                    return terName == name;  
                });
                showTooltipReg(id,150);
            }
        
            //currentColour= id.style('stroke-width')
            id.style('stroke-width','2')
            //HIGHLIGTH MDS POINTS
            d3.select("#regions").selectAll("circle").each(function(d){
                if(name == d){
                    d3.select(this).raise().classed("active", true);
                    d3.select(this).attr("id", "coordination").attr("r","4")
                }
            })
            
        })                
        .on("mouseout", function(d) {
            d3.select("#my_dataviz").selectAll('path').each(function(t){
                if (d3.select(this).attr("name") != null){
                  d3.select(this).style("stroke", "#0000CD")
                }
            })
            //d3.select(this).style("stroke", "#0000CD")
            removeTooltip()
            name =d['territorio'].trim()
            if(visualization==0){
                var id =d3.select('#mapProv').selectAll('path').filter(function(d){
                    var terName = d3.select('#'+this['id']).attr('name');
                    return terName == name;  
                });
            }
            else{
                var id =d3.select('#mapReg').selectAll('path').filter(function(d){
                    var terName = d3.select('#'+this['id']).attr('name');
                    return terName == name;  
                });
            }
            id.style('stroke-width','0.5');
            //DE-HIGHLIGTH MDS POINTS
            d3.select("#regions").selectAll("svg").selectAll("#coordination").each(function(d){
                d3.select(this).attr("id", "null").attr("r","3")
            })
        })
        .on("click", function(d) {
            d3.select("#my_dataviz").selectAll('path').each(function(t){
                if (d3.select(this).attr("name") != null){
                  d3.select(this).style("stroke", "#0000CD")
                }
            })
            d3.select(this).raise().classed("active", true);
            d3.select(this).style("stroke", "#FF0000")
        })

     // Add a group element for each dimension.
     const g = svg_PC.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; });
    
    // Add an axis and title.
   
    g.append("g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        .append("text")
        .style("text-anchor", "start")
        .attr("transform", "rotate(-7)")
        .attr("y", -9)
        .text(function(d) {
            d3.select(this).style("font-size", 10)
            if(d.length > 30) {
                //d3.select(this).attr("transform", "rotate(-5)")
                return d.substring(0,29)
            }
            return d; })
        .on("mouseover", function(d) {
            d3.select(this).text(d)
            //if(d.length > 23) document.getElementById("par-coord").style.border = 'none'
            })
        .on("mouseout", function(d) {
            if(d.length > 30) d3.select(this).text(d.substring(0,29))
            //document.getElementById("par-coord").style.border = '3px solid black'
            })
        .on("click",function(d){
            //CRIMES.splice(CRIMES.indexOf(d),1)
            //draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
            CRIMES.splice(CRIMES.indexOf(d),1)
            $('.selectCrimes').val(CRIMES).trigger('change');
            draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
            computeColourScales()
        })
        .style("fill", "black")
        // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function(d) { 
            d3.select(this).call(y[d].brush = d3.brushY()
                    .extent([[-10,0], [10,height]])
                    .on("brush", brush)           
                    .on("end", brush_end)
                )
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);
        function brush_end(){
            var brushedTerr= brush()
            //francesco brushedTerr.forEach( n => console.log(n.territorio))
        }
        function brush() {  
            var actives = [];
            svg_pc.selectAll(".brush")
              .filter(function(d) {
                    y[d].brushSelectionValue = d3.brushSelection(this);
                    return d3.brushSelection(this);
              })
              .each(function(d) {
                  // Get extents of brush along each active selection axis (the Y axes)
                    actives.push({
                        dimension: d,
                        extent: d3.brushSelection(this).map(y[d].invert)
                    });
              });
            var selected = [];
            //console.log(actives)
            // Update foreground to only display selected values
            foreground.style("display", function(d) {
                let isActive = actives.every(function(active) {
                    var result
                    if(!isAbsolute){
                        result = active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0];
                    }
                    else{
                        result = active.extent[1] <= (d[active.dimension]/d["popolazione"])*10000 && (d[active.dimension]/d["popolazione"])*10000 <= active.extent[0];
                    }
                    return result;
                });
                // Only render rows that are active across all selectors
                if(isActive) selected.push(d);
                return (isActive) ? null : "none";
            });
            return selected
        }
    })        
}
function updLeg(){if(legC==0) {legC+=1;console.log('iii'); return null;}
                  else  return updateLegend( split(d3.select('#mapReg').attr('minMax')) )}
(function(){
  var lastWidth = 0;
  function pollZoomFireEvent() {
    var widthNow = jQuery(window).width();
    if (lastWidth == widthNow) return;
    lastWidth = widthNow;
    // Length changed, user must have zoomed, invoke listeners.
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
  }
  setInterval(pollZoomFireEvent, 100);
})();
