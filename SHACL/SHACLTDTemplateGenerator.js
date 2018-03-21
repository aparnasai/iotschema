'use strict' 

const fs = require('fs');
let dir = 'D:\\Projects//TD-Generator//iotschema//SHACL//';
let ids = [];
let shapes = [];
let capObject = {};
fs.readdir(dir, (err, files) => {
	let json = "";
    files.filter(f => f.endsWith('.jsonld'))
         .forEach(f => {
             let data = fs.readFileSync(dir + f, 'UTF-8');
             json = JSON.parse(data);
		 for (var i = 0, j= 0; i < (json["@graph"]).length; i++, j++) {
				 shapes[j] = json['@graph'][i];
				 ids[j] = shapes[j]["@id"];	 
			 }		
             getCapabilityNode(shapes);	 	
             processCapabilityNode(shapes, capabilityNode)	;		 

         });
});
let capabilityNode = "";
let capabilityName = "";
let interactionsListNode = "";
let capabilityDomainNode = "";
function getCapabilityNode(shapes){
	var capabilityShape = {};
	 for (var j= 0; j < shapes.length; j++) {
		 if(shapes[j]["sh:path"]){
		 if(shapes[j]["sh:path"]["@id"] == "http://iotschema.org/providesInteractionPattern"){
			interactionsListNode = shapes[j]["@id"];
		 }}
	 } 
	 for (var k= 0; k < shapes.length; k++) {
		 if(shapes[k]["sh:property"]){
			 for(var m= 0; m < shapes[k]["sh:property"].length; m++){
			  if(shapes[k]["sh:property"][m]["@id"] == interactionsListNode){
				 capabilityNode = shapes[k]["@id"];
				 capabilityName = shapes[k]["sh:targetClass"]["@id"];
				 capabilityShape = shapes[k];
		      }
			}
		 }
	}
	for(var m= 0; m < capabilityShape["sh:property"].length; m++){
    if(capabilityShape["sh:property"][m]["@id"] != interactionsListNode){
	 capabilityDomainNode = capabilityShape["sh:property"][m]["@id"];
  }
}
	
    return capabilityNode;	
}

function processCapabilityNode(shapes, capabilityNode){
	var jsonData = {};
	jsonData["@context"] = createContext();
	jsonData.name = capabilityName.slice(capabilityName.lastIndexOf("/")+1);
	jsonData["@type"] = [];
	jsonData["@type"][0] = "Thing";
	jsonData["@type"][1] = getConcept(capabilityName); 	
<<<<<<< HEAD
	jsonData["base"] = "";
=======
>>>>>>> 186e1128dd47057dd880c9316cd4214078fc2d75
    jsonData["domain"] = getDomain(shapes, capabilityDomainNode);	
	jsonData["interaction"]= [];
	jsonData["interaction"] = processInteractions(shapes, interactionsListNode);
	console.log("TD");
	var tdString = JSON.stringify(jsonData,null,4);
	//tdString = tdString.replace(\", "");
	console.log(tdString);
}

let domain = [];
function getDomain(shapes, capabilityDomainNode){
	for (var j= 0; j < shapes.length; j++) {
		if(shapes[j]["@id"] == capabilityDomainNode){
			if(shapes[j]["sh:path"]){
				if(shapes[j]["sh:path"]["@id"] == "http://iotschema.org/domain"){
			for(var k = 0, d = 0; k < shapes[j]["sh:in"]["@list"].length; k++, d++){
				domain[d] = getConcept(shapes[j]["sh:in"]["@list"][k]["@id"]);
				}
				
			}	
				
			}
				
		}
	}
	return domain;	
}

