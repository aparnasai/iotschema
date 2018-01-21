'use strict' 

const fs = require('fs');
let dir = 'D:\\Projects\\iotschema\\Shape Expressions\\';
let ids = [];
let shapes = [];
let capObject = {};
let result = {};
fs.readdir(dir, (err, files) => {
	let json = "";
    files.filter(f => f.endsWith('.jsonld'))
         .forEach(f => {
          console.log(f);
             let data = fs.readFileSync(dir + f, 'UTF-8');
             json = JSON.parse(data);
			 for (var i = 0, j= 0; i < (json.shapes).length; i++, j++) {
				 shapes[j] = json.shapes[i];
				 ids[j] = shapes[j].id;	 
			 }			 
			 for (var j= 0; j < shapes.length; j++) {
				 processShape(shapes[j]);
				 
			 }
         });
});
function processShape(shape){
	var jsonData = {};
				 //Process complex shape expressions
				 if(shape.shapeExprs){
					jsonData = processShapeExpressions(shape.id, shape.shapeExprs);
                 }//Process EachOf shape
				 else if(shape.expression.type == "EachOf"){
					jsonData = processEachOfNode(shape.id, shape.expression);
				 }//Process TripleConstraints
				 else if(shape.expression.type){
					 if(shape.expression.type == "TripleConstraint"){
						 var id = shape.id;
						jsonData["name"] = id.slice(id.lastIndexOf("/")+1);
						 var tdPredicate = {};
						 if((getConcept(shape.expression.predicate)).includes("acceptsInputData")){
							tdPredicate = "inputData";
						}else if((getConcept(shape.expression.predicate)).includes("providesOutputData")){
							tdPredicate = "outputData";
						} 
						jsonData[tdPredicate] = processTripleConstraint(shape.id, shape.expression);
						jsonData = createInteractionTemplate(shape.id, jsonData);

					 }
				 } else{
					 console.log("continue");
				 }	
				 return JSON.stringify(jsonData);
	
}
function processShapeExpressions(id, shapeExprs){
     var jsonData = {};
	for(var k = 0; k < shapeExprs.length; k++){
		if(shapeExprs[k].expression.type == "TripleConstraint"){
			jsonData = processTripleConstraint(id, shapeExprs[k].expression); 
		}
	}
	return JSON.stringify(jsonData); 
}
function processEachOfNode(id, expression){
    var jsonData = {};
	jsonData["name"] = id.slice(id.lastIndexOf("/")+1);
	var tdPredicate = {};
    for(var k = 0; k < (expression.expressions).length; k++){
		var data = {};
		if(expression.expressions[k].type == "TripleConstraint"){
			data = {};
			var predicate = expression.expressions[k].predicate;
			if((getConcept(predicate)).includes("acceptsInputData")){
				tdPredicate = "inputData";
			}else if((getConcept(predicate)).includes("providesOutputData")){
				tdPredicate = "outputData";
			}
			//jsonData[tdPredicate] = {};

			data = processTripleConstraint(id, expression.expressions[k]); 
	    }
		jsonData[tdPredicate] = data;
    }
	var interaction = createInteractionTemplate(id, jsonData);
	return JSON.stringify(interaction);
}

