'use strict' 

const fs = require('fs');
let dir = 'D:\\Projects//iotschema//SHACL//';
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
	jsonData["name"] = capabilityName.slice(capabilityName.lastIndexOf("/")+1);
	jsonData["@type"] = [];
	jsonData["@type"][0] = "Thing";
	jsonData["@type"][1] = capabilityName; 	
    jsonData["domain"] = getDomain(shapes, capabilityDomainNode);	
	jsonData["interactions"]= [];
	jsonData["interactions"] = processInteractions(shapes, interactionsListNode);
	console.log("TD");
	var tdString = JSON.stringify(jsonData).replace(/\\/g, "");
	console.log(jsonData);
}

let domain = [];
function getDomain(shapes, capabilityDomainNode){
	for (var j= 0; j < shapes.length; j++) {
		if(shapes[j]["@id"] == capabilityDomainNode){
			if(shapes[j]["sh:path"]){
				if(shapes[j]["sh:path"]["@id"] == "http://iotschema.org/domain"){
			for(var k = 0, d = 0; k < shapes[j]["sh:in"]["@list"].length; k++, d++){
				domain[d] = shapes[j]["sh:in"]["@list"][k]["@id"];
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
		var type1 = interactionid;
		if(shapes[j]["sh:property"]["@id"]){
			interactionProperties[0] = shapes[j]["sh:property"]["@id"];
			var property = {};
			property = processInteractionProperties(interactionProperties[0]);
			if(JSON.stringify(property).includes("inputData")){
				jsonData["inputData"] = {};
				jsonData["inputData"] = JSON.stringify(property["inputData"]);
			}else if(JSON.stringify(property).includes("outputData")){
				jsonData["outputData"] = {};
				jsonData["outputData"] = property["outputData"];
			}
		}
		else{
		for(var k = 0, m = 0; k < shapes[j]["sh:property"].length; k++, m++){
			interactionProperties[m] = shapes[j]["sh:property"][k]["@id"];
			var property = processInteractionProperties(interactionProperties[m]);
			if(JSON.stringify(property).includes("inputData")){
				jsonData["inputData"] = {};
				jsonData["inputData"] = property["inputData"];
			}else if(JSON.stringify(property).includes("outputData")){
				jsonData["outputData"] = {};
				jsonData["outputData"] = property["outputData"];
			}
			else if(JSON.stringify(property).includes("@type")){
				var types = createInteractionTypes(type1, property["@type"]);
				jsonData["@type"] = types; 
			}
		}}
      j=0;
	  break;
	  }
	  }
	}
	return jsonData;
}

function createInteractionTypes(type1, type2){
	var types = [];
	types[0] = getConcept(type1);
	types[1] = getConcept(type2);
	return(JSON.stringify(types));
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
		 values.push(list[i].slice(list[i].lastIndexOf("/")+1));
	 }
	 jsonData[id]["enum"]= values;
	 
	 return(JSON.stringify(jsonData));	
	
}

function generateNumericData(id, dataNode){
	var jsonData = {};
	jsonData[id] = {};
	jsonData[id]["properties"] = {};
	if(dataNode["sh:datatype"]["@id"] == "xsd:integer" || dataNode["sh:datatype"]["@id"] == "xsd:float"
	   || dataNode["sh:datatype"]["@id"] == "xsd:decimal"){
	if(dataNode["sh:datatype"]["@id"] == "xsd:integer"){
	jsonData[id]["properties"]["type"] = "integer";
	}
	else if(dataNode["sh:datatype"]["@id"] == "xsd:float" || dataNode["sh:datatype"]["@id"] == "xsd:double"
	        || dataNode["sh:datatype"]["@id"] == "xsd:decimal"){
	jsonData[id]["properties"]["type"] = "number";
	}
	if(dataNode["sh:minInclusive"]){
	jsonData[id]["properties"]["minimum"] = dataNode["sh:minInclusive"]["@value"];
	//jsonData["properties"][id]["exclusiveMinimum"] = "false" ;
	}
	if(dataNode["sh:maxInclusive"]){
	jsonData[id]["properties"]["maximum"] = dataNode["sh:maxInclusive"]["@value"];
	//jsonData["properties"][id]["exclusiveMinimum"] = "false" ;
	}
	if(dataNode["sh:minExclusive"]){
		jsonData[id]["properties"]["minimum"] = dataNode["sh:minExclusive"]["@value"];
		jsonData[id]["properties"]["exclusiveMinimum"] = true ;
	}
	if(dataNode["sh:maxExclusive"]){
		jsonData[id]["properties"]["maximum"] = dataNode["sh:maxExclusive"]["@value"];
		jsonData[id]["properties"]["exclusiveMaximum"] = true ;
	}
	if(dataNode["schema:unitCode"]){
		jsonData[id]["properties"]["unit"] = getConcept(dataNode["schema:unitCode"]["@id"]);
		
	}
	}
	return(JSON.stringify(jsonData));
}

function getConcept(concept){
	var term = concept.slice(concept.lastIndexOf("/")+1);
	return(term);
}

function generateArrayData(id, dataNode){
	 jsonData[id]["type"]= "array";
	 jsonData[id]["minItems"]= dataNode["sh:minCount"]["@value"];
	 if(shape.expression.max != -1)
	 jsonData[id]["maxItems"]= dataNode["sh:maxCount"]["@value"];
	 jsonData[id]["items"]= {};
	 jsonData[id]["items"]["type"]= dataNode["sh:datatype"]["@id"];
	 return(JSON.stringify(jsonData));
}

let context = [];
function createContext(){
	context.push("https://w3c.github.io/wot/w3c-wot-td-context.jsonld");
	context.push("https://github.com/iot-schema-collab/iotschema/iotschema-context.jsonld");
	return context;
}