let interactionIds = [];
function processInteractions(shapes, interactionsListNode){
	var jsonData = [];
	for (var j= 0; j < shapes.length; j++) {
		if(shapes[j]["@id"] == interactionsListNode){
			var interaction = {};
			for(var k = 0, m = 0, i = 0; k < shapes[j]["sh:in"]["@list"].length; k++, m++, i++){
				interactionIds[m] = shapes[j]["sh:in"]["@list"][k]["@id"];
				interaction = processInteraction(interactionIds[m]);
				jsonData[i]=interaction;
			}
				
		}
	}
	return jsonData;
}

function processInteraction(interactionid){
	var interactionProperties = [];
	var jsonData = {};
	
	for (var j= 0; j < shapes.length; j++) {
    if(shapes[j]["sh:targetClass"]){
      if(shapes[j]["sh:targetClass"]["@id"] == interactionid){
		jsonData["name"] = interactionid.slice(interactionid.lastIndexOf("/")+1);
		jsonData["@type"] = [];
		var data = {};
		var type1 = interactionid;
		var itype = "";
		if(shapes[j]["sh:property"]["@id"]){
			interactionProperties[0] = shapes[j]["sh:property"]["@id"];
			var property = {};
			property = processInteractionProperties(interactionProperties[0]);
			if(JSON.stringify(property).includes("inputData")){
				jsonData["inputSchema"] = {};
				jsonData["inputSchema"] = JSON.stringify(property["inputData"]);
			}else if(JSON.stringify(property).includes("outputData")){
				jsonData["outputSchema"] = {};
				jsonData["outputSchema"] = property["outputData"];
<<<<<<< HEAD
			}else if(JSON.stringify(property).includes("observable")){
				jsonData["observable"] = {};
				jsonData["observable"] = property["observable"];
=======
>>>>>>> 186e1128dd47057dd880c9316cd4214078fc2d75
			}
		}
		else{
		for(var k = 0, m = 0; k < shapes[j]["sh:property"].length; k++, m++){
			
			interactionProperties[m] = shapes[j]["sh:property"][k]["@id"];
			var property = processInteractionProperties(interactionProperties[m]);
<<<<<<< HEAD
			console.log("property "+JSON.stringify(property));
=======
>>>>>>> 186e1128dd47057dd880c9316cd4214078fc2d75
            if(JSON.stringify(property).includes("@type")){
				itype = property["@type"];
				var types = createInteractionTypes(type1, property["@type"]);
				jsonData["@type"] = types; 
			}		
			else if(JSON.stringify(property).includes("inputData")){
				data["inputSchema"] = {};
				data["inputSchema"] = property["inputData"];
			}else if(JSON.stringify(property).includes("outputData")){
				data["outputSchema"] = {};
				data["outputSchema"] = property["outputData"];
<<<<<<< HEAD
			}else if(JSON.stringify(property).includes("observable")){
				console.log("observable "+JSON.stringify(property));
				jsonData["observable"] = {};
				jsonData["observable"] = property["observable"];
=======
>>>>>>> 186e1128dd47057dd880c9316cd4214078fc2d75
			}
		}}
		if(itype.includes("Property") || itype.includes("Event")){
			var w = 0;
			jsonData["schema"] = {};
			if(data["inputSchema"]!= undefined){
			jsonData["schema"] = data["inputSchema"];
			w++;
			}
		    if(data["outputSchema"]!= undefined){
			jsonData["schema"] = data["outputSchema"];
			}
			if(w !=0){
				jsonData["writable"] = true;
			}else{
				jsonData["writable"] = false;
			}
		} else if(itype.includes("Action")){
			jsonData["inputSchema"] = {};
			jsonData["outputSchema"] = {};
			jsonData["inputSchema"] = data["inputSchema"];
			jsonData["outputSchema"] = data["outputSchema"];
			
		}
	jsonData["form"] = [];
	jsonData["form"][0] = {};
<<<<<<< HEAD
	jsonData["form"][0]["href"] = "";
	jsonData["form"][0]["mediaType"] = "";
=======
	jsonData["form"][0]["href"] = " ";
	jsonData["form"][0]["mediaType"] = " ";
>>>>>>> 186e1128dd47057dd880c9316cd4214078fc2d75
      j=0;
	  break;
	  }
	  }
	}
	return jsonData;
}