let count = 0;	
let processedIds = [];
function processTripleConstraint(id, expression){
	var jsonData = {};
	if(expression.type == "TripleConstraint"){
		var patterns = [];
		if(expression.predicate == "http://iotschema.org/providesInterctionPattern"){
			jsonData["name"] = id.slice(id.lastIndexOf("/")+1);
			jsonData["@type"] = [];
            jsonData["@type"][0] = "Thing";
            jsonData["@type"][1] = getConcept(id); 			
			jsonData["interaction"]= [];
			for (var i = 0, j= 0; i < (expression.valueExpr.values).length; i++, j++) {
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
			createResult(context, tdString);
		}
		else if(expression.predicate == "http://iotschema.org/domain"){

		}
		//process complex data types
		else if(expression.predicate == "http://iotschema.org/acceptsInputData" || 
		        expression.predicate == "http://iotschema.org/providesOutputData"){
			if(expression.valueExpr.type == "NodeConstraint"){
				let values = [];
				//if valueExpr is a valueset
				if(expression.valueExpr.values){
			    for (var i = 0, j= 0; i < (expression.valueExpr.values).length; i++, j++) {
					values[j] = expression.valueExpr.values[i];
					jsonData = processInteractionNode(id, expression.predicate,values[j]);
				}
			  }			
			}
		}		
	}
	        processedIds[count] = {};
	        processedIds[count]["id"] = id;
			var value = {};
			value = jsonData;
		processedIds[count]["value"] = value;
        count++;
	return jsonData;	
}

function processedId(id){
	for(var i = 0; i < processedIds.length; i++){
		if(id == processedIds[i]["id"]){
			//console.log("true");
			return true;
			}
		else{
			//console.log("false");
			return false;
			}
	}
}

function processInteractionNode(id, predicate, values){
	
	var jsonData = {};
	var i = 0;
		for(var j = 0; j < ids.length; j++){
			if(values == ids[j]){
			   jsonData  = createJSONSchema(id, ids[j], shapes[j], predicate);
			   i = 1;
			}
		}
		if(i == 0){
			jsonData = getConcept(values);
		}	
		return(JSON.stringify(jsonData));
}

function createInteractionTemplate(id, jsonData){
	jsonData["@type"] = [];
    jsonData["@type"][0] = "Property";
	jsonData["@type"][1] = getConcept(id); 
	if(jsonData.inputData && jsonData.outputData){
		jsonData["writable"] = true;
	}else{
		jsonData["writable"] = false;
	}
	jsonData["link"] = [];
	jsonData["link"][0] = {};
	jsonData["link"][0]["href"] = " ";
	jsonData["link"][0]["mediaType"] = " ";
	
	return JSON.stringify(jsonData);
}

function createJSONSchema(shapeid, id, shape, predicate){

	var jsonData = {};
	predicate = getConcept(predicate);
	var shapeExprs = shape.shapeExprs;
    var dataType = {};
    if(shape.type == "Shape"){
	    //map EachOf shape to JSON Schema eachOf
		if(shape.expression.type == "EachOf"){
		processObjectData(id, shape.expression.expressions, predicate, jsonData);			
	}
	}
	if(shape.type == "ShapeAnd"){
		processObjectData(id, shapeExprs, predicate, jsonData);

	}
	//map data shape with cardinality to JSON Schema array
	else if(shape.expression.min && shape.expression.max){
		processArrayData(shape, predicate, jsonData);
	} // map value sets to JSON Schema enum
	else if(shape.expression.valueExpr){
		if(shape.expression.valueExpr.values != "undefined")
		processValueSetData(shape, predicate, jsonData);
    }
	return jsonData;
}

function processArrayData(shape, predicate, jsonData){
	 jsonData["type"]= "array";
	 jsonData["minItems"]= shape.expression.min;
	 if(shape.expression.max != -1)
	 jsonData["maxItems"]= shape.expression.max;
	 jsonData["items"]= {};
	 jsonData["items"]["type"]= processDataType(shape.expression.valueExpr.datatype);
	 return(JSON.stringify(jsonData));
}

function processValueSetData(shape, predicate, jsonData){
	 jsonData["type"]= "string"; 
	 var values = [];
	 for(var i = 0; i < (shape.expression.valueExpr.values).length; i++ ){
		 values.push(getConcept(shape.expression.valueExpr.values[i]));
	 }
	 jsonData["enum"]= values;
	 
	 return(JSON.stringify(jsonData));	
	
}

function processObjectData(id, shape, predicate, jsonData){

    var id = getConcept(id);
	jsonData["type"] = "object";
	jsonData["properties"] = {};
	jsonData["properties"][id] = {};
	var expression = {};	
	var dataType = {};
	for(var i = 0; i < shape.length; i++){
		if(shape[i].expression){
			expression = shape[i].expression;
		}
		else if(shape[i].type == "TripleConstraint"){
			expression = shape[i];
		}
		if(expression.valueExpr.datatype){
			   dataType = processDataType(expression.valueExpr.datatype);
		}
		if(dataType == "integer" || dataType == "float"){
			jsonData["properties"][id]["type"] = dataType;
			if(expression.valueExpr.mininclusive){
			jsonData["properties"][id]["minimum"] = expression.valueExpr.mininclusive;
			//jsonData["properties"][id]["exclusiveMinimum"] = "false" ;
		}
		else if(expression.valueExpr.maxinclusive){
			jsonData["properties"][id]["maximum"] = expression.valueExpr.maxinclusive;
			//jsonData["properties"][id]["exclusiveMaximum"] = "false" ;
		}
		else if(expression.valueExpr.minexclusive){
			jsonData["properties"][id]["minimum"] = expression.valueExpr.minexclusive;
			jsonData["properties"][id]["exclusiveMinimum"] = true ;
		}
		else if(expression.valueExpr.maxexclusive){
			jsonData["properties"][id]["maximum"] = expression.valueExpr.maxexclusive;
			jsonData["properties"][id]["exclusiveMaximum"] = true ;
		}			
	 } else if(expression.valueExpr.pattern){
		 jsonData["properties"]["type"]= "string";
		 jsonData["properties"]["pattern"] = expression.valueExpr.pattern;
	 }
	}	
	return(JSON.stringify(jsonData));
}
function processDataType(dataType){
	if(dataType == "http://www.w3.org/2001/XMLSchema#float")
		return "float";
	else if(dataType == "http://www.w3.org/2001/XMLSchema#integer")
		return "integer";
	else if(dataType == "http://www.w3.org/2001/XMLSchema#string")
		return "string";		
	
}

function getConcept(concept){
	// ToDo: slice prefix and namespace to it
	//var prefix = getPrefix(concept);
	//prefix = prefix.concat(":");
	var term = concept.slice(concept.lastIndexOf("/")+1);
	//term = prefix.concat(term);
	return(term);
}

/*function getPrefix(term){
	var namespace = term.substring(0,term.lastIndexOf("/"));
	var prefix = namespace.slice(namespace.lastIndexOf("/")+1);
    namespace = namespace.concat("/");
	createPrefix(prefix, namespace);
	return(prefix);
}


function createPrefix(prefix, namespace){
	var term = {};
	prefix = prefix.concat(":");
	term[prefix] = namespace;
	var flag = 0;
	if(context.length >= 1){
	for(var i in context){
		if(JSON.stringify(context[i]) != JSON.stringify(term))
			flag = 1;
	 }
	}
	else{
		flag = 1;
	}
	if(flag == 1){
		context.push(term);
	}
}*/

let context = [];
function createContext(context){
	context.push("https://w3c.github.io/wot/w3c-wot-td-context.jsonld");
	var iotContext = "../iotschema-context.jsonld";
	let data = fs.readFileSync(iotContext, 'UTF-8');
    var json = JSON.parse(data);
	context.push(json["@context"]);
}

function createResult(context, tdString){
	var jsonObject = {};
	createContext(context);
	jsonObject["root"] = tdString;
	jsonObject["@context"] = context;
        var tdString = JSON.stringify(jsonObject).replace(/\\/g, "");
	console.log("Thing Description "+tdString);
}