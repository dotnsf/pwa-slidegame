//. api.js

var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    client = require( 'cheerio-httpcli' ),
    fs = require( 'fs' ),
    router = express.Router();
var settings = require( '../settings' );

client.set( 'browser', 'chrome' );
client.set( 'referer', false );

//. https://www.npmjs.com/package/@cloudant/cloudant
var Cloudantlib = require( '@cloudant/cloudant' );
var cloudant = null;
var db = null;

if( !settings.db_host ){
  cloudant = Cloudantlib( { account: settings.db_username, password: settings.db_password } );
}else{
  var url = settings.db_protocol + '://';
  if( settings.db_username && settings.db_password ){
    url += ( settings.db_username + ':' + settings.db_password + '@' );
  }
  url += ( settings.db_host + ':' + settings.db_port );
  cloudant = Cloudantlib( url );
}

if( cloudant ){
  cloudant.db.get( settings.db_name, function( err, body ){
    if( err ){
      if( err.statusCode == 404 ){
        cloudant.db.create( settings.db_name, function( err, body ){
          if( err ){
            db = null;
          }else{
            db = cloudant.db.use( settings.db_name );
          }
        });
      }else{
        db = cloudant.db.use( settings.db_name );
      }
    }else{
      db = cloudant.db.use( settings.db_name );
    }
  });
}

router.use( bodyParser.urlencoded( { extended: true } ) );
router.use( bodyParser.json() );

router.get( '/categories', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var url = 'https://www.irasutoya.com/';
  client.fetch( url, {}, 'UTF-8', function( err, $, res0, body ){
    if( err ){
      res.status( 400 );
      res.write( JSON.stringify( err ) );
      res.end();
    }else{
      var categories = [];
      $('#Label1 .list-label-widget-content ul li a').each( function(){
        var category = { name: $(this).text(), url: $(this).attr( 'href' ) };
        categories.push( category );
      });

      res.write( JSON.stringify( categories ) );
      res.end();
    }
  });
});

router.get( '/category_list', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var url = encodeURI( req.query.url );
  var start = req.query.start;
  if( start ){
    url = url.split( '+' ).join( '%2B' );
    url += '&max-results=20&start=' + start + '&by-date=false';
  }
  //console.log( 'GET /category_list : url = ' + url );

  client.fetch( url, {}, 'UTF-8', function( err, $, res0, body ){
    if( err ){
      res.status( 400 );
      res.write( JSON.stringify( err ) );
      res.end();
    }else{
      //. navi
      var prev_page_url = '';
      var next_page_url = '';

      $('#blog-pager-newer-link a').each( function(){
        prev_page_url = $(this).attr( 'href' );
      });
      $('#blog-pager-older-link a').each( function(){
        next_page_url = $(this).attr( 'href' );
      });

      var list = [];
      $( '#Blog1 .date-outer .box .boxim a script' ).each( function(){
        var script_text = $(this).text();
        var tmp = script_text.split( '"' );
        var img_src = tmp[1];

        img_src = img_src.split( 's72-c' ).join( 's180-c' );

        var name = tmp[3];
        var href = $(this).parent().attr( 'href' );

        var item = { img_src: img_src, href: href, name: name };

        list.push( item );
      });

      res.write( JSON.stringify( { list: list, next: next_page_url } ) );
      res.end();
    }
  });
});

router.get( '/search', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var q = encodeURI( req.query.q );
  var url = 'https://www.irasutoya.com/search?q=' + q;

  client.fetch( url, {}, 'UTF-8', function( err, $, res0, body ){
    if( err ){
      res.status( 400 );
      res.write( JSON.stringify( err ) );
      res.end();
    }else{
      //. navi
      var prev_page_url = '';
      var next_page_url = '';

      $('#blog-pager-newer-link a').each( function(){
        prev_page_url = $(this).attr( 'href' );
      });
      $('#blog-pager-older-link a').each( function(){
        next_page_url = $(this).attr( 'href' );
      });

      var list = [];
      $( '.blog-posts .date-outer .box .boxim a script' ).each( function(){
        var script_text = $(this).text();
        var tmp = script_text.split( '"' );
        var img_src = tmp[1];

        img_src = img_src.split( 's72-c' ).join( 's180-c' );

        var name = tmp[3];
        var href = $(this).parent().attr( 'href' );

        var item = { img_src: img_src, href: href, name: name };

        list.push( item );
      });

      res.write( JSON.stringify( { list: list, next: next_page_url } ) );
      res.end();
    }
  });
});

router.post( '/result', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  //console.log( req.body );
  if( db ){
    //. 作成
    var doc = req.body;
    doc.created = ( new Date() ).getTime();

    db.insert( doc, function( err, body ){
      if( err ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
        res.end();
      }else{
        res.write( JSON.stringify( { status: true, result: body }, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'db is failed to be initialized.' }, 2, null ) );
    res.end();
  }
});

router.get( '/results', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  if( db ){
    db.list( { include_docs: true }, function( err, body ){
      if( err ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
        res.end();
      }else{
        var results = [];
        if( body && body.rows && body.rows.length > 0 ){
          body.rows.forEach( function( result ){
            result.doc.moves = parseInt( result.doc.moves );
            result.doc.seconds = parseInt( result.doc.seconds );
            results.push( result.doc );
          });
        }
        res.write( JSON.stringify( { status: true, results: results }, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'db is failed to be initialized.' }, 2, null ) );
    res.end();
  }
});

module.exports = router;
