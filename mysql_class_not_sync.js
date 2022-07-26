const mysql = require('mysql');
const util = require('util');
const config = require('./config.js');

function post_log(str)
{
  console.log(str);
}

class mysql_c{
  /*
  conn = null;
  database = null;
  host = "";
  user = "";
  pw = "";
  query = null;
  */
  
  constructor(host,user,password,db) {
    this.host=host;
    this.user=user;
    this.pw=password;
    this.database=db;
    this.connect();
    
    this.query = util.promisify(this.conn.query).bind(this.conn);
    this.rigs_status_result= {};
    this.rigs_list={};
  }
  
  connect(cb)
  {
    try {
      this.conn=mysql.createConnection({
        host: this.host,
        user: this.user,
        password: this.pw,
        database: this.database,
      });
      console.log(this.conn);
      post_log("Connection established");
      
    } catch (error) {
      post_log("mysql error");
      post_log(error);
    }
  }

  
  async connection_state_check(ex)
  {
    //
    console.log(this.conn.state);
    // if(this.connected!=="connected"||this.connected!=="authenticated")
    // {
    //   await this.close_db();
    //   await this.connect();
    // }
  }
  async list_db()
  {
    //
    return await this.query('show databases;');
  }
  async list_tables()
  {
    //
    return await this.query('show tables;');
  }
  async get_one(sql)
  {
    return (await this.query(sql))[0];
  }
  async get_all(sql)
  {
    return (await this.query(sql));
  }
  async list_field(table)
  {
    //
    let result = await this.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'; `);
    
    if(result.length>0)
    {
      let rst = {};
      for(let x of result)
      {
        rst[x['COLUMN_NAME']]=x['COLUMN_NAME'];
      }
      return rst;
    }
    else
    {
      return false;
    }
  }
/*
mysql_c {
  host: 's.amazonaws.com',
  user: '',
  pw: '',
  database: '',
  conn: <ref *1> Connection {
    _events: [Object: null prototype] {},
    _eventsCount: 0,
    _maxListeners: undefined,
    config: ConnectionConfig {
      host: '.amazonaws.com',
      port: 3306,
      localAddress: undefined,
      socketPath: undefined,
      user: 'freeaaaa',
      password: '',
      database: '',
      connectTimeout: 10000,
      insecureAuth: false,
      supportBigNumbers: false,
      bigNumberStrings: false,
      dateStrings: false,
      debug: undefined,
      trace: true,
      stringifyObjects: false,
      timezone: 'local',
      flags: '',
      queryFormat: undefined,
      pool: undefined,
      ssl: false,
      localInfile: true,
      multipleStatements: false,
      typeCast: true,
      maxPacketSize: 0,
      charsetNumber: 33,
      clientFlags: 455631,
      protocol41: true
    },
    _socket: Socket {
      connecting: false,
      _hadError: false,
      _parent: null,
      _host: 'database-1.calgoulufekg.us-east-2.rds.amazonaws.com',
      _readableState: [ReadableState],
      _events: [Object: null prototype],
      _eventsCount: 4,
      _maxListeners: undefined,
      _writableState: [WritableState],
      allowHalfOpen: false,
      _sockname: null,
      _pendingData: null,
      _pendingEncoding: '',
      server: null,
      _server: null,
      timeout: 0,
      [Symbol(async_id_symbol)]: 20,
      [Symbol(kHandle)]: [TCP],
      [Symbol(lastWriteQueueSize)]: 0,
      [Symbol(timeout)]: Timeout {
        _idleTimeout: -1,
        _idlePrev: null,
        _idleNext: null,
        _idleStart: 2681,
        _onTimeout: null,
        _timerArgs: undefined,
        _repeat: null,
        _destroyed: true,
        [Symbol(refed)]: false,
        [Symbol(kHasPrimitive)]: false,
        [Symbol(asyncId)]: 23,
        [Symbol(triggerId)]: 18
      },
      [Symbol(kBuffer)]: null,
      [Symbol(kBufferCb)]: null,
      [Symbol(kBufferGen)]: null,
      [Symbol(kCapture)]: false,
      [Symbol(kSetNoDelay)]: false,
      [Symbol(kSetKeepAlive)]: false,
      [Symbol(kSetKeepAliveInitialDelay)]: 0,
      [Symbol(kBytesRead)]: 0,
      [Symbol(kBytesWritten)]: 0
    },
    _protocol: Protocol {
      _events: [Object: null prototype],
      _eventsCount: 7,
      _maxListeners: undefined,
      readable: true,
      writable: true,
      _config: [ConnectionConfig],
      _connection: [Circular *1],
      _callback: null,
      _fatalError: null,
      _quitSequence: null,
      _handshake: true,
      _handshaked: true,
      _ended: false,
      _destroyed: false,
      _queue: [],
      _handshakeInitializationPacket: [HandshakeInitializationPacket],
      _parser: [Parser],
      [Symbol(kCapture)]: false
    },
    _connectCalled: true,
    state: 'authenticated',
    threadId: 176946,
    [Symbol(kCapture)]: false
  },
  query: [Function: bound query],
*/
  unescape(str)
  {
    return str;
    if(typeof(str)=="string")
    {
      return str.replace(/[^a-zA-Z\d]/g, '');
    }
    else
    {

    }
      
  }

  char_filter(text)
  {
    return text.replace(/[\']*/g,"");
  }
  async affected_rows()
  {
    return await this.mysql_affected_rows();
  }
  async insert(arr,table)
  {
    
    if(arr.length===0)
    {
      return false;
    }
    
    await this.connection_state_check();

    var fields = await this.list_field(table);
    if(!fields)
    {
      return false;
    }

    //生成field name
    let fields_arr =[]; 
    for(let y in arr[0])
    {
      if(fields[y]!=undefined)
      {
        fields_arr.push(y);
      }
    }
    
    //按field name 排列 val
    let val_arr=[];
    for(let x of arr)
    {
      let each_val = [];
      for(let y of fields_arr)
      {
        if(x[y]!==undefined)
        {
          each_val.push(this.char_filter(x[y]));
        }
      }
      val_arr.push( "'" + each_val.join("','") + "'" );
    }
    let sql = `INSERT INTO ${table} (\`${fields_arr.join("`,`")}\`) VALUES (${val_arr.join("),(")});`;

    return await this.query(sql);

  }

  async update(sql,where)
  {
    return (await this.query(sql));
  }
  async target_db(db)
  {
    this.database=db;
    this.query(`USE ${db}`);
      
  }
  async close_db()
  {
    
    await this.end((err) => {
      // The connection is terminated gracefully
      // Ensures all remaining queries are executed
      // Then sends a quit packet to the MySQL server.
      post_log("mysql connection error");
      console.log(err);
    });
  }
}

const mysql_obj = new mysql_c(config.mysql_db_address,config.mysql_db_username,config.mysql_db_pw,config.mysql_db_name);

///////////////////////////////////////////////////////////////

module.exports['mysql_obj_not_sync'] = mysql_obj;