function createInteractionTypes(type1, type2){
	var types = [];
<<<<<<< HEAD
	types[0] = getConcept(type2);
	types[1] = getConcept(type1);
=======
	types[0] = getConcept(type1);
	types[1] = getConcept(type2);
>>>>>>> 186e1128dd47057dd880c9316cd4214078fc2d75
	return(types);
}

function processInteractionProperties(interactionProps){
	var jsonData = {};
 	for (var j= 0; j < shapes.length; j++) {
     if(shapes[j]["@id"] == interactionProps){
		 
		 if(shapes[j]["sh:path"]["@id"] == "http://iotschema.org/acceptsInputData"){
			 jsonData["inputData"] = {};
			 var interactionDataNode = shapes[j]["sh:in"]["@list"][0]["@id"];
			 var data = getInteractionDataNode(interactionDataNode);
			 jsonData["inputData"] = data;
			 
		 }
		 else if(shapes[j]["sh:path"]["@id"] == "http://iotschema.org/providesOutputData"){
             jsonData["outputData"] = {};
			 var interactionDataNode = shapes[j]["sh:in"]["@list"][0]["@id"];
			 var data = getInteractionDataNode(interactionDataNode);	
              jsonData["outputData"] = data;			 
		 }
		 else if(shapes[j]["sh:path"]["@id"] == "rdfs:subClassOf"){
             jsonData["@type"] = {};
			 var data = shapes[j]["sh:class"]["@id"];	
              jsonData["@type"] = data;			 
		 }
         else if(shapes[j]["sh:path"]["@id"] == "http://iotschema.org/observable"){
             jsonData["observable"] = {};
			 var data = shapes[j]["sh:datatype"];	
              jsonData["observable"] = data;			 
		 }		 
	 }
		
	}	
	return(jsonData);
}

function getInteractionDataNode(interactionDataNode){
	var jsonData = {};
	var dataNode = {};
	var temp = {};
 	for (var j= 0; j < shapes.length; j++) {
        if(shapes[j]["sh:targetClass"]){
		if(shapes[j]["sh:targetClass"]["@id"] == interactionDataNode){
			
			temp = shapes[j]["sh:property"]["@id"];
			break;
		}}
		else{
			
			jsonData = interactionDataNode.slice(interactionDataNode.lastIndexOf("/")+1);
		}
	}
 	for (var j= 0; j < shapes.length; j++) {	
		if(shapes[j]["@id"] == temp){
			dataNode = shapes[j];
			jsonData = generateJSONSchemaData(interactionDataNode, dataNode);
			
			break;
		}
	}	
	return(jsonData);
}

function generateJSONSchemaData(interactionDataNode, dataNode){
	var jsonData = {};
	var id = interactionDataNode.slice(interactionDataNode.lastIndexOf("/")+1);
	if(dataNode["sh:in"]){
     var list = [];
    for(var j = 0, i = 0; j < dataNode["sh:in"]["@list"].length; i++, j++){
		list[i] = dataNode["sh:in"]["@list"][j]["@id"];
	}	
	jsonData = generateEnum(id, list);
	}else if(dataNode["sh:datatype"] && (dataNode["sh:minInclusive"] || dataNode["sh:maxInclusive"] ||dataNode["sh:minExclusive"] ||dataNode["sh:maxExclusive"])){
     	jsonData = generateNumericData(id, dataNode);	
	}else if(dataNode["sh:datatype"] && (dataNode["sh:minCount"] || dataNode["sh:maxCount"])){
     	jsonData = generateArrayData(id, dataNode);	
	}	
	return(jsonData);
	
}

