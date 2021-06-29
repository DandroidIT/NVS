
import { connect, Model, Trilogy, } from "trilogy";
import * as knex from 'knex';
import fs from "fs";
import { NoLogger } from '../lib/no-logger'
import env_dev from './env_dev';
const logger = new NoLogger('configbase', true)
logger.log('log for configbase')

enum efolder {
  storeCam = 'storecams',
  motion = 'motion',
  video = 'video'
}

class configBase {
  public ip = env_dev.ip
  public port = env_dev.port
  public https = {
    key: fs.readFileSync('./ssl/server_dev.key'),
    cert: fs.readFileSync('./ssl/server_dev.crt')
  };
  public secret = env_dev.secret
  public namedb = env_dev.database
  public folderForCams = efolder
  private _db = new db(this.namedb);
  splitVideoSecond = '10';
  public get db() {
    return this._db;
  }


  private _listCam: Array<model_cams> = [
    { xaddr: "", urn: "", name: "", username: "", password: "" },
  ];
  public get listCam(): Array<model_cams> {
    return this._listCam;
  }

  async loadConfig() {
    const check = await this._db._setupTabs();
    this._listCam = await this._db.tabCams.find();

  }
}
const _users_schema = {
  id: Number,
  username: String,
  password: String,
};
type model_users = {
  id?: Number,
  username: String;
  password: String;
};
const _cams_schema = {
  id: Number,
  urn: String,
  name: String,
  xaddr: String,
  username: String,
  password: String,
};
type model_cams = {
  id?: Number,
  urn: String;
  name: String;
  xaddr: String;
  username: String;
  password: String;
};

const _logallarms_schema = {
  id: Number,
  idcam: String,
  stamptime: String,
  datarif: String,
  msg: String
}

export type model_logallarms = {
  id?: Number,
  idcam: String,
  stamptime: String,
  datarif: String,
  msg: String
}

const _notify_user_schema = {
  id: Number,
  iduser: Number,
  endpoint: String,
  expirationTime: String,
  auth: String,
  p256dh: String,
  insertdata: String,
  enabled: Boolean
}
export type model_notify_user = {
  id?: Number,
  iduser: Number,
  endpoint: String,
  expirationTime: String,
  auth: String,
  p256dh: String,
  insertdata: String,
  enabled: Boolean
}

class db {
  _db: Trilogy;
  private _tabCams!: Model<model_cams>;
  public get tabCams(): Model<model_cams> {
    return this._tabCams;
  }

  private _tabUsers!: Model<model_users>;
  public get tabUsers(): Model<model_users> {
    return this._tabUsers;
  }
  private _tabLogAllarms!: Model<model_logallarms>;
  public get tabLogAllarms(): Model<model_logallarms> {
    return this._tabLogAllarms;
  }

  private _tabNotifyUsers!: Model<model_notify_user>;
  public get tabNotifyUsers(): Model<model_notify_user> {
    return this._tabNotifyUsers;
  }


  dbExist = false;
  _dbName = ''
  constructor(dbname: string) {
    this._dbName = dbname
    this.dbExist = fs.existsSync(`./${this._dbName}`);
    this._db = connect(`./${this._dbName}`, { client: "sql.js" });
  }
  async demoCam() {
    if (!this.dbExist) {
      env_dev.cams.forEach(async cam => {
        await this._tabCams.updateOrCreate(cam, cam)
      })
    }
  }
  async _setupTabs(): Promise<boolean> {
    try {
      this._tabUsers = await this._db.model<model_users>("user", _users_schema, { primary: ['id'] });
      this._tabCams = await this._db.model<model_cams>("cams", _cams_schema, { primary: ['id'] });
      this._tabLogAllarms = await this._db.model<model_logallarms>("logallarms", _logallarms_schema, { primary: ['id'] })
      this._tabNotifyUsers = await this._db.model<model_notify_user>("notifyusers", _notify_user_schema, { primary: ['id'] })
      if (!this.dbExist) {
        await this._tabUsers.create({
          username: "admin",
          password: "123456789",
        });
        await this.demoCam();
      }
      return true;
    } catch (error) {
      logger.err("db -> _setupTabs -> error", error);
      return false;

    }
  }

  async logAlarms_setQuery(query: string, arrParam: Array<any> = [], dist: string = '', column: Array<string> = [], count: string = '') {

    const q = this._db.knex('logallarms').whereRaw(query, arrParam)
    if (dist) {
      q.groupByRaw(dist)
    }
    if (column?.length) {
      q.column(column)
    }
    if (count) {
      q.count(count, { as: count === '*' ? 'count' : `${count}` })
    }
    const logAlarms: model_logallarms[] = await this._db.raw<model_logallarms[]>(q, true)
    logger.log('- logAlarms_setQuery:', `query: ${query} - logAlarms.length: ${logAlarms.length}`)
    return logAlarms
  }
  async logAlarms_test<T>(query: string, arrParam: Array<any> = [], dist: string, column: Array<string> = [], count: string = '') {
    try {
      let q: knex.QueryBuilder = this._db.knex('logallarms').whereRaw(query, arrParam)
      if (dist.length) {
        q.groupByRaw(dist)
      }

      if (column?.length) {
        q.column(column)
      }

      if (count) {
        q.count(count, { as: count === '*' ? 'count' : `${count}` })
      }
      const queryResult = await this._db.raw<T>(q, true)
      logger.log('- logAlarms_test ~ db ~ ', queryResult)

      return queryResult
    } catch (error) {
      logger.err('- logAlarms_test ~ db ~ error', error)
      return undefined
    }

  }
}

export default new configBase();