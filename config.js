module.exports = {

    hostname : '0.0.0.0',
    port : 8080,
    httpsport : 4430,
    debug : true,
    session_prefix : "nodeJsToken",
    CORS_origin : "*",
    log_event : true,
    secret : "dhakd0",
    default_language : "ENG",
    user_multiple_login : false,
    station_restrict : true,
    post_body_limit : 100000,
    mode : "single",
    keys : {
        test : "1234",
    },
    aws_mysql:{
        host:"150.230.113.32",
        port:"3306",
        user:"freeaaaa",
        password:"BGdi16C5OfSUIfanBiTk",
        database:"cantoese_dictionary",
        connectionLimit: 5,
    }

}