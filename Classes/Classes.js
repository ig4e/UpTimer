class Link {
    constructor (url,id) {
        this.url = url;
        this.up = [];
        this.down = [];
        this.all = [];
        this.owner = id;
        this.paused = false;
        this.pausedAt = null;
        this.createdAt = new Date();
        this.totalReq = {
          up:0,
          down:0
        }
    }
}


class Request {
    constructor (ping,time,status,St,bad) { 
        this.time = time;
        this.ping = ping; 
        this.status = status;
        this.bad = bad;
        this.statusText = St;
    }
}

class BlackUser {
    constructor (id,count) { 
        this.id = id;
        this.count = count; 
    }
}

class PrimeUser {
    constructor (id,time,maxL,cds) { 
        this.id = id;
        this.time = time;
        this.maxL = maxL;
        this.cds = cds;
    }
}

module.exports = {
    Link: Link,
    Request : Request,
    BlackUser : BlackUser,
    PrimeUser : PrimeUser
};

