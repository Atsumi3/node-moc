var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var redisClient = require('redis').createClient();

// need run to redis server 127.0.0.1:6379
router.get('/first', function(req, res) {
    var timestamp = String(Math.round((new Date()).getTime()));
    var nonce = String(req.query.nonce);
    
    // lecture id
    var lecture = String(Math.floor(Math.random() * 30000));
    
    var has = crypto.createHmac('sha1', timestamp).update(nonce).digest('base64');
    var expectHash = String(crypto.createHmac(
        'sha1',
        String(
            parseInt(timestamp) + parseInt(nonce) + parseInt(lecture)
        )).update(String(has)).digest('base64'));
    
    redisClient.set(
        expectHash,
        "1",
        function(){
            res.send(
            {
                hash:has,
                timestamp:timestamp,
                lecture:lecture
            }
            );
        }
    );
    redisClient.expire(expectHash, 3);
            
});

router.get('/second', function(req, res){
    var hash = String(req.query.hash);
    redisClient.get(hash, function(err, val){
        if(val){
            res.send({
                auth:true,
                timestamp:val
            });
        }else{
            res.send({
                auth:false
            });
        }
    });
});

module.exports = router;