function generateEnum(id, list){
	 var jsonData = {};
	 jsonData[id] = {};
	 jsonData[id]["type"]= "string"; 
	 var values = [];
	 for(var i = 0; i < list.length; i++ ){
		 values.push(getConcept(list[i]));
	 }
	 jsonData[id]["enum"]= values;
	 
	 return(jsonData);	
	
}

function generateNumericData(id, dataNode){
	var jsonData = {};
//	jsonData[id] = {};
//	jsonData["properties"] = {};
	if(dataNode["sh:datatype"]["@id"] == "xsd:integer" || dataNode["sh:datatype"]["@id"] == "xsd:float"
	   || dataNode["sh:datatype"]["@id"] == "xsd:decimal"){
	if(dataNode["sh:datatype"]["@id"] == "xsd:integer"){
	jsonData["type"] = "integer";
	}
	else if(dataNode["sh:datatype"]["@id"] == "xsd:float" || dataNode["sh:datatype"]["@id"] == "xsd:double"
	        || dataNode["sh:datatype"]["@id"] == "xsd:decimal"){
	jsonData["type"] = "number";
	}
	if(dataNode["sh:minInclusive"]){
	if(jsonData["type"] == "integer")
	jsonData["minimum"] = parseInt(dataNode["sh:minInclusive"]["@value"]);
    else if(jsonData["type"] == "number")
	jsonData["minimum"] = parseFloat(dataNode["sh:minInclusive"]["@value"]);
	//jsonData["properties"][id]["exclusiveMinimum"] = "false" ;
	}
	if(dataNode["sh:maxInclusive"]){
	if(jsonData["type"] == "integer")	
	jsonData["maximum"] = parseInt(dataNode["sh:maxInclusive"]["@value"]);
    else if(jsonData["type"] == "number")
	jsonData["maximum"] = parseFloat(dataNode["sh:maxInclusive"]["@value"]);
	//jsonData["properties"][id]["exclusiveMinimum"] = "false" ;
	}
	if(dataNode["sh:minExclusive"]){
		if(jsonData["type"] == "integer")
		jsonData["minimum"] = parseInt(dataNode["sh:minExclusive"]["@value"]);
	    else if(jsonData["type"] == "number")
	    jsonData["minimum"] = parseFloat(dataNode["sh:minExclusive"]["@value"]);
		jsonData["exclusiveMinimum"] = true ;
	}
	if(dataNode["sh:maxExclusive"]){
		if(jsonData["type"] == "integer")
		jsonData["maximum"] = parseInt(dataNode["sh:maxExclusive"]["@value"]);
	    else if(jsonData["type"] == "number")
	    jsonData["maximum"] = parseFloat(dataNode["sh:maxExclusive"]["@value"]);
		jsonData["exclusiveMaximum"] = true ;
	}
	if(dataNode["schema:unitCode"]){
		jsonData["unit"] = getConcept(dataNode["schema:unitCode"]["@id"]);
		
	}
	}
	return(jsonData);
}

function getConcept(concept){
	if(concept.includes("iotschema.org"))
	{	var term = new String(concept.slice(concept.lastIndexOf("/")+1));
        console.log("Term: "+term);
        if(term != "Property" && term != "Event" && term != "Action")
        term = "iot:".concat(term);
	}
	return(term);
}

function generateArrayData(id, dataNode){
	 jsonData[id]["type"]= "array";
	 jsonData[id]["minItems"]= dataNode["sh:minCount"]["@value"];
	 if(shape.expression.max != -1)
	 jsonData[id]["maxItems"]= dataNode["sh:maxCount"]["@value"];
	 jsonData[id]["items"]= {};
	 jsonData[id]["items"]["type"]= dataNode["sh:datatype"]["@id"];
	 return(jsonData);
}

let context = [];
function createContext(){
	context.push("https://w3c.github.io/wot/w3c-wot-td-context.jsonld");
	context.push({"iot": "http://iotschema.org/"});
	return context;
}
