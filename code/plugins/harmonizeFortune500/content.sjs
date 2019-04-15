'use strict'

/*
* Create Content Plugin
*
* @param id         - the identifier returned by the collector
* @param options    - an object containing options. Options are sent from Java
*
* @return - your content
*/

function createContent(id, options) {
  let doc = cts.doc(id);

  let source;

  // for xml we need to use xpath
  if(doc && xdmp.nodeKind(doc) === 'element' && doc instanceof XMLDocument) {
    source = doc
  }
  // for json we need to return the instance
  else if(doc && doc instanceof Document) {
    source = fn.head(doc.root);
  }
  // for everything else
  else {
    source = doc;
  }

  return extractInstanceCompany(source);
}
  
/**
* Creates an object instance from some source document.
* @param source  A document or node that contains
*   data for populating a Company
* @return An object with extracted data and
*   metadata about the instance.
*/
function extractInstanceCompany(source) {
  // the original source documents
  let attachments = source;
  // now check to see if we have XML or json, then create a node clone from the root of the instance
  if (source instanceof Element || source instanceof ObjectNode) {
    let instancePath = '/*:envelope/*:instance';
    if(source instanceof Element) {
      //make sure we grab content root only
      instancePath += '/node()[not(. instance of processing-instruction() or . instance of comment())]';
    }
    source = new NodeBuilder().addNode(fn.head(source.xpath(instancePath))).toNode();
  }
  else{
    source = new NodeBuilder().addNode(fn.head(source)).toNode();
  }
  /* These mappings were generated using mapping: fortune500Mapping, version: 3 on 2019-01-27T08:50:30.33832-05:00.*/
  let companyName = !fn.empty(fn.head(source.xpath('//NAME'))) ? xs.string(fn.head(fn.head(source.xpath('//NAME')))) : null;
  let totalRevenue = !fn.empty(fn.head(source.xpath('//REVENUES'))) ? xs.decimal(fn.head(fn.head(source.xpath('//REVENUES')))) : null;
  let totalProfit = !fn.empty(fn.head(source.xpath('//PROFIT'))) ? xs.decimal(fn.head(fn.head(source.xpath('//PROFIT')))) : null;
  //let profitMargin = !fn.empty(fn.head(source.xpath('/profitMargin'))) ? xs.decimal(fn.head(fn.head(source.xpath('/profitMargin')))) : null;
  
  let profitMargin = xs.decimal((totalProfit / totalRevenue) * 100);
  
  let latitude = !fn.empty(fn.head(source.xpath('//LATITUDE'))) ? xs.decimal(fn.head(fn.head(source.xpath('//LATITUDE')))) : null;
  let longitude = !fn.empty(fn.head(source.xpath('//LONGITUDE'))) ? xs.decimal(fn.head(fn.head(source.xpath('//LONGITUDE')))) : null;

  // return the instance object
  return {
    '$attachments': attachments,
    '$type': 'Company',
    '$version': '0.0.1',
    'companyName': companyName,
    'totalRevenue': totalRevenue,
    'totalProfit': totalProfit,
    'profitMargin': profitMargin,
    'latitude': latitude,
    'longitude': longitude
  }
};


function makeReferenceObject(type, ref) {
  return {
    '$type': type,
    '$ref': ref
  };
}

module.exports = {
  createContent: createContent
};

