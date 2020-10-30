// Nict NTP Server list
let _serverList = [
    'http://ntp-a1.nict.go.jp/cgi-bin/jsont',
    'http://ntp-b1.nict.go.jp/cgi-bin/jsont'
];

class NTPResult {
    constructor(a_oJson) {
        this.json = a_oJson;
        // local time
        this.lt = (new Date()).getTime();
    }

    getInitiateTime() {
        return this.json.it * 1000;
    }

    getSendTime() {
        return this.json.st * 1000;
    }

    getFixedTime() {
        return this.getSendTime() - (this.lt - this.getInitiateTime()) / 2;
    }

    getOffset() {
        return this.getFixedTime() - this.lt;
    }

    getDate() {
        return new Date(new Date().getTime() + this.getOffset());
    }
}

class NTPDate {
    constructor(a_bAsync) {
        this.isAsync = a_bAsync;
        // for scope
        var self = this;
        // callback jsonp
        window.jsont = function (data) {
            self.result = new NTPResult(data);
        }
        // fetch ntp time
        this.fetchData();
    }

    getServerURL() {
        return _serverList[Math.floor(Math.random() * _serverList.length)]
    }
    
    enableAsync() {
        this.isAsync = true;
    }

    disableAsync() {
        this.isAsync = false;
    }

    fetchData() {
        this.result = undefined;
        if (typeof window.XMLHttpRequest === 'undefined') {
            console.log('not supported');
            return;
        }
        var t_oXhr = new window.XMLHttpRequest();
        // for IE8 and 9
		    if (typeof t_oXhr.withCredentials === 'undefined' &&
		        typeof window.XDomainRequest !== 'undefined') {
			      t_oXhr = new window.XDomainRequest();
		    }
        // set callback
        t_oXhr.onload = this._callback;
        // set url like this https://ntp-a1.nict.go.jp/cgi-bin/jsont?1603810552.778
        var t_sURL = this.getServerURL();
        t_oXhr.open("GET", t_sURL + "?" + ((new Date()).getTime() / 1000), this.isAsync);
        t_oXhr.send(null);
    }

    _callback(data) {
        if(!data.target.responseText) {
            return;
        }
        if(data.target.readyState != 4 || data.target.status != 200) {
            return;
        }
        // eval jsonp
        eval(data.target.responseText);
    }
    
    reload() {
        this.fetchData();
    }
    
    getDate() {
        if(!this.result) {
            return null;
        }
        return this.result.getDate();
    }
}
