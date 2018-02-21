'use strict' 

const fs = require('fs');
let dir = 'D:\\SHACL\\';
let ids = [];
let shapes = [];
let capObject = {};
fs.readdir(dir, (err, files) => {
	let json = "";
    files.filter(f => f.endsWith('.jsonld'))
         .forEach(f => {
             let data = fs.readFileSync(dir + f, 'UTF-8');
             json = JSON.parse(data);
			 //console.log(json);
		 for (var i = 0, j= 0; i < (json["@graph"]).length; i++, j++) {
				 shapes[j] = json['@graph'][i];
				 ids[j] = shapes[j]["@id"];	 
				 //console.log(shapes[j]);
			 }		
             getCapabilityNode(shapes);	 	
             processCapabilityNode(shapes, capabilityNode)	;		 

         });
});
let capabilityNode = "";
let interactionsListNode = "";
let capabilityDomainNode = "";
function getCapabilityNode(shapes){
	var capabilityShape = {};
	 for (var j= 0; j < shapes.length; j++) {
		 //console.log(shapes[j]);
		 if(shapes[j]["sh:path"]){
		 if(shapes[j]["sh:path"]["@id"] == "http://iotschema.org/providesInteractionPattern"){
			interactionsListNode = shapes[j]["@id"];
			console.log("1: "+interactionsListNode);
		 }}
	 } 
	 for (var k= 0; k < shapes.length; k++) {
		 if(shapes[k]["sh:property"]){
			 for(var m= 0; m < shapes[k]["sh:property"].length; m++){
			  if(shapes[k]["sh:property"][m]["@id"] == interactionsListNode){
				 capabilityNode = shapes[k]["@id"];
				 console.log("2: "+capabilityNode);
				 capabilityShape = shapes[k];
		      }
			}
		 }
	}
	for(var m= 0; m < capabilityShape["sh:property"].length; m++){
    if(capabilityShape["sh:property"][m]["@id"] != interactionsListNode){
	 capabilityDomainNode = capabilityShape["sh:property"][m]["@id"];
	 console.log("3: "+capabilityDomainNode);
  }
}
	
    return capabilityNode;	
}

function processCapabilityNode(shapes, capabilityNode){
	var jsonData = {};
	console.log();
	jsonData["name"] = capabilityNode.slice(capabilityNode.lastIndexOf("/")+1);
	jsonData["@type"] = [];
	jsonData["@type"][0] = "Thing";
	jsonData["@type"][1] = capabilityNode; 			
	jsonData["interactions"]= [];
/*	for (var i = 0, j= 0; i < (expression.valueExpr.values).length; i++, j++) {
		patterns[j] = expression.valueExpr.values[i];
		for(var k = 0; k < ids.length; k++){
			if(patterns[j] == ids[k]){ 
				jsonData["interaction"][j]  = processShape(shapes[k]);
			}
		}		
	}
	var tdString = JSON.stringify(jsonData);
	tdString = tdString.replace(/\\/g, "");
	result = tdString;
	createResult(context, tdString);	*/
	jsonData["interactions"] = processInteractions(shapes, interactionsListNode);
	console.log("TD");
	console.log(jsonData);
	//getDomain(shapes, capabilityDomainNode);
}

let interactionIds = [];
function processInteractions(shapes, interactionsListNode){
	var jsonData = [];
	for (var j= 0; j < shapes.length; j++) {
		if(shapes[j]["@id"] == interactionsListNode){
			var interaction = {};
			for(var k = 0, m = 0, i = 0; k < shapes[j]["sh:in"]["@list"].length; k++, m++, i++){
				interactionIds[m] = shapes[j]["sh:in"]["@list"][k]["@id"];
				console.log(interactionIds[m]);
				interaction = processInteraction(interactionIds[m]);
				//console.log("interaction");
				//console.log(interaction);
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
		//console.log("4: "+interactionid);
    if(shapes[j]["sh:targetClass"]){
      if(shapes[j]["sh:targetClass"]["@id"] == interactionid){
		jsonData["name"] = interactionid.slice(capabilityNode.lastIndexOf("/")+1);
		jsonData["@type"] = interactionid;
		if(shapes[j]["sh:property"]["@id"]){
			interactionProperties[0] = shapes[j]["sh:property"]["@id"];
			//console.log("interaction properties: "+interactionProperties[0]);
			var property = {};
			property = processInteractionProperties(interactionProperties[0]);
			//console.log("HERE");
			//console.log(JSON.stringify(property));
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
			//console.log("interaction properties: "+interactionProperties[m]);
			var property = processInteractionProperties(interactionProperties[m]);
			if(JSON.stringify(property).includes("inputData")){
				jsonData["inputData"] = {};
				jsonData["inputData"] = property["inputData"];
			}else if(JSON.stringify(property).includes("outputData")){
				jsonData["outputData"] = {};
				jsonData["outputData"] = property["outputData"];
			}
		}}
        //console.log(jsonData);
      j=0;
	  break;
	  }
	  }
	}
	return jsonData;
}

function processInteractionProperties(interactionProps){
	var jsonData = {};
	//jsonData["name"] = interactionProps.slice(interactionProps.lastIndexOf("/")+1);
 	for (var j= 0; j < shapes.length; j++) {
     if(shapes[j]["@id"] == interactionProps){
		 
		 if(shapes[j]["sh:path"]["@id"] == "http://iotschema.org/acceptsInputData"){
			 jsonData["inputData"] = {};
			 var interactionDataNode = shapes[j]["sh:in"]["@list"][0]["@id"];
			 //console.log("data: "+interactionDataNode);
			 var data = getInteractionDataNode(interactionDataNode);
			 jsonData["inputData"] = data;
			 
		 }
		 else if(shapes[j]["sh:path"]["@id"] == "http://iotschema.org/providesOutputData"){
             jsonData["outputData"] = {};
			 var interactionDataNode = shapes[j]["sh:in"]["@list"][0]["@id"];
			// console.log("data: "+interactionDataNode);	
			 var data = getInteractionDataNode(interactionDataNode);	
              jsonData["outputData"] = data;			 
		 }
	 }
		
	}	
	//console.log("HERE");
	//console.log(jsonData);
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
	//console.log("enum");
    for(var j = 0, i = 0; j < dataNode["sh:in"]["@list"].length; i++, j++){
		list[i] = dataNode["sh:in"]["@list"][j]["@id"];
	}	
	jsonData = generateEnum(id, list);
	//console.log("JSON Schema Data");
	//console.log(jsonData);
	}else if(dataNode["sh:datatype"] && (dataNode["sh:minInclusive"] || dataNode["sh:maxInclusive"] ||dataNode["sh:minExclusive"] ||dataNode["sh:maxExclusive"])){
     	jsonData = generateNumericData(id, dataNode);	
	//	console.log("numeric type");
		//console.log(jsonData);
	}else if(dataNode["sh:datatype"] && (dataNode["sh:minCount"] || dataNode["sh:maxCount"])){
     	jsonData = generateArrayData(id, dataNode);	
		//console.log(jsonData);
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
	if(dataNode["sh:datatype"]["@id"] == "xsd:integer" || dataNode["sh:datatype"]["@id"] == "xsd:float"){
	jsonData[id]["properties"]["type"] = "number";
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
	}
	//console.log(JSON.stringify(jsonData));
	return(JSON.stringify(jsonData));
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