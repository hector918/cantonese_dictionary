
function on_server_upgrade(req, res, head) {
    console.log('UPGRADE:', req.url)
}
function on_server_error(err){
    console.error(err);
}
function wss_server_event_hanger(server){

    server.on("upgrade",on_server_upgrade);
    server.on("error",on_server_error);
}
//////////////////////////////////////////////////////////////////////
function on_socket_connection(wss,req){
    wss.send("welcome");
}
function on_socket_message(data){
    console.log(data);
}
function wss_socket_event_hanger(websocket){
    websocket.on('connection', on_socket_connection);
    websocket.on('message', on_socket_message);
}

module.exports = {
    wss_server_event_hanger,
    wss_socket_event_hanger
}